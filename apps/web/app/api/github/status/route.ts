import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function isGitHubOAuthReady() {
  return Boolean(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET)
}

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('github_username, github_access_token')
    .eq('id', user.id)
    .single()

  return NextResponse.json({
    oauthReady: isGitHubOAuthReady(),
    connected: Boolean(profile?.github_access_token),
    github_username: profile?.github_username ?? null,
  })
}

