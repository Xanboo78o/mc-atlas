// What structures and mobs actually give you. Odds are friendly tiers, not
// decimal places — 'usually' (most chests), 'common' (a good shot per chest),
// 'uncommon' (check a few chests), 'rare' (get excited), 'jackpot'.
// Bedrock loot; treat numbers as approximate across versions.

export const STRUCTURES = [
  {
    name: 'Dungeon', where: 'Small cobble room underground, mossy floor, spawner in the middle.',
    highlights: [
      { item: 'Music disc (Cat / 13)', odds: 'uncommon' },
      { item: 'Saddle', odds: 'common' },
      { item: 'Name tag', odds: 'common' },
      { item: 'Enchanted book', odds: 'uncommon' },
      { item: 'Iron horse armor', odds: 'uncommon' },
      { item: 'Golden apple', odds: 'uncommon' },
    ],
    note: 'The spawner is the real loot — cage it with torches, come back later, build the XP tower around it.',
  },
  {
    name: 'Mineshaft', where: 'Sprawling wooden tunnels underground; minecart chests scattered inside.',
    highlights: [
      { item: 'Rails + torches', odds: 'usually' },
      { item: 'Golden apple', odds: 'uncommon' },
      { item: 'Name tag', odds: 'uncommon' },
      { item: 'Enchanted book', odds: 'uncommon' },
      { item: 'Diamond', odds: 'rare' },
    ],
    note: 'Cave spider spawners live here wrapped in cobwebs — string for days if you dare.',
  },
  {
    name: 'Desert Temple', where: 'Sandstone pyramid in deserts. The loot is under the floor — mind the pressure plate.',
    highlights: [
      { item: 'Golden apple', odds: 'common' },
      { item: 'Enchanted book', odds: 'common' },
      { item: 'Diamonds', odds: 'uncommon' },
      { item: 'Emeralds', odds: 'uncommon' },
      { item: 'Enchanted golden apple', odds: 'jackpot' },
    ],
    note: 'Break the blue terracotta in the floor centre and climb down — do NOT jump down onto the plate. 9 TNT under there.',
  },
  {
    name: 'Jungle Temple', where: 'Mossy cobble temple in jungles, with arrow traps and a puzzle.',
    highlights: [
      { item: 'Emeralds', odds: 'uncommon' },
      { item: 'Diamonds', odds: 'uncommon' },
      { item: 'Enchanted book', odds: 'uncommon' },
    ],
    note: 'Two chests: one behind the lever puzzle, one behind the tripwire dispensers. Snip the tripwire with shears.',
  },
  {
    name: 'Shipwreck', where: 'Sunken (sometimes beached) ships in oceans. Up to three chests: bow, stern, cargo.',
    highlights: [
      { item: 'Treasure map', odds: 'usually (map chest)' },
      { item: 'Iron/gold ingots + nuggets', odds: 'common' },
      { item: 'Emeralds, diamonds', odds: 'uncommon' },
      { item: 'Enchanted leather gear', odds: 'uncommon' },
    ],
    note: 'The map chest’s buried treasure map is the whole point — it leads to the only guaranteed heart of the sea.',
  },
  {
    name: 'Buried Treasure', where: 'Under beaches, exactly where the shipwreck map’s X says. Dig around the X, not just on it.',
    highlights: [
      { item: 'Heart of the Sea', odds: 'always' },
      { item: 'Iron + gold ingots', odds: 'usually' },
      { item: 'Diamonds', odds: 'common' },
      { item: 'TNT', odds: 'common' },
    ],
    note: 'Heart of the Sea + 8 nautilus shells = conduit, the underwater beacon. This is the only place hearts come from.',
  },
  {
    name: 'Ocean Ruins', where: 'Small stone/sandstone ruins on the sea floor.',
    highlights: [
      { item: 'Treasure map', odds: 'common' },
      { item: 'Emeralds', odds: 'uncommon' },
      { item: 'Golden apple', odds: 'uncommon' },
    ],
    note: 'Drowned with tridents patrol these — which is also the only way to get a trident.',
  },
  {
    name: 'Igloo', where: 'Snowy biomes. Half of them hide a basement under the carpet.',
    highlights: [
      { item: 'Golden apple (basement)', odds: 'usually' },
      { item: 'Splash weakness potion (brewing stand)', odds: 'usually' },
    ],
    note: 'The basement kit is a villager-curing starter pack: weakness potion + golden apple cures the zombie villager in the cell.',
  },
  {
    name: 'Stronghold', where: 'Deep underground — follow thrown eyes of ender. Library, corridors, portal room.',
    highlights: [
      { item: 'Enchanted book (library)', odds: 'common' },
      { item: 'Ender pearl', odds: 'uncommon' },
      { item: 'Apple, bread, iron', odds: 'common' },
    ],
    note: 'Grab the library’s bookshelves with silk touch — 15 shelves is a full enchanting setup for free.',
  },
  {
    name: 'Ruined Portal', where: 'Broken nether portals anywhere in the world, with a gold-themed chest.',
    highlights: [
      { item: 'Obsidian', odds: 'common' },
      { item: 'Flint and steel', odds: 'common' },
      { item: 'Gold gear (sometimes enchanted)', odds: 'common' },
      { item: 'Golden apple', odds: 'uncommon' },
    ],
    note: 'Often just needs a few obsidian to complete the frame — the cheapest nether access in the game.',
  },
  {
    name: 'Nether Fortress', where: 'Dark brick castles in the Nether.',
    highlights: [
      { item: 'Blaze rods (from blazes — mandatory!)', odds: 'always from blazes' },
      { item: 'Diamonds', odds: 'uncommon' },
      { item: 'Obsidian', odds: 'uncommon' },
      { item: 'Horse armor + saddle', odds: 'uncommon' },
    ],
    note: 'Nether wart grows by the stairwells — take some soul sand too, it’s your entire brewing supply.',
  },
  {
    name: 'Bastion Remnant', where: 'Blackstone piglin fortresses in the Nether. Four types; treasure rooms are the prize.',
    highlights: [
      { item: 'Netherite upgrade template (treasure room)', odds: 'common' },
      { item: 'Ancient debris / netherite scrap', odds: 'uncommon' },
      { item: 'Enchanted golden apple', odds: 'rare' },
      { item: 'Gold blocks', odds: 'common' },
      { item: 'Pigstep music disc', odds: 'uncommon' },
    ],
    note: 'Wear ONE piece of gold armor and piglins hold their fire. The magma cube spawner bastion has the lodestone chest.',
  },
  {
    name: 'End City', where: 'Purpur towers in the outer End islands, past the gateway.',
    highlights: [
      { item: 'Elytra (end ship)', odds: 'always if a ship generated' },
      { item: 'Enchanted diamond gear', odds: 'common' },
      { item: 'Shulker shells (from shulkers)', odds: 'always from shulkers' },
      { item: 'Diamonds + emeralds', odds: 'common' },
    ],
    note: 'The ship also holds a dragon head on its bow. Shulker boxes alone justify the trip — bring a pickaxe and patience.',
  },
  {
    name: 'Ancient City', where: 'Huge ruined city in the deep dark, built around a warden portal frame. Sneak. Everywhere.',
    highlights: [
      { item: 'Swift Sneak enchanted book', odds: 'uncommon — ONLY source' },
      { item: 'Echo shards (recovery compass)', odds: 'common' },
      { item: 'Enchanted golden apple', odds: 'uncommon' },
      { item: 'Music disc fragments (disc 5)', odds: 'common' },
      { item: 'Sculk sensors + soul torches', odds: 'common' },
    ],
    note: 'Don’t fight the warden — nobody fights the warden. Wool-walk between chests, snip every shrieker you see with silk touch or just leave.',
  },
  {
    name: 'Trial Chambers', where: 'Copper-and-tuff dungeon complexes underground, full of trial spawners.',
    highlights: [
      { item: 'Trial keys → vault loot', odds: 'per trial completed' },
      { item: 'Ominous vaults: heavy core → mace', odds: 'rare — ominous trials only' },
      { item: 'Emeralds, enchanted books', odds: 'common' },
      { item: 'Breeze rods (from breezes)', odds: 'always from breezes' },
    ],
    note: 'Trial spawners give everyone in the party their own loot. Drink an ominous bottle before starting for the scary version and the mace parts.',
  },
  {
    name: 'Woodland Mansion', where: 'Colossal dark oak mansion in roofed forests — often thousands of blocks out. Cartographer villagers sell the map.',
    highlights: [
      { item: 'Totem of Undying (evokers)', odds: 'always from evokers' },
      { item: 'Enchanted golden apple', odds: 'uncommon' },
      { item: 'Diamond hoe (chest)', odds: 'uncommon' },
    ],
    note: 'Evokers respawn nowhere — but raids also produce them, so mansions are really a one-time loot-and-explore trip.',
  },
  {
    name: 'Pillager Outpost', where: 'Watchtower near villages, crawling with pillagers.',
    highlights: [
      { item: 'Crossbow', odds: 'common' },
      { item: 'Enchanted book', odds: 'uncommon' },
      { item: 'Goat horn (raid captains)', odds: 'uncommon' },
    ],
    note: 'Caged allays often generate beside the tower — free them and they follow you, fetching item copies forever.',
  },
  {
    name: 'Sulfur Caves', where: 'Cave biome of yellow sulfur and red cinnabar, with spikes and bubbling sulfur pools.',
    highlights: [
      { item: 'Potent sulfur (sulfur cubes, spike cores)', odds: 'common' },
      { item: 'Music disc "Bounce" — mineshaft carts down here', odds: 'rare' },
      { item: 'Sulfur + cinnabar building sets', odds: 'usually' },
    ],
    note: 'Cave spiders spawn here naturally — the first place outside a spawner they ever have. Bring milk.',
  },
  {
    name: 'Abandoned Camp (upcoming)', where: 'Coming with the dappled forest drop; generates across 17 biomes.',
    highlights: [
      { item: 'Explorer maps (8 biome + 4 structure)', odds: 'usually' },
      { item: 'Hidden oxidized copper chest', odds: 'uncommon' },
    ],
    note: 'Not in the game yet — listed so you know what to look for the day the drop lands.',
  },
  {
    name: 'Village', where: 'Chests in houses vary by building: weaponsmith, toolsmith, temple, etc.',
    highlights: [
      { item: 'Obsidian + diamond (weaponsmith)', odds: 'uncommon' },
      { item: 'Emeralds', odds: 'uncommon' },
      { item: 'Food + iron bits', odds: 'usually' },
    ],
    note: 'The villagers are worth infinitely more than the chests. Don’t rob the blacksmith and leave — set up trades.',
  },
]

