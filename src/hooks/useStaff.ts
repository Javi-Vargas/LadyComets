import { useState, useEffect, useCallback } from 'react'
import { supabase, getPhotoUrl, type DbStaff } from '@/lib/supabase'
import { staffRoster as staticStaff, type Staff } from '@/data/staff'

function dbToStaff(s: DbStaff): Staff {
  return {
    id: s.id,
    name: s.name,
    title: s.title,
    category: s.category,
    bio: s.bio ?? '',
    email: s.email ?? '',
    phone: s.phone ?? '',
    twitter: s.twitter ?? '',
    image: getPhotoUrl(s.photo_path),
    sort_order: s.sort_order,
  }
}

export function useStaff() {
  const [staff, setStaff] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)

  const fetchStaff = useCallback(async () => {
    if (!import.meta.env.VITE_SUPABASE_URL) {
      setStaff(staticStaff)
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .eq('published', true)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true })

      if (error) throw error

      setStaff(data && data.length > 0 ? (data as DbStaff[]).map(dbToStaff) : staticStaff)
    } catch {
      setStaff(staticStaff)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchStaff()

    if (!import.meta.env.VITE_SUPABASE_URL) return

    const channel = supabase
      .channel('staff-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'staff' }, () => {
        void fetchStaff()
      })
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [fetchStaff])

  return { staff, loading, refetch: fetchStaff }
}
