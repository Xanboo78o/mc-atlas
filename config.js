// Public config. These values are safe to commit — the database is protected by
// Row Level Security (anyone may read, nobody may write) and every write goes
// through a Postgres function that checks the server passphrase.
export const SUPABASE_URL = 'https://lxbwfldeibjselogrszh.supabase.co'
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4YndmbGRlaWJqc2Vsb2dyc3poIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYzMDA2NTgsImV4cCI6MjEwMTg3NjY1OH0.jCbosLRY1baiKeSqavKLqVxFNQomqUztY0JjxsylDBk'

export const SERVER_NAME = 'THE ATLAS'

// Pin categories. Add your own freely — `key` is what gets stored in the
// database, so don't rename an existing key once people have used it.
export const KINDS = [
  { key: 'base',   label: 'Base',    color: '#7dd3fc', glyph: '⌂' },
  { key: 'place',  label: 'Place',   color: '#a3e635', glyph: '◆' },
  { key: 'farm',   label: 'Farm',    color: '#fbbf24', glyph: '✵' },
  { key: 'portal', label: 'Portal',  color: '#c084fc', glyph: '◎' },
  { key: 'shop',   label: 'Shop',    color: '#f472b6', glyph: '¤' },
  { key: 'grave',  label: 'Grave',   color: '#f87171', glyph: '†' },
  { key: 'event',  label: 'Event',   color: '#fb923c', glyph: '✦' },
  { key: 'danger', label: 'Danger',  color: '#ef4444', glyph: '⚠' },
]

export const DIMENSIONS = [
  { key: 'overworld', label: 'Overworld' },
  { key: 'nether',    label: 'Nether' },
  { key: 'end',       label: 'End' },
]

