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
import { Card, CardContent } from "@workspace/ui/components/card"
import { PageDescription, PageHeader, PageTitle } from "@workspace/ui/components/page-header"

type ProjectIntegration = {
  id: string
  name: string
  client_name: string
  inbound_email: string | null
  github_repo_name: string | null
  github_installation_id: string | null
  widget_token: string | null
}

type ProfileIntegration = {
  github_username: string | null
}

const envChecks = [
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
  const linkedRepos = projectList.filter((project) => project.github_repo_name)
  const hasGithubConnection = Boolean(profile?.github_username || projectList.some((project) => project.github_installation_id))
  const inboundReadyCount = projectList.filter((project) => project.inbound_email).length
  const widgetReadyCount = projectList.filter((project) => project.widget_token).length
  const readyServiceCount = envChecks.filter((check) => check.value).length

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <PageHeader>
        <div>
          <PageTitle>Integrations</PageTitle>
          <PageDescription>
            Connect the channels that turn client requests into approved, trackable work.
          </PageDescription>
        </div>
      </PageHeader>

      <div className="grid gap-4 xl:grid-cols-2">
        <IntegrationCard
          icon={<GitBranchIcon />}
          title="GitHub"
          description="Create approved scope-change issues and track implementation activity."
          ready={hasGithubConnection}
          meta={hasGithubConnection ? `${linkedRepos.length} linked project${linkedRepos.length === 1 ? "" : "s"}` : "Not connected"}
          action={(
            <Button variant={hasGithubConnection ? "outline" : "default"} size="sm" render={<a href="/api/github/connect" />} nativeButton={false}>
              {hasGithubConnection ? "Reconnect" : "Connect"}
            </Button>
          )}
        >
          {!projectList.length ? (
            <EmptyRow label="Create a project to link a repository." />
          ) : (
            <div className="space-y-2">
              {projectList.map((project) => (
                <ProjectIntegrationRow
                  key={project.id}
                  project={project}
                  value={project.github_repo_name ?? "No repository linked"}
                  ready={Boolean(project.github_repo_name)}
                  actionLabel={project.github_repo_name ? "Change" : "Link repo"}
                  actionHref={project.github_installation_id ? `/projects/${project.id}/github-setup` : `/api/github/connect?state=${project.id}`}
                />
              ))}
            </div>
          )}
        </IntegrationCard>

        <IntegrationCard
          icon={<MailIcon />}
          title="Inbound email"
          description="Forward or BCC client emails into each project inbox for AI scope review."
          ready={inboundReadyCount > 0}
          meta={`${inboundReadyCount}/${projectList.length} projects ready`}
        >
          {!projectList.length ? (
            <EmptyRow label="Create a project to generate an inbound address." />
          ) : (
            <div className="space-y-2">
              {projectList.map((project) => (
                <ProjectIntegrationRow
                  key={project.id}
                  project={project}
                  value={project.inbound_email ?? "No inbound address"}
                  ready={Boolean(project.inbound_email)}
                  actionLabel="Open"
                  actionHref={`/projects/${project.id}`}
                />
              ))}
            </div>
          )}
        </IntegrationCard>

        <IntegrationCard
          icon={<Code2Icon />}
          title="Website widget"
          description="Collect visual client comments and convert them into scope review requests."
          ready={widgetReadyCount > 0}
          meta={`${widgetReadyCount}/${projectList.length} embed tokens ready`}
          action={(
            <Button variant="outline" size="sm" render={<Link href="/settings" />} nativeButton={false}>
              Snippets
            </Button>
          )}
        >
          {!projectList.length ? (
            <EmptyRow label="Create a project to get a widget snippet." />
          ) : (
            <div className="space-y-2">
              {projectList.map((project) => (
                <ProjectIntegrationRow
                  key={project.id}
                  project={project}
                  value={project.widget_token ? "Embed token available" : "No widget token"}
                  ready={Boolean(project.widget_token)}
                  actionLabel="Open"
                  actionHref={`/projects/${project.id}?tab=widget`}
                />
              ))}
            </div>
          )}
        </IntegrationCard>

        <IntegrationCard
          icon={<BotIcon />}
          title="AI and delivery services"
          description="Runtime checks for the services used during the demo flow."
          ready={readyServiceCount === envChecks.length}
          meta={`${readyServiceCount}/${envChecks.length} configured`}
        >
          <div className="grid gap-2 sm:grid-cols-2">
            {envChecks.map((check) => (
              <div
                key={check.label}
                className="flex items-center justify-between rounded-md border border-border bg-input/10 px-3 py-2"
              >
                <span className="text-xs">{check.label}</span>
                <StatusPill ready={check.value} />
              </div>
            ))}
          </div>
        </IntegrationCard>
      </div>
    </div>
  )
}

function IntegrationCard({
  icon,
  title,
  description,
  ready,
  meta,
  action,
  children,
}: {
  icon: React.ReactNode
  title: string
  description: string
  ready: boolean
  meta: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <Card className={cn("min-h-[280px]", ready ? "border-primary/20" : "border-border")}>
      <CardContent className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 gap-3">
            <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-md", ready ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>
              {icon}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm font-medium">{title}</h2>
                <StatusPill ready={ready} />
              </div>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>
            </div>
          </div>
          {action}
        </div>
        <div className="flex items-center justify-between border-y border-border py-2">
          <span className="text-xs text-muted-foreground">Status</span>
          <span className="text-xs">{meta}</span>
        </div>
        {children}
      </CardContent>
    </Card>
  )
}

function ProjectIntegrationRow({
  project,
  value,
  ready,
  actionLabel,
  actionHref,
}: {
  project: ProjectIntegration
  value: string
  ready: boolean
  actionLabel: string
  actionHref: string
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-input/10 px-3 py-2">
      <div className="min-w-0">
        <p className="truncate text-xs font-medium">{project.name}</p>
        <p className="truncate text-xs text-muted-foreground">{project.client_name} · {value}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <StatusPill ready={ready} compact />
        <Button variant="ghost" size="sm" render={<Link href={actionHref} />} nativeButton={false}>
          {actionLabel}
        </Button>
      </div>
    </div>
  )
}

function StatusPill({ ready, compact = false }: { ready: boolean; compact?: boolean }) {
  return (
    <Badge variant={ready ? "default" : "outline"} className={compact ? "px-1.5" : undefined}>
      {ready ? <CheckCircle2Icon /> : <TriangleAlertIcon />}
      {compact ? null : ready ? "Ready" : "Needs setup"}
    </Badge>
  )
}

function EmptyRow({ label }: { label: string }) {
  return (
    <div className="rounded-md border border-dashed border-border px-3 py-6 text-center text-xs text-muted-foreground">
      {label}
    </div>
  )
}
