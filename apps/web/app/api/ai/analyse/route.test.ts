/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { afterEach, describe, expect, it, mock } from 'bun:test'
import { NextRequest } from 'next/server'

let aiConfigured = false
let analyseCallCount = 0
let classification = 'out_of_scope'

mock.module('@/lib/env', () => ({
  isAIConfigured: () => aiConfigured,
}))

mock.module('@/lib/request-analysis', () => ({
  analyseAndPersistRequest: async () => {
    analyseCallCount += 1
    return { classification }
  },
}))

const { POST } = await import('./route')

afterEach(() => {
  aiConfigured = false
  analyseCallCount = 0
  classification = 'out_of_scope'
})

describe('/api/ai/analyse', () => {
  it('rejects requests when AI is not configured', async () => {
    const response = await POST(new NextRequest('http://localhost/api/ai/analyse', {
      method: 'POST',
      body: JSON.stringify({ request_id: 'req_123' }),
      headers: { 'content-type': 'application/json' },
    }))

    expect(response.status).toBe(503)
    expect(await response.json()).toEqual({
      error: 'AI analysis is not configured. Add OPENROUTER_API_KEY or set MOCK_AI=true for local development.',
    })
    expect(analyseCallCount).toBe(0)
  })

  it('passes through to request analysis when configured', async () => {
    aiConfigured = true
    classification = 'in_scope'

    const response = await POST(new NextRequest('http://localhost/api/ai/analyse', {
      method: 'POST',
      body: JSON.stringify({ request_id: 'req_456' }),
      headers: { 'content-type': 'application/json' },
    }))

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ ok: true, classification: 'in_scope' })
    expect(analyseCallCount).toBe(1)
  })
})