// Every biome in the game. `key` is what gets stored, so don't rename one once
// it's been used. Colours are roughly the map colours each biome shows in game.
// The picker is searchable, which is why the obscure ones can all live here.
export const BIOMES = [
  // ── Overworld ──
  { key: 'badlands',                 label: 'Badlands',                  color: '#d94515', group: 'Overworld' },
  { key: 'bamboo_jungle',            label: 'Bamboo Jungle',             color: '#768e14', group: 'Overworld' },
  { key: 'beach',                    label: 'Beach',                     color: '#fade55', group: 'Overworld' },
  { key: 'birch_forest',             label: 'Birch Forest',              color: '#307444', group: 'Overworld' },
  { key: 'cherry_grove',             label: 'Cherry Grove',              color: '#ffb7c5', group: 'Overworld' },
  { key: 'cold_ocean',               label: 'Cold Ocean',                color: '#3938c9', group: 'Overworld' },
  { key: 'dark_forest',              label: 'Dark Forest',               color: '#40511a', group: 'Overworld' },
  { key: 'deep_cold_ocean',          label: 'Deep Cold Ocean',           color: '#2d2ba8', group: 'Overworld' },
  { key: 'deep_dark',                label: 'Deep Dark',                 color: '#0f1b22', group: 'Overworld' },
  { key: 'deep_frozen_ocean',        label: 'Deep Frozen Ocean',         color: '#5b6ba8', group: 'Overworld' },
  { key: 'deep_lukewarm_ocean',      label: 'Deep Lukewarm Ocean',       color: '#1866a3', group: 'Overworld' },
  { key: 'deep_ocean',               label: 'Deep Ocean',                color: '#000030', group: 'Overworld' },
  { key: 'deep_warm_ocean',          label: 'Deep Warm Ocean',           color: '#0a5c9e', group: 'Overworld' },
  { key: 'desert',                   label: 'Desert',                    color: '#fa9418', group: 'Overworld' },
  { key: 'dripstone_caves',          label: 'Dripstone Caves',           color: '#7b6254', group: 'Overworld' },
  { key: 'eroded_badlands',          label: 'Eroded Badlands',           color: '#ff6d3d', group: 'Overworld' },
  { key: 'flower_forest',            label: 'Flower Forest',             color: '#2d8e49', group: 'Overworld' },
  { key: 'forest',                   label: 'Forest',                    color: '#056621', group: 'Overworld' },
  { key: 'frozen_ocean',             label: 'Frozen Ocean',              color: '#7070d6', group: 'Overworld' },
  { key: 'frozen_peaks',             label: 'Frozen Peaks',              color: '#a0b8d0', group: 'Overworld' },
  { key: 'frozen_river',             label: 'Frozen River',              color: '#a0a0ff', group: 'Overworld' },
  { key: 'grove',                    label: 'Grove',                     color: '#47653f', group: 'Overworld' },
  { key: 'ice_spikes',               label: 'Ice Spikes',                color: '#b4dcdc', group: 'Overworld' },
  { key: 'jagged_peaks',             label: 'Jagged Peaks',              color: '#c8d4e0', group: 'Overworld' },
  { key: 'jungle',                   label: 'Jungle',                    color: '#537b09', group: 'Overworld' },
  { key: 'lukewarm_ocean',           label: 'Lukewarm Ocean',            color: '#2e8ac4', group: 'Overworld' },
  { key: 'lush_caves',               label: 'Lush Caves',                color: '#4a7d2e', group: 'Overworld' },
  { key: 'mangrove_swamp',           label: 'Mangrove Swamp',            color: '#3a5f3a', group: 'Overworld' },
  { key: 'meadow',                   label: 'Meadow',                    color: '#63a948', group: 'Overworld' },
  { key: 'mushroom_fields',          label: 'Mushroom Fields',           color: '#ff00ff', group: 'Overworld' },
  { key: 'ocean',                    label: 'Ocean',                     color: '#000070', group: 'Overworld' },
  { key: 'old_growth_birch_forest',  label: 'Old Growth Birch Forest',   color: '#589c6c', group: 'Overworld' },
  { key: 'old_growth_pine_taiga',    label: 'Old Growth Pine Taiga',     color: '#596651', group: 'Overworld' },
  { key: 'old_growth_spruce_taiga',  label: 'Old Growth Spruce Taiga',   color: '#818e79', group: 'Overworld' },
  { key: 'pale_garden',              label: 'Pale Garden',               color: '#b7b7a4', group: 'Overworld' },
  { key: 'plains',                   label: 'Plains',                    color: '#8db360', group: 'Overworld' },
  { key: 'river',                    label: 'River',                     color: '#0000ff', group: 'Overworld' },
  { key: 'savanna',                  label: 'Savanna',                   color: '#bdb25f', group: 'Overworld' },
  { key: 'savanna_plateau',          label: 'Savanna Plateau',           color: '#a79d64', group: 'Overworld' },
  { key: 'snowy_beach',              label: 'Snowy Beach',               color: '#faf0c0', group: 'Overworld' },
  { key: 'snowy_plains',             label: 'Snowy Plains',              color: '#f0f0f0', group: 'Overworld' },
  { key: 'snowy_slopes',             label: 'Snowy Slopes',              color: '#d8e8f0', group: 'Overworld' },
  { key: 'snowy_taiga',              label: 'Snowy Taiga',               color: '#31554a', group: 'Overworld' },
  { key: 'sparse_jungle',            label: 'Sparse Jungle',             color: '#628b17', group: 'Overworld' },
  { key: 'stony_peaks',              label: 'Stony Peaks',               color: '#9c9c9c', group: 'Overworld' },
  { key: 'stony_shore',              label: 'Stony Shore',               color: '#a2a284', group: 'Overworld' },
  { key: 'sunflower_plains',         label: 'Sunflower Plains',          color: '#b5db88', group: 'Overworld' },
  { key: 'swamp',                    label: 'Swamp',                     color: '#07f9b2', group: 'Overworld' },
  { key: 'taiga',                    label: 'Taiga',                     color: '#0b6659', group: 'Overworld' },
  { key: 'warm_ocean',               label: 'Warm Ocean',                color: '#0090a0', group: 'Overworld' },
  { key: 'windswept_forest',         label: 'Windswept Forest',          color: '#589c6c', group: 'Overworld' },
  { key: 'windswept_gravelly_hills', label: 'Windswept Gravelly Hills',  color: '#789878', group: 'Overworld' },
  { key: 'windswept_hills',          label: 'Windswept Hills',           color: '#606060', group: 'Overworld' },
  { key: 'windswept_savanna',        label: 'Windswept Savanna',         color: '#e5da87', group: 'Overworld' },
  { key: 'wooded_badlands',          label: 'Wooded Badlands',           color: '#b09765', group: 'Overworld' },

  // ── Nether ──
  { key: 'nether_wastes',     label: 'Nether Wastes',     color: '#bf3b3b', group: 'Nether' },
  { key: 'soul_sand_valley',  label: 'Soul Sand Valley',  color: '#5e3830', group: 'Nether' },
  { key: 'crimson_forest',    label: 'Crimson Forest',    color: '#dd0808', group: 'Nether' },
  { key: 'warped_forest',     label: 'Warped Forest',     color: '#167e86', group: 'Nether' },
  { key: 'basalt_deltas',     label: 'Basalt Deltas',     color: '#685f70', group: 'Nether' },

  // ── The End ──
  { key: 'the_end',            label: 'The End',            color: '#8080ff', group: 'The End' },
  { key: 'end_barrens',        label: 'End Barrens',        color: '#8080a0', group: 'The End' },
  { key: 'end_highlands',      label: 'End Highlands',      color: '#b0b0e0', group: 'The End' },
  { key: 'end_midlands',       label: 'End Midlands',       color: '#a0a0c0', group: 'The End' },
  { key: 'small_end_islands',  label: 'Small End Islands',  color: '#6060a0', group: 'The End' },

  // ── Legacy ──
  // Still in Bedrock's biome registry but no longer generated by the modern
  // world generator. Old worlds and old chunks can still contain them.
  { key: 'badlands_plateau',                 label: 'Badlands Plateau',                 color: '#ca8c65', group: 'Legacy' },
  { key: 'bamboo_jungle_hills',              label: 'Bamboo Jungle Hills',              color: '#5c6c11', group: 'Legacy' },
  { key: 'birch_forest_hills',               label: 'Birch Forest Hills',               color: '#1f5f39', group: 'Legacy' },
  { key: 'dark_forest_hills',                label: 'Dark Forest Hills',                color: '#36471a', group: 'Legacy' },
  { key: 'desert_hills',                     label: 'Desert Hills',                     color: '#d57b16', group: 'Legacy' },
  { key: 'desert_lakes',                     label: 'Desert Lakes',                     color: '#ffbc40', group: 'Legacy' },
  { key: 'giant_spruce_taiga_hills',         label: 'Giant Spruce Taiga Hills',         color: '#6d7864', group: 'Legacy' },
  { key: 'giant_tree_taiga_hills',           label: 'Giant Tree Taiga Hills',           color: '#4c5340', group: 'Legacy' },
  { key: 'gravelly_mountains',               label: 'Gravelly Mountains',               color: '#888888', group: 'Legacy' },
  { key: 'jungle_edge',                      label: 'Jungle Edge',                      color: '#628b17', group: 'Legacy' },
  { key: 'jungle_hills',                     label: 'Jungle Hills',                     color: '#2c4205', group: 'Legacy' },
  { key: 'legacy_frozen_ocean',              label: 'Legacy Frozen Ocean',              color: '#8080c0', group: 'Legacy' },
  { key: 'modified_badlands_plateau',        label: 'Modified Badlands Plateau',        color: '#e0975f', group: 'Legacy' },
  { key: 'modified_gravelly_mountains',      label: 'Modified Gravelly Mountains',      color: '#9a9a9a', group: 'Legacy' },
  { key: 'modified_jungle',                  label: 'Modified Jungle',                  color: '#6b9316', group: 'Legacy' },
  { key: 'modified_jungle_edge',             label: 'Modified Jungle Edge',             color: '#7ba428', group: 'Legacy' },
  { key: 'modified_wooded_badlands_plateau', label: 'Modified Wooded Badlands Plateau', color: '#c4a883', group: 'Legacy' },
  { key: 'mountain_edge',                    label: 'Mountain Edge',                    color: '#72789a', group: 'Legacy' },
  { key: 'mushroom_field_shore',             label: 'Mushroom Field Shore',             color: '#a000ff', group: 'Legacy' },
  { key: 'shattered_savanna_plateau',        label: 'Shattered Savanna Plateau',        color: '#cfc48a', group: 'Legacy' },
  { key: 'snowy_mountains',                  label: 'Snowy Mountains',                  color: '#a0a0a0', group: 'Legacy' },
  { key: 'snowy_taiga_hills',                label: 'Snowy Taiga Hills',                color: '#243f37', group: 'Legacy' },
  { key: 'swamp_hills',                      label: 'Swamp Hills',                      color: '#2fffc0', group: 'Legacy' },
  { key: 'taiga_hills',                      label: 'Taiga Hills',                      color: '#163933', group: 'Legacy' },
  { key: 'tall_birch_hills',                 label: 'Tall Birch Hills',                 color: '#4d7f5e', group: 'Legacy' },
  { key: 'the_void',                         label: 'The Void',                         color: '#101014', group: 'Legacy' },
  { key: 'wooded_badlands_plateau',          label: 'Wooded Badlands Plateau',          color: '#b09765', group: 'Legacy' },
  { key: 'wooded_hills',                     label: 'Wooded Hills',                     color: '#22551c', group: 'Legacy' },
  { key: 'wooded_mountains',                 label: 'Wooded Mountains',                 color: '#507050', group: 'Legacy' },
]

