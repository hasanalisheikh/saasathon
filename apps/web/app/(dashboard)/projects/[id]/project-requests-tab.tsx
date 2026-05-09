"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  CheckCircle2,
  GripVertical,
  Inbox,
  LayoutGrid,
  List,
  Loader2,
  PauseCircle,
  Send,
  XCircle,
} from "lucide-react"
import { toast } from "sonner"

import { formatCostRange, statusLabel, timeAgo } from "@/lib/utils"
import type { Request, RequestStatus } from "@/types"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import {
  EmptyState,
  EmptyStateDescription,
  EmptyStateTitle,
} from "@workspace/ui/components/empty-state"
import {
  ClassificationBadge,
  SourceBadge,
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

type RequestsView = "board" | "table"

type RequestStatusColumn = {
  accentClassName: string
  description: string
  emptyLabel: string
  icon: React.ComponentType<{ className?: string }>
  status: RequestStatus
  title: string
}

const VIEW_OPTIONS = [
  { value: "board", label: "Scrum", icon: LayoutGrid },
  { value: "table", label: "Table", icon: List },
] as const

const REQUEST_STATUS_COLUMNS: RequestStatusColumn[] = [
  {
    status: "pending_review",
    title: "Needs Review",
    description: "Fresh requests waiting for triage.",
    emptyLabel: "No requests waiting for review.",
    icon: Inbox,
    accentClassName: "text-amber-400",
  },
  {
    status: "sent_to_client",
    title: "With Client",
    description: "Quotes or clarifications sent for a decision.",
    emptyLabel: "Nothing is currently with the client.",
    icon: Send,
    accentClassName: "text-blue-400",
  },
  {
    status: "approved",
    title: "Approved",
    description: "Confirmed paid scope changes ready for delivery.",
    emptyLabel: "No approved change requests yet.",
    icon: CheckCircle2,
    accentClassName: "text-emerald-400",
  },
  {
    status: "accepted_in_scope",
    title: "In Scope",
    description: "Work accepted as part of the original agreement.",
    emptyLabel: "No requests have been accepted in scope.",
    icon: CheckCircle2,
    accentClassName: "text-emerald-400",
  },
  {
    status: "deferred",
    title: "Deferred",
    description: "Parked for a later sprint or follow-up.",
    emptyLabel: "No deferred requests.",
    icon: PauseCircle,
    accentClassName: "text-violet-400",
  },
  {
    status: "declined",
    title: "Declined",
    description: "Requests that were explicitly closed out.",
    emptyLabel: "No declined requests.",
    icon: XCircle,
    accentClassName: "text-destructive",
  },
]

interface ProjectRequestsTabProps {
  projectId: string
  requests: Request[]
}

export function ProjectRequestsTab({
  projectId,
  requests,
}: ProjectRequestsTabProps) {
  const router = useRouter()
  const [view, setView] = React.useState<RequestsView>("board")
  const [boardRequests, setBoardRequests] = React.useState(requests)
  const [draggingRequestId, setDraggingRequestId] = React.useState<
    string | null
  >(null)
  const [dropStatus, setDropStatus] = React.useState<RequestStatus | null>(null)
  const [updatingRequestId, setUpdatingRequestId] = React.useState<
    string | null
  >(null)

  React.useEffect(() => {
    setBoardRequests(requests)
  }, [requests])

  const requestColumns = React.useMemo(
    () =>
      REQUEST_STATUS_COLUMNS.map((column) => ({
        ...column,
        requests: boardRequests.filter(
          (request) => request.status === column.status
        ),
      })),
    [boardRequests]
  )

  async function moveRequest(requestId: string, nextStatus: RequestStatus) {
    const currentRequest = boardRequests.find(
      (request) => request.id === requestId
    )

    if (!currentRequest || currentRequest.status === nextStatus) {
      setDraggingRequestId(null)
      setDropStatus(null)
      return
    }

    const previousRequests = boardRequests
    setUpdatingRequestId(requestId)
    setBoardRequests((current) =>
      current.map((request) =>
        request.id === requestId
          ? {
              ...request,
              status: nextStatus,
              updated_at: new Date().toISOString(),
            }
          : request
      )
    )

    try {
      const res = await fetch(`/api/requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      })

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(data.error ?? "Could not move request")
      }

      toast.success(`Moved to ${statusLabel(nextStatus)}`)
      router.refresh()
    } catch (error) {
      setBoardRequests(previousRequests)
      toast.error(
        error instanceof Error ? error.message : "Could not move request"
      )
    } finally {
      setDraggingRequestId(null)
      setDropStatus(null)
      setUpdatingRequestId(null)
    }
  }

  if (!boardRequests.length) {
    return (
        <EmptyState>
        <EmptyStateTitle>No requests yet.</EmptyStateTitle>
        <EmptyStateDescription>
          Add a request manually, capture it from Slack, or convert widget feedback to start building your board.
        </EmptyStateDescription>
      </EmptyState>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">
            Track incoming scope changes from triage through approval.
          </p>
          <p className="text-xs/5 text-muted-foreground">
            Scrum view groups requests by workflow stage, while table view gives
            you a denser scan of every request.
          </p>
        </div>

        <ViewSwitcher
          value={view}
          onValueChange={setView}
          options={VIEW_OPTIONS}
        />
      </div>

      {view === "board" ? (
        <RequestBoard
          columns={requestColumns}
          draggingRequestId={draggingRequestId}
          dropStatus={dropStatus}
          onDragEnd={() => {
            setDraggingRequestId(null)
            setDropStatus(null)
          }}
          onDragStart={setDraggingRequestId}
          onDropRequest={(requestId, status) =>
            void moveRequest(requestId, status)
          }
          onDropStatusChange={setDropStatus}
          projectId={projectId}
          updatingRequestId={updatingRequestId}
        />
      ) : (
        <RequestTable requests={boardRequests} projectId={projectId} />
      )}
    </div>
  )
}

function RequestBoard({
  columns,
  draggingRequestId,
  dropStatus,
  onDragEnd,
  onDragStart,
  onDropRequest,
  onDropStatusChange,
  projectId,
  updatingRequestId,
}: {
  columns: Array<RequestStatusColumn & { requests: Request[] }>
  draggingRequestId: string | null
  dropStatus: RequestStatus | null
  onDragEnd: () => void
  onDragStart: (requestId: string) => void
  onDropRequest: (requestId: string, status: RequestStatus) => void
  onDropStatusChange: (status: RequestStatus | null) => void
  projectId: string
  updatingRequestId: string | null
}) {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex min-w-max items-stretch gap-4 pb-4">
        {columns.map((column) => (
          <RequestBoardColumn
            key={column.status}
            column={column}
            draggingRequestId={draggingRequestId}
            dropStatus={dropStatus}
            onDragEnd={onDragEnd}
            onDragStart={onDragStart}
            onDropRequest={onDropRequest}
            onDropStatusChange={onDropStatusChange}
            projectId={projectId}
            updatingRequestId={updatingRequestId}
          />
        ))}
      </div>
    </div>
  )
}

function RequestBoardColumn({
  column,
  draggingRequestId,
  dropStatus,
  onDragEnd,
  onDragStart,
  onDropRequest,
  onDropStatusChange,
  projectId,
  updatingRequestId,
}: {
  column: RequestStatusColumn & { requests: Request[] }
  draggingRequestId: string | null
  dropStatus: RequestStatus | null
  onDragEnd: () => void
  onDragStart: (requestId: string) => void
  onDropRequest: (requestId: string, status: RequestStatus) => void
  onDropStatusChange: (status: RequestStatus | null) => void
  projectId: string
  updatingRequestId: string | null
}) {
  const Icon = column.icon
  const isDropTarget =
    draggingRequestId !== null && dropStatus === column.status

  return (
    <Card
      className={cn(
        "min-h-[32rem] w-[320px] shrink-0 rounded-lg border border-border/70 bg-muted/35 py-0 ring-0 transition-colors",
        isDropTarget && "border-ring/50 bg-muted/55"
      )}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          onDropStatusChange(null)
        }
      }}
      onDragOver={(event) => {
        event.preventDefault()
        event.dataTransfer.dropEffect = "move"
        onDropStatusChange(column.status)
      }}
      onDrop={(event) => {
        event.preventDefault()
        const requestId = event.dataTransfer.getData("text/plain")
        if (requestId) onDropRequest(requestId, column.status)
      }}
    >
      <CardHeader className="h-20 py-0">
        <div className="flex h-full items-start justify-between gap-3 pt-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Icon className={cn("size-4", column.accentClassName)} />
              <CardTitle className="text-sm/5">{column.title}</CardTitle>
            </div>
            <CardDescription className="text-xs/5">
              {column.description}
            </CardDescription>
          </div>
          <span className="rounded-full border border-border/70 bg-background/35 px-2 py-0.5 text-xs/5 text-muted-foreground">
            {column.requests.length}
          </span>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-3 p-3">
        {column.requests.length ? (
          column.requests.map((request) => (
            <RequestBoardCard
              key={request.id}
              isDragging={draggingRequestId === request.id}
              isUpdating={updatingRequestId === request.id}
              onDragEnd={onDragEnd}
              onDragStart={onDragStart}
              projectId={projectId}
              request={request}
            />
          ))
        ) : (
          <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-border/80 bg-background/25 px-4 py-8 text-center text-xs/5 text-muted-foreground">
            {column.emptyLabel}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function RequestBoardCard({
  isDragging,
  isUpdating,
  onDragEnd,
  onDragStart,
  projectId,
  request,
}: {
  isDragging: boolean
  isUpdating: boolean
  onDragEnd: () => void
  onDragStart: (requestId: string) => void
  projectId: string
  request: Request
}) {
  return (
    <Link
      href={`/projects/${projectId}/requests/${request.id}`}
      className={cn(
        "block rounded-lg focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none",
        isUpdating && "pointer-events-none"
      )}
      draggable
      onDragEnd={onDragEnd}
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = "move"
        event.dataTransfer.setData("text/plain", request.id)
        onDragStart(request.id)
      }}
    >
      <Card
        className={cn(
          "border border-border/80 bg-background/80 py-0 shadow-sm transition-colors hover:border-foreground/25 hover:bg-background",
          "dark:bg-muted/55 dark:hover:bg-muted/75",
          "cursor-grab active:cursor-grabbing",
          isDragging && "opacity-50 ring-1 ring-primary/40",
          isUpdating && "opacity-70"
        )}
      >
        <CardContent className="space-y-3 p-4">
          <div className="space-y-1.5">
            <div className="flex items-start gap-2">
              <GripVertical className="mt-0.5 size-4 shrink-0 text-muted-foreground/60" />
              <p className="text-sm/5 font-medium text-foreground">
                {getRequestTitle(request)}
              </p>
            </div>
            <p className="text-xs/5 text-muted-foreground">
              {request.raw_email_from ?? "Client request"} ·{" "}
              {timeAgo(request.created_at)}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {request.classification ? (
              <ClassificationBadge
                classification={request.classification}
                className="border-transparent"
              />
            ) : null}
            <SourceBadge
              source={request.source}
              className="border-transparent"
            />
          </div>

          <div className="flex items-center justify-between gap-3">
            <span className="text-xs/5 text-muted-foreground">
              {request.cost_min != null && request.cost_max != null
                ? formatCostRange(request.cost_min, request.cost_max)
                : "Estimate pending"}
            </span>
            {isUpdating ? (
              <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
            ) : (
              <StatusBadge
                status={request.status}
                className="border-transparent"
              />
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function RequestTable({
  projectId,
  requests,
}: {
  projectId: string
  requests: Request[]
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-border/70 bg-card">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[38%] pl-4">Request</TableHead>
            <TableHead>Classification</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Estimate</TableHead>
            <TableHead>Updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.id}>
              <TableCell className="pl-4">
                <div className="min-w-0">
                  <Link
                    href={`/projects/${projectId}/requests/${request.id}`}
                    className="block text-sm/5 font-medium text-foreground hover:text-primary"
                  >
                    {getRequestTitle(request)}
                  </Link>
                  <p className="truncate text-xs/5 text-muted-foreground">
                    {request.raw_email_from ?? "Client request"} ·{" "}
                    {new Date(request.created_at).toLocaleDateString()}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                {request.classification ? (
                  <ClassificationBadge
                    classification={request.classification}
                    className="border-transparent"
                  />
                ) : (
                  <span className="text-xs/5 text-muted-foreground">
                    Analysing
                  </span>
                )}
              </TableCell>
              <TableCell>
                <StatusBadge
                  status={request.status}
                  className="border-transparent"
                />
              </TableCell>
              <TableCell className="text-xs/5 text-muted-foreground">
                {request.cost_min != null && request.cost_max != null
                  ? formatCostRange(request.cost_min, request.cost_max)
                  : "Pending"}
              </TableCell>
              <TableCell className="text-xs/5 text-muted-foreground">
                <div className="flex flex-col gap-0.5">
                  <span>{statusLabel(request.status)}</span>
                  <span>
                    {new Date(request.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function getRequestTitle(request: Request) {
  return (
    request.raw_email_subject ||
    request.raw_email_body.slice(0, 72) ||
    "Client request"
  )
}
