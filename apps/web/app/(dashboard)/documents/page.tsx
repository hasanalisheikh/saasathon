import { FileTextIcon } from "lucide-react"
import {
  EmptyState,
  EmptyStateIcon,
  EmptyStateTitle,
  EmptyStateDescription,
} from "@workspace/ui/components/empty-state"
import { PageHeader, PageTitle, PageDescription } from "@workspace/ui/components/page-header"

export default function DocumentsPage() {
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-8">
      <PageHeader>
        <div>
          <PageTitle>Documents</PageTitle>
          <PageDescription>
            Manage client legal contracts, hourly rates, and all legal documents you send out as a freelancer.
          </PageDescription>
        </div>
      </PageHeader>
      
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
