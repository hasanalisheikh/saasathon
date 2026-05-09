import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json() as { project_id?: string }

  if (body.project_id) {
    // Unlink a single project channel
    const { error } = await supabase
      .from('projects')
      .update({ slack_channel_id: null, slack_channel_name: null })
      .eq('id', body.project_id)
      .eq('user_id', user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  } else {
    // Disconnect workspace — clear token from profile and all project channels
    await supabase
      .from('projects')
      .update({ slack_channel_id: null, slack_channel_name: null })
      .eq('user_id', user.id)

    await supabase
      .from('profiles')
      .update({
        slack_access_token: null,
        slack_team_id: null,
        slack_team_name: null,
        slack_bot_user_id: null,
      })
      .eq('id', user.id)
  }

  return NextResponse.json({ ok: true })
}
