/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { afterEach, describe, expect, it, mock } from 'bun:test'
import { NextRequest } from 'next/server'

let currentUser = { id: 'user_123' }
let updatedPayload = null

const fakeSupabase = {
  auth: {
    getUser: async () => ({ data: { user: currentUser } }),
  },
  from(table) {
    if (table !== 'requests') {
      throw new Error(`Unexpected table: ${table}`)
    }

    return {
      select() {
        return {
          eq() {
            return {
              single: async () => ({ data: { project: { user_id: 'user_123' } } }),
            }
          },
        }
      },
      update(payload) {
        updatedPayload = payload
        return {
          eq() {
            return {
              select() {
                return {
                  single: async () => ({ data: { id: 'req_123', ...payload }, error: null }),
                }
              },
            }
          },
        }
      },
    }
  },
}

mock.module('@/lib/supabase/server', () => ({
  createClient: async () => fakeSupabase,
}))

const { PATCH } = await import('./route')

afterEach(() => {
  currentUser = { id: 'user_123' }
  updatedPayload = null
})

describe('/api/requests/[requestId]', () => {
  it('persists the final reply, selected tone, and overridden estimate before sharing', async () => {
    const response = await PATCH(
      new NextRequest('http://localhost/api/requests/req_123', {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'sent_to_client',
          final_reply: 'Please approve this estimate.',
          tone: 'firm',
          cost_min: 1200,
          cost_max: 1800,
        }),
        headers: { 'content-type': 'application/json' },
      }),
      { params: Promise.resolve({ requestId: 'req_123' }) }
    )

    expect(response.status).toBe(200)
    expect(updatedPayload).toEqual({
      status: 'sent_to_client',
      final_reply: 'Please approve this estimate.',
      reply_tone: 'firm',
      cost_min: 1200,
      cost_max: 1800,
    })
  })

  it('rejects an invalid cost range', async () => {
    const response = await PATCH(
      new NextRequest('http://localhost/api/requests/req_123', {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'sent_to_client',
          final_reply: 'Please approve this estimate.',
          tone: 'professional',
          cost_min: 1800,
          cost_max: 1200,
        }),
        headers: { 'content-type': 'application/json' },
      }),
      { params: Promise.resolve({ requestId: 'req_123' }) }
    )

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({
      error: 'Minimum cost cannot be higher than maximum cost.',
    })
    expect(updatedPayload).toBeNull()
  })
})
