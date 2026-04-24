export type HomeAway = 'HOME' | 'AWAY' | 'TOURNAMENT'

export interface Game {
  id: number
  date: string          // ISO: "2026-06-06"
  displayDate: string   // Human: "Jun 6–7, 2026"
  time: string          // "TBD" | "7:00 PM ET" | "Completed"
  opponent: string
  homeAway: HomeAway
  result: 'W' | 'L' | null
  score: string | null
  venue: string
  past: boolean
  isNext?: boolean
  note?: string
}

export const allGames: Game[] = [
  {
    id: 1,
    date: '2026-06-06',
    displayDate: 'Jun 6–7, 2026',
    time: 'TBD',
    opponent: 'USA Pride Cup',
    homeAway: 'TOURNAMENT',
    result: null,
    score: null,
    venue: 'Orlando, FL',
    past: false,
  },
  {
    id: 2,
    date: '2026-06-14',
    displayDate: 'Jun 14, 2026',
    time: '7:00 PM ET',
    opponent: 'Atlanta Reign',
    homeAway: 'HOME',
    result: null,
    score: null,
    venue: 'Amway Center',
    past: false,
  },
  {
    id: 3,
    date: '2026-06-21',
    displayDate: 'Jun 21, 2026',
    time: '7:00 PM ET',
    opponent: 'Miami Waves',
    homeAway: 'AWAY',
    result: null,
    score: null,
    venue: 'Kaseya Center',
    past: false,
  },
  {
    id: 4,
    date: '2026-06-28',
    displayDate: 'Jun 28, 2026',
    time: '7:00 PM ET',
    opponent: 'Tampa Bay Thunder',
    homeAway: 'HOME',
    result: null,
    score: null,
    venue: 'Amway Center',
    past: false,
  },
  {
    id: 5,
    date: '2026-07-05',
    displayDate: 'Jul 5, 2026',
    time: '7:00 PM ET',
    opponent: 'Charlotte Fury',
    homeAway: 'HOME',
    result: null,
    score: null,
    venue: 'Amway Center',
    past: false,
  },
  {
    id: 6,
    date: '2026-07-12',
    displayDate: 'Jul 12, 2026',
    time: '7:00 PM ET',
    opponent: 'Jacksonville Jets',
    homeAway: 'AWAY',
    result: null,
    score: null,
    venue: 'VyStar Arena',
    past: false,
  },
  {
    id: 7,
    date: '2026-07-19',
    displayDate: 'Jul 19, 2026',
    time: '7:00 PM ET',
    opponent: 'Raleigh Storm',
    homeAway: 'HOME',
    result: null,
    score: null,
    venue: 'Amway Center',
    past: false,
  },
  {
    id: 8,
    date: '2026-08-02',
    displayDate: 'Aug 2, 2026',
    time: '7:00 PM ET',
    opponent: 'Atlanta Reign',
    homeAway: 'AWAY',
    result: null,
    score: null,
    venue: 'State Farm Arena',
    past: false,
  },
  {
    id: 9,
    date: '2026-08-09',
    displayDate: 'Aug 9, 2026',
    time: '7:00 PM ET',
    opponent: 'Miami Waves',
    homeAway: 'HOME',
    result: null,
    score: null,
    venue: 'Amway Center',
    past: false,
    note: 'Championship Night',
  },
]

/** Returns the next upcoming game (first game whose date is today or in the future). */
export function getNextGame(): Game | undefined {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return allGames.find((g) => new Date(g.date) >= today)
}

/** Returns all games that haven't been played yet. */
export function getUpcomingGames(): Game[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return allGames.filter((g) => new Date(g.date) >= today)
}

export interface TicketTier {
  tier: string
  price: string
  features: string[]
  accent: string
  tag: string
}

export const ticketTiers: TicketTier[] = [
  {
    tier: 'Court Side',
    price: '$280',
    features: ['Front row access', 'Complimentary drink', 'Meet & greet entry'],
    accent: 'hsl(45 100% 60%)',
    tag: 'Premium',
  },
  {
    tier: 'Lower Bowl',
    price: '$120',
    features: ['Lower level seats', 'Premium view', 'Priority entry'],
    accent: 'hsl(190 100% 55%)',
    tag: 'Popular',
  },
  {
    tier: 'Upper Bowl',
    price: '$45',
    features: ['Great atmosphere', 'Easy access', 'Standard entry'],
    accent: 'hsl(320 100% 65%)',
    tag: 'Value',
  },
]
