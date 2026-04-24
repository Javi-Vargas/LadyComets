import { useState, type FormEvent } from 'react'
import { useLocation } from 'wouter'
import { supabase } from '@/lib/supabase'

export default function AdminLogin() {
  const [, navigate] = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })

      if (signInError) {
        setError('Invalid email or password.')
        return
      }

      // Check allowlist before proceeding
      const { data: adminRow } = await supabase
        .from('allowed_admins')
        .select('email')
        .eq('email', data.user?.email ?? '')
        .maybeSingle()

      if (!adminRow) {
        await supabase.auth.signOut()
        setError('Your account is not authorized to access the admin panel.')
        return
      }

      navigate('/admin')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: 'hsl(220 30% 8%)' }}
    >
      {/* Card */}
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-xs font-black uppercase tracking-[0.4em] text-primary mb-3">
            Orlando Lady Comets
          </p>
          <h1 className="text-4xl font-black text-white mb-2">Roster Admin</h1>
          <p className="text-white/50 text-sm">Sign in to manage the team roster.</p>
        </div>

        {/* Form card */}
        <div
          className="rounded-xl p-8"
          style={{ background: 'hsl(220 30% 12%)', border: '1px solid hsl(220 20% 20%)' }}
        >
          <h2 className="text-lg font-bold text-white mb-1">Sign in to Lady Comets</h2>
          <p className="text-white/40 text-sm mb-6">Welcome back! Please sign in to continue.</p>

          <form onSubmit={(e) => { void handleSubmit(e) }} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-white/70 mb-1.5">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email address"
                className="w-full px-3 py-2.5 rounded-md text-sm text-white placeholder-white/30 outline-none focus:ring-2 focus:ring-primary"
                style={{
                  background: 'hsl(220 30% 17%)',
                  border: '1px solid hsl(220 20% 25%)',
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-white/70 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                className="w-full px-3 py-2.5 rounded-md text-sm text-white placeholder-white/30 outline-none focus:ring-2 focus:ring-primary"
                style={{
                  background: 'hsl(220 30% 17%)',
                  border: '1px solid hsl(220 20% 25%)',
                }}
              />
            </div>

            {error && (
              <p className="text-red-400 text-xs font-medium bg-red-500/10 border border-red-500/20 rounded px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-md text-sm font-black uppercase tracking-wider text-white transition-opacity disabled:opacity-60"
              style={{ background: 'hsl(26 91% 51%)' }}
            >
              {loading ? 'Signing in…' : 'Continue →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
