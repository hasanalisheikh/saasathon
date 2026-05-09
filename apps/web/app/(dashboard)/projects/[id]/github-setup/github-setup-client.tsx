'use client'

import Link from 'next/link'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@workspace/ui/components/breadcrumb'
import { PageDescription, PageHeader, PageTitle } from '@workspace/ui/components/page-header'
import { GitHubRepoLinker } from '@/components/github/github-repo-linker'
import { buildGitHubConnectPath, type GitHubStatus } from '@/lib/github-connect'

type GitHubSetupClientProps = {
  githubAppReady: boolean
  githubStatus: GitHubStatus | null
  hasGitHubInstallation: boolean
  linkedRepoName: string | null
  latestGithubEvent: {
    created_at: string
    event_type: string
    plain_english_summary: string | null
  } | null
  latestGithubIssue: {
    github_issue_number: number | null
    github_issue_url: string | null
    id: string
    raw_email_subject: string | null
  } | null
  projectId: string
  projectName: string
}

export function GitHubSetupClient({
  githubAppReady,
  githubStatus,
  hasGitHubInstallation,
  linkedRepoName,
  latestGithubEvent,
  latestGithubIssue,
  projectId,
  projectName,
}: GitHubSetupClientProps) {
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/projects" />}>Projects</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href={`/projects/${projectId}`} />}>{projectName}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Link GitHub Repo</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="max-w-2xl space-y-6">
        <PageHeader>
          <div>
            <PageTitle>Link a GitHub repository</PageTitle>
            <PageDescription>
              Select the repo for this project. Monad will install the GitHub App if needed and auto-create issues when scope changes are approved.
            </PageDescription>
          </div>
        </PageHeader>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatusCard
            label="GitHub App"
            value={hasGitHubInstallation ? 'Installed' : 'Not installed'}
            detail={hasGitHubInstallation ? 'This project can now choose a repository.' : 'Install the GitHub App to continue.'}
          />
          <StatusCard
            label="Linked repository"
            value={linkedRepoName ?? 'Not linked yet'}
            detail={linkedRepoName ? 'Approved requests can create GitHub issues here.' : 'Choose a repository after install.'}
          />
          <StatusCard
            label="Latest Monad issue"
            value={latestGithubIssue?.github_issue_number ? `Issue #${latestGithubIssue.github_issue_number}` : 'None yet'}
            detail={latestGithubIssue?.raw_email_subject ?? 'Approve a request to create the first GitHub issue.'}
            href={latestGithubIssue?.github_issue_url ?? null}
          />
          <StatusCard
            label="Webhook activity"
            value={latestGithubEvent ? latestGithubEvent.event_type.replace('_', ' ') : 'No events yet'}
            detail={
              latestGithubEvent
                ? `${new Date(latestGithubEvent.created_at).toLocaleString()}`
                : 'GitHub events will appear after issue and PR activity starts.'
            }
          />
        </div>

        <GitHubRepoLinker
          connectHref={buildGitHubConnectPath({
            projectId,
            returnTo: `/projects/${projectId}/github-setup`,
          })}
          githubAppReady={githubAppReady}
          githubStatus={githubStatus}
          hasGitHubInstallation={hasGitHubInstallation}
          linkedRepoName={linkedRepoName}
          projectId={projectId}
          projectName={projectName}
          redirectAfterLink={`/projects/${projectId}?tab=github&github=repo_linked`}
        />
      </div>
    </div>
  )
}

function StatusCard({
  detail,
  href,
  label,
  value,
}: {
  detail: string
  href?: string | null
  label: string
  value: string
}) {
  const content = (
    <>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-2 line-clamp-2 text-sm font-medium text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
    </>
  )

  return (
    <div className="rounded-lg border border-border/80 bg-muted/30 p-4">
      {href ? (
        <a href={href} target="_blank" rel="noreferrer" className="block hover:underline">
          {content}
        </a>
      ) : content}
    </div>
  )
}
