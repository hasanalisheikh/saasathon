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

  const [{ data: latestGithubIssue }, { data: latestGithubEvent }] = await Promise.all([
    supabase
      .from('requests')
      .select('id, raw_email_subject, github_issue_number, github_issue_url')
      .eq('project_id', id)
      .not('github_issue_url', 'is', null)
      .order('approved_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('github_events')
      .select('id, event_type, created_at, plain_english_summary')
      .eq('project_id', id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  return (
    <GitHubSetupClient
      githubAppReady={isGitHubAppConfigured()}
      githubStatus={githubStatus}
      hasGitHubInstallation={isGitHubInstallationId(project.github_installation_id)}
      linkedRepoName={project.github_repo_name}
      latestGithubEvent={latestGithubEvent}
      latestGithubIssue={latestGithubIssue}
      projectId={project.id}
      projectName={project.name}
    />
  )
}
