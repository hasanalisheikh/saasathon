import { FileTextIcon } from "lucide-react"
import {
  EmptyState,
  EmptyStateIcon,
  EmptyStateTitle,
  EmptyStateDescription,
} from "@workspace/ui/components/empty-state"

export default function DocumentsPage() {
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <h1 className="text-lg font-semibold mb-6">Documents</h1>
      <EmptyState>
        <EmptyStateIcon>
          <FileTextIcon />
        </EmptyStateIcon>
        <EmptyStateTitle>No documents yet</EmptyStateTitle>
        <EmptyStateDescription>
          Documents related to your projects will appear here.
        </EmptyStateDescription>
      </EmptyState>
    </div>
  )
}
