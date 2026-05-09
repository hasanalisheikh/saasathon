import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { listInstallationRepos, parseGitHubInstallationId } from '@/lib/github'
import { isGitHubAppConfigured } from '@/lib/github-config'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isGitHubAppConfigured()) {
    return NextResponse.json({
      error: 'GitHub App is not configured. Add the GitHub App credentials to continue.',
    }, { status: 503 })
  }

  const projectId = req.nextUrl.searchParams.get('projectId')
  if (!projectId) return NextResponse.json({ error: 'projectId required' }, { status: 400 })

  const { data: project } = await supabase
    .from('projects')
    .select('id, github_installation_id')
    .eq('id', projectId)
    .eq('user_id', user.id)
    .single()

  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('github_access_token')
    .eq('id', user.id)
    .single()

  const installationId = parseGitHubInstallationId(project.github_installation_id)

  if (profile?.github_access_token) {
    try {
      const { listUserRepos } = await import('@/lib/github')
      const repos = await listUserRepos(profile.github_access_token)
      return NextResponse.json(repos)
    } catch (err) {
      console.error('Failed to list user repos, falling back to installation repos:', err)
    }
  }

  if (!installationId) {
    return NextResponse.json({
      error: 'GitHub App is not connected yet. Connect your GitHub account to see your repositories.',
    }, { status: 400 })
  }

  const repos = await listInstallationRepos(installationId)
  return NextResponse.json(repos)
}
