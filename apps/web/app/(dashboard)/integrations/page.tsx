import { createClient } from "@/lib/supabase/server"
import { IntegrationsPageClient } from "./integrations-client"

export type ProjectIntegration = {
  id: string
  name: string
  client_name: string
  inbound_email: string | null
  github_repo_name: string | null
  github_installation_id: string | null
  widget_token: string | null
}

export type ProfileIntegration = {
  github_username: string | null
  github_connected: boolean
}

export type EnvCheck = {
  label: string
  value: boolean
}

const envChecks: EnvCheck[] = [
  { label: "OpenRouter Gemini analysis", value: Boolean(process.env.OPENROUTER_API_KEY) || process.env.MOCK_AI === "true" },
  { label: "Client email", value: Boolean(process.env.RESEND_API_KEY) },
  { label: "GitHub OAuth", value: Boolean(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) },
  { label: "GitHub webhooks", value: Boolean(process.env.GITHUB_WEBHOOK_SECRET) },
  { label: "Inbound email", value: Boolean(process.env.POSTMARK_INBOUND_WEBHOOK_TOKEN) || Boolean(process.env.POSTMARK_SERVER_TOKEN) },
]

export default async function IntegrationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: profile }, { data: projects }] = await Promise.all([
    supabase
      .from("profiles")
      .select("github_username, github_access_token")
      .eq("id", user!.id)
      .single<{ github_username: string | null; github_access_token: string | null }>(),
    supabase
      .from("projects")
      .select("id, name, client_name, inbound_email, github_repo_name, github_installation_id, widget_token")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false })
      .returns<ProjectIntegration[]>(),
  ])

  const projectList = projects ?? []
  const safeProfile: ProfileIntegration | null = profile
    ? {
        github_username: profile.github_username,
        github_connected: Boolean(profile.github_access_token),
      }
    : null

  return (
    <IntegrationsPageClient
      projects={projectList}
      profile={safeProfile}
      envChecks={envChecks}
    />
  )
}
