import { useState, useEffect, useMemo } from 'react'

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

/**
 * Parses a schedule time string like "7:00 PM ET" into a full Date.
 * Falls back to 7:00 PM local if the string is "TBD", "Completed", or unparseable.
 */
function buildGameDate(dateStr: string, timeStr: string | null): Date {
  const match = (timeStr ?? '').match(/(\d+):(\d+)\s*(AM|PM)/i)
  if (match) {
    let hours = parseInt(match[1], 10)
    const minutes = parseInt(match[2], 10)
    const period = match[3].toUpperCase()
    if (period === 'PM' && hours !== 12) hours += 12
    if (period === 'AM' && hours === 12) hours = 0
    const pad = (n: number) => String(n).padStart(2, '0')
    return new Date(`${dateStr}T${pad(hours)}:${pad(minutes)}:00`)
  }
  return new Date(`${dateStr}T19:00:00`)
}

function useCountdown(target: Date | null): TimeLeft {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    if (!target) return

    const tick = () => {
      const diff = target.getTime() - Date.now()
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        return
      }
      setTimeLeft({
        days: Math.floor(diff / 86_400_000),
        hours: Math.floor((diff % 86_400_000) / 3_600_000),
        minutes: Math.floor((diff % 3_600_000) / 60_000),
        seconds: Math.floor((diff % 60_000) / 1_000),
      })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [target])

  return timeLeft
}

function Unit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <span className="text-5xl md:text-7xl font-black tabular-nums text-white leading-none">
          {String(value).padStart(2, '0')}
        </span>
        <div className="absolute inset-0 blur-2xl bg-primary/30 -z-10" />
      </div>
      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mt-1">{label}</span>
    </div>
  )
}

interface CountdownTimerProps {
  nextGame?: { date: string; time: string | null } | null
}

export default function CountdownTimer({ nextGame }: CountdownTimerProps) {
  // useMemo with string deps avoids the infinite-loop pitfall of creating
  // a new Date() on every render while still supporting dynamic (DB-driven) game data.
  const target = useMemo(
    () => (nextGame ? buildGameDate(nextGame.date, nextGame.time) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [nextGame?.date, nextGame?.time],
  )

  const t = useCountdown(target)

  if (!target) {
    return (
      <p className="text-white/40 text-sm font-bold uppercase tracking-widest">
        Season complete
      </p>
    )
  }

  return (
    <div className="flex items-center gap-4 md:gap-8" data-testid="countdown-timer">
      <Unit value={t.days} label="Days" />
      <span className="text-4xl md:text-6xl font-black text-white/30 mb-4">:</span>
      <Unit value={t.hours} label="Hrs" />
      <span className="text-4xl md:text-6xl font-black text-white/30 mb-4">:</span>
      <Unit value={t.minutes} label="Min" />
      <span className="text-4xl md:text-6xl font-black text-white/30 mb-4">:</span>
      <Unit value={t.seconds} label="Sec" />
    </div>
  )
}
