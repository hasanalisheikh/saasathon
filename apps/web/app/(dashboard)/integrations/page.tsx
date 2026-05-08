import { BlocksIcon } from "lucide-react"
import {
  EmptyState,
  EmptyStateIcon,
  EmptyStateTitle,
  EmptyStateDescription,
} from "@workspace/ui/components/empty-state"

export default function IntegrationsPage() {
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <h1 className="text-lg font-semibold mb-6">Integrations</h1>
      <EmptyState>
        <EmptyStateIcon>
          <BlocksIcon />
        </EmptyStateIcon>
        <EmptyStateTitle>No integrations connected</EmptyStateTitle>
        <EmptyStateDescription>
          Connect third-party services to streamline your workflow.
        </EmptyStateDescription>
      </EmptyState>
    </div>
  )
}
