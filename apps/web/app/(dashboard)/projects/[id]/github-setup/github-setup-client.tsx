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
  projectId: string
  projectName: string
}

export function GitHubSetupClient({
  githubAppReady,
  githubStatus,
  hasGitHubInstallation,
  linkedRepoName,
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
            <BreadcrumbPage>GitHub Setup</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="max-w-2xl space-y-6">
        <PageHeader>
          <div>
            <PageTitle>Set up GitHub for this project</PageTitle>
            <PageDescription>
              Install the GitHub App, then choose the repository Monad should use for approvals, issues, and activity tracking.
            </PageDescription>
          </div>
        </PageHeader>

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
