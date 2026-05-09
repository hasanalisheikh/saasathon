import Link from "next/link"
import { cn } from "@workspace/ui/lib/utils"
import { Card } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Tag } from "@workspace/ui/components/tag"
import {
  EmptyState,
  EmptyStateTitle,
  EmptyStateDescription,
} from "@workspace/ui/components/empty-state"
import {
  ClassificationBadge,
  StatusBadge,
} from "@workspace/ui/components/status-badge"
import { AlertTriangle, GitPullRequest, Mail, PenTool } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import {
  RequestTableColumnGroup,
  requestTableClassName,
  requestTableHeadClassName,
} from "./request-table-layout"

type PendingRequest = {
  id: string
  raw_email_subject: string | null
  raw_email_body: string | null
  classification: string | null
  cost_min: number | null
  cost_max: number | null
  source: string | null
  status: string
  risk_level: string | null
  created_at: string
  updated_at: string
  project: {
    id: string
    name: string
    client_name: string
  } | null
}

interface PendingFeedProps {
  requests: PendingRequest[]
}

export function PendingFeed({ requests }: PendingFeedProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold">Pending Client Approval</h2>
        {requests.length > 0 ? (
          <Badge variant="outline" className="text-muted-foreground">
            {requests.length}
          </Badge>
        ) : null}
      </div>

      {!requests.length ? (
        <Card className="flex min-h-[320px] items-center justify-center border-dashed bg-muted/20">
          <EmptyState>
            <EmptyStateTitle>No pending approvals</EmptyStateTitle>
            <EmptyStateDescription>
              Quotes sent to clients will appear here while waiting for a response.
            </EmptyStateDescription>
          </EmptyState>
        </Card>
      ) : (
        <div className="overflow-hidden rounded-md border border-border/60 bg-muted/15">
          <div className="max-h-[336px] overflow-y-auto">
            <Table className={requestTableClassName}>
              <RequestTableColumnGroup />
              <TableHeader>
                <TableRow className="border-border/60 bg-muted/30 hover:bg-muted/30">
                  <TableHead className={`${requestTableHeadClassName} pl-4`}>
                    Type
                  </TableHead>
                  <TableHead className={requestTableHeadClassName}>
                    Client
                  </TableHead>
                  <TableHead className={requestTableHeadClassName}>
                    Request
                  </TableHead>
                  <TableHead className={requestTableHeadClassName}>
                    State
                  </TableHead>
                  <TableHead className={requestTableHeadClassName}>
                    Scope
                  </TableHead>
                  <TableHead className={requestTableHeadClassName}>
                    Estimate
                  </TableHead>
                  <TableHead className={`${requestTableHeadClassName} text-right`}>
                    Updated
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <PendingRow key={request.id} request={request} />
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </section>
  )
}

function SourceIcon({ source }: { source: string }) {
  switch (source) {
    case "manual":
      return <PenTool className="size-3.5 text-muted-foreground" />
    case "github":
      return <GitPullRequest className="size-3.5 text-muted-foreground" />
    case "email":
    default:
      return <Mail className="size-3.5 text-muted-foreground" />
  }
}

function PendingRow({ request }: { request: PendingRequest }) {
  const source = request.source || "email"
  const isAlert = source === "github" || request.risk_level === "high"
  const quotedAmount = request.cost_max
    ? `$${(request.cost_min ?? 0).toLocaleString()}-$${request.cost_max.toLocaleString()}`
    : null

  return (
    <TableRow
      className={cn(
        "border-l-[3px] border-l-sky-500 border-border/50 bg-muted/20 hover:bg-muted/30",
        isAlert && "border-l-amber-500"
      )}
    >
      <TableCell className="py-2.5 pl-4">
        <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted/70 text-muted-foreground">
          <SourceIcon source={source} />
        </div>
      </TableCell>
      <TableCell className="px-3 py-2.5">
        <div className="min-w-0">
          <Link
            href={`/projects/${request.project?.id}/requests/${request.id}`}
            className="block max-w-44 truncate text-sm/5 font-medium text-foreground transition-colors hover:text-primary"
          >
            {request.project?.client_name}
          </Link>
          <span className="block max-w-44 truncate text-xs/5 text-muted-foreground">
            {request.project?.name}
          </span>
        </div>
      </TableCell>
      <TableCell className="px-3 py-2.5">
        <Link
          href={`/projects/${request.project?.id}/requests/${request.id}`}
          className={cn(
            "block max-w-[34rem] truncate text-sm/5 transition-colors hover:text-primary",
            isAlert ? "font-medium text-amber-500" : "text-foreground"
          )}
        >
          {isAlert ? <AlertTriangle className="mr-1 inline size-3.5 -translate-y-px" /> : null}
          {request.raw_email_subject || request.raw_email_body || "Untitled request"}
        </Link>
      </TableCell>
      <TableCell className="px-3 py-2.5">
        <StatusBadge status={request.status} />
      </TableCell>
      <TableCell className="px-3 py-2.5">
        {request.classification ? (
          <ClassificationBadge classification={request.classification} />
        ) : (
          <Tag variant="outline">Pending</Tag>
        )}
      </TableCell>
      <TableCell className="px-3 py-2.5">
        <span className="whitespace-nowrap text-sm/5 font-medium text-foreground">
          {quotedAmount ?? "—"}
        </span>
      </TableCell>
      <TableCell className="px-3 py-2.5 text-right">
        <span className="whitespace-nowrap font-mono text-xs text-muted-foreground">
          {new Date(request.updated_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </TableCell>
    </TableRow>
  )
}
