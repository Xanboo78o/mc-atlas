// The Guide — a full-screen reference panel: recipes, farms, loot, ores,
// blocks. Pure static data, zero Supabase. Deliberately NOT part of app.js's
// sheet system: it owns the whole screen and its own open/close.

import { RECIPES, BREWING } from './data/recipes.js'
import { FARMS } from './data/farms.js'
import { STRUCTURES, MOBS } from './data/loot.js'
import { ORES } from './data/ores.js'
import { BLOCKS } from './data/blocks.js'
import { ENCHANTS, ENCHANT_BASICS } from './data/enchants.js'
import { MOB_NAMES, NAME_RULES } from './data/mobnames.js'
import { BLOCK_NAMES, BLOCK_NAME_NOTE } from './data/blocknames.js'

const $ = id => document.getElementById(id)
const esc = s => String(s).replace(/[&<>"']/g,
  c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))

// Old game name -> ours. The Guide only ever DISPLAYS our names, but someone
// typing "creeper" should still land on the Hisses entries — otherwise the
// running joke breaks the reference tool, which defeats the point.
const stem = w => w.replace(/(?:es|s)$/, '')

const TRANSLATE = new Map()
for (const m of [...MOB_NAMES, ...BLOCK_NAMES]) {
  // drop the article: "the Tenants" is written as "Tenants" in prose
  const mine = m.name.toLowerCase().replace(/^(?:the|a) /, '')
  TRANSLATE.set(m.real, mine)
  if (!m.real.endsWith('s')) TRANSLATE.set(m.real + 's', mine)
}

// real block name -> ours, for the variant chips in the Blocks tab
const BLOCK_RENAME = new Map(BLOCK_NAMES.map(b => [b.real.toLowerCase(), b.name]))

// Token match: every word of the query must appear somewhere in the haystack,
// literally, stemmed, or via its translation.
// "warped fence gate" finds the wood-pieces family via 'warped' + 'fence gate'
// even though no single string contains the whole phrase.
const matches = (hay, q) => {
  if (!q) return true
  const h = hay.toLowerCase()
  return q.split(/\s+/).every(w => {
    if (h.includes(w)) return true
    if (h.includes(stem(w))) return true          // "Hisses" typed, "Hiss" written
    const mine = TRANSLATE.get(w) || TRANSLATE.get(stem(w))
    return !!mine && (h.includes(mine) || h.includes(stem(mine)))
  })
}

const TABS = [
  { id: 'names',    label: 'Names',    placeholder: 'search — works on our names or the old ones' },
  { id: 'recipes',  label: 'Recipes',  placeholder: 'search recipes — "hopper", "golden carrot"…' },
  { id: 'enchants', label: 'Enchants', placeholder: 'search enchantments — "mending", "boots"…' },
  { id: 'farms',    label: 'Farms',    placeholder: 'search farms…' },
  { id: 'loot',     label: 'Loot',     placeholder: 'search structures and mob drops…' },
  { id: 'ores',     label: 'Ores',     placeholder: 'search ores…' },
  { id: 'blocks',   label: 'Blocks',   placeholder: 'type ANY block — "warped fence gate", "froglight"…' },
]

let tab = localStorage.getItem('atlas.infoTab') || 'recipes'
let openFarm = null   // farm id when viewing one farm
let farmLayer = 0

/* ── item tiles get a stable colour from their name ── */
function hue (s) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360
  return h
}
const tile = name =>
  `<div class="rc-cell" style="--h:${hue(name)}">${esc(name)}</div>`
const emptyTile = '<div class="rc-cell rc-empty"></div>'

/* ══════════════════ recipes ══════════════════ */

const CAT_ORDER = ['Tools', 'Combat', 'Redstone', 'Transport', 'Food', 'Utility', 'Building', 'Smelting']

function recipeMatches (r, q) {
  const hay = [r.name, r.out, r.note, ...(r.alias || []),
    ...(r.grid ? r.grid.flat().filter(Boolean) : []), r.in].filter(Boolean).join(' ')
  return matches(hay, q)
}

