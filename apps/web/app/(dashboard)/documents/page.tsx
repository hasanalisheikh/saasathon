import { createClient } from "@/lib/supabase/server"
import { PageHeader, PageTitle, PageDescription, PageActions } from "@workspace/ui/components/page-header"
import { DocumentsClient } from "./documents-client"

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ project_id?: string }>
}) {
  const { project_id } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: documents }, { data: projects }] = await Promise.all([
    supabase
      .from("documents")
      .select("*, project:projects(id, name, client_name)")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("projects")
      .select("id, name, client_name")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false }),
  ])

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <PageHeader>
        <div>
          <PageTitle>Documents</PageTitle>
          <PageDescription>
            Contracts, proposals, briefs, and rate cards used as context for scope analysis.
          </PageDescription>
        </div>
        <PageActions>
          <span className="text-xs text-muted-foreground">
            {(documents ?? []).length} total
          </span>
        </PageActions>
      </PageHeader>

      <DocumentsClient
        initialDocuments={documents ?? []}
        projects={projects ?? []}
        initialProjectId={project_id ?? "all"}
      />
    </div>
  )
}
