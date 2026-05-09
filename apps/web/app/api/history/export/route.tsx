import React, { type JSXElementConstructor } from "react"
import { NextRequest, NextResponse } from "next/server"
import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
  type DocumentProps,
} from "@react-pdf/renderer"

import { statusLabel } from "@/lib/utils"
import { createClient } from "@/lib/supabase/server"
import type { Classification, RequestStatus } from "@/types"

type ExportFormat = "csv" | "pdf"
type HistoryEventType =
  | "requested"
  | "sent"
  | "approved"
  | "declined"
  | "delivery"
type ScopeFilter = Exclude<Classification, null> | "all" | "unclassified"
type ExportFieldId =
  | "date"
  | "project"
  | "client"
  | "event"
  | "request"
  | "from"
  | "status"
  | "scope"
  | "action_point"

type HistoryProject = {
  id: string
  name: string
  client_name: string
}

type HistoryRequest = {
  id: string
  project_id: string
  raw_email_subject: string | null
  raw_email_body: string
  raw_email_from: string | null
  classification: Classification
  status: RequestStatus
  timeline_impact_days: number | null
  approved_at: string | null
  declined_at: string | null
  created_at: string
  updated_at: string
  project: HistoryProject | null
}

type HistoryEvent = {
  id: string
  request: HistoryRequest
  type: HistoryEventType
  title: string
  date: string
}

type ExportFilters = {
  dateFrom: string
  dateTo: string
  fields: ExportFieldId[]
  from: string
  projectId: string
  query: string
  scope: ScopeFilter
  status: RequestStatus | "all"
}

const TEXT_PRIMARY = "#111827"
const TEXT_SECONDARY = "#6b7280"
const BORDER = "#e5e7eb"
const SURFACE = "#f9fafb"
const ALL_EXPORT_FIELDS: ExportFieldId[] = [
  "date",
  "project",
  "client",
  "event",
  "request",
  "from",
  "status",
  "scope",
  "action_point",
]

