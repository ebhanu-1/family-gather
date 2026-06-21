import { useState, useRef, useEffect } from 'react'
import { C, getEventType, formatDate, daysUntil, parseD, generateId } from '../tokens'
import { AvatarGroup, Avatar } from '../components/Avatar'
import { IconBack, IconCheck, IconEdit } from '../components/Icons'
import type { FamilyEvent, Member, EventTab, TodoItem, ItineraryItem } from '../types'

export interface EventDetailCallbacks {
  onAddTodo: (text: string) => void
  onToggleTodo: (todoId: string, done: boolean) => void
  onAddItinerary: (item: Omit<ItineraryItem, 'id'>) => void
  onUpdateItinerary: (itemId: string, data: Partial<Omit<ItineraryItem, 'id'>>) => void
  onDeleteItinerary: (itemId: string) => void
}

interface Props {
  event: FamilyEvent
  members: Member[]
  memberId: string
  activeTab: EventTab
  setActiveTab: (tab: EventTab) => void
  onBack: () => void
  todos: TodoItem[]
  itinerary: ItineraryItem[]
  callbacks: EventDetailCallbacks
  onEditEvent: (data: Partial<FamilyEvent>) => Promise<void> | void
  onDeleteEvent: () => Promise<void> | void
}

export function EventDetailScreen({
  event, members, memberId, activeTab, setActiveTab, onBack,
  todos, itinerary, callbacks, onEditEvent, onDeleteEvent,
}: Props) {
  const type = getEventType(event.type)
  const [showEditOverlay, setShowEditOverlay] = useState(false)

  return (
    <div>
      {/* Sticky header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 20,
        background: 'rgba(252,250,246,0.97)', backdropFilter: 'blur(10px)',
        padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8,
        borderBottom: `1px solid ${C.border}`,
      }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 4px 4px 0', display: 'flex' }}>
          <IconBack color={C.sage} />
        </button>
        <span style={{ fontFamily: 'Georgia, serif', fontSize: 16, fontWeight: 700, color: C.text, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {event.name}
        </span>
        <button
          onClick={() => setShowEditOverlay(true)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex' }}
        >
          <IconEdit color={C.textMid} />
        </button>
      </div>

      {/* Banner */}
      <div style={{ background: type.bg, padding: '18px 16px 14px', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, background: 'white',
            border: `1.5px solid ${type.color}33`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, flexShrink: 0,
          }}>
            {event.emoji}
          </div>
          <div>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: 18, fontWeight: 700, color: C.text }}>{event.name}</div>
            <div style={{ fontSize: 13, color: C.textMid, marginTop: 2 }}>
              {formatDate(event.date, event.endDate)}{event.time ? ` · ${event.time}` : ''}
            </div>
            <div style={{ fontSize: 12, color: C.textLight, marginTop: 2 }}>📍 {event.location}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 14 }}>
          <span style={{ fontSize: 11, color: C.textLight }}>Going:</span>
          <AvatarGroup memberIds={event.attendees} members={members} size={28} />
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', borderBottom: `1px solid ${C.border}`, background: C.card, position: 'sticky', top: 47, zIndex: 10 }}>
        {(['details', 'plan', 'todo'] as EventTab[]).map(t => (
          <button key={t} onClick={() => setActiveTab(t)} style={{
            flex: 1, padding: '10px 0', background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 12, fontWeight: activeTab === t ? 600 : 400,
            color: activeTab === t ? C.sage : C.textLight,
            borderBottom: activeTab === t ? `2px solid ${C.sage}` : '2px solid transparent',
          }}>
            {{ details: 'Details', plan: 'Plan', todo: 'To-Do' }[t]}
          </button>
        ))}
      </div>

      {activeTab === 'details'  && <DetailsTab event={event} />}
      {activeTab === 'plan'     && (
        <PlanTab
          event={event} itinerary={itinerary}
          onAdd={callbacks.onAddItinerary}
          onUpdate={callbacks.onUpdateItinerary}
          onDelete={callbacks.onDeleteItinerary}
        />
      )}
      {activeTab === 'todo'     && <TodoTab event={event} todos={todos} onToggle={callbacks.onToggleTodo} onAdd={callbacks.onAddTodo} />}

      {/* Edit event overlay */}
      {showEditOverlay && (
        <EditEventOverlay
          event={event}
          members={members}
          onSave={async data => {
            await onEditEvent(data)
            setShowEditOverlay(false)
          }}
          onDelete={async () => {
            await onDeleteEvent()
            setShowEditOverlay(false)
            onBack()
          }}
          onCancel={() => setShowEditOverlay(false)}
        />
      )}
    </div>
  )
}

