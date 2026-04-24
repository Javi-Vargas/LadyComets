import { useState, useEffect } from 'react'
import { supabase, type StatWithPlayer } from '@/lib/supabase'

interface BoxScoreResult {
  stats: StatWithPlayer[]
  loading: boolean
}

export function useBoxScore(gameId: number | null): BoxScoreResult {
  const [stats, setStats] = useState<StatWithPlayer[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (gameId === null) {
      setStats([])
      return
    }

    setLoading(true)
    supabase
      .from('player_game_stats')
      .select('*, players(name, jersey_number, photo_path)')
      .eq('game_id', gameId)
      .order('minutes', { ascending: false, nullsFirst: false })
      .then(({ data }) => {
        const rows: StatWithPlayer[] = (data ?? []).map((row) => {
          const p = row.players as { name: string; jersey_number: number | null; photo_path: string | null } | null
          return {
            id: row.id,
            game_id: row.game_id,
            player_id: row.player_id,
            minutes: row.minutes,
            points: row.points,
            rebounds: row.rebounds,
            assists: row.assists,
            steals: row.steals,
            blocks: row.blocks,
            turnovers: row.turnovers,
            fgm: row.fgm,
            fga: row.fga,
            threepm: row.threepm,
            threepa: row.threepa,
            ftm: row.ftm,
            fta: row.fta,
            created_at: row.created_at,
            updated_at: row.updated_at,
            player_name: p?.name ?? 'Unknown',
            jersey_number: p?.jersey_number ?? null,
            photo_path: p?.photo_path ?? null,
          }
        })
        setStats(rows)
        setLoading(false)
      })
  }, [gameId])

  return { stats, loading }
}
