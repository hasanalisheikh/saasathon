import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Card } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { ProjectStatusBadge } from "@workspace/ui/components/status-badge"
import {
  EmptyState,
  EmptyStateDescription,
  EmptyStateTitle,
} from "@workspace/ui/components/empty-state"
import { PageHeader, PageTitle, PageDescription } from "@workspace/ui/components/page-header"
import { DashboardMetrics } from "./components/dashboard-metrics"
import { InboxFeed } from "./components/inbox-feed"
import { PendingFeed } from "./components/pending-feed"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"

type DashboardProject = {
  id: string
  name: string
  client_name: string
  status: string
  github_repo_name: string | null
  requests: {
    id: string
    classification: string | null
    status: string
    cost_min: number | null
    cost_max: number | null
  }[]
}

type DashboardRequest = {
  id: string
  raw_email_subject: string | null
  raw_email_body: string | null
  classification: string | null
  cost_min: number | null
  cost_max: number | null
  source: string | null
  analysis_status: string | null
  status: string
  risk_level: string | null
  created_at: string
  updated_at: string
  project: {
    id: string
    name: string
    client_name: string
  } | null
}

const projectsTableClassName = "min-w-[900px] table-fixed text-sm"
const projectsTableHeadClassName = "h-9 px-3 text-sm/5 font-normal text-muted-foreground"

function ProjectsTableColumnGroup() {
  return (
    <colgroup>
      <col className="w-64" />
      <col className="w-52" />
      <col className="w-32" />
      <col className="w-24" />
      <col className="w-32" />
      <col className="w-[28%]" />
    </colgroup>
  )
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const [
    { data: inboxRequests },
    { data: pendingApprovalRequests },
    { data: monthRequests },
    { count: approvedDecisionCount },
    { count: totalDecisionCount },
    { data: projects },
  ] = await Promise.all([
    supabase
      .from("requests")
      .select("id, raw_email_subject, raw_email_body, classification, cost_min, cost_max, source, analysis_status, status, risk_level, created_at, updated_at, project:projects!inner(id, name, client_name)")
      .eq("project.user_id", user!.id)
      .eq("status", "pending_review")
      .order("created_at", { ascending: false })
      .limit(20)
      .returns<DashboardRequest[]>(),
    supabase
      .from("requests")
      .select("id, raw_email_subject, raw_email_body, classification, cost_min, cost_max, source, analysis_status, status, risk_level, created_at, updated_at, project:projects!inner(id, name, client_name)")
      .eq("project.user_id", user!.id)
      .eq("status", "sent_to_client")
      .order("updated_at", { ascending: false })
      .limit(20)
      .returns<DashboardRequest[]>(),
    supabase
      .from("requests")
      .select("classification, cost_min, cost_max, status, projects!inner(user_id)")
      .eq("projects.user_id", user!.id)
      .gte("created_at", startOfMonth),
    supabase
      .from("requests")
      .select("id, projects!inner(user_id)", { count: "exact", head: true })
      .eq("projects.user_id", user!.id)
      .eq("classification", "out_of_scope")
      .eq("status", "approved"),
    supabase
      .from("requests")
      .select("id, projects!inner(user_id)", { count: "exact", head: true })
      .eq("projects.user_id", user!.id)
      .eq("classification", "out_of_scope")
      .in("status", ["approved", "declined"]),
    supabase
      .from("projects")
      .select("id, name, client_name, status, github_repo_name, requests(id, classification, status, cost_min, cost_max)")
      .eq("user_id", user!.id)
      .in("requests.status", ["pending_review", "sent_to_client", "approved"])
      .order("updated_at", { ascending: false })
      .limit(20)
      .returns<DashboardProject[]>(),
  ])

  const requestsThisMonth = monthRequests?.length ?? 0
  const protectedThisMonth = monthRequests
    ?.filter((r) => r.status === "approved" && r.classification === "out_of_scope")
    .reduce((sum, r) => sum + (((r.cost_min ?? 0) + (r.cost_max ?? 0)) / 2), 0) ?? 0
  const quoteValues = monthRequests
    ?.filter((r) => r.classification === "out_of_scope" && r.cost_min !== null && r.cost_max !== null)
    .map((r) => ((r.cost_min ?? 0) + (r.cost_max ?? 0)) / 2) ?? []
  const averageQuoteValue =
    quoteValues.length > 0
      ? quoteValues.reduce((sum, value) => sum + value, 0) / quoteValues.length
      : 0
  const approvalRate =
    totalDecisionCount ? Math.round(((approvedDecisionCount ?? 0) / totalDecisionCount) * 100) : null

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="mx-auto max-w-[1280px] space-y-6">
        <PageHeader>
          <div>
            <PageTitle>Dashboard</PageTitle>
            <PageDescription>
              Track incoming client requests, approvals, and protected scope.
            </PageDescription>
          </div>
        </PageHeader>

        <DashboardMetrics
          requestsThisMonth={requestsThisMonth}
          protectedThisMonth={protectedThisMonth}
          approvalRate={approvalRate}
          averageQuoteValue={averageQuoteValue}
        />

        <InboxFeed requests={inboxRequests ?? []} />
        <PendingFeed requests={pendingApprovalRequests ?? []} />
        <ProjectsAtGlance projects={projects ?? []} />
      </div>
    </div>
  )
}

