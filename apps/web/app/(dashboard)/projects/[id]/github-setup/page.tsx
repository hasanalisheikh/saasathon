import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { GITHUB_STATUS_VALUES, type GitHubStatus } from '@/lib/github-connect'
import { GitHubSetupClient } from './github-setup-client'
import { isGitHubAppConfigured, isGitHubInstallationId } from '@/lib/github-config'

export default async function GitHubSetupPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ github?: string }>
}) {
  const { id } = await params
  const { github } = await searchParams

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: project } = await supabase
    .from('projects')
    .select('id, name, github_repo_name, github_installation_id')
    .eq('id', id)
    .eq('user_id', user!.id)
    .single()

  if (!project) {
    notFound()
  }

  const githubStatus = GITHUB_STATUS_VALUES.includes((github ?? '') as GitHubStatus)
    ? (github as GitHubStatus)
    : null

  return (
    <GitHubSetupClient
      githubAppReady={isGitHubAppConfigured()}
      githubStatus={githubStatus}
      hasGitHubInstallation={isGitHubInstallationId(project.github_installation_id)}
      linkedRepoName={project.github_repo_name}
      projectId={project.id}
      projectName={project.name}
    />
  )
}
