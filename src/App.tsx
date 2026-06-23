import { useState } from 'react'
import { C } from './tokens'
import { useIdentity } from './hooks/useIdentity'
import {
  useMembers, useEvents, useTodos, useItinerary, useGroupMessages, useAllItinerary,
  addTodo, toggleTodo, updateTodo, deleteTodo, addItineraryItem, updateItineraryItem, deleteItineraryItem,
  updateEvent, deleteEvent, sendGroupMessage,
} from './hooks/useFirestore'
import { BottomNav } from './components/BottomNav'
import { Onboarding } from './screens/Onboarding'
import { HomeScreen } from './screens/Home'
import { CalendarScreen } from './screens/Calendar'
import { EventDetailScreen } from './screens/EventDetail'
import { CreateEventScreen } from './screens/CreateEvent'
import { GroupChatScreen } from './screens/GroupChat'
import { DemoApp } from './demo/DemoApp'
import type { Screen, EventTab, Identity, FamilyEvent, Member } from './types'

const isFirebaseConfigured = Boolean(import.meta.env.VITE_FIREBASE_PROJECT_ID)

function getFamilyId(): string {
  const fromUrl = new URLSearchParams(window.location.search).get('family')
  if (fromUrl) {
    localStorage.setItem('familygather_lastfamily', fromUrl)
    return fromUrl
  }
  const stored = localStorage.getItem('familygather_lastfamily')
  if (stored) return stored
  return ''
}

export default function App() {
  if (!isFirebaseConfigured) return <DemoApp />
  return <MainApp />
}

function MainApp() {
  const [familyId, setFamilyId] = useState(getFamilyId)

  if (!familyId) {
    return <FamilyCodeScreen onEnter={code => {
      const id = code.trim().toLowerCase()
      localStorage.setItem('familygather_lastfamily', id)
      setFamilyId(id)
    }} />
  }

  return <AuthenticatedFlow familyId={familyId} />
}

function FamilyCodeScreen({ onEnter }: { onEnter: (code: string) => void }) {
  const [code, setCode] = useState('')
  function handleSubmit() {
    if (!code.trim()) return
    onEnter(code.trim().toLowerCase())
  }
  return (
    <div style={{ minHeight: '100vh', background: C.cream, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: 'white', borderRadius: 24, padding: '36px 28px', maxWidth: 360, width: '100%', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 36 }}>🏠</div>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: 26, fontWeight: 700, color: C.text, marginTop: 6 }}>FamilyGather</div>
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.textLight, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Family code</div>
        <input
          value={code}
          onChange={e => setCode(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          placeholder="Enter your family code"
          autoFocus
          autoCapitalize="none"
          autoCorrect="off"
          style={{
            display: 'block', width: '100%', padding: '11px 14px', borderRadius: 10,
            border: `1.5px solid ${code ? C.sage : C.border}`, outline: 'none',
            fontSize: 15, background: C.cream, color: C.text, boxSizing: 'border-box', marginBottom: 16,
          }}
        />
        <button
          onPointerDown={e => { e.preventDefault(); handleSubmit() }}
          disabled={!code.trim()}
          style={{
            width: '100%', padding: 14, borderRadius: 12,
            background: code.trim() ? C.sage : C.border,
            border: 'none', color: 'white', fontSize: 16, fontWeight: 700,
            cursor: code.trim() ? 'pointer' : 'default', fontFamily: 'Georgia, serif',
          }}
        >
          Continue →
        </button>
      </div>
    </div>
  )
}

function AuthenticatedFlow({ familyId }: { familyId: string }) {
  const { identity, saveIdentity, clearIdentity } = useIdentity(familyId)
  if (!identity) return <Onboarding onComplete={saveIdentity} familyId={familyId} />
  return <AuthenticatedApp identity={identity} clearIdentity={clearIdentity} familyId={familyId} />
}

