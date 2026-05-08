import * as React from "react"

import { cn } from "@workspace/ui/lib/utils"

interface StepProgressProps extends React.ComponentProps<"div"> {
  currentStep: number
  totalSteps: number
}

function StepProgress({
  currentStep,
  totalSteps,
  className,
  ...props
}: StepProgressProps) {
  return (
    <div
      data-slot="step-progress"
      className={cn("flex gap-2", className)}
      {...props}
    >
      {Array.from({ length: totalSteps }, (_, i) => (
        <div
          key={i}
          className={cn(
            "h-1 flex-1 rounded-full transition-colors",
            i < currentStep ? "bg-primary" : "bg-border"
          )}
        />
      ))}
    </div>
  )
}

export { StepProgress }
export type { StepProgressProps }
