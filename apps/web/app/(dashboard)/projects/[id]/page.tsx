import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { getConfiguredEnv } from "@/lib/env"
import { notFound } from "next/navigation"
import { buildGitHubConnectPath, getGitHubStatusMessage } from "@/lib/github-connect"
import { isGitHubAppConfigured, isGitHubInstallationId } from "@/lib/github-config"
import { parseGitHubInstallationId } from "@/lib/github"
import { listRepoIssues, type InstallationRepoIssue } from "@/lib/github-app"
import { cn } from "@workspace/ui/lib/utils"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@workspace/ui/components/tabs"
import {
  PageHeader,
  PageTitle,
  PageDescription,
  PageActions,
} from "@workspace/ui/components/page-header"
import {
  EmptyState,
  EmptyStateTitle,
  EmptyStateDescription,
} from "@workspace/ui/components/empty-state"
import { ProjectPageActions } from "./project-page-actions"
import { ProjectRequestsTab } from "./project-requests-tab"
import { WidgetCommentsTab } from "./widget-comments-tab"
import {
  Calendar,
  ExternalLink,
  FileCheck2,
  FileText,
  GitBranch,
  Inbox,
  MessageSquareCode,
  type LucideIcon,
} from "lucide-react"
import { Icon } from "@iconify/react"

const TABS = [
  "requests",
  "documents",
  "widget",
  "github",
  "proof-pack",
] as const
type Tab = (typeof TABS)[number]

const TAB_ICONS: Record<Tab, LucideIcon> = {
  requests: Inbox,
  documents: FileText,
  widget: MessageSquareCode,
  github: GitBranch,
  "proof-pack": FileCheck2,
}

