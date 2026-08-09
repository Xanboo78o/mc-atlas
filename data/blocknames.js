// Block names on this server.
//
// IMPORTANT: this list is deliberately incomplete and deliberately arbitrary.
// Most blocks are called exactly what the game calls them. These are not.
// Copper is copper — but copper stairs are Lady Liberty Stairs and copper slabs
// are Statue of Liberty Fragments. There is no rule. Do not add one, and do not
// "finish" a family just because part of it appears here. The unpredictability
// is the entire joke; a complete system would be a glossary instead.
//
// `real` is what the game calls it and only ever feeds search.

export const BLOCK_NAMES = [
  // ── copper: the block is fine, everything else is a monument ──
  { real: 'copper stairs', name: 'Lady Liberty Stairs' },
  { real: 'copper slab', name: 'Statue of Liberty Fragments' },
  { real: 'oxidized copper', name: 'the green one' },
  { real: 'lightning rod', name: 'the Pole' },

  // ── stone ──
  { real: 'andesite', name: 'the ugly one' },
  { real: 'diorite', name: 'the OTHER ugly one' },
  { real: 'mossy cobblestone', name: 'Old Man Cobble' },
  { real: 'deepslate tiles', name: 'Fancy Basement' },
  { real: 'smooth stone', name: 'Slab Juice' },

  // ── wood ──
  { real: 'dark oak planks', name: 'Goth Oak' },
  { real: 'birch planks', name: 'the Blonde One' },
  { real: 'acacia planks', name: 'Orange Wood' },
  { real: 'mangrove planks', name: 'Swamp Sticks' },
  { real: 'warped planks', name: 'Blue Nether Wood' },
  { real: 'bamboo mosaic', name: 'Fancy Bamboo' },

  // ── terrain ──
  { real: 'podzol', name: 'Fancy Dirt' },
  { real: 'coarse dirt', name: 'Angry Dirt' },
  { real: 'mycelium', name: 'Purple Dirt' },
  { real: 'red sand', name: 'Mars Sand' },
  { real: 'moss block', name: 'Carpet Rock' },
  { real: 'powder snow', name: 'the Trap' },
  { real: 'blue ice', name: 'Fast Ice' },
  { real: 'magma block', name: 'Ouch Block' },
  { real: 'netherrack', name: 'Hell Dirt' },
  { real: 'soul soil', name: 'Fake Soul Sand' },
  { real: 'basalt', name: 'Nether Logs' },
  { real: 'crying obsidian', name: 'Sad Rock' },
  { real: 'end stone', name: 'Cheese' },
  { real: 'purpur block', name: 'Grape Blocks' },
  { real: 'end rod', name: 'Lightsaber' },
  { real: 'calcite', name: 'Geode Shell' },

  // ── ores ──
  { real: 'emerald ore', name: 'Green Diamonds' },
  { real: 'lapis ore', name: 'Blue Rocks' },
  { real: 'ancient debris', name: 'the Good Stuff' },
  { real: 'budding amethyst', name: 'the Un-Stealable One' },

  // ── redstone ──
  { real: 'repeater', name: 'Delay Guy' },
  { real: 'comparator', name: 'the Confusing One' },
  { real: 'observer', name: 'the Watcher' },
  { real: 'sticky piston', name: 'Gooey Pusher' },
  { real: 'dropper', name: 'Fake Dispenser' },
  { real: 'note block', name: 'the Annoying Block' },
  { real: 'daylight sensor', name: 'Sun Guy' },
  { real: 'slime block', name: 'Bouncy' },
  { real: 'honey block', name: 'Sticky' },
  { real: 'sculk sensor', name: 'Ears' },
  { real: 'sculk shrieker', name: 'the Alarm' },

  // ── utility ──
  { real: 'blast furnace', name: 'Fast Furnace' },
  { real: 'smoker', name: 'Food Furnace' },
  { real: 'barrel', name: 'Chest 2' },
  { real: 'shulker box', name: 'Bag' },
  { real: 'composter', name: 'Trash Can' },
  { real: 'lectern', name: 'Book Stand' },
  { real: 'lodestone', name: 'GPS' },
  { real: 'conduit', name: 'Water Beacon' },
  { real: 'glazed terracotta', name: 'Fancy Tiles' },
  { real: 'soul lantern', name: 'Blue Lantern' },
  { real: 'beehive', name: 'Fake Bee Nest' },
  { real: 'tinted glass', name: 'Sunglasses' },

  // ── not a joke ──
  { real: 'sugar cane', name: 'My Sugar Cane' },

  // ── the new stuff ──
  { real: 'cushion', name: 'Sit Block' },
  { real: 'straw bed', name: 'Hay Nap' },
  { real: 'cinnabar', name: 'Red Sulfur' },
  { real: 'potent sulfur', name: 'Stink Bomb' },
  { real: 'copper chest', name: 'the Intern’s Chest' },
]

export const BLOCK_NAME_NOTE =
  'Most blocks are just called what they are called. These are not. ' +
  'There is no system — copper is copper, but copper stairs are Lady Liberty ' +
  'Stairs. Do not look for a rule and do not finish a family. The fact that you ' +
  'cannot predict which blocks have names is the whole joke.'
