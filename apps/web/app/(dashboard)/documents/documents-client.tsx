"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  DownloadIcon,
  EllipsisIcon,
  FileTextIcon,
  LayoutGridIcon,
  ListIcon,
  PencilIcon,
  RefreshCwIcon,
  SaveIcon,
  SearchIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react"
import { toast } from "sonner"

import type { DocumentType, ExtractionStatus, ProjectDocument } from "@/types"
import { AddDocumentButton, DocumentUploadDialog } from "./document-upload-dialog"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent } from "@workspace/ui/components/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import {
  EmptyState,
  EmptyStateAction,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
} from "@workspace/ui/components/empty-state"
import { FormField, FormLabel } from "@workspace/ui/components/form-field"
import { Input } from "@workspace/ui/components/input"
import {
  PageActions,
  PageDescription,
  PageHeader,
  PageTitle,
} from "@workspace/ui/components/page-header"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { Textarea } from "@workspace/ui/components/textarea"
import { ViewSwitcher } from "@workspace/ui/components/view-switcher"
import { cn } from "@workspace/ui/lib/utils"

type ProjectOption = {
  id: string
  name: string
  client_name: string
}

type DocumentWithProject = ProjectDocument & {
  project?: ProjectOption | null
}

type DocumentsView = "rows" | "grid"
type DocumentCardLayout = "row" | "grid"

const DOCUMENT_TYPES: ReadonlyArray<{
  label: string
  value: DocumentType | "all"
}> = [
  { value: "all", label: "All types" },
  { value: "contract", label: "Contract" },
  { value: "proposal", label: "Proposal" },
  { value: "rate_card", label: "Rate card" },
  { value: "brief", label: "Brief" },
  { value: "other", label: "Other" },
]

const VIEW_OPTIONS = [
  { value: "rows", label: "Rows", icon: ListIcon },
  { value: "grid", label: "Grid", icon: LayoutGridIcon },
] as const

const nativeSelectClassName =
  "h-9 w-full rounded-md border border-input bg-input/20 px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 dark:bg-input/30"
const compactToolbarBadgeClassName =
  "h-9 rounded-md border-border bg-input/20 px-3 text-sm/5 font-medium text-muted-foreground"

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString()
}

function statusVariant(
  status: ExtractionStatus
): "default" | "destructive" | "secondary" {
  if (status === "completed") return "default"
  if (status === "failed") return "destructive"
  return "secondary"
}