// ── Details ───────────────────────────────────────────────────────────────────

function DetailsTab({ event }: { event: FamilyEvent }) {
  const days = daysUntil(event.date)
  return (
    <div style={{ padding: 16 }}>
      <div style={{ fontFamily: 'Georgia, serif', fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 8 }}>About</div>
      <div style={{ fontSize: 13, color: C.textMid, lineHeight: 1.7 }}>{event.description || 'No description yet.'}</div>
      <div style={{ marginTop: 20, padding: 16, background: C.sageLight, borderRadius: 14 }}>
        <div style={{ fontSize: 11, color: C.textLight, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Countdown</div>
        <div style={{ fontFamily: 'Georgia, serif', fontSize: 32, fontWeight: 700, color: C.sage, marginTop: 4, lineHeight: 1 }}>
          {days < 0 ? '—' : days}
        </div>
        <div style={{ fontSize: 13, color: C.textMid, marginTop: 4 }}>
          {days < 0 ? `${event.name} has passed` : days === 0 ? 'Today!' : `days until ${event.name}`}
        </div>
      </div>
    </div>
  )
}

// ── Plan / Itinerary ──────────────────────────────────────────────────────────

function addMinutes(time: string, mins: number): string {
  const [h, m] = time.split(':').map(Number)
  const total = h * 60 + m + mins
  const nh = Math.floor(total / 60) % 24
  const nm = total % 60
  return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`
}

function formatTimeRange(time: string, endTime?: string): string {
  if (!endTime) return time
  return `${time} – ${endTime}`
}

interface PlanTabProps {
  event: FamilyEvent
  itinerary: ItineraryItem[]
  onAdd: (item: Omit<ItineraryItem, 'id'>) => void
  onUpdate: (itemId: string, data: Partial<Omit<ItineraryItem, 'id'>>) => void
  onDelete: (itemId: string) => void
}

function PlanTab({ event, itinerary, onAdd, onUpdate, onDelete }: PlanTabProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [addTitle, setAddTitle] = useState('')
  const [addDate, setAddDate] = useState(event.date)
  const [addTime, setAddTime] = useState('12:00')
  const [addEndTime, setAddEndTime] = useState('12:30')

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDate, setEditDate] = useState('')
  const [editTime, setEditTime] = useState('')
  const [editEndTime, setEditEndTime] = useState('')

  const addFormRef = useRef<HTMLDivElement>(null)

  // Scroll form into view immediately when it appears (before keyboard).
  // updateVh then re-scrolls the focused input once the keyboard settles.
  useEffect(() => {
    if (!showAddForm) return
    addFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [showAddForm])

  useEffect(() => {
    if (!editingId) return
    document.getElementById(`plan-edit-${editingId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [editingId])

  const sorted = [...itinerary].sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
  const groups: { date: string; items: ItineraryItem[] }[] = []
  sorted.forEach(item => {
    const last = groups[groups.length - 1]
    if (last && last.date === item.date) last.items.push(item)
    else groups.push({ date: item.date, items: [item] })
  })

  function submitAdd() {
    if (!addTitle.trim()) return
    onAdd({ date: addDate, time: addTime, endTime: addEndTime || undefined, title: addTitle.trim(), createdBy: '' })
    setAddTitle(''); setAddDate(event.date); setAddTime('12:00'); setAddEndTime('12:30'); setShowAddForm(false)
  }

  function startEdit(item: ItineraryItem) {
    setEditingId(item.id)
    setEditTitle(item.title)
    setEditDate(item.date)
    setEditTime(item.time)
    setEditEndTime(item.endTime ?? '')
  }

  function submitEdit() {
    if (!editingId || !editTitle.trim()) return
    onUpdate(editingId, {
      title: editTitle.trim(),
      date: editDate,
      time: editTime,
      endTime: editEndTime || undefined,
    })
    setEditingId(null)
  }

  function handleAddTimeChange(t: string) {
    setAddTime(t)
    setAddEndTime(addMinutes(t, 30))
  }

  function handleEditTimeChange(t: string) {
    setEditTime(t)
    setEditEndTime(addMinutes(t, 30))
  }

  return (
    <div style={{ padding: '12px 16px 16px' }}>
      {groups.length === 0 && (
        <div style={{ textAlign: 'center', color: C.textLight, fontSize: 13, padding: '28px 0' }}>
          No schedule yet — add the first item below!
        </div>
      )}
      {groups.map(({ date: d, items: dayItems }) => {
        const dayLabel = parseD(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
        return (
          <div key={d} style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.textLight, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4, paddingLeft: 80 }}>
              {dayLabel}
            </div>
            {dayItems.map((item, i) => {
              const isLast = i === dayItems.length - 1
              const isEditing = editingId === item.id

              return (
                <div key={item.id}>
                  <div style={{ display: 'flex' }}>
                    <div style={{ width: 62, fontSize: 11, fontWeight: 700, color: C.sage, paddingTop: 13, flexShrink: 0, textAlign: 'right', paddingRight: 10 }}>
                      {formatTimeRange(item.time, item.endTime)}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 20, flexShrink: 0 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: C.sage, marginTop: 13, flexShrink: 0, outline: `3px solid ${C.sageLight}`, outlineOffset: 0 }} />
                      {!isLast && <div style={{ width: 2, flex: 1, background: C.border, minHeight: 18 }} />}
                    </div>
                    <div
                      style={{ flex: 1, paddingTop: 9, paddingBottom: isLast ? 6 : 12, paddingLeft: 10, cursor: 'pointer' }}
                      onClick={() => !isEditing && startEdit(item)}
                    >
                      <div style={{ fontSize: 14, color: C.text, fontWeight: 500 }}>{item.title}</div>
                      {!isEditing && (
                        <div style={{ fontSize: 11, color: C.textLight, marginTop: 2 }}>Tap to edit</div>
                      )}
                    </div>
                  </div>

                  {/* Inline edit form */}
                  {isEditing && (
                    <div id={`plan-edit-${item.id}`} style={{ marginLeft: 82, marginTop: 4, marginBottom: 8, padding: 12, background: C.brownLight, borderRadius: 12 }}>
                      <input value={editTitle} onChange={e => setEditTitle(e.target.value)} placeholder="Activity or note…" autoFocus style={inlineInput} />
                      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                        <input type="date" value={editDate} onChange={e => setEditDate(e.target.value)} style={{ ...inlineInput, flex: 1 }} />
                      </div>
                      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                        <input type="time" value={editTime} onChange={e => handleEditTimeChange(e.target.value)} style={{ ...inlineInput, flex: 1 }} />
                        <input type="time" value={editEndTime} onChange={e => setEditEndTime(e.target.value)} style={{ ...inlineInput, flex: 1 }} />
                      </div>
                      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                        <button onClick={() => onDelete(item.id)} style={{ ...cancelBtn, color: '#c0392b', borderColor: '#e74c3c', flex: 1 }}>Delete</button>
                        <button onClick={() => setEditingId(null)} style={{ ...cancelBtn, flex: 1 }}>Cancel</button>
                        <button onClick={submitEdit} style={{ ...addBtn, flex: 2 }}>Save</button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )
      })}

      {showAddForm ? (
        <div ref={addFormRef} style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8, padding: 12, background: C.brownLight, borderRadius: 12 }}>
          <input value={addTitle} onChange={e => setAddTitle(e.target.value)} placeholder="Activity or note…" autoFocus style={inlineInput} />
          <div style={{ display: 'flex', gap: 8 }}>
            <input type="date" value={addDate} onChange={e => setAddDate(e.target.value)} style={{ ...inlineInput, flex: 1 }} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input type="time" value={addTime} onChange={e => handleAddTimeChange(e.target.value)} style={{ ...inlineInput, flex: 1 }} />
            <input type="time" value={addEndTime} onChange={e => setAddEndTime(e.target.value)} style={{ ...inlineInput, flex: 1 }} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setShowAddForm(false)} style={cancelBtn}>Cancel</button>
            <button onClick={submitAdd} style={addBtn}>Add</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowAddForm(true)} style={dashedBtn}>
          <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Add to schedule
        </button>
      )}
    </div>
  )
}

// ── To-Do ─────────────────────────────────────────────────────────────────────

function TodoTab({ event, todos, onToggle, onAdd }: { event: FamilyEvent; todos: TodoItem[]; onToggle: (id: string, done: boolean) => void; onAdd: (text: string) => void }) {
  const [showForm, setShowForm] = useState(false)
  const [text, setText] = useState('')
  const done = todos.filter(t => t.done).length
  const inputRowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!showForm) return
    inputRowRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [showForm])

  function submit() {
    if (!text.trim()) return
    onAdd(text.trim()); setText(''); setShowForm(false)
  }

  return (
    <div style={{ padding: '8px 16px 16px' }}>
      <div style={{ fontSize: 12, color: C.textLight, marginBottom: 8 }}>{done} of {todos.length} done</div>
      {todos.map(todo => (
        <div key={todo.id} onClick={() => onToggle(todo.id, !todo.done)} style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '12px 0', borderBottom: `1px solid ${C.border}`,
          cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
        }}>
          <div style={{
            width: 22, height: 22, borderRadius: 6, flexShrink: 0,
            border: todo.done ? 'none' : `1.5px solid ${C.border}`,
            background: todo.done ? C.sage : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {todo.done && <IconCheck color="white" />}
          </div>
          <span style={{ fontSize: 14, color: todo.done ? C.textLight : C.text, textDecoration: todo.done ? 'line-through' : 'none' }}>
            {todo.text}
          </span>
        </div>
      ))}
      {showForm ? (
        <div ref={inputRowRef} style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()}
            placeholder="Add an item…" autoFocus
            style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: `1.5px solid ${C.sage}`, outline: 'none', fontSize: 14, background: C.card, color: C.text }} />
          <button onClick={submit} style={{ padding: '8px 14px', borderRadius: 8, background: C.sage, border: 'none', color: 'white', fontWeight: 600, cursor: 'pointer' }}>Add</button>
        </div>
      ) : (
        <button onClick={() => setShowForm(true)} style={{ ...dashedBtn, marginTop: 12 }}>
          <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Add item
        </button>
      )}
    </div>
  )
}

