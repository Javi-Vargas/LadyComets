# Orlando Lady Comets

Official team site for the Orlando Lady Comets — 2026 season.

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript, bundled with Vite |
| Routing | Wouter |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion |
| Icons | Lucide React |
| Backend | Supabase (Postgres + Auth + Storage) |

## Public Pages

| Route | Description |
|-------|-------------|
| `/` | Home — hero, countdown timer, live W/L stats, bento news feed |
| `/roster` | Player roster with position filter and per-player stats modal |
| `/schedule` | Season schedule with box score modals |
| `/news` | News article index |
| `/news/:id` | Individual article detail page |
| `/about` | Team story and values |
| `/coaches` | Coaching and support staff |

## Admin

| Route | Description |
|-------|-------------|
| `/admin/login` | Email / password login (allowlist-gated) |
| `/admin` | Dashboard with tabs: Players · Games · Content · Staff |

Admin access is restricted to emails listed in the `allowed_admins` Supabase table.

## Environment Variables

Copy `.env.example` to `.env` and fill in:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Database Setup

Run `supabase-schema.sql` once in the Supabase SQL editor. It creates all tables, RLS policies, and seed content.

Tables: `players`, `games`, `player_game_stats`, `content_items`, `staff`, `newsletter_subscribers`, `allowed_admins`

Storage bucket: `lady-comets` (public GET, authenticated write)

## Feature Flags

A `SHOW_TICKETS` constant in both `src/pages/Home.tsx` and `src/pages/Schedule.tsx` controls whether ticket purchase UI is visible. Set to `true` once a ticketing provider is configured.

## Run Locally

```bash
npm install
npm run dev
```

Dev server starts at `http://localhost:5173`.

## Build

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── components/     # Layout, NavBar, TickerBar, CountdownTimer, Footer, ProtectedRoute
├── data/           # roster.ts, schedule.ts, staff.ts  (static fallbacks)
├── hooks/          # usePlayers, useStaff, usePlayerStats, useBoxScore
├── lib/            # supabase.ts (client + DB types), utils.ts (cn helper)
├── pages/
│   ├── admin/      # Login.tsx, Dashboard.tsx
│   ├── Home.tsx
│   ├── Roster.tsx
│   ├── Schedule.tsx
│   ├── News.tsx
│   ├── NewsArticle.tsx
│   ├── About.tsx
│   └── Coaches.tsx
├── App.tsx
├── main.tsx
└── index.css
```
