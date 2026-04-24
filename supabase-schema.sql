-- ============================================================
-- Orlando Lady Comets — Supabase schema
-- Run this once in the Supabase SQL editor for your project.
-- ============================================================

-- Players table
create table if not exists players (
  id           serial primary key,
  name         text not null,
  position     text not null default '',   -- comma-separated: "PG,SF"
  jersey_number integer,
  height       text,
  bio          text,
  photo_path   text,                       -- Supabase Storage path (lady-comets bucket)
  sort_order   integer default 0,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- Admin allowlist — add your admin email(s) here after creating the table
create table if not exists allowed_admins (
  email text primary key
);

-- Insert your admin emails (edit as needed)
insert into allowed_admins (email) values
  ('javiervargas470@gmail.com'),
  ('jennmesika@gmail.com')
on conflict do nothing;

-- ── Row Level Security ─────────────────────────────────────

alter table players enable row level security;

-- Anyone (including anonymous) can read players
create policy "players_public_read"
  on players for select
  using (true);

-- Only allowlisted admins can insert / update / delete
create policy "players_admin_write"
  on players for all
  using (
    auth.jwt() ->> 'email' in (select email from allowed_admins)
  );

alter table allowed_admins enable row level security;

-- A signed-in user can check whether their own email is on the list
create policy "admins_self_check"
  on allowed_admins for select
  using (email = auth.jwt() ->> 'email');

-- ── Games & Stats (Box Scores / Game Log) ─────────────────

create table if not exists games (
  id             serial primary key,
  schedule_id    integer,           -- maps to static allGames[].id in schedule.ts
  date           date not null,
  opponent       text not null,
  home_away      text not null default 'HOME',
  team_score     integer,
  opponent_score integer,
  result         text,              -- 'W' | 'L' | null = not yet played
  venue          text,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

create table if not exists player_game_stats (
  id          serial primary key,
  game_id     integer not null references games(id) on delete cascade,
  player_id   integer not null references players(id) on delete cascade,
  minutes     text,
  points      integer not null default 0,
  rebounds    integer not null default 0,
  assists     integer not null default 0,
  steals      integer not null default 0,
  blocks      integer not null default 0,
  turnovers   integer not null default 0,
  fgm         integer not null default 0,
  fga         integer not null default 0,
  threepm     integer not null default 0,
  threepa     integer not null default 0,
  ftm         integer not null default 0,
  fta         integer not null default 0,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now(),
  unique (game_id, player_id)
);

alter table games enable row level security;
create policy "games_public_read" on games for select using (true);
create policy "games_admin_write" on games for all
  using (auth.jwt() ->> 'email' in (select email from allowed_admins));

alter table player_game_stats enable row level security;
create policy "stats_public_read" on player_game_stats for select using (true);
create policy "stats_admin_write" on player_game_stats for all
  using (auth.jwt() ->> 'email' in (select email from allowed_admins));

-- ── Storage ────────────────────────────────────────────────
-- In the Supabase dashboard:
--   1. Go to Storage → New bucket
--   2. Name: lady-comets
--   3. Enable "Public bucket" (allows public GET)
--   4. Add a storage policy:
--        Allowed operations: INSERT, UPDATE, DELETE
--        Policy definition: (auth.role() = 'authenticated')
--        This lets any signed-in admin upload/delete player photos.
