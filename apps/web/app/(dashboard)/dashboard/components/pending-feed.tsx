import Link from "next/link"
import { Card, CardContent } from "@workspace/ui/components/card"
import {
  EmptyState,
  EmptyStateTitle,
  EmptyStateDescription,
} from "@workspace/ui/components/empty-state"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import { Clock } from "lucide-react"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface PendingFeedProps {
  requests: any[]
}

export function PendingFeed({ requests }: PendingFeedProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-lg font-semibold tracking-tight">Pending Client Approval</h2>
      </div>

      {!requests.length ? (
        <Card className="flex-1 flex items-center justify-center border-dashed bg-muted/20">
          <EmptyState>
            <EmptyStateTitle>No pending approvals</EmptyStateTitle>
            <EmptyStateDescription>
              Quotes sent to clients will appear here while waiting for a response.
            </EmptyStateDescription>
          </EmptyState>
        </Card>
      ) : (
        <ScrollArea className="flex-1 -mx-4 px-4 h-[500px]">
          <div className="space-y-3 pb-4">
            {requests.map((req) => (
              <PendingCard key={req.id} request={req} />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function PendingCard({ request }: { request: any }) {
  return (
    <Link
      href={`/projects/${(request.project as Record<string, string>)?.id}/requests/${request.id as string}`}
      className="block group"
    >
      <Card className="transition-all duration-200 hover:ring-2 hover:ring-foreground/20 bg-surface shadow-sm hover:shadow-md border-l-[3px] border-l-blue-500">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">
              {(request.project as Record<string, string>)?.client_name}
            </span>
            <div className="flex items-center text-xs text-muted-foreground font-mono">
              <Clock className="w-3 h-3 mr-1" />
              Sent {new Date(request.updated_at as string).toLocaleDateString()}
            </div>
          </div>
          
          <p className="text-sm truncate text-muted-foreground">
            {(request.raw_email_subject as string) ||
              (request.raw_email_body as string)}
          </p>
          
          {request.cost_max ? (
             <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
               <span className="text-xs text-muted-foreground">Quoted Amount</span>
               <span className="text-xs font-semibold text-foreground">
                 ${(request.cost_min as number).toLocaleString()}–$
                 {(request.cost_max as number).toLocaleString()}
               </span>
             </div>
          ) : null}
        </CardContent>
      </Card>
    </Link>
  )
}
