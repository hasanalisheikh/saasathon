import { NextRequest, NextResponse } from 'next/server'
import { getAppUrl } from '@/lib/env'
import { buildSlackApprovalMessage, postSlackMessage } from '@/lib/slack'
import { createClient } from '@/lib/supabase/server'
import type { ReplyTone, RequestStatus } from '@/types'

const MANUAL_STATUS_TRANSITIONS: RequestStatus[] = ['accepted_in_scope', 'deferred', 'declined']
const REPLY_TONES: ReplyTone[] = ['friendly', 'professional', 'firm']

export async function GET(req: NextRequest, { params }: { params: Promise<{ requestId: string }> }) {
  const { requestId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: request } = await supabase
    .from('requests')
    .select('*, project:projects(id, name, client_name, client_email, hourly_rate, user_id)')
    .eq('id', requestId)
    .single()

  if (!request) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Verify ownership
  const project = request.project as Record<string, unknown>
  if (project.user_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data: taskRows } = await supabase
    .from('request_tasks')
    .select('*')
    .eq('request_id', requestId)
    .order('position', { ascending: true })

  return NextResponse.json({ ...request, task_rows: taskRows ?? [] })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ requestId: string }> }) {
  const { requestId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const status = body?.status as RequestStatus | undefined
  const finalReply = typeof body?.final_reply === 'string' ? body.final_reply.trim() : null
  const replyTone = typeof body?.tone === 'string' ? body.tone : null
  const costMin = readCost(body?.cost_min)
  const costMax = readCost(body?.cost_max)

  if (!status || (!MANUAL_STATUS_TRANSITIONS.includes(status) && status !== 'sent_to_client')) {
    return NextResponse.json({ error: 'Unsupported status transition' }, { status: 400 })
  }

  if (replyTone && !REPLY_TONES.includes(replyTone as ReplyTone)) {
    return NextResponse.json({ error: 'Unsupported reply tone' }, { status: 400 })
  }

  if (costMin.invalid || costMax.invalid) {
    return NextResponse.json({ error: 'Cost estimate must use whole dollar amounts.' }, { status: 400 })
  }

  if (costMin.value !== undefined && costMax.value !== undefined && costMin.value > costMax.value) {
    return NextResponse.json({ error: 'Minimum cost cannot be higher than maximum cost.' }, { status: 400 })
  }

  const { data: existing } = await supabase
    .from('requests')
    .select(
      'id, approval_token, cost_min, cost_max, final_reply, reply_tone, slack_channel_id, slack_thread_ts, technical_breakdown, project:projects(id, user_id, slack_channel_id)'
    )
    .eq('id', requestId)
    .single()

  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const projectRelation = existing.project as unknown
  const project = Array.isArray(projectRelation)
    ? projectRelation[0] as { id: string; user_id: string; slack_channel_id: string | null } | undefined
    : projectRelation as { id: string; user_id: string; slack_channel_id: string | null } | null

  if (!project || project.user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let updates: Record<string, string | number | null>

  if (status === 'accepted_in_scope') {
    updates = { status, classification: 'in_scope' }
  } else if (status === 'sent_to_client') {
    if (!finalReply) {
      return NextResponse.json({ error: 'Add a client-ready reply before sending to Slack.' }, { status: 400 })
    }

    if (!existing.approval_token) {
      return NextResponse.json({ error: 'This request is missing an approval token.' }, { status: 422 })
    }

    const resolvedCostMin = costMin.value ?? existing.cost_min
    const resolvedCostMax = costMax.value ?? existing.cost_max

    if (resolvedCostMin === null || resolvedCostMax === null) {
      return NextResponse.json({
        error: 'AI analysis must produce a cost range before Monad can send an approval link in Slack.',
      }, { status: 422 })
    }

    if (!existing.technical_breakdown) {
      return NextResponse.json({
        error: 'AI analysis must produce a technical breakdown before Monad can send an approval link in Slack.',
      }, { status: 422 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('slack_access_token')
      .eq('id', user.id)
      .single()

    if (!profile?.slack_access_token) {
      return NextResponse.json({
        error: 'Connect your Slack workspace before sharing approval links in Slack.',
      }, { status: 400 })
    }

    const hasOriginalThread = Boolean(existing.slack_channel_id && existing.slack_thread_ts)
    const targetChannelId = hasOriginalThread
      ? existing.slack_channel_id
      : project.slack_channel_id

    if (!targetChannelId) {
      return NextResponse.json({
        error: 'Link a Slack channel to this project before sharing approval links in Slack.',
      }, { status: 400 })
    }

    const appUrl = getAppUrl()
    const approvalUrl = `${appUrl}/approve/${existing.approval_token}`
    const declineUrl = approvalUrl
    const message = buildSlackApprovalMessage({
      developerReply: finalReply,
      technicalBreakdown: existing.technical_breakdown,
      costMin: resolvedCostMin,
      costMax: resolvedCostMax,
      approvalUrl,
      declineUrl,
    })

    try {
      const result = await postSlackMessage(
        profile.slack_access_token,
        targetChannelId,
        message,
        hasOriginalThread ? (existing.slack_thread_ts ?? undefined) : undefined,
      )

      updates = {
        status,
        final_reply: finalReply,
        ...(replyTone ? { reply_tone: replyTone } : {}),
        ...(costMin.value !== undefined ? { cost_min: costMin.value } : {}),
        ...(costMax.value !== undefined ? { cost_max: costMax.value } : {}),
        ...(!existing.slack_thread_ts
          ? {
              slack_thread_ts: result.ts,
              slack_channel_id: targetChannelId,
            }
          : {}),
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unknown Slack error'
      return NextResponse.json({ error: `Slack delivery failed: ${message}` }, { status: 502 })
    }
  } else {
    updates = { status }
  }

  const { data, error } = await supabase
    .from('requests')
    .update(updates)
    .eq('id', requestId)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

function readCost(value: unknown): { value?: number; invalid?: boolean } {
  if (value === undefined || value === null || value === '') return {}

  const parsed = typeof value === 'number' ? value : Number(value)
  if (!Number.isInteger(parsed) || parsed < 0) return { invalid: true }

  return { value: parsed }
}
