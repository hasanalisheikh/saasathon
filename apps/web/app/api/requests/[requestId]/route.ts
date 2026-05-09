import { NextRequest, NextResponse } from 'next/server'
import { getAppUrl } from '@/lib/env'
import { buildSlackApprovalMessage, buildSlackIncludedMessage, postSlackMessage } from '@/lib/slack'
import { replaceRequestTasks } from '@/lib/request-tasks'
import { createClient } from '@/lib/supabase/server'
import type { AITask, Classification, ReplyTone, RequestStatus } from '@/types'

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
  const effortMin = readEstimate(body?.effort_min_hours)
  const effortMax = readEstimate(body?.effort_max_hours)
  const timelineDays = readEstimate(body?.timeline_impact_days)
  const technicalBreakdown = typeof body?.technical_breakdown === 'string' ? body.technical_breakdown.trim() : undefined
  const reasoning = typeof body?.reasoning === 'string' ? body.reasoning.trim() : undefined
  const classification = readClassification(body?.classification)
  const tasks = readTasks(body?.tasks)

  if (!status || (!MANUAL_STATUS_TRANSITIONS.includes(status) && status !== 'sent_to_client')) {
    return NextResponse.json({ error: 'Unsupported status transition' }, { status: 400 })
  }

  if (replyTone && !REPLY_TONES.includes(replyTone as ReplyTone)) {
    return NextResponse.json({ error: 'Unsupported reply tone' }, { status: 400 })
  }

  if (costMin.invalid || costMax.invalid) {
    return NextResponse.json({ error: 'Cost estimate must use whole dollar amounts.' }, { status: 400 })
  }

  if (effortMin.invalid || effortMax.invalid || timelineDays.invalid) {
    return NextResponse.json({ error: 'Effort and timeline estimates must use whole numbers.' }, { status: 400 })
  }

  if (costMin.value !== undefined && costMax.value !== undefined && costMin.value > costMax.value) {
    return NextResponse.json({ error: 'Minimum cost cannot be higher than maximum cost.' }, { status: 400 })
  }

  if (effortMin.value !== undefined && effortMax.value !== undefined && effortMin.value > effortMax.value) {
    return NextResponse.json({ error: 'Minimum effort cannot be higher than maximum effort.' }, { status: 400 })
  }

  if (tasks.invalid) {
    return NextResponse.json({ error: 'Each task needs a name and valid whole-hour estimates.' }, { status: 400 })
  }

  const { data: existing } = await supabase
    .from('requests')
    .select(
      'id, approval_token, classification, cost_min, cost_max, effort_min_hours, effort_max_hours, final_reply, reply_tone, slack_channel_id, slack_thread_ts, technical_breakdown, reasoning, timeline_impact_days, tasks, project:projects(id, user_id, slack_channel_id)'
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

  const analysisUpdates: Record<string, string | number | null | AITask[] | Classification> = {
    ...(classification !== undefined ? { classification } : {}),
    ...(technicalBreakdown !== undefined ? { technical_breakdown: technicalBreakdown || null } : {}),
    ...(reasoning !== undefined ? { reasoning: reasoning || null } : {}),
    ...(effortMin.value !== undefined ? { effort_min_hours: effortMin.value } : {}),
    ...(effortMax.value !== undefined ? { effort_max_hours: effortMax.value } : {}),
    ...(timelineDays.value !== undefined ? { timeline_impact_days: timelineDays.value } : {}),
    ...(costMin.value !== undefined ? { cost_min: costMin.value } : {}),
    ...(costMax.value !== undefined ? { cost_max: costMax.value } : {}),
    ...(tasks.value !== undefined ? { tasks: tasks.value } : {}),
  }

  let updates: Record<string, string | number | null | AITask[] | Classification>

  if (status === 'accepted_in_scope') {
    updates = { status, classification: 'in_scope', ...analysisUpdates }
  } else if (status === 'sent_to_client') {
    if (!finalReply) {
      return NextResponse.json({ error: 'Add a client-ready reply before sending to Slack.' }, { status: 400 })
    }

    const resolvedCostMin = costMin.value ?? existing.cost_min ?? 0
    const resolvedCostMax = costMax.value ?? existing.cost_max ?? 0
    const resolvedTechnicalBreakdown = technicalBreakdown ?? existing.technical_breakdown ?? ''
    const resolvedClassification = classification ?? existing.classification
    const requiresApproval = resolvedClassification !== 'in_scope' && (resolvedCostMin > 0 || resolvedCostMax > 0)

    if (!resolvedTechnicalBreakdown.trim()) {
      return NextResponse.json({
        error: 'Add a technical breakdown before sharing this request with the client.',
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

    const message = requiresApproval
      ? (() => {
          if (!existing.approval_token) {
            throw new Error('This request is missing an approval token.')
          }

          const appUrl = getAppUrl()
          const approvalUrl = `${appUrl}/approve/${existing.approval_token}`
          const declineUrl = approvalUrl
          return buildSlackApprovalMessage({
            developerReply: finalReply,
            technicalBreakdown: resolvedTechnicalBreakdown,
            costMin: resolvedCostMin,
            costMax: resolvedCostMax,
            approvalUrl,
            declineUrl,
          })
        })()
      : buildSlackIncludedMessage({
          developerReply: finalReply,
          technicalBreakdown: resolvedTechnicalBreakdown,
          classification: resolvedClassification,
        })

    try {
      const result = await postSlackMessage(
        profile.slack_access_token,
        targetChannelId,
        message,
        hasOriginalThread ? (existing.slack_thread_ts ?? undefined) : undefined,
      )

      updates = {
        status: requiresApproval ? status : 'accepted_in_scope',
        final_reply: finalReply,
        ...(replyTone ? { reply_tone: replyTone } : {}),
        ...analysisUpdates,
        ...(!existing.slack_thread_ts
          ? {
              slack_thread_ts: result.ts,
              slack_channel_id: targetChannelId,
            }
          : {}),
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unknown Slack error'
      if (message === 'This request is missing an approval token.') {
        return NextResponse.json({ error: message }, { status: 422 })
      }
      return NextResponse.json({ error: `Slack delivery failed: ${message}` }, { status: 502 })
    }
  } else if (status === 'declined') {
    const declineMessage = finalReply || existing.final_reply

    if (!declineMessage) {
      return NextResponse.json({
        error: 'Add a client-facing decline reply before notifying the client in Slack.',
      }, { status: 400 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('slack_access_token')
      .eq('id', user.id)
      .single()

    const hasOriginalThread = Boolean(existing.slack_channel_id && existing.slack_thread_ts)
    const targetChannelId = hasOriginalThread
      ? existing.slack_channel_id
      : project.slack_channel_id

    if (profile?.slack_access_token && targetChannelId) {
      try {
        const result = await postSlackMessage(
          profile.slack_access_token,
          targetChannelId,
          declineMessage,
          hasOriginalThread ? (existing.slack_thread_ts ?? undefined) : undefined,
        )

        updates = {
          status,
          final_reply: declineMessage,
          ...(replyTone ? { reply_tone: replyTone } : {}),
          ...analysisUpdates,
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
      updates = {
        status,
        final_reply: declineMessage,
        ...(replyTone ? { reply_tone: replyTone } : {}),
        ...analysisUpdates,
      }
    }
  } else {
    updates = {
      status,
      ...(finalReply ? { final_reply: finalReply } : {}),
      ...(replyTone ? { reply_tone: replyTone } : {}),
      ...analysisUpdates,
    }
  }

  const { data, error } = await supabase
    .from('requests')
    .update(updates)
    .eq('id', requestId)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (tasks.value !== undefined) {
    await replaceRequestTasks({
      supabase,
      requestId,
      projectId: project.id,
      tasks: tasks.value,
    })
  }

  return NextResponse.json(data)
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

function readClassification(value: unknown): Classification | undefined {
  if (value === undefined || value === null || value === '') return undefined

  if (
    value === 'in_scope' ||
    value === 'out_of_scope' ||
    value === 'ambiguous' ||
    value === 'clarification_needed'
  ) {
    return value
  }

  return undefined
}

function readTasks(value: unknown): { value?: AITask[]; invalid?: boolean } {
  if (value === undefined) return {}
  if (!Array.isArray(value)) return { invalid: true }

  const parsed: AITask[] = []

  for (const task of value) {
    if (!task || typeof task !== 'object') return { invalid: true }

    const raw = task as Record<string, unknown>
    const name = typeof raw.name === 'string' ? raw.name.trim() : ''
    const description = typeof raw.description === 'string' ? raw.description.trim() : ''
    const minHours = typeof raw.min_hours === 'number' ? raw.min_hours : Number(raw.min_hours)
    const maxHours = typeof raw.max_hours === 'number' ? raw.max_hours : Number(raw.max_hours)

    if (!name || !Number.isInteger(minHours) || !Number.isInteger(maxHours) || minHours < 0 || maxHours < minHours) {
      return { invalid: true }
    }

    parsed.push({
      name,
      description,
      min_hours: minHours,
      max_hours: maxHours,
    })
  }

  return { value: parsed }
}
