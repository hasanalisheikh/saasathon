"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  CalendarClockIcon,
  CalendarIcon,
  CheckCircle2Icon,
  ClockIcon,
  DownloadIcon,
  EllipsisIcon,
  FileTextIcon,
  ListIcon,
  RefreshCwIcon,
  SearchIcon,
  SendIcon,
  TableIcon,
  XCircleIcon,
} from "lucide-react"

import { statusLabel } from "@/lib/utils"
import type { Classification, RequestStatus } from "@/types"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import {
  EmptyState,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
} from "@workspace/ui/components/empty-state"
import { FormField, FormLabel } from "@workspace/ui/components/form-field"
import { Input } from "@workspace/ui/components/input"
import {
  PageDescription,
  PageHeader,
  PageTitle,
} from "@workspace/ui/components/page-header"
import {
  ClassificationBadge,
  StatusBadge,
} from "@workspace/ui/components/status-badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { ViewSwitcher } from "@workspace/ui/components/view-switcher"
import { cn } from "@workspace/ui/lib/utils"
import { CalendarOverview, type CalendarOverviewEvent } from "./calendar-overview"

type HistoryView = "rows" | "calendar"
type HistoryEventType =
  | "requested"
  | "sent"
  | "approved"
  | "declined"
  | "delivery"
type ScopeFilter = Exclude<Classification, null> | "all" | "unclassified"
type ExportFormat = "csv" | "pdf"
type ExportFieldId =
  | "date"
  | "project"
  | "client"
  | "event"
  | "request"
  | "from"
  | "status"
  | "scope"
  | "action_point"

type HistoryProject = {
  id: string
  name: string
  client_name: string
}

type HistoryRequest = {
  id: string
  project_id: string
  raw_email_subject: string | null
  raw_email_body: string
  raw_email_from: string | null
  classification: Classification
  status: RequestStatus
  timeline_impact_days: number | null
  approved_at: string | null
  declined_at: string | null
  created_at: string
  updated_at: string
  project: HistoryProject | null
}

type HistoryEvent = {
  id: string
  request: HistoryRequest
  type: HistoryEventType
  title: string
  date: string
}

const STATUS_FILTERS: ReadonlyArray<{
  value: RequestStatus | "all"
  label: string
}> = [
  { value: "all", label: "All statuses" },
  { value: "pending_review", label: "Pending Review" },
  { value: "sent_to_client", label: "Sent to Client" },
  { value: "approved", label: "Approved Add-On" },
  { value: "accepted_in_scope", label: "Accepted In Scope" },
  { value: "deferred", label: "Deferred" },
  { value: "declined", label: "Declined" },
]

const SCOPE_FILTERS: ReadonlyArray<{
  value: ScopeFilter
  label: string
}> = [
  { value: "all", label: "All scope" },
  { value: "in_scope", label: "In Scope" },
  { value: "out_of_scope", label: "Out of Scope" },
  { value: "ambiguous", label: "Ambiguous" },
  { value: "clarification_needed", label: "Clarification Needed" },
  { value: "unclassified", label: "Unclassified" },
]

const VIEW_OPTIONS = [
  { value: "rows", label: "Rows", icon: ListIcon },
  { value: "calendar", label: "Calendar", icon: CalendarIcon },
] as const

const EXPORT_FIELDS: ReadonlyArray<{
  description: string
  id: ExportFieldId
  label: string
}> = [
  { id: "date", label: "Date", description: "Event date and time." },
  { id: "project", label: "Project", description: "Project name." },
  { id: "client", label: "Client", description: "Client or account name." },
  { id: "event", label: "Event", description: "Timeline event title." },
  { id: "request", label: "Request", description: "Request summary." },
  { id: "from", label: "From", description: "Sender or origin." },
  { id: "status", label: "Status", description: "Workflow status." },
  { id: "scope", label: "Scope", description: "Scope classification." },
  {
    id: "action_point",
    label: "Action point",
    description: "Suggested next step.",
  },
]

