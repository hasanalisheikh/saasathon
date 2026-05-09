import * as React from "react"

import { cn } from "@workspace/ui/lib/utils"
import { Tag, formatTagLabel } from "@workspace/ui/components/tag"

/* ─── Classification ──────────────────────────────────────────────────── */

const classificationConfig = {
  in_scope: {
    label: "In Scope",
    className:
      "border-emerald-200 bg-emerald-50/80 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200",
  },
  out_of_scope: {
    label: "Out Of Scope",
    className:
      "border-rose-200 bg-rose-50/80 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200",
  },
  ambiguous: {
    label: "Ambiguous",
    className:
      "border-amber-200 bg-amber-50/80 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200",
  },
  clarification_needed: {
    label: "Clarify",
    className:
      "border-sky-200 bg-sky-50/80 text-sky-700 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-200",
  },
} as const

type Classification = keyof typeof classificationConfig

interface ClassificationBadgeProps extends Omit<React.ComponentProps<typeof Tag>, "variant"> {
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
    <Tag
      variant="outline"
      className={cn(config.className, className)}
      {...props}
    >
      {config.label}
    </Tag>
  )
}

/* ─── Request Status ──────────────────────────────────────────────────── */

const statusConfig = {
  pending_review: {
    label: "Pending",
    className:
      "border-amber-200 bg-amber-50/80 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200",
  },
  sent_to_client: {
    label: "Sent",
    className:
      "border-sky-200 bg-sky-50/80 text-sky-700 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-200",
  },
  approved: {
    label: "Approved Add-On",
    className:
      "border-emerald-200 bg-emerald-50/80 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200",
  },
  declined: {
    label: "Declined",
    className:
      "border-rose-200 bg-rose-50/80 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200",
  },
  deferred: {
    label: "Deferred",
    className:
      "border-stone-200 bg-stone-50/80 text-stone-700 dark:border-stone-500/25 dark:bg-stone-500/10 dark:text-stone-200",
  },
  accepted_in_scope: {
    label: "Accepted In Scope",
    className:
      "border-emerald-200 bg-emerald-50/80 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200",
  },
} as const

type RequestStatus = keyof typeof statusConfig

interface StatusBadgeProps extends Omit<React.ComponentProps<typeof Tag>, "variant"> {
  status: RequestStatus | string
}

function StatusBadge({ status, className, ...props }: StatusBadgeProps) {
  const config = statusConfig[status as RequestStatus] ?? {
    label: formatTagLabel(status),
    className: "border-border/70 bg-muted/40 text-muted-foreground",
  }

  return (
    <Tag
      variant="outline"
      className={cn(config.className, className)}
      {...props}
    >
      {config.label}
    </Tag>
  )
}

/* ─── Project Status ──────────────────────────────────────────────────── */

const projectStatusConfig = {
  active: {
    label: "Active",
    className:
      "border-emerald-200 bg-emerald-50/80 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200",
  },
  completed: {
    label: "Completed",
    className:
      "border-sky-200 bg-sky-50/80 text-sky-700 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-200",
  },
  archived: {
    label: "Archived",
    className: "border-border/70 bg-muted/40 text-muted-foreground",
  },
} as const

type ProjectStatus = keyof typeof projectStatusConfig

interface ProjectStatusBadgeProps extends Omit<React.ComponentProps<typeof Tag>, "variant"> {
  status: ProjectStatus | string
}

function ProjectStatusBadge({ status, className, ...props }: ProjectStatusBadgeProps) {
  const config = projectStatusConfig[status as ProjectStatus] ?? {
    label: formatTagLabel(status),
    className: "border-border/70 bg-muted/40 text-muted-foreground",
  }

  return (
    <Tag
      variant="outline"
      className={cn(
        "rounded-full",
        config.className,
        className
      )}
      {...props}
    >
      {config.label}
    </Tag>
  )
}

/* ─── Source Badge ─────────────────────────────────────────────────────── */

const sourceConfig = {
  email: {
    label: "Email",
    className:
      "border-amber-200 bg-amber-50/80 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200",
  },
  widget: {
    label: "Widget",
    className:
      "border-indigo-200 bg-indigo-50/80 text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-200",
  },
  manual: {
    label: "Manual",
    className:
      "border-sky-200 bg-sky-50/80 text-sky-700 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-200",
  },
  github: {
    label: "GitHub",
    className:
      "border-slate-200 bg-slate-50/80 text-slate-700 dark:border-slate-500/25 dark:bg-slate-500/10 dark:text-slate-200",
  },
} as const

type RequestSource = keyof typeof sourceConfig

interface SourceBadgeProps extends Omit<React.ComponentProps<typeof Tag>, "variant"> {
  source: RequestSource | string
}

function SourceBadge({ source, className, ...props }: SourceBadgeProps) {
  const config = sourceConfig[source as RequestSource] ?? {
    label: formatTagLabel(source),
    className: "border-border bg-muted/40 text-muted-foreground",
  }

  return (
    <Tag
      variant="outline"
      className={cn(config.className, className)}
      {...props}
    >
      {config.label}
    </Tag>
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
