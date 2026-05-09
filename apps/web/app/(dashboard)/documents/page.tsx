import { createClient } from "@/lib/supabase/server"
import { DocumentsClient, type DocumentWithProject } from "./documents-client"

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
      .select("id, user_id, project_id, title, description, tags, document_type, file_name, file_size, extraction_status, extraction_error, created_at, updated_at, project:projects(id, name, client_name)")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false })
      .returns<DocumentWithProject[]>(),
    supabase
      .from("projects")
      .select("id, name, client_name")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false }),
  ])

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <DocumentsClient
        initialDocuments={documents ?? []}
        projects={projects ?? []}
        initialProjectId={project_id ?? "all"}
      />
    </div>
  )
}
