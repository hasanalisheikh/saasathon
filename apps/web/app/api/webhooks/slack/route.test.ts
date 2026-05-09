/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { afterEach, describe, expect, it, mock } from 'bun:test'
import { buildSlackFallbackReply } from './reply'

let insertedRequestPayload = null
let insertedRequestRecord = { id: 'request_123' }
let requestUpdatePayload = null
let slackMessageCalls = []
let fetchCalls = []
let classifierResult = { is_request: true, title: 'Add Booking Flow' }
let classifierError = null
let generatedReply = 'Thanks for sending this through.'

const originalFetch = globalThis.fetch

const fakeSupabase = {
  from(table) {
    if (table === 'profiles') {
      return {
        select() {
          return {
            eq() {
              return {
                single: async () => ({
                  data: {
                    id: 'user_123',
                    full_name: 'Jamie',
                    slack_access_token: 'xoxb-test',
                  },
                }),
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
                    single: async () => ({ data: { id: 'project_123' } }),
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
                single: async () => ({ data: insertedRequestRecord, error: null }),
              }
            },
          }
        },
        update(payload) {
          requestUpdatePayload = payload
          return {
            eq() {
              return Promise.resolve({ error: null })
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

mock.module('@/lib/ai', () => ({
  classifySlackRequest: async () => {
    if (classifierError) throw classifierError
    return classifierResult
  },
  generateSlackIntakeReply: async () => generatedReply,
}))

mock.module('@/lib/env', () => ({
  getAppUrl: () => 'https://monad.app',
  isMockAIEnabled: () => false,
}))

mock.module('@/lib/slack', () => ({
  getSlackUserDisplayName: async () => 'Marcus',
  verifySlackSignature: async () => true,
  isSlackConfigured: () => true,
  postSlackMessage: async (...args) => {
    slackMessageCalls.push(args)
    return { ts: '1778331111.000002' }
  },
}))

const { processSlackEvent } = await import('./process')

afterEach(() => {
  insertedRequestPayload = null
  insertedRequestRecord = { id: 'request_123' }
  requestUpdatePayload = null
  slackMessageCalls = []
  fetchCalls = []
  classifierResult = { is_request: true, title: 'Add Booking Flow' }
  classifierError = null
  generatedReply = 'Thanks for sending this through.'
  globalThis.fetch = originalFetch
})

describe('/api/webhooks/slack fallback replies', () => {
  it('mentions possible out of scope work in a friendly way', () => {
    expect(
      buildSlackFallbackReply({
        classification: 'out_of_scope',
        developerName: 'Jamie',
      })
    ).toContain('may be out of scope')
  })

  it('mentions likely in-scope work when the analysis leans in scope', () => {
    expect(
      buildSlackFallbackReply({
        classification: 'in_scope',
        developerName: 'Jamie',
      })
    ).toContain('may be in scope')
  })

  it('falls back to clarification language for uncertain requests', () => {
    expect(
      buildSlackFallbackReply({
        classification: 'ambiguous',
        developerName: 'Jamie',
      })
    ).toContain('may need a little clarification')
  })
})

describe('/api/webhooks/slack processSlackEvent', () => {
  it('ignores Slack chatter that is not a feature or modification request', async () => {
    classifierResult = { is_request: false, title: null }

    await processSlackEvent({
      channel: 'C123',
      teamId: 'T123',
      text: 'Thanks, looks good to me.',
      threadTs: '1778327089.609469',
      user: 'U123',
    })

    expect(insertedRequestPayload).toBeNull()
    expect(slackMessageCalls).toHaveLength(0)
    expect(requestUpdatePayload).toBeNull()
  })

  it('creates a request with the generated title before analysis runs', async () => {
    globalThis.fetch = async (...args) => {
      fetchCalls.push(args)
      return new Response(JSON.stringify({
        analysis: {
          classification: 'out_of_scope',
          confidence: 24,
        },
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    await processSlackEvent({
      channel: 'C123',
      teamId: 'T123',
      text: 'Can you add a booking flow for reservations?',
      threadTs: '1778327089.609469',
      user: 'U123',
    })

    expect(insertedRequestPayload).toEqual({
      project_id: 'project_123',
      raw_email_from: 'Marcus',
      raw_email_subject: 'Add Booking Flow',
      raw_email_body: 'Can you add a booking flow for reservations?',
      source: 'slack',
      slack_thread_ts: '1778327089.609469',
      slack_channel_id: 'C123',
      status: 'pending_review',
      analysis_status: 'queued',
    })
    expect(fetchCalls).toHaveLength(1)
    expect(fetchCalls[0][0]).toBe('https://monad.app/api/ai/analyse')
    expect(slackMessageCalls).toEqual([[
      'xoxb-test',
      'C123',
      'Thanks for sending this through.',
      '1778327089.609469',
    ]])
  })

  it('falls back to a derived title if classification succeeds without one', async () => {
    classifierResult = { is_request: true, title: null }
    globalThis.fetch = async () => new Response(JSON.stringify({
      analysis: {
        classification: 'in_scope',
        confidence: 78,
      },
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })

    await processSlackEvent({
      channel: 'C123',
      teamId: 'T123',
      text: 'Can you update the pricing page CTA copy?',
      threadTs: '1778327089.609469',
      user: 'U123',
    })

    expect(insertedRequestPayload?.raw_email_subject).toBe('Update The Pricing Page CTA Copy')
  })
})
