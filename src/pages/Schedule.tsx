import { motion } from 'framer-motion'
import { MapPin, Clock, Check, Ticket } from 'lucide-react'
import { allGames, ticketTiers } from '@/data/schedule'
import { cn } from '@/lib/utils'

export default function Schedule() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12" data-testid="schedule-page">
      {/* Header */}
      <div className="mb-10">
        <p className="text-xs font-black uppercase tracking-widest text-primary">2026 Season</p>
        <h1 className="text-4xl font-black uppercase text-white mt-1">Schedule</h1>
      </div>

      {/* Games list */}
      <div className="space-y-3 mb-16">
        {allGames.map((game, i) => (
          <motion.div
            key={game.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className={cn(
              'relative overflow-hidden group',
              game.isNext
                ? 'border border-primary/50 bg-primary/5'
                : game.past
                ? 'border border-white/5 opacity-60'
                : 'border border-white/10 hover:border-white/20',
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

              {/* Result or tickets */}
              <div className="flex items-center gap-3">
                {game.past ? (
                  <div className="text-right">
                    <span
                      className={cn(
                        'text-xs font-black uppercase tracking-widest px-2 py-0.5',
                        game.result === 'W' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400',
                      )}
                    >
                      {game.result}
                    </span>
                    <p className="text-sm font-black text-white mt-1">{game.score}</p>
                  </div>
                ) : (
                  <button className="px-4 py-2 text-xs font-black uppercase tracking-widest bg-primary text-black hover:bg-white transition-colors duration-300 skew-x-[-8deg]">
                    <span className="skew-x-[8deg] flex items-center gap-1.5">
                      <Ticket className="w-3 h-3" />
                      Tickets
                    </span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Ticket tiers */}
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
    </div>
  )
}
