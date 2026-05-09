/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { afterEach, describe, expect, it, mock } from 'bun:test'
import { NextRequest } from 'next/server'

let analyseCallCount = 0
let analysisResult = {
  analysis: { classification: 'out_of_scope' },
  analysis_status: 'completed',
  classification: 'out_of_scope',
}

mock.module('@/lib/request-analysis', () => ({
  analyseAndPersistRequest: async () => {
    analyseCallCount += 1
    return analysisResult
  },
}))

const { POST } = await import('./route')

afterEach(() => {
  analyseCallCount = 0
  analysisResult = {
    analysis: { classification: 'out_of_scope' },
    analysis_status: 'completed',
    classification: 'out_of_scope',
  }
})

describe('/api/ai/analyse', () => {
  it('returns failed lifecycle details when analysis cannot run', async () => {
    analysisResult = {
      analysis_error: 'AI analysis is not configured. Add OPENROUTER_API_KEY or set MOCK_AI=true for local development.',
      analysis_status: 'failed',
      failure_kind: 'not_configured',
    }

    const response = await POST(new NextRequest('http://localhost/api/ai/analyse', {
      method: 'POST',
      body: JSON.stringify({ request_id: 'req_123' }),
      headers: { 'content-type': 'application/json' },
    }))

    expect(response.status).toBe(503)
    expect(await response.json()).toEqual({
      error: 'AI analysis is not configured. Add OPENROUTER_API_KEY or set MOCK_AI=true for local development.',
      analysis_status: 'failed',
    })
    expect(analyseCallCount).toBe(1)
  })

  it('passes through the completed analysis payload', async () => {
    analysisResult = {
      analysis: { classification: 'in_scope', confidence: 91 },
      analysis_status: 'completed',
      classification: 'in_scope',
    }

    const response = await POST(new NextRequest('http://localhost/api/ai/analyse', {
      method: 'POST',
      body: JSON.stringify({ request_id: 'req_456' }),
      headers: { 'content-type': 'application/json' },
    }))

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({
      ok: true,
      analysis: { classification: 'in_scope', confidence: 91 },
      analysis_status: 'completed',
      classification: 'in_scope',
    })
    expect(analyseCallCount).toBe(1)
  })
})
