import React from "react"
import Link from "next/link"
import {
  BotIcon,
  CheckCircle2Icon,
  Code2Icon,
  GitBranchIcon,
  MailIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { cn } from "@workspace/ui/lib/utils"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card"
import { Icon } from "@iconify/react"
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
}

export type EnvCheck = {
  label: string
  value: boolean
}

const envChecks: EnvCheck[] = [
  { label: "OpenRouter Gemini analysis", value: Boolean(process.env.OPENROUTER_API_KEY) || process.env.MOCK_AI === "true" },
  { label: "Client email", value: Boolean(process.env.RESEND_API_KEY) },
  { label: "GitHub webhooks", value: Boolean(process.env.GITHUB_WEBHOOK_SECRET) },
  { label: "Inbound email", value: Boolean(process.env.POSTMARK_INBOUND_WEBHOOK_TOKEN) || Boolean(process.env.POSTMARK_SERVER_TOKEN) },
]

export default async function IntegrationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: profile }, { data: projects }] = await Promise.all([
    supabase
      .from("profiles")
      .select("github_username")
      .eq("id", user!.id)
      .single<ProfileIntegration>(),
    supabase
      .from("projects")
      .select("id, name, client_name, inbound_email, github_repo_name, github_installation_id, widget_token")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false })
      .returns<ProjectIntegration[]>(),
  ])

  const projectList = projects ?? []

  // Enable demo mode by default for testing the UI
  const isDemoMode = true

  return (
    <IntegrationsPageClient 
      projects={projectList}
      profile={profile}
      envChecks={envChecks}
      isDemoMode={isDemoMode}
    />
  )
}
