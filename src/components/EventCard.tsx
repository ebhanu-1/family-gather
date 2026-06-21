import { C, getEventType, formatDate, countdownLabel, daysUntil } from '../tokens'
import { AvatarGroup } from './Avatar'
import type { FamilyEvent, Member } from '../types'

interface Props {
  event: FamilyEvent
  members: Member[]
  onPress: () => void
}

export function EventCard({ event, members, onPress }: Props) {
  const type = getEventType(event.type)
  const days = daysUntil(event.date)
  const urgent = days >= 0 && days <= 14

  return (
    <div onClick={onPress} style={{
      background: C.card, borderRadius: 16, padding: '14px 16px', marginBottom: 10,
      boxShadow: `0 1px 4px rgba(0,0,0,0.07), 0 0 0 1px ${C.border}`,
      cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: 12,
      WebkitTapHighlightColor: 'transparent', userSelect: 'none',
    }}>
      <div style={{
        width: 46, height: 46, borderRadius: 12, background: type.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 22, flexShrink: 0,
      }}>
        {event.emoji}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 6 }}>
          <div style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: 15, color: C.text, lineHeight: 1.2 }}>
            {event.name}
          </div>
          <div style={{
            fontSize: 11, fontWeight: 600,
            color: urgent ? '#B84030' : C.textMid,
            background: urgent ? 'oklch(97% 0.025 30)' : C.brownLight,
            padding: '2px 8px', borderRadius: 20, flexShrink: 0, marginTop: 1,
          }}>
            {countdownLabel(event.date)}
          </div>
        </div>
        <div style={{ fontSize: 12, color: C.textLight, marginTop: 3 }}>
          {formatDate(event.date, event.endDate)}{event.time ? ` · ${event.time}` : ''} · {event.location}
        </div>
        <div style={{ marginTop: 8 }}>
          <AvatarGroup memberIds={event.attendees} members={members} size={22} />
        </div>
      </div>
    </div>
  )
}
