export interface Staff {
  id: number | string
  name: string
  title: string
  /** 'coaching' | 'support' */
  category: 'coaching' | 'support'
  bio: string
  email: string
  phone: string
  twitter: string
  image: string | null
  sort_order: number
}

export const staffRoster: Staff[] = [
  {
    id: 1,
    name: 'Lenlee Klusman',
    title: 'Head Coach',
    category: 'coaching',
    bio: 'Head Coach of the Orlando Lady Comets for the 2026 inaugural season. A proven leader who brings intensity, vision, and a player-first philosophy to the program. Coach Klusman is committed to building a championship culture in Orlando from day one.',
    email: 'headcoach@ladycomets.com',
    phone: '',
    twitter: '',
    image: '/images/staff/lenlee-klusman.png',
    sort_order: 1,
  },
  {
    id: 2,
    name: 'Coach Name',
    title: 'Associate Head Coach',
    category: 'coaching',
    bio: 'Specializes in defensive schemes and player development. A former collegiate standout who brings intensity and technical precision to every practice. Her ability to break down film and translate it into in-game adjustments has made her one of the most respected minds on the coaching staff.',
    email: 'assoc.coach@ladycomets.com',
    phone: '',
    twitter: '',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600&q=80',
    sort_order: 2,
  },
  {
    id: 3,
    name: 'Coach Name',
    title: 'Assistant Coach',
    category: 'coaching',
    bio: "Oversees player development and skill work for the Lady Comets' perimeter players. Brings an analytics-forward approach to shot selection and spacing that has elevated the team's three-point efficiency. A rising voice in the coaching profession with experience at both the collegiate and professional levels.",
    email: 'asst.coach@ladycomets.com',
    phone: '',
    twitter: '',
    image: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=600&q=80',
    sort_order: 3,
  },
  {
    id: 4,
    name: 'Staff Name',
    title: 'Director of Basketball Operations',
    category: 'support',
    bio: 'Manages the day-to-day infrastructure of the program — travel logistics, practice scheduling, film coordination, and everything in between — so the coaches can focus entirely on the court. Her organizational precision and calm under pressure are the backbone of how this program runs.',
    email: 'operations@ladycomets.com',
    phone: '',
    twitter: '',
    image: null,
    sort_order: 4,
  },
  {
    id: 5,
    name: 'Staff Name',
    title: 'Head Strength & Conditioning Coach',
    category: 'support',
    bio: 'Designs individualized performance programs that build explosiveness, prevent injury, and keep every athlete at peak readiness across a full season. A certified strength specialist whose approach blends sports science with athlete-centered coaching to maximize output at game time.',
    email: 'strength@ladycomets.com',
    phone: '',
    twitter: '',
    image: null,
    sort_order: 5,
  },
  {
    id: 6,
    name: 'Staff Name',
    title: 'Video & Analytics Coordinator',
    category: 'support',
    bio: 'Leads the team\'s film operation and statistical analysis pipeline. Responsible for opponent scouting reports, real-time data visualization during games, and post-game analytics breakdowns that inform practice planning. Bridges the gap between raw data and on-court execution.',
    email: 'video@ladycomets.com',
    phone: '',
    twitter: '',
    image: null,
    sort_order: 6,
  },
]
