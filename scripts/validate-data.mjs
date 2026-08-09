// Sanity checks for the Info tab datasets. Run from the repo root:
//   node scripts/validate-data.mjs
// Exits non-zero on any failure so it can gate a commit.

import { RECIPES, BREWING } from '../data/recipes.js'
import { FARMS } from '../data/farms.js'
import { STRUCTURES, MOBS } from '../data/loot.js'
import { ORES } from '../data/ores.js'
import { BLOCKS } from '../data/blocks.js'
import { ENCHANTS, ENCHANT_BASICS } from '../data/enchants.js'

let failures = 0
const bad = msg => { failures++; console.error('✗', msg) }
const dupes = (list, label) => {
  const seen = new Set()
  for (const x of list) {
    if (seen.has(x)) bad(`duplicate ${label}: ${x}`)
    seen.add(x)
  }
}

// ── recipes ──
dupes(RECIPES.map(r => r.id), 'recipe id')
for (const r of RECIPES) {
  if (!r.name || !r.cat) bad(`recipe ${r.id}: missing name/cat`)
  if (r.type === 'smelt') {
    if (!r.in || !r.out) bad(`smelt ${r.id}: needs in/out`)
    continue
  }
  if (!r.out || !r.count) bad(`recipe ${r.id}: needs out/count`)
  if (!Array.isArray(r.grid) || !r.grid.length) { bad(`recipe ${r.id}: no grid`); continue }
  const w = r.grid[0].length
  for (const row of r.grid) {
    if (!Array.isArray(row)) { bad(`recipe ${r.id}: grid row not an array`); continue }
    if (row.length !== w) bad(`recipe ${r.id}: ragged grid (${row.length} vs ${w})`)
    for (const cell of row) {
      if (cell !== null && (typeof cell !== 'string' || !cell.trim())) bad(`recipe ${r.id}: bad cell ${JSON.stringify(cell)}`)
    }
  }
  // shapeless "grids" are ingredient lists (one row, up to 9); shaped are ≤3×3
  if (r.shapeless) {
    if (r.grid.length !== 1 || w > 9) bad(`recipe ${r.id}: shapeless list must be one row of ≤9`)
  } else if (r.grid.length > 3 || w > 3) {
    bad(`recipe ${r.id}: grid larger than 3×3`)
  }
  if (!r.grid.flat().some(c => c)) bad(`recipe ${r.id}: grid is entirely empty`)
}
if (!BREWING.effects?.length || !BREWING.modifiers?.length) bad('brewing chart missing sections')

// ── farms ──
dupes(FARMS.map(f => f.id), 'farm id')
for (const f of FARMS) {
  if (!f.legend || !f.layers?.length) { bad(`farm ${f.id}: missing legend/layers`); continue }
  for (const [ch, spec] of Object.entries(f.legend)) {
    if (ch.length !== 1) bad(`farm ${f.id}: legend key '${ch}' not a single char`)
    if (!spec.block || !spec.color) bad(`farm ${f.id}: legend '${ch}' needs block+color`)
  }
  f.layers.forEach((layer, i) => {
    if (!layer.y || !layer.grid?.length) return bad(`farm ${f.id} layer ${i}: missing y/grid`)
    const w = layer.grid[0].length
    for (const row of layer.grid) {
      if (row.length !== w) bad(`farm ${f.id} layer '${layer.y}': ragged row '${row}' (${row.length} vs ${w})`)
      for (const ch of row) {
        if (ch !== '.' && !f.legend[ch]) bad(`farm ${f.id} layer '${layer.y}': char '${ch}' not in legend`)
      }
    }
    if (layer.repeat !== undefined && (!Number.isInteger(layer.repeat) || layer.repeat < 1)) {
      bad(`farm ${f.id} layer '${layer.y}': bad repeat ${layer.repeat}`)
    }
  })
  if (!f.steps?.length || !f.bedrockNotes?.length) bad(`farm ${f.id}: needs steps + bedrockNotes`)
}

