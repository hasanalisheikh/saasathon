import * as React from "react"
import { cn } from "@workspace/ui/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-input bg-background placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/30 aria-invalid:border-destructive aria-invalid:ring-destructive/20 flex min-h-[80px] w-full rounded-md border px-3 py-2 text-xs shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 resize-none",
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
