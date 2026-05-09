"use client"

import Link from "next/link"
import React, { useCallback, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Icon } from "@iconify/react"
import { BlocksIcon, CheckCircle2Icon, MoreHorizontal, TriangleAlertIcon } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
import { PageDescription, PageHeader, PageTitle } from "@workspace/ui/components/page-header"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Badge } from "@workspace/ui/components/badge"
import { GitHubRepoLinker } from "@/components/github/github-repo-linker"
import { buildGitHubConnectPath, getGitHubStatusMessage } from "@/lib/github-connect"
import type { EnvCheck, ProfileIntegration, ProjectIntegration } from "./page"

type CatalogueItem = {
  colorClass?: string
  comingSoon?: boolean
  connected?: boolean
  connectHref?: string
  description: string
  disabled?: boolean
  icon: string | React.ElementType
  onConnect?: () => void
  title: string
}

const projectTrackingItems: CatalogueItem[] = [
  {
    icon: "logos:gitlab",
    title: "GitLab",
    description: "Link GitLab projects for automated merge request tracking.",
    comingSoon: true,
  },
  {
    icon: "logos:jira",
    title: "Jira",
    description: "Sync Monad requests directly into Jira epics and issues.",
    comingSoon: true,
  },
  {
    icon: "logos:trello",
    title: "Trello",
    description: "Automatically create Trello cards when a client scope is approved.",
    comingSoon: true,
  },
  {
    icon: "logos:linear-icon",
    title: "Linear",
    description: "Streamline scope tracking with modern software development workflows.",
    comingSoon: true,
  },
  {
    icon: "logos:asana-icon",
    title: "Asana",
    description: "Turn approved project scopes into actionable Asana tasks.",
    comingSoon: true,
  },
  {
    icon: "logos:notion-icon",
    title: "Notion",
    description: "Embed approved scopes and proof packs into your Notion workspace.",
    comingSoon: true,
  },
]

const clientChannelItems: CatalogueItem[] = [
  {
    icon: "lucide:mail",
    title: "Email",
    description: "Forward client emails to automatically create and track scope requests.",
  },
  {
    icon: "logos:slack-icon",
    title: "Slack",
    description: "Allow clients to submit scope requests directly from shared Slack channels.",
    comingSoon: true,
  },
  {
    icon: "logos:discord-icon",
    title: "Discord",
    description: "Sync messages from stakeholders in your Discord servers into project requests.",
    comingSoon: true,
  },
  {
    icon: "logos:microsoft-teams",
    title: "Microsoft Teams",
    description: "Intercept client requests in Teams channels for enterprise-grade tracking.",
    comingSoon: true,
  },
  {
    icon: "logos:telegram",
    title: "Telegram",
    description: "Let clients send you messages via Telegram and track them as structured work.",
    comingSoon: true,
  },
  {
    icon: "logos:whatsapp-icon",
    title: "WhatsApp",
    description: "Link your WhatsApp Business to intercept scope changes from direct messages.",
    comingSoon: true,
  },
  {
    icon: "skill-icons:instagram",
    title: "Instagram",
    description: "Turn Instagram DMs from prospects into formal project scopes instantly.",
    comingSoon: true,
  },
  {
    icon: "simple-icons:x",
    title: "X (Twitter)",
    description: "Transform inbound Twitter DMs from potential clients into project leads.",
    colorClass: "text-zinc-900 dark:text-white",
    comingSoon: true,
  },
  {
    icon: "logos:linkedin-icon",
    title: "LinkedIn",
    description: "Sync LinkedIn messages directly into your freelance work pipeline.",
    comingSoon: true,
  },
  {
    icon: "logos:upwork",
    title: "Upwork",
    description: "Bridge your Upwork messages directly into Monad requests.",
    comingSoon: true,
  },
  {
    icon: "simple-icons:fiverr",
    title: "Fiverr",
    description: "Sync Fiverr inbox messages to keep freelance requests in one dashboard.",
    colorClass: "text-[#00B22D]",
    comingSoon: true,
  },
  {
    icon: "logos:intercom-icon",
    title: "Intercom",
    description: "Turn customer support chats into actionable development requests.",
    comingSoon: true,
  },
]

