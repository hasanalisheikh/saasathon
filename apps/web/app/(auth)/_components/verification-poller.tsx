'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { subscribeToEmailVerified } from '@/lib/auth/cross-tab-sync'

export function VerificationPoller() {
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = subscribeToEmailVerified(() => {
      router.push('/dashboard')
    })
    return unsubscribe
  }, [router])

  return null
}
