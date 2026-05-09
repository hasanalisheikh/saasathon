"use client"

import * as React from "react"
import Link from "next/link"
import {
  CalendarClockIcon,
  CheckCircle2Icon,
  ClockIcon,
  SendIcon,
  XCircleIcon,
} from "lucide-react"

import { cn } from "@workspace/ui/lib/utils"
import { Tag } from "@workspace/ui/components/tag"
import { Calendar, CalendarDayButton } from "@workspace/ui/components/calendar"
import { Card, CardContent } from "@workspace/ui/components/card"
import {
  ClassificationBadge,
  StatusBadge,
} from "@workspace/ui/components/status-badge"

type CalendarOverviewEvent = {
  id: string
  href: string
  type: "requested" | "sent" | "approved" | "declined" | "delivery"
  title: string
  date: string
  subject: string
  projectName: string
  clientName: string
  status: string
  classification: string | null
}

type CalendarOverviewProps = {
  events: CalendarOverviewEvent[]
}

const eventTypeMeta = {
  requested: {
    icon: ClockIcon,
    className: "border-muted text-muted-foreground",
  },
  sent: {
    icon: SendIcon,
    className: "border-blue-400/60 text-blue-500",
  },
  approved: {
    icon: CheckCircle2Icon,
    className: "border-primary/60 text-primary",
  },
  declined: {
    icon: XCircleIcon,
    className: "border-destructive/60 text-destructive",
  },
  delivery: {
    icon: CalendarClockIcon,
    className: "border-primary/60 text-primary",
  },
} satisfies Record<
  CalendarOverviewEvent["type"],
  { icon: React.ComponentType<{ className?: string }>; className: string }
>

function CalendarOverview({ events }: CalendarOverviewProps) {
  const sortedEvents = React.useMemo(
    () =>
      [...events].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      ),
    [events]
  )
  const eventsByDate = React.useMemo(() => groupEventsByDate(sortedEvents), [sortedEvents])
  const defaultSelectedDate = React.useMemo(() => {
    const today = startOfDay(new Date())
    const nextEvent = sortedEvents.find(
      (event) => startOfDay(new Date(event.date)).getTime() >= today.getTime()
    )

    return nextEvent ? new Date(nextEvent.date) : today
  }, [sortedEvents])
  const [selectedDate, setSelectedDate] = React.useState(() => defaultSelectedDate)

  const selectedDateKey = toDateKey(selectedDate)
  const selectedEvents = eventsByDate.get(selectedDateKey) ?? []
  const eventDates = React.useMemo(
    () => Array.from(eventsByDate.keys()).map((key) => parseDateKey(key)),
    [eventsByDate]
  )
  const dayButtonComponents = React.useMemo(
    () => ({
      DayButton: (props: React.ComponentProps<typeof CalendarDayButton>) => {
        const dayEvents = eventsByDate.get(toDateKey(props.day.date)) ?? []

        return (
          <CalendarDayButton
            {...props}
            className={cn(
              props.className,
              dayEvents.length > 0 && "font-semibold text-primary"
            )}
          >
            {props.children}
            {dayEvents.length > 0 && (
              <span className="absolute bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full bg-primary group-data-[selected-single=true]/button:bg-primary-foreground" />
            )}
          </CalendarDayButton>
        )
      },
    }),
    [eventsByDate]
  )

  return (
    <Card className="bg-muted/25 dark:bg-muted/30">
      <CardContent className="pt-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(18rem,21rem)_1fr]">
          <div className="flex flex-col">
            <div className="mb-3 flex h-6 items-center">
              <h3 className="font-semibold leading-none tracking-tight">Request history</h3>
            </div>
            <div className="rounded-md border bg-muted/20 p-3">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date: Date | undefined) => {
                  if (date) setSelectedDate(date)
                }}
                modifiers={{ hasEvents: eventDates }}
                modifiersClassNames={{
                  hasEvents: "text-primary",
                }}
                components={dayButtonComponents}
                className="w-full p-0 [--cell-size:--spacing(9)]"
                classNames={{
                  root: "w-full",
                  months: "relative flex w-full flex-col gap-4",
                  month: "flex w-full flex-col gap-4",
                  table: "w-full border-collapse",
                }}
              />
            </div>
          </div>

          <div className="flex min-w-0 flex-col">
            <div className="mb-3 flex h-6 shrink-0 items-center">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">
                  {formatFullDate(selectedDate)}
                </span>
                <span>&middot;</span>
                <span>
                  {selectedEvents.length
                    ? `${selectedEvents.length} ${selectedEvents.length === 1 ? "event" : "events"}`
                    : "No events"}
                </span>
              </div>
            </div>

            {selectedEvents.length ? (
              <div className="max-h-[25rem] divide-y overflow-y-auto rounded-md border bg-muted/15">
                {selectedEvents.map((event) => (
                  <CalendarOverviewEventRow key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <div className="flex min-h-48 items-center justify-center rounded-md border border-dashed bg-muted/20 px-4 text-center text-sm text-muted-foreground">
                No request activity on this day.
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function CalendarOverviewEventRow({ event }: { event: CalendarOverviewEvent }) {
  const meta = eventTypeMeta[event.type]
  const Icon = meta.icon

  return (
    <Link
      href={event.href}
      className="block bg-muted/20 px-3 py-3 transition-colors hover:bg-muted/30"
    >
      <div className="flex min-w-0 items-start gap-3">
        <div
          className={cn(
            "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md border bg-muted/40",
            meta.className
          )}
        >
          <Icon className="size-3.5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
            <Tag variant="outline">{event.title}</Tag>
            <StatusBadge status={event.status} />
            <ClassificationBadge classification={event.classification} />
          </div>
          <p className="truncate text-sm font-medium">{event.subject}</p>
          <p className="mt-1 truncate text-xs text-muted-foreground">
            {event.projectName} · {event.clientName} · {formatTime(event.date)}
          </p>
        </div>
      </div>
    </Link>
  )
}

function groupEventsByDate(events: CalendarOverviewEvent[]) {
  return events.reduce((groups, event) => {
    const key = toDateKey(new Date(event.date))
    const dayEvents = groups.get(key) ?? []
    dayEvents.push(event)
    groups.set(key, dayEvents)
    return groups
  }, new Map<string, CalendarOverviewEvent[]>())
}

function toDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function parseDateKey(key: string) {
  const [year = 0, month = 1, day = 1] = key.split("-").map(Number)
  return new Date(year, month - 1, day)
}

function startOfDay(date: Date) {
  const next = new Date(date)
  next.setHours(0, 0, 0, 0)
  return next
}

function formatFullDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(date)
}

function formatTime(date: string) {
  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date))
}

export { CalendarOverview }
export type { CalendarOverviewEvent }
