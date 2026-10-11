import { useState } from 'react'
import type { Identity } from '../types'

export function useIdentity(familyId: string) {
  const KEY = `familygather_identity_${familyId}`

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
