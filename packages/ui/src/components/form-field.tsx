import * as React from "react"

import { cn } from "@workspace/ui/lib/utils"
import { Label } from "@workspace/ui/components/label"

function FormField({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="form-field"
      className={cn("space-y-1.5", className)}
      {...props}
    />
  )
}

function FormLabel({ className, ...props }: React.ComponentProps<typeof Label>) {
  return (
    <Label
      data-slot="form-label"
      className={cn("text-xs text-muted-foreground", className)}
      {...props}
    />
  )
}

function FormHint({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="form-hint"
      className={cn("text-xs text-muted-foreground/70", className)}
      {...props}
    />
  )
}

function FormError({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="form-error"
      className={cn(
        "rounded-md p-3 text-xs bg-destructive/10 border border-destructive/30 text-destructive",
        className
      )}
      {...props}
    />
  )
}

export { FormField, FormLabel, FormHint, FormError }