function ProjectsAtGlance({ projects }: { projects: DashboardProject[] }) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Projects at a Glance</h2>
        {projects.length > 0 ? (
          <Badge variant="outline" className="text-muted-foreground">
            {projects.length}
          </Badge>
        ) : null}
      </div>

      {!projects.length ? (
        <Card className="border-dashed bg-muted/20">
          <EmptyState>
            <EmptyStateTitle>No active projects yet.</EmptyStateTitle>
            <EmptyStateDescription>
              Create a project to start tracking requests and protected scope.
            </EmptyStateDescription>
          </EmptyState>
        </Card>
      ) : (
        <div className="overflow-hidden rounded-md border border-border/60 bg-muted/15">
          <div className="max-h-[336px] overflow-y-auto">
            <Table className={projectsTableClassName}>
              <ProjectsTableColumnGroup />
              <TableHeader>
                <TableRow className="border-border/60 bg-muted/30 hover:bg-muted/30">
                  <TableHead className={`${projectsTableHeadClassName} px-4`}>
                    Project
                  </TableHead>
                  <TableHead className={projectsTableHeadClassName}>
                    Client
                  </TableHead>
                  <TableHead className={projectsTableHeadClassName}>
                    Status
                  </TableHead>
                  <TableHead className={projectsTableHeadClassName}>
                    Active
                  </TableHead>
                  <TableHead className={projectsTableHeadClassName}>
                    Protected
                  </TableHead>
                  <TableHead className={projectsTableHeadClassName}>
                    Repository
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project) => (
                  <ProjectRow key={project.id} project={project} />
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </section>
  )
}

function ProjectRow({ project }: { project: DashboardProject }) {
  const activeRequests = project.requests.filter(
    (request) => request.status === "pending_review" || request.status === "sent_to_client"
  ).length
  const protectedTotal = project.requests
    .filter((request) => request.status === "approved" && request.classification === "out_of_scope")
    .reduce((sum, request) => sum + (((request.cost_min ?? 0) + (request.cost_max ?? 0)) / 2), 0)

  return (
    <TableRow className="border-border/50 bg-muted/20 hover:bg-muted/30">
      <TableCell className="px-4 py-2.5">
        <Link
          href={`/projects/${project.id}`}
          className="block max-w-56 truncate text-sm/5 font-medium text-foreground transition-colors hover:text-primary"
        >
          {project.name}
        </Link>
      </TableCell>
      <TableCell className="px-3 py-2.5">
        <span className="block max-w-44 truncate text-sm/5 text-muted-foreground">
          {project.client_name}
        </span>
      </TableCell>
      <TableCell className="px-3 py-2.5">
        <ProjectStatusBadge status={project.status} />
      </TableCell>
      <TableCell className="px-3 py-2.5">
        <span className="text-sm/5 text-foreground">{activeRequests}</span>
      </TableCell>
      <TableCell className="px-3 py-2.5">
        <span className="whitespace-nowrap text-sm/5 font-medium text-foreground">
          ${Math.round(protectedTotal).toLocaleString()}
        </span>
      </TableCell>
      <TableCell className="px-3 py-2.5">
        <span className="block max-w-56 truncate text-sm/5 text-muted-foreground">
          {project.github_repo_name ?? "Not connected"}
        </span>
      </TableCell>
    </TableRow>
  )
}
