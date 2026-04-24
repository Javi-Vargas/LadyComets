import { useState, useEffect, useRef, type ChangeEvent, type FormEvent } from 'react'
import { Link } from 'wouter'
import { supabase, getPhotoUrl, type DbPlayer } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────────────────────

type Tab = 'players' | 'games' | 'content'
const POSITIONS = ['PG', 'SG', 'SF', 'PF', 'C'] as const
type Pos = typeof POSITIONS[number]

interface FormState {
  name: string
  positions: Pos[]
  jersey_number: string
  height: string
  bio: string
  photoFile: File | null
  photoPreview: string | null
}

const EMPTY_FORM: FormState = {
  name: '',
  positions: [],
  jersey_number: '',
  height: '',
  bio: '',
  photoFile: null,
  photoPreview: null,
}

// ── Player Form ────────────────────────────────────────────────────────────────

interface PlayerFormProps {
  editing: DbPlayer | null
  onSaved: () => void
  onCancel: () => void
}

function PlayerForm({ editing, onSaved, onCancel }: PlayerFormProps) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  // Populate form when editing an existing player
  useEffect(() => {
    if (editing) {
      const positions = editing.position
        .split(',')
        .map((s) => s.trim())
        .filter((s): s is Pos => (POSITIONS as readonly string[]).includes(s))
      setForm({
        name: editing.name,
        positions,
        jersey_number: editing.jersey_number != null ? String(editing.jersey_number) : '',
        height: editing.height ?? '',
        bio: editing.bio ?? '',
        photoFile: null,
        photoPreview: getPhotoUrl(editing.photo_path),
      })
    } else {
      setForm(EMPTY_FORM)
    }
  }, [editing])

  function togglePosition(pos: Pos) {
    setForm((f) => ({
      ...f,
      positions: f.positions.includes(pos)
        ? f.positions.filter((p) => p !== pos)
        : [...f.positions, pos],
    }))
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    if (!file) return
    setForm((f) => ({
      ...f,
      photoFile: file,
      photoPreview: URL.createObjectURL(file),
    }))
  }

  function removePhoto() {
    setForm((f) => ({ ...f, photoFile: null, photoPreview: null }))
    if (fileRef.current) fileRef.current.value = ''
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) { setError('Name is required.'); return }
    if (form.positions.length === 0) { setError('Select at least one position.'); return }

    setSaving(true)
    setError(null)

    try {
      let photo_path = editing?.photo_path ?? null

      // Upload new photo if one was selected
      if (form.photoFile) {
        const ext = form.photoFile.name.split('.').pop() ?? 'jpg'
        const path = `players/${Date.now()}-${form.name.toLowerCase().replace(/\s+/g, '-')}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('lady-comets')
          .upload(path, form.photoFile, { upsert: true })
        if (uploadError) throw uploadError
        photo_path = path
      }

      const payload = {
        name: form.name.trim(),
        position: form.positions.join(','),
        jersey_number: form.jersey_number ? parseInt(form.jersey_number, 10) : null,
        height: form.height.trim() || null,
        bio: form.bio.trim() || null,
        photo_path,
        updated_at: new Date().toISOString(),
      }

      if (editing) {
        const { error: updateError } = await supabase
          .from('players')
          .update(payload)
          .eq('id', editing.id)
        if (updateError) throw updateError
      } else {
        const { error: insertError } = await supabase
          .from('players')
          .insert({ ...payload, created_at: new Date().toISOString() })
        if (insertError) throw insertError
      }

      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save player.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="rounded-xl p-6 mb-6"
      style={{ background: 'hsl(220 30% 12%)', border: '1px solid hsl(220 20% 20%)' }}
    >
      <h3 className="text-lg font-bold text-white mb-5">
        {editing ? 'Edit player' : 'New player'}
      </h3>

      <form onSubmit={(e) => { void handleSubmit(e) }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Name */}
          <div className="md:col-span-1">
            <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-1.5">
              Name <span className="text-primary">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full px-3 py-2.5 rounded text-sm text-white placeholder-white/30 outline-none focus:ring-2 focus:ring-primary"
              style={{ background: 'hsl(220 30% 17%)', border: '1px solid hsl(220 20% 25%)' }}
              required
            />
          </div>

          {/* Position picker */}
          <div>
            <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-1.5">
              Position <span className="text-primary">*</span>
            </label>
            <div className="flex gap-2">
              {POSITIONS.map((pos) => {
                const active = form.positions.includes(pos)
                return (
                  <button
                    key={pos}
                    type="button"
                    onClick={() => togglePosition(pos)}
                    className={cn(
                      'relative w-10 h-10 rounded text-xs font-black uppercase transition-all',
                      active
                        ? 'text-green-400 border-green-500'
                        : 'text-white/50 hover:text-white',
                    )}
                    style={{
                      background: active ? 'hsl(140 60% 12%)' : 'hsl(220 30% 17%)',
                      border: active ? '2px solid hsl(140 60% 45%)' : '1px solid hsl(220 20% 25%)',
                    }}
                  >
                    {pos}
                    {active && (
                      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-white stroke-[3px]" />
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Jersey # */}
          <div>
            <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-1.5">
              Jersey #
            </label>
            <input
              type="number"
              min={0}
              max={99}
              value={form.jersey_number}
              onChange={(e) => setForm((f) => ({ ...f, jersey_number: e.target.value }))}
              className="w-full px-3 py-2.5 rounded text-sm text-white placeholder-white/30 outline-none focus:ring-2 focus:ring-primary"
              style={{ background: 'hsl(220 30% 17%)', border: '1px solid hsl(220 20% 25%)' }}
            />
          </div>

          {/* Height */}
          <div>
            <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-1.5">
              Height
            </label>
            <input
              type="text"
              value={form.height}
              onChange={(e) => setForm((f) => ({ ...f, height: e.target.value }))}
              placeholder="e.g. 5'10&quot;"
              className="w-full px-3 py-2.5 rounded text-sm text-white placeholder-white/30 outline-none focus:ring-2 focus:ring-primary"
              style={{ background: 'hsl(220 30% 17%)', border: '1px solid hsl(220 20% 25%)' }}
            />
          </div>

          {/* Bio */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-1.5">
              Bio
            </label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2.5 rounded text-sm text-white placeholder-white/30 outline-none focus:ring-2 focus:ring-primary resize-y"
              style={{ background: 'hsl(220 30% 17%)', border: '1px solid hsl(220 20% 25%)' }}
            />
          </div>

          {/* Photo */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-1.5">
              Photo
            </label>
            <div className="flex items-center gap-3">
              {form.photoPreview && (
                <img
                  src={form.photoPreview}
                  alt="preview"
                  className="w-14 h-14 object-cover rounded"
                />
              )}
              <div className="flex items-center gap-2 flex-wrap text-sm text-white/60">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="text-sm text-white/60 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-bold file:bg-white/10 file:text-white/70 hover:file:bg-white/20 cursor-pointer"
                />
                {form.photoPreview && (
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="text-xs text-red-400 hover:text-red-300 font-bold"
                  >
                    Remove photo
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {error && (
          <p className="mt-4 text-red-400 text-xs font-medium bg-red-500/10 border border-red-500/20 rounded px-3 py-2">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2 text-sm font-bold text-white/60 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 rounded text-sm font-black uppercase tracking-wider text-white disabled:opacity-60 transition-opacity"
            style={{ background: 'hsl(26 91% 51%)' }}
          >
            {saving ? 'Saving…' : editing ? 'Save changes' : 'Add player'}
          </button>
        </div>
      </form>
    </div>
  )
}

// ── Players Tab ────────────────────────────────────────────────────────────────

function PlayersTab() {
  const [players, setPlayers] = useState<DbPlayer[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingPlayer, setEditingPlayer] = useState<DbPlayer | null>(null)

  async function fetchPlayers() {
    const { data } = await supabase
      .from('players')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })
    setPlayers((data as DbPlayer[]) ?? [])
    setLoading(false)
  }

  useEffect(() => { void fetchPlayers() }, [])

  async function handleDelete(id: number) {
    if (!confirm('Delete this player?')) return
    await supabase.from('players').delete().eq('id', id)
    void fetchPlayers()
  }

  function openAdd() {
    setEditingPlayer(null)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function openEdit(player: DbPlayer) {
    setEditingPlayer(player)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleSaved() {
    setShowForm(false)
    setEditingPlayer(null)
    void fetchPlayers()
  }

  const posDisplay = (position: string) =>
    position.split(',').filter(Boolean).join(' · ')

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Players</h2>
        {!showForm && (
          <button
            onClick={openAdd}
            className="px-4 py-2 rounded text-sm font-black uppercase tracking-wider text-white"
            style={{ background: 'hsl(26 91% 51%)' }}
          >
            + Add player
          </button>
        )}
      </div>

      {showForm && (
        <PlayerForm
          editing={editingPlayer}
          onSaved={handleSaved}
          onCancel={() => { setShowForm(false); setEditingPlayer(null) }}
        />
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : players.length === 0 ? (
        <div
          className="rounded-xl py-16 text-center"
          style={{ border: '1px solid hsl(220 20% 20%)' }}
        >
          <p className="text-white/40 text-sm">
            No players yet. Click &quot;Add player&quot; to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {players.map((player) => {
            const photoUrl = getPhotoUrl(player.photo_path)
            return (
              <div
                key={player.id}
                className="flex items-center justify-between px-4 py-3 rounded-lg"
                style={{
                  background: 'hsl(220 30% 12%)',
                  border: '1px solid hsl(220 20% 20%)',
                }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-12 h-12 rounded overflow-hidden shrink-0 bg-white/5"
                  >
                    {photoUrl ? (
                      <img src={photoUrl} alt={player.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/20 text-xs font-black">
                        {player.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white leading-tight">
                      {player.name}{' '}
                      {player.jersey_number != null && (
                        <span style={{ color: 'hsl(26 91% 51%)' }}>#{player.jersey_number}</span>
                      )}
                    </p>
                    <p className="text-xs text-white/40 mt-0.5">
                      {[posDisplay(player.position), player.height].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => openEdit(player)}
                    className="px-3 py-1.5 text-xs font-bold text-white/70 hover:text-white rounded transition-colors"
                    style={{ border: '1px solid hsl(220 20% 30%)' }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => { void handleDelete(player.id) }}
                    className="px-3 py-1.5 text-xs font-bold text-red-400 hover:text-red-300 rounded transition-colors"
                    style={{ border: '1px solid hsl(0 50% 30%)' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>('players')
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null)
    })
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    window.location.href = '/admin/login'
  }

  return (
    <div className="min-h-screen" style={{ background: 'hsl(220 30% 8%)' }}>
      {/* ── Top header ── */}
      <header
        className="px-6 py-4 flex items-center justify-between"
        style={{ borderBottom: '1px solid hsl(220 20% 18%)' }}
      >
        <div>
          <p className="text-sm font-black text-white leading-tight">Lady Comets Admin</p>
          {userEmail && <p className="text-xs text-white/40 mt-0.5">{userEmail}</p>}
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/roster"
            className="px-4 py-2 text-sm font-bold text-white/60 hover:text-white transition-colors rounded"
            style={{ border: '1px solid hsl(220 20% 25%)' }}
          >
            View public roster →
          </Link>
          <button
            onClick={() => { void handleSignOut() }}
            className="px-4 py-2 text-sm font-bold text-white/60 hover:text-white transition-colors rounded"
            style={{ border: '1px solid hsl(220 20% 25%)' }}
          >
            Sign out
          </button>
        </div>
      </header>

      {/* ── Tab bar ── */}
      <div
        className="px-6 flex gap-6"
        style={{ borderBottom: '1px solid hsl(220 20% 18%)' }}
      >
        {(['players', 'games', 'content'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'py-4 text-sm font-bold capitalize transition-colors relative',
              tab === t ? 'text-white' : 'text-white/40 hover:text-white/70',
            )}
          >
            {t}
            {tab === t && (
              <span
                className="absolute bottom-0 left-0 right-0 h-0.5"
                style={{ background: 'hsl(26 91% 51%)' }}
              />
            )}
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        {tab === 'players' && <PlayersTab />}

        {tab === 'games' && (
          <div className="text-center py-16">
            <p className="text-white/30 text-sm">Games management coming soon.</p>
          </div>
        )}

        {tab === 'content' && (
          <div className="text-center py-16">
            <p className="text-white/30 text-sm">Content management coming soon.</p>
          </div>
        )}
      </main>
    </div>
  )
}