// ── Edit Event Overlay ────────────────────────────────────────────────────────

const TYPE_OPTIONS = [
  { id: 'holiday' as const,  label: '🎉 Holiday'  },
  { id: 'vacation' as const, label: '✈️ Vacation' },
  { id: 'birthday' as const, label: '🎂 Birthday' },
  { id: 'other' as const,    label: '📅 Other'    },
]

const EMOJI_MAP: Record<FamilyEvent['type'], string> = {
  holiday: '🎉', vacation: '✈️', birthday: '🎂', other: '📅',
}

function EditEventOverlay({ event, members, onSave, onDelete, onCancel }: {
  event: FamilyEvent
  members: Member[]
  onSave: (data: Partial<FamilyEvent>) => Promise<void>
  onDelete: () => Promise<void>
  onCancel: () => void
}) {
  const [form, setForm] = useState({
    name: event.name,
    type: event.type,
    date: event.date,
    endDate: event.endDate ?? '',
    time: event.time ?? '',
    location: event.location,
    description: event.description,
    attendees: event.attendees ?? [],
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const set = <K extends keyof typeof form>(k: K, v: typeof form[K]) => setForm(f => ({ ...f, [k]: v }))

  function toggleMember(id: string) {
    set('attendees', form.attendees.includes(id)
      ? form.attendees.filter(a => a !== id)
      : [...form.attendees, id])
  }

  async function handleSave() {
    if (!form.name.trim() || saving) return
    setSaving(true)
    setError(null)
    try {
      await onSave({
        name: form.name.trim(),
        type: form.type,
        emoji: EMOJI_MAP[form.type],
        date: form.date,
        endDate: form.endDate || undefined,
        time: form.time || undefined,
        location: form.location.trim(),
        description: form.description.trim(),
        attendees: form.attendees,
      })
    } catch (e) {
      setError('Failed to save. Please try again.')
      setSaving(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      height: 'calc(var(--vh, 1svh) * 100)',
      display: 'flex', flexDirection: 'column',
      background: C.cream,
    }}>
      {/* Top bar */}
      <div style={{
        flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px', borderBottom: `1px solid ${C.border}`,
        background: C.card,
      }}>
        <button onClick={onCancel} disabled={saving} style={textBtn}>Cancel</button>
        <span style={{ fontFamily: 'Georgia, serif', fontSize: 16, fontWeight: 700, color: C.text }}>Edit Event</span>
        <button onClick={handleSave} disabled={!form.name.trim() || saving} style={{
          ...textBtn, color: form.name.trim() && !saving ? C.sage : C.textLight,
          cursor: form.name.trim() && !saving ? 'pointer' : 'default', fontWeight: 600,
        }}>{saving ? 'Saving…' : 'Save'}</button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
      <div style={{ padding: '20px 16px 32px' }}>
        <Field label="Event Name">
          <input value={form.name} onChange={e => set('name', e.target.value)}
            placeholder="e.g. Weekend Trip"
            style={{ ...overlayInput, borderColor: form.name ? C.sage : C.border }} />
        </Field>

        <Field label="Type">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {TYPE_OPTIONS.map(t => (
              <button key={t.id} onClick={() => set('type', t.id)} style={{
                padding: '9px 10px', borderRadius: 10, cursor: 'pointer', textAlign: 'left',
                border: `1.5px solid ${form.type === t.id ? C.sage : C.border}`,
                background: form.type === t.id ? C.sageLight : C.card,
                color: form.type === t.id ? C.sage : C.textMid,
                fontSize: 13, fontWeight: form.type === t.id ? 600 : 400,
              }}>{t.label}</button>
            ))}
          </div>
        </Field>

        <Field label="Date">
          <input type="date" value={form.date} onChange={e => set('date', e.target.value)} style={overlayInput} />
        </Field>

        <Field label="End Date (optional)">
          <input type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} style={overlayInput} />
        </Field>

        <Field label="Time (optional)">
          <input type="time" value={form.time} onChange={e => set('time', e.target.value)} style={overlayInput} />
        </Field>

        <Field label="Location">
          <input value={form.location} onChange={e => set('location', e.target.value)}
            placeholder="Where?" style={overlayInput} />
        </Field>

        <Field label="Notes">
          <textarea value={form.description} onChange={e => set('description', e.target.value)}
            placeholder="Any details…" rows={3}
            style={{ ...overlayInput, resize: 'none' }} />
        </Field>

        {members.length > 1 && (
          <Field label="Who's coming">
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {members.map(m => {
                const sel = form.attendees.includes(m.id)
                return (
                  <div key={m.id} onClick={() => toggleMember(m.id)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                    <Avatar member={m} size={38} style={{
                      outline: sel ? `2.5px solid ${C.sage}` : '2.5px solid transparent',
                      outlineOffset: 2, opacity: sel ? 1 : 0.4,
                    }} />
                    <span style={{ fontSize: 10, color: C.textMid }}>{m.name}</span>
                  </div>
                )
              })}
            </div>
          </Field>
        )}

        {error && (
          <div style={{ color: '#c0392b', fontSize: 13, textAlign: 'center', marginBottom: 8 }}>
            {error}
          </div>
        )}
        <button onClick={handleSave} disabled={!form.name.trim() || saving} style={{
          width: '100%', padding: '14px', borderRadius: 14, marginTop: 8,
          background: form.name.trim() && !saving ? C.sage : C.border,
          border: 'none', color: 'white', fontSize: 16, fontWeight: 700,
          cursor: form.name.trim() && !saving ? 'pointer' : 'default', fontFamily: 'Georgia, serif',
        }}>
          {saving ? 'Saving…' : 'Save Changes'}
        </button>

        {/* Delete */}
        {!confirmDelete ? (
          <button onClick={() => setConfirmDelete(true)} disabled={saving} style={{
            width: '100%', padding: '12px', borderRadius: 14, marginTop: 10,
            background: 'transparent', border: `1.5px solid #e74c3c`,
            color: '#c0392b', fontSize: 14, fontWeight: 600, cursor: 'pointer',
          }}>
            Delete Event
          </button>
        ) : (
          <div style={{ marginTop: 10, padding: 14, borderRadius: 14, background: '#fff0ee', border: '1.5px solid #e74c3c' }}>
            <div style={{ fontSize: 13, color: '#c0392b', fontWeight: 600, marginBottom: 10, textAlign: 'center' }}>
              Delete "{event.name}"? This cannot be undone.
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setConfirmDelete(false)} style={{ ...cancelBtn, flex: 1 }}>Cancel</button>
              <button onClick={onDelete} disabled={saving} style={{
                flex: 2, padding: '10px', borderRadius: 10, background: '#c0392b',
                border: 'none', color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: 14,
              }}>Yes, Delete</button>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: C.textLight, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>{label}</div>
      {children}
    </div>
  )
}

// ── Shared styles ─────────────────────────────────────────────────────────────

const inlineInput: React.CSSProperties = {
  padding: '8px 12px', borderRadius: 8, border: `1.5px solid ${C.sage}`,
  outline: 'none', fontSize: 14, background: C.card, color: C.text,
  width: '100%', boxSizing: 'border-box',
}
const cancelBtn: React.CSSProperties = {
  flex: 1, padding: '8px', borderRadius: 8, border: `1px solid ${C.border}`,
  background: 'transparent', color: C.textMid, cursor: 'pointer', fontSize: 13,
}
const addBtn: React.CSSProperties = {
  flex: 2, padding: '8px', borderRadius: 8, background: C.sage,
  border: 'none', color: 'white', fontWeight: 600, cursor: 'pointer', fontSize: 13,
}
const dashedBtn: React.CSSProperties = {
  width: '100%', padding: '10px', borderRadius: 10, marginTop: 4,
  border: `1.5px dashed ${C.border}`, background: 'transparent',
  color: C.textLight, fontSize: 13, cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
}
const overlayInput: React.CSSProperties = {
  display: 'block', width: '100%', padding: '10px 13px',
  borderRadius: 10, border: `1.5px solid ${C.border}`,
  outline: 'none', fontSize: 14, background: C.card,
  color: C.text, boxSizing: 'border-box',
}
const textBtn: React.CSSProperties = {
  background: 'none', border: 'none', cursor: 'pointer',
  color: C.sage, fontSize: 15, fontWeight: 500,
}
