import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { cn } from "@workspace/ui/lib/utils"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@workspace/ui/components/breadcrumb"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@workspace/ui/components/tabs"
import {
  ClassificationBadge,
  StatusBadge,
  getClassificationColorClass,
} from "@workspace/ui/components/status-badge"
import { PageHeader, PageTitle, PageDescription, PageActions } from "@workspace/ui/components/page-header"
import {
  EmptyState,
  EmptyStateTitle,
  EmptyStateDescription,
} from "@workspace/ui/components/empty-state"
import { EmbedSnippet } from './embed-snippet'
import { EditProjectModal } from './edit-project-modal'
import { WidgetCommentsTab } from './widget-comments-tab'
import { Calendar, ExternalLink } from "lucide-react"
import { Icon } from "@iconify/react"

const TABS = ['requests', 'documents', 'widget', 'github', 'proof-pack'] as const
type Tab = typeof TABS[number]

export default async function ProjectDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ tab?: string; filter?: string }>
}) {
  const { id } = await params
  const { tab: rawTab, filter: rawFilter } = await searchParams
  const activeTab: Tab = (TABS as readonly string[]).includes(rawTab ?? '') ? (rawTab as Tab) : 'requests'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .eq("user_id", user!.id)
    .single()

  if (!project) notFound()

  const [{ data: requests }, { data: projectDocuments }, { data: githubEvents }, { data: widgetComments }] = await Promise.all([
    supabase
      .from('requests')
      .select('*')
      .eq('project_id', id)
      .order('created_at', { ascending: false }),
    supabase
      .from('documents')
      .select('*')
      .eq('project_id', id)
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('github_events')
      .select('*')
      .eq('project_id', id)
      .order('created_at', { ascending: false })
      .limit(50),
    supabase
      .from('widget_comments')
      .select('*')
      .eq('project_id', id)
      .is('converted_to_request_id', null)
      .order('created_at', { ascending: false }),
  ])

  const approvedRequests = (requests ?? []).filter((r) => r.status === 'approved')
  const STATUS_FILTERS = ["all", "pending_review", "sent_to_client", "approved", "declined", "deferred"]
  const activeFilter = STATUS_FILTERS.includes(rawFilter ?? '') ? (rawFilter as string) : 'all'
  const filteredRequests = activeFilter === 'all'
    ? (requests ?? [])
    : (requests ?? []).filter((r) => r.status === activeFilter)

  const unconvertedCommentCount = (widgetComments ?? []).length
  const TAB_LABELS: Record<Tab, string> = {
    requests: 'Requests',
    documents: (projectDocuments?.length ?? 0) > 0 ? `Documents (${projectDocuments!.length})` : 'Documents',
    widget: unconvertedCommentCount > 0 ? `Widget (${unconvertedCommentCount})` : 'Widget',
    github: 'GitHub',
    'proof-pack': 'Proof Pack',
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/projects" />}>Projects</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{project.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <PageHeader>
        <div>
          <PageTitle className="text-2xl font-light">{project.name}</PageTitle>
          <PageDescription>
            {project.client_name}
            {project.client_email ? ` · ${project.client_email}` : ""}
          </PageDescription>
        </div>
        <PageActions>
          <EditProjectModal project={project} />
          <Button render={<Link href={`/projects/${id}/requests/new`} />} nativeButton={false}>
            + Add Request
          </Button>
        </PageActions>
      </PageHeader>

      {/* Project Details Placeholders */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 md:gap-x-12 gap-y-4 mb-4 -mt-4 max-w-full md:max-w-[60%]">
        <div className="flex flex-col gap-0.5 items-start">
          <span className="text-xs uppercase text-muted-foreground">Clients</span>
          <a href="#" target="_blank" rel="noreferrer" className="group/link flex items-center gap-1.5 hover:underline">
            <Icon icon="logos:slack-icon" className="w-4 h-4" />
            <span className="text-sm">Acme Corp</span>
            <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover/link:opacity-100 transition-opacity" />
          </a>
        </div>

        <div className="flex flex-col gap-0.5 items-start">
          <span className="text-xs uppercase text-muted-foreground">Project</span>
          <a href="#" target="_blank" rel="noreferrer" className="group/link flex items-center gap-1.5 hover:underline">
            <Icon icon="logos:github-icon" className="w-4 h-4" />
            <span className="text-sm">acme-frontend</span>
            <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover/link:opacity-100 transition-opacity" />
          </a>
        </div>

        <div className="flex flex-col gap-0.5 items-start">
          <span className="text-xs uppercase text-muted-foreground">Requirements Met</span>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium">21%</span>
            <span className="text-sm text-muted-foreground">(12/56)</span>
          </div>
        </div>

        <div className="flex flex-col gap-0.5 items-start">
          <span className="text-xs uppercase text-muted-foreground">Deadline</span>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="text-sm">Oct 24, 2026</span>
          </div>
        </div>
      </div>

      {/* Inbound email banner */}
      {project.inbound_email && (
        <Card className="mb-6 border-primary/20 bg-primary/5">
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-xs text-primary mb-1">Inbound email address</p>
              <p className="text-sm font-medium">{project.inbound_email}</p>
            </div>
            <p className="text-xs text-muted-foreground">Forward or BCC client emails here</p>
          </CardContent>
        </Card>
      )}

      {/* Widget embed snippet */}
      <div className="mb-6">
        <p className="text-xs uppercase tracking-wider mb-2 text-muted-foreground">Widget embed</p>
        <EmbedSnippet projectId={id} />
      </div>

      {/* Tabs */}
      <Tabs defaultValue={activeTab}>
        <TabsList variant="line" className="mb-6 flex-wrap md:flex-nowrap overflow-x-auto max-w-full justify-start h-auto pb-1">
          {TABS.map((tab) => (
            <TabsTrigger key={tab} value={tab}>
              {TAB_LABELS[tab]}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="requests">
          {/* Request filters */}
          <div className="flex gap-2 mb-4 flex-wrap overflow-x-auto pb-2">
            {STATUS_FILTERS.map((f) => (
              <Badge
                key={f}
                variant={f === activeFilter ? "default" : "outline"}
                className="capitalize cursor-pointer shrink-0"
                render={<Link href={`?tab=requests&filter=${f}`} />}
              >
                {f.replace(/_/g, ' ')}
              </Badge>
            ))}
          </div>

          {/* Request list */}
          {!requests?.length ? (
            <EmptyState>
              <EmptyStateTitle>No requests yet.</EmptyStateTitle>
              <EmptyStateDescription>
                Forward client emails to{" "}
                <span className="font-medium text-muted-foreground">{project.inbound_email}</span>
              </EmptyStateDescription>
            </EmptyState>
          ) : filteredRequests.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No requests with status &ldquo;{activeFilter.replace(/_/g, ' ')}&rdquo;.
            </div>
          ) : (
            <div className="space-y-2">
              {filteredRequests.map((req) => (
                <Link
                  key={req.id}
                  href={`/projects/${id}/requests/${req.id}`}
                  className="block"
                >
                  <Card
                    className={cn(
                      "transition-all hover:ring-foreground/20 border-l-[3px]",
                      getClassificationColorClass(req.classification)
                    )}
                  >
                    <CardContent className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">
                          {req.raw_email_subject || req.raw_email_body?.slice(0, 60)}
                        </p>
                        <p className="text-xs mt-0.5 text-muted-foreground/50">
                          {req.raw_email_from} · {new Date(req.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                        {req.classification && (
                          <ClassificationBadge classification={req.classification} />
                        )}
                        {req.cost_min && (
                          <span className="text-xs text-primary">
                            ${req.cost_min.toLocaleString()}–${req.cost_max?.toLocaleString()}
                          </span>
                        )}
                        <StatusBadge status={req.status} />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="widget">
          <WidgetCommentsTab comments={widgetComments ?? []} projectId={id} />
        </TabsContent>

        <TabsContent value="documents">
          <div className="mb-4 flex items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              Assigned documents are included in AI scope and pricing analysis for this project.
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
                Add contracts, proposals, rate cards, or briefs from the documents library.
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
                          <Badge variant={document.extraction_status === 'failed' ? 'destructive' : 'outline'}>
                            {document.extraction_status}
                          </Badge>
                          <Badge variant="outline">
                            {(document.document_type as string).replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {document.file_name} · {new Date(document.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex flex-wrap justify-end gap-1">
                        {(document.tags as string[] | null)?.map((tag) => (
                          <Badge key={tag} variant="outline">{tag}</Badge>
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
                  <p className="text-sm mb-1">No GitHub repo linked</p>
                  <p className="text-xs text-muted-foreground">
                    Connect a repo to auto-create issues on approval and track PR activity.
                  </p>
                </div>
                <Button variant="outline" render={<a href={`/api/github/connect?state=${id}`} />} nativeButton={false}>
                  Connect GitHub
                </Button>
              </CardContent>
            </Card>
          )}

          {project.github_repo_name && (
            <Card className="mb-4 border-emerald-500/20 bg-emerald-500/5">
              <CardContent className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-500 text-xs">●</span>
                  <span className="text-xs text-emerald-500">Connected to</span>
                  <span className="text-xs font-mono">{project.github_repo_name}</span>
                </div>
                <Button variant="ghost" size="sm" render={<Link href={`/projects/${id}/github-setup`} />} nativeButton={false}>
                  Change repo
                </Button>
              </CardContent>
            </Card>
          )}

          {!githubEvents?.length ? (
            <EmptyState>
              <EmptyStateTitle>No GitHub activity yet.</EmptyStateTitle>
              <EmptyStateDescription>Merged PRs and closed issues will appear here.</EmptyStateDescription>
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
                Proof packs are legally-defensible PDFs documenting the original client request, AI scope analysis,
                cost estimate, and client approval with IP and timestamp. Download one per approved request.
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
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">
                        {req.raw_email_subject || req.raw_email_body?.slice(0, 60)}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-muted-foreground">
                          Approved {new Date(req.approved_at).toLocaleDateString()}
                        </span>
                        {req.cost_min && req.cost_max && (
                          <span className="text-xs text-primary">
                            ${req.cost_min.toLocaleString()}–${req.cost_max.toLocaleString()}
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
                      render={<a href={`/api/requests/${req.id}/proof`} download />}
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function GitHubEventRow({ event }: { event: any }) {
  const typeMap: Record<string, { label: string; color: string; icon: string }> = {
    pr_merged: { label: 'PR Merged', color: 'text-violet-400', icon: '⎇' },
    issue_closed: { label: 'Issue Closed', color: 'text-emerald-400', icon: '✓' },
    issue_updated: { label: 'Issue Updated', color: 'text-blue-400', icon: '☑' },
    push: { label: 'Push', color: 'text-blue-400', icon: '↑' },
    deployment: { label: 'Deployed', color: 'text-primary', icon: '⚡' },
  }
  const meta = typeMap[event.event_type as string] ?? { label: event.event_type, color: 'text-muted-foreground', icon: '·' }
  const ghData = event.github_data as Record<string, unknown>
  const prUrl = (ghData?.pull_request as Record<string, unknown>)?.html_url as string | undefined
  const issueUrl = (ghData?.issue as Record<string, unknown>)?.html_url as string | undefined
  const externalUrl = prUrl ?? issueUrl

  return (
    <Card className={cn("border-l-[3px]", event.is_unapproved_work && "border-destructive")}>
      <CardContent>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className={meta.color}>
                {meta.icon} {meta.label}
              </Badge>
              {event.is_unapproved_work && (
                <Badge variant="destructive">
                  ⚠ Unapproved work detected
                </Badge>
              )}
            </div>
            {event.plain_english_summary ? (
              <p className="text-sm leading-5">{event.plain_english_summary as string}</p>
            ) : (
              <p className="text-xs text-muted-foreground">
                {(ghData?.pull_request as Record<string, unknown>)?.title as string
                  ?? (ghData?.head_commit as Record<string, unknown>)?.message as string
                  ?? 'No description'}
              </p>
            )}
            <p className="text-xs mt-1 text-muted-foreground/50">
              {new Date(event.created_at as string).toLocaleString()}
            </p>
          </div>
          {externalUrl && (
            <a
              href={externalUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-blue-400 hover:underline flex-shrink-0"
            >
              View →
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
