import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { verifySlackSignature, isSlackConfigured } from '@/lib/slack'
import { analyseAndPersistRequest } from '@/lib/request-analysis'

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

  const teamId = payload.team_id
  if (!teamId) return NextResponse.json({ ok: true })

  // Respond to Slack immediately — processing happens asynchronously below
  // (Slack requires a response within 3 seconds)
  void (async () => {
    try {
      const supabase = await createServiceClient()

      // Find the profile whose Slack workspace matches the event team
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('slack_team_id', teamId)
        .single()

      if (!profile) return

      // Find the project linked to this channel
      const { data: project } = await supabase
        .from('projects')
        .select('id')
        .eq('user_id', profile.id)
        .eq('slack_channel_id', event.channel)
        .single()

      if (!project) return

      // Create the request record
      const { data: request } = await supabase
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

      if (!request) return

      await analyseAndPersistRequest(request.id)
    } catch (err) {
      console.error('Slack webhook processing error:', err)
    }
  })()

  return NextResponse.json({ ok: true })
}
