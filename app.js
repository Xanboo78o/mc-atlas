import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import {
  SUPABASE_URL, SUPABASE_ANON_KEY, SERVER_NAME,
  KINDS, DIMENSIONS, MAP_LAYERS, BIOMES, SLIME_COLOR, BIOME_TAGS, QUESTIONS,
} from './config.js'

const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
const $ = id => document.getElementById(id)

/* ══════════════════════ state ══════════════════════ */

const store = {
  pins: [],
  borders: [],
  chunks: [],
  dimension: 'overworld',
  hidden: new Set(),          // pin kinds toggled off
  selected: null,             // pin currently open in the detail sheet
  editingPin: null,
  editingBorder: null,
  editingChunk: null,
  draft: null,                // border being drawn: array of [x, z]
  measure: [],                // measuring line: up to two [x, z] points
  mode: 'normal',             // normal | border | measure | chunk | time
  // history replay: when `at` is set, only things created before it are drawn
  time: { at: null, min: 0, max: 0, playing: false },
  owner: false,               // owner mode unlocked → secret pins visible
}

// world coords at the centre of the screen, and pixels-per-block
const view = { cx: 0, cz: 0, scale: 0.2 }
const MIN_SCALE = 0.006, MAX_SCALE = 4

const remember = {
  get author () { return localStorage.getItem('atlas.author') || '' },
  set author (v) { localStorage.setItem('atlas.author', v) },
  get key () { return localStorage.getItem('atlas.key') || '' },
  set key (v) { localStorage.setItem('atlas.key', v) },
  get ownerKey () { return localStorage.getItem('atlas.ownerKey') || '' },
  set ownerKey (v) { localStorage.setItem('atlas.ownerKey', v) },
}

const kindOf = k => KINDS.find(x => x.key === k) || KINDS[1]
const biomeOf = k => BIOMES.find(b => b.key === k)

/* ══════════════════════ dimension maths ══════════════════════

   One block in the nether is eight in the overworld. Everything that
   translates coordinates or distances between dimensions goes through here.  */

const NETHER_RATIO = 8
const toNether = n => Math.round(n / NETHER_RATIO)
const toOverworld = n => Math.round(n * NETHER_RATIO)

// The End has no such relationship, so it's treated as its own flat space.
const hasNetherTwin = dim => dim === 'overworld' || dim === 'nether'

/* ══════════════════════ coordinate parsing ══════════════════════

   Players paste whatever the game showed them. Bedrock renders
   "Position: 128.42, 71.00, -402.19", Java's F3 gives "XYZ: 128.4 / 71.0 / -402.1",
   and half the time someone just types "128 71 -402". Pull the numbers out and
   stop caring about the rest.                                                  */

function parseCoords (text) {
  const nums = (text || '').match(/-?\d+(?:\.\d+)?/g)
  if (!nums) return null
  const n = nums.map(Number).map(Math.round)
  if (n.length >= 3) return { x: n[0], y: n[1], z: n[2] }
  if (n.length === 2) return { x: n[0], y: null, z: n[1] }   // x/z only
  return null
}

/* ══════════════════════ canvas ══════════════════════ */

const cv = $('map')
const ctx = cv.getContext('2d')
let dpr = 1

function resize () {
  dpr = Math.min(window.devicePixelRatio || 1, 2)
  cv.width = Math.round(cv.clientWidth * dpr)
  cv.height = Math.round(cv.clientHeight * dpr)
  render()
}

const toScreen = (x, z) => ({
  sx: (x - view.cx) * view.scale + cv.clientWidth / 2,
  sy: (z - view.cz) * view.scale + cv.clientHeight / 2,
})

const toWorld = (sx, sy) => ({
  x: (sx - cv.clientWidth / 2) / view.scale + view.cx,
  z: (sy - cv.clientHeight / 2) / view.scale + view.cz,
})

const GRID_STEPS = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 16384]

function render () {
  const w = cv.clientWidth, h = cv.clientHeight
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, w, h)

  const bounds = {
    left:  view.cx - w / 2 / view.scale,
    right: view.cx + w / 2 / view.scale,
    top:   view.cz - h / 2 / view.scale,
    bot:   view.cz + h / 2 / view.scale,
  }

  drawLayers()
  drawChunks()
  drawGrid(bounds, w, h)
  drawChunkGrid(bounds, w, h)
  drawBorders()
  drawDraft()
  drawMeasure()
  drawPins()

  $('coordReadout').textContent = `${Math.round(view.cx)}, ${Math.round(view.cz)}`
}

/* Background images, if any have been configured. Empty until someone renders
   the world — the grid stands in fine until then. */
function drawLayers () {
  for (const layer of MAP_LAYERS) {
    if (layer.dimension !== store.dimension || !layer._img?.complete) continue
    const a = toScreen(layer.west, layer.north)
    const b = toScreen(layer.east, layer.south)
    ctx.drawImage(layer._img, a.sx, a.sy, b.sx - a.sx, b.sy - a.sy)
  }
}

function drawGrid (b, w, h) {
  const step = GRID_STEPS.find(s => s * view.scale >= 58) || GRID_STEPS.at(-1)

  ctx.lineWidth = 1
  ctx.font = '10px ui-monospace, SFMono-Regular, Menlo, monospace'
  ctx.fillStyle = '#495563'

  for (let x = Math.ceil(b.left / step) * step; x <= b.right; x += step) {
    const { sx } = toScreen(x, 0)
    ctx.strokeStyle = x === 0 ? '#3d4a5a' : '#1b222c'
    ctx.beginPath(); ctx.moveTo(sx + .5, 0); ctx.lineTo(sx + .5, h); ctx.stroke()
    ctx.fillText(x, sx + 4, h - 6)
  }

  for (let z = Math.ceil(b.top / step) * step; z <= b.bot; z += step) {
    const { sy } = toScreen(0, z)
    ctx.strokeStyle = z === 0 ? '#3d4a5a' : '#1b222c'
    ctx.beginPath(); ctx.moveTo(0, sy + .5); ctx.lineTo(w, sy + .5); ctx.stroke()
    // keep clear of the header, which floats over the canvas
    if (sy > 104) ctx.fillText(z, 5, sy - 4)
  }

  // spawn
  const o = toScreen(0, 0)
  ctx.strokeStyle = '#4b5a6d'
  ctx.beginPath(); ctx.arc(o.sx, o.sy, 5, 0, Math.PI * 2); ctx.stroke()
}

