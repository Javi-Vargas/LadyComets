import { useState, useEffect } from 'react'

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function useCountdown(target: Date): TimeLeft {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
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

const NEXT_GAME = new Date('2026-05-15T19:30:00')

export default function CountdownTimer() {
  const t = useCountdown(NEXT_GAME)

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