const styles = StyleSheet.create({
  page: {
    color: TEXT_PRIMARY,
    fontFamily: "Helvetica",
    fontSize: 8,
    lineHeight: 1.45,
    paddingBottom: 40,
    paddingHorizontal: 36,
    paddingTop: 40,
  },
  header: {
    alignItems: "flex-start",
    borderBottomColor: BORDER,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
    paddingBottom: 12,
  },
  brand: {
    fontFamily: "Helvetica-Bold",
    fontSize: 14,
    letterSpacing: 0,
  },
  title: {
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
    textAlign: "right",
  },
  subtitle: {
    color: TEXT_SECONDARY,
    fontSize: 8,
    marginTop: 2,
    textAlign: "right",
  },
  filterBar: {
    backgroundColor: SURFACE,
    borderRadius: 4,
    flexDirection: "row",
    gap: 16,
    marginBottom: 16,
    padding: 10,
  },
  filterItem: {
    flex: 1,
  },
  label: {
    color: TEXT_SECONDARY,
    fontFamily: "Helvetica-Bold",
    fontSize: 6,
    letterSpacing: 0.5,
    marginBottom: 2,
    textTransform: "uppercase",
  },
  value: {
    fontSize: 8,
  },
  table: {
    borderColor: BORDER,
    borderRadius: 4,
    borderWidth: 1,
  },
  tableHeader: {
    backgroundColor: SURFACE,
    borderBottomColor: BORDER,
    borderBottomWidth: 1,
    flexDirection: "row",
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  tableRow: {
    borderBottomColor: BORDER,
    borderBottomWidth: 1,
    flexDirection: "row",
    paddingHorizontal: 8,
    paddingVertical: 7,
  },
  headerText: {
    color: TEXT_SECONDARY,
    fontFamily: "Helvetica-Bold",
    fontSize: 6,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  cellText: {
    fontSize: 8,
  },
  colDate: { width: "14%", paddingRight: 8 },
  colProject: { width: "16%", paddingRight: 8 },
  colClient: { width: "14%", paddingRight: 8 },
  colEvent: { width: "18%", paddingRight: 8 },
  colRequest: { width: "22%", paddingRight: 8 },
  colFrom: { width: "18%", paddingRight: 8 },
  colStatus: { width: "15%", paddingRight: 8 },
  colScope: { width: "15%", paddingRight: 8 },
  colAction: { width: "30%", paddingRight: 8 },
  empty: {
    borderColor: BORDER,
    borderRadius: 4,
    borderWidth: 1,
    color: TEXT_SECONDARY,
    padding: 18,
    textAlign: "center",
  },
  footer: {
    bottom: 20,
    color: TEXT_SECONDARY,
    flexDirection: "row",
    fontSize: 7,
    justifyContent: "space-between",
    left: 36,
    position: "absolute",
    right: 36,
  },
})

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const url = new URL(req.url)
  const format = getExportFormat(url.searchParams.get("format"))
  const filters: ExportFilters = {
    dateFrom: url.searchParams.get("date_from")?.trim() ?? "",
    dateTo: url.searchParams.get("date_to")?.trim() ?? "",
    fields: getExportFields(url.searchParams.get("fields")),
    from: url.searchParams.get("from")?.trim() ?? "",
    projectId:
      url.searchParams.get("project_id") ?? url.searchParams.get("project") ?? "all",
    query: url.searchParams.get("q")?.trim() ?? "",
    scope: getScopeFilter(url.searchParams.get("scope")),
    status: getStatusFilter(url.searchParams.get("status")),
  }

  const { data: projects, error: projectsError } = await supabase
    .from("projects")
    .select("id, name, client_name")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .returns<HistoryProject[]>()

  if (projectsError) {
    return NextResponse.json({ error: projectsError.message }, { status: 500 })
  }

  const ownedProjectIds = (projects ?? []).map((project) => project.id)
  const selectedProject = (projects ?? []).find(
    (project) => project.id === filters.projectId
  )
  let requests: HistoryRequest[] = []

  try {
    requests =
      ownedProjectIds.length > 0
        ? await loadRequests(supabase, ownedProjectIds)
        : []
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not load request history",
      },
      { status: 500 }
    )
  }

  const visibleRequests = filterRequests(requests, filters)
  const events = visibleRequests
    .flatMap(buildEvents)
    .filter((event) => matchesDateRange(event.date, filters))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  if (format === "csv") {
    return createCsvResponse(events, filters.fields)
  }

  return createPdfResponse({
    events,
    fields: filters.fields,
    filters,
    projectName: selectedProject?.name ?? "All projects",
  })
}

async function loadRequests(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  projectIds: string[]
) {
  const { data, error } = await supabase
    .from("requests")
    .select(
      "id, project_id, raw_email_subject, raw_email_body, raw_email_from, classification, status, timeline_impact_days, approved_at, declined_at, created_at, updated_at, project:projects(id, name, client_name)"
    )
    .in("project_id", projectIds)
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []) as HistoryRequest[]
}

function filterRequests(requests: HistoryRequest[], filters: ExportFilters) {
  const query = filters.query.toLowerCase()
  const from = filters.from.toLowerCase()

  return requests.filter((request) => {
    const matchesProject =
      filters.projectId === "all" || request.project_id === filters.projectId
    const matchesStatus =
      filters.status === "all" || request.status === filters.status
    const matchesScope =
      filters.scope === "all"
        ? true
        : filters.scope === "unclassified"
          ? !request.classification
          : request.classification === filters.scope
    const matchesFrom =
      !from ||
      [request.raw_email_from ?? "", request.project?.client_name ?? ""].some(
        (value) => value.toLowerCase().includes(from)
      )
    const matchesQuery =
      !query ||
      [
        getRequestSubject(request),
        request.raw_email_body,
        request.raw_email_from ?? "",
        request.project?.name ?? "",
        request.project?.client_name ?? "",
        request.classification ?? "",
        statusLabel(request.status),
      ].some((value) => value.toLowerCase().includes(query))

    return (
      matchesProject &&
      matchesStatus &&
      matchesScope &&
      matchesFrom &&
      matchesQuery
    )
  })
}