/* ── chunks ──
   A chunk is 16×16 blocks. Its colour is the first biome tagged on it; slime
   chunks get a hatch on top so the two facts stay independently readable. */

const CHUNK = 16

function drawChunks () {
  const size = CHUNK * view.scale
  if (size < 2) return                       // too small to mean anything

  for (const c of store.chunks) {
    if (c.dimension !== store.dimension || !bornYet(c)) continue
    const { sx, sy } = toScreen(c.cx * CHUNK, c.cz * CHUNK)
    if (sx < -size || sy < -size || sx > cv.clientWidth || sy > cv.clientHeight) continue

    const biome = biomeOf(c.biomes?.[0])
    if (biome) {
      ctx.fillStyle = biome.color + (c.biomes.length > 1 ? '66' : '88')
      ctx.fillRect(sx, sy, size, size)
    }

    if (c.slime) {
      ctx.save()
      ctx.beginPath(); ctx.rect(sx, sy, size, size); ctx.clip()
      ctx.strokeStyle = SLIME_COLOR + 'cc'
      ctx.lineWidth = Math.max(1, size / 14)
      const gap = Math.max(4, size / 4)
      for (let d = -size; d < size * 2; d += gap) {
        ctx.beginPath()
        ctx.moveTo(sx + d, sy)
        ctx.lineTo(sx + d - size, sy + size)
        ctx.stroke()
      }
      ctx.restore()
      ctx.strokeStyle = SLIME_COLOR
      ctx.lineWidth = 1
      ctx.strokeRect(sx + .5, sy + .5, size - 1, size - 1)
    }
  }
}

// Only drawn while tagging, so the normal map never looks like graph paper.
function drawChunkGrid (b, w, h) {
  if (store.mode !== 'chunk') return
  const size = CHUNK * view.scale
  if (size < 6) return

  ctx.strokeStyle = '#2f3b48'
  ctx.lineWidth = 1
  for (let x = Math.ceil(b.left / CHUNK) * CHUNK; x <= b.right; x += CHUNK) {
    const { sx } = toScreen(x, 0)
    ctx.beginPath(); ctx.moveTo(sx + .5, 0); ctx.lineTo(sx + .5, h); ctx.stroke()
  }
  for (let z = Math.ceil(b.top / CHUNK) * CHUNK; z <= b.bot; z += CHUNK) {
    const { sy } = toScreen(0, z)
    ctx.beginPath(); ctx.moveTo(0, sy + .5); ctx.lineTo(w, sy + .5); ctx.stroke()
  }
}

/* ── measuring line ── */

function drawMeasure () {
  const pts = store.measure
  if (!pts.length) return

  if (pts.length === 2) {
    const a = toScreen(pts[0][0], pts[0][1])
    const b = toScreen(pts[1][0], pts[1][1])
    ctx.strokeStyle = '#fbbf24'
    ctx.lineWidth = 2
    ctx.setLineDash([7, 5])
    ctx.beginPath(); ctx.moveTo(a.sx, a.sy); ctx.lineTo(b.sx, b.sy); ctx.stroke()
    ctx.setLineDash([])
  }

  pts.forEach(([x, z], i) => {
    const { sx, sy } = toScreen(x, z)
    ctx.fillStyle = '#fbbf24'
    ctx.beginPath(); ctx.arc(sx, sy, 6, 0, Math.PI * 2); ctx.fill()
    ctx.strokeStyle = '#0d1117'; ctx.lineWidth = 2; ctx.stroke()
    ctx.fillStyle = '#0d1117'
    ctx.font = '700 10px ui-sans-serif, system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(i ? 'B' : 'A', sx, sy + 3.5)
    ctx.textAlign = 'left'
  })
}

function polyPath (points) {
  ctx.beginPath()
  points.forEach(([x, z], i) => {
    const { sx, sy } = toScreen(x, z)
    i ? ctx.lineTo(sx, sy) : ctx.moveTo(sx, sy)
  })
  ctx.closePath()
}

function drawBorders () {
  for (const b of store.borders) {
    if (b.dimension !== store.dimension || !bornYet(b)) continue
    const pts = b.points
    if (!Array.isArray(pts) || pts.length < 3) continue

    polyPath(pts)
    ctx.fillStyle = b.color + '22'
    ctx.fill()
    ctx.strokeStyle = b.color
    ctx.lineWidth = 2
    ctx.stroke()

    const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length
    const cz = pts.reduce((s, p) => s + p[1], 0) / pts.length
    const { sx, sy } = toScreen(cx, cz)
    ctx.fillStyle = b.color
    ctx.font = '600 12px ui-sans-serif, system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(b.name.toUpperCase(), sx, sy)
    ctx.textAlign = 'left'
  }
}

function drawDraft () {
  if (!store.draft) return
  const pts = store.draft
  if (pts.length > 1) {
    polyPath(pts)
    ctx.fillStyle = '#7dd3fc1a'; ctx.fill()
    ctx.strokeStyle = '#7dd3fc'; ctx.lineWidth = 2
    ctx.setLineDash([6, 5]); ctx.stroke(); ctx.setLineDash([])
  }
  for (const [x, z] of pts) {
    const { sx, sy } = toScreen(x, z)
    ctx.fillStyle = '#7dd3fc'
    ctx.beginPath(); ctx.arc(sx, sy, 5, 0, Math.PI * 2); ctx.fill()
  }
}

// During a replay, anything created after the playhead simply does not exist yet.
const bornYet = e => store.time.at === null || Date.parse(e.created_at) <= store.time.at

function visiblePins () {
  return store.pins.filter(p =>
    p.dimension === store.dimension && !store.hidden.has(p.kind) && bornYet(p))
}

function drawPins () {
  const showLabels = view.scale >= 0.025
  ctx.textAlign = 'center'

  for (const p of visiblePins()) {
    const { sx, sy } = toScreen(p.x, p.z)
    if (sx < -80 || sy < -80 || sx > cv.clientWidth + 80 || sy > cv.clientHeight + 80) continue

    const k = kindOf(p.kind)
    const on = store.selected?.id === p.id

    ctx.beginPath(); ctx.arc(sx, sy, on ? 8 : 6, 0, Math.PI * 2)
    ctx.fillStyle = k.color; ctx.fill()
    ctx.lineWidth = 2; ctx.strokeStyle = '#0d1117'; ctx.stroke()

    // secret pins wear a dashed halo so they're never confused with public ones
    if (p.secret) {
      ctx.beginPath(); ctx.arc(sx, sy, 11, 0, Math.PI * 2)
      ctx.strokeStyle = k.color; ctx.lineWidth = 1.5
      ctx.setLineDash([3, 3]); ctx.stroke(); ctx.setLineDash([])
    }

    if (on) {
      ctx.beginPath(); ctx.arc(sx, sy, 14, 0, Math.PI * 2)
      ctx.strokeStyle = k.color; ctx.lineWidth = 1.5; ctx.stroke()
    }

    if (showLabels || on) {
      ctx.font = '12px ui-sans-serif, system-ui, sans-serif'
      ctx.lineWidth = 3; ctx.strokeStyle = '#0d1117'
      ctx.strokeText(p.title, sx, sy - 13)
      ctx.fillStyle = '#e6edf3'
      ctx.fillText(p.title, sx, sy - 13)
    }
  }
  ctx.textAlign = 'left'
}