export const SLIME_COLOR = '#78c850'

// What you'd actually notice standing in each biome. A tag that isn't listed is
// treated as false, so the lists below have to be complete — a missing 'trees'
// on a forest would make the helper rule it out the moment you say yes.
export const BIOME_TAGS = {
  // Overworld
  badlands:                 ['sand', 'dry'],
  bamboo_jungle:            ['trees', 'grass', 'bamboo'],
  beach:                    ['sand', 'water'],
  birch_forest:             ['trees', 'grass'],
  cherry_grove:             ['trees', 'grass', 'flowers'],
  cold_ocean:               ['water'],
  dark_forest:              ['trees', 'grass', 'mushroom'],
  deep_cold_ocean:          ['water', 'deep'],
  deep_dark:                ['cave'],
  deep_frozen_ocean:        ['water', 'deep', 'frozen'],
  deep_lukewarm_ocean:      ['water', 'deep'],
  deep_ocean:               ['water', 'deep'],
  deep_warm_ocean:          ['water', 'deep'],
  desert:                   ['sand', 'dry'],
  dripstone_caves:          ['cave'],
  eroded_badlands:          ['sand', 'dry', 'steep'],
  flower_forest:            ['trees', 'grass', 'flowers'],
  forest:                   ['trees', 'grass'],
  frozen_ocean:             ['water', 'frozen'],
  frozen_peaks:             ['snow', 'steep', 'frozen'],
  frozen_river:             ['water', 'frozen'],
  grove:                    ['trees', 'snow'],
  ice_spikes:               ['snow', 'frozen'],
  jagged_peaks:             ['snow', 'steep'],
  jungle:                   ['trees', 'grass', 'bamboo'],
  lukewarm_ocean:           ['water'],
  lush_caves:               ['cave', 'grass', 'flowers'],
  mangrove_swamp:           ['trees', 'water', 'grass'],
  meadow:                   ['grass', 'flowers'],
  mushroom_fields:          ['mushroom', 'grass'],
  ocean:                    ['water'],
  old_growth_birch_forest:  ['trees', 'grass'],
  old_growth_pine_taiga:    ['trees', 'grass'],
  old_growth_spruce_taiga:  ['trees', 'grass'],
  pale_garden:              ['trees', 'grass'],
  plains:                   ['grass', 'flowers'],
  river:                    ['water'],
  savanna:                  ['grass', 'trees', 'dry'],
  savanna_plateau:          ['grass', 'trees', 'dry', 'steep'],
  snowy_beach:              ['sand', 'snow', 'water'],
  snowy_plains:             ['snow'],
  snowy_slopes:             ['snow', 'steep'],
  snowy_taiga:              ['trees', 'snow'],
  sparse_jungle:            ['trees', 'grass'],
  stony_peaks:              ['steep'],
  stony_shore:              ['water', 'steep'],
  sunflower_plains:         ['grass', 'flowers'],
  swamp:                    ['trees', 'water', 'grass'],
  taiga:                    ['trees', 'grass'],
  warm_ocean:               ['water'],
  windswept_forest:         ['trees', 'grass', 'steep'],
  windswept_gravelly_hills: ['steep', 'grass'],
  windswept_hills:          ['steep', 'grass'],
  windswept_savanna:        ['grass', 'dry', 'steep'],
  wooded_badlands:          ['sand', 'dry', 'trees', 'steep'],

  // Nether
  nether_wastes:     ['nether', 'lava'],
  soul_sand_valley:  ['nether', 'sand'],
  crimson_forest:    ['nether', 'trees'],
  warped_forest:     ['nether', 'trees'],
  basalt_deltas:     ['nether', 'lava'],

  // The End
  the_end:            ['end'],
  end_barrens:        ['end'],
  end_highlands:      ['end', 'trees'],   // chorus plants read as trees
  end_midlands:       ['end'],
  small_end_islands:  ['end'],

  // Legacy
  badlands_plateau:                 ['sand', 'dry', 'steep'],
  bamboo_jungle_hills:              ['trees', 'grass', 'bamboo', 'steep'],
  birch_forest_hills:               ['trees', 'grass', 'steep'],
  dark_forest_hills:                ['trees', 'grass', 'mushroom', 'steep'],
  desert_hills:                     ['sand', 'dry', 'steep'],
  desert_lakes:                     ['sand', 'dry', 'water'],
  giant_spruce_taiga_hills:         ['trees', 'grass', 'steep'],
  giant_tree_taiga_hills:           ['trees', 'grass', 'steep'],
  gravelly_mountains:               ['steep', 'grass'],
  jungle_edge:                      ['trees', 'grass'],
  jungle_hills:                     ['trees', 'grass', 'steep'],
  legacy_frozen_ocean:              ['water', 'frozen'],
  modified_badlands_plateau:        ['sand', 'dry', 'steep'],
  modified_gravelly_mountains:      ['steep', 'grass'],
  modified_jungle:                  ['trees', 'grass', 'bamboo'],
  modified_jungle_edge:             ['trees', 'grass'],
  modified_wooded_badlands_plateau: ['sand', 'dry', 'trees', 'steep'],
  mountain_edge:                    ['steep', 'grass'],
  mushroom_field_shore:             ['mushroom', 'sand', 'water'],
  shattered_savanna_plateau:        ['grass', 'dry', 'steep'],
  snowy_mountains:                  ['snow', 'steep'],
  snowy_taiga_hills:                ['trees', 'snow', 'steep'],
  swamp_hills:                      ['trees', 'water', 'grass', 'steep'],
  taiga_hills:                      ['trees', 'grass', 'steep'],
  tall_birch_hills:                 ['trees', 'grass', 'steep'],
  the_void:                         [],
  wooded_badlands_plateau:          ['sand', 'dry', 'trees', 'steep'],
  wooded_hills:                     ['trees', 'grass', 'steep'],
  wooded_mountains:                 ['trees', 'grass', 'steep'],
}

