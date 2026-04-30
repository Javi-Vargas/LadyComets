import { useState, useEffect } from 'react'
import { Link } from 'wouter'
import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import CountdownTimer from '@/components/CountdownTimer'
import { getNextGame } from '@/data/schedule'
import { supabase, getContentImageUrl, type DbContentItem, type DbGame } from '@/lib/supabase'

// Set to true once a ticketing provider is configured
const SHOW_TICKETS = false
// Set to true once the team is in a league with trackable opponent records
const SHOW_STANDINGS = false

const nextGame = getNextGame()

/* ── Standings — opponent rows are static; Lady Comets row is derived live ── */
const OPPONENT_STANDINGS = [
  { team: 'Storm',   w: 22, l: 8  },
  { team: 'Mystics', w: 19, l: 11 },
  { team: 'Wings',   w: 17, l: 13 },
]

/* ── Type for all bento grid items ── */
interface BentoCardData {
  id: string
  colSpan: string
  rowSpan: string
  category: string
  title: string
  excerpt?: string | null
  image?: string | null
  accent: string
  large: boolean
  instagram_url?: string | null
  isTicket?: boolean
  isStandings?: boolean
}

/* Utility cards injected after CMS feed cards */
const TICKET_CARD: BentoCardData = {
  id: 'tickets-cta',
  colSpan: 'md:col-span-1',
  rowSpan: 'md:row-span-1',
  category: 'LIVE',
  title: nextGame ? `${nextGame.displayDate.toUpperCase()} VS ${nextGame.opponent.toUpperCase()}` : 'UPCOMING',
  excerpt: "Home court. Playoff energy. Get your seats before they're gone.",
  image: null,
  accent: 'hsl(var(--accent))',
  large: false,
  isTicket: true,
}

const STANDINGS_CARD: BentoCardData = {
  id: 'standings',
  colSpan: 'md:col-span-1',
  rowSpan: 'md:row-span-1',
  category: 'STANDINGS',
  title: 'EASTERN CONFERENCE',
  accent: 'hsl(var(--muted))',
  large: false,
  isStandings: true,
}

/* Maps DB type slug → display category label */
const CATEGORY_LABELS: Record<string, string> = {
  feature: 'FEATURE',
  player_spotlight: 'PLAYER SPOTLIGHT',
  culture: 'THE CULTURE',
  game_recap: 'GAME RECAP',
  training: 'TRAINING',
  merch: 'MERCH',
  general: 'NEWS',
}

function dbItemToBentoCard(item: DbContentItem): BentoCardData {
  return {
    id: String(item.id),
    colSpan: item.col_span ?? 'md:col-span-1',
    rowSpan: item.row_span ?? 'md:row-span-1',
    category: CATEGORY_LABELS[item.type] ?? item.type.toUpperCase().replace(/_/g, ' '),
    title: item.title,
    excerpt: item.excerpt,
    image: getContentImageUrl(item),
    accent: item.accent ?? 'hsl(var(--primary))',
    large: item.large,
    instagram_url: item.instagram_url,
  }
}

