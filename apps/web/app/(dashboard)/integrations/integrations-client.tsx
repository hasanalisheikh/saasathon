"use client"

import React, { useState, useEffect } from "react"
import { Icon } from "@iconify/react"
import { BlocksIcon, CheckCircle2Icon, MoreHorizontal } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@workspace/ui/components/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@workspace/ui/components/tabs"
import { PageDescription, PageHeader, PageTitle } from "@workspace/ui/components/page-header"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
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
import type { ProjectIntegration, ProfileIntegration, EnvCheck } from "./page"

/* ------------------------------------------------------------------ */
/*  Catalogue data                                                     */
/* ------------------------------------------------------------------ */

type CatalogueItem = {
  icon: string | React.ElementType
  title: string
  description: string
  colorClass?: string
  connected?: boolean
  comingSoon?: boolean
  connectHref?: string
}

const projectTrackingItems: CatalogueItem[] = [
  {
    icon: "logos:github-icon",
    title: "GitHub",
    description: "Connect repositories to track client PRs and issues automatically.",
    connectHref: "/api/github/connect",
  },
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

/* ------------------------------------------------------------------ */
/*  Catalogue card                                                     */
/* ------------------------------------------------------------------ */

function CatalogueCard({
  icon,
  title,
  description,
  colorClass = "",
  connected = false,
  comingSoon = false,
  connectHref,
}: CatalogueItem) {
  return (
    <Card className="flex flex-col relative group bg-muted/40 border-border/80 transition-colors hover:border-primary/30">
      <DropdownMenu>
        <DropdownMenuTrigger className="absolute top-4 right-4 p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors outline-none cursor-pointer opacity-0 group-hover:opacity-100">
          <MoreHorizontal className="w-4 h-4" />
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
        <div className="flex items-center gap-3 mb-2">
          {typeof icon === "string" ? (
            <Icon icon={icon} className={`w-6 h-6 shrink-0 ${colorClass}`} />
          ) : (
            React.createElement(icon, { className: `w-6 h-6 shrink-0 ${colorClass}` })
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
        ) : connectHref ? (
          <Button
            variant={connected ? "secondary" : "ghost"}
            className="w-full border border-border/80"
            render={<a href={connectHref} />}
            nativeButton={false}
          >
            {connected ? "Connected" : "Connect"}
          </Button>
        ) : (
          <Button
            variant={connected ? "secondary" : "ghost"}
            className="w-full border border-border/80"
          >
            {connected ? "Connected" : "Connect"}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/*  Connected Tab Content                                              */
/* ------------------------------------------------------------------ */

function GithubRepoModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null)

  const mockRepos = [
    { name: "acme-corp/frontend", updated: "2d ago" },
    { name: "acme-corp/backend", updated: "5d ago" },
    { name: "acme-corp/landing-page", updated: "1w ago" },
    { name: "acme-corp/docs", updated: "3w ago" },
  ]

  useEffect(() => {
    if (!open) setSelectedRepo(null)
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Connect Repository</DialogTitle>
          <DialogDescription>
            Select a GitHub repository to link to this project.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 pt-2">
          <Input placeholder="Search repositories..." />
          <div className="flex flex-col space-y-2 max-h-[240px] overflow-y-auto">
            {mockRepos.map((repo) => {
              const isSelected = selectedRepo === repo.name
              return (
                <button
                  key={repo.name}
                  onClick={() => setSelectedRepo(repo.name)}
                  className={`flex items-center justify-between p-3 border rounded-md transition-colors text-left focus:outline-none focus-visible:ring-1 focus-visible:ring-ring ${isSelected ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon icon="logos:github-icon" className="w-4 h-4 shrink-0" />
                    <div>
                      <p className="text-sm font-medium leading-none">{repo.name}</p>
                      <p className="text-sm text-muted-foreground mt-1">Updated {repo.updated}</p>
                    </div>
                  </div>
                  {isSelected && <Icon icon="lucide:check" className="w-4 h-4 text-primary" />}
                </button>
              )
            })}
          </div>
          <div className="flex justify-end pt-4 border-t border-border/40 mt-2">
            <Button
              disabled={!selectedRepo}
              onClick={() => {
                alert(`Connected ${selectedRepo} to project!`)
                onOpenChange(false)
              }}
            >
              Connect
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function EmailModal({
  open,
  onOpenChange,
  project,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
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
            <p className="text-sm text-muted-foreground mt-1">
              Any email sent to this address will automatically create a scope request in this project.
            </p>
          </div>
          <div className="flex justify-end pt-2">
            <Button onClick={() => { alert("Email connection activated!"); onOpenChange(false); }}>Activate</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function WidgetModal({
  open,
  onOpenChange,
  project,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  project: ProjectIntegration
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Embed Website Widget</DialogTitle>
          <DialogDescription>
            Copy and paste this snippet into the <code>&lt;head&gt;</code> of your client's website to enable visual feedback.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>Embed Code</Label>
            <div className="relative">
              <pre className="p-4 bg-muted/50 rounded-md text-sm font-mono overflow-x-auto border border-border/50">
                {`<script>\n  window.MONAD_PROJECT_ID = "${project.id}";\n</script>\n<script src="https://monad.dev/widget.js" async></script>`}
              </pre>
              <Button size="sm" variant="secondary" className="absolute top-2 right-2 h-7" onClick={() => alert("Copied snippet!")}>Copy</Button>
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
  open,
  onOpenChange,
  project,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  project: ProjectIntegration
}) {
  const [selectedChannels, setSelectedChannels] = useState<string[]>([])

  const mockChannels = [
    { name: `#${project.client_name.toLowerCase().replace(/\s+/g, '-')}-project`, type: 'channel' },
    { name: `#general-${project.client_name.toLowerCase().replace(/\s+/g, '')}`, type: 'channel' },
    { name: `@${project.client_name} (Client)`, type: 'user' },
    { name: `@support-team`, type: 'user' }
  ]

  useEffect(() => {
    if (!open) setSelectedChannels([])
  }, [open])

  const toggleChannel = (name: string) => {
    setSelectedChannels(prev =>
      prev.includes(name)
        ? prev.filter(c => c !== name)
        : [...prev, name]
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
            <div className="flex flex-col space-y-2 max-h-[200px] overflow-y-auto pr-2">
              {mockChannels.map((channel) => {
                const isSelected = selectedChannels.includes(channel.name)
                return (
                  <button
                    key={channel.name}
                    onClick={() => toggleChannel(channel.name)}
                    className={`flex items-center justify-between p-3 border rounded-md transition-colors text-left focus:outline-none focus-visible:ring-1 focus-visible:ring-ring ${isSelected ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon icon={channel.type === 'channel' ? "lucide:hash" : "lucide:user"} className="w-4 h-4 text-muted-foreground" />
                      <p className="text-sm font-medium leading-none">{channel.name}</p>
                    </div>
                    {isSelected && <Icon icon="lucide:check" className="w-4 h-4 text-primary" />}
                  </button>
                )
              })}
            </div>
          </div>
          <div className="flex justify-end pt-2 border-t border-border/40 mt-2">
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
  project,
  isDemoMode,
}: {
  project: ProjectIntegration
  isDemoMode: boolean
}) {
  const [githubModalOpen, setGithubModalOpen] = useState(false)
  const [emailModalOpen, setEmailModalOpen] = useState(false)
  const [widgetModalOpen, setWidgetModalOpen] = useState(false)
  const [slackModalOpen, setSlackModalOpen] = useState(false)

  const [isEditing, setIsEditing] = useState(false)

  const connected = []

  if (project.github_repo_name || project.github_installation_id) {
    connected.push({ id: "github", icon: "logos:github-icon", title: "GitHub", label: project.github_repo_name || "GitHub Connected", colorClass: "" })
  }
  if (project.inbound_email) {
    connected.push({ id: "email", icon: "lucide:mail", title: "Inbound Email", label: project.inbound_email, colorClass: "text-foreground" })
  }
  if (project.widget_token) {
    connected.push({ id: "widget", icon: "lucide:code-2", title: "Widget", label: "Widget Active", colorClass: "text-foreground" })
  }

  // Demo Slack connection
  if (isDemoMode && project.id.startsWith("demo-")) {
    connected.push({ id: "slack", icon: "logos:slack-icon", title: "Slack", label: `#${project.client_name.toLowerCase().replace(/\s+/g, "-")}-project`, colorClass: "" })
  }

  return (
    <>
      <Card className="flex flex-col relative group bg-muted/40 border-border/80 transition-colors hover:border-primary/30">
        <CardHeader className="flex-1 pr-24 pb-0">
          <CardTitle className="text-base truncate">{project.name}</CardTitle>
          <CardDescription className="truncate">{project.client_name}</CardDescription>

          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" className="absolute top-4 right-4 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity" />}>
              <Icon icon="lucide:more-horizontal" className="w-4 h-4" />
              <span className="sr-only">Open menu</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => setIsEditing(!isEditing)} className="cursor-pointer">
                <Icon icon="lucide:pencil" className="w-4 h-4 mr-2" />
                {isEditing ? "Done Editing" : "Edit Integrations"}
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="cursor-pointer">
                  <Icon icon="lucide:plus" className="w-4 h-4 mr-2" />
                  Add Integration
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onClick={() => setGithubModalOpen(true)} className="cursor-pointer w-full flex items-center">
                    <Icon icon="logos:github-icon" className="w-4 h-4 mr-2" />
                    GitHub
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setEmailModalOpen(true)} className="cursor-pointer w-full flex items-center">
                    <Icon icon="lucide:mail" className="w-4 h-4 mr-2 text-foreground" />
                    Inbound Email
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setWidgetModalOpen(true)} className="cursor-pointer w-full flex items-center">
                    <Icon icon="lucide:code-2" className="w-4 h-4 mr-2 text-foreground" />
                    Website Widget
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSlackModalOpen(true)} className="cursor-pointer w-full flex items-center">
                    <Icon icon="logos:slack-icon" className="w-4 h-4 mr-2" />
                    Slack
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => alert(`Delete project ${project.name}`)} className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive">
                <Icon icon="lucide:trash-2" className="w-4 h-4 mr-2" />
                Delete Project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>

        <CardFooter className="pt-3 border-t border-border/80 rounded-t-xl">
          <div className="flex flex-wrap items-center gap-2">
            {connected.length > 0 ? (
              connected.map((c) => (
                <Badge key={c.id} variant="secondary" className="flex items-center gap-2 px-3 py-2 text-sm font-normal bg-background border border-border">
                  {typeof c.icon === "string" ? (
                    <Icon icon={c.icon} className={`w-10 h-10 shrink-0 ${c.colorClass || ""}`} />
                  ) : (
                    React.createElement(c.icon, { className: `w-10 h-10 shrink-0 ${c.colorClass || ""}` })
                  )}
                  <span className="truncate max-w-[150px]">{c.label}</span>
                  {isEditing && (
                    <button onClick={() => alert(`Remove ${c.title} integration`)} className="ml-1.5 text-muted-foreground hover:text-destructive focus:outline-none">
                      <Icon icon="lucide:x" className="w-5 h-5" />
                    </button>
                  )}
                </Badge>
              ))
            ) : (
              <span className="text-sm text-muted-foreground/60 italic">No integrations</span>
            )}
          </div>
        </CardFooter>
      </Card>

      <GithubRepoModal
        open={githubModalOpen}
        onOpenChange={setGithubModalOpen}
      />
      <EmailModal
        open={emailModalOpen}
        onOpenChange={setEmailModalOpen}
        project={project}
      />
      <WidgetModal
        open={widgetModalOpen}
        onOpenChange={setWidgetModalOpen}
        project={project}
      />
      <SlackModal
        open={slackModalOpen}
        onOpenChange={setSlackModalOpen}
        project={project}
      />
    </>
  )
}

function ConnectedCardsContent({
  projects,
  isDemoMode = false,
}: {
  projects: ProjectIntegration[]
  isDemoMode?: boolean
}) {
  // If demo mode is active, prepend a couple of demo projects
  const displayProjects = isDemoMode
    ? [
      { id: "demo-slack-1", name: "GlobalTech Redesign", client_name: "GlobalTech", github_repo_name: "globaltech-web", inbound_email: null, widget_token: null, github_installation_id: "demo" },
      { id: "demo-slack-2", name: "Acme Corp Dashboard", client_name: "Acme", github_repo_name: null, inbound_email: "acme-board@inbound.monad.dev", widget_token: null, github_installation_id: null },
      ...projects
    ]
    : projects

  if (displayProjects.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-border px-3 py-12 text-center">
        <p className="text-sm text-muted-foreground">You don't have any projects yet.</p>
        <p className="text-sm text-muted-foreground">Projects you create will appear here to manage their integrations.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
      {displayProjects.map((project) => (
        <ProjectIntegrationCard key={project.id} project={project} isDemoMode={isDemoMode} />
      ))}
    </div>
  )
}


/* ------------------------------------------------------------------ */
/*  Browse tab content                                                 */
/* ------------------------------------------------------------------ */

function BrowseCatalogue() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h2 className="text-lg font-medium tracking-tight">Project Tracking</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {projectTrackingItems.map((item) => (
            <CatalogueCard key={item.title} {...item} />
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-medium tracking-tight">Client Channels</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {clientChannelItems.map((item) => (
            <CatalogueCard key={item.title} {...item} />
          ))}
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main wrapper with tabs                                             */
/* ------------------------------------------------------------------ */

export function IntegrationsPageClient({
  projects,
  isDemoMode = false,
}: {
  projects: ProjectIntegration[]
  profile: ProfileIntegration | null
  envChecks: EnvCheck[]
  isDemoMode?: boolean
}) {
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

      <Tabs defaultValue="connected">
        <TabsList
          variant="line"
          className="mb-6 h-9 w-full justify-start rounded-none border-b border-border bg-transparent p-0"
        >
          {integrationTabs.map(({ value, label, icon: TabIcon }) => (
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
          <ConnectedCardsContent projects={projects} isDemoMode={isDemoMode} />
        </TabsContent>

        <TabsContent value="browse">
          <BrowseCatalogue />
        </TabsContent>
      </Tabs>
    </div>
  )
}
