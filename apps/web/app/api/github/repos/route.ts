import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { listInstallationRepos } from '@/lib/github'
import { isGitHubAppConfigured, isGitHubInstallationId } from '@/lib/github-config'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isGitHubAppConfigured()) {
    return NextResponse.json({
      error: 'GitHub App is not configured. Add the GitHub App credentials to load repositories.',
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

  if (!project?.github_installation_id || !isGitHubInstallationId(project.github_installation_id)) {
    return NextResponse.json({ error: 'GitHub App is not installed for this project' }, { status: 400 })
  }

  try {
    const repos = await listInstallationRepos(project.github_installation_id)
    return NextResponse.json(repos)
  } catch (error) {
    console.error('GitHub repo list error:', error)
    return NextResponse.json({ error: 'Failed to load repositories for this installation' }, { status: 500 })
  }
}
