import { MetricCard } from "@workspace/ui/components/metric-card"

interface DashboardMetricsProps {
  requestsThisMonth: number
  outOfScopeCaught: number
  unbilledProtected: number
}

export function DashboardMetrics({
  requestsThisMonth,
  outOfScopeCaught,
  unbilledProtected,
}: DashboardMetricsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <MetricCard
        label="Unbilled Work Protected"
        value={`$${Math.round(unbilledProtected).toLocaleString()}`}
        accent="neutral"
        large
      />
      <MetricCard 
        label="Requests This Month" 
        value={String(requestsThisMonth)} 
      />
      <MetricCard 
        label="Out-of-Scope Caught" 
        value={String(outOfScopeCaught)} 
        accent="red" 
      />
    </div>
  )
}
