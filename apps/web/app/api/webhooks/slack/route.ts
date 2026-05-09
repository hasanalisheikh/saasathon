import { after, NextRequest, NextResponse } from 'next/server'
import {
  verifySlackSignature,
  isSlackConfigured,
} from '@/lib/slack'
import { processSlackEvent } from './process'

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