/* ══════════════════════ hit testing ══════════════════════ */

function pinAt (sx, sy) {
  let best = null, bestD = 22
  for (const p of visiblePins()) {
    const s = toScreen(p.x, p.z)
    const d = Math.hypot(s.sx - sx, s.sy - sy)
    if (d < bestD) { bestD = d; best = p }
  }
  return best
}

function borderAt (sx, sy) {
  const { x, z } = toWorld(sx, sy)
  for (const b of store.borders) {
    if (b.dimension !== store.dimension || !bornYet(b)) continue
    if (Array.isArray(b.points) && b.points.length >= 3 && inPolygon(x, z, b.points)) return b
  }
  return null
}

function inPolygon (x, z, pts) {
  let inside = false
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, zi] = pts[i], [xj, zj] = pts[j]
    if ((zi > z) !== (zj > z) && x < (xj - xi) * (z - zi) / (zj - zi) + xi) inside = !inside
  }
  return inside
}

/* ══════════════════════ pan / zoom / tap ══════════════════════ */

const pointers = new Map()
let panned = false, pinchDist = 0

cv.addEventListener('pointerdown', e => {
  cv.setPointerCapture(e.pointerId)
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
  panned = false
  if (pointers.size === 2) pinchDist = spread()
  cv.classList.add('dragging')
})

cv.addEventListener('pointermove', e => {
  const prev = pointers.get(e.pointerId)
  if (!prev) return
  const dx = e.clientX - prev.x, dy = e.clientY - prev.y
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
  if (Math.hypot(dx, dy) > 2) panned = true

  if (pointers.size === 2) {
    const d = spread()
    if (pinchDist > 0) zoomAt(d / pinchDist, ...midpoint())
    pinchDist = d
  } else {
    view.cx -= dx / view.scale
    view.cz -= dy / view.scale
  }
  render()
})

function endPointer (e) {
  const had = pointers.size
  pointers.delete(e.pointerId)
  if (pointers.size < 2) pinchDist = 0
  cv.classList.remove('dragging')
  if (had === 1 && !panned) tap(e)
  if (!pointers.size) saveView()
}
cv.addEventListener('pointerup', endPointer)
cv.addEventListener('pointercancel', endPointer)

const spread = () => {
  const [a, b] = [...pointers.values()]
  return Math.hypot(a.x - b.x, a.y - b.y)
}
const midpoint = () => {
  const [a, b] = [...pointers.values()]
  const r = cv.getBoundingClientRect()
  return [(a.x + b.x) / 2 - r.left, (a.y + b.y) / 2 - r.top]
}

function zoomAt (factor, sx, sy) {
  const before = toWorld(sx, sy)
  view.scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, view.scale * factor))
  const after = toWorld(sx, sy)
  view.cx += before.x - after.x
  view.cz += before.z - after.z
}

cv.addEventListener('wheel', e => {
  e.preventDefault()
  const r = cv.getBoundingClientRect()
  zoomAt(Math.exp(-e.deltaY * 0.0015), e.clientX - r.left, e.clientY - r.top)
  render(); saveView()
}, { passive: false })

function tap (e) {
  const r = cv.getBoundingClientRect()
  const sx = e.clientX - r.left, sy = e.clientY - r.top

  if (store.mode === 'border' && store.draft) {
    const { x, z } = toWorld(sx, sy)
    store.draft.push([Math.round(x), Math.round(z)])
    $('drawInfo').textContent = `${store.draft.length} corner${store.draft.length === 1 ? '' : 's'} placed.`
    $('drawDone').disabled = store.draft.length < 3
    return render()
  }

  if (store.mode === 'measure') {
    const { x, z } = toWorld(sx, sy)
    if (store.measure.length >= 2) store.measure = []
    store.measure.push([Math.round(x), Math.round(z)])
    showMeasure()
    return render()
  }

  if (store.mode === 'chunk') {
    const { x, z } = toWorld(sx, sy)
    return openChunk(Math.floor(x / CHUNK), Math.floor(z / CHUNK))
  }

  const pin = pinAt(sx, sy)
  if (pin) return openPin(pin)

  const border = borderAt(sx, sy)
  if (border) return openBorder(border)

  closeSheets()
}

let viewTimer
function saveView () {
  clearTimeout(viewTimer)
  viewTimer = setTimeout(() => {
    localStorage.setItem('atlas.view', JSON.stringify({ ...view, d: store.dimension }))
  }, 400)
}

function flyTo (x, z, scale) {
  view.cx = x; view.cz = z
  if (scale) view.scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale))
  render(); saveView()
}

/* ══════════════════════ sheets ══════════════════════ */

// Every sheet must be listed here — openSheet only reveals ids it knows about.
const SHEETS = ['detail', 'editor', 'bEditor', 'cEditor', 'helper', 'keyPad', 'searchPane']

function openSheet (id) {
  SHEETS.forEach(s => $(s).classList.toggle('hidden', s !== id))
  $('scrim').classList.remove('hidden')
}

function closeSheets () {
  SHEETS.forEach(s => $(s).classList.add('hidden'))
  $('scrim').classList.add('hidden')
  store.selected = null
  render()
}

$('scrim').onclick = closeSheets

let toastTimer
function toast (msg) {
  const t = $('toast')
  t.textContent = msg
  t.classList.remove('hidden')
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => t.classList.add('hidden'), 2200)
}

/* ══════════════════════ write access ══════════════════════ */

let keyResolve = null
let ownerPrompt = false

/* Returns the server key, prompting for it the first time and remembering it
   after. Resolves to null if the person backs out. */