export const MOBS = [
  { mob: 'Zombie', drops: ['rotten flesh'], rare: ['iron ingot', 'carrot', 'potato'], xp: 5 },
  { mob: 'Skeleton', drops: ['bones', 'arrows'], rare: ['bow (sometimes enchanted)'], xp: 5 },
  { mob: 'Creeper', drops: ['gunpowder'], rare: ['music disc — when a SKELETON kills it'], xp: 5 },
  { mob: 'Spider', drops: ['string'], rare: ['spider eye'], xp: 5 },
  { mob: 'Enderman', drops: ['ender pearl'], rare: [], xp: 5 },
  { mob: 'Witch', drops: ['redstone', 'glowstone dust', 'sugar', 'gunpowder'], rare: ['potion she was drinking'], xp: 5 },
  { mob: 'Drowned', drops: ['rotten flesh', 'copper ingot'], rare: ['trident (only if holding one)', 'nautilus shell'], xp: 5 },
  { mob: 'Husk', drops: ['rotten flesh'], rare: ['iron ingot'], xp: 5 },
  { mob: 'Stray', drops: ['bones', 'arrows'], rare: ['arrow of slowness — only source'], xp: 5 },
  { mob: 'Slime', drops: ['slimeballs (small ones)'], rare: [], xp: '1–4 per size' },
  { mob: 'Sulfur Cube', drops: ['potent sulfur'], rare: [], xp: '1–4 per size' },
  { mob: 'Magma Cube', drops: ['magma cream (small ones)'], rare: [], xp: '1–4 per size' },
  { mob: 'Blaze', drops: ['blaze rod'], rare: [], xp: 10 },
  { mob: 'Ghast', drops: ['gunpowder', 'ghast tear'], rare: [], xp: 5 },
  { mob: 'Wither Skeleton', drops: ['coal', 'bones'], rare: ['wither skeleton skull — the 3 you need'], xp: 5 },
  { mob: 'Piglin (angry)', drops: ['gold nuggets'], rare: [], xp: 5 },
  { mob: 'Hoglin', drops: ['porkchop', 'leather'], rare: [], xp: 5 },
  { mob: 'Guardian', drops: ['prismarine shards', 'prismarine crystals', 'raw cod'], rare: [], xp: 10 },
  { mob: 'Elder Guardian', drops: ['wet sponge', 'prismarine shards'], rare: [], xp: 10 },
  { mob: 'Shulker', drops: ['shulker shell'], rare: [], xp: 5 },
  { mob: 'Phantom', drops: ['phantom membrane (slow falling potions, elytra repair)'], rare: [], xp: 5 },
  { mob: 'Evoker', drops: ['totem of undying', 'emeralds'], rare: [], xp: 10 },
  { mob: 'Ravager', drops: ['saddle'], rare: [], xp: 20 },
  { mob: 'Breeze', drops: ['breeze rods (wind charges, mace)'], rare: [], xp: 10 },
  { mob: 'Warden', drops: ['sculk catalyst'], rare: [], xp: 5 },
  { mob: 'Ender Dragon', drops: ['a LOT of XP', 'dragon egg (first kill)'], rare: [], xp: '12,000 first kill' },
  { mob: 'Wither', drops: ['nether star (beacon)'], rare: [], xp: 50 },
]
