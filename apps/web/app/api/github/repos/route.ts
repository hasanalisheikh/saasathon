import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { listUserRepos } from '@/lib/github'

function isGitHubOAuthReady() {
  return Boolean(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET)
}

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const projectId = req.nextUrl.searchParams.get('projectId')
  if (!projectId) return NextResponse.json({ error: 'projectId required' }, { status: 400 })

  const { data: project } = await supabase
    .from('projects')
    .select('id')
    .eq('id', projectId)
    .eq('user_id', user.id)
    .single()

  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (!isGitHubOAuthReady()) {
    return NextResponse.json({ error: 'GitHub OAuth is not configured' }, { status: 503 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('github_access_token')
    .eq('id', user.id)
    .single()

  if (!profile?.github_access_token) {
    return NextResponse.json({ error: 'GitHub account not connected' }, { status: 400 })
  }

  const repos = await listUserRepos(profile.github_access_token)
  return NextResponse.json(repos)
}
