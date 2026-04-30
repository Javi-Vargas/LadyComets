import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { usePlayers } from '@/hooks/usePlayers'
import { usePlayerStats } from '@/hooks/usePlayerStats'
import { type Player } from '@/data/roster'
import { cn } from '@/lib/utils'

const ALL_POSITIONS = ['ALL', 'PG', 'SG', 'SF', 'PF', 'C'] as const
type FilterPos = typeof ALL_POSITIONS[number]

/** "PG,SF" or ['PG','SF'] → "PG · SF" */
function posDisplay(player: Player): string {
  if (player.positions.length > 0) return player.positions.join(' · ')
  return player.position
}

// ── Averages skeleton ─────────────────────────────────────────────────────────

function AveragesSkeleton() {
  return (
    <div className="grid grid-cols-7 gap-2 animate-pulse">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="text-center">
          <div className="h-6 bg-white/10 rounded mb-1 mx-auto w-10" />
          <div className="h-2 bg-white/5 rounded w-8 mx-auto" />
        </div>
      ))}
    </div>
  )
}

// ── Player Card ───────────────────────────────────────────────────────────────

function PlayerCard({ player, onClick }: { player: Player; onClick: (p: Player) => void }) {
  const hasStats = player.pts > 0 || player.ast > 0 || player.reb > 0

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden cursor-pointer group border border-white/5 hover:border-white/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.45)]"
      onClick={() => onClick(player)}
      data-testid={`player-card-${player.id}`}
    >
      {/* Large jersey number watermark */}
      <div
        className="absolute top-0 left-0 z-10 leading-none font-black select-none text-white/[0.09] group-hover:text-white/[0.14] transition-colors"
        style={{ fontSize: 'clamp(4rem, 12vw, 8rem)' }}
      >
        {player.number || '0'}
      </div>

      {/* Photo */}
      <div className="relative h-72 overflow-hidden">
        <img
          src={player.image}
          alt={player.name}
          className="w-full h-full object-cover object-top opacity-70 group-hover:opacity-90 group-hover:scale-105 transition-all duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

        {player.isStar && (
          <div className="absolute top-3 right-3 z-20 bg-primary text-black text-[10px] font-black uppercase tracking-widest px-2 py-0.5">
            MVP
          </div>
        )}
      </div>

      {/* Info panel */}
      <div className="relative z-20 p-5 bg-card border border-white/5">
        <div className="flex items-center gap-2 mb-1">
          {player.number && (
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">
              #{player.number}
            </span>
          )}
          <span className="text-[10px] text-white/30 uppercase tracking-widest">
            {posDisplay(player)}
          </span>
        </div>
        <h3 className="text-xl font-black uppercase tracking-tight text-white">{player.name}</h3>
        {player.nickname && (
          <p className="text-xs text-white/40 font-medium italic mb-3">"{player.nickname}"</p>
        )}

        {hasStats && (
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/10 mt-2">
            <div className="text-center">
              <p className="text-lg font-black text-white">{player.pts}</p>
              <p className="text-[10px] text-white/30 uppercase tracking-wider">PPG</p>
            </div>
            <div className="text-center border-x border-white/10">
              <p className="text-lg font-black text-white">{player.ast}</p>
              <p className="text-[10px] text-white/30 uppercase tracking-wider">APG</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-black text-white">{player.reb}</p>
              <p className="text-[10px] text-white/30 uppercase tracking-wider">RPG</p>
            </div>
          </div>
        )}

        {player.height && !hasStats && (
          <p className="text-xs text-white/30 mt-2">{player.height}</p>
        )}
      </div>
    </motion.div>
  )
}

// ── Player Modal ──────────────────────────────────────────────────────────────

