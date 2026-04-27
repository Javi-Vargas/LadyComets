import { useState, useEffect, useRef, type ChangeEvent, type FormEvent } from 'react'
import { Link } from 'wouter'
import { supabase, getPhotoUrl, getContentImageUrl, type DbPlayer, type DbGame, type DbPlayerGameStats, type DbContentItem } from '@/lib/supabase'
import { allGames } from '@/data/schedule'
import { cn } from '@/lib/utils'
import { Check, ChevronDown, ChevronUp } from 'lucide-react'

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

// ── Games Tab ─────────────────────────────────────────────────────────────────

const HOME_AWAY_OPTIONS = ['HOME', 'AWAY', 'TOURNAMENT'] as const
const RESULT_OPTIONS = [
  { value: '', label: '— Upcoming' },
  { value: 'W', label: 'W – Win' },
  { value: 'L', label: 'L – Loss' },
] as const

interface GameFormState {
  schedule_id: string
  date: string
  opponent: string
  home_away: string
  venue: string
  team_score: string
  opponent_score: string
  result: string
}

const EMPTY_GAME_FORM: GameFormState = {
  schedule_id: '',
  date: '',
  opponent: '',
  home_away: 'HOME',
  venue: '',
  team_score: '',
  opponent_score: '',
  result: '',
}

interface StatsRowState {
  player_id: number
  player_name: string
  jersey_number: number | null
  stat_id: number | null  // null = not yet saved
  minutes: string
  points: string
  rebounds: string
  assists: string
  steals: string
  blocks: string
  turnovers: string
  fgm: string; fga: string
  threepm: string; threepa: string
  ftm: string; fta: string
  saved: boolean
  saving: boolean
}

function makeEmptyRow(player: DbPlayer): StatsRowState {
  return {
    player_id: player.id,
    player_name: player.name,
    jersey_number: player.jersey_number,
    stat_id: null,
    minutes: '', points: '', rebounds: '', assists: '',
    steals: '', blocks: '', turnovers: '',
    fgm: '', fga: '', threepm: '', threepa: '',
    ftm: '', fta: '',
    saved: false,
    saving: false,
  }
}

function numOrZero(s: string): number {
  const n = parseInt(s, 10)
  return isNaN(n) ? 0 : n
}

// ── Box Score Entry ───────────────────────────────────────────────────────────

interface BoxScoreEntryProps {
  gameId: number
}

