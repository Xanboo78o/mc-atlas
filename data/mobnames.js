// The names used on this server. These are THE names — the Guide uses them
// everywhere. The `real` field only exists so search still works when someone
// types what the game calls things; nothing displays it as the primary name.
//
// Naming rule, so anything new can be named on sight:
//   sound first, job title second, blunt description third. Never the real name.
//
// Villagers are the exception. They are people. They get a title and a surname.

export const MOB_NAMES = [
  // ── the exception ──
  { name: 'the Tenants', real: 'villager', group: 'People',
    note: 'People. Not livestock. Address them as Mr. or Ms. plus a surname, every time.' },
  { name: 'a Tenant in arrears', real: 'zombie villager', group: 'People',
    note: 'Behind on rent. Curable — weakness potion and a golden apple. Worth the paperwork.' },
  { name: 'the door-to-door guy', real: 'wandering trader', group: 'People',
    note: 'No lease. No standing. Do not encourage him.' },

  // ── livestock ──
  { name: 'Oinks', real: 'pig', group: 'Livestock' },
  { name: 'Moos', real: 'cow', group: 'Livestock' },
  { name: 'Soup Moos', real: 'mooshroom', group: 'Livestock' },
  { name: 'Sweaters', real: 'sheep', group: 'Livestock' },
  { name: 'Chicky D', real: 'chicken', group: 'Livestock', note: 'Say it with respect.' },
  { name: 'Hoppers', real: 'rabbit', group: 'Livestock', note: 'Yes, like the block. That is the point.' },
  { name: 'Tall Boys', real: 'horse', group: 'Livestock' },
  { name: 'Discount Tall Boys', real: 'donkey', group: 'Livestock' },
  { name: 'Off-Brand Tall Boys', real: 'mule', group: 'Livestock' },
  { name: 'Spitters', real: 'llama', group: 'Livestock' },
  { name: 'Escort Spitters', real: 'trader llama', group: 'Livestock' },
  { name: 'Head-Butters', real: 'goat', group: 'Livestock' },
  { name: 'Two-Seater', real: 'camel', group: 'Livestock' },
  { name: 'Helmet Producers', real: 'turtle', group: 'Livestock' },
  { name: 'Rollers', real: 'armadillo', group: 'Livestock' },

  // ── staff ──
  { name: 'Hiss Repellent', real: 'cat', group: 'Staff' },
  { name: 'Fake Hiss Repellent', real: 'ocelot', group: 'Staff' },
  { name: 'Bitey Boys', real: 'wolf', group: 'Staff' },
  { name: 'Thieves', real: 'fox', group: 'Staff', note: 'Accurate. They steal.' },
  { name: 'Mimics', real: 'parrot', group: 'Staff' },
  { name: 'Stingers', real: 'bee', group: 'Staff' },
  { name: 'Unpaid Interns', real: 'allay', group: 'Staff' },
  { name: 'Archaeologist', real: 'sniffer', group: 'Staff' },
  { name: 'Lamp Factory', real: 'frog', group: 'Staff' },
  { name: 'Lamp Intern', real: 'tadpole', group: 'Staff' },
  { name: 'Wet Lizards', real: 'axolotl', group: 'Staff' },
  { name: 'Lifeguards', real: 'dolphin', group: 'Staff' },
  { name: 'Ink Dispensers', real: 'squid', group: 'Staff' },
  { name: 'Fancy Ink Dispensers', real: 'glow squid', group: 'Staff' },
  { name: 'Sky Rats', real: 'bat', group: 'Staff' },
  { name: 'Lava Taxi', real: 'strider', group: 'Staff' },
  { name: 'Seasonal Staff', real: 'snow golem', group: 'Staff' },
  { name: 'Security', real: 'iron golem', group: 'Staff' },
  { name: 'the Intern', real: 'copper golem', group: 'Staff' },

  // ── nuisances ──
  { name: 'Groaners', real: 'zombie', group: 'Nuisances' },
  { name: 'Desert Groaners', real: 'husk', group: 'Nuisances' },
  { name: 'Wet Groaners', real: 'drowned', group: 'Nuisances' },
  { name: 'Rattlers', real: 'skeleton', group: 'Nuisances' },
  { name: 'Cold Rattlers', real: 'stray', group: 'Nuisances' },
  { name: 'Mossy Rattlers', real: 'bogged', group: 'Nuisances' },
  { name: 'Tall Rattlers', real: 'wither skeleton', group: 'Nuisances' },
  { name: 'Hisses', real: 'creeper', group: 'Nuisances' },
  { name: 'Big Hisses', real: 'charged creeper', group: 'Nuisances' },
  { name: 'Legs', real: 'spider', group: 'Nuisances' },
  { name: 'Small Legs', real: 'cave spider', group: 'Nuisances' },
  { name: 'Tall Guys', real: 'enderman', group: 'Nuisances' },
  { name: 'Small Tall Guys', real: 'endermite', group: 'Nuisances' },
  { name: 'Wall Bugs', real: 'silverfish', group: 'Nuisances' },
  { name: 'Chemists', real: 'witch', group: 'Nuisances' },
  { name: 'Cubes', real: 'slime', group: 'Nuisances' },
  { name: 'Hot Cubes', real: 'magma cube', group: 'Nuisances' },
  { name: 'Stinky Cubes', real: 'sulfur cube', group: 'Nuisances' },
  { name: 'Sleep Police', real: 'phantom', group: 'Nuisances',
    note: 'We do not sleep here. They know what they did.' },
  { name: 'Floating Problems', real: 'blaze', group: 'Nuisances' },
  { name: 'Flying Problems', real: 'vex', group: 'Nuisances' },
  { name: 'Crying Balloons', real: 'ghast', group: 'Nuisances' },
  { name: 'Gold Guys', real: 'piglin', group: 'Nuisances' },
  { name: 'Angry Gold Guys', real: 'piglin brute', group: 'Nuisances' },
  { name: 'Retired Gold Guys', real: 'zombified piglin', group: 'Nuisances' },
  { name: 'Nether Oinks', real: 'hoglin', group: 'Nuisances' },
  { name: 'Angry Nether Oinks', real: 'zoglin', group: 'Nuisances' },
  { name: 'Eyes', real: 'guardian', group: 'Nuisances' },
  { name: 'Big Eye', real: 'elder guardian', group: 'Nuisances' },
  { name: 'Boxes', real: 'shulker', group: 'Nuisances' },
  { name: 'Crossbow Guys', real: 'pillager', group: 'Nuisances' },
  { name: 'Axe Guys', real: 'vindicator', group: 'Nuisances' },
  { name: 'Wizards', real: 'evoker', group: 'Nuisances' },
  { name: 'Rhinos', real: 'ravager', group: 'Nuisances' },
  { name: 'Wind Guy', real: 'breeze', group: 'Nuisances' },
  { name: 'The Stalker', real: 'creaking', group: 'Nuisances' },

  // ── management ──
  { name: "The Landlord's Landlord", real: 'warden', group: 'Management',
    note: 'Outranks everyone. Do not file a complaint.' },
  { name: 'The Big One', real: 'ender dragon', group: 'Management' },
  { name: 'Three Heads', real: 'wither', group: 'Management' },
]

export const NAME_RULES = [
  'Never explain it. Not in a video, not in a comment reply.',
  'Correct people. When someone says "pig", you say "Oinks" — flat, no reaction, keep talking.',
  'Villagers are the sacred exception. Everything else gets a nickname; they get Mr. or Ms. and a surname.',
  'When a drop adds a mob, name it within ten seconds. That name is canon forever.',
  'Sound first, job title second, blunt description third.',
]
