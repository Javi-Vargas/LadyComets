import { motion } from 'framer-motion'
import { Star, Heart, Trophy, Users } from 'lucide-react'

/* ── Org stats ── */
const ORG_STATS = [
  { value: '2026', label: 'Season' },
  { value: 'Orlando', label: 'Home City' },
  { value: '9', label: 'Games This Season' },
  { value: '100%', label: 'Heart & Hustle' },
]

/* ── Values ── */
const VALUES = [
  {
    icon: Star,
    title: 'Excellence',
    body: 'We hold ourselves to the highest standard on and off the court — pushing each other to be better every single day.',
  },
  {
    icon: Heart,
    title: 'Community',
    body: 'Rooted in Orlando, we invest in our city. From youth clinics to community outreach, we show up where it matters.',
  },
  {
    icon: Trophy,
    title: 'Championship Culture',
    body: 'Every rep, every film session, every early morning builds toward one goal: winning, and winning the right way.',
  },
  {
    icon: Users,
    title: 'Sisterhood',
    body: 'We are more than teammates. The bonds built inside this program last a lifetime.',
  },
]

/* ── Staff ── */
const STAFF = [
  {
    initials: 'HC',
    role: 'Head Coach',
    name: 'Coach Name',
    bio: 'A decorated basketball mind with over a decade of coaching experience. Known for developing elite guards and instilling championship DNA into every program she leads.',
  },
  {
    initials: 'AC',
    role: 'Associate Head Coach',
    name: 'Coach Name',
    bio: 'Specializes in player development and defensive schemes. A former collegiate standout who brings intensity and technical precision to every practice.',
  },
  {
    initials: 'DO',
    role: 'Director of Operations',
    name: 'Staff Name',
    bio: 'Manages the day-to-day infrastructure of the program — travel, logistics, film, and everything in between — so the coaches can focus on the court.',
  },
  {
    initials: 'SC',
    role: 'Strength & Conditioning',
    name: 'Staff Name',
    bio: 'Designs individualized performance programs that build power, prevent injury, and keep every athlete at peak readiness across a full season.',
  },
]

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: 'easeOut', delay },
})

export default function About() {
  return (
    <div data-testid="about-page">
      {/* ── HERO ── */}
      <section className="relative py-28 px-4 text-center overflow-hidden">
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              'radial-gradient(ellipse 70% 50% at 50% 0%, hsl(24 92% 50% / 0.12) 0%, transparent 70%), hsl(240 10% 4%)',
          }}
        />
        <motion.div {...fadeUp(0)}>
          <span className="text-xs font-black uppercase tracking-[0.4em] text-primary inline-block mb-4">
            Orlando Lady Comets
          </span>
          <h1 className="text-6xl md:text-8xl font-black uppercase leading-[0.9] text-white">
            Built To
            <br />
            <span className="text-primary">Compete.</span>
          </h1>
          <p className="mt-8 text-white/60 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            The Orlando Lady Comets are a professional women's basketball organization representing
            Central Florida on the national stage — developing elite talent, inspiring the next
            generation, and building something the city can be proud of.
          </p>
        </motion.div>
      </section>

      {/* ── OUR STORY ── */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Text */}
            <motion.div {...fadeUp(0.1)}>
              <span className="text-xs font-black uppercase tracking-[0.4em] text-primary mb-3 inline-block">
                The Program
              </span>
              <h2 className="text-4xl font-black uppercase text-white mb-6">Our Story</h2>
              <div className="space-y-4 text-white/60 text-sm leading-relaxed">
                <p>
                  The Lady Comets were founded with a clear vision: to create a professional
                  women's basketball program in Orlando that competes at the highest level while
                  remaining genuinely connected to the community that supports it.
                </p>
                <p>
                  From the jump, we've prioritized building a roster of hungry, skilled,
                  character-driven athletes — women who embrace the grind and lift each other
                  up in the process. The result is a team that plays hard, plays together, and
                  plays with purpose.
                </p>
                <p>
                  The 2026 season marks a new chapter. With a revamped roster, a full home
                  schedule, and a fanbase that continues to grow, the Lady Comets are ready to
                  leave their mark on Central Florida basketball.
                </p>
              </div>
            </motion.div>

            {/* Stat cards */}
            <motion.div
              {...fadeUp(0.2)}
              className="grid grid-cols-2 gap-3"
            >
              {ORG_STATS.map((s) => (
                <div
                  key={s.label}
                  className="bg-card border border-white/10 p-5 flex flex-col gap-1"
                >
                  <span className="text-3xl md:text-4xl font-black text-primary">{s.value}</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
                    {s.label}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── OUR VALUES ── */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeUp(0)} className="text-center mb-12">
            <span className="text-xs font-black uppercase tracking-[0.4em] text-primary mb-3 inline-block">
              What We Stand For
            </span>
            <h2 className="text-4xl font-black uppercase text-white">Our Values</h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {VALUES.map((v, i) => {
              const Icon = v.icon
              return (
                <motion.div
                  key={v.title}
                  {...fadeUp(i * 0.08)}
                  className="bg-card border border-white/10 p-6 flex flex-col gap-4 hover:border-primary/30 transition-colors"
                >
                  <div className="w-10 h-10 flex items-center justify-center border border-primary/30 bg-primary/10">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-white mb-2">
                      {v.title}
                    </h3>
                    <p className="text-xs text-white/50 leading-relaxed">{v.body}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── COACHES & STAFF ── */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeUp(0)} className="text-center mb-12">
            <span className="text-xs font-black uppercase tracking-[0.4em] text-primary mb-3 inline-block">
              The People Behind the Team
            </span>
            <h2 className="text-4xl font-black uppercase text-white">Coaches &amp; Staff</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {STAFF.map((s, i) => (
              <motion.div
                key={s.role}
                {...fadeUp(i * 0.08)}
                className="bg-card border border-white/10 p-6 flex items-start gap-4 hover:border-primary/30 transition-colors"
              >
                {/* Initials badge */}
                <div className="w-12 h-12 shrink-0 flex items-center justify-center bg-primary/15 border border-primary/30">
                  <span className="text-sm font-black text-primary">{s.initials}</span>
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-0.5">
                    {s.role}
                  </p>
                  <h3 className="text-lg font-black uppercase text-white mb-2">{s.name}</h3>
                  <p className="text-xs text-white/50 leading-relaxed">{s.bio}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