export default async function ProjectDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ tab?: string; github?: string }>
}) {
  const { id } = await params
  const { tab: rawTab, github: githubStatus } = await searchParams
  const activeTab: Tab = (TABS as readonly string[]).includes(rawTab ?? "")
    ? (rawTab as Tab)
    : "requests"

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .eq("user_id", user!.id)
    .single()

  if (!project) notFound()

  const [
    { data: requests },
    { data: projectDocuments },
    { data: githubEvents },
    { data: widgetComments },
  ] = await Promise.all([
    supabase
      .from("requests")
      .select("*")
      .eq("project_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("documents")
      .select("*")
      .eq("project_id", id)
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("github_events")
      .select("*")
      .eq("project_id", id)
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("widget_comments")
      .select("*")
      .eq("project_id", id)
      .is("converted_to_request_id", null)
      .order("created_at", { ascending: false }),
  ])

  const approvedRequests = (requests ?? []).filter(
    (r) => r.status === "approved"
  )
  const pendingRequests = (requests ?? []).filter(
    (r) => r.status === "pending_review"
  )
  const unconvertedCommentCount = (widgetComments ?? []).length
  const TAB_LABELS: Record<Tab, string> = {
    requests: "Requests",
    documents:
      (projectDocuments?.length ?? 0) > 0
        ? `Documents (${projectDocuments!.length})`
        : "Documents",
    widget:
      unconvertedCommentCount > 0
        ? `Widget (${unconvertedCommentCount})`
        : "Widget",
    github: "GitHub",
    "proof-pack": "Proof Pack",
  }
  const githubMessage = getGitHubStatusMessage(githubStatus ?? null)
  const githubConnected = isGitHubInstallationId(project.github_installation_id)
  const githubConnectHref = buildGitHubConnectPath({
    projectId: id,
    returnTo: `/projects/${id}/github-setup`,
  })
  const githubSetupHref = `/projects/${id}/github-setup`
  const githubAppReady = isGitHubAppConfigured()
  const githubRepoUrl = project.github_repo_name
    ? `https://github.com/${project.github_repo_name}`
    : null
  const githubInstallationId = parseGitHubInstallationId(project.github_installation_id)
  const [githubOwner = "", githubRepo = ""] = (project.github_repo_name as string | null)?.split("/") ?? []
  const githubIssuesResult =
    githubAppReady && githubInstallationId && githubOwner && githubRepo
      ? await loadRepoIssues({
          installationId: githubInstallationId,
          owner: githubOwner,
          repo: githubRepo,
        })
      : { issues: [] as InstallationRepoIssue[], error: null as string | null }
  const linkedIssueNumbers = new Set(
    (requests ?? [])
      .map((request) => request.github_issue_number)
      .filter((issueNumber): issueNumber is number => typeof issueNumber === "number")
  )
  const projectCreatedLabel = new Date(project.created_at as string).toLocaleDateString()
  const appUrl = getConfiguredEnv("NEXT_PUBLIC_APP_URL")

  return (
    <div className="flex-1 overflow-y-auto p-6">
      {/* Header */}
      <PageHeader className="mb-4 sm:items-start">
        <div>
          <PageTitle>{project.name}</PageTitle>
          <PageDescription>
            {project.client_name}
            {project.client_email ? ` · ${project.client_email}` : ""}
          </PageDescription>
        </div>
        <PageActions className="self-start pt-0.5">
          <ProjectPageActions appUrl={appUrl} project={project} />
        </PageActions>
      </PageHeader>

      {/* Project Details */}
      <div className="mb-4 grid max-w-full grid-cols-2 gap-x-4 gap-y-6 md:max-w-[60%] md:grid-cols-4 md:gap-x-12 md:gap-y-8">
        <div className="flex flex-col items-start gap-1.5">
          <span className="text-xs text-muted-foreground uppercase">
            Clients
          </span>
          {project.client_email ? (
            <a
              href={`mailto:${project.client_email}`}
              className="group/link flex items-center gap-1.5 hover:underline"
            >
              <Icon icon="lucide:mail" className="h-4 w-4 text-primary" />
              <span className="text-sm">{project.client_name}</span>
              <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 transition-opacity group-hover/link:opacity-100" />
            </a>
          ) : (
            <div className="flex items-center gap-1.5">
              <Icon icon="lucide:user" className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{project.client_name}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col items-start gap-1.5">
          <span className="text-xs text-muted-foreground uppercase">
            Project
          </span>
          {githubRepoUrl ? (
            <a
              href={githubRepoUrl}
              target="_blank"
              rel="noreferrer"
              className="group/link flex items-center gap-1.5 hover:underline"
            >
              <Icon icon="logos:github-icon" className="h-4 w-4" />
              <span className="max-w-[12rem] truncate text-sm">
                {project.github_repo_name}
              </span>
              <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 transition-opacity group-hover/link:opacity-100" />
            </a>
          ) : githubAppReady ? (
            <Link
              href={githubConnected ? githubSetupHref : githubConnectHref}
              className="group/link flex items-center gap-1.5 hover:underline"
            >
              <Icon icon="logos:github-icon" className="h-4 w-4" />
              <span className="text-sm">
                {githubConnected ? "Choose repository" : "Install GitHub App"}
              </span>
              <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 transition-opacity group-hover/link:opacity-100" />
            </Link>
          ) : (
            <div className="flex items-center gap-1.5">
              <Icon icon="logos:github-icon" className="h-4 w-4 opacity-60" />
              <span className="text-sm text-muted-foreground">Setup required</span>
            </div>
          )}
        </div>

        <div className="flex flex-col items-start gap-1.5">
          <span className="text-xs text-muted-foreground uppercase">
            Approved Requests
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium">{approvedRequests.length}</span>
            <span className="text-sm text-muted-foreground">
              ({pendingRequests.length} pending)
            </span>
          </div>
        </div>

        <div className="flex flex-col items-start gap-1.5">
          <span className="text-xs text-muted-foreground uppercase">
            Created
          </span>
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-primary" />
            <span className="text-sm">{projectCreatedLabel}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue={activeTab}>
        <TabsList
          variant="line"
          className="mb-6 h-9 w-full justify-start overflow-x-auto rounded-none border-b border-border bg-transparent p-0"
        >
          {TABS.map((tab) => {
            const TabIcon = TAB_ICONS[tab]

            return (
              <TabsTrigger
                key={tab}
                value={tab}
                className="h-9 flex-none rounded-none px-3 text-sm group-data-horizontal/tabs:after:bottom-[-1px]"
              >
                <TabIcon className="size-4" />
                {TAB_LABELS[tab]}
              </TabsTrigger>
            )
          })}
        </TabsList>

        <TabsContent value="requests">
          <ProjectRequestsTab
            projectId={id}
            requests={requests ?? []}
          />
        </TabsContent>

        <TabsContent value="widget">
          <WidgetCommentsTab comments={widgetComments ?? []} projectId={id} />
        </TabsContent>

        <TabsContent value="documents">
          <div className="mb-4 flex items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              Assigned documents are included in AI scope and pricing analysis
              for this project.
            </p>
            <Button
              variant="outline"
              size="sm"
              render={<Link href={`/documents?project_id=${id}`} />}
              nativeButton={false}
            >
              Manage Documents
            </Button>
          </div>

          {!projectDocuments?.length ? (
            <EmptyState>
              <EmptyStateTitle>No project documents yet.</EmptyStateTitle>
              <EmptyStateDescription>
                Add contracts, proposals, rate cards, or briefs from the
                documents library.
              </EmptyStateDescription>
            </EmptyState>
          ) : (
            <div className="space-y-2">
              {projectDocuments.map((document) => (
                <Card key={document.id}>
                  <CardContent>
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-sm">{document.title}</p>
                          <Badge
                            variant={
                              document.extraction_status === "failed"
                                ? "destructive"
                                : "outline"
                            }
                          >
                            {document.extraction_status}
                          </Badge>
                          <Badge variant="outline">
                            {(document.document_type as string).replace(
                              "_",
                              " "
                            )}
                          </Badge>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {document.file_name} ·{" "}
                          {new Date(document.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex flex-wrap justify-end gap-1">
                        {(document.tags as string[] | null)?.map((tag) => (
                          <Badge key={tag} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="github">
          {/* GitHub repo connection */}
          {!project.github_repo_name && (
            <Card className="mb-4">
              <CardContent className="flex items-center justify-between">
                <div>
                  <p className="mb-1 text-sm">No GitHub repo linked</p>
                  <p className="text-xs text-muted-foreground">
                    {githubAppReady
                      ? "Install the GitHub App for this project, then choose a repository to auto-create issues on approval and track implementation activity."
                      : "GitHub App setup is incomplete. Add the GitHub App credentials and webhook secret to continue."}
                  </p>
                </div>
                {githubAppReady ? (
                  <Button
                    variant="outline"
                    render={
                      <Link
                        href={
                          githubConnected ? githubSetupHref : githubConnectHref
                        }
                      />
                    }
                    nativeButton={false}
                  >
                    {githubConnected ? "Choose Repository" : "Install GitHub App"}
                  </Button>
                ) : (
                  <Button variant="outline" disabled>
                    GitHub Setup Required
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {githubMessage && (
            <p className={cn(
              "mb-4 text-xs",
              githubMessage.tone === 'error' ? 'text-destructive' : 'text-emerald-600'
            )}>
              {githubMessage.text}
            </p>
          )}

          {project.github_repo_name && (
            <Card className="mb-4 border-emerald-500/20 bg-emerald-500/5">
              <CardContent className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-emerald-500">●</span>
                  <span className="text-xs text-emerald-500">Connected to</span>
                  <span className="font-mono text-xs">
                    {project.github_repo_name}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  render={<Link href={`/projects/${id}/github-setup`} />}
                  nativeButton={false}
                >
                  Change repo
                </Button>
              </CardContent>
            </Card>
          )}

          {project.github_repo_name && (
            <div className="mb-6 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">Existing issues</p>
                  <p className="text-xs text-muted-foreground">
                    Recent issues in the connected repository.
                  </p>
                </div>
                {githubRepoUrl && (
                  <Button
                    variant="ghost"
                    size="sm"
                    render={
                      <a href={`${githubRepoUrl}/issues`} target="_blank" rel="noreferrer" />
                    }
                    nativeButton={false}
                  >
                    View all issues
                  </Button>
                )}
              </div>

              {githubIssuesResult.error ? (
                <Card>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{githubIssuesResult.error}</p>
                  </CardContent>
                </Card>
              ) : !githubIssuesResult.issues.length ? (
                <EmptyState>
                  <EmptyStateTitle>No issues found.</EmptyStateTitle>
                  <EmptyStateDescription>
                    Open issues from the connected repository will appear here.
                  </EmptyStateDescription>
                </EmptyState>
              ) : (
                <div className="space-y-2">
                  {githubIssuesResult.issues.map((issue) => (
                    <GitHubIssueRow
                      key={issue.number}
                      issue={issue}
                      isLinkedToMonad={linkedIssueNumbers.has(issue.number)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {!githubEvents?.length ? (
            <EmptyState>
              <EmptyStateTitle>No GitHub activity yet.</EmptyStateTitle>
              <EmptyStateDescription>
                Merged pull requests and issue updates will appear here after the GitHub App is connected to a repository for this project.
              </EmptyStateDescription>
            </EmptyState>
          ) : (
            <div className="space-y-3">
              {githubEvents.map((event) => (
                <GitHubEventRow key={event.id} event={event} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="proof-pack">
          <Card className="mb-4 border-primary/15 bg-primary/5">
            <CardContent>
              <p className="text-xs leading-5 text-muted-foreground">
                Proof packs are legally-defensible PDFs documenting the original
                client request, AI scope analysis, cost estimate, and client
                approval with IP and timestamp. Download one per approved
                request.
              </p>
            </CardContent>
          </Card>

          {!approvedRequests.length ? (
            <EmptyState>
              <EmptyStateTitle>No approved requests yet.</EmptyStateTitle>
              <EmptyStateDescription>
                Proof packs are generated once a client approves a scope change.
              </EmptyStateDescription>
            </EmptyState>
          ) : (
            <div className="space-y-2">
              {approvedRequests.map((req) => (
                <Card key={req.id}>
                  <CardContent className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm">
                        {req.raw_email_subject ||
                          req.raw_email_body?.slice(0, 60)}
                      </p>
                      <div className="mt-1 flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">
                          Approved{" "}
                          {new Date(req.approved_at).toLocaleDateString()}
                        </span>
                        {req.cost_min && req.cost_max && (
                          <span className="text-xs text-primary">
                            ${req.cost_min.toLocaleString()}–$
                            {req.cost_max.toLocaleString()}
                          </span>
                        )}
                        {req.github_issue_url && (
                          <a
                            href={req.github_issue_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-blue-400 hover:underline"
                          >
                            Issue #{req.github_issue_number}
                          </a>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      render={
                        <a href={`/api/requests/${req.id}/proof`} download />
                      }
                      nativeButton={false}
                    >
                      Download PDF
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

async function loadRepoIssues(params: {
  installationId: string
  owner: string
  repo: string
}) {
  try {
    const issues = await listRepoIssues({
      installationId: params.installationId,
      owner: params.owner,
      repo: params.repo,
      limit: 12,
      state: "open",
    })

    return { issues, error: null as string | null }
  } catch (error) {
    console.error("Failed to load GitHub issues for project page:", error)
    return {
      issues: [] as InstallationRepoIssue[],
      error: "Monad couldn't load issues from the connected repository right now.",
    }
  }
}

function GitHubIssueRow({
  issue,
  isLinkedToMonad,
}: {
  issue: InstallationRepoIssue
  isLinkedToMonad: boolean
}) {
  return (
    <Card>
      <CardContent>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <a
                href={issue.url}
                target="_blank"
                rel="noreferrer"
                className="truncate text-sm font-medium hover:underline"
              >
                #{issue.number} {issue.title}
              </a>
              <Badge variant="outline">{issue.state}</Badge>
              {isLinkedToMonad && <Badge variant="secondary">Linked to Monad request</Badge>}
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span>Updated {new Date(issue.updatedAt).toLocaleString()}</span>
              {issue.assigneeLogin && <span>Assigned to {issue.assigneeLogin}</span>}
            </div>
            {issue.labels.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {issue.labels.slice(0, 4).map((label) => (
                  <Badge key={label} variant="outline">
                    {label}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <a
            href={issue.url}
            target="_blank"
            rel="noreferrer"
            className="flex-shrink-0 text-xs text-blue-400 hover:underline"
          >
            View →
          </a>
        </div>
      </CardContent>
    </Card>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function GitHubEventRow({ event }: { event: any }) {
  const typeMap: Record<string, { label: string; color: string; icon: string }> = {
    pr_merged: { label: "PR Merged", color: "text-foreground", icon: "⎇" },
    issue_closed: { label: "Issue Closed", color: "text-emerald-400", icon: "✓" },
    issue_updated: { label: "Issue Updated", color: "text-blue-400", icon: "☑" },
    push: { label: "Push", color: "text-blue-400", icon: "↑" },
    deployment: { label: "Deployed", color: "text-primary", icon: "⚡" },
  }
  const meta = typeMap[event.event_type as string] ?? {
    label: event.event_type,
    color: "text-muted-foreground",
    icon: "·",
  }
  const ghData = event.github_data as Record<string, unknown>
  const prUrl = (ghData?.pull_request as Record<string, unknown>)?.html_url as
    | string
    | undefined
  const issueUrl = (ghData?.issue as Record<string, unknown>)?.html_url as
    | string
    | undefined
  const externalUrl = prUrl ?? issueUrl

  return (
    <Card
      className={cn(
        "border-l-[3px]",
        event.is_unapproved_work && "border-destructive"
      )}
    >
      <CardContent>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2">
              <Badge variant="outline" className={meta.color}>
                {meta.icon} {meta.label}
              </Badge>
              {event.is_unapproved_work && (
                <Badge variant="destructive">⚠ Unapproved work detected</Badge>
              )}
            </div>
            {event.plain_english_summary ? (
              <p className="text-sm leading-5">
                {event.plain_english_summary as string}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                {((ghData?.pull_request as Record<string, unknown>)
                  ?.title as string) ??
                  ((ghData?.head_commit as Record<string, unknown>)
                    ?.message as string) ??
                  "No description"}
              </p>
            )}
            <p className="mt-1 text-xs text-muted-foreground/50">
              {new Date(event.created_at as string).toLocaleString()}
            </p>
          </div>
          {externalUrl && (
            <a
              href={externalUrl}
              target="_blank"
              rel="noreferrer"
              className="flex-shrink-0 text-xs text-blue-400 hover:underline"
            >
              View →
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