function renderRecipe (r) {
  if (r.type === 'smelt') {
    return `<div class="card rc-smelt">
      <div class="card-title">${esc(r.name)}</div>
      <div class="rc-smeltrow">${tile(r.in)}<span class="rc-arrow">→ 🔥 →</span>${tile(r.out)}</div>
      ${r.note ? `<div class="card-note">${esc(r.note)}</div>` : ''}
    </div>`
  }
  const grid = r.shapeless
    ? `<div class="rc-shapeless"><span class="chip">shapeless</span>${r.grid[0].map(tile).join('')}</div>`
    : `<div class="rc-grid" style="--cols:${r.grid[0].length}">
        ${r.grid.map(row => row.map(c => c ? tile(c) : emptyTile).join('')).join('')}
      </div>`
  return `<div class="card">
    <div class="card-title">${esc(r.name)}</div>
    ${grid}
    <div class="rc-out">→ ${esc(r.out)} ×${r.count}</div>
    ${r.note ? `<div class="card-note">${esc(r.note)}</div>` : ''}
  </div>`
}

function renderRecipes (q) {
  let html = ''
  for (const cat of CAT_ORDER) {
    const hits = RECIPES.filter(r => r.cat === cat && recipeMatches(r, q))
    if (!hits.length) continue
    html += `<h3 class="info-h">${cat}</h3><div class="cardgrid">${hits.map(renderRecipe).join('')}</div>`
  }
  const brewHit = !q || 'brewing potions'.includes(q) ||
    BREWING.effects.some(e => (e.add + ' ' + e.potion).toLowerCase().includes(q))
  if (brewHit) {
    html += `<h3 class="info-h">Brewing</h3>
      <div class="card"><div class="card-note">${esc(BREWING.intro)}</div>
      <table class="info-table"><tr><th>add to awkward</th><th>you get</th></tr>
        ${BREWING.effects.map(e => `<tr><td>${esc(e.add)}</td><td>${esc(e.potion)}</td></tr>`).join('')}
      </table>
      <table class="info-table"><tr><th>then add</th><th>effect</th></tr>
        ${BREWING.modifiers.map(m => `<tr><td>${esc(m.add)}</td><td>${esc(m.does)}</td></tr>`).join('')}
      </table>
      <div class="card-note">${esc(BREWING.note)}</div></div>`
  }
  return html || emptyState(q)
}

/* ══════════════════ names ══════════════════

   The Guide uses these names everywhere. The real game names live only in the
   search index, so typing "creeper" still lands on Hisses — the joke stays
   intact while the tool stays usable for anyone who doesn't know the words. */

const NAME_GROUPS = ['People', 'Livestock', 'Staff', 'Nuisances', 'Management']

function renderNames (q) {
  let html = ''
  if (!q) {
    html += `<h3 class="info-h">The rules</h3>
      <div class="card"><ul class="info-list">${NAME_RULES.map(r => `<li>${esc(r)}</li>`).join('')}</ul></div>`
  }
  for (const g of NAME_GROUPS) {
    const hits = MOB_NAMES.filter(m => m.group === g &&
      matches([m.name, m.real, m.note].filter(Boolean).join(' '), q))
    if (!hits.length) continue
    html += `<h3 class="info-h">${g}</h3><div class="card"><table class="info-table">
      <tr><th>what we call it</th><th>what the game calls it</th></tr>
      ${hits.map(m => `<tr>
        <td><strong>${esc(m.name)}</strong>${m.note ? `<div class="card-note">${esc(m.note)}</div>` : ''}</td>
        <td class="odds">${esc(m.real)}</td>
      </tr>`).join('')}
    </table></div>`
  }
  const blockHits = BLOCK_NAMES.filter(b => matches(b.name + ' ' + b.real, q))
  if (blockHits.length) {
    html += `<h3 class="info-h">Blocks <span class="muted-inline">only some of them — that's the point</span></h3>
      <div class="card">
        ${q ? '' : `<div class="card-note">${esc(BLOCK_NAME_NOTE)}</div>`}
        <table class="info-table">
          <tr><th>what we call it</th><th>what the game calls it</th></tr>
          ${blockHits.map(b => `<tr>
            <td><strong>${esc(b.name)}</strong></td>
            <td class="odds">${esc(b.real)}</td>
          </tr>`).join('')}
        </table>
      </div>`
  }

  return html || emptyState(q)
}

/* ══════════════════ enchantments ══════════════════ */

const ENCH_ORDER = ['Universal', 'Armor', 'Melee', 'Mace & Spear', 'Tools', 'Ranged', 'Trident', 'Curses']

// **bold** in the basics lists — the only markup these strings carry
const lite = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')