// ── loot ──
dupes(STRUCTURES.map(s => s.name), 'structure')
for (const s of STRUCTURES) {
  if (!s.where || !s.highlights?.length) bad(`structure ${s.name}: needs where + highlights`)
  for (const h of s.highlights || []) if (!h.item || !h.odds) bad(`structure ${s.name}: bad highlight`)
}
dupes(MOBS.map(m => m.mob), 'mob')
for (const m of MOBS) if (!m.drops?.length && !m.rare?.length) bad(`mob ${m.mob}: no drops at all`)

// ── ores ──
dupes(ORES.map(o => o.id), 'ore id')
for (const o of ORES) {
  if (!o.bands?.length) { bad(`ore ${o.id}: no bands`); continue }
  for (const b of o.bands) {
    if (b.from >= b.to) bad(`ore ${o.id}: band from ${b.from} >= to ${b.to}`)
    if (b.from < -64 || b.to > 320) bad(`ore ${o.id}: band outside world (-64..320)`)
    if (b.peak < b.from || b.peak > b.to) bad(`ore ${o.id}: peak ${b.peak} outside band`)
  }
  if (!o.strat || !o.where || !o.tool) bad(`ore ${o.id}: missing strat/where/tool`)
}

// ── blocks ──
dupes(BLOCKS.map(b => b.id), 'block id')
// A block name may repeat inside its own entry (family name == variant name is
// natural), but two DIFFERENT entries claiming the same name makes search
// ambiguous — that's the bug worth catching.
const owner = new Map()
let nameCount = 0
for (const b of BLOCKS) {
  if (!b.family || !b.found || !b.tool) bad(`block ${b.id}: missing family/found/tool`)
  if (!b.obtain?.length) bad(`block ${b.id}: no obtain methods`)
  if (typeof b.renewable !== 'boolean') bad(`block ${b.id}: renewable must be true/false`)
  const names = [b.family, ...(b.variants || []), ...(b.search || [])].map(n => n.toLowerCase())
  nameCount += names.length
  for (const n of new Set(names)) {
    if (owner.has(n) && owner.get(n) !== b.id) bad(`block name '${n}' claimed by both '${owner.get(n)}' and '${b.id}'`)
    owner.set(n, b.id)
  }
}

// ── enchantments ──
dupes(ENCHANTS.map(e => e.id), 'enchant id')
dupes(ENCHANTS.map(e => e.name), 'enchant name')
const ROMAN = ['I', 'II', 'III', 'IV', 'V']
const ENCH_CATS = new Set(['Universal', 'Armor', 'Melee', 'Mace & Spear', 'Tools', 'Ranged', 'Trident', 'Curses'])
for (const e of ENCHANTS) {
  if (!ENCH_CATS.has(e.cat)) bad(`enchant ${e.id}: unknown category '${e.cat}' (won't render)`)
  if (!ROMAN.includes(e.max)) bad(`enchant ${e.id}: max '${e.max}' is not I–V`)
  if (!e.items || !e.what || !e.tip) bad(`enchant ${e.id}: needs items/what/tip`)
  // a treasure enchant is useless without saying where it comes from
  if (e.treasure && !e.source) bad(`enchant ${e.id}: treasure but no source`)
}
for (const k of ['table', 'anvil', 'grindstone', 'villagers']) {
  if (!ENCHANT_BASICS[k]?.length) bad(`ENCHANT_BASICS.${k} missing`)
}

// ── summary ──
const counts = {
  recipes: RECIPES.length,
  farms: FARMS.length,
  structures: STRUCTURES.length,
  mobs: MOBS.length,
  ores: ORES.length,
  enchants: ENCHANTS.length,
  blockFamilies: BLOCKS.length,
  blockNames: nameCount,
}
console.log(failures ? `\n${failures} problem(s)` : 'all good', JSON.stringify(counts))
process.exit(failures ? 1 : 0)
