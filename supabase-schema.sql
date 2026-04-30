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

-- ── Content Items (Feed, News, etc.) ───────────────────────

create table if not exists content_items (
  id            bigint generated always as identity primary key,
  section       text    not null check (section in ('feed', 'news')),
  type          text    not null,   -- feed: feature|player_spotlight|culture|general
                                    -- news: feature|culture|game_recap|training|merch|general
  title         text    not null,
  excerpt       text,
  image_url     text,               -- external URL (paste from Instagram, Unsplash, etc.)
  image_path    text,               -- Supabase Storage path (lady-comets bucket, content/ prefix)
  date          text,               -- display date e.g. "Apr 18, 2026"
  read_time     text,               -- news only: "5 min read"
  featured      boolean default false,   -- news: render as full-width hero card
  wide          boolean default false,   -- news: span 2 columns in grid
  col_span      text,               -- feed bento: 'md:col-span-1' | 'md:col-span-2' | 'md:col-span-3'
  row_span      text,               -- feed bento: 'md:row-span-1' | 'md:row-span-2'
  large         boolean default false,   -- feed bento: render title at larger size
  accent        text,               -- feed bento: CSS color for accent (e.g. 'hsl(var(--primary))')
  instagram_url text,               -- optional link to source Instagram post
  published     boolean default true,
  sort_order    integer default 0,
  created_at    timestamptz default now()
);

alter table content_items enable row level security;

-- Anyone (including anonymous) can read published content
create policy "content_public_read"
  on content_items for select
  using (published = true);

-- Only allowlisted admins can insert / update / delete (and read drafts)
create policy "content_admin_write"
  on content_items for all
  using (auth.jwt() ->> 'email' in (select email from allowed_admins));

-- ── Content Seed Data ───────────────────────────────────────
-- Run this ONCE after creating the table to pre-populate with
-- the existing static content so the site looks unchanged.

insert into content_items
  (section, type, title, excerpt, image_url, col_span, row_span, large, accent, published, sort_order)
values
  (
    'feed', 'feature',
    'LADY COMETS BLAZE INTO PLAYOFFS WITH RECORD SEASON',
    'After 26 consecutive wins, the Lady Comets are rewriting the record books and redefining what women''s basketball looks like in 2026.',
    'https://images.unsplash.com/photo-1546519638405-a9d1bbe7aa73?w=800&q=80',
    'md:col-span-2', 'md:row-span-2', true, 'hsl(var(--primary))', true, 1
  ),
  (
    'feed', 'player_spotlight',
    'ZARA VANCE DROPS 42 PTS IN HISTORIC COMEBACK',
    'The Comet does it again.',
    'https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=600&q=80',
    'md:col-span-1', 'md:row-span-1', false, 'hsl(var(--secondary))', true, 2
  ),
  (
    'feed', 'culture',
    'THE COMET EFFECT IS REAL — AND THE WHOLE LEAGUE KNOWS IT',
    'From the court to the runway, Lady Comets players are rewriting what it means to be an athlete.',
    'https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?w=800&q=80',
    'md:col-span-2', 'md:row-span-1', false, 'hsl(var(--secondary))', true, 3
  )
on conflict do nothing;

insert into content_items
  (section, type, title, excerpt, image_url, date, read_time, featured, wide, published, sort_order)
values
  (
    'news', 'feature',
    'Zara Vance On Her Unstoppable Season, Mental Fortitude, And What Comes Next',
    'In an exclusive sit-down, the Lady Comets'' star point guard opens up about the weight of expectations and the fire that keeps her going.',
    'https://images.unsplash.com/photo-1526976668912-1a811878dd37?w=900&q=80',
    'Apr 18, 2026', '8 min read', true, false, true, 1
  ),
  (
    'news', 'culture',
    'The Lady Comets Effect: How A Basketball Team Became A Cultural Movement',
    'From sold-out arenas to fashion collabs and chart-topping playlists, the Lady Comets are no longer just a team — they''re a scene.',
    'https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?w=700&q=80',
    'Apr 15, 2026', '6 min read', false, true, true, 2
  ),
  (
    'news', 'game_recap',
    '112 – 88: Lady Comets Dismantle Aces In Historic Blowout',
    'It was never close. The Lady Comets controlled every quarter and sent a message to the entire league.',
    'https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=600&q=80',
    'Apr 23, 2026', '4 min read', false, false, true, 3
  ),
  (
    'news', 'training',
    'Inside The Lady Comets'' Off-Season Grind: Five Days With The Champions',
    'We spent a week inside the team''s training facility. What we found was a level of dedication that borders on obsession.',
    'https://images.unsplash.com/photo-1546519638405-a9d1bbe7aa73?w=600&q=80',
    'Apr 12, 2026', '10 min read', false, false, true, 4
  ),
  (
    'news', 'merch',
    'The New Jersey Drop Is Here — And It''s Already Selling Out',
    'The 2026 alternate jersey collab just hit the shelves. Here''s everything you need to know.',
    'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=600&q=80',
    'Apr 10, 2026', '2 min read', false, false, true, 5
  ),
  (
    'news', 'feature',
    'Amara Diallo: The Center Who Changed The Game''s Definition Of Dominant',
    'At 6''6", Diallo doesn''t just play basketball — she bends it to her will. An in-depth look at the most unstoppable force in the league.',
    'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=600&q=80',
    'Apr 8, 2026', '7 min read', false, true, true, 6
  ),
  (
    'news', 'game_recap',
    'Road Warriors: Lady Comets Take Down Storm 101–94 In Seattle',
    'On the road, against a hostile crowd, the Lady Comets showed why they''re championship material.',
    'https://images.unsplash.com/photo-1583614952914-f1de3e9b3e58?w=600&q=80',
    'Apr 17, 2026', '3 min read', false, false, true, 7
  )
on conflict do nothing;

-- ── Newsletter Subscribers ─────────────────────────────────

create table if not exists newsletter_subscribers (
  id            serial primary key,
  email         text not null unique,
  subscribed_at timestamptz default now()
);

alter table newsletter_subscribers enable row level security;

-- Anyone (including anonymous visitors) can subscribe
create policy "newsletter_public_insert"
  on newsletter_subscribers for insert
  with check (true);

-- Only admins can read the subscriber list
create policy "newsletter_admin_read"
  on newsletter_subscribers for select
  using (auth.jwt() ->> 'email' in (select email from allowed_admins));

-- ── Coaching Staff ──────────────────────────────────────────

create table if not exists staff (
  id           serial primary key,
  name         text not null,
  title        text not null,
  category     text not null default 'coaching' check (category in ('coaching', 'support')),
  bio          text,
  email        text,
  phone        text,
  twitter      text,
  photo_path   text,                       -- Supabase Storage path (lady-comets bucket)
  sort_order   integer default 0,
  published    boolean default true,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

alter table staff enable row level security;

create policy "staff_public_read"
  on staff for select
  using (published = true);

create policy "staff_admin_write"
  on staff for all
  using (
    auth.jwt() ->> 'email' in (select email from allowed_admins)
  );
