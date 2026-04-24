import { useState, useEffect, useCallback } from 'react'
import { supabase, getPhotoUrl, type DbPlayer } from '@/lib/supabase'
import { roster as staticRoster, type Player } from '@/data/roster'

const VALID_POSITIONS = ['PG', 'SG', 'SF', 'PF', 'C'] as const
type PositionAbbr = typeof VALID_POSITIONS[number]

function dbToPlayer(p: DbPlayer): Player {
  // "PG,SF" → ['PG', 'SF']
  const positions = p.position
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  const primaryPos = (positions[0] ?? 'PG') as PositionAbbr

  return {
    id: p.id,
    name: p.name,
    nickname: '',
    number: p.jersey_number != null ? String(p.jersey_number) : '',
    position: VALID_POSITIONS.includes(primaryPos) ? primaryPos : 'PG',
    positions,
    image: getPhotoUrl(p.photo_path) ?? 'https://images.unsplash.com/photo-1526976668912-1a811878dd37?w=400&q=80',
    pts: 0,
    ast: 0,
    reb: 0,
    height: p.height ?? '',
    college: '',
    bio: p.bio ?? '',
    isStar: false,
  }
}

export function usePlayers() {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPlayers = useCallback(async () => {
    // Fall back to static data when Supabase is not configured
    if (!import.meta.env.VITE_SUPABASE_URL) {
      setPlayers(staticRoster)
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true })

      if (error) throw error

      // If the table is empty fall back to static seed data so the page is never blank
      setPlayers(data && data.length > 0 ? (data as DbPlayer[]).map(dbToPlayer) : staticRoster)
    } catch {
      setPlayers(staticRoster)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchPlayers()

    if (!import.meta.env.VITE_SUPABASE_URL) return

    // Real-time: roster page updates the moment an admin adds / edits / deletes
    const channel = supabase
      .channel('players-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'players' }, () => {
        void fetchPlayers()
      })
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [fetchPlayers])

  return { players, loading, refetch: fetchPlayers }
}
