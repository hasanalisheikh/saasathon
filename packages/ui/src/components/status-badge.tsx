import * as React from "react"

import { cn } from "@workspace/ui/lib/utils"
import { Badge } from "@workspace/ui/components/badge"

/* ─── Classification ──────────────────────────────────────────────────── */

const classificationConfig = {
  in_scope:               { label: "IN SCOPE",  variant: "default" as const },
  out_of_scope:           { label: "OUT OF SCOPE", variant: "destructive" as const },
  ambiguous:              { label: "AMBIGUOUS", variant: "secondary" as const },
  clarification_needed:   { label: "CLARIFY",  variant: "outline" as const },
} as const

type Classification = keyof typeof classificationConfig

interface ClassificationBadgeProps extends Omit<React.ComponentProps<typeof Badge>, "variant"> {
  classification: Classification | string | null
}

function ClassificationBadge({
  classification,
  className,
  ...props
}: ClassificationBadgeProps) {
  if (!classification) return null
  const config = classificationConfig[classification as Classification]
  if (!config) return null

  return (
    <Badge
      variant={config.variant}
      className={cn(
        "uppercase tracking-wider text-[0.6rem] font-medium",
        className
      )}
      {...props}
    >
      {config.label}
    </Badge>
  )
}

/* ─── Request Status ──────────────────────────────────────────────────── */

const statusConfig = {
  pending_review:    { label: "Pending",  variant: "secondary" as const },
  sent_to_client:    { label: "Sent",     variant: "outline" as const },
  approved:          { label: "Approved", variant: "default" as const },
  declined:          { label: "Declined", variant: "destructive" as const },
  deferred:          { label: "Deferred", variant: "outline" as const },
  accepted_in_scope: { label: "In Scope", variant: "default" as const },
} as const

type RequestStatus = keyof typeof statusConfig

interface StatusBadgeProps extends Omit<React.ComponentProps<typeof Badge>, "variant"> {
  status: RequestStatus | string
}

function StatusBadge({ status, className, ...props }: StatusBadgeProps) {
  const config = statusConfig[status as RequestStatus] ?? {
    label: status,
    variant: "outline" as const,
  }

  return (
    <Badge
      variant={config.variant}
      className={cn("text-[0.6rem] font-medium", className)}
      {...props}
    >
      {config.label}
    </Badge>
  )
}

/* ─── Project Status ──────────────────────────────────────────────────── */

const projectStatusConfig = {
  active:    { label: "Active",    variant: "default" as const },
  completed: { label: "Completed", variant: "secondary" as const },
  archived:  { label: "Archived",  variant: "outline" as const },
} as const

type ProjectStatus = keyof typeof projectStatusConfig

interface ProjectStatusBadgeProps extends Omit<React.ComponentProps<typeof Badge>, "variant"> {
  status: ProjectStatus | string
}

function ProjectStatusBadge({ status, className, ...props }: ProjectStatusBadgeProps) {
  const config = projectStatusConfig[status as ProjectStatus] ?? {
    label: status,
    variant: "outline" as const,
  }

  return (
    <Badge
      variant={config.variant}
      className={cn(
        "uppercase tracking-wider text-[0.6rem] font-medium rounded-full",
        className
      )}
      {...props}
    >
      {config.label}
    </Badge>
  )
}

/* ─── Source Badge ─────────────────────────────────────────────────────── */

const sourceConfig = {
  email:  { variant: "default" as const },
  widget: { variant: "secondary" as const },
  manual: { variant: "outline" as const },
} as const

type RequestSource = keyof typeof sourceConfig

interface SourceBadgeProps extends Omit<React.ComponentProps<typeof Badge>, "variant"> {
  source: RequestSource | string
}

function SourceBadge({ source, className, ...props }: SourceBadgeProps) {
  const config = sourceConfig[source as RequestSource] ?? {
    variant: "outline" as const,
  }

  return (
    <Badge
      variant={config.variant}
      className={cn(
        "uppercase tracking-wider text-[0.6rem] font-medium",
        className
      )}
      {...props}
    >
      {source}
    </Badge>
  )
}

/* ─── Classification color helper ─────────────────────────────────────── */

function getClassificationColorClass(classification: string | null): string {
  switch (classification) {
    case "out_of_scope":         return "border-destructive bg-destructive/10"
    case "in_scope":             return "border-primary bg-primary/10"
    case "ambiguous":            return "border-secondary bg-secondary/10"
    case "clarification_needed": return "border-muted bg-muted/10"
    default:                     return "border-border bg-transparent"
  }
}

export {
  ClassificationBadge,
  StatusBadge,
  ProjectStatusBadge,
  SourceBadge,
  getClassificationColorClass,
}
export type {
  Classification,
  RequestStatus,
  ProjectStatus,
  RequestSource,
}