function requireKey () {
  if (remember.key) return Promise.resolve(remember.key)
  ownerPrompt = false
  openSheet('keyPad')
  $('kHeading').textContent = 'Server key'
  $('kBlurb').textContent = 'Anyone can read the atlas. Only the server can write to it. ' +
    "Ask whoever runs it for the key — you'll only type this once."
  $('kInput').value = ''
  $('kErr').classList.add('hidden')
  setTimeout(() => $('kInput').focus(), 80)
  return new Promise(res => { keyResolve = res })
}

$('kGo').onclick = async () => {
  const pass = $('kInput').value.trim()
  if (!pass) return
  $('kGo').disabled = true

  if (ownerPrompt) {
    const ok = await unlockOwner(pass)
    $('kGo').disabled = false
    if (!ok) { $('kErr').textContent = "That isn't the owner key."; $('kErr').classList.remove('hidden'); return }
    ownerPrompt = false
    return closeSheets()
  }

  const { data, error } = await sb.rpc('atlas_verify', { pass })
  $('kGo').disabled = false

  if (error || !data) {
    $('kErr').textContent = "That key isn't right."
    $('kErr').classList.remove('hidden')
    return
  }
  remember.key = pass
  closeSheets()
  keyResolve?.(pass); keyResolve = null
}

$('kInput').addEventListener('keydown', e => { if (e.key === 'Enter') $('kGo').click() })
$('kCancel').onclick = () => {
  ownerPrompt = false
  closeSheets()
  keyResolve?.(null); keyResolve = null
}

/* ══════════════════════ pin detail ══════════════════════ */

function openPin (p) {
  store.selected = p
  const k = kindOf(p.kind)

  $('dGlyph').textContent = k.glyph
  $('dGlyph').style.color = k.color
  $('dTitle').innerHTML = escapeHtml(p.title) +
    (p.secret ? '<span class="secret-tag">secret</span>' : '')
  $('dMeta').textContent = `${k.label} · added by ${p.author} · ${when(p.created_at)}`
  $('dCoords').textContent = p.y == null ? `${p.x}  ${p.z}` : `${p.x}  ${p.y}  ${p.z}`
  $('dBody').textContent = p.body || ''

  // Overworld coords have a nether counterpart worth knowing.
  const nether = $('dNether')
  if (p.dimension === 'overworld') {
    nether.textContent = `nether portal ≈ ${Math.round(p.x / 8)}  ${Math.round(p.z / 8)}`
    nether.classList.remove('hidden')
  } else {
    nether.classList.add('hidden')
  }

  openSheet('detail')
  render()
}

$('dCoords').onclick = () => {
  const p = store.selected
  if (!p) return
  const text = p.y == null ? `${p.x} ${p.z}` : `${p.x} ${p.y} ${p.z}`
  navigator.clipboard?.writeText(text)
  toast('Coordinates copied')
}

$('dEdit').onclick = () => store.selected && openEditor(store.selected)

$('dDelete').onclick = async () => {
  const p = store.selected
  if (!p || !confirm(`Delete "${p.title}"? This can't be undone.`)) return
  const pass = p.secret ? remember.ownerKey : await requireKey()
  if (!pass) return

  const { error } = await sb.rpc('atlas_delete_pin', { pass, p_id: p.id })
  if (error) return toast(errText(error))
  store.pins = store.pins.filter(x => x.id !== p.id)
  closeSheets()
  toast('Pin deleted')
}

