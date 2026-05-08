import { CalendarIcon } from "lucide-react"
import {
  EmptyState,
  EmptyStateIcon,
  EmptyStateTitle,
  EmptyStateDescription,
} from "@workspace/ui/components/empty-state"
import { PageHeader, PageTitle, PageDescription } from "@workspace/ui/components/page-header"

export default function CalendarPage() {
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-8">
      <PageHeader>
        <div>
          <PageTitle>Calendar</PageTitle>
          <PageDescription>
            Schedule meetings, track upcoming deadlines, and monitor project milestones.
          </PageDescription>
        </div>
      </PageHeader>

      <EmptyState>
        <EmptyStateIcon>
          <CalendarIcon />
        </EmptyStateIcon>
        <EmptyStateTitle>No events scheduled</EmptyStateTitle>
        <EmptyStateDescription>
          Your upcoming deadlines and milestones will show up here.
        </EmptyStateDescription>
      </EmptyState>
    </div>
  )
}
