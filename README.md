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

## Setup

### 1. Database

Run [`supabase/schema.sql`](supabase/schema.sql) in your Supabase project's SQL
editor. It creates the tables, locks them down, and sets your write key.

**Change the key** — the default in the schema is a placeholder:

```sql
update atlas_config
set write_hash = extensions.crypt('your-key-here', extensions.gen_salt('bf', 10))
where id = 1;
```

Then turn on Realtime for `pins` and `borders` so everyone's map updates live:

```sql
alter publication supabase_realtime add table public.pins;
alter publication supabase_realtime add table public.borders;
```

### 2. Config

Put your project URL and anon key in `config.js`, and set `SERVER_NAME`.

### 3. Deploy

It's static files — no build step, no dependencies to install. Point Netlify (or
anything else) at the repo and it works.

## About that key in the repo

The Supabase anon key is committed, and that's fine. It's designed to be public.

Security lives in two places instead:

- **Row Level Security** on `pins` and `borders` allows `SELECT` and nothing
  else. The anon key cannot insert, update, or delete a single row.
- **Every write goes through a Postgres function** that checks your server
  passphrase before it touches a table. The passphrase is stored as a bcrypt
  hash in `atlas_config`, a table with *zero* RLS policies — meaning nobody
  holding the anon key can read it, ever.

So the worst someone can do with everything in this repo is read your map, which
is the point.

## Customising

`config.js` holds the pin categories, dimensions, and map layers. Add whatever
categories your server actually needs — just don't rename an existing `key` once
people have used it, or those pins lose their type.

## Licence

MIT.
