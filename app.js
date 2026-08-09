import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { SUPABASE_URL, SUPABASE_ANON_KEY, SERVER_NAME, KINDS, DIMENSIONS, MAP_LAYERS } from './config.js'

const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
const $ = id => document.getElementById(id)

/* ══════════════════════ state ══════════════════════ */

const store = {
  pins: [],
  borders: [],
  dimension: 'overworld',
  hidden: new Set(),          // pin kinds toggled off
  selected: null,             // pin currently open in the detail sheet
  editingPin: null,
  editingBorder: null,
  draft: null,                // border being drawn: array of [x, z]
}

// world coords at the centre of the screen, and pixels-per-block
const view = { cx: 0, cz: 0, scale: 0.2 }
const MIN_SCALE = 0.006, MAX_SCALE = 4

const remember = {
  get author () { return localStorage.getItem('atlas.author') || '' },
  set author (v) { localStorage.setItem('atlas.author', v) },
  get key () { return localStorage.getItem('atlas.key') || '' },
  set key (v) { localStorage.setItem('atlas.key', v) },
}

const kindOf = k => KINDS.find(x => x.key === k) || KINDS[1]

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
  drawGrid(bounds, w, h)
  drawBorders()
  drawDraft()
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
    if (b.dimension !== store.dimension) continue
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

function visiblePins () {
  return store.pins.filter(p => p.dimension === store.dimension && !store.hidden.has(p.kind))
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
    if (b.dimension !== store.dimension) continue
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

  if (store.draft) {
    const { x, z } = toWorld(sx, sy)
    store.draft.push([Math.round(x), Math.round(z)])
    $('drawInfo').textContent = `${store.draft.length} corner${store.draft.length === 1 ? '' : 's'} placed.`
    $('drawDone').disabled = store.draft.length < 3
    return render()
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

const SHEETS = ['detail', 'editor', 'bEditor', 'keyPad', 'searchPane']

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

/* Returns the server key, prompting for it the first time and remembering it
   after. Resolves to null if the person backs out. */
function requireKey () {
  if (remember.key) return Promise.resolve(remember.key)
  openSheet('keyPad')
  $('kInput').value = ''
  $('kErr').classList.add('hidden')
  setTimeout(() => $('kInput').focus(), 80)
  return new Promise(res => { keyResolve = res })
}

$('kGo').onclick = async () => {
  const pass = $('kInput').value.trim()
  if (!pass) return
  $('kGo').disabled = true
  const { data, error } = await sb.rpc('atlas_verify', { pass })
  $('kGo').disabled = false

  if (error || !data) {
    $('kErr').classList.remove('hidden')
    return
  }
  remember.key = pass
  closeSheets()
  keyResolve?.(pass); keyResolve = null
}

$('kInput').addEventListener('keydown', e => { if (e.key === 'Enter') $('kGo').click() })
$('kCancel').onclick = () => { closeSheets(); keyResolve?.(null); keyResolve = null }

/* ══════════════════════ pin detail ══════════════════════ */

function openPin (p) {
  store.selected = p
  const k = kindOf(p.kind)

  $('dGlyph').textContent = k.glyph
  $('dGlyph').style.color = k.color
  $('dTitle').textContent = p.title
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
  const pass = await requireKey(); if (!pass) return

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

  const pass = await requireKey(); if (!pass) return
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

$('borderBtn').onclick = () => {
  if (store.draft) return stopDrawing()
  closeSheets()
  store.draft = []
  store.editingBorder = null
  $('borderBtn').classList.add('on')
  $('drawBar').classList.remove('hidden')
  $('drawInfo').textContent = 'Tap the map to place corners — 3 or more.'
  $('drawDone').disabled = true
  cv.classList.add('drawing')
  render()
}

function stopDrawing () {
  store.draft = null
  $('borderBtn').classList.remove('on')
  $('drawBar').classList.add('hidden')
  cv.classList.remove('drawing')
  render()
}

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
  const [pins, borders] = await Promise.all([
    sb.from('pins').select('*').order('created_at'),
    sb.from('borders').select('*').order('created_at'),
  ])
  if (pins.error) { toast('Could not reach the atlas'); return }
  store.pins = pins.data || []
  store.borders = borders.data || []
  render()
}

// Live updates, so a pin added on someone's tablet shows up on everyone else's
// screen without a refresh.
sb.channel('atlas')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'pins' }, load)
  .on('postgres_changes', { event: '*', schema: 'public', table: 'borders' }, load)
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
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') { stopDrawing(); closeSheets() } })

boot()
