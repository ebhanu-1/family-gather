import { useState } from 'react'
import { C } from './tokens'
import { useIdentity } from './hooks/useIdentity'
import {
  useMembers, useEvents, useTodos, useItinerary, useGroupMessages, useAllItinerary,
  addTodo, toggleTodo, addItineraryItem, updateItineraryItem, deleteItineraryItem,
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
  return new URLSearchParams(window.location.search).get('family') || 'default'
}

export default function App() {
  if (!isFirebaseConfigured) return <DemoApp />
  return <MainApp />
}

function MainApp() {
  const familyId = getFamilyId()
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
  const hideNav = screen === 'create'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(var(--vh, 1svh) * 100)', background: C.cream, overflow: 'hidden' }}>
      <div style={{ flex: 1, overflowY: screen === 'chat' ? 'hidden' : 'auto', overflowX: 'hidden', minHeight: 0, position: 'relative' }}>
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
      {!hideNav && <BottomNav active={navTab} onNavigate={switchTab} />}
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
        onAddItinerary: (item) => addItineraryItem(event.id, { ...item, createdBy: memberId }),
        onUpdateItinerary: (itemId, data) => updateItineraryItem(event.id, itemId, data),
        onDeleteItinerary: (itemId) => deleteItineraryItem(event.id, itemId),
      }}
      onEditEvent={(data) => updateEvent(event.id, data)}
      onDeleteEvent={() => deleteEvent(event.id)}
    />
  )
}
