export interface Game {
  id: number
  date: string
  time: string
  opponent: string
  homeAway: 'HOME' | 'AWAY'
  result: 'W' | 'L' | null
  score: string | null
  venue: string
  sold: boolean
  past: boolean
  isNext?: boolean
}

export const schedule: Game[] = [
  {
    id: 1,
    date: 'Apr 10, 2026',
    time: 'Completed',
    opponent: 'Phoenix Mercury',
    homeAway: 'HOME',
    result: 'W',
    score: '98 – 85',
    venue: 'Comet Dome, Orlando',
    sold: true,
    past: true,
  },
  {
    id: 2,
    date: 'Apr 17, 2026',
    time: 'Completed',
    opponent: 'Seattle Storm',
    homeAway: 'AWAY',
    result: 'W',
    score: '101 – 94',
    venue: 'Climate Pledge Arena',
    sold: true,
    past: true,
  },
  {
    id: 3,
    date: 'Apr 23, 2026',
    time: 'Completed',
    opponent: 'Las Vegas Aces',
    homeAway: 'HOME',
    result: 'W',
    score: '112 – 88',
    venue: 'Comet Dome, Orlando',
    sold: true,
    past: true,
  },
  {
    id: 4,
    date: 'May 15, 2026',
    time: '7:30 PM ET',
    opponent: 'Seattle Storm',
    homeAway: 'HOME',
    result: null,
    score: null,
    venue: 'Comet Dome, Orlando',
    sold: false,
    past: false,
    isNext: true,
  },
  {
    id: 5,
    date: 'May 22, 2026',
    time: '8:00 PM ET',
    opponent: 'Dallas Wings',
    homeAway: 'AWAY',
    result: null,
    score: null,
    venue: 'College Park Center',
    sold: false,
    past: false,
  },
  {
    id: 6,
    date: 'May 29, 2026',
    time: '7:00 PM ET',
    opponent: 'Indiana Fever',
    homeAway: 'HOME',
    result: null,
    score: null,
    venue: 'Comet Dome, Orlando',
    sold: false,
    past: false,
  },
  {
    id: 7,
    date: 'Jun 5, 2026',
    time: '6:30 PM ET',
    opponent: 'Connecticut Sun',
    homeAway: 'AWAY',
    result: null,
    score: null,
    venue: 'Mohegan Sun Arena',
    sold: false,
    past: false,
  },
  {
    id: 8,
    date: 'Jun 12, 2026',
    time: '7:30 PM ET',
    opponent: 'Atlanta Dream',
    homeAway: 'HOME',
    result: null,
    score: null,
    venue: 'Comet Dome, Orlando',
    sold: false,
    past: false,
  },
  {
    id: 9,
    date: 'Jun 19, 2026',
    time: '8:30 PM ET',
    opponent: 'Los Angeles Sparks',
    homeAway: 'AWAY',
    result: null,
    score: null,
    venue: 'Crypto.com Arena',
    sold: false,
    past: false,
  },
  {
    id: 10,
    date: 'Jun 28, 2026',
    time: '7:00 PM ET',
    opponent: 'Phoenix Mercury',
    homeAway: 'HOME',
    result: null,
    score: null,
    venue: 'Comet Dome, Orlando',
    sold: false,
    past: false,
  },
]

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