function PlayerModal({ player, onClose }: { player: Player; onClose: () => void }) {
  const { averages, gameLog, loading } = usePlayerStats(player.id)

  const statCols: Array<{ label: string; value: string }> = [
    { label: 'PPG', value: averages.ppg.toFixed(1) },
    { label: 'RPG', value: averages.rpg.toFixed(1) },
    { label: 'APG', value: averages.apg.toFixed(1) },
    { label: 'SPG', value: averages.spg.toFixed(1) },
    { label: 'BPG', value: averages.bpg.toFixed(1) },
    { label: 'FG%', value: `${averages.fgPct.toFixed(1)}%` },
    { label: '3P%', value: `${averages.threePct.toFixed(1)}%` },
  ]

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
        className="relative z-10 max-w-2xl w-full overflow-hidden glass-panel max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 text-white/50 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Photo hero */}
        <div className="relative h-64 overflow-hidden shrink-0">
          <img
            src={player.image}
            alt={player.name}
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
          <div className="absolute bottom-4 left-5 z-10">
            <div className="flex items-center gap-2 mb-2">
              {player.number && (
                <span className="text-xs font-black uppercase tracking-widest text-primary">
                  #{player.number}
                </span>
              )}
              <span className="text-xs text-white/40 uppercase">{posDisplay(player)}</span>
            </div>
            <h2 className="text-3xl font-black uppercase text-white tracking-tight">{player.name}</h2>
            {player.height && (
              <p className="text-sm text-white/40 mt-0.5">{player.height}</p>
            )}
          </div>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1">
          {/* Bio */}
          {player.bio && (
            <div className="px-6 pt-5 pb-4">
              <p className="text-sm text-white/60 leading-relaxed">{player.bio}</p>
            </div>
          )}

          {/* Season averages */}
          <div className="px-6 pb-4">
            <div className="border-t border-white/10 pt-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-3">
                2026 Season
                {!loading && averages.gamesPlayed > 0 && (
                  <span className="text-white/20 ml-2">· {averages.gamesPlayed} GP</span>
                )}
              </p>

              {loading ? (
                <AveragesSkeleton />
              ) : averages.gamesPlayed === 0 ? (
                <div>
                  <div className="grid grid-cols-7 gap-2">
                    {statCols.map(({ label, value }) => (
                      <div key={label} className="text-center">
                        <p className="text-lg font-black text-white font-mono">{value}</p>
                        <p className="text-[10px] text-white/30 uppercase tracking-wider mt-0.5">{label}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-white/30 mt-3 text-center">No stats recorded yet this season</p>
                </div>
              ) : (
                <div className="grid grid-cols-7 gap-2">
                  {statCols.map(({ label, value }) => (
                    <div key={label} className="text-center">
                      <p className="text-lg font-black text-white font-mono">{value}</p>
                      <p className="text-[10px] text-white/30 uppercase tracking-wider mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Game log */}
          <div className="px-6 pb-6">
            <div className="border-t border-white/10 pt-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-3">
                Game Log
              </p>

              {loading ? (
                <div className="space-y-2 animate-pulse">
                  {[1,2,3].map((i) => (
                    <div key={i} className="h-8 bg-white/5 rounded" />
                  ))}
                </div>
              ) : gameLog.length === 0 ? (
                <p className="text-xs text-white/30 py-4 text-center">No games logged yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-white/10">
                        {['Date','Opp','W/L','Min','Pts','Reb','Ast','Stl','Blk','TO','FG','3PT','FT'].map((h) => (
                          <th
                            key={h}
                            className={cn(
                              'py-2 font-black uppercase tracking-wider text-white/30',
                              h === 'Date' || h === 'Opp' ? 'text-left pr-3' : 'text-center px-1.5',
                            )}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {gameLog.map((row, i) => {
                        const g = row.game
                        const oppLabel = g.home_away === 'AWAY' ? `@ ${g.opponent}` : `vs ${g.opponent}`
                        const dateObj = new Date(g.date + 'T00:00:00')
                        const dateLabel = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                        const scoreBadge = g.team_score != null && g.opponent_score != null
                          ? ` ${g.team_score}-${g.opponent_score}`
                          : ''

                        return (
                          <tr
                            key={row.id}
                            className={cn('border-b border-white/5', i % 2 === 0 ? 'bg-white/[0.02]' : '')}
                          >
                            <td className="py-2 pr-3 text-white/50 whitespace-nowrap">{dateLabel}</td>
                            <td className="py-2 pr-3 text-white/70 whitespace-nowrap max-w-[90px] truncate">{oppLabel}</td>
                            <td className="py-2 px-1.5 text-center">
                              {g.result ? (
                                <span
                                  className={cn(
                                    'inline-block text-[10px] font-black px-1.5 py-0.5 rounded-sm whitespace-nowrap',
                                    g.result === 'W' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400',
                                  )}
                                >
                                  {g.result}{scoreBadge}
                                </span>
                              ) : '—'}
                            </td>
                            <td className="py-2 px-1.5 text-center text-white/60">{row.minutes ?? '—'}</td>
                            <td className="py-2 px-1.5 text-center font-black text-primary">{row.points}</td>
                            <td className="py-2 px-1.5 text-center text-white/80">{row.rebounds}</td>
                            <td className="py-2 px-1.5 text-center text-white/80">{row.assists}</td>
                            <td className="py-2 px-1.5 text-center text-white/80">{row.steals}</td>
                            <td className="py-2 px-1.5 text-center text-white/80">{row.blocks}</td>
                            <td className="py-2 px-1.5 text-center text-white/80">{row.turnovers}</td>
                            <td className="py-2 px-1.5 text-center text-white/60">{row.fgm}/{row.fga}</td>
                            <td className="py-2 px-1.5 text-center text-white/60">{row.threepm}/{row.threepa}</td>
                            <td className="py-2 px-1.5 text-center text-white/60">{row.ftm}/{row.fta}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Loading skeleton ──────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="overflow-hidden animate-pulse">
      <div className="h-72 bg-white/5" />
      <div className="p-5 bg-card border border-white/5">
        <div className="h-3 bg-white/10 rounded w-1/3 mb-2" />
        <div className="h-5 bg-white/10 rounded w-2/3" />
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Roster() {
  const { players, loading } = usePlayers()
  const [selected, setSelected] = useState<Player | null>(null)
  const [filter, setFilter] = useState<FilterPos>('ALL')

  const filtered = filter === 'ALL'
    ? players
    : players.filter((p) => p.positions.includes(filter) || p.position === filter)

  return (
    <div className="max-w-7xl mx-auto px-4 py-12" data-testid="roster-page">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-primary">2026 Season</p>
          <h1 className="text-4xl font-black uppercase text-white mt-1">The Squad</h1>
        </div>

        {/* Position filter */}
        <div className="flex gap-2 flex-wrap">
          {ALL_POSITIONS.map((pos) => (
            <button
              key={pos}
              onClick={() => setFilter(pos)}
              className={cn(
                'px-4 py-2 text-xs font-black uppercase tracking-widest transition-all duration-300 cursor-pointer',
                filter === pos
                  ? 'bg-primary text-black'
                  : 'glass-panel text-white/60 hover:text-white',
              )}
            >
              {pos}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-white/30 text-sm">No players found.</p>
        </div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          <AnimatePresence>
            {filtered.map((player) => (
              <PlayerCard key={player.id} player={player} onClick={setSelected} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {selected && <PlayerModal player={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </div>
  )
}
