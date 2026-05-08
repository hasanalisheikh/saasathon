'use client'

const CHANNEL = 'monad_auth'
const LS_KEY = 'monad_email_verified'

export function broadcastEmailVerified() {
  if (typeof window === 'undefined') return

  try {
    const channel = new BroadcastChannel(CHANNEL)
    channel.postMessage({ type: 'email_verified' })
    channel.close()
  } catch {
    // BroadcastChannel not supported
  }

  try {
    localStorage.setItem(LS_KEY, String(Date.now()))
  } catch {
    // localStorage not available
  }
}

export function subscribeToEmailVerified(cb: () => void): () => void {
  if (typeof window === 'undefined') return () => {}

  let channel: BroadcastChannel | null = null
  const subscribedAt = Date.now()

  const handleStorage = (e: StorageEvent) => {
    if (e.key === LS_KEY && e.newValue && Number(e.newValue) > subscribedAt) {
      cb()
    }
  }

  try {
    channel = new BroadcastChannel(CHANNEL)
    channel.addEventListener('message', (e) => {
      if (e.data?.type === 'email_verified') cb()
    })
  } catch {
    // BroadcastChannel not supported — fall back to localStorage polling
  }

  window.addEventListener('storage', handleStorage)

  return () => {
    channel?.close()
    window.removeEventListener('storage', handleStorage)
  }
}
