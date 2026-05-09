import { NextRequest, NextResponse } from 'next/server'
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

  try {
    const supabase = await createServiceClient()

    // Find the profile whose Slack workspace matches the event team
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, full_name, slack_access_token')
      .eq('slack_team_id', teamId)
      .single()

    if (!profile) return NextResponse.json({ ok: true })

    // Find the project linked to this channel
    const { data: project } = await supabase
      .from('projects')
      .select('id')
      .eq('user_id', profile.id)
      .eq('slack_channel_id', event.channel)
      .single()

    if (!project) return NextResponse.json({ ok: true })

    // Create the request record before responding so the serverless runtime
    // does not drop the intake work after Slack receives its 200 response.
    const { data: request, error } = await supabase
      .from('requests')
      .insert({
        project_id: project.id,
        raw_email_from: event.user,
        raw_email_subject: null,
        raw_email_body: event.text,
        source: 'slack',
        slack_thread_ts: event.ts,
        slack_channel_id: event.channel,
        status: 'pending_review',
        analysis_status: 'queued',
      })
      .select('id')
      .single()

    if (error || !request) {
      console.error('Failed to create Slack request:', error)
      return NextResponse.json({ error: 'DB error' }, { status: 500 })
    }

    try {
      const appUrl = getAppUrl()
      fetch(`${appUrl}/api/ai/analyse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request_id: request.id }),
      })
        .then(async (response) => {
          try {
            const payload = await response.json().catch(() => ({})) as {
              analysis?: {
                classification?: string
                confidence?: number
              }
              classification?: string
              error?: string
            }

            if (!profile.slack_access_token) return

            const reply = response.ok
              ? await buildSlackAutoReply({
                  classification:
                    payload.classification ??
                    payload.analysis?.classification ??
                    'clarification_needed',
                  confidence: payload.analysis?.confidence ?? 50,
                  developerName: profile.full_name ?? 'Your developer',
                  requestText: event.text,
                })
              : buildSlackFallbackReply({
                  classification: 'clarification_needed',
                  developerName: profile.full_name ?? 'Your developer',
                })

            await postSlackMessage(
              profile.slack_access_token,
              event.channel,
              reply,
              event.ts
            )
          } catch (slackError) {
            console.error('Slack acknowledgement failed after analysis completed:', slackError)
          }
        })
        .catch(async (fetchError) => {
          console.error('Async Slack request analysis failed:', fetchError)
          await supabase
            .from('requests')
            .update({
              analysis_status: 'failed',
              analysis_error: 'Could not enqueue AI analysis from the Slack webhook.',
            })
            .eq('id', request.id)

          if (!profile.slack_access_token) return

          try {
            await postSlackMessage(
              profile.slack_access_token,
              event.channel,
              buildSlackFallbackReply({
                classification: 'clarification_needed',
                developerName: profile.full_name ?? 'Your developer',
              }),
              event.ts
            )
          } catch (slackError) {
            console.error('Slack acknowledgement failed after analysis enqueue error:', slackError)
          }
      })
    } catch (scheduleError) {
      console.error('Slack analysis scheduling error:', scheduleError)
      await supabase
        .from('requests')
        .update({
          analysis_status: 'failed',
          analysis_error: scheduleError instanceof Error ? scheduleError.message : 'Could not enqueue AI analysis.',
        })
        .eq('id', request.id)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Slack webhook processing error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
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
