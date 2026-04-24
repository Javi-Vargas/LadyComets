import { useState, useEffect } from 'react'
import { supabase, type DbGame, type DbPlayerGameStats } from '@/lib/supabase'

export interface PlayerAverages {
  gamesPlayed: number
  ppg: number
  rpg: number
  apg: number
  spg: number
  bpg: number
  fgPct: number
  threePct: number
}

export interface GameLogEntry extends DbPlayerGameStats {
  game: DbGame
}

interface PlayerStatsResult {
  averages: PlayerAverages
  gameLog: GameLogEntry[]
  loading: boolean
}

const ZERO_AVERAGES: PlayerAverages = {
  gamesPlayed: 0,
  ppg: 0,
  rpg: 0,
  apg: 0,
  spg: 0,
  bpg: 0,
  fgPct: 0,
  threePct: 0,
}

export function usePlayerStats(playerId: number | string | null): PlayerStatsResult {
  const [averages, setAverages] = useState<PlayerAverages>(ZERO_AVERAGES)
  const [gameLog, setGameLog] = useState<GameLogEntry[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (playerId === null) {
      setAverages(ZERO_AVERAGES)
      setGameLog([])
      return
    }

    setLoading(true)
    supabase
      .from('player_game_stats')
      .select('*, games(*)')
      .eq('player_id', playerId)
      .then(({ data }) => {
        const rows = (data ?? []) as Array<DbPlayerGameStats & { games: DbGame }>

        // Sort by game date descending (most recent first)
        const sorted = rows
          .filter((r) => r.games)
          .sort((a, b) => new Date(b.games.date).getTime() - new Date(a.games.date).getTime())

        const log: GameLogEntry[] = sorted.map((r) => ({ ...r, game: r.games }))

        const gp = log.length
        if (gp === 0) {
          setAverages(ZERO_AVERAGES)
          setGameLog([])
          setLoading(false)
          return
        }

        const totFgm = log.reduce((s, r) => s + r.fgm, 0)
        const totFga = log.reduce((s, r) => s + r.fga, 0)
        const tot3pm = log.reduce((s, r) => s + r.threepm, 0)
        const tot3pa = log.reduce((s, r) => s + r.threepa, 0)

        setAverages({
          gamesPlayed: gp,
          ppg: round1(log.reduce((s, r) => s + r.points, 0) / gp),
          rpg: round1(log.reduce((s, r) => s + r.rebounds, 0) / gp),
          apg: round1(log.reduce((s, r) => s + r.assists, 0) / gp),
          spg: round1(log.reduce((s, r) => s + r.steals, 0) / gp),
          bpg: round1(log.reduce((s, r) => s + r.blocks, 0) / gp),
          fgPct: totFga > 0 ? round1((totFgm / totFga) * 100) : 0,
          threePct: tot3pa > 0 ? round1((tot3pm / tot3pa) * 100) : 0,
        })
        setGameLog(log)
        setLoading(false)
      })
  }, [playerId])

  return { averages, gameLog, loading }
}

function round1(n: number): number {
  return Math.round(n * 10) / 10
}
