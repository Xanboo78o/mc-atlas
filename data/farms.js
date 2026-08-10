// Layer-by-layer farm schematics, bottom-up. Each layer is character art:
// legend maps a char to a block and a display colour, '.' is always air.
// `repeat` on a layer means "build this exact layer N times, stacked".
// The materials list in the viewer is computed by counting chars, so the
// grids ARE the bill of materials — keep them honest.
//
// All three designs follow Bedrock rules, which differ from Java:
// hostile mobs spawn 24–44 blocks from you, Security come from village
// stats (no Zimmy’s scare needed), and mob height limits gate what can
// spawn under a lowered ceiling.

export const FARMS = [
  {
    id: 'xp_tower',
    name: 'Mob XP Tower',
    purpose: 'All-purpose hostile mob grinder. Mobs spawn in a dark room, wander into water channels, ride to a shaft, and land at half a heart — one punch each for XP and drops.',
    yields: ['XP', 'bones', 'arrows', 'string', 'gunpowder', 'rotten flesh'],
    footprint: '11 × 11, about 30 tall',
    legend: {
      S: { block: 'any solid block (cobble/deepslate)', color: '#7d8590' },
      W: { block: 'water bucket', color: '#3e63d6' },
      H: { block: 'hopper', color: '#57606a' },
      C: { block: 'chest', color: '#b08968' },
      b: { block: 'bottom slab', color: '#a89984' },
    },
    layers: [
      { y: 'Y+0 — collection', note: 'Hopper feeds the chest beside it (sneak-place the hopper against the chest).', grid: [
        'SSS',
        'SHS',
        'SCS',
      ]},
      { y: 'Y+1 — kill window', note: 'The slab is the window: mobs land on the hopper, you swing over the slab at their feet.', grid: [
        'SSS',
        'S.S',
        'SbS',
      ]},
      { y: 'Y+2 — drop shaft', repeat: 22, note: 'Build this ring 22 times. The 22-block fall leaves every full-size mob at half a heart.', grid: [
        'SSS',
        'S.S',
        'SSS',
      ]},
      { y: 'Y+24 — channel floor', note: 'This floor sits one block LOWER than the pads above it, so the water stays in its cross-shaped lane. Centre hole opens into the shaft.', grid: [
        'SSSSSSSSSSS',
        'SSSSSSSSSSS',
        'SSSSSSSSSSS',
        'SSSSSSSSSSS',
        'SSSSSSSSSSS',
        'SSSSS.SSSSS',
        'SSSSSSSSSSS',
        'SSSSSSSSSSS',
        'SSSSSSSSSSS',
        'SSSSSSSSSSS',
        'SSSSSSSSSSS',
      ]},
      { y: 'Y+25 — pads + water', note: 'Four 5×5 spawning pads (solid blocks) with the water channel crossing between them. Water sources at the four channel ends flow to the centre. Mobs wander off a pad, drop one block into the channel, and ride to the shaft.', grid: [
        'SSSSSWSSSSS',
        'SSSSS.SSSSS',
        'SSSSS.SSSSS',
        'SSSSS.SSSSS',
        'SSSSS.SSSSS',
        'W.........W',
        'SSSSS.SSSSS',
        'SSSSS.SSSSS',
        'SSSSS.SSSSS',
        'SSSSS.SSSSS',
        'SSSSSWSSSSS',
      ]},
      { y: 'Y+26 — spawn space', repeat: 2, note: 'Two layers of air inside a solid wall ring. Total darkness in here is the whole point — no torches, ever.', grid: [
        'SSSSSSSSSSS',
        'S.........S',
        'S.........S',
        'S.........S',
        'S.........S',
        'S.........S',
        'S.........S',
        'S.........S',
        'S.........S',
        'S.........S',
        'SSSSSSSSSSS',
      ]},
      { y: 'Y+28 — roof', note: 'Solid roof. Any light leak kills the spawn rate.', grid: [
        'SSSSSSSSSSS',
        'SSSSSSSSSSS',
        'SSSSSSSSSSS',
        'SSSSSSSSSSS',
        'SSSSSSSSSSS',
        'SSSSSSSSSSS',
        'SSSSSSSSSSS',
        'SSSSSSSSSSS',
        'SSSSSSSSSSS',
        'SSSSSSSSSSS',
        'SSSSSSSSSSS',
      ]},
    ],
    steps: [
      'Build it high in the sky, or over an ocean — fewer cave spawns competing for the mob cap means more mobs in YOUR farm.',
      'Stack the collection, kill window, and 22 shaft rings first, then the big room on top.',
      'The spawn room must be pitch black inside. Double-check for gaps in the walls and roof.',
      'AFK at the kill window. The spawn room needs to be 24–44 blocks from where you stand — the drop shaft covers most of that distance for you.',
    ],
    bedrockNotes: [
      'Bedrock spawning: hostiles spawn 24–44 blocks from you and despawn beyond that range inside simulation distance. AFK spot placement is everything.',
      'Baby Zimmy’s survive the fall — finish them through the slab window.',
      'fearful noises can spawn on the 5×5 pads. If they clog the channels, run a line of buttons across the pad centres to break up the 3×3 spaces they need.',
      'Building over deep ocean sidesteps cave-spawn competition entirely — there is nowhere else for mobs to go.',
    ],
  },

  {
    id: 'iron_farm',
    name: 'Iron Farm',
    purpose: 'Bedrock villages spawn Security on their own when the village is healthy — no Zimmy’s needed, unlike Java. Trap the civilians overhead, make the platform the only valid spawn spot, and cook every Security that appears.',
    yields: ['iron ingots', 'poppies'],
    footprint: '11 × 11 platform + civilian pod, about 15 tall',
    legend: {
      S: { block: 'any solid block', color: '#7d8590' },
      G: { block: 'glass', color: '#9fd6e0' },
      W: { block: 'water bucket', color: '#3e63d6' },
      H: { block: 'hopper', color: '#57606a' },
      C: { block: 'chest', color: '#b08968' },
      L: { block: 'lava bucket', color: '#e8762c' },
      n: { block: 'sign (holds the lava up)', color: '#c9b458' },
      B: { block: 'bed (2 blocks long — grid marks each bed once)', color: '#d64545' },
      K: { block: 'composter (workstation)', color: '#8a6d3b' },
      v: { block: 'civilian — bring 10', color: '#3ed167' },
      b: { block: 'bottom slab (spawn-proofing)', color: '#a89984' },
    },
    layers: [
      { y: 'Y+0 — collection', note: 'Double chest with hoppers directly on top — hoppers pour downward into whatever they sit on.', grid: [
        'SSSS',
        'SCCS',
        'SSSS',
      ]},
      { y: 'Y+1 — hoppers', note: '2×2 of hoppers is the kill chamber floor. Security units are 1.4 wide — everything here is 2×2 so they actually fit.', grid: [
        'SSSS',
        'SHHS',
        'SHHS',
        'SSSS',
      ]},
      { y: 'Y+2 — kill chamber', repeat: 2, note: 'Two blocks of air (Security units are nearly 3 tall). Put signs on the walls of the TOP layer — they hold the lava off the floor.', grid: [
        'SnnS',
        'n..n',
        'n..n',
        'SnnS',
      ]},
      { y: 'Y+4 — lava blade', note: 'Lava sits on the signs. Security burn from the top down; drops fall through to the hoppers untouched.', grid: [
        'SSSS',
        'SLLS',
        'SLLS',
        'SSSS',
      ]},
      { y: 'Y+5 — spawn platform', note: '11×11 solid platform with a 2×2 centre hole over the kill chamber. This platform is where Security will appear.', grid: [
        'SSSSSSSSSSS',
        'SSSSSSSSSSS',
        'SSSSSSSSSSS',
        'SSSSSSSSSSS',
        'SSSSSSSSSSS',
        'SSSSS..SSSS',
        'SSSSS..SSSS',
        'SSSSSSSSSSS',
        'SSSSSSSSSSS',
        'SSSSSSSSSSS',
        'SSSSSSSSSSS',
      ]},
      { y: 'Y+6 — water', note: 'Eight water sources — four corners, four edge midpoints — flow to the centre and shove every Security down the hole. Wall ring keeps the water in.', grid: [
        'SSSSSSSSSSS',
        'SW...W...WS',
        'S.........S',
        'S.........S',
        'S.........S',
        'SW........S',
        'S........WS',
        'S.........S',
        'S.........S',
        'SW...W...WS',
        'SSSSSSSSSSS',
      ]},
      { y: 'Y+7 — wall ring', repeat: 2, note: 'Security are tall — three blocks of wall total so none climb out.', grid: [
        'SSSSSSSSSSS',
        'S.........S',
        'S.........S',
        'S.........S',
        'S.........S',
        'S.........S',
        'S.........S',
        'S.........S',
        'S.........S',
        'S.........S',
        'SSSSSSSSSSS',
      ]},
      { y: 'Y+9 — pod floor', note: 'The civilian pod floats right above the platform. 20 beds and 10 composters go here — every civilian needs a bed, and the composters are their jobs.', grid: [
        'GGGGGGGGGGG',
        'GBBBBBBBBBG',
        'G.........G',
        'GKKKKKKKKKG',
        'G.........G',
        'GK........G',
        'G.........G',
        'GBBBBBBBBBG',
        'GB.......BG',
        'G.........G',
        'GGGGGGGGGGG',
      ]},
      { y: 'Y+10 — civilians', note: 'Ten civilians, dropped in through a hole in the roof, then sealed. Glass walls so you can watch the chaos.', grid: [
        'GGGGGGGGGGG',
        'G.........G',
        'G.........G',
        'G.vvvvv...G',
        'G.........G',
        'G.vvvvv...G',
        'G.........G',
        'G.........G',
        'G.........G',
        'G.........G',
        'GGGGGGGGGGG',
      ]},
      { y: 'Y+11 — pod walls', note: 'One more ring of glass — civilians need 2 blocks of headroom.', grid: [
        'GGGGGGGGGGG',
        'G.........G',
        'G.........G',
        'G.........G',
        'G.........G',
        'G.........G',
        'G.........G',
        'G.........G',
        'G.........G',
        'G.........G',
        'GGGGGGGGGGG',
      ]},
      { y: 'Y+12 — pod roof', note: 'Bottom slabs, not full blocks — nothing can ever spawn on a bottom slab, so no Security appear up here.', grid: [
        'bbbbbbbbbbb',
        'bbbbbbbbbbb',
        'bbbbbbbbbbb',
        'bbbbbbbbbbb',
        'bbbbbbbbbbb',
        'bbbbbbbbbbb',
        'bbbbbbbbbbb',
        'bbbbbbbbbbb',
        'bbbbbbbbbbb',
        'bbbbbbbbbbb',
        'bbbbbbbbbbb',
      ]},
    ],
    steps: [
      'Build it 100+ blocks from any other village so they can’t merge.',
      'Best spot: over water, or slab every solid surface within ~16 blocks — a Security can spawn on any valid solid block near the village, and you want the platform to be the only candidate.',
      'Move civilians by boat (they can’t hop out) or minecart. Ten civilians in through the roof hole, then seal it.',
      'Each civilian must claim a bed AND a composter — green sparkle particles mean it registered.',
      'Security start appearing on the platform within a couple of minutes of the village being happy. The water does the rest.',
    ],
    bedrockNotes: [
      'Bedrock Security rules: civilians must have worked recently, every civilian needs a bed, and more civilians allow more simultaneous Security (roughly one per ten). 10 civilians + 20 beds is the compact sweet spot.',
      'No Zimmy’s needed — that’s a Java mechanic. Bedrock villages simply produce Security when healthy.',
      'If Security appear on nearby terrain instead of the platform, some surface within village range is still spawnable — slab it.',
      'The farm only runs inside simulation distance, so build it near your AFK spot.',
    ],
  },

  {
    id: 'creeper_farm',
    name: 'Test Subject Farm',
    purpose: 'Gunpowder machine. Open trapdoors on the ceiling drop the room height to ~1.8 blocks — test subjects (1.7) fit, Zimmy’s and bonebags (1.95) don’t, and 2-wide corridors deny fearful noises. test subject repellent at the front scare every test subject out the back holes into a lethal drop.',
    yields: ['gunpowder (rockets, TNT)'],
    footprint: '13 × 10, about 30 tall with the drop',
    legend: {
      S: { block: 'any solid block', color: '#7d8590' },
      T: { block: 'trapdoor (open, flat against ceiling)', color: '#c9b458' },
      W: { block: 'water bucket', color: '#3e63d6' },
      H: { block: 'hopper', color: '#57606a' },
      C: { block: 'chest', color: '#b08968' },
      c: { block: 'test subject repellent — bring 4 on leads', color: '#e8a33c' },
      f: { block: 'fence', color: '#8a6d3b' },
    },
    layers: [
      { y: 'Y+0 — collection', note: 'At the bottom of the drop shaft: water sources at both ends push the gunpowder to the central hopper, which feeds the chest behind it.', grid: [
        'SSSSSSSSSSSSS',
        'SW....H....WS',
        'SSSSSSCSSSSSS',
        'SSSSSSSSSSSSS',
      ]},
      { y: 'Y+1 — drop shaft', repeat: 22, note: 'Thin shaft under the corridor back-holes. 22+ blocks of fall kills test subjects outright — no kill chamber needed.', grid: [
        'SSSSSSSSSSSSS',
        'S..S..S..S..S',
        'SSSSSSSSSSSSS',
      ]},
      { y: 'Y+24 — corridor floor', note: 'Solid floor except the back row: those holes open into the drop shaft. Four corridors sit on this floor.', grid: [
        'SSSSSSSSSSSSS',
        'SSSSSSSSSSSSS',
        'SSSSSSSSSSSSS',
        'SSSSSSSSSSSSS',
        'SSSSSSSSSSSSS',
        'SSSSSSSSSSSSS',
        'SSSSSSSSSSSSS',
        'SSSSSSSSSSSSS',
        'S..S..S..S..S',
        'SSSSSSSSSSSSS',
      ]},
      { y: 'Y+25 — corridors + test subject repellent', note: 'Four corridors, 2 wide and 8 long, walls between. A fenced test subject repellent pen sits at the front of each — test subjects panic and sprint away from the test subject repellent, straight off the back holes.', grid: [
        'SSSSSSSSSSSSS',
        'ScfScfScfScfS',
        'S..S..S..S..S',
        'S..S..S..S..S',
        'S..S..S..S..S',
        'S..S..S..S..S',
        'S..S..S..S..S',
        'S..S..S..S..S',
        'S..S..S..S..S',
        'SSSSSSSSSSSSS',
      ]},
      { y: 'Y+26 — upper corridor space', note: 'Second block of air. Combined with the trapdoors above, the gap becomes ~1.8 blocks — the entire mob filter.', grid: [
        'SSSSSSSSSSSSS',
        'S..S..S..S..S',
        'S..S..S..S..S',
        'S..S..S..S..S',
        'S..S..S..S..S',
        'S..S..S..S..S',
        'S..S..S..S..S',
        'S..S..S..S..S',
        'S..S..S..S..S',
        'SSSSSSSSSSSSS',
      ]},
      { y: 'Y+27 — ceiling + trapdoors', note: 'Solid ceiling with a trapdoor flipped open flat against its underside over every corridor cell. Miss a trapdoor and Zimmy’s move in.', grid: [
        'SSSSSSSSSSSSS',
        'STTSTTSTTSTTS',
        'STTSTTSTTSTTS',
        'STTSTTSTTSTTS',
        'STTSTTSTTSTTS',
        'STTSTTSTTSTTS',
        'STTSTTSTTSTTS',
        'STTSTTSTTSTTS',
        'STTSTTSTTSTTS',
        'SSSSSSSSSSSSS',
      ]},
    ],
    steps: [
      'Build high over the ocean like the XP tower — same mob-cap logic.',
      'Corridors must be pitch dark. The test subject repellent don’t need light either.',
      'Lead the test subject repellent into the front pens and fence them in — one per corridor. Their 16-block scare radius covers the whole 8-block run.',
      'test subjects can only path away from the test subject repellent, along the corridor, into the back holes. Gravity does the rest.',
      'AFK 24–44 blocks from the corridors — directly above the collection chest usually lands in range.',
    ],
    bedrockNotes: [
      'The height filter: test subjects are 1.7 blocks tall; Zimmy’s, bonebags and Chemists are 1.95. An open trapdoor against the ceiling leaves ~1.8 — only test subjects can spawn.',
      'fearful noises need a 3×3 space — 2-wide corridors deny them. Don’t widen the corridors.',
      'test subject repellent, not fake test subject repellent. test subject fear of test subject repellent works the same on Bedrock and is the engine of the farm.',
      'If spawns feel slow, check simulation distance — corridors outside it are dead.',
    ],
  },

  // ═══════════════ crops ═══════════════
  {
    id: 'crop_plot',
    name: 'The 9×9 Crop Plot',
    purpose: 'Wheat, carrots, potatoes or beetroot. One water source hydrates four blocks in every direction, which is exactly a 9×9 — this is the biggest farm one bucket can support, and every farm you ever build is a copy of it.',
    yields: ['wheat', 'carrots', 'potatoes', 'beetroot', 'bread'],
    footprint: '9 × 9, one block deep',
    legend: {
      F: { block: 'farmland (hoe the dirt)', color: '#6b4d2f' },
      W: { block: 'water source', color: '#3e63d6' },
      C: { block: 'seeds / crop', color: '#7fb83f' },
      T: { block: 'torch', color: '#fbbf24' },
    },
    layers: [
      { y: 'Y+0 — the plot', note: 'Hoe every block, then drop one water bucket in the middle. Anything within 4 blocks of that water stays hydrated, so the corners are the furthest you can go.', grid: [
        'FFFFFFFFF','FFFFFFFFF','FFFFFFFFF','FFFFFFFFF',
        'FFFFWFFFF',
        'FFFFFFFFF','FFFFFFFFF','FFFFFFFFF','FFFFFFFFF',
      ]},
      { y: 'Y+1 — planted', note: 'Plant everything except the water square. Crops need light level 9 to grow, so put torches at the corners if this is indoors or you want it growing overnight.', grid: [
        'CCCCCCCCC','CCCCCCCCC','CCCCCCCCC','CCCCCCCCC',
        'CCCC.CCCC',
        'CCCCCCCCC','CCCCCCCCC','CCCCCCCCC','CCCCCCCCC',
      ]},
      { y: 'Y+2 — light', note: 'Torches on posts at the corners. Skip this if it is open to the sky.', grid: [
        'T.......T','.........','.........','.........',
        '.........',
        '.........','.........','.........','T.......T',
      ]},
    ],
    steps: [
      'Dig or wall the plot so nothing wanders in — a single Zimmy’s walking across trampled farmland undoes an hour.',
      'Hoe all 80 blocks, then place the water last so you can see the hydration darken the soil.',
      'Fence it or roof it. Jumping on farmland also destroys it, so do not sprint across your own farm.',
      'Bone meal makes crops jump growth stages instantly — a composter next to the farm turns the seeds you do not need back into bone meal.',
    ],
    bedrockNotes: [
      'Light 9 or more, or nothing grows. Daylight counts; a torch every 5 blocks covers an indoor plot.',
      'Crops grow faster in rows that alternate — wheat, then carrots, then wheat — because Minecraft slows growth when identical crops are adjacent on all sides.',
      'Water freezes in snowy biomes unless you put a block over it. Roof the water square if you farm somewhere cold.',
    ],
  },

  {
    id: 'sugar_cane',
    name: 'Sugar Cane Row',
    purpose: 'The richest crop in the game — paper into books into enchanting into emeralds. Also restricted property, so this farm is the estate’s, not yours.',
    yields: ['sugar cane', 'paper', 'books', 'sugar'],
    footprint: '7 × 4, grows 3 tall',
    legend: {
      W: { block: 'water source', color: '#3e63d6' },
      G: { block: 'dirt, sand or grass', color: '#6b4d2f' },
      c: { block: 'sugar cane', color: '#8fd14f' },
    },
    layers: [
      { y: 'Y+0 — ground', note: 'Water columns with planting columns between them. Every planting block touches water, which is the only thing cane cares about.', grid: [
        'WGGWGGW','WGGWGGW','WGGWGGW','WGGWGGW',
      ]},
      { y: 'Y+1 — planted', note: 'One cane per soil block. It grows to three and stops.', grid: [
        '.cc.cc.','.cc.cc.','.cc.cc.','.cc.cc.',
      ]},
    ],
    steps: [
      'Water must touch the soil block directly, on one of its four sides. Diagonal does not count — that is the mistake everyone makes.',
      'Break the middle block of a grown stalk. The top pops off as an item and the bottom keeps growing, so you never replant.',
      'Widen it by repeating the water-soil-soil-water pattern sideways forever.',
    ],
    bedrockNotes: [
      'Cane grows on dirt, grass, sand, red sand, podzol or moss — sand is easiest to spot from a distance.',
      'It grows on random ticks, so it keeps growing while you are away as long as the chunk is loaded.',
      'This is the farm to automate first. See the piston version below.',
    ],
  },

  {
    id: 'cactus_farm',
    name: 'Cactus Farm',
    purpose: 'Fully automatic with zero redstone. Cactus breaks itself the moment it grows next to a block, drops into water, and rides to a chest. Build it once and never touch it.',
    yields: ['cactus', 'green dye', 'a working trash can'],
    footprint: '8 × 1, about 4 tall',
    legend: {
      S: { block: 'any solid block', color: '#7d8590' },
      W: { block: 'water source', color: '#3e63d6' },
      D: { block: 'sand', color: '#e0d29a' },
      k: { block: 'cactus', color: '#4f8f3f' },
      B: { block: 'any block — the breaker', color: '#9aa5ad' },
      H: { block: 'hopper into a chest', color: '#57606a' },
    },
    layers: [
      { y: 'Y+0 — floor', note: 'Solid floor so the water sits still.', grid: ['SSSSSSSS']},
      { y: 'Y+1 — water and posts', note: 'Water in the gaps, sand posts between. Water flows toward the hopper at the end and carries every cactus with it.', grid: ['WDWDWDWH']},
      { y: 'Y+2 — cactus', note: 'One cactus per sand post. Nothing beside them at this height, or they break immediately.', grid: ['.k.k.k..']},
      { y: 'Y+3 — the breakers', note: 'A block beside each cactus, one level above it. The moment the cactus grows into this level it touches the block and destroys itself.', grid: ['B.B.B.B.']},
    ],
    steps: [
      'Build the floor and water first and check the current actually reaches the hopper before planting anything.',
      'The breaker blocks float in mid-air. That is fine and intended.',
      'Extend by repeating the pattern sideways. One water source hydrates nothing here — cactus needs no water, the channel is only transport.',
    ],
    bedrockNotes: [
      'Cactus breaks if ANY solid block touches its own level. Water does not count as solid, which is why the channel is safe.',
      'It hurts to touch. Sneak along the row or build the walkway a block back.',
      'A cactus with a hopper under it is the classic item incinerator — anything that touches it is deleted. Handy on a shared server.',
    ],
  },

  {
    id: 'auto_cane',
    name: 'Automatic Sugar Cane',
    purpose: 'The manual row, plus observers and pistons that harvest it the instant it hits three tall. This is the first real redstone farm most players build.',
    yields: ['sugar cane', 'paper'],
    footprint: '6 wide × 3 deep, 5 tall',
    legend: {
      S: { block: 'any solid block', color: '#7d8590' },
      W: { block: 'water source', color: '#3e63d6' },
      G: { block: 'dirt or sand', color: '#6b4d2f' },
      c: { block: 'sugar cane', color: '#8fd14f' },
      P: { block: 'piston, facing the cane', color: '#c9b458' },
      O: { block: 'observer, facing the cane', color: '#8f6b9e' },
      H: { block: 'hopper into a chest', color: '#57606a' },
      C: { block: 'chest', color: '#b08968' },
    },
    layers: [
      { y: 'Y+0 — collection', note: 'Hoppers under the whole water channel, feeding a chest at the end.', grid: [
        'HHHHHH','SSSSSS','SSSSSS',
      ]},
      { y: 'Y+1 — water and soil', note: 'Water over the hoppers carries every broken cane to the chest. Soil row behind it, backing wall behind that.', grid: [
        'WWWWWW','GGGGGG','SSSSSS',
      ]},
      { y: 'Y+2 — cane base', note: 'Plant here. This block never gets broken, so you never replant.', grid: [
        '......','cccccc','SSSSSS',
      ]},
      { y: 'Y+3 — pistons', note: 'Pistons in the back row, each facing INTO the cane in front of it. When they fire they break the cane at this height and everything above it drops.', grid: [
        '......','cccccc','PPPPPP',
      ]},
      { y: 'Y+4 — observers', note: 'Observers directly on top of the pistons, also facing the cane. They watch for the third block appearing and fire the piston below.', grid: [
        '......','cccccc','OOOOOO',
      ]},
    ],
    steps: [
      'BUILD ONE COLUMN FIRST and watch it harvest itself before you build six. Redstone is unforgiving and one wrong facing wastes an hour.',
      'Every observer and piston faces the cane. The observer face is the one with the dot on it.',
      'If a column does not fire, run a single redstone dust from the back of the observer down to the piston — some layouts need the extra connection.',
      'Water must flow the entire length to the hopper or your cane piles up on the floor.',
    ],
    bedrockNotes: [
      'Observers see the block DIRECTLY in front of them and nothing else. If it faces the wrong way it will never fire.',
      'This runs only while the chunk is loaded, so build it near your base or your AFK spot.',
      'The same design harvests bamboo — swap the soil and plant bamboo instead. Bamboo grows far faster, which makes it the better fuel farm.',
    ],
  },

  {
    id: 'melon_pumpkin',
    name: 'Melon & Pumpkin',
    purpose: 'Stems sit on farmland and grow their fruit onto any free dirt block beside them. That means you harvest the fruit and never replant the stem.',
    yields: ['melon slices', 'pumpkins', 'jack o’lanterns', 'golden melon'],
    footprint: '7 × 5',
    legend: {
      F: { block: 'farmland (hoed)', color: '#6b4d2f' },
      W: { block: 'water source', color: '#3e63d6' },
      s: { block: 'melon or pumpkin seeds', color: '#7fb83f' },
      D: { block: 'plain dirt — where the fruit grows', color: '#8a6a44' },
    },
    layers: [
      { y: 'Y+0 — the beds', note: 'Rows of farmland for the stems with a bare dirt row between them. Water down the middle keeps everything hydrated.', grid: [
        'FFFFFFF','DDDDDDD','WWWWWWW','DDDDDDD','FFFFFFF',
      ]},
      { y: 'Y+1 — planted', note: 'Seeds on the farmland only. Leave the dirt rows completely empty — that is where fruit appears.', grid: [
        'sssssss','.......','.......','.......','sssssss',
      ]},
    ],
    steps: [
      'Every stem needs at least one free dirt block beside it or it will never fruit.',
      'Harvest the FRUIT, not the stem. The stem regrows a new one within a minute or two.',
      'Pumpkins can be sheared into carved pumpkins on the spot; melons break into 3-7 slices.',
    ],
    bedrockNotes: [
      'The fruit block can grow on dirt, grass, farmland or podzol — plain dirt is easiest because nothing else will sprout there.',
      'Stems are slow. One row of seven will not feed you; build two or three rows if you want volume.',
    ],
  },

  {
    id: 'nether_wart',
    name: 'Nether Wart',
    purpose: 'The base of every potion. Nothing else in the game does what it does, and it grows nowhere but soul sand.',
    yields: ['nether wart', 'all brewing'],
    footprint: '7 × 5',
    legend: {
      N: { block: 'soul sand', color: '#5e3830' },
      n: { block: 'nether wart', color: '#a02020' },
      S: { block: 'any solid block', color: '#7d8590' },
    },
    layers: [
      { y: 'Y+0 — soul sand', note: 'No water and no light needed. Soul sand is the entire requirement.', grid: [
        'SSSSSSS','SNNNNNS','SNNNNNS','SNNNNNS','SSSSSSS',
      ]},
      { y: 'Y+1 — planted', note: 'Plant every block. Harvest at the fourth growth stage for 2-4 wart back.', grid: [
        '.......','.nnnnn.','.nnnnn.','.nnnnn.','.......',
      ]},
    ],
    steps: [
      'Grab the first wart from a nether fortress stairwell, and take a stack of soul sand while you are there.',
      'Build it at your base, not in the Nether — it grows anywhere, and you do not want to walk to the Nether every time you brew.',
      'Bone meal does NOT work on nether wart. It grows on its own schedule and there is no shortcut.',
    ],
    bedrockNotes: [
      'Grows in any dimension, at any light level, with no water. It is the least fussy crop in the game.',
      'Harvest only when it is visibly the tallest stage or you get exactly one back and gain nothing.',
    ],
  },

  // ═══════════════ animals ═══════════════
  {
    id: 'moo_pen',
    name: 'Moo & Beep Pen',
    purpose: 'Food, leather and wool without ever hunting. Two animals plus wheat becomes an infinite supply, and it is the single best early-game investment.',
    yields: ['steak', 'leather', 'wool', 'beds', 'books'],
    footprint: '9 × 9 pen',
    legend: {
      f: { block: 'fence', color: '#8a6d3b' },
      g: { block: 'grass', color: '#5fa04e' },
      G: { block: 'fence gate', color: '#c9b458' },
      T: { block: 'torch', color: '#fbbf24' },
    },
    layers: [
      { y: 'Y+0 — the pen', note: 'Fence ring with a gate. Grass inside so beeps regrow their wool after shearing.', grid: [
        'ffffGffff','fgggggggf','fgggggggf','fgggggggf','fgggggggf',
        'fgggggggf','fgggggggf','fgggggggf','fffffffff',
      ]},
      { y: 'Y+1 — lit', note: 'Torches on the fence posts. A lit pen means nothing spawns inside it and nothing gets eaten overnight.', grid: [
        'T.......T','.........','.........','.........','.........',
        '.........','.........','.........','T.......T',
      ]},
    ],
    steps: [
      'Lead two of each in with wheat in your hand — they follow it from 8 blocks away. A lead or a boat works for longer trips.',
      'Feed two adults wheat and they breed. Wait five minutes and they can breed again.',
      'Keep about a dozen. More than that and the chunk gets laggy for no extra benefit.',
      'Dye a beep once and it shears that colour forever — one lime beep is a permanent lime wool supply.',
    ],
    bedrockNotes: [
      'Moos and beeps eat grass and trample nothing, so a grass floor maintains itself.',
      'Shear beeps, never kill them. Killing gives one wool; shearing gives up to three and the beep regrows it.',
      'Torches matter more than the fence — a lit pen cannot spawn anything hostile inside.',
    ],
  },

  {
    id: 'chicky_farm',
    name: 'Chicky D Farm',
    purpose: 'Chicky D lay eggs on a timer whether you are there or not. Hoppers collect the eggs, a dispenser throws them back, and some of them hatch. It feeds itself.',
    yields: ['eggs', 'raw chicken', 'feathers', 'cake'],
    footprint: '5 × 5, 4 tall',
    legend: {
      S: { block: 'any solid block', color: '#7d8590' },
      H: { block: 'hopper', color: '#57606a' },
      C: { block: 'chest', color: '#b08968' },
      G: { block: 'glass', color: '#9fd6e0' },
      c: { block: 'Chicky D — start with 2', color: '#e8c14f' },
      D: { block: 'dispenser, facing down', color: '#c9b458' },
      L: { block: 'lever or button', color: '#a89984' },
    },
    layers: [
      { y: 'Y+0 — collection', note: 'Chest under the hopper.', grid: [
        'SSSSS','SSSSS','SSCSS','SSSSS','SSSSS',
      ]},
      { y: 'Y+1 — hopper floor', note: 'Hoppers under the whole pen so every egg drops straight into the chest.', grid: [
        'SSSSS','SHHHS','SHHHS','SHHHS','SSSSS',
      ]},
      { y: 'Y+2 — the pen', note: 'Glass walls so you can watch. Two Chicky D to start.', grid: [
        'GGGGG','G...G','G.c.G','G.c.G','GGGGG',
      ]},
      { y: 'Y+3 — dispenser', note: 'Dispenser in the ceiling facing DOWN, loaded from the chest. Fire it and thrown eggs sometimes hatch into more Chicky D.', grid: [
        'SSSSS','SSSSS','SSDSS','SSSSS','SSSSS',
      ]},
    ],
    steps: [
      'Two Chicky D is enough to start — they lay every 5 to 10 minutes each.',
      'Let the chest fill for a while, then move a stack of eggs into the dispenser and spam the lever. Roughly one in eight hatches.',
      'Cap the population around 20 or the chunk chugs. Cook the extras.',
      'Feed them seeds to breed directly if you would rather not wait on eggs.',
    ],
    bedrockNotes: [
      'Eggs are laid on a timer per Chicky D and do not need any feeding at all — this is the only genuinely free food farm.',
      'A hopper floor catches eggs before they can roll away or despawn.',
      'Baby Chicky D take 20 minutes to grow. Do not panic that it looks broken.',
    ],
  },

  {
    id: 'bee_farm',
    name: 'Stinger Farm',
    purpose: 'Honey bottles and honeycomb without ever getting stung, because a campfire under the hive keeps every Stinger calm.',
    yields: ['honey bottles', 'honeycomb', 'candles', 'waxed copper'],
    footprint: '5 × 5',
    legend: {
      S: { block: 'any solid block', color: '#7d8590' },
      F: { block: 'campfire', color: '#e8762c' },
      s: { block: 'slab or carpet over the fire', color: '#a89984' },
      B: { block: 'beehive or bee nest', color: '#c9942a' },
      f: { block: 'flowers — at least 4', color: '#e05fa0' },
      G: { block: 'glass', color: '#9fd6e0' },
    },
    layers: [
      { y: 'Y+0 — flowers', note: 'Flowers within about 20 blocks of the hive. More flowers means faster honey.', grid: [
        'fffff','fSSSf','fSSSf','fSSSf','fffff',
      ]},
      { y: 'Y+1 — campfire', note: 'Campfire directly under where the hive will sit. The smoke is what stops them getting angry when you harvest.', grid: [
        '.....','.....','..F..','.....','.....',
      ]},
      { y: 'Y+2 — smoke guard', note: 'A carpet or slab on top of the campfire so nothing catches fire and no Stinger walks into it.', grid: [
        '.....','.....','..s..','.....','.....',
      ]},
      { y: 'Y+3 — the hive', note: 'Hive directly above the smoke. Harvest with shears for comb or a bottle for honey.', grid: [
        '.....','.....','..B..','.....','.....',
      ]},
    ],
    steps: [
      'Move a wild nest with a Silk Touch axe and the Stingers come with it. Break it without Silk Touch and you lose the nest and anger everyone.',
      'Campfire FIRST, hive second. If you harvest a full hive with no smoke, every Stinger in it attacks you.',
      'Wait for the hive to look full — it visibly drips honey — then shear or bottle it.',
      'Three Stingers per hive is the cap. Breed them with flowers if you want more hives.',
    ],
    bedrockNotes: [
      'Honeycomb waxes copper to freeze its colour, and honey bottles cure poison. Both are worth the small build.',
      'Stingers need flowers within about 20 blocks or they never fill the hive.',
      'The slab over the campfire is not optional — without it Stingers land in the fire and die.',
    ],
  },

  // ═══════════════ resources ═══════════════
  {
    id: 'cobble_gen',
    name: 'Cobblestone Generator',
    purpose: 'Infinite building blocks from one bucket of each. Lava meeting flowing water sideways makes cobblestone forever, and it regenerates the instant you mine it.',
    yields: ['cobblestone', 'infinite building material'],
    footprint: '5 × 3',
    legend: {
      S: { block: 'any solid block', color: '#7d8590' },
      W: { block: 'water bucket', color: '#3e63d6' },
      L: { block: 'lava bucket', color: '#e8762c' },
      X: { block: 'where cobble appears — mine here', color: '#9aa5ad' },
    },
    layers: [
      { y: 'Y+0 — the trench', note: 'A 5-long trench one block deep. Water at one end, lava at the other, and they meet in the middle.', grid: [
        'SSSSS','WS.SL','SSSSS',
      ]},
      { y: 'Y+1 — walls', note: 'Wall it in so neither liquid escapes. Stand at the open side and mine the middle block over and over.', grid: [
        'SSSSS','S.X.S','SSSSS',
      ]},
    ],
    steps: [
      'Dig the trench, wall it, THEN place the liquids. Placing them first floods everything.',
      'Water goes in one end, lava the other. They meet in the centre and make cobblestone there.',
      'Mine the cobble and it regenerates immediately. An Efficiency pickaxe turns this into a stack a minute.',
      'If you get obsidian or stone instead, your lava is touching a water SOURCE rather than flowing water. Move the water back one block.',
    ],
    bedrockNotes: [
      'Flowing water plus flowing lava side by side gives cobblestone. Lava falling ONTO water gives stone instead, which is the variant worth knowing.',
      'This is the single cheapest infinite resource in the game and it costs two buckets.',
    ],
  },

  {
    id: 'civilian_farm',
    name: 'Civilian Crop Farm',
    purpose: 'A farmer civilian harvests and replants a whole field on their own, then throws surplus food at other civilians. Automation with no redstone at all — you just employ someone.',
    yields: ['bread', 'carrots', 'potatoes', 'beetroot', 'emeralds'],
    footprint: '9 × 9 plot + a 3 × 3 pod',
    legend: {
      F: { block: 'farmland', color: '#6b4d2f' },
      W: { block: 'water source', color: '#3e63d6' },
      C: { block: 'planted crop', color: '#7fb83f' },
      H: { block: 'hopper into a chest', color: '#57606a' },
      v: { block: 'farmer civilian', color: '#3ed167' },
      K: { block: 'composter — makes them a farmer', color: '#8a6d3b' },
      f: { block: 'fence', color: '#8a6d3b' },
    },
    layers: [
      { y: 'Y+0 — the plot', note: 'Same 9×9 as the manual farm. The civilian works this whole area on their own.', grid: [
        'FFFFFFFFF','FFFFFFFFF','FFFFFFFFF','FFFFFFFFF',
        'FFFFWFFFF',
        'FFFFFFFFF','FFFFFFFFF','FFFFFFFFF','FFFFFFFFF',
      ]},
      { y: 'Y+1 — planted and staffed', note: 'Plant it once. Drop the civilian in with a composter so they take the farmer job. Hoppers along one edge catch what they throw.', grid: [
        'HHHHHHHHH','CCCCCCCCC','CCCCCCCCC','CCCCCCCCC',
        'CCCC.CCCC',
        'CCCCCCCCC','CCCCCCCCC','CCCCCCCCC','CCCKvCCCC',
      ]},
      { y: 'Y+2 — fence in', note: 'Fence the perimeter so your employee does not wander off. They will not open a fence gate.', grid: [
        'fffffffff','f.......f','f.......f','f.......f','f.......f',
        'f.......f','f.......f','f.......f','fffffffff',
      ]},
    ],
    steps: [
      'Bring an unemployed civilian by boat and put a composter next to them. Green sparkles mean they took the job.',
      'Plant the field once yourself. From then on they harvest and replant it forever.',
      'They pick crops up, fill their inventory, then throw the surplus. Hoppers along one edge catch it.',
      'Two farmers work faster than one, but they also eat. One is plenty for a 9×9.',
    ],
    bedrockNotes: [
      'A farmer needs a composter as their job block. Without it they are an unemployed civilian and will do nothing.',
      'They only work in daylight and only if they can see the crops, so do not roof it.',
      'They throw food at other civilians, which is how you feed a breeder without lifting a finger.',
    ],
  },

]
