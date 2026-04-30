import { useState, useEffect, useCallback } from 'react'
import { supabase, type DbGame } from '@/lib/supabase'

export type ScheduleGame = DbGame & {
  past: boolean
  isNext: boolean
}

function withMeta(games: DbGame[]): ScheduleGame[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const result: ScheduleGame[] = games.map((g) => ({
    ...g,
    past: new Date(g.date) < today,
    isNext: false,
  }))

  const nextIdx = result.findIndex((g) => !g.past)
  if (nextIdx >= 0) result[nextIdx].isNext = true

  return result
}

export function useSchedule() {
  const [games, setGames] = useState<ScheduleGame[]>([])
  const [loading, setLoading] = useState(true)

  const fetchGames = useCallback(async () => {
    const { data } = await supabase
      .from('games')
      .select('*')
      .order('date', { ascending: true })
    setGames(withMeta((data ?? []) as DbGame[]))
    setLoading(false)
  }, [])

  useEffect(() => {
    void fetchGames()

    const channel = supabase
      .channel('schedule-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'games' }, () => {
        void fetchGames()
      })
      .subscribe()

    return () => { void supabase.removeChannel(channel) }
  }, [fetchGames])

  const nextGame = games.find((g) => g.isNext) ?? null

  return { games, nextGame, loading, refetch: fetchGames }
}