const when = iso => {
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

const errText = e =>
  /bad key|42501/i.test(e.message || '') ? 'Wrong server key' : (e.message || 'Something went wrong')

/* ══════════════════════ pin editor ══════════════════════ */

function openEditor (pin = null) {
  store.editingPin = pin
  $('eHeading').textContent = pin ? 'Edit pin' : 'New pin'
  $('eTitle').value = pin?.title || ''
  $('eBody').value = pin?.body || ''
  $('eAuthor').value = pin?.author || remember.author
  $('eCoords').value = pin
    ? (pin.y == null ? `${pin.x} ${pin.z}` : `${pin.x} ${pin.y} ${pin.z}`)
    : ''
  $('eMore').open = !!pin?.body
  $('eSecret').checked = !!pin?.secret
  $('eSecretRow').classList.toggle('hidden', !store.owner)
  pickKind(pin?.kind || 'base')

  openSheet('editor')
  if (!pin) setTimeout(() => $('eCoords').focus(), 80)
}

let chosenKind = 'base'
function pickKind (k) {
  chosenKind = k
  ;[...$('eKinds').children].forEach(b => b.classList.toggle('on', b.dataset.kind === k))
}

$('eKinds').innerHTML = KINDS.map(k =>
  `<button type="button" data-kind="${k.key}" style="color:${k.color}">${k.glyph} ${k.label}</button>`
).join('')
$('eKinds').onclick = e => { const b = e.target.closest('button'); if (b) pickKind(b.dataset.kind) }

$('eCoords').addEventListener('input', () => {
  const c = parseCoords($('eCoords').value)
  const hint = $('eCoordsHint')
  if (!$('eCoords').value.trim()) {
    hint.textContent = 'Straight from the game. Any format works.'
    hint.classList.remove('err')
  } else if (c) {
    hint.textContent = c.y == null
      ? `x ${c.x}, z ${c.z} — no height, that's fine`
      : `x ${c.x}, y ${c.y}, z ${c.z}`
    hint.classList.remove('err')
  } else {
    hint.textContent = "Couldn't find numbers in that."
    hint.classList.add('err')
  }
})

$('eCancel').onclick = closeSheets

$('eSave').onclick = async () => {
  const coords = parseCoords($('eCoords').value)
  const title = $('eTitle').value.trim()
  const author = $('eAuthor').value.trim()

  if (!coords) return toast('Need coordinates')
  if (!title) return toast('Give it a name')
  if (!author) return toast('Put your name in')

  const secret = store.owner && $('eSecret').checked
  // Anything secret — becoming secret, or already secret — needs the owner key.
  const needsOwner = secret || store.editingPin?.secret
  const pass = needsOwner ? remember.ownerKey : await requireKey()
  if (!pass) return

  remember.author = author
  $('eSave').disabled = true

  const { data, error } = await sb.rpc('atlas_save_pin', {
    pass,
    p_id: store.editingPin?.id ?? null,
    p_title: title,
    p_x: coords.x, p_y: coords.y, p_z: coords.z,
    p_dimension: store.editingPin?.dimension || store.dimension,
    p_kind: chosenKind,
    p_author: author,
    p_body: $('eBody').value.trim(),
    p_secret: secret,
  })
  $('eSave').disabled = false
  if (error) return toast(errText(error))

  await load()
  closeSheets()
  const saved = store.pins.find(p => p.id === data)
  if (saved) {
    if (saved.dimension !== store.dimension) setDimension(saved.dimension)
    flyTo(saved.x, saved.z, Math.max(view.scale, 0.35))
  }
  toast(store.editingPin ? 'Pin updated' : 'Pin added')
}

$('addBtn').onclick = () => openEditor(null)

/* ══════════════════════ borders ══════════════════════ */

const BORDER_COLORS = ['#7dd3fc', '#a3e635', '#fbbf24', '#f472b6', '#c084fc', '#f87171', '#34d399']
let chosenColor = BORDER_COLORS[0]

$('bColors').innerHTML = BORDER_COLORS.map(c =>
  `<button type="button" data-c="${c}" style="background:${c}"></button>`
).join('')
$('bColors').onclick = e => {
  const b = e.target.closest('button'); if (!b) return
  chosenColor = b.dataset.c
  ;[...$('bColors').children].forEach(x => x.classList.toggle('on', x.dataset.c === chosenColor))
}
$('bColors').firstElementChild.classList.add('on')

/* ══════════════════════ map modes ══════════════════════ */

function setMode (mode) {
  store.mode = mode
  store.draft = mode === 'border' ? [] : null
  if (mode !== 'measure') store.measure = []
  if (mode === 'border') store.editingBorder = null

  $('borderBtn').classList.toggle('on', mode === 'border')
  $('timeBtn').classList.toggle('on', mode === 'time')
  $('measureBtn').classList.toggle('on', mode === 'measure')
  $('chunkBtn').classList.toggle('on', mode === 'chunk')

  $('drawBar').classList.toggle('hidden', mode !== 'border')
  $('timeBar').classList.toggle('hidden', mode !== 'time')
  $('measureBar').classList.toggle('hidden', mode !== 'measure')
  $('chunkBar').classList.toggle('hidden', mode !== 'chunk')

  cv.classList.toggle('drawing', mode !== 'normal')
  // the mode bar occupies the same corner as the button stack
  $('fabs').classList.toggle('stowed', mode !== 'normal')

  if (mode === 'border') {
    $('drawInfo').textContent = 'Tap the map to place corners — 3 or more.'
    $('drawDone').disabled = true
  }
  if (mode === 'measure') showMeasure()
  if (mode === 'time') startTimeline(); else stopTimeline()
  render()
}

const stopDrawing = () => setMode('normal')
const toggleMode = m => setMode(store.mode === m ? 'normal' : m)

$('borderBtn').onclick = () => { closeSheets(); toggleMode('border') }
$('timeBtn').onclick = () => { closeSheets(); toggleMode('time') }
$('measureBtn').onclick = () => { closeSheets(); toggleMode('measure') }
$('chunkBtn').onclick = () => { closeSheets(); toggleMode('chunk') }
$('measureDone').onclick = stopDrawing
$('chunkDone').onclick = stopDrawing
$('measureUndo').onclick = () => { store.measure.pop(); showMeasure(); render() }

$('drawCancel').onclick = stopDrawing
$('drawUndo').onclick = () => {
  if (!store.draft?.length) return
  store.draft.pop()
  $('drawInfo').textContent = `${store.draft.length} corner${store.draft.length === 1 ? '' : 's'} placed.`
  $('drawDone').disabled = store.draft.length < 3
  render()
}

$('drawDone').onclick = () => {
  if (!store.draft || store.draft.length < 3) return
  $('bHeading').textContent = 'New border'
  $('bName').value = ''
  $('bOwner').value = ''
  $('bBody').value = ''
  $('bAuthor').value = remember.author
  $('bDelete').classList.add('hidden')
  openSheet('bEditor')
}

function openBorder (b) {
  store.editingBorder = b
  store.draft = null
  chosenColor = b.color
  ;[...$('bColors').children].forEach(x => x.classList.toggle('on', x.dataset.c === b.color))
  $('bHeading').textContent = b.name
  $('bName').value = b.name
  $('bOwner').value = b.owner
  $('bBody').value = b.body || ''
  $('bAuthor').value = b.author || remember.author
  $('bDelete').classList.remove('hidden')
  openSheet('bEditor')
}

$('bCancel').onclick = () => { stopDrawing(); closeSheets() }

$('bSave').onclick = async () => {
  const name = $('bName').value.trim()
  const owner = $('bOwner').value.trim()
  const author = $('bAuthor').value.trim()
  if (!name) return toast('Name the territory')
  if (!owner) return toast('Who claims it?')
  if (!author) return toast('Put your name in')

  const pass = await requireKey(); if (!pass) return
  remember.author = author
  $('bSave').disabled = true

  const { error } = await sb.rpc('atlas_save_border', {
    pass,
    b_id: store.editingBorder?.id ?? null,
    b_name: name,
    b_owner: owner,
    b_color: chosenColor,
    b_dimension: store.editingBorder?.dimension || store.dimension,
    b_points: store.editingBorder ? store.editingBorder.points : store.draft,
    b_author: author,
    b_body: $('bBody').value.trim(),
  })
  $('bSave').disabled = false
  if (error) return toast(errText(error))

  stopDrawing()
  await load()
  closeSheets()
  toast('Border saved')
}

$('bDelete').onclick = async () => {
  const b = store.editingBorder
  if (!b || !confirm(`Delete the border "${b.name}"?`)) return
  const pass = await requireKey(); if (!pass) return
  const { error } = await sb.rpc('atlas_delete_border', { pass, b_id: b.id })
  if (error) return toast(errText(error))
  store.borders = store.borders.filter(x => x.id !== b.id)
  closeSheets()
  toast('Border deleted')
}

/* ══════════════════════ history replay ══════════════════════

   Everything on the atlas is stamped with when it was added, so the map can
   simply be replayed: drag the playhead and the server rebuilds itself in the
   order it was actually built. Day 1 is whatever went in first.              */

const DAY = 86400000
let timeRAF = null

function startTimeline () {
  const all = [...store.pins, ...store.borders, ...store.chunks]
  if (!all.length) {
    $('timeDay').textContent = 'Nothing pinned yet'
    $('timeDate').textContent = 'Add something and the replay fills in'
    $('timeCount').textContent = '0'
    store.time.at = null
    return
  }
  const stamps = all.map(e => Date.parse(e.created_at)).filter(n => !isNaN(n))
  store.time.min = Math.min(...stamps)
  // always run to "now" so the last thing added isn't sitting on the end stop
  store.time.max = Math.max(Math.max(...stamps), Date.now())
  store.time.at = store.time.max
  $('timeSlider').value = 1000
  drawTimeline()
}

function stopTimeline () {
  pauseTimeline()
  if (store.time.at !== null) { store.time.at = null; render() }
}

function timeAtFraction (f) {
  const { min, max } = store.time
  store.time.at = min + (max - min) * f
  drawTimeline()
}

function drawTimeline () {
  const { at, min } = store.time
  if (at === null) return render()
  const day = Math.floor((at - min) / DAY) + 1
  const shown = [...store.pins, ...store.borders, ...store.chunks].filter(bornYet).length
  $('timeDay').textContent = `Day ${day}`
  $('timeDate').textContent = new Date(at).toLocaleString(undefined,
    { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  $('timeCount').textContent = shown
  render()
}

function playTimeline () {
  store.time.playing = true
  $('timePlay').textContent = '❚❚'
  const started = performance.now()
  const from = (store.time.at - store.time.min) / (store.time.max - store.time.min)
  // if the playhead is already at the end, a replay starts over from the top
  const begin = from >= 0.999 ? 0 : from
  const RUN = 12000 * (1 - begin)

  const step = now => {
    const f = Math.min(1, begin + (now - started) / RUN)
    $('timeSlider').value = Math.round(f * 1000)
    timeAtFraction(f)
    if (f < 1 && store.time.playing) timeRAF = requestAnimationFrame(step)
    else pauseTimeline()
  }
  timeRAF = requestAnimationFrame(step)
}

function pauseTimeline () {
  store.time.playing = false
  $('timePlay').textContent = '▶'
  if (timeRAF) { cancelAnimationFrame(timeRAF); timeRAF = null }
}

$('timePlay').onclick = () => store.time.playing ? pauseTimeline() : playTimeline()
$('timeDone').onclick = stopDrawing
$('timeSlider').addEventListener('input', e => {
  pauseTimeline()
  timeAtFraction(e.target.value / 1000)
})

/* ══════════════════════ the measuring line ══════════════════════

   Plot a line in either dimension and read both ends in both dimensions at
   once. Eight overworld blocks is one nether block, which is the whole reason
   this tool needs to exist: a short walk in the nether is a very long one up
   top, and nobody wants to do that division in their head mid-game.          */

const pair = (a, b) => `${a}  ${b}`

function showMeasure () {
  const pts = store.measure
  const out = $('measureOut'), hint = $('measureHint')

  if (pts.length < 2) {
    hint.textContent = pts.length ? 'Now tap point B.' : 'Tap two points on the map.'
    hint.classList.remove('hidden')
    out.classList.add('hidden')
    return
  }
  hint.classList.add('hidden')
  out.classList.remove('hidden')

  const [a, b] = pts
  const dist = Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]))
  const here = store.dimension

  // Column A is always where you drew the line. Column B is its twin.
  let headA, headB, conv
  if (here === 'nether') {
    headA = 'Nether'; headB = 'Overworld'; conv = toOverworld
  } else if (here === 'overworld') {
    headA = 'Overworld'; headB = 'Nether'; conv = toNether
  } else {
    headA = 'The End'; headB = '—'; conv = null
  }

  $('mHeadA').textContent = headA
  $('mHeadB').textContent = headB
  $('mStartA').textContent = pair(a[0], a[1])
  $('mEndA').textContent = pair(b[0], b[1])
  $('mDistA').textContent = `${dist} blocks`

  if (conv) {
    $('mStartB').textContent = pair(conv(a[0]), conv(a[1]))
    $('mEndB').textContent = pair(conv(b[0]), conv(b[1]))
    $('mDistB').textContent = `${conv(dist)} blocks`
  } else {
    // The End has no paired coordinate space.
    $('mStartB').textContent = $('mEndB').textContent = $('mDistB').textContent = '—'
  }
}

