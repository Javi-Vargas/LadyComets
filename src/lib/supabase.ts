import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/** Shape returned by the `players` table in Supabase. */
export type DbPlayer = {
  id: number
  name: string
  position: string        // comma-separated: "PG,SF"
  jersey_number: number | null
  height: string | null
  bio: string | null
  photo_path: string | null  // Supabase Storage path inside the lady-comets bucket
  sort_order: number
  created_at: string
  updated_at: string
}

/** Shape returned by the `games` table in Supabase. */
export type DbGame = {
  id: number
  schedule_id: number | null  // maps to static allGames[].id in schedule.ts
  date: string                // ISO date: "2026-06-14"
  opponent: string
  home_away: 'HOME' | 'AWAY' | 'TOURNAMENT'
  team_score: number | null
  opponent_score: number | null
  result: 'W' | 'L' | null
  venue: string | null
  created_at: string
  updated_at: string
}

/** Shape returned by the `player_game_stats` table in Supabase. */
export type DbPlayerGameStats = {
  id: number
  game_id: number
  player_id: number
  minutes: string | null
  points: number
  rebounds: number
  assists: number
  steals: number
  blocks: number
  turnovers: number
  fgm: number
  fga: number
  threepm: number
  threepa: number
  ftm: number
  fta: number
  created_at: string
  updated_at: string
}

/** Extended stat row joined with player info (for box score display). */
export type StatWithPlayer = DbPlayerGameStats & {
  player_name: string
  jersey_number: number | null
  photo_path: string | null
}

/** Extended stat row joined with game info (for player game log). */
export type StatWithGame = DbPlayerGameStats & {
  game: DbGame
}

/**
 * Given a Supabase Storage path stored in photo_path, return the
 * full public URL for display.  Returns null if no path provided.
 */
export function getPhotoUrl(photoPath: string | null): string | null {
  if (!photoPath) return null
  const { data } = supabase.storage.from('lady-comets').getPublicUrl(photoPath)
  return data.publicUrl
}

/** Shape returned by the `content_items` table in Supabase. */
export type DbContentItem = {
  id: number
  section: 'feed' | 'news'
  type: string            // 'feature' | 'player_spotlight' | 'culture' | 'game_recap' | 'training' | 'merch' | 'general'
  title: string
  excerpt: string | null
  image_url: string | null    // external URL (e.g. pasted from Instagram)
  image_path: string | null   // Supabase Storage path inside the lady-comets bucket
  date: string | null
  read_time: string | null
  featured: boolean
  wide: boolean
  col_span: string | null
  row_span: string | null
  large: boolean
  accent: string | null
  instagram_url: string | null
  published: boolean
  sort_order: number
  created_at: string
}

/**
 * Returns the best available image URL for a content item.
 * Prefers an uploaded file (image_path) over a pasted URL (image_url).
 */
export function getContentImageUrl(item: Pick<DbContentItem, 'image_path' | 'image_url'>): string | null {
  return getPhotoUrl(item.image_path) ?? item.image_url ?? null
}
