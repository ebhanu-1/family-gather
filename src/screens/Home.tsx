import { useState } from 'react'
import { C, greeting } from '../tokens'
import { EventCard } from '../components/EventCard'
import { Avatar } from '../components/Avatar'
import type { FamilyEvent, Member } from '../types'

interface Props {
  events: FamilyEvent[]
  members: Member[]
  navigate: (screen: 'event', eventId: string) => void
  onAdd: () => void
  memberId: string
  onSwitchUser: () => void
}

export function HomeScreen({ events, members, navigate, onAdd, memberId, onSwitchUser }: Props) {
  const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date))
  const me = members.find(m => m.id === memberId) ?? null
  const [showSwitchBanner, setShowSwitchBanner] = useState(false)

  return (
    <div style={{ padding: '20px 16px 8px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: showSwitchBanner ? 0 : 24 }}>
        <div>
          <div style={{ fontSize: 13, color: C.textLight }}>{greeting()}</div>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: 22, fontWeight: 700, color: C.text, marginTop: 2 }}>
            Our Events 🏠
          </div>
        </div>
        {me ? (
          <button
            onClick={() => setShowSwitchBanner(b => !b)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginTop: 2, WebkitTapHighlightColor: 'transparent' }}
          >
            <Avatar member={me} size={32} />
          </button>
        ) : (
          <div style={{ width: 32, height: 32 }} />
        )}
      </div>

      {/* Switch user banner */}
      {showSwitchBanner && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: C.brownLight, borderRadius: 10, padding: '10px 14px',
          marginBottom: 20, marginTop: 10,
          border: `1px solid ${C.border}`,
        }}>
          <span style={{ fontSize: 13, color: C.textMid }}>Switch user?</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setShowSwitchBanner(false)} style={{
              background: 'none', border: `1px solid ${C.border}`, borderRadius: 7,
              padding: '5px 12px', fontSize: 12, color: C.textMid, cursor: 'pointer',
            }}>
              Cancel
            </button>
            <button onClick={onSwitchUser} style={{
              background: C.sage, border: 'none', borderRadius: 7,
              padding: '5px 12px', fontSize: 12, color: 'white', fontWeight: 600, cursor: 'pointer',
            }}>
              Switch
            </button>
          </div>
        </div>
      )}

      {/* Events */}
      <div style={{ marginBottom: 16 }}>
        <SectionLabel>Coming Up</SectionLabel>
        {sorted.length === 0 ? (
          <div style={{ textAlign: 'center', color: C.textLight, fontSize: 13, padding: '32px 0', lineHeight: 1.6 }}>
            No events yet — tap + to create your first one!
          </div>
        ) : (
          sorted.map(ev => (
            <EventCard key={ev.id} event={ev} members={members} onPress={() => navigate('event', ev.id)} />
          ))
        )}
      </div>

      {/* New Event dashed card */}
      <button onClick={onAdd} style={{
        width: '100%', padding: '14px', borderRadius: 12,
        border: `1.5px dashed ${C.border}`, background: 'transparent',
        color: C.textLight, fontSize: 14, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        marginBottom: 24, WebkitTapHighlightColor: 'transparent',
      }}>
        <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> New Event
      </button>

      {/* People */}
      {members.length > 0 && (
        <div>
          <SectionLabel>Everyone</SectionLabel>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            {members.map(m => (
              <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                <Avatar member={m} size={42} />
                <span style={{ fontSize: 11, color: C.textMid }}>{m.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, color: C.textLight, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 12 }}>
      {children}
    </div>
  )
}