/* ── Bento card ── */
function BentoCard({ card, cometsWins, cometsLosses }: { card: BentoCardData; cometsWins: number; cometsLosses: number }) {
  if (card.isTicket) {
    return (
      <div className={`${card.colSpan} ${card.rowSpan} relative overflow-hidden cursor-pointer group`}>
        <div
          className="h-full flex flex-col justify-between p-6 border border-primary/30"
          style={{ background: 'radial-gradient(ellipse at top, hsl(var(--accent)/0.15), transparent)' }}
        >
          <div>
            <span className="text-xs text-primary font-bold uppercase tracking-wider">{card.category}</span>
            <h3 className="text-2xl font-black uppercase text-white tracking-tight mt-1">{card.title}</h3>
            <p className="text-sm text-white/50 mt-1">{card.excerpt}</p>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <Link
              href="/schedule"
              className="bg-primary text-black font-black uppercase text-xs px-4 py-2 hover:bg-white transition-colors duration-300 skew-x-[-8deg]"
            >
              <span className="skew-x-[8deg] flex items-center gap-1">
                View Schedule
              </span>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (card.isStandings) {
    const standings = [
      { team: 'Lady Comets', w: cometsWins, l: cometsLosses },
      ...OPPONENT_STANDINGS,
    ].sort((a, b) => b.w - a.w)

    return (
      <div className={`${card.colSpan} ${card.rowSpan} h-full p-5 glass-panel flex flex-col`}>
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-black uppercase tracking-wider text-white mb-3">{card.title}</span>
        </div>
        <div className="space-y-2 flex-1">
          {standings.map((row, i) => {
            const isComets = row.team === 'Lady Comets'
            return (
              <div key={row.team} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className={isComets ? 'text-primary font-black' : 'text-white/40'}>{i + 1}</span>
                  <span className={isComets ? 'text-white font-bold' : 'text-white/60'}>{row.team}</span>
                </div>
                <span className={isComets ? 'text-primary font-black' : 'text-white/40'}>
                  {row.w}–{row.l}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const inner = (
    <>
      {card.image && (
        <div className="absolute inset-0 z-0">
          <img
            src={card.image}
            alt={card.title}
            className="w-full h-full object-cover opacity-40 group-hover:opacity-55 group-hover:scale-105 transition-all duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        </div>
      )}
      <div className="relative z-20 p-5 h-full flex flex-col justify-end">
        <span className="text-xs font-bold uppercase tracking-wider text-white/50 mb-1">{card.category}</span>
        <h3
          className={`font-black uppercase text-white tracking-tight ${card.large ? 'text-2xl md:text-3xl' : 'text-lg'}`}
        >
          {card.title}
        </h3>
        {card.excerpt && (
          <p className="text-sm text-white/50 mt-2 line-clamp-2">{card.excerpt}</p>
        )}
        {card.instagram_url && (
          <span className="mt-2 self-start text-[10px] font-bold text-pink-400/60 group-hover:text-pink-400 transition-colors uppercase tracking-widest">
            View on Instagram ↗
          </span>
        )}
      </div>
    </>
  )

  if (card.instagram_url) {
    return (
      <a
        href={card.instagram_url}
        target="_blank"
        rel="noopener noreferrer"
        className={`${card.colSpan} ${card.rowSpan} relative overflow-hidden cursor-pointer group block transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.45)]`}
      >
        {inner}
      </a>
    )
  }

  return (
    <Link href="/news" className={`${card.colSpan} ${card.rowSpan} relative overflow-hidden cursor-pointer group block transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.45)]`}>
      {inner}
    </Link>
  )
}

export default function Home() {
  const [feedItems, setFeedItems] = useState<BentoCardData[]>([])
  const [feedLoading, setFeedLoading] = useState(true)
  const [cometsWins, setCometsWins] = useState(0)
  const [cometsLosses, setCometsLosses] = useState(0)

  useEffect(() => {
    async function loadFeed() {
      const { data } = await supabase
        .from('content_items')
        .select('*')
        .eq('section', 'feed')
        .eq('published', true)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false })
      setFeedItems(((data ?? []) as DbContentItem[]).map(dbItemToBentoCard))
      setFeedLoading(false)
    }

    async function loadRecord() {
      const { data } = await supabase
        .from('games')
        .select('result')
        .not('result', 'is', null)
      const games = (data ?? []) as Pick<DbGame, 'result'>[]
      setCometsWins(games.filter((g) => g.result === 'W').length)
      setCometsLosses(games.filter((g) => g.result === 'L').length)
    }

    void loadFeed()
    void loadRecord()
  }, [])

  /* Merge DB content cards with utility cards; hide ticket CTA until ticketing is ready */
  const utilityCards = [
    ...(SHOW_TICKETS ? [TICKET_CARD] : []),
    ...(SHOW_STANDINGS ? [STANDINGS_CARD] : []),
  ]
  const allBentoItems = [...feedItems, ...utilityCards]

  return (
    <div>
      {/* ── HERO ── */}
      <section
        data-testid="hero-section"
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Background */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 80% 50% at 50% -10%, hsl(45 100% 60% / 0.3) 0%, transparent 70%), radial-gradient(ellipse 60% 40% at 90% 80%, hsl(190 100% 55% / 0.2) 0%, transparent 60%), radial-gradient(ellipse 50% 60% at 0% 60%, hsl(320 100% 65% / 0.15) 0%, transparent 55%), hsl(240 10% 4%)',
              animation: 'gradient 10s ease infinite',
              backgroundSize: '200% 200%',
            }}
          />
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                'repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(255,255,255,0.1) 40px, rgba(255,255,255,0.1) 41px), repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(255,255,255,0.1) 40px, rgba(255,255,255,0.1) 41px)',
            }}
          />
        </div>

        {/* Content */}
        <motion.div
          className="relative z-10 text-center px-4 max-w-6xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <span className="text-xs font-black uppercase tracking-[0.4em] text-primary mb-3 md:mb-4 inline-block">
              2026 Season
            </span>
            <h1 className="text-[clamp(5rem,18vw,18rem)] font-black leading-[0.85] uppercase tracking-tight text-white">
              <span className="block">LADY COMETS</span>
              <span
                className="block text-stroke"
                style={{ WebkitTextStroke: '2px hsl(219 82% 55%)' }}
              >
                IGNITE
              </span>
            </h1>
            <p className="text-base md:text-xl text-white/50 mt-3 md:mt-4 max-w-xl mx-auto font-medium tracking-wide">
              Rising stars. Cultural icons. The future of the game.
            </p>
          </motion.div>

          {/* Countdown */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
            className="mt-6 md:mt-8 mb-5 md:mb-6"
          >
            <div className="inline-block glass-panel px-6 py-5 md:px-10 md:py-7">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-4 text-center">
                {nextGame
                  ? `Next Game — ${nextGame.displayDate} vs ${nextGame.opponent}`
                  : 'Season Schedule'}
              </p>
              <CountdownTimer />
            </div>
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link
              href="/schedule"
              data-testid="hero-schedule"
              className="group relative bg-primary text-black font-black uppercase text-sm px-8 py-4 tracking-widest flex items-center gap-3 skew-x-[-8deg] hover:bg-white transition-all duration-300 shadow-[0_0_30px_rgba(255,200,40,0.45)]"
            >
              <span className="skew-x-[8deg] flex items-center gap-3">
                View Schedule
              </span>
            </Link>
            <Link
              href="/roster"
              data-testid="hero-meet-team"
              className="group text-white/70 font-bold uppercase text-sm tracking-widest flex items-center gap-2 hover:text-white transition-colors duration-300"
            >
              Meet the Team
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
            className="w-px h-12 bg-gradient-to-b from-white/30 to-transparent"
          />
        </div>
      </section>

      {/* ── SEASON STATS ── */}
      <section className="py-12 overflow-hidden relative">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-wrap gap-12 justify-center">
            <div className="text-center">
              <span className="text-6xl md:text-8xl font-black text-white tabular-nums">{cometsWins}</span>
              <p className="text-xs font-bold uppercase tracking-widest text-white/30 mt-2">Wins This Season</p>
            </div>
            <div className="text-center">
              <span className="text-6xl md:text-8xl font-black text-white tabular-nums">{cometsLosses}</span>
              <p className="text-xs font-bold uppercase tracking-widest text-white/30 mt-2">Losses This Season</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── BENTO NEWS GRID ── */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xs font-black uppercase tracking-widest text-white/30 mb-8">The Feed</h2>
          {feedLoading ? (
            <div className="flex justify-center py-16">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[220px]">
              {allBentoItems.map((card) => (
                <BentoCard key={card.id} card={card} cometsWins={cometsWins} cometsLosses={cometsLosses} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
