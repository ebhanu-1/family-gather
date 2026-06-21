import { useState } from 'react'
import type { Identity } from '../types'

const KEY = 'familygather_identity'

export function useIdentity() {
  const [identity, setIdentity] = useState<Identity | null>(() => {
    try {
      const raw = localStorage.getItem(KEY)
      return raw ? JSON.parse(raw) : null
    } catch { return null }
  })

  function saveIdentity(id: Identity) {
    localStorage.setItem(KEY, JSON.stringify(id))
    setIdentity(id)
  }

  function clearIdentity() {
    localStorage.removeItem(KEY)
    setIdentity(null)
  }

  return { identity, saveIdentity, clearIdentity }
}
