/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { afterEach, describe, expect, it, mock } from 'bun:test'
import { NextRequest } from 'next/server'

let currentUser = { id: 'user_123' }
let requestRecord = {
  id: 'request_123',
  approval_token: 'approval_token_123',
  classification: 'out_of_scope',
  cost_min: 960,
  cost_max: 1440,
  effort_min_hours: 12,
  effort_max_hours: 18,
  final_reply: null,
  reply_tone: 'professional',
  slack_channel_id: 'C_THREAD',
  slack_thread_ts: '1778327089.609469',
  technical_breakdown: 'Online ordering, bookings, loyalty, and reminders all require separate implementation work.',
  reasoning: 'This adds new product surface area.',
  timeline_impact_days: 5,
  tasks: [],
  project: {
    id: 'project_123',
    user_id: 'user_123',
    slack_channel_id: 'C_PROJECT',
  },
}
let profileRecord = { slack_access_token: 'xoxb-test-token' }
let lastRequestUpdate = null
let postSlackMessageCalls = []
let postSlackMessageResult = { ts: '1778330000.000001' }
let postSlackMessageError = null
let requestTaskDeleteId = null
let insertedTaskRows = null

const fakeSupabase = {
  auth: {
    getUser: async () => ({ data: { user: currentUser } }),
  },
  from(table) {
    if (table === 'requests') {
      return {
        select() {
          return {
            eq() {
              return {
                single: async () => ({ data: requestRecord }),
              }
            },
          }
        },
        update(payload) {
          lastRequestUpdate = payload
          return {
            eq() {
              return {
                select() {
                  return {
                    single: async () => ({
                      data: { ...requestRecord, ...payload },
                      error: null,
                    }),
                  }
                },
              }
            },
          }
        },
      }
    }

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

    if (table === 'request_tasks') {
      return {
        delete() {
          return {
            eq(column, value) {
              if (column === 'request_id') requestTaskDeleteId = value
              return Promise.resolve({ error: null })
            },
          }
        },
        insert(payload) {
          insertedTaskRows = payload
          return {
            select() {
              return {
                order() {
                  return Promise.resolve({ data: payload, error: null })
                },
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
  createClient: async () => fakeSupabase,
}))

mock.module('@/lib/env', () => ({
  getAppUrl: () => 'https://monad.app',
}))

mock.module('@/lib/slack', () => ({
  buildSlackApprovalMessage: (params) =>
    `reply:${params.developerReply}\napprove:${params.approvalUrl}\ndecline:${params.declineUrl}`,
  buildSlackIncludedMessage: (params) =>
    `reply:${params.developerReply}\nincluded:${params.classification}`,
  postSlackMessage: async (...args) => {
    postSlackMessageCalls.push(args)
    if (postSlackMessageError) throw postSlackMessageError
    return postSlackMessageResult
  },
}))

const { PATCH } = await import('./route')

function buildPatchRequest(body) {
  return new NextRequest('http://localhost/api/requests/request_123', {
    method: 'PATCH',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  })
}

afterEach(() => {
  currentUser = { id: 'user_123' }
  requestRecord = {
    id: 'request_123',
    approval_token: 'approval_token_123',
    classification: 'out_of_scope',
    cost_min: 960,
    cost_max: 1440,
    effort_min_hours: 12,
    effort_max_hours: 18,
    final_reply: null,
    reply_tone: 'professional',
    slack_channel_id: 'C_THREAD',
    slack_thread_ts: '1778327089.609469',
    technical_breakdown: 'Online ordering, bookings, loyalty, and reminders all require separate implementation work.',
    reasoning: 'This adds new product surface area.',
    timeline_impact_days: 5,
    tasks: [],
    project: {
      id: 'project_123',
      user_id: 'user_123',
      slack_channel_id: 'C_PROJECT',
    },
  }
  profileRecord = { slack_access_token: 'xoxb-test-token' }
  lastRequestUpdate = null
  postSlackMessageCalls = []
  postSlackMessageResult = { ts: '1778330000.000001' }
  postSlackMessageError = null
  requestTaskDeleteId = null
  insertedTaskRows = null
})

describe('/api/requests/[requestId] PATCH', () => {
  it('persists the final reply, selected tone, and overridden estimate before sharing', async () => {
    const response = await PATCH(
      buildPatchRequest({
        status: 'sent_to_client',
        final_reply: 'Please approve this estimate.',
        tone: 'firm',
        cost_min: 1200,
        cost_max: 1800,
      }),
      { params: Promise.resolve({ requestId: 'request_123' }) }
    )

    expect(response.status).toBe(200)
    expect(lastRequestUpdate).toEqual({
      status: 'sent_to_client',
      final_reply: 'Please approve this estimate.',
      reply_tone: 'firm',
      cost_min: 1200,
      cost_max: 1800,
    })
  })

  it('persists edited breakdown, effort, and task split before sharing', async () => {
    const response = await PATCH(
      buildPatchRequest({
        status: 'sent_to_client',
        final_reply: 'Please review the updated estimate.',
        tone: 'professional',
        technical_breakdown: 'Requires a booking flow, confirmation emails, and admin updates.',
        effort_min_hours: 10,
        effort_max_hours: 16,
        tasks: [
          {
            name: 'Booking flow',
            description: 'Build the booking form and confirmation state.',
            min_hours: 4,
            max_hours: 6,
          },
          {
            name: 'Admin updates',
            description: 'Add reservation management to the dashboard.',
            min_hours: 6,
            max_hours: 10,
          },
        ],
      }),
      { params: Promise.resolve({ requestId: 'request_123' }) }
    )

    expect(response.status).toBe(200)
    expect(lastRequestUpdate).toEqual({
      status: 'sent_to_client',
      final_reply: 'Please review the updated estimate.',
      reply_tone: 'professional',
      technical_breakdown: 'Requires a booking flow, confirmation emails, and admin updates.',
      effort_min_hours: 10,
      effort_max_hours: 16,
      tasks: [
        {
          name: 'Booking flow',
          description: 'Build the booking form and confirmation state.',
          min_hours: 4,
          max_hours: 6,
        },
        {
          name: 'Admin updates',
          description: 'Add reservation management to the dashboard.',
          min_hours: 6,
          max_hours: 10,
        },
      ],
    })
    expect(requestTaskDeleteId).toBe('request_123')
    expect(insertedTaskRows).toEqual([
      {
        request_id: 'request_123',
        project_id: 'project_123',
        position: 0,
        name: 'Booking flow',
        description: 'Build the booking form and confirmation state.',
        min_hours: 4,
        max_hours: 6,
        status: 'pending',
      },
      {
        request_id: 'request_123',
        project_id: 'project_123',
        position: 1,
        name: 'Admin updates',
        description: 'Add reservation management to the dashboard.',
        min_hours: 6,
        max_hours: 10,
        status: 'pending',
      },
    ])
  })

  it('rejects an invalid cost range', async () => {
    const response = await PATCH(
      buildPatchRequest({
        status: 'sent_to_client',
        final_reply: 'Please approve this estimate.',
        tone: 'professional',
        cost_min: 1800,
        cost_max: 1200,
      }),
      { params: Promise.resolve({ requestId: 'request_123' }) }
    )

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({
      error: 'Minimum cost cannot be higher than maximum cost.',
    })
    expect(lastRequestUpdate).toBeNull()
  })

  it('replies in the original Slack thread and then marks the request as sent', async () => {
    const response = await PATCH(
      buildPatchRequest({
        status: 'sent_to_client',
        final_reply: 'Here is the scoped quote for this extra work.',
        tone: 'professional',
      }),
      { params: Promise.resolve({ requestId: 'request_123' }) }
    )

    expect(response.status).toBe(200)
    expect(postSlackMessageCalls).toEqual([[
      'xoxb-test-token',
      'C_THREAD',
      'reply:Here is the scoped quote for this extra work.\napprove:https://monad.app/approve/approval_token_123\ndecline:https://monad.app/approve/approval_token_123',
      '1778327089.609469',
    ]])
    expect(lastRequestUpdate).toEqual({
      status: 'sent_to_client',
      final_reply: 'Here is the scoped quote for this extra work.',
      reply_tone: 'professional',
    })
  })

  it('posts in the project Slack channel when no original thread exists and stores the new thread ts', async () => {
    requestRecord = {
      ...requestRecord,
      slack_channel_id: null,
      slack_thread_ts: null,
    }

    const response = await PATCH(
      buildPatchRequest({
        status: 'sent_to_client',
        final_reply: 'Please review the approval link below.',
        tone: 'friendly',
      }),
      { params: Promise.resolve({ requestId: 'request_123' }) }
    )

    expect(response.status).toBe(200)
    expect(postSlackMessageCalls).toEqual([[
      'xoxb-test-token',
      'C_PROJECT',
      'reply:Please review the approval link below.\napprove:https://monad.app/approve/approval_token_123\ndecline:https://monad.app/approve/approval_token_123',
      undefined,
    ]])
    expect(lastRequestUpdate).toEqual({
      status: 'sent_to_client',
      final_reply: 'Please review the approval link below.',
      reply_tone: 'friendly',
      slack_thread_ts: '1778330000.000001',
      slack_channel_id: 'C_PROJECT',
    })
  })

  it('blocks sending when Slack is not connected', async () => {
    profileRecord = { slack_access_token: null }

    const response = await PATCH(
      buildPatchRequest({
        status: 'sent_to_client',
        final_reply: 'Please review this estimate.',
        tone: 'professional',
      }),
      { params: Promise.resolve({ requestId: 'request_123' }) }
    )

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({
      error: 'Connect your Slack workspace before sharing approval links in Slack.',
    })
    expect(postSlackMessageCalls).toHaveLength(0)
    expect(lastRequestUpdate).toBeNull()
  })

  it('blocks sending when the project has no linked Slack channel and no original thread', async () => {
    requestRecord = {
      ...requestRecord,
      slack_channel_id: null,
      slack_thread_ts: null,
      project: {
        ...requestRecord.project,
        slack_channel_id: null,
      },
    }

    const response = await PATCH(
      buildPatchRequest({
        status: 'sent_to_client',
        final_reply: 'Please review this estimate.',
        tone: 'professional',
      }),
      { params: Promise.resolve({ requestId: 'request_123' }) }
    )

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({
      error: 'Link a Slack channel to this project before sharing approval links in Slack.',
    })
    expect(postSlackMessageCalls).toHaveLength(0)
    expect(lastRequestUpdate).toBeNull()
  })

  it('does not mark the request as sent when Slack delivery fails', async () => {
    postSlackMessageError = new Error('Slack post message error: channel_not_found')

    const response = await PATCH(
      buildPatchRequest({
        status: 'sent_to_client',
        final_reply: 'Please review this estimate.',
        tone: 'professional',
      }),
      { params: Promise.resolve({ requestId: 'request_123' }) }
    )

    expect(response.status).toBe(502)
    expect(await response.json()).toEqual({
      error: 'Slack delivery failed: Slack post message error: channel_not_found',
    })
    expect(postSlackMessageCalls).toHaveLength(1)
    expect(lastRequestUpdate).toBeNull()
  })

  it('notifies the client in Slack when the developer declines the request', async () => {
    const response = await PATCH(
      buildPatchRequest({
        status: 'declined',
        final_reply: 'We are not able to take this change on within the current engagement.',
        tone: 'firm',
      }),
      { params: Promise.resolve({ requestId: 'request_123' }) }
    )

    expect(response.status).toBe(200)
    expect(postSlackMessageCalls).toEqual([[
      'xoxb-test-token',
      'C_THREAD',
      'We are not able to take this change on within the current engagement.',
      '1778327089.609469',
    ]])
    expect(lastRequestUpdate).toEqual({
      status: 'declined',
      final_reply: 'We are not able to take this change on within the current engagement.',
      reply_tone: 'firm',
    })
  })

  it('requires a reply before declining to the client in Slack', async () => {
    const response = await PATCH(
      buildPatchRequest({
        status: 'declined',
        final_reply: '',
        tone: 'firm',
      }),
      { params: Promise.resolve({ requestId: 'request_123' }) }
    )

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({
      error: 'Add a client-facing decline reply before notifying the client in Slack.',
    })
    expect(postSlackMessageCalls).toHaveLength(0)
    expect(lastRequestUpdate).toBeNull()
  })

  it('blocks sending when the AI analysis has no cost range', async () => {
    requestRecord = {
      ...requestRecord,
      classification: 'in_scope',
      cost_min: null,
      cost_max: null,
    }

    const response = await PATCH(
      buildPatchRequest({
        status: 'sent_to_client',
        final_reply: 'Please review this estimate.',
        tone: 'professional',
      }),
      { params: Promise.resolve({ requestId: 'request_123' }) }
    )

    expect(response.status).toBe(200)
    expect(postSlackMessageCalls).toEqual([[
      'xoxb-test-token',
      'C_THREAD',
      'reply:Please review this estimate.\nincluded:in_scope',
      '1778327089.609469',
    ]])
    expect(lastRequestUpdate).toEqual({
      status: 'accepted_in_scope',
      final_reply: 'Please review this estimate.',
      reply_tone: 'professional',
    })
  })

  it('blocks sending when the AI analysis has no technical breakdown', async () => {
    requestRecord = {
      ...requestRecord,
      technical_breakdown: null,
    }

    const response = await PATCH(
      buildPatchRequest({
        status: 'sent_to_client',
        final_reply: 'Please review this estimate.',
        tone: 'professional',
      }),
      { params: Promise.resolve({ requestId: 'request_123' }) }
    )

    expect(response.status).toBe(422)
    expect(await response.json()).toEqual({
      error: 'Add a technical breakdown before sharing this request with the client.',
    })
    expect(postSlackMessageCalls).toHaveLength(0)
    expect(lastRequestUpdate).toBeNull()
  })

  it('shares included work without an approval link when no additional cost is being charged', async () => {
    const response = await PATCH(
      buildPatchRequest({
        status: 'sent_to_client',
        final_reply: 'We can include this in the current scope.',
        tone: 'professional',
        cost_min: 0,
        cost_max: 0,
      }),
      { params: Promise.resolve({ requestId: 'request_123' }) }
    )

    expect(response.status).toBe(200)
    expect(postSlackMessageCalls).toEqual([[
      'xoxb-test-token',
      'C_THREAD',
      'reply:We can include this in the current scope.\nincluded:out_of_scope',
      '1778327089.609469',
    ]])
    expect(lastRequestUpdate).toEqual({
      status: 'accepted_in_scope',
      final_reply: 'We can include this in the current scope.',
      reply_tone: 'professional',
      cost_min: 0,
      cost_max: 0,
    })
  })
})
