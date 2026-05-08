import { CalendarIcon } from "lucide-react"
import {
  EmptyState,
  EmptyStateIcon,
  EmptyStateTitle,
  EmptyStateDescription,
} from "@workspace/ui/components/empty-state"

export default function CalendarPage() {
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <h1 className="text-lg font-semibold mb-6">Calendar</h1>
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
