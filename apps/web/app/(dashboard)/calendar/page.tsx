import Link from "next/link"
import {
  CalendarClockIcon,
  CalendarIcon,
  CheckCircle2Icon,
  ClockIcon,
  SendIcon,
  XCircleIcon,
} from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { cn } from "@workspace/ui/lib/utils"
import { Badge } from "@workspace/ui/components/badge"
import { Card, CardContent } from "@workspace/ui/components/card"
import { EmptyState, EmptyStateDescription, EmptyStateIcon, EmptyStateTitle } from "@workspace/ui/components/empty-state"
import { PageDescription, PageHeader, PageTitle } from "@workspace/ui/components/page-header"
import { ClassificationBadge, StatusBadge } from "@workspace/ui/components/status-badge"

type CalendarRequest = {
  id: string
  project_id: string
  raw_email_subject: string | null
  raw_email_body: string
  raw_email_from: string | null
  classification: string | null
  status: string
  timeline_impact_days: number | null
  approved_at: string | null
  declined_at: string | null
  created_at: string
  updated_at: string
  project: {
    id: string
    name: string
    client_name: string
  } | null
}

type ProjectOption = {
  id: string
  name: string
  client_name: string
}

type CalendarEvent = {
  id: string
  request: CalendarRequest
  type: "requested" | "sent" | "approved" | "declined" | "delivery"
  title: string
  date: string
  icon: React.ReactNode
}

