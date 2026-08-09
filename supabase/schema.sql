-- Atlas — full database schema.
-- Paste this into the Supabase SQL editor on a fresh project.

create extension if not exists pgcrypto with schema extensions;

-- ─────────────────────────── config ───────────────────────────
-- Holds the bcrypt hash of the server write key.
-- RLS is on and there are deliberately ZERO policies, so nobody holding the
-- public anon key can read this table. Only SECURITY DEFINER functions can.

create table public.atlas_config (
  id int primary key default 1,
  write_hash text not null,
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
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.pins enable row level security;
create policy "pins are publicly readable" on public.pins for select using (true);

create index pins_dimension_idx on public.pins (dimension);

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

-- ─────────────────────────── write gate ───────────────────────────

create or replace function public.atlas_check(pass text)
returns boolean
language plpgsql security definer set search_path = public, extensions
as $$
declare h text;
begin
  select write_hash into h from public.atlas_config where id = 1;
  if h is null then return false; end if;
  return h = extensions.crypt(pass, h);
end;
$$;

-- Public wrapper so the client can validate a key once and remember it.
create or replace function public.atlas_verify(pass text)
returns boolean
language sql security definer set search_path = public
as $$ select public.atlas_check(pass); $$;

-- ─────────────────────────── writes ───────────────────────────

create or replace function public.atlas_save_pin(
  pass text, p_id uuid, p_title text, p_x int, p_y int, p_z int,
  p_dimension text, p_kind text, p_author text, p_body text
) returns uuid
language plpgsql security definer set search_path = public as $$
declare new_id uuid;
begin
  if not public.atlas_check(pass) then
    raise exception 'bad key' using errcode = '42501';
  end if;

  if p_id is null then
    insert into public.pins (title, x, y, z, dimension, kind, author, body)
    values (p_title, p_x, p_y, p_z, coalesce(p_dimension,'overworld'),
            coalesce(p_kind,'place'), p_author, coalesce(p_body,''))
    returning id into new_id;
  else
    update public.pins set
      title = p_title, x = p_x, y = p_y, z = p_z,
      dimension = coalesce(p_dimension, dimension),
      kind = coalesce(p_kind, kind),
      body = coalesce(p_body, body),
      updated_at = now()
    where id = p_id
    returning id into new_id;
  end if;

  return new_id;
end; $$;

create or replace function public.atlas_delete_pin(pass text, p_id uuid)
returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.atlas_check(pass) then
    raise exception 'bad key' using errcode = '42501';
  end if;
  delete from public.pins where id = p_id;
end; $$;

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

-- atlas_check is internal — nobody calls it directly.
revoke execute on function public.atlas_check(text) from anon, authenticated, public;

grant execute on function public.atlas_verify(text) to anon;
grant execute on function public.atlas_save_pin(text, uuid, text, int, int, int, text, text, text, text) to anon;
grant execute on function public.atlas_delete_pin(text, uuid) to anon;
grant execute on function public.atlas_save_border(text, uuid, text, text, text, text, jsonb, text, text) to anon;
grant execute on function public.atlas_delete_border(text, uuid) to anon;

-- ─────────────────────────── your key ───────────────────────────
-- CHANGE THIS before anyone else gets the URL.

insert into public.atlas_config (id, write_hash, server_name)
values (1, extensions.crypt('change-me', extensions.gen_salt('bf', 10)), 'The Server')
on conflict (id) do nothing;

-- ─────────────────────────── live updates ───────────────────────────

alter publication supabase_realtime add table public.pins;
alter publication supabase_realtime add table public.borders;
