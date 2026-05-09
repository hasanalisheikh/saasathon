import * as React from "react"

import { cn } from "@workspace/ui/lib/utils"
import { Card, CardContent } from "@workspace/ui/components/card"

type MetricAccent = "default" | "neutral" | "red" | "green"

interface MetricCardProps extends React.ComponentProps<typeof Card> {
  label: string
  value: string
  accent?: MetricAccent
  /** Enlarges the value for hero numbers */
  large?: boolean
}

const accentClasses: Record<MetricAccent, string> = {
  default: "text-foreground",
  neutral: "text-foreground",
  red: "text-destructive",
  green: "text-emerald-500",
}

function MetricCard({
  label,
  value,
  accent = "default",
  large = false,
  className,
  ...props
}: MetricCardProps) {
  return (
    <Card className={cn("gap-2 bg-muted/25 dark:bg-muted/30", className)} {...props}>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-1">{label}</p>
        <p
          className={cn(
            large ? "text-3xl font-light" : "text-2xl font-semibold",
            accentClasses[accent]
          )}
        >
          {value}
        </p>
      </CardContent>
    </Card>
  )
}

export { MetricCard }
export type { MetricCardProps, MetricAccent }
