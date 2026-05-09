import { createClient } from "@/lib/supabase/server"
import { PageHeader, PageTitle, PageDescription } from "@workspace/ui/components/page-header"
import { DashboardMetrics } from "./components/dashboard-metrics"
import { DashboardAnalytics } from "./components/dashboard-analytics"
import { InboxFeed } from "./components/inbox-feed"
import { PendingFeed } from "./components/pending-feed"
import { Button } from "@workspace/ui/components/button"
import { PlusCircle } from "lucide-react"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch unreviewed requests
  const { data: pendingRequests } = await supabase
    .from("requests")
    .select("*, project:projects!inner(id, name, client_name, user_id)")
    .eq("projects.user_id", user!.id)
    .eq("status", "pending_review")
    .order("created_at", { ascending: false })
    .limit(20)

  // Fetch pending client approvals
  const { data: pendingApprovals } = await supabase
    .from("requests")
    .select("*, project:projects!inner(id, name, client_name, user_id)")
    .eq("projects.user_id", user!.id)
    .eq("status", "sent_to_client")
    .order("updated_at", { ascending: false })
    .limit(10)

  // Fetch all requests for analytics and metrics
  const { data: allRequests } = await supabase
    .from("requests")
    .select("classification, cost_min, cost_max, status, created_at, project:projects!inner(user_id)")
    .eq("projects.user_id", user!.id)

  const requestsArray = allRequests || []

  // Month Metrics
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime()
  
  const monthRequests = requestsArray.filter(r => new Date(r.created_at).getTime() >= startOfMonth)
  const requestsThisMonth = monthRequests.length
  const outOfScopeCaught = monthRequests.filter((r) => r.classification === "out_of_scope").length
  const unbilledProtected = monthRequests
    .filter((r) => r.status === "approved" && r.classification === "out_of_scope")
    .reduce((sum, r) => sum + ((r.cost_min + r.cost_max) / 2 || 0), 0)

  // Analytics Data
  let inScope = 0
  let outOfScope = 0
  let ambiguous = 0
  let approvedOutOfScope = 0

  requestsArray.forEach(r => {
    if (r.classification === "in_scope") inScope++
    if (r.classification === "out_of_scope") {
      outOfScope++
      if (r.status === "approved") approvedOutOfScope++
    }
    if (r.classification === "ambiguous") ambiguous++
  })

  const classificationData = [
    { name: "In Scope", value: inScope, fill: "hsl(var(--chart-1))" },
    { name: "Out of Scope", value: outOfScope, fill: "hsl(var(--chart-2))" },
    { name: "Ambiguous", value: ambiguous, fill: "hsl(var(--chart-3))" },
  ].filter(d => d.value > 0) // only show slices with data

  const conversionRate = outOfScope > 0 ? Math.round((approvedOutOfScope / outOfScope) * 100) : 0

  return (
    <div className="flex flex-col flex-1 h-full overflow-y-auto">
      <div className="flex-none p-6 pb-2">
        <PageHeader>
          <div className="flex items-start justify-between w-full">
            <div>
              <PageTitle>Dashboard</PageTitle>
              <PageDescription>
                Your financial protection hub and collective inbox.
              </PageDescription>
            </div>
            <Button size="sm" className="gap-2">
              <PlusCircle className="w-4 h-4" />
              Capture Request
            </Button>
          </div>
        </PageHeader>
        
        <DashboardMetrics 
          requestsThisMonth={requestsThisMonth}
          outOfScopeCaught={outOfScopeCaught}
          unbilledProtected={unbilledProtected}
        />

        <DashboardAnalytics 
          classificationData={classificationData}
          conversionRate={conversionRate}
          totalRequests={requestsArray.length}
        />
      </div>

      <div className="flex-none px-6 pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[500px]">
          {/* Collective Inbox (Takes 2/3 width on large screens) */}
          <div className="lg:col-span-2 h-full border border-border/40 rounded-xl p-5 bg-background/50 shadow-sm flex flex-col">
            <InboxFeed requests={pendingRequests || []} />
          </div>

          {/* Pending Approvals (Takes 1/3 width) */}
          <div className="h-full border border-border/40 rounded-xl p-5 bg-background/50 shadow-sm flex flex-col">
            <PendingFeed requests={pendingApprovals || []} />
          </div>
        </div>
      </div>
    </div>
  )
}
