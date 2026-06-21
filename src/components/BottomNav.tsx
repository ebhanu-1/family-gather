import { C } from '../tokens'
import { IconHome, IconCal, IconChat } from './Icons'

type NavTab = 'home' | 'calendar' | 'chat'

interface Props {
  active: NavTab
  onNavigate: (tab: NavTab) => void
  chatUnread?: number
}

export function BottomNav({ active, onNavigate, chatUnread = 0 }: Props) {
  const tabs = [
    { id: 'home' as NavTab,     label: 'Home',  Icon: IconHome },
    { id: 'calendar' as NavTab, label: 'Plans', Icon: IconCal  },
    { id: 'chat' as NavTab,     label: 'Chat',  Icon: IconChat },
  ]

  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      padding: '6px 0 max(8px, env(safe-area-inset-bottom))',
      background: 'rgba(252,250,246,0.97)',
      backdropFilter: 'blur(16px)',
      borderTop: `1px solid ${C.border}`,
      flexShrink: 0,
    }}>
      {tabs.map(tab => {
        const on = active === tab.id
        return (
          <button key={tab.id} onClick={() => onNavigate(tab.id)} style={{
            flex: 1, background: 'none', border: 'none',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: 2, cursor: 'pointer', padding: '4px 0',
            WebkitTapHighlightColor: 'transparent',
          }}>
            <div style={{ position: 'relative', display: 'inline-flex' }}>
              <tab.Icon color={on ? C.sage : C.textLight} />
              {tab.id === 'chat' && chatUnread > 0 && (
                <div style={{
                  position: 'absolute', top: -1, right: -3,
                  width: 8, height: 8, borderRadius: '50%',
                  background: '#E53E3E', border: '1.5px solid white',
                }} />
              )}
            </div>
            <span style={{ fontSize: 10, color: on ? C.sage : C.textLight, fontWeight: on ? 600 : 400 }}>
              {tab.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
