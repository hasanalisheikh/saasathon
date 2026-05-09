import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ensureSlackChannelAccess } from '@/lib/slack'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json() as { project_id?: string; channel_id?: string; channel_name?: string }

  if (!body.project_id || !body.channel_id || !body.channel_name) {
    return NextResponse.json({ error: 'project_id, channel_id, and channel_name are required' }, { status: 400 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('slack_access_token')
    .eq('id', user.id)
    .single()

  if (!profile?.slack_access_token) {
    return NextResponse.json({ error: 'Slack workspace is not connected' }, { status: 400 })
  }

  try {
    await ensureSlackChannelAccess(profile.slack_access_token, body.channel_id)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to verify Slack channel access'
    return NextResponse.json({ error: message }, { status: 400 })
  }

  // RLS on the user client enforces ownership — only the project owner can update
  const { error } = await supabase
    .from('projects')
    .update({
      slack_channel_id: body.channel_id,
      slack_channel_name: body.channel_name,
    })
    .eq('id', body.project_id)
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