/* ══════════════════════ chunks ══════════════════════ */

let chunkBiomes = new Set()

function openChunk (cx, cz, dim = store.dimension) {
  const existing = store.chunks.find(c => c.cx === cx && c.cz === cz && c.dimension === dim)
  store.editingChunk = { cx, cz, dimension: dim, existing }

  chunkBiomes = new Set(existing?.biomes || [])
  $('cHeading').textContent = `Chunk ${cx}, ${cz}`
  $('cRange').textContent =
    `blocks ${cx * CHUNK} to ${cx * CHUNK + 15} × ${cz * CHUNK} to ${cz * CHUNK + 15}`
  $('cSlime').checked = !!existing?.slime
  $('cNote').value = existing?.note || ''
  $('cAuthor').value = existing?.author || remember.author
  $('cDelete').classList.toggle('hidden', !existing)
  $('cBiomeSearch').value = ''
  renderBiomes()

  openSheet('cEditor')
}

function renderBiomes () {
  const q = $('cBiomeSearch').value.trim().toLowerCase()
  const hits = BIOMES.filter(b => !q || b.label.toLowerCase().includes(q) || b.key.includes(q))

  if (!hits.length) {
    $('cBiomeList').innerHTML = '<div class="none">No biome by that name.</div>'
    return
  }

  let html = '', group = null
  for (const b of hits) {
    if (b.group !== group) { group = b.group; html += `<div class="group">${group}</div>` }
    html += `<button type="button" data-b="${b.key}" class="${chunkBiomes.has(b.key) ? 'on' : ''}">
      <span class="swatch" style="background:${b.color}"></span>${b.label}
    </button>`
  }
  $('cBiomeList').innerHTML = html
}

$('cBiomeSearch').addEventListener('input', renderBiomes)
$('cBiomeList').onclick = e => {
  const b = e.target.closest('button'); if (!b) return
  const k = b.dataset.b
  chunkBiomes.has(k) ? chunkBiomes.delete(k) : chunkBiomes.add(k)
  b.classList.toggle('on', chunkBiomes.has(k))
}

$('cCancel').onclick = () => { closeSheets(); if (store.mode === 'chunk') render() }

