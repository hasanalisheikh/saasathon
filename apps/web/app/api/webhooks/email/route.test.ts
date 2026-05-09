/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { afterEach, describe, expect, it, mock } from 'bun:test'
import { NextRequest } from 'next/server'
import { restoreEnv, snapshotEnv } from '@/test-utils/env'

let insertedRequestPayload = null
let createdProject = { id: 'project_123' }
let createdRequest = { id: 'request_456' }
const originalFetch = globalThis.fetch
const fetchCalls = []

const fakeSupabase = {
  from(table) {
    if (table === 'projects') {
      return {
        select() {
          return {
            eq() {
              return {
                single: async () => ({ data: createdProject }),
              }
            },
          }
        },
      }
    }

    if (table === 'requests') {
      return {
        insert(payload) {
          insertedRequestPayload = payload
          return {
            select() {
              return {
                single: async () => ({ data: createdRequest, error: null }),
              }
            },
          }
        },
      }
    }

    throw new Error(`Unexpected table: ${table}`)
  },
}

mock.module('@/lib/supabase/server', () => ({
  createServiceClient: async () => fakeSupabase,
}))

const { POST } = await import('./route')

const managedKeys = ['POSTMARK_INBOUND_WEBHOOK_TOKEN', 'NEXT_PUBLIC_APP_URL']
const originalEnv = snapshotEnv(managedKeys)

afterEach(() => {
  insertedRequestPayload = null
  createdProject = { id: 'project_123' }
  createdRequest = { id: 'request_456' }
  fetchCalls.length = 0
  globalThis.fetch = originalFetch
  restoreEnv(originalEnv)
})

describe('/api/webhooks/email', () => {
  it('rejects invalid inbound webhook tokens', async () => {
    process.env.POSTMARK_INBOUND_WEBHOOK_TOKEN = 'real-token'

    const response = await POST(new NextRequest('http://localhost/api/webhooks/email?token=wrong-token', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: { 'content-type': 'application/json' },
    }))

    expect(response.status).toBe(401)
    expect(await response.json()).toEqual({ error: 'Invalid inbound webhook token' })
  })

  it('accepts valid inbound webhook tokens and enqueues analysis', async () => {
    process.env.POSTMARK_INBOUND_WEBHOOK_TOKEN = 'real-token'
    process.env.NEXT_PUBLIC_APP_URL = 'https://monad.app'
    globalThis.fetch = async (...args) => {
      fetchCalls.push(args)
      return new Response('{}', { status: 200 })
    }

    const response = await POST(new NextRequest('http://localhost/api/webhooks/email?token=real-token', {
      method: 'POST',
      body: JSON.stringify({
        From: 'client@example.com',
        FromFull: { Email: 'client@example.com', Name: 'Client' },
        Subject: 'Need a change',
        TextBody: 'Can you add a booking flow?',
        HtmlBody: '',
        StrippedTextReply: '',
        ToFull: [{ Email: 'project@inbound.monad.app', Name: 'Monad' }],
        CcFull: [],
        ReplyTo: 'client@example.com',
        MessageID: 'msg_123',
        Date: '2026-05-09T00:00:00.000Z',
      }),
      headers: { 'content-type': 'application/json' },
    }))

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ ok: true })
    expect(insertedRequestPayload).toEqual({
      project_id: 'project_123',
      raw_email_from: 'client@example.com',
      raw_email_subject: 'Need a change',
      raw_email_body: 'Can you add a booking flow?',
      source: 'email',
      status: 'pending_review',
      analysis_status: 'queued',
    })
    expect(fetchCalls).toHaveLength(1)
    expect(fetchCalls[0][0]).toBe('https://monad.app/api/ai/analyse')
  })
})
