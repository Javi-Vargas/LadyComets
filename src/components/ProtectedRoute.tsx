import { useEffect, useState, type ReactNode } from 'react'
import { useLocation } from 'wouter'
import { supabase } from '@/lib/supabase'
import type { Session } from '@supabase/supabase-js'

interface ProtectedRouteProps {
  children: ReactNode
}

type Status = 'loading' | 'authorized' | 'unauthorized' | 'not-allowed'

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [, navigate] = useLocation()
  const [status, setStatus] = useState<Status>('loading')

  useEffect(() => {
    let mounted = true

    async function checkAuth(session: Session | null) {
      if (!session) {
        if (mounted) setStatus('unauthorized')
        navigate('/admin/login')
        return
      }

      // Check allowlist
      const { data, error } = await supabase
        .from('allowed_admins')
        .select('email')
        .eq('email', session.user.email ?? '')
        .maybeSingle()

      if (!mounted) return

      if (error || !data) {
        // Signed in but not on the allowlist
        await supabase.auth.signOut()
        setStatus('not-allowed')
      } else {
        setStatus('authorized')
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      void checkAuth(session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      void checkAuth(session)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [navigate])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[hsl(220_30%_8%)] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (status === 'not-allowed') {
    return (
      <div className="min-h-screen bg-[hsl(220_30%_8%)] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-xs font-black uppercase tracking-widest text-primary mb-2">Access Denied</p>
          <h1 className="text-2xl font-black text-white mb-2">Not Authorized</h1>
          <p className="text-white/50 text-sm">Your email is not on the admin allowlist.</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthorized') return null

  return <>{children}</>
}
