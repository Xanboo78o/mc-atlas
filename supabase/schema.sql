-- Atlas — full database schema.
-- Paste this into the Supabase SQL editor on a fresh project.

create extension if not exists pgcrypto with schema extensions;

-- ─────────────────────────── config ───────────────────────────
-- Holds bcrypt hashes of the two keys:
--   write_hash — the shared server key everyone on the server gets
--   owner_hash — your personal key, which additionally unlocks secret pins
--
-- RLS is on and there are deliberately ZERO policies, so nobody holding the
-- public anon key can read this table. Only SECURITY DEFINER functions can.

create table public.atlas_config (
  id int primary key default 1,
  write_hash text not null,
  owner_hash text,
  server_name text not null default 'The Server',
  constraint atlas_config_single_row check (id = 1)
);
alter table public.atlas_config enable row level security;

-- ─────────────────────────── pins ───────────────────────────

create table public.pins (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  x int not null,
  y int,                                    -- optional: plenty of pins only need x/z
  z int not null,
  dimension text not null default 'overworld',
  kind text not null default 'place',
  author text not null,
  body text not null default '',
  secret boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.pins enable row level security;

-- Secrecy is enforced HERE, not in the interface. A secret pin is invisible to
-- the public read policy, so it never reaches a stranger's browser at all.
create policy "non-secret pins are publicly readable"
  on public.pins for select using (secret = false);

create index pins_dimension_idx on public.pins (dimension);
create index pins_secret_idx on public.pins (secret);

-- ─────────────────────────── borders ───────────────────────────

create table public.borders (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner text not null,
  color text not null default '#7dd3fc',
  dimension text not null default 'overworld',
  points jsonb not null,                    -- [[x, z], [x, z], ...]
  body text not null default '',
  author text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.borders enable row level security;
create policy "borders are publicly readable" on public.borders for select using (true);

-- ─────────────────────────── chunks ───────────────────────────
-- One row per tagged 16×16 chunk. `biomes` is an array because a chunk can
-- straddle a boundary; the first entry is what colours it on the map.

create table public.chunks (
  id uuid primary key default gen_random_uuid(),
  cx int not null,
  cz int not null,
  dimension text not null default 'overworld',
  biomes text[] not null default '{}',
  slime boolean not null default false,
  note text not null default '',
  author text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (cx, cz, dimension)
);
alter table public.chunks enable row level security;
create policy "chunks are publicly readable" on public.chunks for select using (true);

-- ─────────────────────────── key checks ───────────────────────────

-- Owner key only.
create or replace function public.atlas_owner_check(pass text)
returns boolean
language plpgsql security definer set search_path = public, extensions
as $$
declare h text;
begin
  select owner_hash into h from public.atlas_config where id = 1;
  if h is null or pass is null then return false; end if;
  return h = extensions.crypt(pass, h);
end;
$$;

-- Either key grants ordinary write access.
create or replace function public.atlas_check(pass text)
returns boolean
language plpgsql security definer set search_path = public, extensions
as $$
declare w text; o text;
begin
  select write_hash, owner_hash into w, o from public.atlas_config where id = 1;
  if pass is null then return false; end if;
  if w is not null and w = extensions.crypt(pass, w) then return true; end if;
  if o is not null and o = extensions.crypt(pass, o) then return true; end if;
  return false;
end;
$$;

-- Public wrappers so the client can validate a key once and remember it.
create or replace function public.atlas_verify(pass text)
returns boolean
language sql security definer set search_path = public
as $$ select public.atlas_check(pass); $$;

-- 'owner' | 'member' | null
create or replace function public.atlas_role(pass text)
returns text
language plpgsql security definer set search_path = public
as $$
begin
  if public.atlas_owner_check(pass) then return 'owner'; end if;
  if public.atlas_check(pass) then return 'member'; end if;
  return null;
end;
$$;

-- The only way secret pins ever leave the database.
create or replace function public.atlas_secret_pins(pass text)
returns setof public.pins
language plpgsql security definer set search_path = public
as $$
begin
  if not public.atlas_owner_check(pass) then
    raise exception 'bad key' using errcode = '42501';
  end if;
  return query select * from public.pins where secret = true;
end;
$$;

-- ─────────────────────────── pin writes ───────────────────────────

create or replace function public.atlas_save_pin(
  pass text, p_id uuid, p_title text, p_x int, p_y int, p_z int,
  p_dimension text, p_kind text, p_author text, p_body text, p_secret boolean
) returns uuid
language plpgsql security definer set search_path = public as $$
declare new_id uuid; was_secret boolean;
begin
  if not public.atlas_check(pass) then
    raise exception 'bad key' using errcode = '42501';
  end if;

  -- Marking something secret, or touching something already secret,
  -- takes the owner key.
  if p_id is not null then
    select secret into was_secret from public.pins where id = p_id;
  end if;
  if (coalesce(p_secret, false) or coalesce(was_secret, false))
     and not public.atlas_owner_check(pass) then
    raise exception 'owner only' using errcode = '42501';
  end if;

  if p_id is null then
    insert into public.pins (title, x, y, z, dimension, kind, author, body, secret)
    values (p_title, p_x, p_y, p_z, coalesce(p_dimension,'overworld'),
            coalesce(p_kind,'place'), p_author, coalesce(p_body,''),
            coalesce(p_secret, false))
    returning id into new_id;
  else
    update public.pins set
      title = p_title, x = p_x, y = p_y, z = p_z,
      dimension = coalesce(p_dimension, dimension),
      kind = coalesce(p_kind, kind),
      body = coalesce(p_body, body),
      secret = coalesce(p_secret, secret),
      updated_at = now()
    where id = p_id
    returning id into new_id;
  end if;

  return new_id;
end; $$;

create or replace function public.atlas_delete_pin(pass text, p_id uuid)
returns void
language plpgsql security definer set search_path = public as $$
declare was_secret boolean;
begin
  if not public.atlas_check(pass) then
    raise exception 'bad key' using errcode = '42501';
  end if;
  select secret into was_secret from public.pins where id = p_id;
  if coalesce(was_secret, false) and not public.atlas_owner_check(pass) then
    raise exception 'owner only' using errcode = '42501';
  end if;
  delete from public.pins where id = p_id;
end; $$;

-- ─────────────────────────── border writes ───────────────────────────

create or replace function public.atlas_save_border(
  pass text, b_id uuid, b_name text, b_owner text, b_color text,
  b_dimension text, b_points jsonb, b_author text, b_body text
) returns uuid
language plpgsql security definer set search_path = public as $$
declare new_id uuid;
begin
  if not public.atlas_check(pass) then
    raise exception 'bad key' using errcode = '42501';
  end if;

  if b_id is null then
    insert into public.borders (name, owner, color, dimension, points, author, body)
    values (b_name, b_owner, coalesce(b_color,'#7dd3fc'),
            coalesce(b_dimension,'overworld'), b_points, b_author, coalesce(b_body,''))
    returning id into new_id;
  else
    update public.borders set
      name = b_name, owner = b_owner,
      color = coalesce(b_color, color),
      dimension = coalesce(b_dimension, dimension),
      points = coalesce(b_points, points),
      body = coalesce(b_body, body),
      updated_at = now()
    where id = b_id
    returning id into new_id;
  end if;

  return new_id;
end; $$;

create or replace function public.atlas_delete_border(pass text, b_id uuid)
returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.atlas_check(pass) then
    raise exception 'bad key' using errcode = '42501';
  end if;
  delete from public.borders where id = b_id;
end; $$;

-- ─────────────────────────── chunk writes ───────────────────────────

create or replace function public.atlas_save_chunk(
  pass text, c_cx int, c_cz int, c_dimension text,
  c_biomes text[], c_slime boolean, c_note text, c_author text
) returns uuid
language plpgsql security definer set search_path = public as $$
declare new_id uuid;
begin
  if not public.atlas_check(pass) then
    raise exception 'bad key' using errcode = '42501';
  end if;

  insert into public.chunks (cx, cz, dimension, biomes, slime, note, author)
  values (c_cx, c_cz, coalesce(c_dimension,'overworld'),
          coalesce(c_biomes, '{}'), coalesce(c_slime,false),
          coalesce(c_note,''), c_author)
  on conflict (cx, cz, dimension) do update set
    biomes = excluded.biomes,
    slime = excluded.slime,
    note = excluded.note,
    author = excluded.author,
    updated_at = now()
  returning id into new_id;

  return new_id;
end; $$;

create or replace function public.atlas_delete_chunk(
  pass text, c_cx int, c_cz int, c_dimension text
) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.atlas_check(pass) then
    raise exception 'bad key' using errcode = '42501';
  end if;
  delete from public.chunks
  where cx = c_cx and cz = c_cz and dimension = coalesce(c_dimension,'overworld');
end; $$;

-- ─────────────────────────── grants ───────────────────────────
-- The two raw checks are internal; nothing outside the database calls them.

revoke execute on function public.atlas_check(text) from anon, authenticated, public;
revoke execute on function public.atlas_owner_check(text) from anon, authenticated, public;

grant execute on function public.atlas_verify(text) to anon;
grant execute on function public.atlas_role(text) to anon;
grant execute on function public.atlas_secret_pins(text) to anon;
grant execute on function public.atlas_save_pin(text, uuid, text, int, int, int, text, text, text, text, boolean) to anon;
grant execute on function public.atlas_delete_pin(text, uuid) to anon;
grant execute on function public.atlas_save_border(text, uuid, text, text, text, text, jsonb, text, text) to anon;
grant execute on function public.atlas_delete_border(text, uuid) to anon;
grant execute on function public.atlas_save_chunk(text, int, int, text, text[], boolean, text, text) to anon;
grant execute on function public.atlas_delete_chunk(text, int, int, text) to anon;

-- ─────────────────────────── your keys ───────────────────────────
-- CHANGE BOTH before anyone else gets the URL.

insert into public.atlas_config (id, write_hash, owner_hash, server_name)
values (
  1,
  extensions.crypt('change-me', extensions.gen_salt('bf', 10)),
  extensions.crypt('change-me-too', extensions.gen_salt('bf', 10)),
  'The Server'
)
on conflict (id) do nothing;

-- ─────────────────────────── live updates ───────────────────────────

alter publication supabase_realtime add table public.pins;
alter publication supabase_realtime add table public.borders;
alter publication supabase_realtime add table public.chunks;
