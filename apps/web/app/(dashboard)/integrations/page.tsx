import { getEnvChecks, type EnvCheck } from "@/lib/integrations"
import { createClient } from "@/lib/supabase/server"
import { IntegrationsPageClient } from "./integrations-client"

export type { EnvCheck }

export type ProjectIntegration = {
  id: string
  name: string
  client_name: string
  inbound_email: string | null
  github_repo_name: string | null
  github_installation_id: string | null
  widget_token: string | null
}

export default async function IntegrationsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, client_name, inbound_email, github_repo_name, github_installation_id, widget_token")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .returns<ProjectIntegration[]>()

  return (
    <IntegrationsPageClient
      envChecks={getEnvChecks()}
      projects={projects ?? []}
    />
  )
}
