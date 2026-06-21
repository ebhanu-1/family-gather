import { C, getEventType } from '../tokens'
import { useLastMessages } from '../hooks/useFirestore'
import type { FamilyEvent, Member, EventTab, ChatMessage } from '../types'

interface Props {
  events: FamilyEvent[]
  members: Member[]
  navigate: (screen: 'event', eventId: string, tab?: EventTab) => void
  _overrideLastMsgs?: Record<string, ChatMessage>
}

export function ChatListScreen({ events, members, navigate, _overrideLastMsgs }: Props) {
  const firestoreLastMsgs = useLastMessages(_overrideLastMsgs ? [] : events.map(e => e.id))
  const lastMsgs = _overrideLastMsgs ?? firestoreLastMsgs

  return (
    <div style={{ padding: '20px 16px 8px' }}>
      <div style={{ fontFamily: 'Georgia, serif', fontSize: 22, fontWeight: 700, color: C.text, marginBottom: 20 }}>
        Messages
      </div>
      {events.length === 0 && (
        <div style={{ textAlign: 'center', color: C.textLight, fontSize: 13, paddingTop: 40 }}>
          No events yet — create one to start chatting!
        </div>
      )}
      {events.map(ev => {
        const last = lastMsgs[ev.id]
        const type = getEventType(ev.type)
        const author = last ? members.find(m => m.id === last.authorId) : null
        const lastTime = last?.timestamp
          ? last.timestamp.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          : null

        return (
          <div key={ev.id} onClick={() => navigate('event', ev.id)} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 0', borderBottom: `1px solid ${C.border}`,
            cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
          }}>
            <div style={{
              width: 50, height: 50, borderRadius: 14, background: type.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 26, flexShrink: 0,
            }}>
              {ev.emoji}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: C.text, fontFamily: 'Georgia, serif' }}>{ev.name}</div>
              {last ? (
                <div style={{ fontSize: 12, color: C.textLight, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  <span style={{ fontWeight: 500, color: C.textMid }}>{author?.name}:</span> {last.text}
                </div>
              ) : (
                <div style={{ fontSize: 12, color: C.textLight, marginTop: 2 }}>No messages yet</div>
              )}
            </div>
            {lastTime && <div style={{ fontSize: 10, color: C.textLight, flexShrink: 0 }}>{lastTime}</div>}
          </div>
        )
      })}
    </div>
  )
}
