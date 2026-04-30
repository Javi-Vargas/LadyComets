import { useState } from 'react'
import { Link } from 'wouter'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Phone, Twitter, ChevronLeft } from 'lucide-react'
import { useStaff } from '@/hooks/useStaff'
import { type Staff } from '@/data/staff'
import { cn } from '@/lib/utils'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, ease: 'easeOut', delay },
})

// ── Skeleton ─────────────────────────────────────────────────────────────────

function StaffSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-56 bg-white/5" />
      <div className="bg-card border border-white/5 p-5 space-y-2">
        <div className="h-2 w-20 bg-white/10 rounded" />
        <div className="h-4 w-36 bg-white/10 rounded" />
      </div>
    </div>
  )
}

// ── Initials badge (photo fallback) ──────────────────────────────────────────

function InitialsBadge({ name, large = false }: { name: string; large?: boolean }) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div
      className={cn(
        'flex items-center justify-center bg-primary/10 border border-primary/20',
        large ? 'w-full h-full text-5xl' : 'w-full h-full text-3xl',
      )}
    >
      <span className="font-black text-primary">{initials}</span>
    </div>
  )
}

// ── Staff Card ────────────────────────────────────────────────────────────────

function StaffCard({ member, onClick }: { member: Staff; onClick: (m: Staff) => void }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group cursor-pointer overflow-hidden border border-white/10 hover:border-primary/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.45)]"
      onClick={() => onClick(member)}
    >
      {/* Photo / initials */}
      <div className="relative h-56 overflow-hidden bg-card">
        {member.image ? (
          <img
            src={member.image}
            alt={member.name}
            className="w-full h-full object-cover object-top opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
          />
        ) : (
          <InitialsBadge name={member.name} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
      </div>

      {/* Info panel */}
      <div className="bg-card p-5">
        <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">
          {member.title}
        </p>
        <h3 className="text-lg font-black uppercase tracking-tight text-white">
          {member.name}
        </h3>
        {member.email && (
          <p className="text-xs text-white/30 mt-1 truncate">{member.email}</p>
        )}
      </div>
    </motion.div>
  )
}

// ── Bio Modal ─────────────────────────────────────────────────────────────────

function BioModal({ member, onClose }: { member: Staff; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative z-10 max-w-2xl w-full overflow-hidden glass-panel max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 text-white/50 hover:text-white transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Photo hero */}
        <div className="relative h-64 overflow-hidden shrink-0 bg-card">
          {member.image ? (
            <img
              src={member.image}
              alt={member.name}
              className="w-full h-full object-cover object-top"
            />
          ) : (
            <InitialsBadge name={member.name} large />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
          <div className="absolute bottom-5 left-6 z-10">
            <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">
              {member.title}
            </p>
            <h2 className="text-3xl font-black uppercase text-white tracking-tight">
              {member.name}
            </h2>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 py-6 space-y-6">
          {/* Bio */}
          {member.bio && (
            <p className="text-sm text-white/60 leading-relaxed">{member.bio}</p>
          )}

          {/* Contact row */}
          {(member.email || member.phone || member.twitter) && (
            <div className="border-t border-white/10 pt-5 flex flex-wrap gap-4">
              {member.email && (
                <a
                  href={`mailto:${member.email}`}
                  className="flex items-center gap-2 text-xs text-white/50 hover:text-primary transition-colors"
                >
                  <Mail className="w-3.5 h-3.5" />
                  {member.email}
                </a>
              )}
              {member.phone && (
                <a
                  href={`tel:${member.phone}`}
                  className="flex items-center gap-2 text-xs text-white/50 hover:text-primary transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  {member.phone}
                </a>
              )}
              {member.twitter && (
                <a
                  href={`https://x.com/${member.twitter.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-white/50 hover:text-primary transition-colors"
                >
                  <Twitter className="w-3.5 h-3.5" />
                  {member.twitter.startsWith('@') ? member.twitter : `@${member.twitter}`}
                </a>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Staff Section ─────────────────────────────────────────────────────────────

function StaffSection({
  title,
  subtitle,
  members,
  delay,
  onSelect,
}: {
  title: string
  subtitle: string
  members: Staff[]
  delay: number
  onSelect: (m: Staff) => void
}) {
  if (members.length === 0) return null

  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div {...fadeUp(delay)} className="mb-10">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-2 inline-block">
            {subtitle}
          </span>
          <h2 className="text-3xl font-black uppercase text-white">{title}</h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((m, i) => (
            <motion.div key={m.id} {...fadeUp(delay + i * 0.07)}>
              <StaffCard member={m} onClick={onSelect} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Coaches() {
  const { staff, loading } = useStaff()
  const [selected, setSelected] = useState<Staff | null>(null)

  const coachingStaff = staff.filter((s) => s.category === 'coaching')
  const supportStaff = staff.filter((s) => s.category === 'support')

  return (
    <div data-testid="coaches-page">
      {/* ── HERO ── */}
      <section className="relative py-28 px-4 text-center overflow-hidden">
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              'radial-gradient(ellipse 70% 50% at 50% 0%, hsl(24 92% 50% / 0.12) 0%, transparent 70%), hsl(240 10% 4%)',
          }}
        />
        <motion.div {...fadeUp(0)}>
          <span className="text-xs font-black uppercase tracking-[0.4em] text-primary inline-block mb-4">
            Orlando Lady Comets
          </span>
          <h1 className="text-6xl md:text-8xl font-black uppercase leading-[0.9] text-white">
            The Coaching
            <br />
            <span className="text-primary">Staff.</span>
          </h1>
          <p className="mt-8 text-white/60 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            The people who build championship culture — on the court, in the film room, and
            everywhere in between.
          </p>
        </motion.div>

        {/* Breadcrumb back link */}
        <motion.div {...fadeUp(0.15)} className="mt-8 flex justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white/30 hover:text-primary transition-colors duration-300"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Back to Home
          </Link>
        </motion.div>
      </section>

      {/* ── COACHING STAFF ── */}
      {loading ? (
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="h-8 w-48 bg-white/5 rounded mb-10 animate-pulse" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <StaffSkeleton key={i} />
              ))}
            </div>
          </div>
        </section>
      ) : (
        <>
          <StaffSection
            title="Coaching Staff"
            subtitle="On the Court"
            members={coachingStaff}
            delay={0.1}
            onSelect={setSelected}
          />

          {supportStaff.length > 0 && (
            <>
              {/* Divider */}
              <div className="max-w-6xl mx-auto px-4">
                <div className="border-t border-white/10" />
              </div>

              <StaffSection
                title="Support Staff"
                subtitle="Behind the Scenes"
                members={supportStaff}
                delay={0.1}
                onSelect={setSelected}
              />
            </>
          )}
        </>
      )}

      {/* ── BIO MODAL ── */}
      <AnimatePresence>
        {selected && (
          <BioModal member={selected} onClose={() => setSelected(null)} />
        )}
      </AnimatePresence>
    </div>
  )
}
