import { useState } from 'react'
import { C, generateId } from '../tokens'
import { Avatar } from '../components/Avatar'
import { createEvent } from '../hooks/useFirestore'
import type { FamilyEvent, Member } from '../types'

interface Props {
  memberId: string
  members: Member[]
  familyId: string
  onCancel: () => void
  onCreated: (eventId: string) => void
  _demoOnCreate?: (data: Omit<FamilyEvent, 'id'>) => void
}

const TYPE_OPTIONS = [
  { id: 'holiday' as const,  label: '🎉 Holiday'  },
  { id: 'vacation' as const, label: '✈️ Vacation' },
  { id: 'birthday' as const, label: '🎂 Birthday' },
  { id: 'other' as const,    label: '📅 Other'    },
]

const EMOJI_MAP: Record<FamilyEvent['type'], string> = {
  holiday: '🎉', vacation: '✈️', birthday: '🎂', other: '📅',
}

export function CreateEventScreen({ memberId, members, familyId, onCancel, onCreated, _demoOnCreate }: Props) {
  const today = new Date().toISOString().split('T')[0]
  const [form, setForm] = useState({
    name: '', type: 'other' as FamilyEvent['type'],
    date: today, endDate: '', time: '', location: '', description: '',
    attendees: members.map(m => m.id), // default: everyone
  })
  const [loading, setLoading] = useState(false)
  const set = <K extends keyof typeof form>(k: K, v: typeof form[K]) => setForm(f => ({ ...f, [k]: v }))

  function toggleMember(id: string) {
    set('attendees', form.attendees.includes(id)
      ? form.attendees.filter(a => a !== id)
      : [...form.attendees, id])
  }

  const canCreate = form.name.trim().length > 0 && form.date.length > 0

  async function handleCreate() {
    if (!canCreate || loading) return
    const eventData = {
      name: form.name.trim(),
      type: form.type,
      emoji: EMOJI_MAP[form.type],
      date: form.date,
      ...(form.endDate ? { endDate: form.endDate } : {}),
      ...(form.time ? { time: form.time } : {}),
      location: form.location.trim(),
      description: form.description.trim(),
      attendees: form.attendees,
      createdBy: memberId,
    }

    if (_demoOnCreate) { _demoOnCreate(eventData); return }

    setLoading(true)
    try {
      const eventId = await createEvent(eventData, familyId)
      onCreated(eventId)
    } catch { setLoading(false) }
  }

  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px', borderBottom: `1px solid ${C.border}`,
        background: C.card, position: 'sticky', top: 0, zIndex: 20,
      }}>
        <button onClick={onCancel} style={textBtn}>Cancel</button>
        <span style={{ fontFamily: 'Georgia, serif', fontSize: 16, fontWeight: 700, color: C.text }}>New Event</span>
        <button onClick={handleCreate} disabled={!canCreate || loading} style={{
          ...textBtn, color: canCreate ? C.sage : C.textLight,
          cursor: canCreate ? 'pointer' : 'default', fontWeight: 600,
        }}>
          {loading ? '…' : 'Create'}
        </button>
      </div>

      <div style={{ padding: '20px 16px 32px' }}>
        <Field label="Event Name">
          <input value={form.name} onChange={e => set('name', e.target.value)}
            placeholder="e.g. Weekend Trip"
            style={{ ...inputStyle, borderColor: form.name ? C.sage : C.border }} />
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
          <input type="date" value={form.date} onChange={e => set('date', e.target.value)} style={inputStyle} />
        </Field>

        <Field label="End Date (optional — for multi-day)">
          <input type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} style={inputStyle} />
        </Field>

        <Field label="Time (optional)">
          <input type="time" value={form.time} onChange={e => set('time', e.target.value)} style={inputStyle} />
        </Field>

        <Field label="Location">
          <input value={form.location} onChange={e => set('location', e.target.value)}
            placeholder="Where?" style={inputStyle} />
        </Field>

        <Field label="Notes">
          <textarea value={form.description} onChange={e => set('description', e.target.value)}
            placeholder="Any details…" rows={3}
            style={{ ...inputStyle, resize: 'none' }} />
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

        <button onClick={handleCreate} disabled={!canCreate || loading} style={{
          width: '100%', padding: '14px', borderRadius: 14, marginTop: 8,
          background: canCreate ? C.sage : C.border,
          border: 'none', color: 'white', fontSize: 16, fontWeight: 700,
          cursor: canCreate ? 'pointer' : 'default', fontFamily: 'Georgia, serif',
        }}>
          {loading ? 'Creating…' : 'Create Event'}
        </button>
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

const inputStyle: React.CSSProperties = {
  display: 'block', width: '100%', padding: '10px 13px',
  borderRadius: 10, border: `1.5px solid ${C.border}`,
  outline: 'none', fontSize: 14, background: C.card,
  color: C.text, boxSizing: 'border-box',
}
const textBtn: React.CSSProperties = {
  background: 'none', border: 'none', cursor: 'pointer',
  color: C.sage, fontSize: 15, fontWeight: 500,
}
