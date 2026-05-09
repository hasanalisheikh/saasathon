import { NextRequest, NextResponse } from 'next/server'
import { analyseAndPersistRequest } from '@/lib/request-analysis'

export async function POST(req: NextRequest) {
  try {
    const { request_id } = await req.json()
    if (!request_id) return NextResponse.json({ error: 'request_id required' }, { status: 400 })

    const result = await analyseAndPersistRequest(request_id)

    if (result.analysis_status === 'failed') {
      return NextResponse.json(
        {
          error: result.analysis_error,
          analysis_status: 'failed',
        },
        { status: getFailureStatusCode(result.failure_kind) }
      )
    }

    return NextResponse.json({
      ok: true,
      analysis: result.analysis,
      analysis_status: 'completed',
      classification: result.classification,
    })
  } catch (err) {
    console.error('AI analyse error:', err)
    const message = err instanceof Error ? err.message : 'Analysis failed'
    const status = message.includes('Request not found') ? 404 : 500
    return NextResponse.json({ error: message }, { status })
  }
}

function getFailureStatusCode(kind: string) {
  switch (kind) {
    case 'not_configured':
      return 503
    case 'missing_scope':
    case 'invalid_response':
      return 422
    default:
      return 500
  }
}
