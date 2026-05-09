import { createClient } from "@/lib/supabase/server"
import type { RequestStatus } from "@/types"
import {
  HistoryClient,
  type HistoryProject,
  type HistoryRequest,
} from "./history-client"

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{
    project?: string
    project_id?: string
    status?: string
  }>
}) {
  const { project, project_id, status } = await searchParams
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [{ data: requests }, { data: projects }] = await Promise.all([
    supabase
      .from("requests")
      .select(
        "id, project_id, raw_email_subject, raw_email_body, raw_email_from, classification, status, timeline_impact_days, approved_at, declined_at, created_at, updated_at, project:projects(id, name, client_name)"
      )
      .order("created_at", { ascending: false })
      .returns<HistoryRequest[]>(),
    supabase
      .from("projects")
      .select("id, name, client_name")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false })
      .returns<HistoryProject[]>(),
  ])

  const projectIds = new Set((projects ?? []).map((item) => item.id))
  const ownedRequests = (requests ?? []).filter((request) =>
    projectIds.has(request.project_id)
  )
  const initialStatus = isRequestStatus(status) ? status : "all"

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <HistoryClient
        initialProjectId={project_id ?? project ?? "all"}
        initialRequests={ownedRequests}
        initialStatus={initialStatus}
        projects={projects ?? []}
      />
    </div>
  )
}

function isRequestStatus(value: string | undefined): value is RequestStatus {
  return (
    value === "pending_review" ||
    value === "sent_to_client" ||
    value === "approved" ||
    value === "declined" ||
    value === "deferred" ||
    value === "accepted_in_scope"
  )
}
