import { Icon } from "@iconify/react"
import { MoreHorizontal } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { PageHeader, PageTitle, PageDescription } from "@workspace/ui/components/page-header"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import React from "react"

function IntegrationCard({
  icon,
  title,
  description,
  colorClass = "",
  connected = false,
  comingSoon = false,
}: {
  icon: string | React.ElementType
  title: string
  description: string
  colorClass?: string
  connected?: boolean
  comingSoon?: boolean
}) {
  return (
    <Card className="flex flex-col relative group bg-muted/40 border-border/80">
      <DropdownMenu>
        <DropdownMenuTrigger className="absolute top-4 right-4 p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors outline-none cursor-pointer">
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
        <Button variant={connected ? "secondary" : "ghost"} className="w-full border border-border/80" disabled={comingSoon}>
          {comingSoon ? "Coming Soon" : connected ? "Connected" : "Connect"}
        </Button>
      </CardFooter>
    </Card>
  )
}

export default function IntegrationsPage() {
  return (
    <div className="p-6 space-y-8">
      <PageHeader>
        <div>
          <PageTitle>Integrations</PageTitle>
          <PageDescription>
            Connect the channels your clients use. Bring external requests, messages, and project activity directly into your workflow.
          </PageDescription>
        </div>
      </PageHeader>

      <div className="space-y-4">
        <h2 className="text-lg font-medium tracking-tight">Project Tracking</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <IntegrationCard
            icon="logos:github-icon"
            title="GitHub"
            description="Connect repositories to track client PRs and issues automatically."
          />
          <IntegrationCard
            icon="logos:gitlab"
            title="GitLab"
            description="Link GitLab projects for automated merge request tracking."
            comingSoon={true}
          />
          <IntegrationCard
            icon="logos:jira"
            title="Jira"
            description="Sync Monad requests directly into Jira epics and issues."
            comingSoon={true}
          />
          <IntegrationCard
            icon="logos:trello"
            title="Trello"
            description="Automatically create Trello cards when a client scope is approved."
            comingSoon={true}
          />
          <IntegrationCard
            icon="logos:linear"
            title="Linear"
            description="Streamline scope tracking with modern software development workflows."
            comingSoon={true}
          />
          <IntegrationCard
            icon="logos:asana-icon"
            title="Asana"
            description="Turn approved project scopes into actionable Asana tasks."
            comingSoon={true}
          />
          <IntegrationCard
            icon="logos:notion-icon"
            title="Notion"
            description="Embed approved scopes and proof packs into your Notion workspace."
            comingSoon={true}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-medium tracking-tight">Client Channels</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <IntegrationCard
            icon="lucide:mail"
            title="Email"
            description="Forward client emails to automatically create and track scope requests."
          />
          <IntegrationCard
            icon="logos:slack-icon"
            title="Slack"
            description="Allow clients to submit scope requests directly from shared Slack channels."
            comingSoon={true}
          />
          <IntegrationCard
            icon="logos:discord-icon"
            title="Discord"
            description="Sync messages from stakeholders in your Discord servers into project requests."
            comingSoon={true}
          />
          <IntegrationCard
            icon="logos:microsoft-teams"
            title="Microsoft Teams"
            description="Intercept client requests in Teams channels for enterprise-grade tracking."
            comingSoon={true}
          />
          <IntegrationCard
            icon="logos:telegram"
            title="Telegram"
            description="Let clients send you messages via Telegram and track them as structured work."
            comingSoon={true}
          />
          <IntegrationCard
            icon="logos:whatsapp-icon"
            title="WhatsApp"
            description="Link your WhatsApp Business to intercept scope changes from direct messages."
            comingSoon={true}
          />
          <IntegrationCard
            icon="skill-icons:instagram"
            title="Instagram"
            description="Turn Instagram DMs from prospects into formal project scopes instantly."
            comingSoon={true}
          />
          <IntegrationCard
            icon="simple-icons:x"
            title="X (Twitter)"
            description="Transform inbound Twitter DMs from potential clients into project leads."
            colorClass="text-zinc-900 dark:text-white"
            comingSoon={true}
          />
          <IntegrationCard
            icon="logos:linkedin-icon"
            title="LinkedIn"
            description="Sync LinkedIn messages directly into your freelance work pipeline."
            comingSoon={true}
          />

          <IntegrationCard
            icon="logos:upwork"
            title="Upwork"
            description="Bridge your Upwork messages directly into Monad requests."
            comingSoon={true}
          />
          <IntegrationCard
            icon="simple-icons:fiverr"
            title="Fiverr"
            description="Sync Fiverr inbox messages to keep freelance requests in one dashboard."
            colorClass="text-[#00B22D]"
            comingSoon={true}
          />
          <IntegrationCard
            icon="logos:intercom-icon"
            title="Intercom"
            description="Turn customer support chats into actionable development requests."
            comingSoon={true}
          />
        </div>
      </div>
    </div>
  )
}
