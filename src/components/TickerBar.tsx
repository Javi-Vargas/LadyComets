import { useState, useEffect } from 'react'
import { supabase, type DbGame } from '@/lib/supabase'
import { getNextGame } from '@/data/schedule'

const STATIC_ITEMS = [
  'ORLANDO LADY COMETS — 2026 SEASON',
  'DEFENDING CHAMPIONS',
  'AMWAY CENTER — ORLANDO, FL',
]

export default function TickerBar() {
  const [lastGame, setLastGame] = useState<DbGame | null>(null)

  useEffect(() => {
    supabase
      .from('games')
      .select('*')
      .not('result', 'is', null)
      .order('date', { ascending: false })
      .limit(1)
      .then(({ data }) => {
        if (data && data.length > 0) setLastGame(data[0] as DbGame)
      })
  }, [])

  const nextGame = getNextGame()

  const dynamicItems: string[] = []

  if (nextGame) {
    dynamicItems.push(
      `NEXT GAME: LADY COMETS VS. ${nextGame.opponent.toUpperCase()} — ${nextGame.displayDate.toUpperCase()}`,
    )
  }

  if (lastGame) {
    const score =
      lastGame.team_score != null && lastGame.opponent_score != null
        ? ` ${lastGame.team_score}–${lastGame.opponent_score}`
        : ''
    const resultWord = lastGame.result === 'W' ? 'WIN' : 'LOSS'
    dynamicItems.push(
      `FINAL: LADY COMETS${score} — ${resultWord} VS. ${lastGame.opponent.toUpperCase()}`,
    )
  }

  const items = [...dynamicItems, ...STATIC_ITEMS]
  const display = [...items, ...items, ...items]

  return (
    <div className="fixed top-0 left-0 right-0 h-8 bg-primary text-black z-50 overflow-hidden flex items-center shadow-[0_0_20px_rgba(255,200,40,0.45)]">
      <div
        className="flex whitespace-nowrap"
        style={{ animation: 'marquee 30s linear infinite' }}
      >
        {display.map((item, i) => (
          <div key={i} className="flex items-center">
            <span className="text-xs font-black uppercase tracking-widest mx-4">{item}</span>
            <span className="text-black/50 text-xs mx-4">///</span>
          </div>
        ))}
      </div>
    </div>
  )
}
