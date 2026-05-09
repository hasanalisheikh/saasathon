/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { afterEach, describe, expect, it, mock } from 'bun:test'
import { NextRequest } from 'next/server'

let insertedRequestPayload = null
let createdRequest = { id: 'request_789' }
const originalFetch = globalThis.fetch
const fetchCalls = []
let profileRecord = { id: 'user_123' }
let projectRecord = { id: 'project_456' }

const fakeSupabase = {
  from(table) {
    if (table === 'profiles') {
      return {
        select() {
          return {
            eq() {
              return {
                single: async () => ({ data: profileRecord }),
              }
            },
          }
        },
      }
    }

    if (table === 'projects') {
      return {
        select() {
          return {
            eq() {
              return {
                eq() {
                  return {
                    single: async () => ({ data: projectRecord }),
                  }
                },
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
                single: async () => ({ data: createdRequest }),
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
  createServiceClient: () => fakeSupabase,
}))

mock.module('@/lib/env', () => ({
  getAppUrl: () => 'https://monad-weld.vercel.app',
}))

mock.module('@/lib/slack', () => ({
  isSlackConfigured: () => true,
  verifySlackSignature: async () => true,
}))

const { POST } = await import('./route')

afterEach(() => {
  insertedRequestPayload = null
  createdRequest = { id: 'request_789' }
  fetchCalls.length = 0
  globalThis.fetch = originalFetch
  profileRecord = { id: 'user_123' }
  projectRecord = { id: 'project_456' }
})

describe('/api/webhooks/slack', () => {
  it('accepts a valid user message, creates a request, and triggers AI analysis', async () => {
    globalThis.fetch = async (...args) => {
      fetchCalls.push(args)
      return new Response('{}', { status: 200 })
    }

    const response = await POST(new NextRequest('http://localhost/api/webhooks/slack', {
      method: 'POST',
      body: JSON.stringify({
        type: 'event_callback',
        team_id: 'T123',
        event: {
          type: 'message',
          channel: 'C123',
          user: 'U123',
          text: 'Can you add client approvals in Slack?',
          ts: '1778327089.609469',
        },
      }),
      headers: { 'content-type': 'application/json' },
    }))

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ ok: true })

    expect(insertedRequestPayload).toEqual({
      project_id: 'project_456',
      raw_email_from: 'U123',
      raw_email_subject: null,
      raw_email_body: 'Can you add client approvals in Slack?',
      source: 'slack',
      slack_thread_ts: '1778327089.609469',
      slack_channel_id: 'C123',
      status: 'pending_review',
      analysis_status: 'queued',
    })
    expect(fetchCalls).toHaveLength(1)
    expect(fetchCalls[0][0]).toBe('https://monad-weld.vercel.app/api/ai/analyse')
  })

  it('falls back to context_team_id when top-level team_id is missing', async () => {
    globalThis.fetch = async (...args) => {
      fetchCalls.push(args)
      return new Response('{}', { status: 200 })
    }

    const response = await POST(new NextRequest('http://localhost/api/webhooks/slack', {
      method: 'POST',
      body: JSON.stringify({
        type: 'event_callback',
        context_team_id: 'T456',
        authorizations: [{ team_id: 'T456' }],
        event: {
          type: 'message',
          channel: 'C456',
          user: 'U456',
          text: 'Please quote this separately.',
          ts: '1778329999.000001',
        },
      }),
      headers: { 'content-type': 'application/json' },
    }))

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ ok: true })
    expect(insertedRequestPayload).toEqual({
      project_id: 'project_456',
      raw_email_from: 'U456',
      raw_email_subject: null,
      raw_email_body: 'Please quote this separately.',
      source: 'slack',
      slack_thread_ts: '1778329999.000001',
      slack_channel_id: 'C456',
      status: 'pending_review',
      analysis_status: 'queued',
    })
    expect(fetchCalls).toHaveLength(1)
  })
})
