import { after, NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { generateSlackIntakeReply } from '@/lib/ai'
import { getAppUrl } from '@/lib/env'
import { isMockAIEnabled } from '@/lib/env'
import { verifySlackSignature, isSlackConfigured, postSlackMessage } from '@/lib/slack'
import { buildSlackFallbackReply } from './reply'

export async function POST(req: NextRequest) {
  if (!isSlackConfigured()) {
    return NextResponse.json(
      { error: 'Slack is not configured.' },
      { status: 503 }
    )
  }

  const rawBody = await req.text()

  const valid = await verifySlackSignature(rawBody, req.headers)
  if (!valid) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const payload = JSON.parse(rawBody) as {
    authorizations?: Array<{
      team_id?: string
    }>
    context_team_id?: string
    type: string
    challenge?: string
    team_id?: string
    event?: {
      type: string
      subtype?: string
      bot_id?: string
      channel: string
      user: string
      text: string
      ts: string
    }
  }

  // Slack sends this once when you first set the Request URL — must respond immediately
  if (payload.type === 'url_verification') {
    return NextResponse.json({ challenge: payload.challenge })
  }

  if (payload.type !== 'event_callback') {
    return NextResponse.json({ ok: true })
  }

  const event = payload.event
  if (!event) return NextResponse.json({ ok: true })

  // Only handle real user messages in channels/groups
  const isChannelMessage = event.type === 'message' || event.type === 'message.channels' || event.type === 'message.groups'
  if (!isChannelMessage) return NextResponse.json({ ok: true })

  // Skip bot messages and message edits/deletions
  if (event.bot_id || event.subtype) return NextResponse.json({ ok: true })

  // Skip empty messages
  if (!event.text?.trim()) return NextResponse.json({ ok: true })

  const teamId =
    payload.team_id ??
    payload.context_team_id ??
    payload.authorizations?.[0]?.team_id

  if (!teamId) {
    console.info('Slack webhook skipped: no workspace team id in payload')
    return NextResponse.json({ ok: true })
  }

  after(async () => {
    await processSlackEvent({
      channel: event.channel,
      teamId,
      text: event.text,
      threadTs: event.ts,
      user: event.user,
    })
  })

  return NextResponse.json({ ok: true })
}

async function processSlackEvent(params: {
  channel: string
  teamId: string
  text: string
  threadTs: string
  user: string
}) {
  try {
    const supabase = await createServiceClient()

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, full_name, slack_access_token')
      .eq('slack_team_id', params.teamId)
      .single()

    if (!profile) return

    const { data: project } = await supabase
      .from('projects')
      .select('id')
      .eq('user_id', profile.id)
      .eq('slack_channel_id', params.channel)
      .single()

    if (!project) return

    const { data: request, error } = await supabase
      .from('requests')
      .insert({
        project_id: project.id,
        raw_email_from: params.user,
        raw_email_subject: null,
        raw_email_body: params.text,
        source: 'slack',
        slack_thread_ts: params.threadTs,
        slack_channel_id: params.channel,
        status: 'pending_review',
        analysis_status: 'queued',
      })
      .select('id')
      .single()

    if (error || !request) {
      console.error('Failed to create Slack request:', error)
      return
    }

    const analysisPayload = await runSlackAnalysis({
      requestId: request.id,
      supabase,
    })

    if (!profile.slack_access_token) return

    try {
      const reply = analysisPayload.ok
        ? await buildSlackAutoReply({
            classification: analysisPayload.classification,
            confidence: analysisPayload.confidence,
            developerName: profile.full_name ?? 'Your developer',
            requestText: params.text,
          })
        : buildSlackFallbackReply({
            classification: 'clarification_needed',
            developerName: profile.full_name ?? 'Your developer',
          })

      await postSlackMessage(
        profile.slack_access_token,
        params.channel,
        reply,
        params.threadTs
      )
    } catch (slackError) {
      console.error('Slack acknowledgement failed after analysis completed:', slackError)
    }
  } catch (err) {
    console.error('Slack webhook processing error:', err)
  }
}

async function runSlackAnalysis(params: {
  requestId: string
  supabase: ReturnType<typeof createServiceClient>
}): Promise<{ ok: true; classification: string; confidence: number } | { ok: false }> {
  try {
    const appUrl = getAppUrl()
    const response = await fetch(`${appUrl}/api/ai/analyse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ request_id: params.requestId }),
    })

    const payload = await response.json().catch(() => ({})) as {
      analysis?: {
        classification?: string
        confidence?: number
      }
      classification?: string
    }

    if (!response.ok) {
      return { ok: false }
    }

    return {
      ok: true,
      classification:
        payload.classification ??
        payload.analysis?.classification ??
        'clarification_needed',
      confidence: payload.analysis?.confidence ?? 50,
    }
  } catch (fetchError) {
    console.error('Async Slack request analysis failed:', fetchError)
    await params.supabase
      .from('requests')
      .update({
        analysis_status: 'failed',
        analysis_error: 'Could not enqueue AI analysis from the Slack webhook.',
      })
      .eq('id', params.requestId)

    return { ok: false }
  }
}

async function buildSlackAutoReply(params: {
  classification: string
  confidence: number
  developerName: string
  requestText: string
}) {
  if (isMockAIEnabled()) {
    return buildSlackFallbackReply({
      classification: params.classification,
      developerName: params.developerName,
    })
  }

  try {
    return await generateSlackIntakeReply(params)
  } catch (error) {
    console.error('Slack intake reply generation failed:', error)
    return buildSlackFallbackReply({
      classification: params.classification,
      developerName: params.developerName,
    })
  }
}
