"use client"

import React from "react"
import { Icon } from "@iconify/react"
import { MoreHorizontal } from "lucide-react"
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
} from "@workspace/ui/components/dropdown-menu"

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
  connectedContent,
}: {
  connectedContent: React.ReactNode
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
        <TabsList variant="line" className="mb-6">
          <TabsTrigger value="connected">Connected</TabsTrigger>
          <TabsTrigger value="browse">All Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="connected">
          {connectedContent}
        </TabsContent>

        <TabsContent value="browse">
          <BrowseCatalogue />
        </TabsContent>
      </Tabs>
    </div>
  )
}
