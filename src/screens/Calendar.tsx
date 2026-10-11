import { useState } from 'react'
import { C, getEventType, parseD } from '../tokens'
import type { FamilyEvent, ItineraryItem } from '../types'

interface Props {
  events: FamilyEvent[]
  allItinerary: Record<string, ItineraryItem[]>
  navigate: (screen: 'event', eventId: string) => void
}

export function CalendarScreen({ events, allItinerary, navigate }: Props) {
  const [filterEventId, setFilterEventId] = useState<string | 'all'>('all')

  // Flatten all itinerary items, annotated with their eventId
  type AnnotatedItem = ItineraryItem & { eventId: string }
  const allItems: AnnotatedItem[] = []
  for (const [eventId, items] of Object.entries(allItinerary)) {
    for (const item of items) {
      allItems.push({ ...item, eventId })
    }
  }

  // Apply filter
  const filtered = filterEventId === 'all'
    ? allItems
    : allItems.filter(i => i.eventId === filterEventId)

  // Sort chronologically by date then time
  const sorted = [...filtered].sort((a, b) => {
    const dc = a.date.localeCompare(b.date)
    if (dc !== 0) return dc
    return a.time.localeCompare(b.time)
  })

  // Group by date
  type Group = { date: string; items: AnnotatedItem[] }
  const groups: Group[] = []
  sorted.forEach(item => {
    const last = groups[groups.length - 1]
    if (last && last.date === item.date) last.items.push(item)
    else groups.push({ date: item.date, items: [item] })
  })

  return (
    <div style={{ padding: '20px 16px 24px' }}>
      {/* Header */}
      <div style={{ fontFamily: 'Georgia, serif', fontSize: 22, fontWeight: 700, color: C.text, marginBottom: 16 }}>
        Plans
      </div>

      {/* Event filter chips */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 20, paddingBottom: 4 }}>
        <FilterChip
          label="All"
          active={filterEventId === 'all'}
          onClick={() => setFilterEventId('all')}
        />
        {events.map(ev => (
          <FilterChip
            key={ev.id}
            label={`${ev.emoji} ${ev.name}`}
            active={filterEventId === ev.id}
            onClick={() => setFilterEventId(ev.id)}
          />
        ))}
      </div>

      {/* Content */}
      {groups.length === 0 ? (
        <div style={{ textAlign: 'center', color: C.textLight, fontSize: 13, padding: '48px 0', lineHeight: 1.7 }}>
          No plans yet — add them inside an event
        </div>
      ) : (
        groups.map(({ date, items }) => {
          const dayLabel = parseD(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
          return (
            <div key={date} style={{ marginBottom: 20 }}>
              {/* Date group header */}
              <div style={{
                fontSize: 11, fontWeight: 700, color: C.textLight,
                textTransform: 'uppercase', letterSpacing: '0.6px',
                marginBottom: 8,
              }}>
                {dayLabel}
              </div>

              {/* Items */}
              {items.map(item => {
                const ev = events.find(e => e.id === item.eventId)
                const type = ev ? getEventType(ev.type) : getEventType('other')
                const timeLabel = item.endTime
                  ? `${item.time} – ${item.endTime}`
                  : item.time

                return (
                  <div
                    key={item.id}
                    onClick={() => navigate('event', item.eventId)}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: 12,
                      padding: '10px 12px', marginBottom: 6,
                      background: C.card, borderRadius: 12,
                      border: `1px solid ${C.border}`,
                      cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
                    }}
                  >
                    {/* Time */}
                    <div style={{
                      fontSize: 11, fontWeight: 700, color: C.sage,
                      minWidth: 72, flexShrink: 0, paddingTop: 2,
                      whiteSpace: 'nowrap',
                    }}>
                      {timeLabel}
                    </div>

                    {/* Title + event chip */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 500, color: C.text, marginBottom: 4 }}>
                        {item.title}
                      </div>
                      {ev && (
                        <div style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          background: type.bg, borderRadius: 20,
                          padding: '2px 8px',
                          fontSize: 11, color: type.color, fontWeight: 600,
                        }}>
                          {ev.emoji} {ev.name}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )
        })
      )}
    </div>
  )
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        flexShrink: 0,
        padding: '6px 14px', borderRadius: 20,
        border: `1.5px solid ${active ? C.sage : C.border}`,
        background: active ? C.sageLight : C.card,
        color: active ? C.sage : C.textMid,
        fontSize: 13, fontWeight: active ? 600 : 400,
        cursor: 'pointer', whiteSpace: 'nowrap',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {label}
    </button>
  )
}
