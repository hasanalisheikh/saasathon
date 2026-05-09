/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { afterEach, describe, expect, it, mock } from 'bun:test'
import { NextRequest } from 'next/server'

let currentUser = { id: 'user_123' }
let insertedPayload = null
let analysisResult = {
  analysis_status: 'completed',
  classification: 'out_of_scope',
}

const fakeSupabase = {
  auth: {
    getUser: async () => ({ data: { user: currentUser } }),
  },
  from(table) {
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
          insertedPayload = payload
          return {
            select() {
              return {
                single: async () => ({ data: { id: 'request_456' }, error: null }),
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

mock.module('@/lib/request-analysis', () => ({
  analyseAndPersistRequest: async () => analysisResult,
}))

const { POST } = await import('./route')

afterEach(() => {
  currentUser = { id: 'user_123' }
  insertedPayload = null
  analysisResult = {
    analysis_status: 'completed',
    classification: 'out_of_scope',
  }
})

describe('/api/projects/[id]/requests', () => {
  it('creates a manual request and runs inline analysis', async () => {
    const response = await POST(
      new NextRequest('http://localhost/api/projects/project_123/requests', {
        method: 'POST',
        body: JSON.stringify({
          raw_email_from: 'Marcus <marcus@example.com>',
          raw_email_subject: 'Need a change',
          raw_email_body: 'Can you add a booking flow?',
        }),
        headers: { 'content-type': 'application/json' },
      }),
      { params: Promise.resolve({ id: 'project_123' }) }
    )

    expect(response.status).toBe(201)
    expect(insertedPayload).toEqual({
      project_id: 'project_123',
      raw_email_from: 'Marcus <marcus@example.com>',
      raw_email_subject: 'Need a change',
      raw_email_body: 'Can you add a booking flow?',
      source: 'manual',
      status: 'pending_review',
      analysis_status: 'queued',
    })
    expect(await response.json()).toEqual({
      id: 'request_456',
      analysis_error: null,
      analysis_status: 'completed',
    })
  })

  it('keeps the request and returns failed analysis details', async () => {
    analysisResult = {
      analysis_error: 'Add a project scope brief or supporting documents before running AI analysis.',
      analysis_status: 'failed',
      failure_kind: 'missing_scope',
    }

    const response = await POST(
      new NextRequest('http://localhost/api/projects/project_123/requests', {
        method: 'POST',
        body: JSON.stringify({
          raw_email_body: 'Can you add a booking flow?',
        }),
        headers: { 'content-type': 'application/json' },
      }),
      { params: Promise.resolve({ id: 'project_123' }) }
    )

    expect(response.status).toBe(201)
    expect(await response.json()).toEqual({
      id: 'request_456',
      analysis_error: 'Add a project scope brief or supporting documents before running AI analysis.',
      analysis_status: 'failed',
    })
  })
})
