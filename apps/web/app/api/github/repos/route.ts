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

  const installationId = parseGitHubInstallationId(project.github_installation_id)
  if (!installationId) {
    return NextResponse.json({
      error: 'GitHub App is not installed for this project yet. Install the app before choosing a repository.',
    }, { status: 400 })
  }

  const { listInstallationRepos } = await import('@/lib/github-app')
  const repos = await listInstallationRepos(installationId)
  return NextResponse.json(repos)
}
