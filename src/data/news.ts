export interface Article {
  id: number
  category: string
  title: string
  excerpt: string
  date: string
  readTime: string
  image: string
  featured: boolean
  wide: boolean
}

export const articles: Article[] = [
  {
    id: 1,
    category: 'Feature',
    title: 'Zara Vance On Her Unstoppable Season, Mental Fortitude, And What Comes Next',
    excerpt:
      "In an exclusive sit-down, the Lady Comets' star point guard opens up about the weight of expectations and the fire that keeps her going.",
    date: 'Apr 18, 2026',
    readTime: '8 min read',
    image: 'https://images.unsplash.com/photo-1526976668912-1a811878dd37?w=900&q=80',
    featured: true,
    wide: false,
  },
  {
    id: 2,
    category: 'Culture',
    title: 'The Lady Comets Effect: How A Basketball Team Became A Cultural Movement',
    excerpt:
      'From sold-out arenas to fashion collabs and chart-topping playlists, the Lady Comets are no longer just a team — they\'re a scene.',
    date: 'Apr 15, 2026',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?w=700&q=80',
    featured: false,
    wide: true,
  },
  {
    id: 3,
    category: 'Game Recap',
    title: '112 – 88: Lady Comets Dismantle Aces In Historic Blowout',
    excerpt:
      'It was never close. The Lady Comets controlled every quarter and sent a message to the entire league.',
    date: 'Apr 23, 2026',
    readTime: '4 min read',
    image: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=600&q=80',
    featured: false,
    wide: false,
  },
  {
    id: 4,
    category: 'Training',
    title: "Inside The Lady Comets' Off-Season Grind: Five Days With The Champions",
    excerpt:
      "We spent a week inside the team's training facility. What we found was a level of dedication that borders on obsession.",
    date: 'Apr 12, 2026',
    readTime: '10 min read',
    image: 'https://images.unsplash.com/photo-1546519638405-a9d1bbe7aa73?w=600&q=80',
    featured: false,
    wide: false,
  },
  {
    id: 5,
    category: 'Merch',
    title: "The New Jersey Drop Is Here — And It's Already Selling Out",
    excerpt: "The 2026 alternate jersey collab just hit the shelves. Here's everything you need to know.",
    date: 'Apr 10, 2026',
    readTime: '2 min read',
    image: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=600&q=80',
    featured: false,
    wide: false,
  },
  {
    id: 6,
    category: 'Feature',
    title: "Amara Diallo: The Center Who Changed The Game's Definition Of Dominant",
    excerpt:
      "At 6'6\", Diallo doesn't just play basketball — she bends it to her will. An in-depth look at the most unstoppable force in the league.",
    date: 'Apr 8, 2026',
    readTime: '7 min read',
    image: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=600&q=80',
    featured: false,
    wide: true,
  },
  {
    id: 7,
    category: 'Game Recap',
    title: 'Road Warriors: Lady Comets Take Down Storm 101–94 In Seattle',
    excerpt:
      'On the road, against a hostile crowd, the Lady Comets showed why they\'re championship material.',
    date: 'Apr 17, 2026',
    readTime: '3 min read',
    image: 'https://images.unsplash.com/photo-1583614952914-f1de3e9b3e58?w=600&q=80',
    featured: false,
    wide: false,
  },
]