const DEFAULT_EXPORT_FIELDS = EXPORT_FIELDS.map((field) => field.id)
const EXPORT_PREVIEW_ROWS = 5

const eventTypeMeta = {
  requested: {
    icon: ClockIcon,
    className: "border-muted text-muted-foreground",
  },
  sent: {
    icon: SendIcon,
    className: "border-blue-400/60 text-blue-500",
  },
  approved: {
    icon: CheckCircle2Icon,
    className: "border-primary/60 text-primary",
  },
  declined: {
    icon: XCircleIcon,
    className: "border-destructive/60 text-destructive",
  },
  delivery: {
    icon: CalendarClockIcon,
    className: "border-primary/60 text-primary",
  },
} satisfies Record<
  HistoryEventType,
  { icon: React.ComponentType<{ className?: string }>; className: string }
>

const nativeSelectClassName =
  "h-9 w-full rounded-md border border-input bg-input/20 px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 dark:bg-input/30"

function HistoryClient({
  initialProjectId,
  initialRequests,
  initialStatus,
  projects,
}: {
  initialProjectId: string
  initialRequests: HistoryRequest[]
  initialStatus: RequestStatus | "all"
  projects: HistoryProject[]
}) {
  const router = useRouter()
  const [projectFilter, setProjectFilter] = React.useState(
    initialProjectId || "all"
  )
  const [statusFilter, setStatusFilter] = React.useState<RequestStatus | "all">(
    initialStatus
  )
  const [scopeFilter, setScopeFilter] = React.useState<ScopeFilter>("all")
  const [fromFilter, setFromFilter] = React.useState("")
  const [dateFrom, setDateFrom] = React.useState("")
  const [dateTo, setDateTo] = React.useState("")
  const [searchFilter, setSearchFilter] = React.useState("")
  const [view, setView] = React.useState<HistoryView>("calendar")
  const [showAdvancedFilters, setShowAdvancedFilters] = React.useState(false)
  const [exportFormat, setExportFormat] = React.useState<ExportFormat | null>(
    null
  )
  const [exportFields, setExportFields] = React.useState<ExportFieldId[]>(
    DEFAULT_EXPORT_FIELDS
  )
  const [refreshing, startRefresh] = React.useTransition()

  const visibleRequests = React.useMemo(() => {
    const normalizedQuery = searchFilter.trim().toLowerCase()
    const normalizedFrom = fromFilter.trim().toLowerCase()

    return initialRequests.filter((request) => {
      const matchesProject =
        projectFilter === "all" || request.project_id === projectFilter
      const matchesStatus =
        statusFilter === "all" || request.status === statusFilter
      const matchesScope =
        scopeFilter === "all"
          ? true
          : scopeFilter === "unclassified"
            ? !request.classification
            : request.classification === scopeFilter
      const matchesFrom =
        !normalizedFrom ||
        [request.raw_email_from ?? "", request.project?.client_name ?? ""].some(
          (value) => value.toLowerCase().includes(normalizedFrom)
        )
      const matchesSearch =
        !normalizedQuery ||
        [
          getRequestSubject(request),
          request.raw_email_body,
          request.raw_email_from ?? "",
          request.project?.name ?? "",
          request.project?.client_name ?? "",
          request.classification ?? "",
          statusLabel(request.status),
        ].some((value) => value.toLowerCase().includes(normalizedQuery))

      return (
        matchesProject &&
        matchesStatus &&
        matchesScope &&
        matchesFrom &&
        matchesSearch
      )
    })
  }, [
    fromFilter,
    initialRequests,
    projectFilter,
    scopeFilter,
    searchFilter,
    statusFilter,
  ])

  const events = React.useMemo(() => {
    return visibleRequests
      .flatMap(buildEvents)
      .filter((event) =>
        matchesDateRange(event.date, {
          dateFrom,
          dateTo,
        })
      )
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [dateFrom, dateTo, visibleRequests])

  const activeAdvancedFilterCount = React.useMemo(
    () =>
      [scopeFilter !== "all", fromFilter.trim().length > 0, !!dateFrom, !!dateTo]
        .filter(Boolean)
        .length,
    [dateFrom, dateTo, fromFilter, scopeFilter]
  )
  const calendarEvents = React.useMemo(
    () => events.map(toCalendarOverviewEvent),
    [events]
  )
  const upcomingEvents = React.useMemo(
    () =>
      events.filter(
        (event) => new Date(event.date).getTime() >= startOfToday().getTime()
      ),
    [events]
  )
  const calendarKey = React.useMemo(
    () => events.map((event) => `${event.id}:${event.date}`).join(":"),
    [events]
  )
  const exportPreviewEvents = React.useMemo(
    () => events.slice(0, EXPORT_PREVIEW_ROWS),
    [events]
  )

  function refreshHistory() {
    startRefresh(() => {
      router.refresh()
    })
  }

  function openExportDialog(format: ExportFormat) {
    setExportFormat(format)
  }

  function toggleExportField(fieldId: ExportFieldId) {
    setExportFields((current) => {
      if (current.includes(fieldId)) {
        if (current.length === 1) {
          return current
        }

        return current.filter((value) => value !== fieldId)
      }

      return [...current, fieldId]
    })
  }

  function closeExportDialog() {
    setExportFormat(null)
  }

  function runExport() {
    if (!exportFormat) {
      return
    }

    const href = historyExportHref({
      fields: exportFields,
      format: exportFormat,
      dateFrom,
      dateTo,
      from: fromFilter,
      projectId: projectFilter,
      scope: scopeFilter,
      query: searchFilter,
      status: statusFilter,
    })

    const link = document.createElement("a")
    link.href = href
    link.rel = "noopener noreferrer"
    document.body.append(link)
    link.click()
    link.remove()
    closeExportDialog()
  }

  return (
    <div className="space-y-6">
      <PageHeader>
        <div className="space-y-1">
          <PageTitle>History</PageTitle>
          <PageDescription>
            A read-only timeline of client requests, approvals, and estimated
            delivery windows.
          </PageDescription>
        </div>
      </PageHeader>

      <div className="space-y-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end">
          <FormField>
            <FormLabel htmlFor="history-search-filter">Search</FormLabel>
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="history-search-filter"
                value={searchFilter}
                onChange={(event) => setSearchFilter(event.target.value)}
                placeholder="Search activity"
                className="pl-8 sm:w-52"
              />
            </div>
          </FormField>

          <FormField>
            <FormLabel htmlFor="history-project-filter">Project</FormLabel>
            <select
              id="history-project-filter"
              value={projectFilter}
              onChange={(event) => setProjectFilter(event.target.value)}
              className={cn(nativeSelectClassName, "min-w-0 sm:w-56")}
            >
              <option value="all">All projects</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </FormField>

          <FormField>
            <FormLabel htmlFor="history-status-filter">Status</FormLabel>
            <select
              id="history-status-filter"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as RequestStatus | "all")
              }
              className={cn(nativeSelectClassName, "min-w-0 sm:w-48")}
            >
              {STATUS_FILTERS.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </FormField>

          <div className="flex items-end">
            <Button
              type="button"
              variant="outline"
              aria-expanded={showAdvancedFilters}
              aria-label="Toggle more filters"
              title="More filters"
              className={cn(
                "size-9 rounded-md",
                activeAdvancedFilterCount > 0 &&
                  "border-primary/40 text-foreground"
              )}
              onClick={() => setShowAdvancedFilters((current) => !current)}
            >
              <EllipsisIcon />
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
            <ViewSwitcher
              value={view}
              onValueChange={setView}
              options={VIEW_OPTIONS}
              className="h-9 rounded-md bg-transparent p-1"
            />
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="outline"
                    className="h-9 justify-center gap-1 rounded-md px-2.5"
                  />
                }
              >
                <DownloadIcon />
                Export
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem onClick={() => openExportDialog("pdf")}>
                  <FileTextIcon />
                  PDF report
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => openExportDialog("csv")}>
                  <TableIcon />
                  CSV file
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="outline"
              size="icon"
              className="size-9 rounded-md [&_svg:not([class*='size-'])]:size-4"
              aria-label="Refresh history"
              title="Refresh history"
              onClick={refreshHistory}
              disabled={refreshing}
            >
              <RefreshCwIcon className={refreshing ? "animate-spin" : ""} />
            </Button>
          </div>
        </div>

        {showAdvancedFilters ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <FormField>
              <FormLabel htmlFor="history-date-from-filter">
                From date
              </FormLabel>
              <Input
                id="history-date-from-filter"
                type="date"
                value={dateFrom}
                onChange={(event) => setDateFrom(event.target.value)}
              />
            </FormField>

            <FormField>
              <FormLabel htmlFor="history-date-to-filter">To date</FormLabel>
              <Input
                id="history-date-to-filter"
                type="date"
                value={dateTo}
                onChange={(event) => setDateTo(event.target.value)}
              />
            </FormField>

            <FormField>
              <FormLabel htmlFor="history-from-filter">From</FormLabel>
              <Input
                id="history-from-filter"
                value={fromFilter}
                onChange={(event) => setFromFilter(event.target.value)}
                placeholder="Client name or sender email"
              />
            </FormField>

            <FormField>
              <FormLabel htmlFor="history-scope-filter">Scope</FormLabel>
              <select
                id="history-scope-filter"
                value={scopeFilter}
                onChange={(event) =>
                  setScopeFilter(event.target.value as ScopeFilter)
                }
                className={nativeSelectClassName}
              >
                {SCOPE_FILTERS.map((scope) => (
                  <option key={scope.value} value={scope.value}>
                    {scope.label}
                  </option>
                ))}
              </select>
            </FormField>
          </div>
        ) : null}
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <HistoryMetric label="Tracked requests" value={visibleRequests.length} />
        <HistoryMetric label="Timeline events" value={events.length} />
        <HistoryMetric label="Upcoming" value={upcomingEvents.length} />
      </div>

      {!initialRequests.length ? (
        <EmptyState>
          <EmptyStateIcon>
            <CalendarIcon />
          </EmptyStateIcon>
          <EmptyStateTitle>No request activity yet</EmptyStateTitle>
          <EmptyStateDescription>
            Client requests, approvals, and estimated delivery windows will
            appear here once projects receive work.
          </EmptyStateDescription>
        </EmptyState>
      ) : !events.length ? (
        <EmptyState>
          <EmptyStateIcon>
            <CalendarClockIcon />
          </EmptyStateIcon>
          <EmptyStateTitle>No matching timeline events</EmptyStateTitle>
          <EmptyStateDescription>
            Adjust the search, project, status, or advanced filters to see more
            request activity.
          </EmptyStateDescription>
        </EmptyState>
      ) : view === "calendar" ? (
        <CalendarOverview key={calendarKey} events={calendarEvents} />
      ) : (
        <HistoryEventTable events={events} />
      )}

      <Dialog
        open={exportFormat !== null}
        onOpenChange={(open) => !open && closeExportDialog()}
      >
        <DialogContent className="flex max-h-[90vh] w-[min(88vw,64rem)] min-w-0 flex-col overflow-hidden sm:max-w-[min(88vw,64rem)]">
          <DialogHeader className="shrink-0 pr-8">
            <DialogTitle>
              Export {exportFormat === "pdf" ? "PDF" : exportFormat === "csv" ? "CSV" : ""}
            </DialogTitle>
            <DialogDescription>
              Toggle columns directly in the preview to choose which fields to include.
            </DialogDescription>
          </DialogHeader>

          <div className="min-h-0 min-w-0 flex-1 space-y-2 overflow-hidden">
            <div className="flex min-w-0 items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm/5 font-medium text-foreground">Preview</p>
                <p className="text-xs/5 text-muted-foreground">
                  Showing {Math.min(exportPreviewEvents.length, EXPORT_PREVIEW_ROWS)} of {events.length} filtered rows.
                </p>
              </div>
              <p className="shrink-0 text-xs/5 text-muted-foreground">
                {exportFields.length} of {EXPORT_FIELDS.length} columns selected
              </p>
            </div>

            {exportPreviewEvents.length ? (
              <div className="max-h-[calc(90vh-13.5rem)] min-h-0 min-w-0 overflow-auto rounded-md border border-border/60 bg-muted/15 [&_[data-slot=table-container]]:min-w-max [&_[data-slot=table-container]]:overflow-visible">
                <Table className="min-w-[1180px] text-xs">
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      {EXPORT_FIELDS.map((field) => {
                        const checked = exportFields.includes(field.id)

                        return (
                          <TableHead
                            key={field.id}
                            className={cn(
                              "h-12 px-3 align-top text-xs/5 font-medium transition-colors",
                              getPreviewColumnClassName(field.id),
                              checked
                                ? "text-foreground"
                                : "bg-muted/25 text-muted-foreground/55"
                            )}
                          >
                            <label className="flex min-h-full cursor-pointer items-center gap-2">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleExportField(field.id)}
                                className="size-4 shrink-0 rounded border-border text-primary"
                              />
                              <span className="min-w-0">
                                <span className="block">{getExportFieldLabel(field.id)}</span>
                                <span className="mt-0.5 block text-[0.65rem]/4 font-normal text-muted-foreground">
                                  {field.description}
                                </span>
                              </span>
                            </label>
                          </TableHead>
                        )
                      })}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {exportPreviewEvents.map((event) => (
                      <TableRow key={event.id} className="bg-muted/20 hover:bg-muted/30">
                        {EXPORT_FIELDS.map((field) => {
                          const checked = exportFields.includes(field.id)

                          return (
                            <TableCell
                              key={field.id}
                              className={cn(
                                "px-3 py-2 align-top text-xs/5 transition-colors",
                                getPreviewColumnClassName(field.id),
                                checked
                                  ? "text-foreground"
                                  : "bg-muted/15 text-muted-foreground/45"
                              )}
                            >
                              {getExportFieldValue(event, field.id)}
                            </TableCell>
                          )
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="rounded-md border border-dashed border-border/60 px-4 py-6 text-center text-xs/5 text-muted-foreground">
                No matching rows to preview with the current filters.
              </div>
            )}
          </div>

          <DialogFooter className="shrink-0 border-t border-border/60 bg-popover pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setExportFields(DEFAULT_EXPORT_FIELDS)}
            >
              Reset fields
            </Button>
            <Button
              type="button"
              onClick={runExport}
              disabled={exportFields.length === 0}
            >
              Export
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function HistoryMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-border/60 bg-muted/25 px-4 py-3 dark:bg-muted/30">
      <p className="text-xs/5 text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl/7 font-semibold">{value}</p>
    </div>
  )
}

function HistoryEventTable({ events }: { events: HistoryEvent[] }) {
  return (
    <div className="overflow-x-auto rounded-md border border-border/60 bg-muted/15">
      <Table className="min-w-[1080px] text-sm">
        <TableHeader>
          <TableRow className="border-border/60 bg-muted/30 hover:bg-muted/30">
            <TableHead className="h-9 min-w-72 pl-4 text-sm/5 font-normal text-muted-foreground">
              Event
            </TableHead>
            <TableHead className="h-9 min-w-40 px-3 text-sm/5 font-normal text-muted-foreground">
              Project
            </TableHead>
            <TableHead className="h-9 min-w-40 px-3 text-sm/5 font-normal text-muted-foreground">
              From
            </TableHead>
            <TableHead className="h-9 px-3 text-sm/5 font-normal text-muted-foreground">
              Status
            </TableHead>
            <TableHead className="h-9 px-3 text-sm/5 font-normal text-muted-foreground">
              Classification
            </TableHead>
            <TableHead className="h-9 min-w-64 px-3 text-sm/5 font-normal text-muted-foreground">
              Action point
            </TableHead>
            <TableHead className="h-9 min-w-44 px-3 text-sm/5 font-normal text-muted-foreground">
              Date
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((event) => (
            <HistoryEventTableRow key={event.id} event={event} />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function HistoryEventTableRow({ event }: { event: HistoryEvent }) {
  const request = event.request
  const meta = eventTypeMeta[event.type]
  const Icon = meta.icon

  return (
    <TableRow className="border-border/50 bg-muted/20 hover:bg-muted/30">
      <TableCell className="py-2.5 pl-4">
        <div className="flex min-w-0 items-start gap-3">
          <div
            className={cn(
              "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md border bg-muted/40",
              meta.className
            )}
          >
            <Icon className="size-3.5" />
          </div>
          <div className="min-w-0">
            <Link
              href={`/projects/${request.project_id}/requests/${request.id}`}
              className="block truncate text-sm/5 font-medium text-foreground transition-colors hover:text-primary"
            >
              {event.title}
            </Link>
            <p className="max-w-96 truncate text-sm/5 text-muted-foreground">
              {getRequestSubject(request)}
            </p>
          </div>
        </div>
      </TableCell>
      <TableCell className="px-3 py-2.5">
        <span className="block max-w-40 truncate text-sm/5 text-muted-foreground">
          {request.project?.name ?? "Project"}
        </span>
      </TableCell>
      <TableCell className="px-3 py-2.5">
        <span className="block max-w-40 truncate text-sm/5 text-muted-foreground">
          {request.raw_email_from ?? request.project?.client_name ?? "Client"}
        </span>
      </TableCell>
      <TableCell className="px-3 py-2.5">
        <StatusBadge status={request.status} />
      </TableCell>
      <TableCell className="px-3 py-2.5">
        <ClassificationBadge classification={request.classification} />
      </TableCell>
      <TableCell className="px-3 py-2.5">
        <p className="max-w-72 text-sm/5 text-muted-foreground">
          {getActionPoint(event)}
        </p>
      </TableCell>
      <TableCell className="px-3 py-2.5 text-sm/5 text-muted-foreground">
        {formatDateTime(event.date)}
      </TableCell>
    </TableRow>
  )
}

function toCalendarOverviewEvent(event: HistoryEvent): CalendarOverviewEvent {
  const request = event.request

  return {
    id: event.id,
    href: `/projects/${request.project_id}/requests/${request.id}`,
    type: event.type,
    title: event.title,
    date: event.date,
    subject: getRequestSubject(request),
    projectName: request.project?.name ?? "Project",
    clientName: request.project?.client_name ?? "Client",
    status: request.status,
    classification: request.classification,
  }
}

function buildEvents(request: HistoryRequest): HistoryEvent[] {
  const events: HistoryEvent[] = [
    {
      id: `${request.id}:requested`,
      request,
      type: "requested",
      title: "Request received",
      date: request.created_at,
    },
  ]

  if (
    request.status === "sent_to_client" ||
    Boolean(request.approved_at) ||
    Boolean(request.declined_at)
  ) {
    events.push({
      id: `${request.id}:sent`,
      request,
      type: "sent",
      title: "Scope reply sent",
      date: request.updated_at,
    })
  }

  if (request.approved_at) {
    events.push({
      id: `${request.id}:approved`,
      request,
      type: "approved",
      title: "Client approved",
      date: request.approved_at,
    })
  }

  if (request.declined_at) {
    events.push({
      id: `${request.id}:declined`,
      request,
      type: "declined",
      title: "Client declined",
      date: request.declined_at,
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
    })
  }

  return events
}

function getRequestSubject(request: HistoryRequest) {
  return (
    request.raw_email_subject ||
    request.raw_email_body.slice(0, 80) ||
    "Client request"
  )
}

function getActionPoint(event: HistoryEvent) {
  if (event.type === "sent") {
    return "Follow up with the client if no decision has come back."
  }

  if (event.type === "approved") {
    return "Schedule the approved change and keep implementation moving."
  }

  if (event.type === "declined") {
    return "Close the request and keep the decision on record."
  }

  if (event.type === "delivery") {
    return "Plan the delivery impact against the project schedule."
  }

  switch (event.request.status) {
    case "pending_review":
      return "Review the request and decide whether it is in scope, needs clarification, or needs a quote."
    case "sent_to_client":
      return "Monitor for the client decision on the sent scope reply."
    case "approved":
      return "Confirm delivery ownership for the approved work."
    case "accepted_in_scope":
      return "Track this as accepted in-scope work."
    case "deferred":
      return "Revisit this deferred request during the next planning pass."
    case "declined":
      return "No delivery action needed; retain the declined record."
    default:
      return "Review this request history item."
  }
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

function formatDateTime(date: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date))
}

function historyExportHref({
  fields,
  format,
  dateFrom,
  dateTo,
  from,
  projectId,
  scope,
  query,
  status,
}: {
  fields: ExportFieldId[]
  format: ExportFormat
  dateFrom: string
  dateTo: string
  from: string
  projectId: string
  scope: ScopeFilter
  query: string
  status: RequestStatus | "all"
}) {
  const params = new URLSearchParams({ format })
  const normalizedQuery = query.trim()
  const normalizedFrom = from.trim()

  params.set("fields", fields.join(","))
  if (projectId !== "all") params.set("project_id", projectId)
  if (status !== "all") params.set("status", status)
  if (scope !== "all") params.set("scope", scope)
  if (dateFrom) params.set("date_from", dateFrom)
  if (dateTo) params.set("date_to", dateTo)
  if (normalizedFrom) params.set("from", normalizedFrom)
  if (normalizedQuery) params.set("q", normalizedQuery)

  return `/api/history/export?${params.toString()}`
}

function getExportFieldLabel(field: ExportFieldId) {
  return EXPORT_FIELDS.find((item) => item.id === field)?.label ?? field
}

function getExportFieldValue(event: HistoryEvent, field: ExportFieldId) {
  switch (field) {
    case "date":
      return formatDateTime(event.date)
    case "project":
      return event.request.project?.name ?? "Project"
    case "client":
      return event.request.project?.client_name ?? "Client"
    case "event":
      return event.title
    case "request":
      return getRequestSubject(event.request)
    case "from":
      return (
        event.request.raw_email_from ??
        event.request.project?.client_name ??
        "Client"
      )
    case "status":
      return statusLabel(event.request.status)
    case "scope":
      return formatClassification(event.request.classification)
    case "action_point":
      return getActionPoint(event)
  }
}

function getPreviewColumnClassName(field: ExportFieldId) {
  switch (field) {
    case "date":
      return "min-w-32 whitespace-nowrap"
    case "project":
    case "client":
      return "min-w-28 whitespace-nowrap"
    case "event":
      return "min-w-36 whitespace-nowrap"
    case "request":
      return "min-w-56 whitespace-normal"
    case "from":
      return "min-w-52 whitespace-nowrap"
    case "status":
      return "min-w-32 whitespace-nowrap"
    case "scope":
      return "min-w-28 whitespace-nowrap"
    case "action_point":
      return "min-w-72 whitespace-normal"
  }
}

function matchesDateRange(
  value: string,
  range: { dateFrom: string; dateTo: string }
) {
  const eventDate = new Date(value)
  const eventTime = eventDate.getTime()

  if (Number.isNaN(eventTime)) {
    return false
  }

  if (range.dateFrom) {
    const start = new Date(range.dateFrom)
    start.setHours(0, 0, 0, 0)

    if (eventTime < start.getTime()) {
      return false
    }
  }

  if (range.dateTo) {
    const end = new Date(range.dateTo)
    end.setHours(23, 59, 59, 999)

    if (eventTime > end.getTime()) {
      return false
    }
  }

  return true
}

function formatClassification(classification: Classification) {
  if (!classification) {
    return "Unclassified"
  }

  return classification
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

export { HistoryClient }
export type { HistoryProject, HistoryRequest }