$('cSave').onclick = async () => {
  const c = store.editingChunk
  const author = $('cAuthor').value.trim()
  if (!c) return
  if (!author) return toast('Put your name in')
  if (!chunkBiomes.size && !$('cSlime').checked && !$('cNote').value.trim())
    return toast('Pick a biome, or mark it as slime')

  const pass = await requireKey(); if (!pass) return
  remember.author = author
  $('cSave').disabled = true

  const { error } = await sb.rpc('atlas_save_chunk', {
    pass,
    c_cx: c.cx, c_cz: c.cz, c_dimension: c.dimension,
    c_biomes: [...chunkBiomes],
    c_slime: $('cSlime').checked,
    c_note: $('cNote').value.trim(),
    c_author: author,
  })
  $('cSave').disabled = false
  if (error) return toast(errText(error))

  await load()
  closeSheets()
  toast('Chunk saved')
}

$('cDelete').onclick = async () => {
  const c = store.editingChunk
  if (!c?.existing) return
  const pass = await requireKey(); if (!pass) return
  const { error } = await sb.rpc('atlas_delete_chunk', {
    pass, c_cx: c.cx, c_cz: c.cz, c_dimension: c.dimension,
  })
  if (error) return toast(errText(error))
  store.chunks = store.chunks.filter(x => x.id !== c.existing.id)
  closeSheets()
  toast('Chunk cleared')
}

/* ══════════════════════ the biome helper ══════════════════════

   Twenty questions for biomes. It holds a set of candidates and, each turn,
   asks whichever question splits that set closest to in half — so the answer
   you give is worth the most it possibly can be. Roughly seven questions gets
   you from ninety-odd biomes down to one.                                     */

const tagsOf = key => BIOME_TAGS[key] || []

const helper = { candidates: [], asked: new Set() }

function openHelper () {
  // A chunk's dimension already rules most of the list out, so start there
  // rather than asking "are you in the Nether?" about an overworld chunk.
  const dim = store.editingChunk?.dimension || store.dimension
  const groups = dim === 'nether' ? ['Nether']
               : dim === 'end'    ? ['The End']
               : ['Overworld', 'Legacy']

  helper.candidates = BIOMES.filter(b => groups.includes(b.group))
  helper.asked = new Set()
  openSheet('helper')
  stepHelper()
}

/* The question whose yes/no split is closest to even. */
function nextQuestion () {
  const n = helper.candidates.length
  let best = null, bestGap = Infinity

  for (const q of QUESTIONS) {
    if (helper.asked.has(q.tag)) continue
    const yes = helper.candidates.filter(b => tagsOf(b.key).includes(q.tag)).length
    if (yes === 0 || yes === n) continue        // tells us nothing
    const gap = Math.abs(yes - n / 2)
    if (gap < bestGap) { bestGap = gap; best = q }
  }
  return best
}

function stepHelper () {
  const n = helper.candidates.length
  const q = n > 1 ? nextQuestion() : null

  $('hCount').textContent = n === 1
    ? 'Just one left.'
    : `${n} biome${n === 1 ? '' : 's'} still possible`

  // Out of useful questions, or narrow enough to just eyeball it.
  if (!q || n <= 8) {
    $('hAsk').classList.add('hidden')
    $('hNarrowed').classList.remove('hidden')
    $('hLead').textContent = n
      ? (n === 1 ? 'That should be it.' : 'Tap the one that matches.')
      : "Nothing matches all that — start over, or use the search box instead."
    $('hResults').innerHTML = helper.candidates.map(b =>
      `<button type="button" data-b="${b.key}">
         <span class="swatch" style="background:${b.color}"></span>${b.label}
       </button>`).join('')
    return
  }

  $('hAsk').classList.remove('hidden')
  $('hNarrowed').classList.add('hidden')
  $('hQuestion').textContent = q.text
  $('hQuestion').dataset.tag = q.tag
}

function answerHelper (yes) {
  const tag = $('hQuestion').dataset.tag
  if (!tag) return
  helper.asked.add(tag)
  if (yes !== null) {
    helper.candidates = helper.candidates.filter(b => tagsOf(b.key).includes(tag) === yes)
  }
  stepHelper()
}

$('hYes').onclick = () => answerHelper(true)
$('hNo').onclick = () => answerHelper(false)
$('hSkip').onclick = () => answerHelper(null)
$('hRestart').onclick = openHelper
$('hClose').onclick = () => openSheet('cEditor')
$('cIdentify').onclick = openHelper

$('hResults').onclick = e => {
  const b = e.target.closest('button'); if (!b) return
  chunkBiomes.add(b.dataset.b)
  openSheet('cEditor')
  $('cBiomeSearch').value = ''
  renderBiomes()
  toast(`Added ${biomeOf(b.dataset.b)?.label || b.dataset.b}`)
}

/* ══════════════════════ hover details ══════════════════════ */

const tip = $('hoverTip')

cv.addEventListener('pointermove', e => {
  if (e.pointerType !== 'mouse' || pointers.size) return hideTip()

  const r = cv.getBoundingClientRect()
  const { x, z } = toWorld(e.clientX - r.left, e.clientY - r.top)
  const cx = Math.floor(x / CHUNK), cz = Math.floor(z / CHUNK)
  const c = store.chunks.find(k =>
    k.cx === cx && k.cz === cz && k.dimension === store.dimension)

  // Untagged chunks are only worth a tooltip while you're actively tagging.
  if (!c && store.mode !== 'chunk') return hideTip()

  const biomes = (c?.biomes || []).map(k => {
    const b = biomeOf(k)
    return b
      ? `<div class="tip-biome"><i style="background:${b.color}"></i>${escapeHtml(b.label)}</div>`
      : ''
  }).join('')

  tip.innerHTML =
    `<div class="tip-head">chunk ${cx}, ${cz} · blocks ${cx * CHUNK} ${cz * CHUNK}</div>` +
    (biomes || '<div class="muted">Not tagged yet</div>') +
    (c?.slime ? '<div class="tip-slime">◆ Slime chunk</div>' : '') +
    (c?.note ? `<div class="tip-note">${escapeHtml(c.note)}</div>` : '')

  tip.classList.remove('hidden')
  // keep it on screen near the right and bottom edges
  const tw = tip.offsetWidth, th = tip.offsetHeight
  tip.style.left = Math.min(e.clientX + 14, window.innerWidth - tw - 8) + 'px'
  tip.style.top = Math.min(e.clientY + 16, window.innerHeight - th - 8) + 'px'
})

const hideTip = () => tip.classList.add('hidden')
cv.addEventListener('pointerleave', hideTip)
cv.addEventListener('pointerdown', hideTip)

/* ══════════════════════ owner mode ══════════════════════

   Long-press the server name to unlock. Secret pins are filtered out by the
   read policy itself, so locked visitors never receive them — hiding them in
   the UI would not have been enough.                                          */