function BoxScoreEntry({ gameId }: BoxScoreEntryProps) {
  const [rows, setRows] = useState<StatsRowState[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const [{ data: players }, { data: existing }] = await Promise.all([
        supabase.from('players').select('*').order('sort_order').order('created_at'),
        supabase.from('player_game_stats').select('*').eq('game_id', gameId),
      ])

      const existingMap = new Map<number, DbPlayerGameStats>()
      for (const s of (existing ?? []) as DbPlayerGameStats[]) {
        existingMap.set(s.player_id, s)
      }

      const newRows: StatsRowState[] = ((players ?? []) as DbPlayer[]).map((p) => {
        const ex = existingMap.get(p.id)
        if (ex) {
          return {
            player_id: p.id,
            player_name: p.name,
            jersey_number: p.jersey_number,
            stat_id: ex.id,
            minutes: ex.minutes ?? '',
            points: String(ex.points),
            rebounds: String(ex.rebounds),
            assists: String(ex.assists),
            steals: String(ex.steals),
            blocks: String(ex.blocks),
            turnovers: String(ex.turnovers),
            fgm: String(ex.fgm), fga: String(ex.fga),
            threepm: String(ex.threepm), threepa: String(ex.threepa),
            ftm: String(ex.ftm), fta: String(ex.fta),
            saved: true,
            saving: false,
          }
        }
        return makeEmptyRow(p)
      })
      setRows(newRows)
      setLoading(false)
    }
    void load()
  }, [gameId])

  function updateRow(idx: number, patch: Partial<StatsRowState>) {
    setRows((prev) => prev.map((r, i) => i === idx ? { ...r, ...patch, saved: false } : r))
  }

  async function saveRow(idx: number) {
    const row = rows[idx]
    setRows((prev) => prev.map((r, i) => i === idx ? { ...r, saving: true } : r))

    const payload = {
      game_id: gameId,
      player_id: row.player_id,
      minutes: row.minutes || null,
      points: numOrZero(row.points),
      rebounds: numOrZero(row.rebounds),
      assists: numOrZero(row.assists),
      steals: numOrZero(row.steals),
      blocks: numOrZero(row.blocks),
      turnovers: numOrZero(row.turnovers),
      fgm: numOrZero(row.fgm), fga: numOrZero(row.fga),
      threepm: numOrZero(row.threepm), threepa: numOrZero(row.threepa),
      ftm: numOrZero(row.ftm), fta: numOrZero(row.fta),
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('player_game_stats')
      .upsert(
        row.stat_id
          ? { id: row.stat_id, ...payload }
          : { ...payload, created_at: new Date().toISOString() },
        { onConflict: 'game_id,player_id' },
      )
      .select()

    if (!error && data?.[0]) {
      setRows((prev) =>
        prev.map((r, i) =>
          i === idx ? { ...r, stat_id: (data[0] as DbPlayerGameStats).id, saving: false, saved: true } : r,
        ),
      )
    } else {
      setRows((prev) => prev.map((r, i) => i === idx ? { ...r, saving: false } : r))
    }
  }

  const statFields: Array<{ key: keyof StatsRowState; label: string; w?: string }> = [
    { key: 'minutes', label: 'MIN', w: 'w-14' },
    { key: 'points', label: 'PTS', w: 'w-10' },
    { key: 'rebounds', label: 'REB', w: 'w-10' },
    { key: 'assists', label: 'AST', w: 'w-10' },
    { key: 'steals', label: 'STL', w: 'w-10' },
    { key: 'blocks', label: 'BLK', w: 'w-10' },
    { key: 'turnovers', label: 'TO', w: 'w-10' },
    { key: 'fgm', label: 'FGM', w: 'w-10' },
    { key: 'fga', label: 'FGA', w: 'w-10' },
    { key: 'threepm', label: '3PM', w: 'w-10' },
    { key: 'threepa', label: '3PA', w: 'w-10' },
    { key: 'ftm', label: 'FTM', w: 'w-10' },
    { key: 'fta', label: 'FTA', w: 'w-10' },
  ]

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="mt-4">
      <p className="text-xs font-black uppercase tracking-widest text-white/30 mb-3">Box Score Entry</p>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr style={{ borderBottom: '1px solid hsl(220 20% 20%)' }}>
              <th className="text-left py-2 pr-3 text-white/40 font-bold uppercase tracking-wider whitespace-nowrap">Player</th>
              {statFields.map(({ label }) => (
                <th key={label} className="py-2 px-1 text-center text-white/40 font-bold uppercase tracking-wider">{label}</th>
              ))}
              <th className="py-2 pl-2 text-white/40 font-bold uppercase tracking-wider">Save</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr
                key={row.player_id}
                className={cn('border-b', idx % 2 === 0 ? 'bg-white/[0.01]' : '')}
                style={{ borderColor: 'hsl(220 20% 15%)' }}
              >
                <td className="py-2 pr-3 whitespace-nowrap">
                  <span className="text-white/80 font-bold">{row.player_name}</span>
                  {row.jersey_number != null && (
                    <span className="ml-1 text-white/30">#{row.jersey_number}</span>
                  )}
                </td>
                {statFields.map(({ key, w }) => (
                  <td key={key} className="py-1.5 px-1 text-center">
                    <input
                      type="text"
                      value={row[key] as string}
                      onChange={(e) => updateRow(idx, { [key]: e.target.value } as Partial<StatsRowState>)}
                      className={cn(
                        'text-center text-white text-xs rounded py-1 outline-none focus:ring-1 focus:ring-primary',
                        w ?? 'w-10',
                      )}
                      style={{ background: 'hsl(220 30% 14%)', border: '1px solid hsl(220 20% 22%)' }}
                    />
                  </td>
                ))}
                <td className="py-1.5 pl-2">
                  <button
                    onClick={() => { void saveRow(idx) }}
                    disabled={row.saving}
                    className={cn(
                      'px-2 py-1 rounded text-xs font-bold transition-colors',
                      row.saved
                        ? 'text-green-400 border-green-800'
                        : 'text-white/70 hover:text-white',
                    )}
                    style={{ border: '1px solid hsl(220 20% 28%)' }}
                  >
                    {row.saving ? '…' : row.saved ? <Check className="w-3 h-3" /> : 'Save'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Games Tab ─────────────────────────────────────────────────────────────────

function GamesTab() {
  const [games, setGames] = useState<DbGame[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingGame, setEditingGame] = useState<DbGame | null>(null)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [form, setForm] = useState<GameFormState>(EMPTY_GAME_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function fetchGames() {
    const { data } = await supabase
      .from('games')
      .select('*')
      .order('date', { ascending: false })
    setGames((data ?? []) as DbGame[])
    setLoading(false)
  }

  useEffect(() => { void fetchGames() }, [])

  function openAdd() {
    setEditingGame(null)
    setForm(EMPTY_GAME_FORM)
    setError(null)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function openEdit(game: DbGame) {
    setEditingGame(game)
    setForm({
      schedule_id: game.schedule_id != null ? String(game.schedule_id) : '',
      date: game.date,
      opponent: game.opponent,
      home_away: game.home_away,
      venue: game.venue ?? '',
      team_score: game.team_score != null ? String(game.team_score) : '',
      opponent_score: game.opponent_score != null ? String(game.opponent_score) : '',
      result: game.result ?? '',
    })
    setError(null)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!form.date || !form.opponent) { setError('Date and opponent are required.'); return }

    setSaving(true)
    setError(null)

    const payload = {
      schedule_id: form.schedule_id ? parseInt(form.schedule_id, 10) : null,
      date: form.date,
      opponent: form.opponent.trim(),
      home_away: form.home_away,
      venue: form.venue.trim() || null,
      team_score: form.team_score ? parseInt(form.team_score, 10) : null,
      opponent_score: form.opponent_score ? parseInt(form.opponent_score, 10) : null,
      result: form.result || null,
      updated_at: new Date().toISOString(),
    }

    try {
      if (editingGame) {
        const { error: err } = await supabase.from('games').update(payload).eq('id', editingGame.id)
        if (err) throw err
      } else {
        const { error: err } = await supabase.from('games').insert({ ...payload, created_at: new Date().toISOString() })
        if (err) throw err
      }
      setShowForm(false)
      setEditingGame(null)
      void fetchGames()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save game.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this game and all its stats?')) return
    await supabase.from('games').delete().eq('id', id)
    void fetchGames()
  }

  const inputCls = 'w-full px-3 py-2.5 rounded text-sm text-white placeholder-white/30 outline-none focus:ring-2 focus:ring-primary'
  const inputStyle = { background: 'hsl(220 30% 17%)', border: '1px solid hsl(220 20% 25%)' }
  const labelCls = 'block text-xs font-bold text-white/60 uppercase tracking-wider mb-1.5'

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Games</h2>
        {!showForm && (
          <button
            onClick={openAdd}
            className="px-4 py-2 rounded text-sm font-black uppercase tracking-wider text-white"
            style={{ background: 'hsl(26 91% 51%)' }}
          >
            + Add game
          </button>
        )}
      </div>

      {/* Game form */}
      {showForm && (
        <div
          className="rounded-xl p-6 mb-6"
          style={{ background: 'hsl(220 30% 12%)', border: '1px solid hsl(220 20% 20%)' }}
        >
          <h3 className="text-lg font-bold text-white mb-5">
            {editingGame ? 'Edit game' : 'New game'}
          </h3>
          <form onSubmit={(e) => { void handleSubmit(e) }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Schedule link */}
              <div>
                <label className={labelCls}>Link to Schedule Entry</label>
                <select
                  value={form.schedule_id}
                  onChange={(e) => {
                    const sid = e.target.value
                    const matched = allGames.find((g) => String(g.id) === sid)
                    setForm((f) => ({
                      ...f,
                      schedule_id: sid,
                      opponent: matched ? matched.opponent : f.opponent,
                      date: matched ? matched.date : f.date,
                      home_away: matched ? matched.homeAway : f.home_away,
                      venue: matched ? matched.venue : f.venue,
                    }))
                  }}
                  className={inputCls}
                  style={inputStyle}
                >
                  <option value="">— None (custom game)</option>
                  {allGames.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.displayDate} · {g.opponent}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className={labelCls}>Date <span className="text-primary">*</span></label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                  className={inputCls}
                  style={inputStyle}
                  required
                />
              </div>

              {/* Opponent */}
              <div>
                <label className={labelCls}>Opponent <span className="text-primary">*</span></label>
                <input
                  type="text"
                  value={form.opponent}
                  onChange={(e) => setForm((f) => ({ ...f, opponent: e.target.value }))}
                  className={inputCls}
                  style={inputStyle}
                  required
                />
              </div>

              {/* Home/Away */}
              <div>
                <label className={labelCls}>Home / Away</label>
                <select
                  value={form.home_away}
                  onChange={(e) => setForm((f) => ({ ...f, home_away: e.target.value }))}
                  className={inputCls}
                  style={inputStyle}
                >
                  {HOME_AWAY_OPTIONS.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>

              {/* Venue */}
              <div>
                <label className={labelCls}>Venue</label>
                <input
                  type="text"
                  value={form.venue}
                  onChange={(e) => setForm((f) => ({ ...f, venue: e.target.value }))}
                  className={inputCls}
                  style={inputStyle}
                />
              </div>

              {/* Result */}
              <div>
                <label className={labelCls}>Result</label>
                <select
                  value={form.result}
                  onChange={(e) => setForm((f) => ({ ...f, result: e.target.value }))}
                  className={inputCls}
                  style={inputStyle}
                >
                  {RESULT_OPTIONS.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              {/* Scores */}
              <div>
                <label className={labelCls}>Lady Comets Score</label>
                <input
                  type="number"
                  value={form.team_score}
                  onChange={(e) => setForm((f) => ({ ...f, team_score: e.target.value }))}
                  className={inputCls}
                  style={inputStyle}
                />
              </div>
              <div>
                <label className={labelCls}>Opponent Score</label>
                <input
                  type="number"
                  value={form.opponent_score}
                  onChange={(e) => setForm((f) => ({ ...f, opponent_score: e.target.value }))}
                  className={inputCls}
                  style={inputStyle}
                />
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
                onClick={() => { setShowForm(false); setEditingGame(null) }}
                className="px-5 py-2 text-sm font-bold text-white/60 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 rounded text-sm font-black uppercase tracking-wider text-white disabled:opacity-60"
                style={{ background: 'hsl(26 91% 51%)' }}
              >
                {saving ? 'Saving…' : editingGame ? 'Save changes' : 'Add game'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Games list */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : games.length === 0 ? (
        <div
          className="rounded-xl py-16 text-center"
          style={{ border: '1px solid hsl(220 20% 20%)' }}
        >
          <p className="text-white/40 text-sm">No games yet. Click &quot;Add game&quot; to get started.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {games.map((game) => {
            const isExpanded = expandedId === game.id
            return (
              <div
                key={game.id}
                className="rounded-lg overflow-hidden"
                style={{ background: 'hsl(220 30% 12%)', border: '1px solid hsl(220 20% 20%)' }}
              >
                {/* Row header */}
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="text-xs font-bold text-white/40 whitespace-nowrap">{game.date}</div>
                    <span
                      className={cn(
                        'text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5 shrink-0',
                        game.home_away === 'HOME'
                          ? 'bg-primary/20 text-primary'
                          : game.home_away === 'TOURNAMENT'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-white/10 text-white/40',
                      )}
                    >
                      {game.home_away}
                    </span>
                    <span className="text-sm font-bold text-white truncate">{game.opponent}</span>
                    {game.result ? (
                      <span
                        className={cn(
                          'text-xs font-black uppercase tracking-widest px-2 py-0.5 shrink-0',
                          game.result === 'W' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400',
                        )}
                      >
                        {game.result}
                        {game.team_score != null && game.opponent_score != null
                          ? ` ${game.team_score}–${game.opponent_score}`
                          : ''}
                      </span>
                    ) : (
                      <span className="text-xs text-white/30">Upcoming</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => openEdit(game)}
                      className="px-3 py-1.5 text-xs font-bold text-white/70 hover:text-white rounded transition-colors"
                      style={{ border: '1px solid hsl(220 20% 30%)' }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => { void handleDelete(game.id) }}
                      className="px-3 py-1.5 text-xs font-bold text-red-400 hover:text-red-300 rounded transition-colors"
                      style={{ border: '1px solid hsl(0 50% 30%)' }}
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : game.id)}
                      className="px-2 py-1.5 text-white/40 hover:text-white transition-colors rounded"
                      style={{ border: '1px solid hsl(220 20% 30%)' }}
                      title="Enter box score"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Box score entry */}
                {isExpanded && (
                  <div
                    className="px-4 pb-4 pt-1"
                    style={{ borderTop: '1px solid hsl(220 20% 18%)' }}
                  >
                    <BoxScoreEntry gameId={game.id} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Content CRUD ──────────────────────────────────────────────────────────────

const FEED_TYPES = [
  { value: 'feature', label: 'Feature' },
  { value: 'player_spotlight', label: 'Player Spotlight' },
  { value: 'culture', label: 'The Culture' },
  { value: 'general', label: 'General' },
] as const

const NEWS_TYPES = [
  { value: 'feature', label: 'Feature' },
  { value: 'culture', label: 'Culture' },
  { value: 'game_recap', label: 'Game Recap' },
  { value: 'training', label: 'Training' },
  { value: 'merch', label: 'Merch' },
  { value: 'general', label: 'General' },
] as const

const COL_SPAN_OPTIONS = [
  { value: 'md:col-span-1', label: '1 Column' },
  { value: 'md:col-span-2', label: '2 Columns (Wide)' },
  { value: 'md:col-span-3', label: '3 Columns (Full)' },
] as const

const ROW_SPAN_OPTIONS = [
  { value: 'md:row-span-1', label: '1 Row' },
  { value: 'md:row-span-2', label: '2 Rows (Tall)' },
] as const

interface ContentFormState {
  section: 'feed' | 'news'
  type: string
  title: string
  excerpt: string
  imageUrl: string
  imageFile: File | null
  imagePreview: string | null
  date: string
  readTime: string
  featured: boolean
  wide: boolean
  colSpan: string
  rowSpan: string
  large: boolean
  accent: string
  instagramUrl: string
  published: boolean
  sortOrder: string
}

const EMPTY_CONTENT_FORM: ContentFormState = {
  section: 'news',
  type: 'general',
  title: '',
  excerpt: '',
  imageUrl: '',
  imageFile: null,
  imagePreview: null,
  date: '',
  readTime: '',
  featured: false,
  wide: false,
  colSpan: 'md:col-span-1',
  rowSpan: 'md:row-span-1',
  large: false,
  accent: 'hsl(var(--primary))',
  instagramUrl: '',
  published: true,
  sortOrder: '0',
}

function ToggleBtn({ label, active, onToggle }: { label: string; active: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        'flex items-center gap-1.5 px-3 py-2 rounded text-xs font-bold transition-all',
        active ? 'text-green-400' : 'text-white/50 hover:text-white/80',
      )}
      style={{
        background: active ? 'hsl(140 60% 12%)' : 'hsl(220 30% 17%)',
        border: active ? '1.5px solid hsl(140 60% 45%)' : '1px solid hsl(220 20% 25%)',
      }}
    >
      {active && <Check className="w-3 h-3 stroke-[3px]" />}
      {label}
    </button>
  )
}

interface ContentFormProps {
  editing: DbContentItem | null
  onSaved: () => void
  onCancel: () => void
}

function ContentForm({ editing, onSaved, onCancel }: ContentFormProps) {
  const [form, setForm] = useState<ContentFormState>(EMPTY_CONTENT_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) {
      setForm({
        section: editing.section,
        type: editing.type,
        title: editing.title,
        excerpt: editing.excerpt ?? '',
        imageUrl: editing.image_url ?? '',
        imageFile: null,
        imagePreview: getContentImageUrl(editing),
        date: editing.date ?? '',
        readTime: editing.read_time ?? '',
        featured: editing.featured,
        wide: editing.wide,
        colSpan: editing.col_span ?? 'md:col-span-1',
        rowSpan: editing.row_span ?? 'md:row-span-1',
        large: editing.large,
        accent: editing.accent ?? 'hsl(var(--primary))',
        instagramUrl: editing.instagram_url ?? '',
        published: editing.published,
        sortOrder: String(editing.sort_order),
      })
    } else {
      setForm(EMPTY_CONTENT_FORM)
    }
  }, [editing])

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    if (!file) return
    setForm((f) => ({ ...f, imageFile: file, imagePreview: URL.createObjectURL(file) }))
  }

  function clearImageFile() {
    setForm((f) => ({ ...f, imageFile: null, imagePreview: f.imageUrl || null }))
    if (fileRef.current) fileRef.current.value = ''
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) { setError('Title is required.'); return }
    setSaving(true)
    setError(null)
    try {
      let image_path = editing?.image_path ?? null
      let image_url: string | null = form.imageUrl.trim() || null

      if (form.imageFile) {
        const ext = form.imageFile.name.split('.').pop() ?? 'jpg'
        const slug = form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40)
        const path = `content/${Date.now()}-${slug}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('lady-comets')
          .upload(path, form.imageFile, { upsert: true })
        if (uploadError) throw uploadError
        image_path = path
        image_url = null
      }

      const payload = {
        section: form.section,
        type: form.type,
        title: form.title.trim(),
        excerpt: form.excerpt.trim() || null,
        image_url,
        image_path,
        date: form.date.trim() || null,
        read_time: form.readTime.trim() || null,
        featured: form.section === 'news' ? form.featured : false,
        wide: form.section === 'news' ? form.wide : false,
        col_span: form.section === 'feed' ? form.colSpan : null,
        row_span: form.section === 'feed' ? form.rowSpan : null,
        large: form.section === 'feed' ? form.large : false,
        accent: form.section === 'feed' ? (form.accent.trim() || null) : null,
        instagram_url: form.instagramUrl.trim() || null,
        published: form.published,
        sort_order: parseInt(form.sortOrder, 10) || 0,
      }

      if (editing) {
        const { error: err } = await supabase.from('content_items').update(payload).eq('id', editing.id)
        if (err) throw err
      } else {
        const { error: err } = await supabase
          .from('content_items')
          .insert({ ...payload, created_at: new Date().toISOString() })
        if (err) throw err
      }
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save content.')
    } finally {
      setSaving(false)
    }
  }

  const inputCls = 'w-full px-3 py-2.5 rounded text-sm text-white placeholder-white/30 outline-none focus:ring-2 focus:ring-primary'
  const inputStyle = { background: 'hsl(220 30% 17%)', border: '1px solid hsl(220 20% 25%)' }
  const labelCls = 'block text-xs font-bold text-white/60 uppercase tracking-wider mb-1.5'
  const typeOptions = form.section === 'feed' ? FEED_TYPES : NEWS_TYPES
  const previewSrc = form.imagePreview ?? (form.imageUrl.startsWith('http') ? form.imageUrl : null)

  return (
    <div
      className="rounded-xl p-6 mb-6"
      style={{ background: 'hsl(220 30% 12%)', border: '1px solid hsl(220 20% 20%)' }}
    >
      <h3 className="text-lg font-bold text-white mb-5">
        {editing ? 'Edit content' : 'New content'}
      </h3>

      <form onSubmit={(e) => { void handleSubmit(e) }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Section */}
          <div>
            <label className={labelCls}>Section <span className="text-primary">*</span></label>
            <select
              value={form.section}
              onChange={(e) => setForm((f) => ({
                ...f,
                section: e.target.value as 'feed' | 'news',
                type: 'general',
              }))}
              className={inputCls}
              style={inputStyle}
            >
              <option value="news">News</option>
              <option value="feed">Feed (Home Bento)</option>
            </select>
          </div>

          {/* Type */}
          <div>
            <label className={labelCls}>Type / Category <span className="text-primary">*</span></label>
            <select
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
              className={inputCls}
              style={inputStyle}
            >
              {typeOptions.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div className="md:col-span-2">
            <label className={labelCls}>Title <span className="text-primary">*</span></label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className={inputCls}
              style={inputStyle}
              required
            />
          </div>

          {/* Excerpt */}
          <div className="md:col-span-2">
            <label className={labelCls}>Excerpt</label>
            <textarea
              value={form.excerpt}
              onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
              rows={2}
              className={`${inputCls} resize-y`}
              style={inputStyle}
            />
          </div>

          {/* Image */}
          <div className="md:col-span-2">
            <label className={labelCls}>Image</label>
            <div className="space-y-2">
              <input
                type="text"
                value={form.imageUrl}
                onChange={(e) => setForm((f) => ({
                  ...f,
                  imageUrl: e.target.value,
                  imagePreview: form.imageFile ? f.imagePreview : null,
                }))}
                placeholder="Paste image URL (e.g. from Instagram post)"
                className={inputCls}
                style={inputStyle}
              />
              <div className="flex items-center gap-3 flex-wrap">
                {previewSrc && (
                  <img src={previewSrc} alt="preview" className="w-16 h-16 object-cover rounded shrink-0" />
                )}
                <div className="flex items-center gap-2 flex-wrap text-sm text-white/50">
                  <span className="text-xs">Or upload:</span>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="text-sm text-white/60 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-bold file:bg-white/10 file:text-white/70 hover:file:bg-white/20 cursor-pointer"
                  />
                  {form.imageFile && (
                    <button
                      type="button"
                      onClick={clearImageFile}
                      className="text-xs text-red-400 hover:text-red-300 font-bold"
                    >
                      Remove file
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Instagram URL */}
          <div className="md:col-span-2">
            <label className={labelCls}>
              Instagram Post URL{' '}
              <span className="text-white/30 normal-case font-normal">(optional — adds IG link on the card)</span>
            </label>
            <input
              type="text"
              value={form.instagramUrl}
              onChange={(e) => setForm((f) => ({ ...f, instagramUrl: e.target.value }))}
              placeholder="https://www.instagram.com/p/..."
              className={inputCls}
              style={inputStyle}
            />
          </div>

          {/* Date */}
          <div>
            <label className={labelCls}>Date</label>
            <input
              type="text"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              placeholder="e.g. Apr 18, 2026"
              className={inputCls}
              style={inputStyle}
            />
          </div>

          {/* News: Read time */}
          {form.section === 'news' && (
            <div>
              <label className={labelCls}>Read Time</label>
              <input
                type="text"
                value={form.readTime}
                onChange={(e) => setForm((f) => ({ ...f, readTime: e.target.value }))}
                placeholder="e.g. 5 min read"
                className={inputCls}
                style={inputStyle}
              />
            </div>
          )}

          {/* News: Featured + Wide */}
          {form.section === 'news' && (
            <div className="md:col-span-2 flex gap-3 flex-wrap">
              <ToggleBtn
                label="Featured (hero card)"
                active={form.featured}
                onToggle={() => setForm((f) => ({ ...f, featured: !f.featured }))}
              />
              <ToggleBtn
                label="Wide (2-col span)"
                active={form.wide}
                onToggle={() => setForm((f) => ({ ...f, wide: !f.wide }))}
              />
            </div>
          )}

          {/* Feed: Layout options */}
          {form.section === 'feed' && (
            <>
              <div>
                <label className={labelCls}>Column Span</label>
                <select
                  value={form.colSpan}
                  onChange={(e) => setForm((f) => ({ ...f, colSpan: e.target.value }))}
                  className={inputCls}
                  style={inputStyle}
                >
                  {COL_SPAN_OPTIONS.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Row Span</label>
                <select
                  value={form.rowSpan}
                  onChange={(e) => setForm((f) => ({ ...f, rowSpan: e.target.value }))}
                  className={inputCls}
                  style={inputStyle}
                >
                  {ROW_SPAN_OPTIONS.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2 flex gap-3 flex-wrap">
                <ToggleBtn
                  label="Large card (bigger title)"
                  active={form.large}
                  onToggle={() => setForm((f) => ({ ...f, large: !f.large }))}
                />
              </div>
              <div className="md:col-span-2">
                <label className={labelCls}>Accent Color</label>
                <input
                  type="text"
                  value={form.accent}
                  onChange={(e) => setForm((f) => ({ ...f, accent: e.target.value }))}
                  placeholder="e.g. hsl(var(--primary))"
                  className={inputCls}
                  style={inputStyle}
                />
              </div>
            </>
          )}

          {/* Published + Sort order */}
          <div className="flex items-center gap-3 flex-wrap">
            <ToggleBtn
              label="Published"
              active={form.published}
              onToggle={() => setForm((f) => ({ ...f, published: !f.published }))}
            />
          </div>
          <div>
            <label className={labelCls}>Sort Order</label>
            <input
              type="number"
              value={form.sortOrder}
              onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))}
              className={inputCls}
              style={inputStyle}
            />
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
            {saving ? 'Saving…' : editing ? 'Save changes' : 'Add content'}
          </button>
        </div>
      </form>
    </div>
  )
}

// ── Content Tab ────────────────────────────────────────────────────────────────

type SectionFilter = 'all' | 'feed' | 'news'

function typeLabel(type: string) {
  return type.split('_').map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')
}

function ContentTab() {
  const [items, setItems] = useState<DbContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<DbContentItem | null>(null)
  const [sectionFilter, setSectionFilter] = useState<SectionFilter>('all')

  async function fetchItems() {
    const { data } = await supabase
      .from('content_items')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })
    setItems((data as DbContentItem[]) ?? [])
    setLoading(false)
  }

  useEffect(() => { void fetchItems() }, [])

  async function handleDelete(id: number) {
    if (!confirm('Delete this content item?')) return
    await supabase.from('content_items').delete().eq('id', id)
    void fetchItems()
  }

  async function togglePublished(item: DbContentItem) {
    const next = !item.published
    await supabase.from('content_items').update({ published: next }).eq('id', item.id)
    setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, published: next } : i))
  }

  function openAdd() {
    setEditingItem(null)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function openEdit(item: DbContentItem) {
    setEditingItem(item)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleSaved() {
    setShowForm(false)
    setEditingItem(null)
    void fetchItems()
  }

  const filtered = sectionFilter === 'all' ? items : items.filter((i) => i.section === sectionFilter)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Content</h2>
        {!showForm && (
          <button
            onClick={openAdd}
            className="px-4 py-2 rounded text-sm font-black uppercase tracking-wider text-white"
            style={{ background: 'hsl(26 91% 51%)' }}
          >
            + Add content
          </button>
        )}
      </div>

      {showForm && (
        <ContentForm
          editing={editingItem}
          onSaved={handleSaved}
          onCancel={() => { setShowForm(false); setEditingItem(null) }}
        />
      )}

      {/* Section filter */}
      {!showForm && (
        <div className="flex gap-2 mb-5">
          {(['all', 'feed', 'news'] as SectionFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => setSectionFilter(s)}
              className={cn(
                'px-3 py-1.5 text-xs font-bold rounded capitalize transition-all',
                sectionFilter === s ? 'text-white' : 'text-white/40 hover:text-white/70',
              )}
              style={{
                background: sectionFilter === s ? 'hsl(220 30% 20%)' : 'hsl(220 30% 14%)',
                border: sectionFilter === s ? '1px solid hsl(220 20% 35%)' : '1px solid hsl(220 20% 20%)',
              }}
            >
              {s === 'all' ? 'All' : s === 'feed' ? 'Feed' : 'News'}
            </button>
          ))}
          <span className="ml-2 text-xs text-white/20 self-center">
            {filtered.length} item{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="rounded-xl py-16 text-center"
          style={{ border: '1px solid hsl(220 20% 20%)' }}
        >
          <p className="text-white/40 text-sm">
            No content yet. Click &quot;Add content&quot; to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((item) => {
            const imgSrc = getContentImageUrl(item)
            return (
              <div
                key={item.id}
                className="flex items-center justify-between px-4 py-3 rounded-lg"
                style={{ background: 'hsl(220 30% 12%)', border: '1px solid hsl(220 20% 20%)' }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded overflow-hidden shrink-0 bg-white/5">
                    {imgSrc ? (
                      <img src={imgSrc} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/20 text-[10px] font-black">
                        {item.section.toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span
                        className={cn(
                          'text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5 shrink-0',
                          item.section === 'feed'
                            ? 'bg-primary/20 text-primary'
                            : 'bg-blue-500/20 text-blue-400',
                        )}
                      >
                        {item.section}
                      </span>
                      <span className="text-[10px] text-white/40 uppercase tracking-widest shrink-0">
                        {typeLabel(item.type)}
                      </span>
                      {item.instagram_url && (
                        <a
                          href={item.instagram_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-pink-400/60 hover:text-pink-400 font-bold shrink-0 transition-colors"
                          title="View Instagram post"
                        >
                          IG ↗
                        </a>
                      )}
                    </div>
                    <p className="text-sm font-bold text-white leading-tight truncate">{item.title}</p>
                    <p className="text-xs text-white/30 mt-0.5">
                      {[item.date, item.read_time].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => { void togglePublished(item) }}
                    className={cn(
                      'px-2 py-1 text-xs font-bold rounded transition-all',
                      item.published ? 'text-green-400' : 'text-white/30 hover:text-white/60',
                    )}
                    style={{
                      background: item.published ? 'hsl(140 60% 10%)' : 'hsl(220 30% 14%)',
                      border: item.published ? '1px solid hsl(140 60% 30%)' : '1px solid hsl(220 20% 22%)',
                    }}
                    title={item.published ? 'Live — click to unpublish' : 'Draft — click to publish'}
                  >
                    {item.published ? 'Live' : 'Draft'}
                  </button>
                  <button
                    onClick={() => openEdit(item)}
                    className="px-3 py-1.5 text-xs font-bold text-white/70 hover:text-white rounded transition-colors"
                    style={{ border: '1px solid hsl(220 20% 30%)' }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => { void handleDelete(item.id) }}
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

        {tab === 'games' && <GamesTab />}

        {tab === 'content' && <ContentTab />}
      </main>
    </div>
  )
}
