import { NextRequest, NextResponse } from 'next/server'
import { analyseAndPersistRequest } from '@/lib/request-analysis'

export async function POST(req: NextRequest) {
  try {
    const { request_id } = await req.json()
    if (!request_id) return NextResponse.json({ error: 'request_id required' }, { status: 400 })

    const result = await analyseAndPersistRequest(request_id)
    return NextResponse.json({ ok: true, classification: result.classification })
  } catch (err) {
    console.error('AI analyse error:', err)
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
  }
}
