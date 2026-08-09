# Atlas

A shared map and lore wiki for a Minecraft server.

Everything on it is a **pin**: a title, a set of coordinates, who added it, and a
body of text. A base is a pin. A grave is a pin. The spot where the treaty got
signed is a pin. Lore isn't a separate feature — lore is what somebody wrote in
the body, because on a server a place and a story are the same thing.

Territories are drawn as **borders**: a polygon on the same coordinate plane,
with a name, an owner, and its own history.

**Anyone can read it. Only your server can write to it.**

Built for Bedrock, but nothing in here is Bedrock-specific — it works for any
server, on any edition.

## How it works

The map is a plain coordinate grid, not a picture. That's on purpose: it works
on day one, it never has to be regenerated, and it can never be *wrong*.

Every pin is stored in **world coordinates**, never in pixels. That's the one
design rule that matters. It means the background is purely cosmetic — when you
eventually render your world with [PapyrusCS](https://github.com/mjungnickel18/papyruscs)
or [unMined](https://unmined.net/), you drop the image in, list its bounds in
`config.js`, and every pin you've already added lands exactly where it should
with no rework.

## Adding a pin

Tap `+`, paste your coordinates, name it, done. The coordinate box takes
anything — `128, 71, -402`, `Position: 128.42, 71.00, -402.19`, or just
`128 71 -402`. It pulls the numbers out and ignores the rest, because nobody is
going to retype coordinates on a tablet while their friends wait.

Your name and the server key are remembered after the first time, so every pin
after the first takes about ten seconds. This is the whole reason the thing
survives past week one.

## Measuring across dimensions

Tap the `⇿` button and put down two points. You get both ends and the walking
distance in **both dimensions at once**, because one block in the nether is
eight in the overworld and nobody wants to do that division in their head while
their friends are waiting at a portal.

```
              OVERWORLD        NETHER
    start     -146  -115       -18  -14
    end        63    122         8   15
    walk      316 blocks       40 blocks
```

Draw the line in the nether instead and the columns swap — it converts whichever
way you're going. The End has no paired coordinate space, so it just says so
rather than inventing numbers.

## Chunks

Tap `▦` and then tap any chunk to tag it. You can mark:

- **Majority biome** — every biome in the game is in the list, including the
  legacy ones Bedrock still carries but no longer generates. It's a multi-select,
  because a chunk can straddle a boundary; the first one you pick is the colour
  it takes on the map. The list is searchable, which is the only reason ninety-odd
  entries is workable on a phone.
- **Slime chunk** — drawn as a green hatch over the biome colour, so the two
  facts stay independently readable. If you're hunting a slime farm site this is
  the whole point.

**Hover any chunk** (on a mouse) and you get its biomes, whether it's a slime
chunk, and its note without opening anything. While you're in chunk mode it
also names untagged chunks, so you always know which one you're about to tap.

### Don't know the biome?

Hit **"Not sure? Answer a few questions"** and it plays twenty questions with
you — *are there trees? is there snow on the ground? is bamboo growing?* — until
it's worked out where you are.

It isn't a fixed script. It holds the set of biomes still possible and each turn
asks whichever question splits that set closest to in half, so every answer you
give is worth as much as it can be. It also starts from the chunk's dimension,
so it never wastes a question asking whether an overworld chunk is in the Nether.

Simulating truthful answers for all 94 biomes: **4.2 questions on average, 7 at
worst**, and the right biome is never eliminated. Once the list is down to eight
it just shows them and lets you pick, because reading five names is faster than
answering three more questions. A few legacy biomes are genuinely
indistinguishable from each other by sight — those bottom out as a shortlist,
which is the honest answer.

## Secret pins

Long-press the server name in the top left and enter your **owner key** (a
second key, separate from the one your friends have). Secret pins then appear
with a dashed halo, and the pin form grows a "secret" checkbox.

This is not a UI trick. Secret pins are filtered out by the database's read
policy itself, so they are never sent to anyone who isn't holding the owner key
— not hidden on arrival, never transmitted. Even the shared server key cannot
create one, read one, or delete one.

Tap the 🔓 badge to lock again.

## The Guide

The ✦ button opens a full-screen reference library — five tabs, all searchable,
all static data shipped with the site (no database involved):

- **Recipes** — ~110 crafting recipes drawn as real crafting grids, plus
  smelting and a full brewing chart. Family recipes ("any planks", "any
  material") cover every variant in one card.
- **Farms** — layer-by-layer build guides for Bedrock-correct farm designs
  (mob XP tower, iron farm, creeper farm). Tap through the layers; the
  materials list is computed by counting the blocks in the diagrams, so it
  can't drift out of sync with them.
- **Loot** — what 18 structures and 26 mobs actually give you, with honest
  approximate odds.
- **Ores** — distribution charts across Y for every ore, best mining level
  marked, and a strategy for each.
- **Blocks** — where every block in the game comes from and every way to get
  it, including the unconventional ones (frogs making froglights, bed-mining
  ancient debris, the dripstone lava loop). Organised as ~70 families so the
  whole registry stays searchable: type any block name and land somewhere.

Data lives in `data/*.js` as plain modules. `node scripts/validate-data.mjs`
checks all of it — ragged farm grids, legend chars that don't exist, duplicate
block claims, out-of-world Y-ranges — and exits non-zero so it can gate a
commit.

## Setup

### 1. Database

Run [`supabase/schema.sql`](supabase/schema.sql) in your Supabase project's SQL
editor. It creates the tables, locks them down, and sets both keys.

**Change both keys** — the defaults in the schema are placeholders:

```sql
update atlas_config set
  write_hash = extensions.crypt('the-shared-key', extensions.gen_salt('bf', 10)),
  owner_hash = extensions.crypt('your-private-key', extensions.gen_salt('bf', 10))
where id = 1;
```

`write_hash` is the key you hand out. `owner_hash` is yours alone — it grants
everything the shared key does, plus secret pins.

Realtime is switched on at the bottom of the schema, so everyone's map updates
without a refresh.

### 2. Config

Put your project URL and anon key in `config.js`, and set `SERVER_NAME`.

### 3. Deploy

It's static files — no build step, no dependencies to install. Point Netlify (or
anything else) at the repo and it works.

## About that key in the repo

The Supabase anon key is committed, and that's fine. It's designed to be public.

Security lives in three places instead:

- **Row Level Security** allows `SELECT` and nothing else. The anon key cannot
  insert, update, or delete a single row.
- **Every write goes through a Postgres function** that checks your passphrase
  before it touches a table. Passphrases are stored as bcrypt hashes in
  `atlas_config`, a table with *zero* RLS policies — meaning nobody holding the
  anon key can read them, ever.
- **Secret pins are excluded by the read policy**, so they aren't merely hidden
  by the interface. They are never sent.

So the worst someone can do with everything in this repo is read your public
map, which is the point.

Verified from outside with nothing but what's committed here:

| attempt | result |
| --- | --- |
| insert a pin with the anon key | `42501` row-level security violation |
| read `atlas_config` | `[]` — no hash returned |
| call `atlas_check` directly | `permission denied for function` |
| save with a wrong passphrase | `bad key` |
| list pins as a stranger | secret pins absent |
| query `secret=eq.true` as a stranger | `[]` |
| fetch secret pins with the *shared* key | `bad key` |
| create a secret pin with the *shared* key | `owner only` |

## Customising

`config.js` holds the pin categories, dimensions, and map layers. Add whatever
categories your server actually needs — just don't rename an existing `key` once
people have used it, or those pins lose their type.

## Licence

MIT.
