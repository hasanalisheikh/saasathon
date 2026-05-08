import Link from "next/link"
import { cn } from "@workspace/ui/lib/utils"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { MetricCard } from "@workspace/ui/components/metric-card"
import {
  ClassificationBadge,
  getClassificationColorClass,
} from "@workspace/ui/components/status-badge"
import {
  EmptyState,
  EmptyStateTitle,
} from "@workspace/ui/components/empty-state"
import { PageHeader, PageTitle, PageDescription } from "@workspace/ui/components/page-header"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch pending requests across all projects
  const { data: pendingRequests } = await supabase
    .from("requests")
    .select("*, project:projects(id, name, client_name)")
    .eq("projects.user_id", user!.id)
    .eq("status", "pending_review")
    .order("created_at", { ascending: false })
    .limit(20)

  // Metrics
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const { data: monthRequests } = await supabase
    .from("requests")
    .select("classification, cost_min, cost_max, status")
    .gte("created_at", startOfMonth)

  const requestsThisMonth = monthRequests?.length ?? 0
  const outOfScopeCaught = monthRequests?.filter((r) => r.classification === "out_of_scope").length ?? 0
  const unbilledProtected = monthRequests
    ?.filter((r) => r.status === "approved" && r.classification === "out_of_scope")
    .reduce((sum, r) => sum + ((r.cost_min + r.cost_max) / 2 || 0), 0) ?? 0

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-8">
      <PageHeader>
        <div>
          <PageTitle>Dashboard</PageTitle>
          <PageDescription>
            General analytics, additional requests, potential jobs, and overall scope metrics.
          </PageDescription>
        </div>
      </PageHeader>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-4">
        <MetricCard label="Requests This Month" value={String(requestsThisMonth)} />
        <MetricCard label="Out-of-Scope Caught" value={String(outOfScopeCaught)} accent="red" />
        <MetricCard
          label="Unbilled Work Protected"
          value={`$${Math.round(unbilledProtected).toLocaleString()}`}
          accent="amber"
          large
        />
      </div>

      {/* Inbox */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-sm font-medium">Needs Review</h2>
          {(pendingRequests?.length ?? 0) > 0 && (
            <Badge variant="outline" className="bg-primary/15 text-primary border-primary/30">
              {pendingRequests!.length}
            </Badge>
          )}
        </div>

        {!pendingRequests?.length ? (
          <EmptyState>
            <EmptyStateTitle>No new requests. Your inbox is clear.</EmptyStateTitle>
          </EmptyState>
        ) : (
          <div className="space-y-2">
            {pendingRequests.map((req) => (
              <RequestCard key={req.id} request={req} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function RequestCard({ request }: { request: any }) {
  const classification = request.classification as string
  const colorClass = getClassificationColorClass(classification)

  return (
    <Link
      href={`/projects/${(request.project as Record<string, string>)?.id}/requests/${request.id as string}`}
      className="block"
    >
      <Card
        className={cn("transition-colors hover:ring-foreground/20 border-l-[3px]", colorClass)}
      >
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {(request.project as Record<string, string>)?.client_name}
            </span>
            <span className="text-xs text-muted-foreground">
              {new Date(request.created_at as string).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          <p className="text-sm truncate text-muted-foreground max-w-[480px]">
            {(request.raw_email_subject as string) ||
              (request.raw_email_body as string)?.slice(0, 80)}
          </p>
          <div className="flex items-center gap-2">
            {classification && (
              <ClassificationBadge classification={classification} />
            )}
            {request.cost_min && request.cost_max && (
              <span className="text-xs text-primary">
                ${(request.cost_min as number).toLocaleString()}–$
                {(request.cost_max as number).toLocaleString()}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
