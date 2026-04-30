import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Clock, Check, Ticket, BarChart2, X } from 'lucide-react'
import { allGames, ticketTiers } from '@/data/schedule'

// Set to true once a ticketing provider is configured
const SHOW_TICKETS = false
import { supabase, getPhotoUrl, type DbGame } from '@/lib/supabase'
import { useBoxScore } from '@/hooks/useBoxScore'
import { cn } from '@/lib/utils'

// ── Box Score Modal ───────────────────────────────────────────────────────────

interface BoxScoreModalProps {
  game: DbGame
  onClose: () => void
}

function fmt(made: number, att: number): string {
  return `${made}/${att}`
}

function BoxScoreModal({ game, onClose }: BoxScoreModalProps) {
  const { stats, loading } = useBoxScore(game.id)

  // Totals
  const totals = stats.reduce(
    (acc, r) => ({
      points: acc.points + r.points,
      rebounds: acc.rebounds + r.rebounds,
      assists: acc.assists + r.assists,
      steals: acc.steals + r.steals,
      blocks: acc.blocks + r.blocks,
      turnovers: acc.turnovers + r.turnovers,
      fgm: acc.fgm + r.fgm,
      fga: acc.fga + r.fga,
      threepm: acc.threepm + r.threepm,
      threepa: acc.threepa + r.threepa,
      ftm: acc.ftm + r.ftm,
      fta: acc.fta + r.fta,
    }),
    { points: 0, rebounds: 0, assists: 0, steals: 0, blocks: 0, turnovers: 0, fgm: 0, fga: 0, threepm: 0, threepa: 0, ftm: 0, fta: 0 },
  )

  const scoreStr = game.team_score != null && game.opponent_score != null
    ? `${game.team_score}–${game.opponent_score}`
    : null

  const opponentLabel = game.home_away === 'AWAY'
    ? `@ ${game.opponent.toUpperCase()}`
    : `VS. ${game.opponent.toUpperCase()}`

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative z-10 w-full max-w-3xl overflow-hidden glass-panel"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">
              Box Score · {game.date}
            </p>
            <h2 className="text-xl font-black uppercase text-white leading-tight">
              Lady Comets {opponentLabel}
            </h2>
            <div className="flex items-center gap-3 mt-2">
              {game.result && (
                <span
                  className={cn(
                    'text-xs font-black uppercase tracking-widest px-2 py-0.5',
                    game.result === 'W' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400',
                  )}
                >
                  {game.result}
                </span>
              )}
              {scoreStr && (
                <span className="text-lg font-black text-white font-mono">{scoreStr}</span>
              )}
              {game.venue && (
                <span className="flex items-center gap-1 text-xs text-white/30">
                  <MapPin className="w-3 h-3" />
                  {game.venue}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white transition-colors shrink-0 mt-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : stats.length === 0 ? (
            <div className="py-14 text-center">
              <p className="text-white/30 text-sm">Box score not yet available.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-white/30">Player</th>
                  {['MIN','PTS','REB','AST','STL','BLK','TO','FG','3PT','FT'].map((h) => (
                    <th key={h} className="px-3 py-2.5 text-[10px] font-black uppercase tracking-widest text-white/30 text-center">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.map((row, i) => {
                  const photo = getPhotoUrl(row.photo_path)
                  return (
                    <tr
                      key={row.id}
                      className={cn('border-b border-white/5', i % 2 === 0 ? 'bg-white/[0.02]' : '')}
                    >
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded overflow-hidden shrink-0 bg-white/5">
                            {photo ? (
                              <img src={photo} alt={row.player_name} className="w-full h-full object-cover object-top" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-white/20 text-xs font-black">
                                {row.player_name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <span className="text-white font-bold whitespace-nowrap">{row.player_name}</span>
                          {row.jersey_number != null && (
                            <span className="text-white/30 text-xs">#{row.jersey_number}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-center text-white/60">{row.minutes ?? '—'}</td>
                      <td className="px-3 py-2.5 text-center font-black text-primary">{row.points}</td>
                      <td className="px-3 py-2.5 text-center text-white/80">{row.rebounds}</td>
                      <td className="px-3 py-2.5 text-center text-white/80">{row.assists}</td>
                      <td className="px-3 py-2.5 text-center text-white/80">{row.steals}</td>
                      <td className="px-3 py-2.5 text-center text-white/80">{row.blocks}</td>
                      <td className="px-3 py-2.5 text-center text-white/80">{row.turnovers}</td>
                      <td className="px-3 py-2.5 text-center text-white/80">{fmt(row.fgm, row.fga)}</td>
                      <td className="px-3 py-2.5 text-center text-white/80">{fmt(row.threepm, row.threepa)}</td>
                      <td className="px-3 py-2.5 text-center text-white/80">{fmt(row.ftm, row.fta)}</td>
                    </tr>
                  )
                })}
              </tbody>
              {/* Totals footer */}
              <tfoot>
                <tr className="border-t border-white/20 bg-white/[0.04]">
                  <td className="px-4 py-2.5 text-xs font-black uppercase tracking-widest text-white/40">Team</td>
                  <td className="px-3 py-2.5 text-center text-white/40">—</td>
                  <td className="px-3 py-2.5 text-center font-black text-primary">{totals.points}</td>
                  <td className="px-3 py-2.5 text-center font-bold text-white">{totals.rebounds}</td>
                  <td className="px-3 py-2.5 text-center font-bold text-white">{totals.assists}</td>
                  <td className="px-3 py-2.5 text-center font-bold text-white">{totals.steals}</td>
                  <td className="px-3 py-2.5 text-center font-bold text-white">{totals.blocks}</td>
                  <td className="px-3 py-2.5 text-center font-bold text-white">{totals.turnovers}</td>
                  <td className="px-3 py-2.5 text-center font-bold text-white">{fmt(totals.fgm, totals.fga)}</td>
                  <td className="px-3 py-2.5 text-center font-bold text-white">{fmt(totals.threepm, totals.threepa)}</td>
                  <td className="px-3 py-2.5 text-center font-bold text-white">{fmt(totals.ftm, totals.fta)}</td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Schedule Page ─────────────────────────────────────────────────────────────

export default function Schedule() {
  // Index DB games by schedule_id for O(1) lookup
  const [dbGames, setDbGames] = useState<Map<number, DbGame>>(new Map())
  const [selectedGame, setSelectedGame] = useState<DbGame | null>(null)

  useEffect(() => {
    supabase
      .from('games')
      .select('*')
      .then(({ data }) => {
        const map = new Map<number, DbGame>()
        for (const g of (data ?? []) as DbGame[]) {
          if (g.schedule_id != null) map.set(g.schedule_id, g)
        }
        setDbGames(map)
      })
  }, [])

  return (
    <div className="max-w-5xl mx-auto px-4 py-12" data-testid="schedule-page">
      {/* Header */}
      <div className="mb-10">
        <p className="text-xs font-black uppercase tracking-widest text-primary">2026 Season</p>
        <h1 className="text-4xl font-black uppercase text-white mt-1">Schedule</h1>
      </div>

      {/* Games list */}
      <div className="space-y-3 mb-16">
        {allGames.map((game, i) => {
          const dbGame = dbGames.get(game.id)
          const hasResult = dbGame?.result != null

          return (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={cn(
                'relative overflow-hidden group',
                game.isNext
                  ? 'border border-primary/50 bg-primary/5 transition-all duration-300 hover:bg-primary/[0.08]'
                  : game.past
                  ? 'border border-white/5 opacity-60 transition-all duration-200 hover:opacity-75'
                  : 'border border-white/10 hover:border-white/20 hover:bg-white/[0.03] transition-all duration-300',
              )}
            >
              {game.isNext && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-primary animate-pulse" />
              )}

              <div className="flex items-center justify-between p-4 flex-wrap gap-3">
                {/* Date & opponent */}
                <div className="flex items-center gap-4 min-w-0">
                  <div className="text-center min-w-[70px]">
                    <p className="text-xs font-black text-white/40 uppercase">
                      {game.displayDate.split(' ')[0]}
                    </p>
                    <p className="text-2xl font-black text-white leading-tight">
                      {game.displayDate.split(' ')[1]?.replace(',', '')}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          'text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5',
                          game.homeAway === 'HOME'
                            ? 'bg-primary/20 text-primary'
                            : game.homeAway === 'TOURNAMENT'
                            ? 'bg-accent/20 text-accent'
                            : 'bg-white/10 text-white/50',
                        )}
                      >
                        {game.homeAway}
                      </span>
                      <h3 className="text-lg font-black uppercase text-white">{game.opponent}</h3>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-white/40">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {game.venue}
                      </span>
                      {!game.past && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {game.time}
                        </span>
                      )}
                      {game.note && (
                        <span className="text-primary font-bold">{game.note}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Result / Box Score / Tickets */}
                <div className="flex items-center gap-3">
                  {hasResult && dbGame ? (
                    <>
                      <div className="text-right">
                        <span
                          className={cn(
                            'text-xs font-black uppercase tracking-widest px-2 py-0.5',
                            dbGame.result === 'W' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400',
                          )}
                        >
                          {dbGame.result}
                        </span>
                        {dbGame.team_score != null && dbGame.opponent_score != null && (
                          <p className="text-sm font-black text-white mt-1">
                            {dbGame.team_score}–{dbGame.opponent_score}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => setSelectedGame(dbGame)}
                        className="px-4 py-2 text-xs font-black uppercase tracking-widest bg-white/10 text-white hover:bg-white/20 transition-colors duration-300 skew-x-[-8deg]"
                      >
                        <span className="skew-x-[8deg] flex items-center gap-1.5">
                          <BarChart2 className="w-3 h-3" />
                          Box Score
                        </span>
                      </button>
                    </>
                  ) : game.past ? (
                    <div className="text-right">
                      <span
                        className={cn(
                          'text-xs font-black uppercase tracking-widest px-2 py-0.5',
                          game.result === 'W' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400',
                        )}
                      >
                        {game.result}
                      </span>
                      {game.score && (
                        <p className="text-sm font-black text-white mt-1">{game.score}</p>
                      )}
                    </div>
                  ) : SHOW_TICKETS ? (
                    <button className="px-4 py-2 text-xs font-black uppercase tracking-widest bg-primary text-black hover:bg-white transition-colors duration-300 skew-x-[-8deg]">
                      <span className="skew-x-[8deg] flex items-center gap-1.5">
                        <Ticket className="w-3 h-3" />
                        Tickets
                      </span>
                    </button>
                  ) : (
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/20 px-2 py-0.5 border border-white/10">
                      Upcoming
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Ticket tiers — hidden until ticketing provider is configured (SHOW_TICKETS flag) */}
      {SHOW_TICKETS && (
        <div className="mb-6">
          <p className="text-xs font-black uppercase tracking-widest text-white/30 mb-8">
            Secure Your Seats
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ticketTiers.map((tier) => (
              <div
                key={tier.tier}
                className="relative overflow-hidden group cursor-pointer border border-white/10 hover:border-white/20 transition-colors"
              >
                <div
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{ backgroundColor: tier.accent }}
                />
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-black uppercase text-white">{tier.tier}</h3>
                    <span
                      className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5"
                      style={{ backgroundColor: `${tier.accent}22`, color: tier.accent }}
                    >
                      {tier.tag}
                    </span>
                  </div>
                  <p className="text-4xl font-black mb-5" style={{ color: tier.accent }}>
                    {tier.price}
                  </p>
                  <ul className="space-y-2 mb-5">
                    {tier.features.map((f) => (
                      <li key={f} className="text-sm text-white/60 flex items-center gap-2">
                        <Check className="w-3 h-3 shrink-0" style={{ color: tier.accent }} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    className="w-full py-3 text-xs font-black uppercase tracking-widest transition-all duration-300 relative"
                    style={{ backgroundColor: tier.accent, color: 'black' }}
                  >
                    <span className="relative z-10">Get Tickets</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Box Score Modal */}
      <AnimatePresence>
        {selectedGame && (
          <BoxScoreModal game={selectedGame} onClose={() => setSelectedGame(null)} />
        )}
      </AnimatePresence>
    </div>
  )
}