const integrationTabs = [
  { value: "connected", label: "Connected", icon: CheckCircle2Icon },
  { value: "browse", label: "All Integrations", icon: BlocksIcon },
] as const

type IntegrationTab = (typeof integrationTabs)[number]["value"]

function CatalogueCard({
  colorClass = "",
  comingSoon = false,
  connected = false,
  connectHref,
  description,
  disabled = false,
  icon,
  onConnect,
  title,
}: CatalogueItem) {
  return (
    <Card className="group relative flex flex-col border-border/80 bg-muted/40 transition-colors hover:border-primary/30">
      <DropdownMenu>
        <DropdownMenuTrigger className="absolute right-4 top-4 cursor-pointer rounded-md p-1.5 text-muted-foreground opacity-0 outline-none transition-colors hover:bg-muted hover:text-foreground group-hover:opacity-100">
          <MoreHorizontal className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            {connected ? (
              <>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>View Documentation</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive">Disconnect</DropdownMenuItem>
              </>
            ) : (
              <>
                <DropdownMenuItem>View Documentation</DropdownMenuItem>
                <DropdownMenuItem>Contact Support</DropdownMenuItem>
              </>
            )}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <CardHeader className="flex-1 pr-12">
        <div className="mb-2 flex items-center gap-3">
          {typeof icon === "string" ? (
            <Icon icon={icon} className={`h-6 w-6 shrink-0 ${colorClass}`} />
          ) : (
            React.createElement(icon, { className: `h-6 w-6 shrink-0 ${colorClass}` })
          )}
          <CardTitle className="text-base">{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardFooter>
        {comingSoon ? (
          <Button variant="ghost" className="w-full border border-border/80" disabled>
            Coming Soon
          </Button>
        ) : onConnect ? (
          <Button
            variant={connected ? "secondary" : "ghost"}
            className="w-full border border-border/80"
            disabled={disabled}
            onClick={onConnect}
          >
            {connected ? "Connected" : "Connect"}
          </Button>
        ) : connectHref ? (
          <Button
            variant={connected ? "secondary" : "ghost"}
            className="w-full border border-border/80"
            disabled={disabled}
            render={<Link href={connectHref} />}
            nativeButton={false}
          >
            {connected ? "Connected" : "Connect"}
          </Button>
        ) : (
          <Button
            variant={connected ? "secondary" : "ghost"}
            className="w-full border border-border/80"
            disabled={disabled}
          >
            {connected ? "Connected" : "Connect"}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

function EnvironmentChecks({ envChecks }: { envChecks: EnvCheck[] }) {
  const failingChecks = envChecks.filter((check) => !check.value)

  return (
    <div className="mb-6 space-y-3">
      {failingChecks.length > 0 && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-sm text-amber-700">
          <TriangleAlertIcon className="mt-0.5 size-4 shrink-0" />
          <p>
            Some integrations are unavailable until their environment variables are configured.
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {envChecks.map((check) => (
          <Badge
            key={check.label}
            variant="secondary"
            className={
              check.value
                ? "border border-emerald-500/20 bg-emerald-500/5 text-emerald-700"
                : "border border-amber-500/20 bg-amber-500/5 text-amber-700"
            }
          >
            {check.value ? "Ready" : "Needs setup"} · {check.label}
          </Badge>
        ))}
      </div>
    </div>
  )
}

function GitHubProjectPickerDialog({
  onOpenChange,
  onSelectProject,
  open,
  projects,
}: {
  onOpenChange: (open: boolean) => void
  onSelectProject: (project: ProjectIntegration) => void
  open: boolean
  projects: ProjectIntegration[]
}) {
  const [query, setQuery] = useState("")

  const filteredProjects = useMemo(
    () =>
      projects.filter((project) =>
        `${project.name} ${project.client_name}`.toLowerCase().includes(query.toLowerCase())
      ),
    [projects, query]
  )

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          setQuery("")
        }
        onOpenChange(nextOpen)
      }}
    >
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Choose a project</DialogTitle>
          <DialogDescription>
            Select which project should receive the GitHub repository connection.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-2">
          <Input
            placeholder="Search projects..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />

          <div className="max-h-[320px] space-y-2 overflow-y-auto">
            {filteredProjects.length === 0 ? (
              <div className="rounded-md border border-dashed border-border px-3 py-8 text-center text-sm text-muted-foreground">
                No projects found.
              </div>
            ) : (
              filteredProjects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => onSelectProject(project)}
                  className="flex w-full items-center justify-between rounded-md border border-border px-3 py-3 text-left transition-colors hover:bg-muted/50"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{project.name}</p>
                    <p className="truncate text-sm text-muted-foreground">{project.client_name}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {project.github_repo_name ? "Change repo" : "Choose repo"}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function GitHubRepoDialog({
  githubConnected,
  githubOauthReady,
  onLinked,
  onOpenChange,
  open,
  project,
}: {
  githubConnected: boolean
  githubOauthReady: boolean
  onLinked: () => void
  onOpenChange: (open: boolean) => void
  open: boolean
  project: ProjectIntegration | null
}) {
  if (!project) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle>Connect GitHub Repository</DialogTitle>
          <DialogDescription>
            Choose the repository Monad should track for {project.name}.
          </DialogDescription>
        </DialogHeader>

        <GitHubRepoLinker
          connectHref={buildGitHubConnectPath({
            projectId: project.id,
            returnTo: `/integrations?connect=github&projectId=${project.id}`,
          })}
          githubOauthReady={githubOauthReady}
          isGithubConnected={githubConnected}
          linkedRepoName={project.github_repo_name}
          onCancel={() => onOpenChange(false)}
          onLinked={onLinked}
          projectId={project.id}
          projectName={project.name}
        />
      </DialogContent>
    </Dialog>
  )
}

function EmailModal({
  onOpenChange,
  open,
  project,
}: {
  onOpenChange: (open: boolean) => void
  open: boolean
  project: ProjectIntegration
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Connect Inbound Email</DialogTitle>
          <DialogDescription>
            Generate an inbound email address for this project to forward scopes to.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="email-input">Forwarding Address</Label>
            <div className="flex gap-2">
              <Input id="email-input" defaultValue={`${project.name.toLowerCase().replace(/\s+/g, '-')}-scopes@inbound.monad.dev`} readOnly />
              <Button variant="secondary" onClick={() => alert("Copied!")}>Copy</Button>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Any email sent to this address will automatically create a scope request in this project.
            </p>
          </div>
          <div className="flex justify-end pt-2">
            <Button onClick={() => { alert("Email connection activated!"); onOpenChange(false) }}>Activate</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function WidgetModal({
  onOpenChange,
  open,
  project,
}: {
  onOpenChange: (open: boolean) => void
  open: boolean
  project: ProjectIntegration
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Embed Website Widget</DialogTitle>
          <DialogDescription>
            Copy and paste this snippet into the <code>&lt;head&gt;</code> of your client&apos;s website to enable visual feedback.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>Embed Code</Label>
            <div className="relative">
              <pre className="overflow-x-auto rounded-md border border-border/50 bg-muted/50 p-4 text-sm font-mono">
                {`<script>\n  window.MONAD_PROJECT_ID = "${project.id}";\n</script>\n<script src="https://monad.dev/widget.js" async></script>`}
              </pre>
              <Button size="sm" variant="secondary" className="absolute right-2 top-2 h-7" onClick={() => alert("Copied snippet!")}>Copy</Button>
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button onClick={() => onOpenChange(false)}>Done</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function SlackModal({
  onOpenChange,
  open,
  project,
}: {
  onOpenChange: (open: boolean) => void
  open: boolean
  project: ProjectIntegration
}) {
  const [selectedChannels, setSelectedChannels] = useState<string[]>([])

  const mockChannels = [
    { name: `#${project.client_name.toLowerCase().replace(/\s+/g, '-')}-project`, type: 'channel' },
    { name: `#general-${project.client_name.toLowerCase().replace(/\s+/g, '')}`, type: 'channel' },
    { name: `@${project.client_name} (Client)`, type: 'user' },
    { name: `@support-team`, type: 'user' },
  ]

  const toggleChannel = (name: string) => {
    setSelectedChannels((prev) =>
      prev.includes(name) ? prev.filter((channel) => channel !== name) : [...prev, name]
    )
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          setSelectedChannels([])
        }
        onOpenChange(nextOpen)
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Connect Slack Channel</DialogTitle>
          <DialogDescription>
            Select Slack channels or DMs to track requests for {project.name}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-3">
            <Input placeholder="Search channels or people..." />
            <div className="max-h-[200px] space-y-2 overflow-y-auto pr-2">
              {mockChannels.map((channel) => {
                const isSelected = selectedChannels.includes(channel.name)
                return (
                  <button
                    key={channel.name}
                    onClick={() => toggleChannel(channel.name)}
                    className={`flex w-full items-center justify-between rounded-md border p-3 text-left transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-ring ${
                      isSelected ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon icon={channel.type === 'channel' ? "lucide:hash" : "lucide:user"} className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-medium leading-none">{channel.name}</p>
                    </div>
                    {isSelected && <Icon icon="lucide:check" className="h-4 w-4 text-primary" />}
                  </button>
                )
              })}
            </div>
          </div>
          <div className="mt-2 flex justify-end border-t border-border/40 pt-2">
            <Button
              disabled={selectedChannels.length === 0}
              onClick={() => {
                alert(`Connected ${selectedChannels.join(", ")} to project!`)
                onOpenChange(false)
              }}
            >
              Connect {selectedChannels.length > 0 ? `(${selectedChannels.length})` : ""}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function ProjectIntegrationCard({
  githubConnected,
  githubOauthReady,
  onConnectGitHub,
  project,
}: {
  githubConnected: boolean
  githubOauthReady: boolean
  onConnectGitHub: (project: ProjectIntegration) => void
  project: ProjectIntegration
}) {
  const [emailModalOpen, setEmailModalOpen] = useState(false)
  const [widgetModalOpen, setWidgetModalOpen] = useState(false)
  const [slackModalOpen, setSlackModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const connected = []

  if (project.github_repo_name || project.github_installation_id) {
    connected.push({
      id: "github",
      icon: "logos:github-icon",
      title: "GitHub",
      label: project.github_repo_name || "GitHub Connected",
      colorClass: "",
    })
  }
  if (project.inbound_email) {
    connected.push({ id: "email", icon: "lucide:mail", title: "Inbound Email", label: project.inbound_email, colorClass: "text-foreground" })
  }
  if (project.widget_token) {
    connected.push({ id: "widget", icon: "lucide:code-2", title: "Widget", label: "Widget Active", colorClass: "text-foreground" })
  }

  return (
    <>
      <Card className="group relative flex flex-col border-border/80 bg-muted/40 transition-colors hover:border-primary/30">
        <CardHeader className="flex-1 pb-0 pr-24">
          <CardTitle className="truncate text-base">{project.name}</CardTitle>
          <CardDescription className="truncate">{project.client_name}</CardDescription>

          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" className="absolute right-4 top-4 text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100" />}>
              <Icon icon="lucide:more-horizontal" className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => setIsEditing(!isEditing)} className="cursor-pointer">
                <Icon icon="lucide:pencil" className="mr-2 h-4 w-4" />
                {isEditing ? "Done Editing" : "Edit Integrations"}
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="cursor-pointer">
                  <Icon icon="lucide:plus" className="mr-2 h-4 w-4" />
                  Add Integration
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem
                    onClick={() => onConnectGitHub(project)}
                    className="flex w-full cursor-pointer items-center"
                    disabled={!githubOauthReady}
                  >
                    <Icon icon="logos:github-icon" className="mr-2 h-4 w-4" />
                    {githubConnected ? "GitHub" : "Connect GitHub"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setEmailModalOpen(true)} className="flex w-full cursor-pointer items-center">
                    <Icon icon="lucide:mail" className="mr-2 h-4 w-4 text-foreground" />
                    Inbound Email
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setWidgetModalOpen(true)} className="flex w-full cursor-pointer items-center">
                    <Icon icon="lucide:code-2" className="mr-2 h-4 w-4 text-foreground" />
                    Website Widget
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSlackModalOpen(true)} className="flex w-full cursor-pointer items-center">
                    <Icon icon="logos:slack-icon" className="mr-2 h-4 w-4" />
                    Slack
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => alert(`Delete project ${project.name}`)} className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive">
                <Icon icon="lucide:trash-2" className="mr-2 h-4 w-4" />
                Delete Project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>

        <CardFooter className="rounded-t-xl border-t border-border/80 pt-3">
          <div className="flex flex-wrap items-center gap-2">
            {connected.length > 0 ? (
              connected.map((connection) => (
                <Badge key={connection.id} variant="secondary" className="flex items-center gap-2 border border-border bg-background px-3 py-2 text-sm font-normal">
                  {typeof connection.icon === "string" ? (
                    <Icon icon={connection.icon} className={`h-10 w-10 shrink-0 ${connection.colorClass || ""}`} />
                  ) : (
                    React.createElement(connection.icon, { className: `h-10 w-10 shrink-0 ${connection.colorClass || ""}` })
                  )}
                  <span className="max-w-[150px] truncate">{connection.label}</span>
                  {isEditing && (
                    <button onClick={() => alert(`Remove ${connection.title} integration`)} className="ml-1.5 text-muted-foreground hover:text-destructive focus:outline-none">
                      <Icon icon="lucide:x" className="h-5 w-5" />
                    </button>
                  )}
                </Badge>
              ))
            ) : (
              <span className="text-sm italic text-muted-foreground/60">No integrations</span>
            )}
          </div>
        </CardFooter>
      </Card>

      <EmailModal open={emailModalOpen} onOpenChange={setEmailModalOpen} project={project} />
      <WidgetModal open={widgetModalOpen} onOpenChange={setWidgetModalOpen} project={project} />
      <SlackModal open={slackModalOpen} onOpenChange={setSlackModalOpen} project={project} />
    </>
  )
}

function ConnectedCardsContent({
  githubConnected,
  githubOauthReady,
  onConnectGitHub,
  projects,
}: {
  githubConnected: boolean
  githubOauthReady: boolean
  onConnectGitHub: (project: ProjectIntegration) => void
  projects: ProjectIntegration[]
}) {
  if (projects.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-border px-3 py-12 text-center">
        <p className="text-sm text-muted-foreground">You don&apos;t have any projects yet.</p>
        <p className="text-sm text-muted-foreground">Projects you create will appear here to manage their integrations.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
      {projects.map((project) => (
        <ProjectIntegrationCard
          key={project.id}
          githubConnected={githubConnected}
          githubOauthReady={githubOauthReady}
          onConnectGitHub={onConnectGitHub}
          project={project}
        />
      ))}
    </div>
  )
}

function BrowseCatalogue({
  githubConnected,
  githubOauthReady,
  onBrowseGitHub,
}: {
  githubConnected: boolean
  githubOauthReady: boolean
  onBrowseGitHub: () => void
}) {
  const projectTrackingCatalogue = [
    {
      icon: "logos:github-icon",
      title: "GitHub",
      description: "Connect repositories to track client PRs and issues automatically.",
      connected: githubConnected,
      disabled: !githubOauthReady,
      onConnect: onBrowseGitHub,
    },
    ...projectTrackingItems,
  ]

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h2 className="text-lg font-medium tracking-tight">Project Tracking</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {projectTrackingCatalogue.map((item) => (
            <CatalogueCard key={item.title} {...item} />
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-medium tracking-tight">Client Channels</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {clientChannelItems.map((item) => (
            <CatalogueCard key={item.title} {...item} />
          ))}
        </div>
      </div>
    </div>
  )
}

export function IntegrationsPageClient({
  envChecks,
  profile,
  projects,
}: {
  envChecks: EnvCheck[]
  profile: ProfileIntegration | null
  projects: ProjectIntegration[]
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [manualProjectPickerOpen, setManualProjectPickerOpen] = useState(false)
  const [manualSelectedProject, setManualSelectedProject] = useState<ProjectIntegration | null>(null)

  const githubOauthReady = envChecks.find((check) => check.label === "GitHub OAuth")?.value ?? false
  const githubConnected = profile?.github_connected ?? false
  const githubMessage = getGitHubStatusMessage(searchParams.get("github"))
  const requestedTab = searchParams.get("tab")
  const activeTab: IntegrationTab =
    requestedTab === "browse" || requestedTab === "connected" ? requestedTab : "connected"
  const pendingConnect = searchParams.get("connect") === "github" && githubConnected
  const pendingProjectId = searchParams.get("projectId")
  const pendingSelectedProject =
    pendingConnect && pendingProjectId
      ? projects.find((entry) => entry.id === pendingProjectId) ?? null
      : null
  const projectPickerOpen = manualProjectPickerOpen || (pendingConnect && !pendingProjectId)
  const selectedProject = manualSelectedProject ?? pendingSelectedProject

  const replaceSearchParams = useCallback((mutate: (params: URLSearchParams) => void) => {
    const params = new URLSearchParams(searchParams.toString())
    mutate(params)
    const nextQuery = params.toString()
    router.replace(nextQuery ? `/integrations?${nextQuery}` : "/integrations", { scroll: false })
  }, [router, searchParams])

  const handleBrowseGitHub = () => {
    if (!githubOauthReady) return

    if (githubConnected) {
      setManualProjectPickerOpen(true)
      return
    }

    router.push(buildGitHubConnectPath({ returnTo: "/integrations?tab=browse&connect=github" }))
  }

  const handleConnectProjectGitHub = (project: ProjectIntegration) => {
    if (!githubOauthReady) return

    if (githubConnected) {
      setManualSelectedProject(project)
      return
    }

    router.push(
      buildGitHubConnectPath({
        projectId: project.id,
        returnTo: `/integrations?connect=github&projectId=${project.id}`,
      })
    )
  }

  const handleRepoLinked = () => {
    setManualProjectPickerOpen(false)
    setManualSelectedProject(null)
    replaceSearchParams((params) => {
      params.delete("connect")
      params.delete("projectId")
      params.delete("tab")
      params.set("github", "repo_linked")
    })
    router.refresh()
  }

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

      <EnvironmentChecks envChecks={envChecks} />

      {githubMessage && (
        <div
          className={
            githubMessage.tone === "error"
              ? "mb-4 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive"
              : "mb-4 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-sm text-emerald-700"
          }
        >
          {githubMessage.text}
        </div>
      )}

      <Tabs value={activeTab} onValueChange={(value) => replaceSearchParams((params) => params.set("tab", value))}>
        <TabsList
          variant="line"
          className="mb-6 h-9 w-full justify-start rounded-none border-b border-border bg-transparent p-0"
        >
          {integrationTabs.map(({ value, icon: TabIcon, label }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="h-9 flex-none rounded-none px-3 text-sm group-data-horizontal/tabs:after:bottom-[-1px]"
            >
              <TabIcon className="size-4" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="connected">
          <ConnectedCardsContent
            githubConnected={githubConnected}
            githubOauthReady={githubOauthReady}
            onConnectGitHub={handleConnectProjectGitHub}
            projects={projects}
          />
        </TabsContent>

        <TabsContent value="browse">
          <BrowseCatalogue
            githubConnected={githubConnected}
            githubOauthReady={githubOauthReady}
            onBrowseGitHub={handleBrowseGitHub}
          />
        </TabsContent>
      </Tabs>

      <GitHubProjectPickerDialog
        open={projectPickerOpen}
        onOpenChange={(open) => {
          setManualProjectPickerOpen(open)
          if (!open && pendingConnect) {
            replaceSearchParams((params) => {
              params.delete("connect")
              params.delete("projectId")
            })
          }
        }}
        onSelectProject={(project) => {
          setManualProjectPickerOpen(false)
          setManualSelectedProject(project)
          if (pendingConnect) {
            replaceSearchParams((params) => {
              params.delete("connect")
              params.delete("projectId")
            })
          }
        }}
        projects={projects}
      />

      <GitHubRepoDialog
        key={selectedProject?.id ?? "none"}
        githubConnected={githubConnected}
        githubOauthReady={githubOauthReady}
        onLinked={handleRepoLinked}
        onOpenChange={(open) => {
          if (!open) {
            setManualSelectedProject(null)
            if (pendingConnect) {
              replaceSearchParams((params) => {
                params.delete("connect")
                params.delete("projectId")
              })
            }
          }
        }}
        open={Boolean(selectedProject)}
        project={selectedProject}
      />
    </div>
  )
}
