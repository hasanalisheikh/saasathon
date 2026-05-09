import { NextRequest, NextResponse } from 'next/server'
import { isAIConfigured } from '@/lib/env'
import { analyseAndPersistRequest } from '@/lib/request-analysis'

export async function POST(req: NextRequest) {
  try {
    const { request_id } = await req.json()
    if (!request_id) return NextResponse.json({ error: 'request_id required' }, { status: 400 })

    if (!isAIConfigured()) {
      return NextResponse.json({
        error: 'AI analysis is not configured. Add OPENROUTER_API_KEY or set MOCK_AI=true for local development.',
      }, { status: 503 })
    }

    const result = await analyseAndPersistRequest(request_id)
    return NextResponse.json({ ok: true, classification: result.classification })
  } catch (err) {
    console.error('AI analyse error:', err)
    const message = err instanceof Error ? err.message : 'Analysis failed'
    const status = message.includes('not configured') ? 503 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
