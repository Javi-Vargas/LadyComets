import { useState } from 'react'
import { Link } from 'wouter'
import { Instagram } from 'lucide-react'
import { supabase } from '@/lib/supabase'

// Add X/Twitter, YouTube, TikTok here once accounts are created
const SOCIAL_LINKS = [
  { Icon: Instagram, label: 'Instagram', href: 'https://www.instagram.com/orlandoladycomets/' },
]

const NAV_LINKS = [
  { label: 'Schedule', href: '/schedule' },
  { label: 'Roster',   href: '/roster'   },
  { label: 'News',     href: '/news'     },
  { label: 'About',    href: '/about'    },
  { label: 'Coaches',  href: '/coaches'  },
]

export default function Footer() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setStatus('loading')
    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert({ email: email.trim().toLowerCase() })

    if (error) {
      // 23505 = unique_violation — treat as success (already subscribed)
      setStatus(error.code === '23505' ? 'success' : 'error')
    } else {
      setStatus('success')
    }
    setEmail('')
  }

  return (
    <footer className="border-t border-white/10 bg-background mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-14 grid grid-cols-1 md:grid-cols-3 gap-12">

        {/* ── Brand ── */}
        <div>
          <p className="text-xs font-black uppercase tracking-[0.35em] text-primary mb-1">Orlando</p>
          <p className="text-2xl font-black uppercase text-white tracking-tight leading-tight">
            Lady Comets
          </p>
          <p className="text-xs text-white/40 mt-3 max-w-[200px]">
            Defending champions. Cultural icons. The future of the game.
          </p>

          <div className="flex items-center gap-4 mt-5">
            {SOCIAL_LINKS.map(({ Icon, label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="text-white/30 hover:text-primary transition-colors duration-200"
              >
                <Icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>

        {/* ── Quick nav ── */}
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-4">
            Navigate
          </p>
          <nav className="flex flex-col gap-2.5">
            {NAV_LINKS.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="text-sm text-white/50 hover:text-white transition-colors duration-200 w-fit"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>

        {/* ── Newsletter ── */}
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">
            Stay in the Loop
          </p>
          <p className="text-sm text-white/50 mb-4 leading-relaxed">
            Get game updates, news, and exclusive content direct to your inbox.
          </p>

          {status === 'success' ? (
            <p className="text-sm font-bold text-primary">
              You&apos;re in. Welcome to the Comet family.
            </p>
          ) : (
            <form onSubmit={(e) => { void handleSubscribe(e) }} className="flex gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 bg-white/5 border border-white/10 focus:border-primary/50 outline-none text-sm text-white placeholder:text-white/20 px-3 py-2 transition-colors duration-200"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="bg-primary text-black font-black uppercase text-xs px-4 py-2 hover:bg-white transition-colors duration-300 disabled:opacity-60 disabled:cursor-not-allowed skew-x-[-8deg]"
              >
                <span className="skew-x-[8deg] inline-block">
                  {status === 'loading' ? '...' : 'Join'}
                </span>
              </button>
            </form>
          )}

          {status === 'error' && (
            <p className="text-xs text-red-400 mt-2">Something went wrong. Please try again.</p>
          )}
        </div>
      </div>

      {/* ── Legal strip ── */}
      <div className="border-t border-white/5">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[11px] text-white/20">
            © {new Date().getFullYear()} Orlando Lady Comets. All rights reserved.
          </p>
          <p className="text-[11px] text-white/20">
            Built with ❤️ in Orlando
          </p>
        </div>
      </div>
    </footer>
  )
}
