import { Link, useLocation } from 'wouter'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Calendar, Newspaper, Info, Ticket, GraduationCap } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { path: '/', label: 'Home' },
  { path: '/roster', label: 'Roster' },
  { path: '/schedule', label: 'Schedule' },
  { path: '/news', label: 'News' },
  { path: '/coaches', label: 'Coaches' },
  { path: '/about', label: 'About' },
]

const MOBILE_NAV_ITEMS = [
  { path: '/roster', label: 'Roster', icon: Users },
  { path: '/schedule', label: 'Schedule', icon: Calendar },
  { path: '/news', label: 'News', icon: Newspaper },
  { path: '/coaches', label: 'Coaches', icon: GraduationCap },
  { path: '/about', label: 'About', icon: Info },
]

export default function NavBar() {
  const [location] = useLocation()

  return (
    <>
      {/* Desktop floating pill nav */}
      <nav className="hidden md:flex fixed top-10 left-1/2 -translate-x-1/2 z-50 glass-panel rounded-full px-6 py-3 items-center gap-8 shadow-2xl">
        <div className="text-sm font-black tracking-tight text-primary mr-4 uppercase italic leading-tight">
          Orlando<br />Lady Comets
        </div>

        {NAV_ITEMS.map((item) => {
          const active = location === item.path
          return (
            <Link
              key={item.path}
              href={item.path}
              data-testid={`nav-desktop-${item.label.toLowerCase()}`}
              className={cn(
                'relative text-sm font-bold uppercase tracking-wider transition-colors duration-300 hover:text-white',
                active ? 'text-white' : 'text-white/60',
              )}
            >
              {item.label}
              {active && (
                <motion.div
                  layoutId="desktop-nav-indicator"
                  className="absolute -bottom-2 left-0 right-0 h-1 bg-primary"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </Link>
          )
        })}

        <div className="w-px h-6 bg-white/20 mx-2" />

        <Link
          href="/schedule"
          data-testid="nav-desktop-tickets"
          className="bg-primary text-black font-black uppercase text-sm px-5 py-2 hover:bg-white transition-colors duration-300 skew-x-[-10deg]"
        >
          <div className="skew-x-[10deg] flex items-center gap-2">
            <Ticket className="w-4 h-4" />
            Tickets
          </div>
        </Link>
      </nav>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-6 left-4 right-4 z-50 glass-panel rounded-[2rem] px-2 py-3 flex items-center justify-around shadow-2xl">
        {/* Wordmark acts as Home button */}
        <Link
          href="/"
          data-testid="nav-mobile-home"
          className="flex flex-col items-center justify-center px-1"
        >
          <span
            className={cn(
              'text-[10px] font-black tracking-tight uppercase italic leading-tight text-center transition-colors duration-300',
              location === '/' ? 'text-primary' : 'text-white/40 hover:text-white/70',
            )}
          >
            Lady<br />Comets
          </span>
        </Link>

        {MOBILE_NAV_ITEMS.map((item) => {
          const active = location === item.path
          const Icon = item.icon
          return (
            <Link
              key={item.path}
              href={item.path}
              data-testid={`nav-mobile-${item.label.toLowerCase()}`}
              className="relative flex flex-col items-center gap-1 p-2"
            >
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300',
                  active
                    ? 'bg-primary text-black scale-110 shadow-[0_0_15px_rgba(255,200,40,0.55)]'
                    : 'bg-white/5 text-white/60 hover:bg-white/10',
                )}
              >
                <Icon className={cn('w-4 h-4', active && 'stroke-[2.5px]')} />
              </div>
              <AnimatePresence>
                {active && (
                  <motion.span
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="text-[10px] font-bold uppercase tracking-wider text-primary absolute -top-5"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
