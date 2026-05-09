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
} from "@workspace/ui/components/status-badge"
import { Mail, PenTool, GitPullRequest, AlertTriangle } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"

type InboxRequest = {
  id: string
  raw_email_subject: string | null
  raw_email_body: string | null
  classification: string | null
  cost_min: number | null
  cost_max: number | null
  source: string | null
  analysis_status: string | null
  risk_level: string | null
  created_at: string
  project: {
    id: string
    name: string
    client_name: string
  } | null
}

interface InboxFeedProps {
  requests: InboxRequest[]
}

export function InboxFeed({ requests }: InboxFeedProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold tracking-tight">Inbox</h2>
        {requests.length > 0 && (
          <Badge variant="outline" className="text-muted-foreground">
            {requests.length}
          </Badge>
        )}
      </div>

      {!requests.length ? (
        <Card className="flex min-h-[320px] items-center justify-center border-dashed bg-muted/20">
          <EmptyState>
            <EmptyStateTitle>Inbox is clear.</EmptyStateTitle>
            <EmptyStateDescription>
              New client requests will appear here.
            </EmptyStateDescription>
          </EmptyState>
        </Card>
      ) : (
        <div className="overflow-hidden rounded-md border border-border/60 bg-muted/15">
          <div className="max-h-[336px] overflow-y-auto">
            <Table className="text-sm">
              <TableHeader>
                <TableRow className="border-border/60 bg-muted/30 hover:bg-muted/30">
                  <TableHead className="h-9 w-12 pl-4 text-sm/5 font-normal text-muted-foreground">
                    Type
                  </TableHead>
                  <TableHead className="h-9 min-w-40 px-3 text-sm/5 font-normal text-muted-foreground">
                    Client
                  </TableHead>
                  <TableHead className="h-9 min-w-72 px-3 text-sm/5 font-normal text-muted-foreground">
                    Request
                  </TableHead>
                  <TableHead className="h-9 px-3 text-sm/5 font-normal text-muted-foreground">
                    State
                  </TableHead>
                  <TableHead className="h-9 px-3 text-sm/5 font-normal text-muted-foreground">
                    Scope
                  </TableHead>
                  <TableHead className="h-9 px-3 text-sm/5 font-normal text-muted-foreground">
                    Estimate
                  </TableHead>
                  <TableHead className="h-9 px-3 text-right text-sm/5 font-normal text-muted-foreground">
                    Updated
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <RequestRow key={request.id} request={request} />
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
    case 'manual':
      return <PenTool className="w-3.5 h-3.5 text-muted-foreground" />
    case 'github':
      return <GitPullRequest className="w-3.5 h-3.5 text-muted-foreground" />
    case 'email':
    default:
      return <Mail className="w-3.5 h-3.5 text-muted-foreground" />
  }
}


function RequestRow({ request }: { request: InboxRequest }) {
  const classification = request.classification
  const source = request.source || "email"
  
  // Highlight GitHub alerts as high priority if unapproved
  const isAlert = source === "github" || request.risk_level === "high"
  const estimate =
    classification === "out_of_scope" && request.cost_min && request.cost_max
      ? `$${request.cost_min.toLocaleString()}-$${request.cost_max.toLocaleString()}`
      : null
  const reviewState = getReviewState(request.analysis_status)

  return (
    <TableRow
      className={cn(
        "border-border/50 bg-muted/20 hover:bg-muted/30",
        getReviewAccentClass(classification),
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
        <Tag variant="outline" className={reviewState.className}>
          {reviewState.label}
        </Tag>
      </TableCell>
      <TableCell className="px-3 py-2.5">
        {classification ? (
          <ClassificationBadge classification={classification} />
        ) : (
          <span className="text-sm/5 text-muted-foreground">Pending</span>
        )}
      </TableCell>
      <TableCell className="px-3 py-2.5">
        <span className={cn("whitespace-nowrap text-sm/5", estimate ? "font-medium text-amber-500" : "text-muted-foreground")}>
          {estimate ?? "—"}
        </span>
      </TableCell>
      <TableCell className="px-3 py-2.5 text-right">
        <span className="whitespace-nowrap font-mono text-xs text-muted-foreground">
          {new Date(request.created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </TableCell>
    </TableRow>
  )
}

function getReviewAccentClass(classification: string | null): string {
  switch (classification) {
    case "out_of_scope":
      return "border-l-[3px] border-l-red-500"
    case "in_scope":
      return "border-l-[3px] border-l-emerald-500"
    case "ambiguous":
      return "border-l-[3px] border-l-amber-500"
    case "clarification_needed":
      return "border-l-[3px] border-l-sky-500"
    default:
      return "border-l-[3px] border-l-border"
  }
}

function getReviewState(analysisStatus: string | null): {
  label: string
  className: string
} {
  switch (analysisStatus) {
    case "queued":
    case "running":
      return {
        label: "Analysing",
        className: "border-sky-500/25 bg-sky-500/10 text-sky-300",
      }
    case "failed":
      return {
        label: "Needs input",
        className: "border-red-500/25 bg-red-500/10 text-red-300",
      }
    default:
      return {
        label: "Needs review",
        className: "border-border bg-input/20 text-muted-foreground dark:bg-input/30",
      }
  }
}
