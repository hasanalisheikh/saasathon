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
  slack_channel_id: string | null
  slack_channel_name: string | null
}

export default async function IntegrationsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [projectsResult, profileResult] = await Promise.all([
    supabase
      .from("projects")
      .select("id, name, client_name, inbound_email, github_repo_name, github_installation_id, slack_channel_id, slack_channel_name")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false })
      .returns<ProjectIntegration[]>(),
    supabase
      .from("profiles")
      .select("slack_team_name")
      .eq("id", user!.id)
      .single(),
  ])

  return (
    <IntegrationsPageClient
      envChecks={getEnvChecks()}
      projects={projectsResult.data ?? []}
      slackWorkspaceName={profileResult.data?.slack_team_name ?? null}
    />
  )
}
