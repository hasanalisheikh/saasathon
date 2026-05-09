import * as React from "react"

import { cn } from "@workspace/ui/lib/utils"
import { Badge } from "@workspace/ui/components/badge"

/* ─── Classification ──────────────────────────────────────────────────── */

const classificationConfig = {
  in_scope: {
    label: "IN SCOPE",
    className:
      "border-emerald-600/25 bg-emerald-50 text-emerald-700 dark:border-emerald-500/35 dark:bg-emerald-500/10 dark:text-emerald-300",
  },
  out_of_scope: {
    label: "OUT OF SCOPE",
    className:
      "border-red-600/25 bg-red-50 text-red-700 dark:border-red-500/35 dark:bg-red-500/10 dark:text-red-300",
  },
  ambiguous: {
    label: "AMBIGUOUS",
    className:
      "border-amber-600/25 bg-amber-50 text-amber-700 dark:border-amber-500/35 dark:bg-amber-500/10 dark:text-amber-300",
  },
  clarification_needed: {
    label: "CLARIFY",
    className:
      "border-sky-600/25 bg-sky-50 text-sky-700 dark:border-sky-500/35 dark:bg-sky-500/10 dark:text-sky-300",
  },
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
      variant="outline"
      className={cn(
        "uppercase tracking-wider text-[0.6rem] font-medium",
        config.className,
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
  pending_review: {
    label: "Pending",
    className:
      "border-amber-600/25 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300",
  },
  sent_to_client: {
    label: "Sent",
    className:
      "border-sky-600/25 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300",
  },
  approved: {
    label: "Approved Add-On",
    className:
      "border-emerald-600/25 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300",
  },
  declined: {
    label: "Declined",
    className:
      "border-red-600/25 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300",
  },
  deferred: {
    label: "Deferred",
    className:
      "border-violet-600/25 bg-violet-50 text-violet-700 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-300",
  },
  accepted_in_scope: {
    label: "Accepted In Scope",
    className:
      "border-emerald-600/25 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300",
  },
} as const

type RequestStatus = keyof typeof statusConfig

interface StatusBadgeProps extends Omit<React.ComponentProps<typeof Badge>, "variant"> {
  status: RequestStatus | string
}

function StatusBadge({ status, className, ...props }: StatusBadgeProps) {
  const config = statusConfig[status as RequestStatus] ?? {
    label: status,
    className: "border-border bg-muted/40 text-muted-foreground",
  }

  return (
    <Badge
      variant="outline"
      className={cn("text-[0.6rem] font-medium", config.className, className)}
      {...props}
    >
      {config.label}
    </Badge>
  )
}

/* ─── Project Status ──────────────────────────────────────────────────── */

const projectStatusConfig = {
  active: {
    label: "Active",
    className:
      "border-emerald-600/25 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300",
  },
  completed: {
    label: "Completed",
    className:
      "border-sky-600/25 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300",
  },
  archived: {
    label: "Archived",
    className: "border-border bg-muted/40 text-muted-foreground",
  },
} as const

type ProjectStatus = keyof typeof projectStatusConfig

interface ProjectStatusBadgeProps extends Omit<React.ComponentProps<typeof Badge>, "variant"> {
  status: ProjectStatus | string
}

function ProjectStatusBadge({ status, className, ...props }: ProjectStatusBadgeProps) {
  const config = projectStatusConfig[status as ProjectStatus] ?? {
    label: status,
    className: "border-border bg-muted/40 text-muted-foreground",
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        "uppercase tracking-wider text-[0.6rem] font-medium rounded-full",
        config.className,
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
  email: {
    className:
      "border-amber-600/20 bg-amber-50 text-amber-700 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-200",
  },
  widget: {
    className:
      "border-violet-600/20 bg-violet-50 text-violet-700 dark:border-violet-500/25 dark:bg-violet-500/10 dark:text-violet-200",
  },
  manual: {
    className:
      "border-sky-600/20 bg-sky-50 text-sky-700 dark:border-sky-500/25 dark:bg-sky-500/10 dark:text-sky-200",
  },
} as const

type RequestSource = keyof typeof sourceConfig

interface SourceBadgeProps extends Omit<React.ComponentProps<typeof Badge>, "variant"> {
  source: RequestSource | string
}

function SourceBadge({ source, className, ...props }: SourceBadgeProps) {
  const config = sourceConfig[source as RequestSource] ?? {
    className: "border-border bg-muted/40 text-muted-foreground",
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        "uppercase tracking-wider text-[0.6rem] font-medium",
        config.className,
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
    case "out_of_scope":         return "border-red-500/50 bg-red-500/10"
    case "in_scope":             return "border-emerald-500/50 bg-emerald-500/10"
    case "ambiguous":            return "border-amber-500/50 bg-amber-500/10"
    case "clarification_needed": return "border-sky-500/50 bg-sky-500/10"
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