const STATUS_FILTERS = ["all", "pending_review", "sent_to_client", "approved", "declined", "deferred", "accepted_in_scope"]

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; project?: string }>
}) {
  const { status: rawStatus, project: rawProject } = await searchParams
  const statusFilter = STATUS_FILTERS.includes(rawStatus ?? "") ? rawStatus! : "all"
  const projectFilter = rawProject ?? "all"

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: requests }, { data: projects }] = await Promise.all([
    supabase
      .from("requests")
      .select("id, project_id, raw_email_subject, raw_email_body, raw_email_from, classification, status, timeline_impact_days, approved_at, declined_at, created_at, updated_at, project:projects(id, name, client_name)")
      .order("created_at", { ascending: false })
      .returns<CalendarRequest[]>(),
    supabase
      .from("projects")
      .select("id, name, client_name")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false })
      .returns<ProjectOption[]>(),
  ])

  const projectIds = new Set((projects ?? []).map((project) => project.id))
  const ownedRequests = (requests ?? []).filter((request) => projectIds.has(request.project_id))
  const filteredRequests = ownedRequests.filter((request) => {
    const matchesStatus = statusFilter === "all" || request.status === statusFilter
    const matchesProject = projectFilter === "all" || request.project_id === projectFilter
    return matchesStatus && matchesProject
  })
  const events = filteredRequests
    .flatMap(buildEvents)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  const upcomingEvents = events.filter((event) => new Date(event.date).getTime() >= startOfToday().getTime())
  const visibleEvents = events.length ? events : []

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <PageHeader>
        <div>
          <PageTitle>Calendar</PageTitle>
          <PageDescription>
            A read-only timeline of client requests, approvals, and estimated delivery windows.
          </PageDescription>
        </div>
      </PageHeader>

      <div className="mb-6 grid gap-3 md:grid-cols-3">
        <MetricCard label="Tracked requests" value={filteredRequests.length.toString()} />
        <MetricCard label="Timeline events" value={events.length.toString()} />
        <MetricCard label="Upcoming" value={upcomingEvents.length.toString()} />
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {STATUS_FILTERS.map((status) => (
          <Badge
            key={status}
            variant={status === statusFilter ? "default" : "outline"}
            className="capitalize"
            render={<Link href={calendarHref({ status, project: projectFilter })} />}
          >
            {status.replace(/_/g, " ")}
          </Badge>
        ))}
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <Badge
          variant={projectFilter === "all" ? "default" : "outline"}
          render={<Link href={calendarHref({ status: statusFilter, project: "all" })} />}
        >
          All projects
        </Badge>
        {(projects ?? []).map((project) => (
          <Badge
            key={project.id}
            variant={project.id === projectFilter ? "default" : "outline"}
            render={<Link href={calendarHref({ status: statusFilter, project: project.id })} />}
          >
            {project.name}
          </Badge>
        ))}
      </div>

      {!ownedRequests.length ? (
        <EmptyState>
          <EmptyStateIcon>
            <CalendarIcon />
          </EmptyStateIcon>
          <EmptyStateTitle>No request activity yet</EmptyStateTitle>
          <EmptyStateDescription>
            Client requests, approvals, and estimated delivery windows will appear here once projects receive work.
          </EmptyStateDescription>
        </EmptyState>
      ) : !visibleEvents.length ? (
        <EmptyState>
          <EmptyStateIcon>
            <CalendarClockIcon />
          </EmptyStateIcon>
          <EmptyStateTitle>No matching timeline events</EmptyStateTitle>
          <EmptyStateDescription>
            Adjust the status or project filters to see more request activity.
          </EmptyStateDescription>
        </EmptyState>
      ) : (
        <div className="grid gap-3">
          {visibleEvents.map((event) => (
            <CalendarEventRow key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  )
}

function buildEvents(request: CalendarRequest): CalendarEvent[] {
  const events: CalendarEvent[] = [
    {
      id: `${request.id}:requested`,
      request,
      type: "requested",
      title: "Request received",
      date: request.created_at,
      icon: <ClockIcon />,
    },
  ]

  if (["sent_to_client", "approved", "declined"].includes(request.status)) {
    events.push({
      id: `${request.id}:sent`,
      request,
      type: "sent",
      title: "Scope reply sent",
      date: request.updated_at,
      icon: <SendIcon />,
    })
  }

  if (request.approved_at) {
    events.push({
      id: `${request.id}:approved`,
      request,
      type: "approved",
      title: "Client approved",
      date: request.approved_at,
      icon: <CheckCircle2Icon />,
    })
  }

  if (request.declined_at) {
    events.push({
      id: `${request.id}:declined`,
      request,
      type: "declined",
      title: "Client declined",
      date: request.declined_at,
      icon: <XCircleIcon />,
    })
  }

  if (request.timeline_impact_days && request.timeline_impact_days > 0) {
    const baseDate = request.approved_at ?? request.updated_at ?? request.created_at
    events.push({
      id: `${request.id}:delivery`,
      request,
      type: "delivery",
      title: `Estimated +${request.timeline_impact_days} day delivery impact`,
      date: addDays(baseDate, request.timeline_impact_days),
      icon: <CalendarClockIcon />,
    })
  }

  return events
}

function CalendarEventRow({ event }: { event: CalendarEvent }) {
  const request = event.request
  const href = `/projects/${request.project_id}/requests/${request.id}`
  const subject = request.raw_email_subject || request.raw_email_body.slice(0, 80) || "Client request"
  const accent = {
    requested: "border-muted",
    sent: "border-blue-400",
    approved: "border-primary",
    declined: "border-destructive",
    delivery: "border-amber-400",
  }[event.type]

  return (
    <Link href={href} className="block">
      <Card className={cn("border-l-[3px] transition-all hover:ring-foreground/20", accent)}>
        <CardContent>
          <div className="flex items-start gap-4">
            <div className="flex w-16 sm:w-24 shrink-0 flex-col">
              <span className="text-xs text-muted-foreground">{formatMonth(event.date)}</span>
              <span className="text-2xl font-semibold leading-none">{formatDay(event.date)}</span>
              <span className="mt-1 text-xs text-muted-foreground">{formatTime(event.date)}</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Badge variant="outline">
                  {event.icon}
                  {event.title}
                </Badge>
                <StatusBadge status={request.status} />
                <ClassificationBadge classification={request.classification} />
              </div>
              <p className="truncate text-sm font-medium">{subject}</p>
              <p className="mt-1 truncate text-xs text-muted-foreground">
                {request.project?.name ?? "Project"} · {request.project?.client_name ?? "Client"}
                {request.raw_email_from ? ` · ${request.raw_email_from}` : ""}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <Card size="sm">
      <CardContent>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  )
}

function calendarHref({ status, project }: { status: string; project: string }) {
  const params = new URLSearchParams()
  if (status !== "all") params.set("status", status)
  if (project !== "all") params.set("project", project)
  const query = params.toString()
  return query ? `/calendar?${query}` : "/calendar"
}

function addDays(date: string, days: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next.toISOString()
}

function startOfToday() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today
}

function formatMonth(date: string) {
  return new Intl.DateTimeFormat("en", { month: "short" }).format(new Date(date))
}

function formatDay(date: string) {
  return new Intl.DateTimeFormat("en", { day: "2-digit" }).format(new Date(date))
}

function formatTime(date: string) {
  return new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit" }).format(new Date(date))
}
