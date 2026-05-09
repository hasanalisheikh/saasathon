import { MetricCard } from "@workspace/ui/components/metric-card"

interface DashboardMetricsProps {
  requestsThisMonth: number
  protectedThisMonth: number
  approvalRate: number | null
  averageQuoteValue: number
}

export function DashboardMetrics({
  requestsThisMonth,
  protectedThisMonth,
  approvalRate,
  averageQuoteValue,
}: DashboardMetricsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        label="Protected This Month"
        value={`$${Math.round(protectedThisMonth).toLocaleString()}`}
        accent="neutral"
      />
      <MetricCard
        label="Approval Rate"
        value={approvalRate === null ? "—" : `${approvalRate}%`}
        accent="green"
      />
      <MetricCard
        label="Average Quote"
        value={`$${Math.round(averageQuoteValue).toLocaleString()}`}
      />
      <MetricCard
        label="Requests This Month"
        value={String(requestsThisMonth)}
      />
    </div>
  )
}
