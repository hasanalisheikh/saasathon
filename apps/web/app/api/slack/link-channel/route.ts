import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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
