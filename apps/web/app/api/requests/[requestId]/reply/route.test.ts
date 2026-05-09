/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { afterEach, describe, expect, it, mock } from 'bun:test'
import { NextRequest } from 'next/server'

let currentUser = { id: 'user_123' }
let generationParams = null

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
              single: async () => ({
                data: {
                  id: 'req_123',
                  classification: 'out_of_scope',
                  raw_email_body: 'Can you add a booking flow?',
                  technical_breakdown: 'Adds a new booking workflow.',
                  final_reply: null,
                  draft_reply: 'Original draft',
                  cost_min: 900,
                  cost_max: 1400,
                  timeline_impact_days: 3,
                  risk_level: 'medium',
                  project: {
                    id: 'project_123',
                    name: 'Website refresh',
                    client_name: 'Marcus',
                    user_id: 'user_123',
                  },
                },
              }),
            }
          },
        }
      },
    }
  },
}

mock.module('@/lib/env', () => ({
  isAIConfigured: () => true,
}))

mock.module('@/lib/supabase/server', () => ({
  createClient: async () => fakeSupabase,
}))

mock.module('@/lib/ai', () => ({
  generateClientReply: async (params) => {
    generationParams = params
    return 'Generated client reply'
  },
}))

const { POST } = await import('./route')

afterEach(() => {
  currentUser = { id: 'user_123' }
  generationParams = null
})

describe('/api/requests/[requestId]/reply', () => {
  it('generates a reply with the selected tone and overridden cost range', async () => {
    const response = await POST(
      new NextRequest('http://localhost/api/requests/req_123/reply', {
        method: 'POST',
        body: JSON.stringify({
          tone: 'firm',
          intent: 'decline',
          current_reply: 'Current draft',
          cost_min: 1200,
          cost_max: 1800,
        }),
        headers: { 'content-type': 'application/json' },
      }),
      { params: Promise.resolve({ requestId: 'req_123' }) }
    )

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ reply: 'Generated client reply' })
    expect(generationParams).toMatchObject({
      tone: 'firm',
      intent: 'decline',
      clientName: 'Marcus',
      projectName: 'Website refresh',
      classification: 'out_of_scope',
      currentReply: 'Current draft',
      costRange: '$1,200 - $1,800',
      timelineDays: 3,
      riskLevel: 'medium',
    })
  })
})
