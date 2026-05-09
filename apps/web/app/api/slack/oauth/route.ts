import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { exchangeSlackCode, verifyAndDecodeSlackState } from '@/lib/slack'
import { getAppUrl } from '@/lib/env'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')
  const appUrl = getAppUrl()

  if (error) {
    return NextResponse.redirect(`${appUrl}/integrations?slack=cancelled`)
  }

  if (!code || !state) {
    return NextResponse.redirect(`${appUrl}/integrations?slack=error`)
  }

  const decoded = verifyAndDecodeSlackState(state)
  if (!decoded) {
    return NextResponse.redirect(`${appUrl}/integrations?slack=error`)
  }

  try {
    const tokens = await exchangeSlackCode(code, appUrl)

    const supabase = await createServiceClient()
    await supabase
      .from('profiles')
      .update({
        slack_access_token: tokens.access_token,
        slack_team_id: tokens.team.id,
        slack_team_name: tokens.team.name,
        slack_bot_user_id: tokens.bot_user_id,
        slack_user_id: tokens.authed_user?.id ?? null,
      })
      .eq('id', decoded.userId)

    return NextResponse.redirect(`${appUrl}/integrations?slack=connected`)
  } catch (err) {
    console.error('Slack OAuth error:', err)
    return NextResponse.redirect(`${appUrl}/integrations?slack=error`)
  }
}
