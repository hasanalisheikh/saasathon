"use client"

import * as React from "react"
import { type LucideIcon } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

type ViewSwitcherOption<T extends string> = {
  value: T
  label: string
  icon?: LucideIcon
}

interface ViewSwitcherProps<T extends string> {
  className?: string
  onValueChange: (value: T) => void
  options: ReadonlyArray<ViewSwitcherOption<T>>
  value: T
}

function ViewSwitcher<T extends string>({
  className,
  onValueChange,
  options,
  value,
}: ViewSwitcherProps<T>) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-md border border-border bg-muted/40 p-1",
        className
      )}
    >
      {options.map((option) => {
        const Icon = option.icon
        const isActive = option.value === value

        return (
          <Button
            key={option.value}
            variant={isActive ? "secondary" : "ghost"}
            size="sm"
            className="h-7 px-2.5"
            onClick={() => onValueChange(option.value)}
          >
            {Icon ? <Icon className="size-3.5" /> : null}
            <span>{option.label}</span>
          </Button>
        )
      })}
    </div>
  )
}

export { ViewSwitcher }
export type { ViewSwitcherOption }
