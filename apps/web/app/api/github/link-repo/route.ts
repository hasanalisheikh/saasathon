import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { listInstallationRepos } from '@/lib/github'
import { isGitHubAppConfigured, isGitHubInstallationId } from '@/lib/github-config'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isGitHubAppConfigured()) {
    return NextResponse.json({
      error: 'GitHub App is not configured. Add the GitHub App credentials to link repositories.',
    }, { status: 503 })
  }

  const { projectId, repoId, repoFullName } = await req.json()
  if (!projectId || !repoId || !repoFullName) {
    return NextResponse.json({ error: 'projectId, repoId, and repoFullName required' }, { status: 400 })
  }

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
    const selectedRepo = repos.find(
      (repo: { id: string; name: string }) => repo.id === String(repoId) && repo.name === repoFullName
    )

    if (!selectedRepo) {
      return NextResponse.json({ error: 'Repository is not available to this installation' }, { status: 400 })
    }

    const { error } = await supabase
      .from('projects')
      .update({
        github_repo_id: repoId,
        github_repo_name: repoFullName,
      })
      .eq('id', projectId)
      .eq('user_id', user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('GitHub repo link error:', error)
    return NextResponse.json({ error: 'Failed to link repository' }, { status: 500 })
  }
}