let pressTimer
const startPress = () => {
  clearTimeout(pressTimer)
  pressTimer = setTimeout(askOwner, 700)
}
const cancelPress = () => clearTimeout(pressTimer)

$('brand').addEventListener('pointerdown', startPress)
$('brand').addEventListener('pointerup', cancelPress)
$('brand').addEventListener('pointerleave', cancelPress)
$('brand').addEventListener('contextmenu', e => e.preventDefault())

async function askOwner () {
  if (store.owner) return
  if (remember.ownerKey && await unlockOwner(remember.ownerKey)) return

  ownerPrompt = true
  openSheet('keyPad')
  $('kHeading').textContent = 'Owner key'
  $('kBlurb').textContent = 'Your personal key. Unlocks secret pins that nobody else can see.'
  $('kInput').value = ''
  $('kErr').classList.add('hidden')
  setTimeout(() => $('kInput').focus(), 80)
}

async function unlockOwner (pass) {
  const { data, error } = await sb.rpc('atlas_role', { pass })
  if (error || data !== 'owner') return false
  remember.ownerKey = pass
  if (!remember.key) remember.key = pass      // owner key also grants normal writes
  store.owner = true
  $('ownerBadge').classList.remove('hidden')
  $('eSecretRow').classList.remove('hidden')
  await load()
  toast('Owner mode — secret pins visible')
  return true
}

function lockOwner () {
  store.owner = false
  localStorage.removeItem('atlas.ownerKey')
  store.pins = store.pins.filter(p => !p.secret)
  $('ownerBadge').classList.add('hidden')
  $('eSecretRow').classList.add('hidden')
  closeSheets()
  render()
  toast('Locked')
}

$('ownerBadge').onclick = lockOwner

/* ══════════════════════ dimensions & filters ══════════════════════ */

$('dimSwitch').innerHTML = DIMENSIONS.map(d =>
  `<button data-d="${d.key}">${d.label}</button>`
).join('')
$('dimSwitch').onclick = e => {
  const b = e.target.closest('button')
  if (b) setDimension(b.dataset.d)
}

function setDimension (d) {
  store.dimension = d
  ;[...$('dimSwitch').children].forEach(b => b.classList.toggle('on', b.dataset.d === d))
  stopDrawing()
  render(); saveView()
}

$('filters').innerHTML = KINDS.map(k =>
  `<button data-kind="${k.key}" class="on" style="color:${k.color}">
     <span class="dot" style="background:${k.color}"></span>${k.label}
   </button>`
).join('')
$('filters').onclick = e => {
  const b = e.target.closest('button'); if (!b) return
  const k = b.dataset.kind
  store.hidden.has(k) ? store.hidden.delete(k) : store.hidden.add(k)
  b.classList.toggle('on', !store.hidden.has(k))
  render()
}

$('homeBtn').onclick = () => flyTo(0, 0, 0.2)

/* ══════════════════════ search ══════════════════════ */

$('searchBtn').onclick = () => {
  openSheet('searchPane')
  $('sInput').value = ''
  runSearch()
  setTimeout(() => $('sInput').focus(), 80)
}
$('sInput').addEventListener('input', runSearch)

function runSearch () {
  const q = $('sInput').value.trim().toLowerCase()
  const hits = store.pins
    .filter(p => !q || [p.title, p.body, p.author].join(' ').toLowerCase().includes(q))
    .slice(0, 60)

  $('sResults').innerHTML = hits.length
    ? hits.map(p => {
        const k = kindOf(p.kind)
        return `<button data-id="${p.id}">
          <div class="r-title" style="color:${k.color}">${k.glyph}</div>
          <div class="r-title">${escapeHtml(p.title)}</div>
          <div class="r-sub">${p.x} ${p.z} · ${k.label} · ${escapeHtml(p.author)}</div>
        </button>`
      }).join('')
    : `<div class="empty">${store.pins.length ? 'Nothing matches that.' : 'No pins yet. Tap + to add the first one.'}</div>`
}

$('sResults').onclick = e => {
  const b = e.target.closest('button'); if (!b) return
  const p = store.pins.find(x => x.id === b.dataset.id)
  if (!p) return
  if (p.dimension !== store.dimension) setDimension(p.dimension)
  flyTo(p.x, p.z, Math.max(view.scale, 0.35))
  openPin(p)
}

const escapeHtml = s => String(s).replace(/[&<>"']/g,
  c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))

/* ══════════════════════ data ══════════════════════ */

async function load () {
  const [pins, borders, chunks] = await Promise.all([
    sb.from('pins').select('*').order('created_at'),
    sb.from('borders').select('*').order('created_at'),
    sb.from('chunks').select('*'),
  ])
  if (pins.error) { toast('Could not reach the atlas'); return }
  store.pins = pins.data || []
  store.borders = borders.data || []
  store.chunks = chunks.data || []

  // Secret pins are excluded by the read policy itself, so they can only
  // arrive through the owner-key RPC. Nothing to filter client-side.
  if (store.owner && remember.ownerKey) {
    const { data } = await sb.rpc('atlas_secret_pins', { pass: remember.ownerKey })
    if (data?.length) store.pins = store.pins.concat(data)
  }
  render()
}

// Live updates, so a pin added on someone's tablet shows up on everyone else's
// screen without a refresh.
sb.channel('atlas')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'pins' }, load)
  .on('postgres_changes', { event: '*', schema: 'public', table: 'borders' }, load)
  .on('postgres_changes', { event: '*', schema: 'public', table: 'chunks' }, load)
  .subscribe()

document.addEventListener('visibilitychange', () => { if (!document.hidden) load() })

/* ══════════════════════ boot ══════════════════════ */

function boot () {
  $('brandName').textContent = SERVER_NAME

  for (const layer of MAP_LAYERS) {
    layer._img = new Image()
    layer._img.onload = render
    layer._img.src = layer.src
  }

  try {
    const saved = JSON.parse(localStorage.getItem('atlas.view') || 'null')
    if (saved) {
      view.cx = saved.cx; view.cz = saved.cz; view.scale = saved.scale
      store.dimension = saved.d || 'overworld'
    }
  } catch {}

  setDimension(store.dimension)
  window.addEventListener('resize', resize)
  resize()
  load()

  // Owner mode survives a refresh — the key is re-checked against the server,
  // never trusted from storage alone.
  if (remember.ownerKey) unlockOwner(remember.ownerKey)
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') { stopDrawing(); closeSheets() } })

boot()
