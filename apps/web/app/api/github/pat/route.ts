import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAuthenticatedGitHubUser } from '@/lib/github'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { access_token } = await req.json()
    const accessToken = typeof access_token === 'string' ? access_token.trim() : ''

    if (!accessToken) {
      return NextResponse.json({ error: 'access_token required' }, { status: 400 })
    }

    const githubUser = await getAuthenticatedGitHubUser(accessToken)

    const { error } = await supabase
      .from('profiles')
      .update({
        github_access_token: accessToken,
        github_username: githubUser.login,
      })
      .eq('id', user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      ok: true,
      github_username: githubUser.login,
    })
  } catch (err) {
    console.error('PAT connect error:', err)
    return NextResponse.json({ error: 'Failed to validate GitHub token' }, { status: 400 })
  }
}
