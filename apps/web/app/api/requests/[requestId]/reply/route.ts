import { NextRequest, NextResponse } from 'next/server'
import { generateClientReply } from '@/lib/ai'
import { isAIConfigured } from '@/lib/env'
import { createClient } from '@/lib/supabase/server'
import type { ReplyTone } from '@/types'

const REPLY_TONES: ReplyTone[] = ['friendly', 'professional', 'firm']
const REPLY_INTENTS = ['approval', 'included', 'decline'] as const

export async function POST(req: NextRequest, { params }: { params: Promise<{ requestId: string }> }) {
  try {
    if (!isAIConfigured()) {
      return NextResponse.json({
        error: 'OpenRouter is not configured. Add OPENROUTER_API_KEY before generating client replies.',
      }, { status: 503 })
    }

    const { requestId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const tone = typeof body?.tone === 'string' ? body.tone : 'professional'
    const intent = typeof body?.intent === 'string' ? body.intent : 'approval'
    const currentReply = typeof body?.current_reply === 'string' ? body.current_reply.trim() : ''
    const costMin = readCost(body?.cost_min)
    const costMax = readCost(body?.cost_max)
    const technicalBreakdownOverride =
      typeof body?.technical_breakdown === 'string' ? body.technical_breakdown.trim() : undefined
    const classificationOverride =
      body?.classification === 'in_scope' ||
      body?.classification === 'out_of_scope' ||
      body?.classification === 'ambiguous' ||
      body?.classification === 'clarification_needed'
        ? body.classification
        : undefined
    const timelineOverride = readEstimate(body?.timeline_impact_days)

    if (!REPLY_TONES.includes(tone as ReplyTone)) {
      return NextResponse.json({ error: 'Unsupported reply tone' }, { status: 400 })
    }

    if (!REPLY_INTENTS.includes(intent as typeof REPLY_INTENTS[number])) {
      return NextResponse.json({ error: 'Unsupported reply intent' }, { status: 400 })
    }

    if (costMin.invalid || costMax.invalid) {
      return NextResponse.json({ error: 'Cost estimate must use whole dollar amounts.' }, { status: 400 })
    }

    if (timelineOverride.invalid) {
      return NextResponse.json({ error: 'Timeline impact must use whole days.' }, { status: 400 })
    }

    if (costMin.value !== undefined && costMax.value !== undefined && costMin.value > costMax.value) {
      return NextResponse.json({ error: 'Minimum cost cannot be higher than maximum cost.' }, { status: 400 })
    }

    const { data: request } = await supabase
      .from('requests')
      .select('*, project:projects(id, name, client_name, user_id)')
      .eq('id', requestId)
      .single()

    if (!request) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const project = request.project as Record<string, unknown>
    if (project.user_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const min = costMin.value ?? request.cost_min
    const max = costMax.value ?? request.cost_max
    const costRange =
      typeof min === 'number' && typeof max === 'number'
        ? `$${min.toLocaleString()} - $${max.toLocaleString()}`
        : null

    const reply = await generateClientReply({
      tone: tone as ReplyTone,
      intent: intent as typeof REPLY_INTENTS[number],
      clientName: (project.client_name as string | null) ?? 'there',
      projectName: (project.name as string | null) ?? 'this project',
      classification: classificationOverride ?? request.classification ?? 'unknown',
      clientRequest: request.raw_email_body ?? '',
      technicalBreakdown: technicalBreakdownOverride ?? request.technical_breakdown ?? '',
      currentReply: currentReply || request.final_reply || request.draft_reply || '',
      costRange,
      timelineDays: timelineOverride.value ?? request.timeline_impact_days ?? null,
      riskLevel: request.risk_level ?? null,
    })

    return NextResponse.json({ reply })
  } catch (err) {
    console.error('Client reply generation error:', err)
    const message = err instanceof Error ? err.message : 'Failed to generate client reply'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

function readCost(value: unknown): { value?: number; invalid?: boolean } {
  if (value === undefined || value === null || value === '') return {}

  const parsed = typeof value === 'number' ? value : Number(value)
  if (!Number.isInteger(parsed) || parsed < 0) return { invalid: true }

  return { value: parsed }
}

function readEstimate(value: unknown): { value?: number; invalid?: boolean } {
  if (value === undefined || value === null || value === '') return {}

  const parsed = typeof value === 'number' ? value : Number(value)
  if (!Number.isInteger(parsed) || parsed < 0) return { invalid: true }

  return { value: parsed }
}
