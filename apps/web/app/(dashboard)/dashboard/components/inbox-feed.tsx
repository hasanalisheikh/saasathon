import Link from "next/link"
import { cn } from "@workspace/ui/lib/utils"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import {
  EmptyState,
  EmptyStateTitle,
  EmptyStateDescription,
} from "@workspace/ui/components/empty-state"
import {
  ClassificationBadge,
  getClassificationColorClass,
} from "@workspace/ui/components/status-badge"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import { Mail, MessageSquare, PenTool, GitPullRequest, AlertTriangle } from "lucide-react"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface InboxFeedProps {
  requests: any[]
}

export function InboxFeed({ requests }: InboxFeedProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-lg font-semibold tracking-tight">Collective Inbox</h2>
        {requests.length > 0 && (
          <Badge variant="outline" className="bg-primary/15 text-primary border-primary/30">
            {requests.length} needs review
          </Badge>
        )}
      </div>

      {!requests.length ? (
        <Card className="flex-1 flex items-center justify-center border-dashed bg-muted/20">
          <EmptyState>
            <EmptyStateTitle>Inbox is clear</EmptyStateTitle>
            <EmptyStateDescription>
              Incoming job requests, widget comments, and GitHub alerts will appear here.
            </EmptyStateDescription>
          </EmptyState>
        </Card>
      ) : (
        <ScrollArea className="flex-1 -mx-4 px-4 h-[500px]">
          <div className="space-y-3 pb-4">
            {requests.map((req) => (
              <RequestCard key={req.id} request={req} />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  )
}

function SourceIcon({ source }: { source: string }) {
  switch (source) {
    case 'widget':
      return <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />
    case 'manual':
      return <PenTool className="w-3.5 h-3.5 text-muted-foreground" />
    case 'github':
      return <GitPullRequest className="w-3.5 h-3.5 text-muted-foreground" />
    case 'email':
    default:
      return <Mail className="w-3.5 h-3.5 text-muted-foreground" />
  }
}


// eslint-disable-next-line @typescript-eslint/no-explicit-any
function RequestCard({ request }: { request: any }) {
  const classification = request.classification as string
  const colorClass = getClassificationColorClass(classification)
  const source = (request.source as string) || "email"
  
  // Highlight GitHub alerts as high priority if unapproved
  const isAlert = source === "github" || request.risk_level === "high"

  return (
    <Link
      href={`/projects/${(request.project as Record<string, string>)?.id}/requests/${request.id as string}`}
      className="block group"
    >
      <Card
        className={cn(
          "transition-all duration-200 hover:ring-2 hover:ring-foreground/20 border-l-[3px]",
          colorClass,
          "bg-surface shadow-sm hover:shadow-md",
          isAlert && "bg-amber-900/10 border-amber-500/50"
        )}
      >
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-6 h-6 rounded-md bg-muted/50 border border-border/50">
                <SourceIcon source={source} />
              </div>
              <span className="text-sm font-medium text-foreground">
                {(request.project as Record<string, string>)?.client_name}
                <span className="text-muted-foreground ml-2 font-normal hidden sm:inline-block">
                  on {(request.project as Record<string, string>)?.name}
                </span>
              </span>
            </div>
            <span className="text-xs text-muted-foreground font-mono">
              {new Date(request.created_at as string).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          
          <p className={cn("text-sm line-clamp-2", isAlert ? "text-amber-500/90 font-medium" : "text-muted-foreground")}>
            {isAlert && <AlertTriangle className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />}
            {(request.raw_email_subject as string) ||
              (request.raw_email_body as string)}
          </p>
          
          <div className="flex items-center gap-2">
            {classification && (
              <ClassificationBadge classification={classification} />
            )}
            {classification === "out_of_scope" && request.cost_min && request.cost_max && (
              <span className="text-xs font-medium text-amber-500">
                Est: ${(request.cost_min as number).toLocaleString()}–$
                {(request.cost_max as number).toLocaleString()}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