function renderEnchants (q) {
  let html = ''
  for (const cat of ENCH_ORDER) {
    const hits = ENCHANTS.filter(e => e.cat === cat &&
      matches([e.name, e.items, e.what, e.tip, e.source, e.exclusive].filter(Boolean).join(' '), q))
    if (!hits.length) continue
    html += `<h3 class="info-h">${cat}</h3><div class="cardgrid">` + hits.map(e => `
      <div class="card">
        <div class="card-title">${esc(e.name)}
          <span class="chip chip-best">${esc(e.max)}</span>
          ${e.treasure ? '<span class="chip chip-warn">treasure</span>' : ''}
          ${e.edition ? `<span class="chip chip-java">${esc(e.edition)}</span>` : ''}
        </div>
        <div class="card-note"><strong>Goes on:</strong> ${esc(e.items)}</div>
        <div class="card-note">${esc(e.what)}</div>
        ${e.source ? `<div class="card-note"><strong>Only from:</strong> ${esc(e.source)}</div>` : ''}
        ${e.exclusive ? `<div class="card-note"><strong>Won’t combine with:</strong> ${esc(e.exclusive)}</div>` : ''}
        <div class="card-note tip">✦ ${esc(e.tip)}</div>
      </div>`).join('') + '</div>'
  }

  // the how-to blocks only show on an empty search — they'd be noise otherwise
  if (!q) {
    const section = (title, lines) =>
      `<div class="card"><div class="card-title">${title}</div>
       <ul class="info-list">${lines.map(l => `<li>${lite(l)}</li>`).join('')}</ul></div>`
    html = `<h3 class="info-h">How enchanting works</h3><div class="cardgrid">
      ${section('The table', ENCHANT_BASICS.table)}
      ${section('Anvils', ENCHANT_BASICS.anvil)}
      ${section('Grindstone', ENCHANT_BASICS.grindstone)}
      ${section('Librarians — the real source', ENCHANT_BASICS.villagers)}
    </div>` + html
  }
  return html || emptyState(q)
}

/* ══════════════════ farms ══════════════════ */

function farmMaterials (f) {
  const counts = {}
  for (const layer of f.layers) {
    const times = layer.repeat || 1
    for (const row of layer.grid) {
      for (const ch of row) {
        if (ch === '.') continue
        counts[ch] = (counts[ch] || 0) + times
      }
    }
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([ch, n]) => ({ n, ...f.legend[ch] }))
}

function renderFarmList (q) {
  const hits = FARMS.filter(f =>
    matches(f.name + ' ' + f.purpose + ' ' + f.yields.join(' '), q))
  if (!hits.length) return emptyState(q)
  return `<div class="cardgrid">` + hits.map(f => `
    <div class="card farm-card" data-farm="${f.id}">
      <div class="card-title">${esc(f.name)}</div>
      <div class="card-note">${esc(f.purpose)}</div>
      <div class="chips">${f.yields.map(y => `<span class="chip">${esc(y)}</span>`).join('')}</div>
      <div class="farm-open">Open build guide — ${f.layers.length} layers →</div>
    </div>`).join('') + '</div>'
}

function renderFarm (f) {
  const layer = f.layers[Math.min(farmLayer, f.layers.length - 1)]
  const cells = layer.grid.map(row =>
    [...row].map(ch => ch === '.'
      ? '<i class="fg-air"></i>'
      : `<i style="background:${f.legend[ch].color}" title="${esc(f.legend[ch].block)}"></i>`
    ).join('')).join('')
  const mats = farmMaterials(f)

  return `
  <button class="btn btn-ghost" id="farmBack">← All farms</button>
  <h3 class="info-h">${esc(f.name)} <span class="muted-inline">${esc(f.footprint)}</span></h3>
  <div class="card-note">${esc(f.purpose)}</div>

  <div class="farm-nav">
    <button class="btn btn-ghost" id="layerPrev" ${farmLayer === 0 ? 'disabled' : ''}>◀</button>
    <div class="farm-layerinfo">
      <strong>${esc(layer.y)}</strong>${layer.repeat ? ` <span class="chip">build ×${layer.repeat}</span>` : ''}
      <div class="muted-inline">layer ${farmLayer + 1} of ${f.layers.length}</div>
    </div>
    <button class="btn btn-ghost" id="layerNext" ${farmLayer === f.layers.length - 1 ? 'disabled' : ''}>▶</button>
  </div>

  <div class="farm-grid" style="--cols:${layer.grid[0].length}">${cells}</div>
  <div class="card-note">${esc(layer.note || '')}</div>

  <div class="legend">${Object.values(f.legend).map(l =>
    `<span class="legend-item"><i style="background:${l.color}"></i>${esc(l.block)}</span>`).join('')}
  </div>

  <h3 class="info-h">Materials</h3>
  <table class="info-table">${mats.map(m =>
    `<tr><td><i class="swatch-sq" style="background:${m.color}"></i> ${esc(m.block)}</td><td>×${m.n}</td></tr>`).join('')}
  </table>

  <h3 class="info-h">Build order</h3>
  <ol class="info-list">${f.steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol>

  <h3 class="info-h">Bedrock rules that matter</h3>
  <ul class="info-list">${f.bedrockNotes.map(s => `<li>${esc(s)}</li>`).join('')}</ul>`
}

