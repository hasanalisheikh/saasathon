import { NextRequest, NextResponse } from 'next/server'
import { getAppUrl, isResendConfigured } from '@/lib/env'
import { createClient } from '@/lib/supabase/server'
import { sendApprovalEmail } from '@/lib/resend'
import type { ReplyTone } from '@/types'

const REPLY_TONES: ReplyTone[] = ['friendly', 'professional', 'firm']

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (!isResendConfigured()) {
      return NextResponse.json({
        error: 'Client email is not configured. Add RESEND_API_KEY and RESEND_FROM_EMAIL to send approval emails.',
      }, { status: 503 })
    }

    const { request_id, final_reply, tone, cost_min, cost_max } = await req.json()
    if (!request_id || !final_reply) {
      return NextResponse.json({ error: 'request_id and final_reply required' }, { status: 400 })
    }

    if (tone && !REPLY_TONES.includes(tone)) {
      return NextResponse.json({ error: 'Unsupported reply tone' }, { status: 400 })
    }

    const costMinOverride = readCost(cost_min)
    const costMaxOverride = readCost(cost_max)
    if (costMinOverride.invalid || costMaxOverride.invalid) {
      return NextResponse.json({ error: 'Cost estimate must use whole dollar amounts.' }, { status: 400 })
    }

    if (
      costMinOverride.value !== undefined &&
      costMaxOverride.value !== undefined &&
      costMinOverride.value > costMaxOverride.value
    ) {
      return NextResponse.json({ error: 'Minimum cost cannot be higher than maximum cost.' }, { status: 400 })
    }

    // Load request + project + profile
    const { data: request } = await supabase
      .from('requests')
      .select('*, project:projects(name, client_name, client_email, user_id)')
      .eq('id', request_id)
      .single()

    if (!request) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const project = request.project as Record<string, unknown>
    if (project.user_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    if (!project.client_email) {
      return NextResponse.json({ error: 'No client email on this project' }, { status: 400 })
    }

    const costMin = costMinOverride.value ?? request.cost_min
    const costMax = costMaxOverride.value ?? request.cost_max

    if (costMin === null || costMax === null) {
      return NextResponse.json({
        error: 'AI analysis must produce a cost range before Monad can send an approval email.',
      }, { status: 422 })
    }

    if (costMin > costMax) {
      return NextResponse.json({ error: 'Minimum cost cannot be higher than maximum cost.' }, { status: 400 })
    }

    if (!request.technical_breakdown) {
      return NextResponse.json({
        error: 'AI analysis must produce a technical breakdown before Monad can send an approval email.',
      }, { status: 422 })
    }

    const appUrl = getAppUrl()
    const approvalUrl = `${appUrl}/approve/${request.approval_token}`
    const declineUrl = `${appUrl}/approve/${request.approval_token}?action=decline`

    const costRange = `$${costMin.toLocaleString()} – $${costMax.toLocaleString()}`

    await sendApprovalEmail({
      to: project.client_email as string,
      subject: `Re: ${request.raw_email_subject ?? 'Your request'} — Scope Review`,
      clientName: project.client_name as string,
      developerReply: final_reply,
      requestSummary: request.raw_email_body?.slice(0, 300) ?? '',
      technicalBreakdown: request.technical_breakdown,
      costRange,
      timelineDays: request.timeline_impact_days ?? 0,
      approvalUrl,
      declineUrl,
      projectName: project.name as string,
      requestId: request_id,
    })

    // Update request status
    await supabase.from('requests').update({
      status: 'sent_to_client',
      final_reply,
      reply_tone: tone ?? 'professional',
      cost_min: costMin,
      cost_max: costMax,
    }).eq('id', request_id)

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Send email error:', err)
    const message = err instanceof Error ? err.message : 'Failed to send email'
    const status = message.includes('not configured') ? 503 : 500
    return NextResponse.json({ error: message }, { status })
  }
}

function readCost(value: unknown): { value?: number; invalid?: boolean } {
  if (value === undefined || value === null || value === '') return {}

  const parsed = typeof value === 'number' ? value : Number(value)
  if (!Number.isInteger(parsed) || parsed < 0) return { invalid: true }

  return { value: parsed }
}