function formatChipLabel(value: string): string {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

function getResponseError(
  payload: DocumentWithProject | { error?: string }
): string | undefined {
  if ("error" in payload) {
    return payload.error
  }

  return undefined
}

export function DocumentsClient({
  initialDocuments,
  projects,
  initialProjectId,
}: {
  initialDocuments: DocumentWithProject[]
  projects: ProjectOption[]
  initialProjectId: string
}) {
  const router = useRouter()
  const uploadFormRef = React.useRef<HTMLFormElement | null>(null)
  const [documents, setDocuments] =
    React.useState<DocumentWithProject[]>(initialDocuments)
  const [projectFilter, setProjectFilter] = React.useState(
    initialProjectId || "all"
  )
  const [typeFilter, setTypeFilter] =
    React.useState<DocumentType | "all">("all")
  const [tagFilter, setTagFilter] = React.useState("")
  const [view, setView] = React.useState<DocumentsView>("rows")
  const [uploadDialogOpen, setUploadDialogOpen] = React.useState(false)
  const [uploading, setUploading] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState("")
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [editDraft, setEditDraft] = React.useState({
    title: "",
    description: "",
    tags: "",
    document_type: "contract" as DocumentType,
    project_id: "",
  })

  const visibleDocuments = React.useMemo(() => {
    const normalizedQuery = tagFilter.trim().toLowerCase()

    return documents.filter((document) => {
      const matchesProject =
        projectFilter === "all" || document.project_id === projectFilter
      const matchesType =
        typeFilter === "all" || document.document_type === typeFilter
      const matchesSearch =
        !normalizedQuery ||
        [
          document.title,
          document.description ?? "",
          document.file_name,
          document.project?.name ?? "",
          document.project?.client_name ?? "",
          ...document.tags,
        ].some((value) => value.toLowerCase().includes(normalizedQuery))

      return matchesProject && matchesType && matchesSearch
    })
  }, [documents, projectFilter, tagFilter, typeFilter])

  const uploadDefaultProjectId = React.useMemo(
    () => (projectFilter !== "all" ? projectFilter : ""),
    [projectFilter]
  )

  async function loadDocuments() {
    setLoading(true)

    try {
      const res = await fetch("/api/documents")

      if (!res.ok) {
        throw new Error("Could not refresh documents")
      }

      setDocuments((await res.json()) as DocumentWithProject[])
    } catch (loadError) {
      toast.error(
        loadError instanceof Error
          ? loadError.message
          : "Could not refresh documents"
      )
    } finally {
      setLoading(false)
    }
  }

  async function handleUpload(formData: FormData) {
    setUploading(true)
    setError("")

    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      })

      const payload = (await res.json().catch(() => ({}))) as
        | DocumentWithProject
        | { error?: string }

      if (!res.ok) {
        setError(getResponseError(payload) ?? "Upload failed")
        return
      }

      setDocuments((current) => [payload as DocumentWithProject, ...current])
      setUploadDialogOpen(false)
      uploadFormRef.current?.reset()
      router.refresh()
      toast.success("Document uploaded")
    } finally {
      setUploading(false)
    }
  }

  function startEditing(document: DocumentWithProject) {
    setError("")
    setEditingId(document.id)
    setEditDraft({
      title: document.title,
      description: document.description ?? "",
      tags: document.tags.join(", "),
      document_type: document.document_type,
      project_id: document.project_id ?? "",
    })
  }

  async function saveEdit(documentId: string) {
    setError("")

    const res = await fetch(`/api/documents/${documentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: editDraft.title,
        description: editDraft.description,
        tags: editDraft.tags,
        document_type: editDraft.document_type,
        project_id: editDraft.project_id || null,
      }),
    })

    const payload = (await res.json().catch(() => ({}))) as
      | DocumentWithProject
      | { error?: string }

    if (!res.ok) {
      const message = getResponseError(payload) ?? "Save failed"
      setError(message)
      toast.error(message)
      return
    }

    setDocuments((current) =>
      current.map((document) =>
        document.id === documentId ? (payload as DocumentWithProject) : document
      )
    )
    setEditingId(null)
    router.refresh()
    toast.success("Document updated")
  }

  async function deleteDocument(documentId: string) {
    if (!window.confirm("Delete this document?")) return

    const res = await fetch(`/api/documents/${documentId}`, {
      method: "DELETE",
    })

    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string }
      toast.error(data.error ?? "Delete failed")
      return
    }

    setDocuments((current) =>
      current.filter((document) => document.id !== documentId)
    )
    router.refresh()
    toast.success("Document deleted")
  }

  async function downloadDocument(documentId: string) {
    const res = await fetch(`/api/documents/${documentId}/download`)

    if (!res.ok) {
      toast.error("Download failed")
      return
    }

    const data = (await res.json()) as { url?: string }

    if (!data.url) {
      toast.error("Download link unavailable")
      return
    }

    window.open(data.url, "_blank", "noopener,noreferrer")
  }

  function handleUploadDialogOpenChange(open: boolean) {
    setUploadDialogOpen(open)

    if (!open) {
      setError("")
      uploadFormRef.current?.reset()
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader>
        <div className="space-y-1">
          <PageTitle>Documents</PageTitle>
          <PageDescription>
            Contracts, proposals, briefs, and rate cards used as context for
            scope analysis.
          </PageDescription>
        </div>

        <PageActions>
          <AddDocumentButton onClick={() => setUploadDialogOpen(true)} />
        </PageActions>
      </PageHeader>

      <DocumentUploadDialog
        defaultProjectId={uploadDefaultProjectId}
        error={error}
        formRef={uploadFormRef}
        onOpenChange={handleUploadDialogOpenChange}
        onSubmit={(event) => {
          event.preventDefault()
          void handleUpload(new FormData(event.currentTarget))
        }}
        open={uploadDialogOpen}
        projects={projects}
        uploading={uploading}
      />

      <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end">
        <FormField>
          <FormLabel htmlFor="documents-search-filter">Search</FormLabel>
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="documents-search-filter"
              value={tagFilter}
              onChange={(event) => setTagFilter(event.target.value)}
              placeholder="Search documents"
              className="pl-8 sm:w-52"
            />
          </div>
        </FormField>

        <FormField>
          <FormLabel htmlFor="documents-project-filter">Project</FormLabel>
          <select
            id="documents-project-filter"
            value={projectFilter}
            onChange={(event) => setProjectFilter(event.target.value)}
            className={cn(nativeSelectClassName, "min-w-0 sm:w-56")}
          >
            <option value="all">All projects</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </FormField>

        <FormField>
          <FormLabel htmlFor="documents-type-filter">Type</FormLabel>
          <select
            id="documents-type-filter"
            value={typeFilter}
            onChange={(event) =>
              setTypeFilter(event.target.value as DocumentType | "all")
            }
            className={cn(nativeSelectClassName, "min-w-0 sm:w-44")}
          >
            {DOCUMENT_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </FormField>

        <div className="flex h-9 items-center">
          <Badge
            variant="outline"
            className={compactToolbarBadgeClassName}
          >
            {documents.length} total
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
          <ViewSwitcher
            value={view}
            onValueChange={setView}
            options={VIEW_OPTIONS}
            className="h-9 rounded-md bg-transparent p-1"
          />
          <Button
            variant="outline"
            className="h-9 justify-center gap-1 rounded-md px-2.5"
            onClick={() => void loadDocuments()}
            disabled={loading}
          >
            <RefreshCwIcon className={loading ? "animate-spin" : ""} />
            Refresh
          </Button>
        </div>
      </div>

      {!visibleDocuments.length ? (
        <EmptyState>
          <EmptyStateIcon>
            <FileTextIcon />
          </EmptyStateIcon>
          <EmptyStateTitle>
            {documents.length ? "No documents match these filters" : "No documents yet"}
          </EmptyStateTitle>
          <EmptyStateDescription>
            {documents.length
              ? "Adjust the project, type, or tag filters to widen the library view."
              : "Upload a contract, proposal, rate card, or brief so Monad can use it during scope analysis."}
          </EmptyStateDescription>
          {!documents.length ? (
            <EmptyStateAction>
              <AddDocumentButton onClick={() => setUploadDialogOpen(true)} />
            </EmptyStateAction>
          ) : null}
        </EmptyState>
      ) : view === "rows" ? (
        <DocumentTable
          documents={visibleDocuments}
          projects={projects}
          editingId={editingId}
          editDraft={editDraft}
          onDraftChange={setEditDraft}
          onStartEditing={startEditing}
          onSave={saveEdit}
          onCancelEditing={() => setEditingId(null)}
          onDelete={deleteDocument}
          onDownload={downloadDocument}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visibleDocuments.map((document) => (
            <DocumentCard
              key={document.id}
              document={document}
              projects={projects}
              layout="grid"
              editing={editingId === document.id}
              editDraft={editDraft}
              onDraftChange={setEditDraft}
              onStartEditing={startEditing}
              onSave={saveEdit}
              onCancelEditing={() => setEditingId(null)}
              onDelete={deleteDocument}
              onDownload={downloadDocument}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function DocumentTable({
  documents,
  projects,
  editingId,
  editDraft,
  onDraftChange,
  onStartEditing,
  onSave,
  onCancelEditing,
  onDelete,
  onDownload,
}: {
  documents: DocumentWithProject[]
  projects: ProjectOption[]
  editingId: string | null
  editDraft: {
    title: string
    description: string
    tags: string
    document_type: DocumentType
    project_id: string
  }
  onDraftChange: React.Dispatch<
    React.SetStateAction<{
      title: string
      description: string
      tags: string
      document_type: DocumentType
      project_id: string
    }>
  >
  onStartEditing: (document: DocumentWithProject) => void
  onSave: (documentId: string) => Promise<void>
  onCancelEditing: () => void
  onDelete: (documentId: string) => Promise<void>
  onDownload: (documentId: string) => Promise<void>
}) {
  return (
    <div className="overflow-hidden rounded-md border border-border/60 bg-background">
      <Table className="text-sm">
        <TableHeader>
          <TableRow className="border-border/60 bg-muted/10 hover:bg-muted/10">
            <TableHead className="h-9 w-12 pl-4 text-sm/5 font-normal text-muted-foreground">
              Icon
            </TableHead>
            <TableHead className="h-9 min-w-40 px-3 text-sm/5 font-normal text-muted-foreground">
              Label
            </TableHead>
            <TableHead className="h-9 min-w-36 px-3 text-sm/5 font-normal text-muted-foreground">
              Project
            </TableHead>
            <TableHead className="h-9 min-w-64 px-3 text-sm/5 font-normal text-muted-foreground">
              Name
            </TableHead>
            <TableHead className="h-9 px-3 text-sm/5 font-normal text-muted-foreground">
              Type
            </TableHead>
            <TableHead className="h-9 px-3 text-sm/5 font-normal text-muted-foreground">
              Processing
            </TableHead>
            <TableHead className="h-9 min-w-36 px-3 text-sm/5 font-normal text-muted-foreground">
              Tags
            </TableHead>
            <TableHead className="h-9 px-3 text-sm/5 font-normal text-muted-foreground">
              Added
            </TableHead>
            <TableHead className="h-9 px-3 text-sm/5 font-normal text-muted-foreground">
              Updated
            </TableHead>
            <TableHead className="w-10">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((document) => {
            const editing = editingId === document.id

            return (
              <React.Fragment key={document.id}>
                <TableRow className="border-border/50 hover:bg-muted/10">
                  <TableCell className="py-2.5 pl-4">
                    <DocumentIcon />
                  </TableCell>
                  <TableCell className="px-3 py-2.5">
                    <button
                      type="button"
                      onClick={() => void onDownload(document.id)}
                      className="block max-w-48 truncate text-left text-sm/5 font-normal text-foreground transition-colors hover:text-primary"
                      title={document.title}
                    >
                      {document.title}
                    </button>
                  </TableCell>
                  <TableCell className="px-3 py-2.5">
                    <span className="block max-w-40 truncate text-sm/5 text-muted-foreground">
                      {document.project?.name ?? "Unassigned"}
                    </span>
                  </TableCell>
                  <TableCell className="px-3 py-2.5">
                    <p className="max-w-72 truncate text-sm/5 text-muted-foreground">
                      {document.file_name} · {formatFileSize(document.file_size)}
                    </p>
                  </TableCell>
                  <TableCell className="px-3 py-2.5">
                    <span className="text-sm/5 text-muted-foreground">
                      {formatChipLabel(document.document_type)}
                    </span>
                  </TableCell>
                  <TableCell className="px-3 py-2.5">
                    <span className="text-sm/5 text-muted-foreground">
                      {formatChipLabel(document.extraction_status)}
                    </span>
                  </TableCell>
                  <TableCell className="px-3 py-2.5">
                    <DocumentTags tags={document.tags} />
                  </TableCell>
                  <TableCell className="px-3 py-2.5 text-sm/5 text-muted-foreground">
                    {formatDate(document.created_at)}
                  </TableCell>
                  <TableCell className="px-3 py-2.5 text-sm/5 text-muted-foreground">
                    {formatDate(document.updated_at)}
                  </TableCell>
                  <TableCell className="py-2.5">
                    <DocumentActionMenu
                      document={document}
                      onDelete={onDelete}
                      onDownload={onDownload}
                      onStartEditing={onStartEditing}
                    />
                  </TableCell>
                </TableRow>

                {editing ? (
                  <TableRow className="bg-muted/20 hover:bg-muted/20">
                    <TableCell colSpan={10} className="p-4">
                      <div className="space-y-4">
                        <DocumentEditor
                          draft={editDraft}
                          projects={projects}
                          onDraftChange={onDraftChange}
                        />
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={onCancelEditing}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="button"
                            onClick={() => void onSave(document.id)}
                          >
                            <SaveIcon />
                            Save changes
                          </Button>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : null}
              </React.Fragment>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

function DocumentIcon() {
  return (
    <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted/70 text-muted-foreground">
      <FileTextIcon className="size-3.5" />
    </div>
  )
}

function DocumentTags({ tags }: { tags: string[] }) {
  if (!tags.length) {
    return <span className="text-sm/5 text-muted-foreground">None</span>
  }

  return (
    <div className="flex max-w-44 flex-wrap gap-1.5">
      {tags.slice(0, 2).map((tag) => (
        <Badge
          key={tag}
          variant="outline"
          className="h-6 rounded-md px-2 text-sm/5 font-normal"
        >
          {tag}
        </Badge>
      ))}
      {tags.length > 2 ? (
        <Badge
          variant="outline"
          className="h-6 rounded-md px-2 text-sm/5 font-normal"
        >
          +{tags.length - 2}
        </Badge>
      ) : null}
    </div>
  )
}

function DocumentCard({
  document,
  projects,
  layout,
  editing,
  editDraft,
  onDraftChange,
  onStartEditing,
  onSave,
  onCancelEditing,
  onDelete,
  onDownload,
}: {
  document: DocumentWithProject
  projects: ProjectOption[]
  layout: DocumentCardLayout
  editing: boolean
  editDraft: {
    title: string
    description: string
    tags: string
    document_type: DocumentType
    project_id: string
  }
  onDraftChange: React.Dispatch<
    React.SetStateAction<{
      title: string
      description: string
      tags: string
      document_type: DocumentType
      project_id: string
    }>
  >
  onStartEditing: (document: DocumentWithProject) => void
  onSave: (documentId: string) => Promise<void>
  onCancelEditing: () => void
  onDelete: (documentId: string) => Promise<void>
  onDownload: (documentId: string) => Promise<void>
}) {
  return (
    <Card
      className={cn(
        "relative border border-border/80 bg-card/95",
        layout === "grid" && "h-full"
      )}
    >
      <CardContent
        className={cn(
          "flex gap-4 pr-12",
          layout === "row"
            ? "flex-col py-4 lg:flex-row lg:items-start lg:justify-between"
            : "h-full flex-col py-4"
        )}
      >
        {editing ? (
          <DocumentEditor
            draft={editDraft}
            projects={projects}
            onDraftChange={onDraftChange}
          />
        ) : (
          <DocumentPreview
            document={document}
            layout={layout}
            onDownload={onDownload}
          />
        )}

        <DocumentActions
          document={document}
          editing={editing}
          onCancelEditing={onCancelEditing}
          onDelete={onDelete}
          onDownload={onDownload}
          onSave={onSave}
          onStartEditing={onStartEditing}
        />
      </CardContent>
    </Card>
  )
}

function DocumentPreview({
  document,
  layout,
  onDownload,
}: {
  document: DocumentWithProject
  layout: DocumentCardLayout
  onDownload: (documentId: string) => Promise<void>
}) {
  return (
    <div className="min-w-0 flex-1 space-y-3">
      <div
        className={cn(
          "flex gap-3",
          layout === "grid" ? "items-start" : "items-start lg:items-center"
        )}
      >
        <DocumentIcon />

        <div className="min-w-0 space-y-2">
          <button
            type="button"
            onClick={() => void onDownload(document.id)}
            className="block truncate text-left text-sm/5 font-medium text-foreground transition-colors hover:text-primary"
            title={document.title}
          >
            {document.title}
          </button>

          <p className="text-xs/5 text-muted-foreground">
            {document.project?.name ?? "Unassigned"} · {document.file_name} ·{" "}
            {formatFileSize(document.file_size)}
          </p>

          <div className="flex flex-wrap gap-2">
            <Badge variant={statusVariant(document.extraction_status)}>
              {formatChipLabel(document.extraction_status)}
            </Badge>
            <Badge variant="outline">
              {formatChipLabel(document.document_type)}
            </Badge>
          </div>
        </div>
      </div>

      {document.description ? (
        <p className="text-xs/5 text-muted-foreground">{document.description}</p>
      ) : null}

      {document.tags.length ? (
        <div className="space-y-1.5">
          <p className="text-xs/5 font-medium text-muted-foreground">Tags</p>
          <div className="flex flex-wrap gap-2">
            {document.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs/5 text-muted-foreground">
        <span>
          Added {new Date(document.created_at).toLocaleDateString()}
        </span>
        <span>
          Updated {new Date(document.updated_at).toLocaleDateString()}
        </span>
      </div>

      {document.extraction_error ? (
        <p className="text-xs/5 text-destructive">{document.extraction_error}</p>
      ) : null}
    </div>
  )
}

function DocumentEditor({
  draft,
  projects,
  onDraftChange,
}: {
  draft: {
    title: string
    description: string
    tags: string
    document_type: DocumentType
    project_id: string
  }
  projects: ProjectOption[]
  onDraftChange: React.Dispatch<
    React.SetStateAction<{
      title: string
      description: string
      tags: string
      document_type: DocumentType
      project_id: string
    }>
  >
}) {
  return (
    <div className="min-w-0 flex-1 space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <FormField className="md:col-span-2">
          <FormLabel>Title</FormLabel>
          <Input
            value={draft.title}
            onChange={(event) =>
              onDraftChange((current) => ({
                ...current,
                title: event.target.value,
              }))
            }
          />
        </FormField>

        <FormField>
          <FormLabel>Type</FormLabel>
          <select
            value={draft.document_type}
            onChange={(event) =>
              onDraftChange((current) => ({
                ...current,
                document_type: event.target.value as DocumentType,
              }))
            }
            className={nativeSelectClassName}
          >
            {DOCUMENT_TYPES.filter((type) => type.value !== "all").map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </FormField>

        <FormField>
          <FormLabel>Project</FormLabel>
          <select
            value={draft.project_id}
            onChange={(event) =>
              onDraftChange((current) => ({
                ...current,
                project_id: event.target.value,
              }))
            }
            className={nativeSelectClassName}
          >
            <option value="">Unassigned</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </FormField>

        <FormField>
          <FormLabel>Tags</FormLabel>
          <Input
            value={draft.tags}
            onChange={(event) =>
              onDraftChange((current) => ({
                ...current,
                tags: event.target.value,
              }))
            }
            placeholder="msa, pricing, discovery"
          />
        </FormField>

        <FormField>
          <FormLabel>Description</FormLabel>
          <Textarea
            value={draft.description}
            onChange={(event) =>
              onDraftChange((current) => ({
                ...current,
                description: event.target.value,
              }))
            }
            rows={3}
            placeholder="Short note"
          />
        </FormField>
      </div>
    </div>
  )
}

function DocumentActions({
  document,
  editing,
  onCancelEditing,
  onDelete,
  onDownload,
  onSave,
  onStartEditing,
}: {
  document: DocumentWithProject
  editing: boolean
  onCancelEditing: () => void
  onDelete: (documentId: string) => Promise<void>
  onDownload: (documentId: string) => Promise<void>
  onSave: (documentId: string) => Promise<void>
  onStartEditing: (document: DocumentWithProject) => void
}) {
  return (
    <div className="absolute right-3 top-3 flex shrink-0 gap-1">
      {editing ? (
        <>
          <Button
            size="icon-sm"
            onClick={() => void onSave(document.id)}
            aria-label="Save document"
          >
            <SaveIcon />
          </Button>
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={onCancelEditing}
            aria-label="Cancel edit"
          >
            <XIcon />
          </Button>
        </>
      ) : (
        <DocumentActionMenu
          document={document}
          onDelete={onDelete}
          onDownload={onDownload}
          onStartEditing={onStartEditing}
        />
      )}
    </div>
  )
}

function DocumentActionMenu({
  document,
  onDelete,
  onDownload,
  onStartEditing,
}: {
  document: DocumentWithProject
  onDelete: (documentId: string) => Promise<void>
  onDownload: (documentId: string) => Promise<void>
  onStartEditing: (document: DocumentWithProject) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Document actions"
            className="text-muted-foreground hover:text-foreground"
          />
        }
      >
        <EllipsisIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem onClick={() => void onDownload(document.id)}>
          <DownloadIcon />
          Download
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onStartEditing(document)}>
          <PencilIcon />
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={() => void onDelete(document.id)}
        >
          <Trash2Icon />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
