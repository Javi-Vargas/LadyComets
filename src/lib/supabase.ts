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

/**
 * Given a Supabase Storage path stored in photo_path, return the
 * full public URL for display.  Returns null if no path provided.
 */
export function getPhotoUrl(photoPath: string | null): string | null {
  if (!photoPath) return null
  const { data } = supabase.storage.from('lady-comets').getPublicUrl(photoPath)
  return data.publicUrl
}
