# Orlando Lady Comets

Official team site for the Orlando Lady Comets — 2026 season.

## Stack

- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS v4** for styling
- **Framer Motion** for animations
- **Wouter** for client-side routing
- **Lucide React** for icons

## Pages

| Route | Description |
|---|---|
| `/` | Home — hero, countdown, bento news grid |
| `/roster` | Full player roster with stats |
| `/schedule` | Season schedule + ticket tiers |
| `/news` | News & articles |

## Run Locally

```bash
npm install
npm run dev
```

The dev server starts at `http://localhost:5173`.

## Build

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── components/     # Layout, NavBar, TickerBar, CountdownTimer
├── data/           # roster.ts, schedule.ts, news.ts
├── lib/            # utils (cn helper)
├── pages/          # Home, Roster, Schedule, News
├── App.tsx
├── main.tsx
└── index.css
```
