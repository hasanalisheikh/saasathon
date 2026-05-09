import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { listUserRepos } from '@/lib/github'
import { isGitHubOAuthConfigured } from '@/lib/github-config'

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

  const { data: profile } = await supabase
    .from('profiles')
    .select('github_access_token')
    .eq('id', user.id)
    .single()

  if (!profile?.github_access_token) {
    return NextResponse.json({
      error: isGitHubOAuthConfigured()
        ? 'GitHub account not connected'
        : 'GitHub is not connected yet. Add a personal access token in Settings to continue.',
    }, { status: 400 })
  }

  const repos = await listUserRepos(profile.github_access_token)
  return NextResponse.json(repos)
}
