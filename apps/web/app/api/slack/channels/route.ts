import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { listSlackChannels } from '@/lib/slack'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('slack_access_token')
    .eq('id', user.id)
    .single()

  if (!profile?.slack_access_token) {
    return NextResponse.json({ error: 'Slack not connected' }, { status: 400 })
  }

  try {
    const channels = await listSlackChannels(profile.slack_access_token)
    return NextResponse.json({ channels })
  } catch (err) {
    console.error('Slack channels error:', err)
    return NextResponse.json({ error: 'Failed to fetch channels' }, { status: 500 })
  }
}