function createCsvResponse(events: HistoryEvent[], fields: ExportFieldId[]) {
  const rows = [
    fields.map(getExportFieldLabel),
    ...events.map((event) =>
      fields.map((field) => getExportFieldValue(event, field))
    ),
  ]
  const csv = rows.map((row) => row.map(escapeCsvCell).join(",")).join("\r\n")

  return new NextResponse(csv, {
    headers: {
      "Content-Disposition": `attachment; filename="${exportFilename("csv")}"`,
      "Content-Type": "text/csv; charset=utf-8",
    },
  })
}

async function createPdfResponse({
  events,
  fields,
  filters,
  projectName,
}: {
  events: HistoryEvent[]
  fields: ExportFieldId[]
  filters: ExportFilters
  projectName: string
}) {
  const element = React.createElement(HistoryExportDocument, {
    events,
    fields,
    filters,
    projectName,
  }) as unknown as React.ReactElement<
    DocumentProps,
    JSXElementConstructor<DocumentProps>
  >
  const pdfBuffer = await renderToBuffer(element)

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Disposition": `attachment; filename="${exportFilename("pdf")}"`,
      "Content-Length": String(pdfBuffer.byteLength),
      "Content-Type": "application/pdf",
    },
  })
}

function HistoryExportDocument({
  events,
  fields,
  filters,
  projectName,
}: {
  events: HistoryEvent[]
  fields: ExportFieldId[]
  filters: ExportFilters
  projectName: string
}) {
  return (
    <Document
      author="Monad"
      subject="Filtered history action points"
      title="History Action Points"
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.brand}>MONAD</Text>
          <View>
            <Text style={styles.title}>History Action Points</Text>
            <Text style={styles.subtitle}>
              Generated {formatDateTime(new Date().toISOString())}
            </Text>
          </View>
        </View>

        <View style={styles.filterBar}>
          <View style={styles.filterItem}>
            <Text style={styles.label}>Project</Text>
            <Text style={styles.value}>{projectName}</Text>
          </View>
          <View style={styles.filterItem}>
            <Text style={styles.label}>Status</Text>
            <Text style={styles.value}>
              {filters.status === "all"
                ? "All statuses"
                : statusLabel(filters.status)}
            </Text>
          </View>
          <View style={styles.filterItem}>
            <Text style={styles.label}>Scope</Text>
            <Text style={styles.value}>{formatScope(filters.scope)}</Text>
          </View>
          <View style={styles.filterItem}>
            <Text style={styles.label}>Search</Text>
            <Text style={styles.value}>{filters.query || "None"}</Text>
          </View>
        </View>

        <View style={styles.filterBar}>
          <View style={styles.filterItem}>
            <Text style={styles.label}>From</Text>
            <Text style={styles.value}>{filters.from || "Any sender"}</Text>
          </View>
          <View style={styles.filterItem}>
            <Text style={styles.label}>Date range</Text>
            <Text style={styles.value}>
              {formatDateRange(filters.dateFrom, filters.dateTo)}
            </Text>
          </View>
          <View style={styles.filterItem}>
            <Text style={styles.label}>Rows</Text>
            <Text style={styles.value}>{events.length}</Text>
          </View>
          <View style={styles.filterItem}>
            <Text style={styles.label}>Fields</Text>
            <Text style={styles.value}>
              {fields.map(getExportFieldLabel).join(", ")}
            </Text>
          </View>
        </View>

        {events.length ? (
          <View style={styles.table}>
            <View fixed style={styles.tableHeader}>
              {fields.map((field) => (
                <View key={field} style={getPdfColumnStyle(field, fields.length)}>
                  <Text style={styles.headerText}>{getExportFieldLabel(field)}</Text>
                </View>
              ))}
            </View>

            {events.map((event) => (
              <View key={event.id} wrap={false} style={styles.tableRow}>
                {fields.map((field) => (
                  <View key={field} style={getPdfColumnStyle(field, fields.length)}>
                    <Text style={styles.cellText}>
                      {getExportFieldValue(event, field)}
                    </Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.empty}>
            No matching history events for the selected filters.
          </Text>
        )}

        <View fixed style={styles.footer}>
          <Text>Filtered request history export</Text>
          <Text>MONAD</Text>
        </View>
      </Page>
    </Document>
  )
}

function buildEvents(request: HistoryRequest): HistoryEvent[] {
  const events: HistoryEvent[] = [
    {
      id: `${request.id}:requested`,
      request,
      type: "requested",
      title: "Request received",
      date: request.created_at,
    },
  ]

  if (
    request.status === "sent_to_client" ||
    Boolean(request.approved_at) ||
    Boolean(request.declined_at)
  ) {
    events.push({
      id: `${request.id}:sent`,
      request,
      type: "sent",
      title: "Scope reply sent",
      date: request.updated_at,
    })
  }

  if (request.approved_at) {
    events.push({
      id: `${request.id}:approved`,
      request,
      type: "approved",
      title: "Client approved",
      date: request.approved_at,
    })
  }

  if (request.declined_at) {
    events.push({
      id: `${request.id}:declined`,
      request,
      type: "declined",
      title: "Client declined",
      date: request.declined_at,
    })
  }

  if (request.timeline_impact_days && request.timeline_impact_days > 0) {
    const baseDate = request.approved_at ?? request.updated_at ?? request.created_at
    events.push({
      id: `${request.id}:delivery`,
      request,
      type: "delivery",
      title: `Estimated +${request.timeline_impact_days} day delivery impact`,
      date: addDays(baseDate, request.timeline_impact_days),
    })
  }

  return events
}

function getActionPoint(event: HistoryEvent) {
  if (event.type === "sent") {
    return "Follow up with the client if no decision has come back."
  }

  if (event.type === "approved") {
    return "Schedule the approved change and keep implementation moving."
  }

  if (event.type === "declined") {
    return "Close the request and keep the decision on record."
  }

  if (event.type === "delivery") {
    return "Plan the delivery impact against the project schedule."
  }

  switch (event.request.status) {
    case "pending_review":
      return "Review the request and decide whether it is in scope, needs clarification, or needs a quote."
    case "sent_to_client":
      return "Monitor for the client decision on the sent scope reply."
    case "approved":
      return "Confirm delivery ownership for the approved work."
    case "accepted_in_scope":
      return "Track this as accepted in-scope work."
    case "deferred":
      return "Revisit this deferred request during the next planning pass."
    case "declined":
      return "No delivery action needed; retain the declined record."
    default:
      return "Review this request history item."
  }
}

function getRequestSubject(request: HistoryRequest) {
  return (
    request.raw_email_subject ||
    request.raw_email_body.slice(0, 80) ||
    "Client request"
  )
}

function getExportFormat(value: string | null): ExportFormat {
  return value === "csv" ? "csv" : "pdf"
}

function getStatusFilter(value: string | null): RequestStatus | "all" {
  if (
    value === "pending_review" ||
    value === "sent_to_client" ||
    value === "approved" ||
    value === "declined" ||
    value === "deferred" ||
    value === "accepted_in_scope"
  ) {
    return value
  }

  return "all"
}

function getScopeFilter(value: string | null): ScopeFilter {
  if (
    value === "in_scope" ||
    value === "out_of_scope" ||
    value === "ambiguous" ||
    value === "clarification_needed" ||
    value === "unclassified"
  ) {
    return value
  }

  return "all"
}

function getExportFields(value: string | null): ExportFieldId[] {
  if (!value) {
    return ALL_EXPORT_FIELDS
  }

  const selectedFields = value
    .split(",")
    .map((field) => field.trim())
    .filter((field): field is ExportFieldId =>
      ALL_EXPORT_FIELDS.includes(field as ExportFieldId)
    )

  return selectedFields.length ? selectedFields : ALL_EXPORT_FIELDS
}

function formatClassification(classification: Classification) {
  if (!classification) return "Unclassified"

  return classification
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

function getExportFieldLabel(field: ExportFieldId) {
  switch (field) {
    case "date":
      return "Date"
    case "project":
      return "Project"
    case "client":
      return "Client"
    case "event":
      return "Event"
    case "request":
      return "Request"
    case "from":
      return "From"
    case "status":
      return "Status"
    case "scope":
      return "Scope"
    case "action_point":
      return "Action point"
  }
}

function getExportFieldValue(event: HistoryEvent, field: ExportFieldId) {
  switch (field) {
    case "date":
      return formatDateTime(event.date)
    case "project":
      return event.request.project?.name ?? "Project"
    case "client":
      return event.request.project?.client_name ?? "Client"
    case "event":
      return event.title
    case "request":
      return getRequestSubject(event.request)
    case "from":
      return (
        event.request.raw_email_from ??
        event.request.project?.client_name ??
        "Client"
      )
    case "status":
      return statusLabel(event.request.status)
    case "scope":
      return formatClassification(event.request.classification)
    case "action_point":
      return getActionPoint(event)
  }
}

function getPdfColumnStyle(field: ExportFieldId, fieldCount: number) {
  if (fieldCount <= 4) {
    return { flex: 1, paddingRight: 8 }
  }

  switch (field) {
    case "date":
      return styles.colDate
    case "project":
      return styles.colProject
    case "client":
      return styles.colClient
    case "event":
      return styles.colEvent
    case "request":
      return styles.colRequest
    case "from":
      return styles.colFrom
    case "status":
      return styles.colStatus
    case "scope":
      return styles.colScope
    case "action_point":
      return styles.colAction
  }
}

function addDays(date: string, days: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next.toISOString()
}

function escapeCsvCell(value: string) {
  return `"${value.replace(/"/g, '""')}"`
}

function exportFilename(extension: ExportFormat) {
  const date = new Date().toISOString().slice(0, 10)
  return `monad-history-action-points-${date}.${extension}`
}

function formatDateTime(date: string) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date))
}

function formatShortDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date))
}

function formatScope(scope: ScopeFilter) {
  if (scope === "all") return "All scope"
  if (scope === "unclassified") return "Unclassified"
  return formatClassification(scope)
}

function formatDateRange(dateFrom: string, dateTo: string) {
  if (dateFrom && dateTo) {
    return `${formatShortDate(dateFrom)} to ${formatShortDate(dateTo)}`
  }

  if (dateFrom) {
    return `From ${formatShortDate(dateFrom)}`
  }

  if (dateTo) {
    return `Until ${formatShortDate(dateTo)}`
  }

  return "All dates"
}

function matchesDateRange(
  value: string,
  filters: Pick<ExportFilters, "dateFrom" | "dateTo">
) {
  const eventDate = new Date(value)
  const eventTime = eventDate.getTime()

  if (Number.isNaN(eventTime)) {
    return false
  }

  if (filters.dateFrom) {
    const start = new Date(filters.dateFrom)
    start.setHours(0, 0, 0, 0)

    if (eventTime < start.getTime()) {
      return false
    }
  }

  if (filters.dateTo) {
    const end = new Date(filters.dateTo)
    end.setHours(23, 59, 59, 999)

    if (eventTime > end.getTime()) {
      return false
    }
  }

  return true
}
