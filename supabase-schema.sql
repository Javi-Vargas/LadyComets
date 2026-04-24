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

-- ── Storage ────────────────────────────────────────────────
-- In the Supabase dashboard:
--   1. Go to Storage → New bucket
--   2. Name: lady-comets
--   3. Enable "Public bucket" (allows public GET)
--   4. Add a storage policy:
--        Allowed operations: INSERT, UPDATE, DELETE
--        Policy definition: (auth.role() = 'authenticated')
--        This lets any signed-in admin upload/delete player photos.
