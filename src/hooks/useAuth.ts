import { useEffect, useState } from 'react'
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth'
import { auth } from '../firebase'

// Every visitor gets an anonymous Firebase user. Security rules use it to
// check family membership, so no sign-up is needed.
export function useAnonymousAuth() {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')

  useEffect(() => {
    return onAuthStateChanged(auth, async user => {
      if (user) { setStatus('ready'); return }
      try {
        await signInAnonymously(auth)
        setStatus('ready')
      } catch (e) {
        console.error('Anonymous sign-in failed', e)
        setStatus('error')
      }
    })
  }, [])

  return status
}
