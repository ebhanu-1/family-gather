import { useState, useEffect } from 'react'
import { C, AVATAR_COLORS, generateId } from '../tokens'
import { fetchMembers, createMember } from '../hooks/useFirestore'
import { Avatar } from '../components/Avatar'
import type { Member, Identity } from '../types'

interface Props {
  onComplete: (identity: Identity) => void
}

type Step = 'loading' | 'pick' | 'create'

export function Onboarding({ onComplete }: Props) {
  const [step, setStep] = useState<Step>('loading')
  const [members, setMembers] = useState<Member[]>([])
  const [name, setName] = useState('')
  const [initials, setInitials] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchMembers().then(existing => {
      setMembers(existing)
      setStep(existing.length > 0 ? 'pick' : 'create')
    }).catch(() => setStep('create'))
  }, [])

  function handleNameChange(val: string) {
    setName(val)
    const parts = val.trim().split(/\s+/)
    if (parts.length >= 2) setInitials((parts[0][0] + parts[parts.length - 1][0]).toUpperCase())
    else if (parts[0]) setInitials(parts[0].slice(0, 2).toUpperCase())
    else setInitials('')
  }

  async function handleCreate() {
    if (!name.trim() || saving) return
    setSaving(true)
    try {
      const memberId = generateId()
      const color = AVATAR_COLORS[members.length % AVATAR_COLORS.length]
      await createMember(memberId, {
        name: name.trim(),
        initials: initials || name.slice(0, 2).toUpperCase(),
        color,
      })
      onComplete({ memberId })
    } catch {
      setError('Could not save profile. Try again.')
      setSaving(false)
    }
  }

  if (step === 'loading') {
    return (
      <Screen>
        <div style={{ textAlign: 'center', color: C.textLight, fontSize: 14 }}>Loading…</div>
      </Screen>
    )
  }

  return (
    <Screen>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ fontSize: 36, marginBottom: 8 }}>🏠</div>
        <div style={{ fontFamily: 'Georgia, serif', fontSize: 26, fontWeight: 700, color: C.text }}>
          FamilyGather
        </div>
        <div style={{ fontSize: 14, color: C.textMid, marginTop: 4 }}>Plan together.</div>
      </div>

      {error && (
        <div style={{ background: 'oklch(97% 0.025 30)', border: '1px solid #B84030', color: '#B84030', borderRadius: 10, padding: '10px 14px', fontSize: 13, marginBottom: 16 }}>
          {error}
        </div>
      )}

      {/* Pick existing profile */}
      {step === 'pick' && (
        <>
          <div style={{ fontSize: 15, fontWeight: 600, color: C.text, marginBottom: 16, textAlign: 'center' }}>
            Who are you?
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginBottom: 24 }}>
            {members.map(m => (
              <button key={m.id} onClick={() => onComplete({ memberId: m.id })} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '10px 14px', borderRadius: 14,
                transition: 'background 0.1s',
              }}
                onMouseEnter={e => (e.currentTarget.style.background = C.sageLight)}
                onMouseLeave={e => (e.currentTarget.style.background = 'none')}
              >
                <Avatar member={m} size={54} />
                <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{m.name}</span>
              </button>
            ))}
          </div>
          <div style={{ textAlign: 'center' }}>
            <button onClick={() => setStep('create')} style={{
              background: 'none', border: `1.5px dashed ${C.border}`,
              color: C.textMid, fontSize: 13, cursor: 'pointer',
              padding: '8px 20px', borderRadius: 10,
            }}>
              + I'm new, create my profile
            </button>
          </div>
        </>
      )}

      {/* Create new profile */}
      {step === 'create' && (
        <>
          <div style={{ fontSize: 15, fontWeight: 600, color: C.text, marginBottom: 20, textAlign: 'center' }}>
            {members.length > 0 ? 'Create your profile' : 'Set up your profile'}
          </div>

          <Field label="Your Name">
            <input value={name} onChange={e => handleNameChange(e.target.value)}
              placeholder="e.g. Bhanu" autoFocus
              style={inputStyle(!!name)} />
          </Field>

          <Field label="Your Initials">
            <input value={initials} onChange={e => setInitials(e.target.value.toUpperCase().slice(0, 2))}
              placeholder="BH" maxLength={2}
              style={{ ...inputStyle(!!initials), textTransform: 'uppercase', letterSpacing: 2 }} />
          </Field>

          <button onClick={handleCreate} disabled={!name.trim() || saving} style={{
            width: '100%', padding: '14px', borderRadius: 12, marginTop: 8,
            background: name.trim() ? C.sage : C.border,
            border: 'none', color: 'white', fontSize: 16, fontWeight: 700,
            cursor: name.trim() ? 'pointer' : 'default',
            fontFamily: 'Georgia, serif',
          }}>
            {saving ? 'Saving…' : "Let's go →"}
          </button>

          {members.length > 0 && (
            <button onClick={() => setStep('pick')} style={{
              width: '100%', marginTop: 10, background: 'none', border: 'none',
              color: C.textMid, fontSize: 13, cursor: 'pointer', padding: '6px',
            }}>
              ← Back
            </button>
          )}
        </>
      )}
    </Screen>
  )
}

function Screen({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: C.cream, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: C.card, borderRadius: 24, padding: '36px 28px', maxWidth: 360, width: '100%', boxShadow: `0 4px 24px rgba(0,0,0,0.08), 0 0 0 1px ${C.border}` }}>
        {children}
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: C.textLight, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>
        {label}
      </div>
      {children}
    </div>
  )
}

function inputStyle(filled: boolean): React.CSSProperties {
  return {
    display: 'block', width: '100%', padding: '11px 14px',
    borderRadius: 10, border: `1.5px solid ${filled ? C.sage : C.border}`,
    outline: 'none', fontSize: 15, background: C.cream,
    color: C.text, boxSizing: 'border-box',
  }
}