/* ══════════════════ loot ══════════════════ */

function renderLoot (q) {
  const sHits = STRUCTURES.filter(s =>
    matches(s.name + ' ' + s.where + ' ' + s.note + ' ' + s.highlights.map(h => h.item).join(' '), q))
  const mHits = MOBS.filter(m =>
    matches([m.mob, m.real, ...m.drops, ...m.rare].filter(Boolean).join(' '), q))

  let html = ''
  if (sHits.length) {
    html += `<h3 class="info-h">Structure loot <span class="muted-inline">odds are approximate</span></h3><div class="cardgrid">`
    html += sHits.map(s => `<div class="card">
      <div class="card-title">${esc(s.name)}</div>
      <div class="card-note">${esc(s.where)}</div>
      <table class="info-table">${s.highlights.map(h =>
        `<tr><td>${esc(h.item)}</td><td class="odds">${esc(h.odds)}</td></tr>`).join('')}</table>
      ${s.note ? `<div class="card-note">✦ ${esc(s.note)}</div>` : ''}
    </div>`).join('') + '</div>'
  }
  if (mHits.length) {
    html += `<h3 class="info-h">Mob drops</h3><div class="card"><table class="info-table">
      <tr><th>mob</th><th>drops</th><th>rare</th></tr>
      ${mHits.map(m => `<tr><td>${esc(m.mob)}</td><td>${esc(m.drops.join(', '))}</td><td>${esc(m.rare.join(', ') || '—')}</td></tr>`).join('')}
    </table></div>`
  }
  return html || emptyState(q)
}

/* ══════════════════ ores ══════════════════ */

// Y −64..320 mapped onto an SVG strip; each band is a triangle peaking where
// the ore is most common, with a marker line at the best mining level.
function oreChart (o) {
  const X = y => (3 + (y + 64) / 384 * 94).toFixed(1)
  const polys = o.bands.map(b =>
    `<polygon points="${X(b.from)},30 ${X(b.peak)},4 ${X(b.to)},30" fill="${o.color}55" stroke="${o.color}" stroke-width="0.6"/>`).join('')
  const ticks = [-64, 0, 64, 128, 192, 256, 320].map(y =>
    `<line x1="${X(y)}" y1="30" x2="${X(y)}" y2="33" stroke="#4b5563" stroke-width="0.4"/>
     <text x="${X(y)}" y="39" font-size="4.6" fill="#8b949e" text-anchor="middle">${y}</text>`).join('')
  return `<svg viewBox="0 0 100 41" class="ore-svg" preserveAspectRatio="none">
    <line x1="3" y1="30" x2="97" y2="30" stroke="#4b5563" stroke-width="0.5"/>
    ${polys}
    <line x1="${X(o.bestY)}" y1="2" x2="${X(o.bestY)}" y2="30" stroke="#e6edf3" stroke-width="0.7" stroke-dasharray="2 1.6"/>
    ${ticks}
  </svg>`
}

function renderOres (q) {
  const hits = ORES.filter(o => matches(o.name + ' ' + o.where + ' ' + o.strat, q))
  if (!hits.length) return emptyState(q)
  return '<div class="cardgrid">' + hits.map(o => `<div class="card">
    <div class="card-title"><i class="swatch-sq" style="background:${o.color}"></i> ${esc(o.name)}
      <span class="chip chip-best">best Y ${o.bestY}</span></div>
    ${oreChart(o)}
    <div class="card-note"><strong>Where:</strong> ${esc(o.where)}</div>
    <div class="card-note"><strong>Tool:</strong> ${esc(o.tool)} · ${esc(o.fortune)}</div>
    <div class="card-note">${esc(o.strat)}</div>
  </div>`).join('') + '</div>'
}

/* ══════════════════ blocks ══════════════════ */

