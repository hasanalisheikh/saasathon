import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@workspace/ui/lib/utils"

const tagVariants = cva(
  "group/tag inline-flex h-6 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent px-2.5 py-0.5 text-xs/5 font-medium leading-normal tracking-normal capitalize whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default:
          "border-border/70 bg-muted/50 text-muted-foreground [a]:hover:bg-muted",
        primary:
          "border-primary/15 bg-primary/10 text-primary [a]:hover:bg-primary/15",
        success:
          "border-emerald-200 bg-emerald-50/80 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200",
        warning:
          "border-amber-200 bg-amber-50/80 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200",
        danger:
          "border-rose-200 bg-rose-50/80 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200",
        info:
          "border-sky-200 bg-sky-50/80 text-sky-700 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-200",
        indigo:
          "border-indigo-200 bg-indigo-50/80 text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-200",
        neutral:
          "border-stone-200 bg-stone-50/80 text-stone-700 dark:border-stone-500/25 dark:bg-stone-500/10 dark:text-stone-200",
        outline:
          "border-border/70 bg-background/40 text-muted-foreground dark:bg-muted/20 [a]:hover:bg-muted/50 [a]:hover:text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function formatTagLabel(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return ""

  return String(value)
    .replace(/[_-]+/g, " ")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\b[A-Za-z][A-Za-z0-9']*/g, (word) => {
      if (word.length <= 3 && word === word.toUpperCase()) return word

      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    })
}

function Tag({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof tagVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(tagVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "tag",
      variant,
    },
  })
}

export { Tag, tagVariants, formatTagLabel }
