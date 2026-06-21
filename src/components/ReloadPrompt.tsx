import { useRegisterSW } from 'virtual:pwa-register/react'
import { C } from '../tokens'

export function ReloadPrompt() {
  const { needRefresh: [needRefresh], updateServiceWorker } = useRegisterSW()

  if (!needRefresh) return null

  return (
    <div style={{
      position: 'fixed', bottom: 72, left: 12, right: 12, zIndex: 200,
      background: C.sage, borderRadius: 14, padding: '12px 16px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
      boxShadow: '0 4px 20px rgba(0,0,0,0.18)',
    }}>
      <span style={{ fontSize: 13, color: 'white', fontWeight: 500 }}>
        New version available
      </span>
      <button
        onClick={() => updateServiceWorker(true)}
        style={{
          padding: '7px 16px', borderRadius: 10, border: 'none',
          background: 'white', color: C.sage, fontWeight: 700,
          fontSize: 13, cursor: 'pointer', flexShrink: 0,
        }}
      >
        Update now
      </button>
    </div>
  )
}