// Names first, but the prose counts too — so "Tall Guys" finds the grass block
// they drop, not just blocks with that word in the title.
function blockMatches (b, q) {
  // a renamed variant is searchable under BOTH names — "copper slab" and
  // "Statue of Liberty Fragments" both have to land here
  const names = (b.variants || []).flatMap(v => {
    const mine = BLOCK_RENAME.get(v.toLowerCase())
    return mine ? [v, mine] : [v]
  })
  return matches([
    b.family, ...names, ...(b.search || []),
    b.found, ...(b.obtain || []), ...(b.unconventional || []),
  ].filter(Boolean).join(' '), q)
}

function renderBlocks (q) {
  const hits = BLOCKS.filter(b => blockMatches(b, q))
  if (!hits.length) return emptyState(q, 'No block by that name — try part of the word, like "fence" or "sculk".')
  return '<div class="cardgrid">' + hits.map(b => `<div class="card">
    <div class="card-title">${esc(b.family)}
      <span class="chip ${b.renewable ? 'chip-good' : 'chip-warn'}">${b.renewable ? 'renewable' : 'finite'}</span></div>
    <div class="chips">${(b.variants || []).map(v => {
      const mine = BLOCK_RENAME.get(v.toLowerCase())
      return mine
        ? `<span class="chip chip-ours" title="${esc(v)}">${esc(mine)}</span>`
        : `<span class="chip">${esc(v)}</span>`
    }).join('')}</div>
    <div class="card-note"><strong>Found:</strong> ${esc(b.found)}</div>
    <div class="card-note"><strong>Tool:</strong> ${esc(b.tool)}</div>
    <ul class="info-list">${b.obtain.map(o => `<li>${esc(o)}</li>`).join('')}</ul>
    ${(b.unconventional || []).length
      ? `<ul class="info-list info-tricks">${b.unconventional.map(u => `<li>✦ ${esc(u)}</li>`).join('')}</ul>` : ''}
  </div>`).join('') + '</div>'
}

/* ══════════════════ shell ══════════════════ */

const emptyState = (q, msg) =>
  `<div class="info-empty">${esc(msg || (q ? `Nothing matches “${q}”.` : 'Nothing here yet.'))}</div>`

function render () {
  const q = $('infoSearch').value.trim().toLowerCase()
  const body = $('infoBody')

  if (tab === 'farms' && openFarm) {
    const f = FARMS.find(x => x.id === openFarm)
    body.innerHTML = f ? renderFarm(f) : renderFarmList(q)
    wireFarm(f)
    return
  }

  body.innerHTML =
    tab === 'names'    ? renderNames(q) :
    tab === 'recipes'  ? renderRecipes(q) :
    tab === 'enchants' ? renderEnchants(q) :
    tab === 'farms'    ? renderFarmList(q) :
    tab === 'loot'     ? renderLoot(q) :
    tab === 'ores'     ? renderOres(q) :
    renderBlocks(q)
}

function wireFarm (f) {
  if (!f) return
  $('farmBack').onclick = () => { openFarm = null; farmLayer = 0; render() }
  $('layerPrev').onclick = () => { farmLayer = Math.max(0, farmLayer - 1); render() }
  $('layerNext').onclick = () => { farmLayer = Math.min(f.layers.length - 1, farmLayer + 1); render() }
}

function setTab (t) {
  tab = t
  openFarm = null
  farmLayer = 0
  localStorage.setItem('atlas.infoTab', t)
  ;[...$('infoTabs').children].forEach(b => b.classList.toggle('on', b.dataset.t === t))
  const search = $('infoSearch')
  search.value = ''
  search.placeholder = TABS.find(x => x.id === t).placeholder
  render()
  $('infoBody').scrollTop = 0
}

$('infoTabs').innerHTML = TABS.map(t => `<button data-t="${t.id}">${t.label}</button>`).join('')
$('infoTabs').onclick = e => { const b = e.target.closest('button'); if (b) setTab(b.dataset.t) }
$('infoSearch').addEventListener('input', () => { openFarm = null; render() })

$('infoBody').addEventListener('click', e => {
  const card = e.target.closest('.farm-card')
  if (card) { openFarm = card.dataset.farm; farmLayer = 0; render() }
})

$('infoBtn').onclick = () => {
  $('infoPanel').classList.remove('hidden')
  setTab(tab)
}
$('infoClose').onclick = () => $('infoPanel').classList.add('hidden')
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') $('infoPanel').classList.add('hidden')
})
