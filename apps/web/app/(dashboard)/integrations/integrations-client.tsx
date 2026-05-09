'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { PageDescription, PageHeader, PageTitle } from '@workspace/ui/components/page-header'
import { getGitHubStatusMessage } from '@/lib/github-connect'
import { isGitHubInstallationId } from '@/lib/github-config'
import type { ProjectIntegration } from './page'

function GitHubStatusRow({
  project,
}: {
  project: ProjectIntegration
}) {
  const hasInstallation = isGitHubInstallationId(project.github_installation_id)
  const isConnected = Boolean(project.github_repo_name)

  const statusLabel = isConnected
    ? 'Connected'
    : hasInstallation
      ? 'Choose repository'
      : 'Not connected'

  const detail = isConnected
    ? project.github_repo_name
    : hasInstallation
      ? 'Pick the repository Monad should track for this project.'
      : 'Connect GitHub when you want approvals, issues, and activity tracking in one place.'

  const actionLabel = !hasInstallation
    ? 'Connect GitHub'
    : isConnected
      ? 'Reconnect'
      : 'Choose repository'

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border/70 px-4 py-3">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">GitHub</span>
          <Badge
            variant="secondary"
            className={
              isConnected
                ? 'border border-emerald-500/20 bg-emerald-500/5 text-emerald-700'
                : 'border border-border bg-background text-muted-foreground'
            }
          >
            {statusLabel}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{detail}</p>
      </div>

      <Button variant={isConnected ? 'outline' : 'default'} render={<Link href={`/projects/${project.id}/github-setup`} />} nativeButton={false}>
        {actionLabel}
      </Button>
    </div>
  )
}

function PassiveIntegrationRow({
  description,
  href,
  label,
  title,
}: {
  description: string
  href: string
  label: string
  title: string
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border/70 px-4 py-3">
      <div className="space-y-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <Button variant="outline" render={<Link href={href} />} nativeButton={false}>
        {label}
      </Button>
    </div>
  )
}

function ProjectIntegrationCard({
  project,
}: {
  project: ProjectIntegration
}) {
  const hasWidget = Boolean(project.widget_token)
  const hasInboundEmail = Boolean(project.inbound_email)

  return (
    <Card className="border-border/80 bg-muted/30">
      <CardHeader>
        <CardTitle className="text-base">{project.name}</CardTitle>
        <CardDescription>{project.client_name}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        <GitHubStatusRow project={project} />

        {hasInboundEmail && (
          <PassiveIntegrationRow
            title="Inbound Email"
            description={project.inbound_email ?? 'Forwarded email is available for this project.'}
            href={`/projects/${project.id}`}
            label="View project"
          />
        )}

        {hasWidget && (
          <PassiveIntegrationRow
            title="Website Widget"
            description="Widget feedback is active for this project."
            href="/settings"
            label="View embed"
          />
        )}

        {!hasInboundEmail && !hasWidget && (
          <p className="text-sm text-muted-foreground">
            GitHub is the only active integration configured for this project right now.
          </p>
        )}
      </CardContent>
    </Card>
  )
}

export function IntegrationsPageClient({
  projects,
}: {
  projects: ProjectIntegration[]
}) {
  const searchParams = useSearchParams()
  const githubMessage = getGitHubStatusMessage(searchParams.get('github'))

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <PageHeader>
        <div>
          <PageTitle>Integrations</PageTitle>
          <PageDescription>
            Manage the real integrations that turn client requests into approved, trackable work.
          </PageDescription>
        </div>
      </PageHeader>

      <div className="space-y-6">
        {githubMessage && (
          <div
            className={
              githubMessage.tone === 'error'
                ? 'rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive'
                : 'rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-700'
            }
          >
            {githubMessage.text}
          </div>
        )}

        {projects.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center text-sm text-muted-foreground">
              Create a project to install the GitHub App and link a repository.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {projects.map((project) => (
              <ProjectIntegrationCard
                key={project.id}
                project={project}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