// Questions the helper can ask. It never asks these in order — it picks
// whichever one splits the remaining candidates closest to in half.
export const QUESTIONS = [
  { tag: 'nether',   text: 'Are you in the Nether?' },
  { tag: 'end',      text: 'Are you in the End?' },
  { tag: 'cave',     text: 'Are you underground, in a cave biome?' },
  { tag: 'water',    text: 'Is it mostly open water?' },
  { tag: 'deep',     text: 'Is the water very deep?' },
  { tag: 'frozen',   text: 'Is there ice, or frozen water?' },
  { tag: 'snow',     text: 'Is there snow on the ground?' },
  { tag: 'trees',    text: 'Are there trees?' },
  { tag: 'grass',    text: 'Is the ground grassy and green?' },
  { tag: 'sand',     text: 'Is there a lot of sand?' },
  { tag: 'steep',    text: 'Is the land steep or mountainous?' },
  { tag: 'flowers',  text: 'Are there lots of flowers?' },
  { tag: 'mushroom', text: 'Are there giant mushrooms?' },
  { tag: 'bamboo',   text: 'Is bamboo growing?' },
  { tag: 'dry',      text: 'Are there cacti or dead bushes?' },
  { tag: 'lava',     text: 'Are there big lava lakes?' },
]

// Background image layers, drawn under the grid.
//
// This is the upgrade path: when you render the world with PapyrusCS or
// unMined, drop the tiles in and list them here. Every pin is stored in world
// coordinates, so they will all land in exactly the right place with no rework.
//
//   { src: 'maps/spawn.png', dimension: 'overworld',
//     west: -1024, north: -1024, east: 1024, south: 1024 }
//
// west/north/east/south are the world X/Z coordinates of the image edges.
export const MAP_LAYERS = []
