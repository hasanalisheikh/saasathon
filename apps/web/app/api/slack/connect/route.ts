import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { buildSlackOAuthUrl, isSlackConfigured } from '@/lib/slack'
import { getAppUrl } from '@/lib/env'

export async function GET() {
  if (!isSlackConfigured()) {
    return NextResponse.json(
      { error: 'Slack is not configured. Add SLACK_CLIENT_ID, SLACK_CLIENT_SECRET, and SLACK_SIGNING_SECRET.' },
      { status: 503 }
    )
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/login', getAppUrl()))
  }

  const url = buildSlackOAuthUrl(user.id, getAppUrl())
  return NextResponse.redirect(url)
}