function AuthenticatedApp({ identity, clearIdentity, familyId }: { identity: Identity; clearIdentity: () => void; familyId: string }) {
  const members = useMembers(familyId)
  const events = useEvents(familyId)
  const groupMessages = useGroupMessages(familyId)
  const allItinerary = useAllItinerary(events.map(e => e.id))

  const [screen, setScreen] = useState<Screen>('home')
  const [navTab, setNavTab] = useState<'home' | 'calendar' | 'chat'>('home')
  const [stack, setStack] = useState<{ screen: Screen; navTab: typeof navTab }[]>([])
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [eventTab, setEventTab] = useState<EventTab>('plan')
  const [chatInputFocused, setChatInputFocused] = useState(false)

  const [lastSeenChatAt, setLastSeenChatAt] = useState<Date>(() => {
    const s = localStorage.getItem(`familygather_lastchat_${familyId}_${identity.memberId}`)
    return s ? new Date(s) : new Date(0)
  })
  const [chatNewMsgSince, setChatNewMsgSince] = useState<Date | null>(null)

  function markChatSeen() {
    const now = new Date()
    setLastSeenChatAt(now)
    localStorage.setItem(`familygather_lastchat_${familyId}_${identity.memberId}`, now.toISOString())
  }

  const chatUnread = groupMessages.filter(m => {
    if (m.authorId === identity.memberId) return false
    const ts = m.timestamp?.toDate?.()
    return ts && ts > lastSeenChatAt
  }).length

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
    if (tab === 'chat') {
      setChatNewMsgSince(lastSeenChatAt)
      markChatSeen()
    }
  }

  const selectedEvent = events.find(e => e.id === selectedEventId) ?? null
  const hideNav = screen === 'create' || screen === 'event' || chatInputFocused

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(var(--vh, 1svh) * 100)', background: C.cream, overflow: 'hidden' }}>
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', minHeight: 0, position: 'relative' }}>
        {screen === 'home' && (
          <HomeScreen
            events={events} members={members}
            navigate={(s, id) => goTo(s, id)}
            onAdd={() => goTo('create')}
            memberId={identity.memberId}
            onSwitchUser={clearIdentity}
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
            messages={groupMessages} members={members} memberId={identity.memberId}
            onSend={text => sendGroupMessage(identity.memberId, text, familyId)}
            onInputFocus={() => setChatInputFocused(true)}
            onInputBlur={() => setChatInputFocused(false)}
            lastSeenAt={chatNewMsgSince}
          />
        )}
        {screen === 'event' && (
          selectedEvent
            ? (
              <EventDetailLoader
                event={selectedEvent} members={members} memberId={identity.memberId}
                activeTab={eventTab} setActiveTab={setEventTab} onBack={goBack}
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
            memberId={identity.memberId} members={members} familyId={familyId}
            onCancel={goBack}
            onCreated={eventId => {
              setStack([]); setScreen('event'); setNavTab('home')
              setSelectedEventId(eventId); setEventTab('plan')
            }}
          />
        )}
      </div>
      {!hideNav && <BottomNav active={navTab} onNavigate={switchTab} chatUnread={chatUnread} />}
    </div>
  )
}

function EventDetailLoader({ event, members, memberId, activeTab, setActiveTab, onBack }: {
  event: FamilyEvent; members: Member[]; memberId: string
  activeTab: EventTab; setActiveTab: (t: EventTab) => void; onBack: () => void
}) {
  const todos = useTodos(event.id)
  const itinerary = useItinerary(event.id)

  return (
    <EventDetailScreen
      event={event} members={members} memberId={memberId}
      activeTab={activeTab} setActiveTab={setActiveTab} onBack={onBack}
      todos={todos} itinerary={itinerary}
      callbacks={{
        onAddTodo: (text) => addTodo(event.id, text, memberId),
        onToggleTodo: (todoId, done) => toggleTodo(event.id, todoId, done),
        onUpdateTodo: (todoId, text) => updateTodo(event.id, todoId, text),
        onDeleteTodo: (todoId) => deleteTodo(event.id, todoId),
        onAddItinerary: (item) => addItineraryItem(event.id, { ...item, createdBy: memberId }),
        onUpdateItinerary: (itemId, data) => updateItineraryItem(event.id, itemId, data),
        onDeleteItinerary: (itemId) => deleteItineraryItem(event.id, itemId),
      }}
      onEditEvent={(data) => updateEvent(event.id, data)}
      onDeleteEvent={() => deleteEvent(event.id)}
    />
  )
}
