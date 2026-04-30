import { useState, useEffect } from 'react'
import { supabase, type DbGame, type DbTickerItem } from '@/lib/supabase'
import { getNextGame } from '@/data/schedule'

const STATIC_ITEMS = [
  'ORLANDO LADY COMETS — 2026 SEASON',
  "ORLANDO'S RISING STARS",
  'AMWAY CENTER — ORLANDO, FL',
]

export default function TickerBar() {
  const [lastGame, setLastGame] = useState<DbGame | null>(null)
  const [customItems, setCustomItems] = useState<string[]>([])

  useEffect(() => {
    // Last played game result
    supabase
      .from('games')
      .select('*')
      .not('result', 'is', null)
      .order('date', { ascending: false })
      .limit(1)
      .then(({ data }) => {
        if (data && data.length > 0) setLastGame(data[0] as DbGame)
      })

    // Admin-managed custom ticker messages (active only, sorted)
    supabase
      .from('ticker_items')
      .select('message')
      .eq('active', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        if (data) setCustomItems((data as Pick<DbTickerItem, 'message'>[]).map((r) => r.message.toUpperCase()))
      })
  }, [])

  const nextGame = getNextGame()

  const autoItems: string[] = []

  if (nextGame) {
    autoItems.push(
      `NEXT GAME: LADY COMETS VS. ${nextGame.opponent.toUpperCase()} — ${nextGame.displayDate.toUpperCase()}`,
    )
  }

  if (lastGame) {
    const score =
      lastGame.team_score != null && lastGame.opponent_score != null
        ? ` ${lastGame.team_score}–${lastGame.opponent_score}`
        : ''
    const resultWord = lastGame.result === 'W' ? 'WIN' : 'LOSS'
    autoItems.push(
      `FINAL: LADY COMETS${score} — ${resultWord} VS. ${lastGame.opponent.toUpperCase()}`,
    )
  }

  // Custom items lead, then auto-generated game items, then static fallbacks
  const items = [...customItems, ...autoItems, ...STATIC_ITEMS]
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
