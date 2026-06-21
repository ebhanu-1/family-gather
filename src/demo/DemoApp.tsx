import { useState } from 'react'
import { C, AVATAR_COLORS, generateId } from '../tokens'
import { BottomNav } from '../components/BottomNav'
import { Avatar } from '../components/Avatar'
import { HomeScreen } from '../screens/Home'
import { CalendarScreen } from '../screens/Calendar'
import { EventDetailScreen } from '../screens/EventDetail'
import { CreateEventScreen } from '../screens/CreateEvent'
import { GroupChatScreen } from '../screens/GroupChat'
import { DEMO_MEMBERS, DEMO_TODOS, DEMO_ITINERARY, DEMO_GROUP_MESSAGES, DEMO_EVENTS } from './demoData'
import type { Screen, EventTab, FamilyEvent, Member, ItineraryItem, ChatMessage } from '../types'
import { Timestamp } from 'firebase/firestore'

// ── Demo Onboarding: pick existing or create new ──────────────────────────────

function DemoOnboarding({ onPick, existingMembers }: { onPick: (member: Member) => void; existingMembers: Member[] }) {
  const [step, setStep] = useState<'pick' | 'create'>(existingMembers.length === 0 ? 'create' : 'pick')
  const [name, setName] = useState('')
  const [initials, setInitials] = useState('')

  function handleNameChange(val: string) {
    setName(val)
    const parts = val.trim().split(/\s+/)
    if (parts.length >= 2) setInitials((parts[0][0] + parts[parts.length - 1][0]).toUpperCase())
    else if (parts[0]) setInitials(parts[0].slice(0, 2).toUpperCase())
    else setInitials('')
  }

  function handleCreate() {
    if (!name.trim()) return
    onPick({
      id: generateId(),
      name: name.trim(),
      initials: initials || name.slice(0, 2).toUpperCase(),
      color: AVATAR_COLORS[existingMembers.length % AVATAR_COLORS.length],
    })
  }

  return (
    <div style={{ minHeight: '100vh', background: C.cream, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: C.card, borderRadius: 24, padding: '36px 28px', maxWidth: 360, width: '100%', boxShadow: `0 4px 24px rgba(0,0,0,0.08), 0 0 0 1px ${C.border}` }}>

        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 36 }}>🏠</div>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: 26, fontWeight: 700, color: C.text, marginTop: 6 }}>FamilyGather</div>
          <div style={{ fontSize: 14, color: C.textMid, marginTop: 4 }}>Plan together.</div>
        </div>

        {step === 'pick' && (
          <>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 20, textAlign: 'center' }}>
              Who are you?
            </div>

            {/* Existing members */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              {existingMembers.map(m => (
                <button key={m.id} onClick={() => onPick(m)} style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  background: C.cream, border: `1.5px solid ${C.border}`,
                  borderRadius: 14, padding: '12px 16px', cursor: 'pointer',
                  textAlign: 'left', width: '100%',
                  transition: 'border-color 0.15s',
                }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = C.sage)}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = C.border)}
                >
                  <Avatar member={m} size={44} />
                  <span style={{ fontSize: 16, fontWeight: 600, color: C.text }}>{m.name}</span>
                </button>
              ))}
            </div>

            <button onClick={() => setStep('create')} style={{
              width: '100%', padding: '10px', borderRadius: 10,
              border: `1.5px dashed ${C.border}`, background: 'transparent',
              color: C.textMid, fontSize: 13, cursor: 'pointer',
            }}>
              + I'm new — create my profile
            </button>
          </>
        )}

        {step === 'create' && (
          <>
            <div style={{ fontSize: 15, fontWeight: 600, color: C.text, marginBottom: 20, textAlign: 'center' }}>
              Create your profile
            </div>

            <Field label="Your Name">
              <input value={name} onChange={e => handleNameChange(e.target.value)}
                placeholder="Your name" autoFocus style={inputStyle(!!name)} />
            </Field>
            <Field label="Your Initials">
              <input value={initials} onChange={e => setInitials(e.target.value.toUpperCase().slice(0, 2))}
                placeholder="AN" maxLength={2}
                style={{ ...inputStyle(!!initials), textTransform: 'uppercase', letterSpacing: 3 }} />
            </Field>

            <button onClick={handleCreate} disabled={!name.trim()} style={{
              width: '100%', padding: '14px', borderRadius: 12, marginTop: 8,
              background: name.trim() ? C.sage : C.border,
              border: 'none', color: 'white', fontSize: 16, fontWeight: 700,
              cursor: name.trim() ? 'pointer' : 'default', fontFamily: 'Georgia, serif',
            }}>
              Let's go →
            </button>

            {existingMembers.length > 0 && (
              <button onClick={() => setStep('pick')} style={{
                width: '100%', marginTop: 10, background: 'none', border: 'none',
                color: C.textMid, fontSize: 13, cursor: 'pointer', padding: '6px',
              }}>
                ← Back
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ── Demo App ──────────────────────────────────────────────────────────────────

export function DemoApp() {
  const [me, setMe] = useState<Member | null>(null)
  const [knownMembers, setKnownMembers] = useState<Member[]>(DEMO_MEMBERS)

  function handlePick(member: Member) {
    setKnownMembers(prev => prev.find(m => m.id === member.id) ? prev : [...prev, member])
    setMe(member)
  }

  if (!me) return <DemoOnboarding onPick={handlePick} existingMembers={knownMembers} />
  return <DemoMain me={me} allKnownMembers={knownMembers} onSwitchUser={() => setMe(null)} />
}

function DemoMain({ me, allKnownMembers, onSwitchUser }: { me: Member; allKnownMembers: Member[]; onSwitchUser: () => void }) {
  const allMembers = allKnownMembers

  const [events, setEvents] = useState<FamilyEvent[]>(DEMO_EVENTS)
  const [todos, setTodos] = useState(DEMO_TODOS)
  const [itinerary, setItinerary] = useState<Record<string, ItineraryItem[]>>(DEMO_ITINERARY)
  const [groupMessages, setGroupMessages] = useState<ChatMessage[]>(DEMO_GROUP_MESSAGES)

  const [screen, setScreen] = useState<Screen>('home')
  const [navTab, setNavTab] = useState<'home' | 'calendar' | 'chat'>('home')
  const [stack, setStack] = useState<{ screen: Screen; navTab: typeof navTab }[]>([])
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [eventTab, setEventTab] = useState<EventTab>('plan')

  function goTo(to: Screen, eventId?: string, tab?: EventTab) {
    setStack(s => [...s, { screen, navTab }])
    setScreen(to)
    if (eventId !== undefined) setSelectedEventId(eventId)
    if (tab) setEventTab(tab)
    else if (to !== 'event') setEventTab('plan')
  }
  function goBack() {
    const s = [...stack]
    const prev = s.pop() ?? { screen: 'home' as Screen, navTab: 'home' as const }
    setStack(s); setScreen(prev.screen); setNavTab(prev.navTab)
  }
  function switchTab(tab: 'home' | 'calendar' | 'chat') {
    setNavTab(tab); setStack([]); setScreen(tab)
  }

  const selectedEvent = events.find(e => e.id === selectedEventId) ?? null

  // Build allItinerary for CalendarScreen
  const allItinerary: Record<string, ItineraryItem[]> = {}
  events.forEach(ev => {
    allItinerary[ev.id] = itinerary[ev.id] ?? []
  })

  const eventCallbacks = selectedEventId ? {
    onAddTodo: (text: string) => setTodos(prev => ({
      ...prev,
      [selectedEventId]: [...(prev[selectedEventId] ?? []), { id: generateId(), text, done: false, createdBy: me.id }],
    })),
    onToggleTodo: (todoId: string, done: boolean) => setTodos(prev => ({
      ...prev,
      [selectedEventId]: (prev[selectedEventId] ?? []).map(t => t.id === todoId ? { ...t, done } : t),
    })),
    onAddItinerary: (item: Omit<ItineraryItem, 'id'>) => setItinerary(prev => ({
      ...prev,
      [selectedEventId]: [...(prev[selectedEventId] ?? []), { ...item, id: generateId() }],
    })),
    onUpdateItinerary: (itemId: string, data: Partial<Omit<ItineraryItem, 'id'>>) => setItinerary(prev => ({
      ...prev,
      [selectedEventId]: (prev[selectedEventId] ?? []).map(i => i.id === itemId ? { ...i, ...data } : i),
    })),
    onDeleteItinerary: (itemId: string) => setItinerary(prev => ({
      ...prev,
      [selectedEventId]: (prev[selectedEventId] ?? []).filter(i => i.id !== itemId),
    })),
  } : {
    onAddTodo: () => {},
    onToggleTodo: () => {},
    onAddItinerary: () => {},
    onUpdateItinerary: () => {},
    onDeleteItinerary: () => {},
  }

  function handleEditEvent(data: Partial<FamilyEvent>) {
    if (!selectedEventId) return
    setEvents(prev => prev.map(e => e.id === selectedEventId ? { ...e, ...data } : e))
  }

  function handleDeleteEvent() {
    if (!selectedEventId) return
    setEvents(prev => prev.filter(e => e.id !== selectedEventId))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(var(--vh, 1svh) * 100)', background: C.cream, overflow: 'hidden' }}>
      <div style={{ background: C.sage, color: 'white', fontSize: 12, textAlign: 'center', padding: '5px 16px', flexShrink: 0 }}>
        Viewing as <strong>{me.name}</strong> · Demo mode
      </div>
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', minHeight: 0, position: 'relative' }}>
        {screen === 'home' && (
          <HomeScreen
            events={events} members={allMembers}
            navigate={(s, id) => goTo(s, id)}
            onAdd={() => goTo('create')}
            memberId={me.id}
            onSwitchUser={onSwitchUser}
          />
        )}
        {screen === 'calendar' && (
          <CalendarScreen
            events={events}
            allItinerary={allItinerary}
            navigate={(s, id) => goTo(s, id)}
          />
        )}
        {screen === 'chat' && (
          <GroupChatScreen
            messages={groupMessages} members={allMembers} memberId={me.id}
            onSend={text => setGroupMessages(prev => [...prev, {
              id: generateId(), authorId: me.id, text,
              timestamp: { toDate: () => new Date() } as unknown as Timestamp,
            }])}
          />
        )}
        {screen === 'event' && (
          selectedEvent
            ? (
              <EventDetailScreen
                event={selectedEvent} members={allMembers} memberId={me.id}
                activeTab={eventTab} setActiveTab={setEventTab} onBack={goBack}
                todos={todos[selectedEvent.id] ?? []}
                itinerary={itinerary[selectedEvent.id] ?? []}
                callbacks={eventCallbacks}
                onEditEvent={handleEditEvent}
                onDeleteEvent={handleDeleteEvent}
              />
            )
            : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: C.textLight, fontSize: 14 }}>
                Loading…
              </div>
            )
        )}
        {screen === 'create' && (
          <CreateEventScreen
            memberId={me.id} members={allMembers} familyId="demo"
            onCancel={goBack} onCreated={() => {}}
            _demoOnCreate={data => {
              const id = generateId()
              setEvents(prev => [...prev, { ...data, id }])
              setStack([]); setScreen('event'); setNavTab('home')
              setSelectedEventId(id); setEventTab('plan')
            }}
          />
        )}
      </div>
      {screen !== 'create' && <BottomNav active={navTab} onNavigate={switchTab} />}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: C.textLight, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>{label}</div>
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
