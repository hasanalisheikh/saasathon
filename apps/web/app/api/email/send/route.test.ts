/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { afterEach, describe, expect, it, mock } from 'bun:test'
import { NextRequest } from 'next/server'
import { restoreEnv, snapshotEnv } from '@/test-utils/env'

let currentUser = { id: 'user_123' }

mock.module('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: {
      getUser: async () => ({ data: { user: currentUser } }),
    },
  }),
}))

const { POST } = await import('./route')

const managedKeys = ['RESEND_API_KEY', 'RESEND_FROM_EMAIL']
const originalEnv = snapshotEnv(managedKeys)

afterEach(() => {
  currentUser = { id: 'user_123' }
  restoreEnv(originalEnv)
})

describe('/api/email/send', () => {
  it('fails clearly when Resend is not configured', async () => {
    process.env.RESEND_API_KEY = 're_placeholder'
    process.env.RESEND_FROM_EMAIL = 'noreply@monad.app'

    const response = await POST(new NextRequest('http://localhost/api/email/send', {
      method: 'POST',
      body: JSON.stringify({ request_id: 'req_123', final_reply: 'Hello' }),
      headers: { 'content-type': 'application/json' },
    }))

    expect(response.status).toBe(503)
    expect(await response.json()).toEqual({
      error: 'Client email is not configured. Add RESEND_API_KEY and RESEND_FROM_EMAIL to send approval emails.',
    })
  })
})
