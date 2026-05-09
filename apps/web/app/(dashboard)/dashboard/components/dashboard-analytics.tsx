"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts"
import { ChartContainer, ChartTooltipContent } from "@workspace/ui/components/chart"

interface AnalyticsProps {
  classificationData: {
    name: string
    value: number
    fill: string
  }[]
  conversionRate: number
  totalRequests: number
}

const chartConfig = {
  in_scope: {
    label: "In Scope",
    color: "hsl(var(--chart-1))",
  },
  out_of_scope: {
    label: "Out of Scope",
    color: "hsl(var(--chart-2))",
  },
  ambiguous: {
    label: "Ambiguous",
    color: "hsl(var(--chart-3))",
  },
}

export function DashboardAnalytics({ classificationData, conversionRate, totalRequests }: AnalyticsProps) {
  // If there's no data, we can show an empty state or a default doughnut
  const hasData = totalRequests > 0
  const displayData = hasData ? classificationData : [{ name: "No Data", value: 1, fill: "hsl(var(--muted))" }]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <Card className="flex flex-col">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Scope Breakdown</CardTitle>
          <CardDescription>All-time classification of requests</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center min-h-[200px]">
          <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <RechartsTooltip content={<ChartTooltipContent hideLabel />} />
                <Pie
                  data={displayData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {displayData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} className="stroke-background stroke-2" />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="flex flex-col justify-center bg-amber-900/5 border-amber-500/20">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-amber-500/80">Approval Conversion Rate</CardTitle>
          <CardDescription>Out-of-scope quotes successfully approved</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-1">
            <span className="text-5xl font-semibold text-amber-500">{conversionRate}%</span>
            <span className="text-sm text-muted-foreground">
              of out-of-scope work caught by Monad gets approved and paid by your clients.
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
