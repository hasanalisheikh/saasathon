"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  DownloadIcon,
  FileTextIcon,
  Loader2Icon,
  PencilIcon,
  RefreshCwIcon,
  SaveIcon,
  Trash2Icon,
  UploadIcon,
  XIcon,
} from "lucide-react"
import type { DocumentType, ExtractionStatus, ProjectDocument } from "@/types"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import { FormField, FormLabel } from "@workspace/ui/components/form-field"
import {
  EmptyState,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
} from "@workspace/ui/components/empty-state"

type ProjectOption = {
  id: string
  name: string
  client_name: string
}

type DocumentWithProject = ProjectDocument & {
  project?: ProjectOption | null
}

const DOCUMENT_TYPES: { value: DocumentType | "all"; label: string }[] = [
  { value: "all", label: "All types" },
  { value: "contract", label: "Contract" },
  { value: "proposal", label: "Proposal" },
  { value: "rate_card", label: "Rate card" },
  { value: "brief", label: "Brief" },
  { value: "other", label: "Other" },
]

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function statusVariant(status: ExtractionStatus): "default" | "destructive" | "secondary" {
  if (status === "completed") return "default"
  if (status === "failed") return "destructive"
  return "secondary"
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
  const [documents, setDocuments] = useState<DocumentWithProject[]>(initialDocuments)
  const [projectFilter, setProjectFilter] = useState(initialProjectId || "all")
  const [typeFilter, setTypeFilter] = useState<DocumentType | "all">("all")
  const [tagFilter, setTagFilter] = useState("")
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState({
    title: "",
    description: "",
    tags: "",
    document_type: "contract" as DocumentType,
    project_id: "",
  })

  const visibleDocuments = useMemo(() => {
    return documents.filter((document) => {
      const matchesProject = projectFilter === "all" || document.project_id === projectFilter
      const matchesType = typeFilter === "all" || document.document_type === typeFilter
      const normalizedTag = tagFilter.trim().toLowerCase()
      const matchesTag = !normalizedTag || document.tags.some((tag) => tag.includes(normalizedTag))
      return matchesProject && matchesType && matchesTag
    })
  }, [documents, projectFilter, tagFilter, typeFilter])

  async function loadDocuments() {
    setLoading(true)
    try {
      const res = await fetch("/api/documents")
      if (res.ok) setDocuments(await res.json())
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

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError((data as { error?: string }).error ?? "Upload failed")
        return
      }

      await loadDocuments()
      router.refresh()
      const form = document.getElementById("document-upload-form") as HTMLFormElement | null
      form?.reset()
    } finally {
      setUploading(false)
    }
  }

  function startEditing(document: DocumentWithProject) {
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

    if (res.ok) {
      setEditingId(null)
      await loadDocuments()
      router.refresh()
    } else {
      const data = await res.json().catch(() => ({}))
      setError((data as { error?: string }).error ?? "Save failed")
    }
  }

  async function deleteDocument(documentId: string) {
    if (!window.confirm("Delete this document?")) return

    const res = await fetch(`/api/documents/${documentId}`, { method: "DELETE" })
    if (res.ok) {
      setDocuments((docs) => docs.filter((doc) => doc.id !== documentId))
      router.refresh()
    }
  }

  async function downloadDocument(documentId: string) {
    const res = await fetch(`/api/documents/${documentId}/download`)
    if (!res.ok) return
    const data = await res.json() as { url?: string }
    if (data.url) window.open(data.url, "_blank", "noopener,noreferrer")
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent>
          <form
            id="document-upload-form"
            action={handleUpload}
            className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr_0.7fr_0.8fr_auto]"
          >
            <FormField>
              <FormLabel>File</FormLabel>
              <Input name="file" type="file" accept=".pdf,.docx,.txt,.md,.markdown" required />
            </FormField>
            <FormField>
              <FormLabel>Title</FormLabel>
              <Input name="title" placeholder="Signed contract" />
            </FormField>
            <FormField>
              <FormLabel>Type</FormLabel>
              <select
                name="document_type"
                className="h-9 w-full rounded-md border border-input bg-input/20 px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
                defaultValue="contract"
              >
                {DOCUMENT_TYPES.filter((type) => type.value !== "all").map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </FormField>
            <FormField>
              <FormLabel>Project</FormLabel>
              <select
                name="project_id"
                className="h-9 w-full rounded-md border border-input bg-input/20 px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
                defaultValue={projectFilter !== "all" ? projectFilter : ""}
              >
                <option value="">Unassigned</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </select>
            </FormField>
            <div className="flex items-end">
              <Button type="submit" disabled={uploading} className="w-full">
                {uploading ? <Loader2Icon className="animate-spin" /> : <UploadIcon />}
                Upload
              </Button>
            </div>
            <FormField className="lg:col-span-2">
              <FormLabel>Tags</FormLabel>
              <Input name="tags" placeholder="contract, rates, phase-1" />
            </FormField>
            <FormField className="lg:col-span-3">
              <FormLabel>Description</FormLabel>
              <Textarea name="description" rows={2} placeholder="Short note" />
            </FormField>
          </form>
          {error && <p className="mt-3 text-xs text-destructive">{error}</p>}
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-end gap-3">
        <FormField>
          <FormLabel>Project</FormLabel>
          <select
            value={projectFilter}
            onChange={(event) => setProjectFilter(event.target.value)}
            className="h-9 w-56 rounded-md border border-input bg-input/20 px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
          >
            <option value="all">All projects</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </select>
        </FormField>
        <FormField>
          <FormLabel>Type</FormLabel>
          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value as DocumentType | "all")}
            className="h-9 w-40 rounded-md border border-input bg-input/20 px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
          >
            {DOCUMENT_TYPES.map((type) => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </FormField>
        <FormField>
          <FormLabel>Tag</FormLabel>
          <Input
            value={tagFilter}
            onChange={(event) => setTagFilter(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") void loadDocuments()
            }}
            placeholder="rates"
            className="w-40"
          />
        </FormField>
        <Button variant="outline" size="sm" onClick={loadDocuments} disabled={loading}>
          <RefreshCwIcon className={loading ? "animate-spin" : ""} />
          Refresh
        </Button>
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
        </EmptyState>
      ) : (
        <div className="grid gap-3">
          {visibleDocuments.map((document) => {
            const editing = editingId === document.id
            return (
              <Card key={document.id}>
                <CardContent className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      {editing ? (
                        <div className="grid gap-3 md:grid-cols-[1fr_180px_220px]">
                          <Input
                            value={editDraft.title}
                            onChange={(event) => setEditDraft((draft) => ({ ...draft, title: event.target.value }))}
                          />
                          <select
                            value={editDraft.document_type}
                            onChange={(event) => setEditDraft((draft) => ({ ...draft, document_type: event.target.value as DocumentType }))}
                            className="h-9 rounded-md border border-input bg-input/20 px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
                          >
                            {DOCUMENT_TYPES.filter((type) => type.value !== "all").map((type) => (
                              <option key={type.value} value={type.value}>{type.label}</option>
                            ))}
                          </select>
                          <select
                            value={editDraft.project_id}
                            onChange={(event) => setEditDraft((draft) => ({ ...draft, project_id: event.target.value }))}
                            className="h-9 rounded-md border border-input bg-input/20 px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
                          >
                            <option value="">Unassigned</option>
                            {projects.map((project) => (
                              <option key={project.id} value={project.id}>{project.name}</option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate text-sm font-medium">{document.title}</p>
                            <Badge variant={statusVariant(document.extraction_status)}>
                              {document.extraction_status}
                            </Badge>
                            <Badge variant="outline">{document.document_type.replace("_", " ")}</Badge>
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {document.project?.name ?? "Unassigned"} · {formatFileSize(document.file_size)} · {document.file_name}
                          </p>
                        </>
                      )}
                    </div>
                    <div className="flex shrink-0 gap-1">
                      {editing ? (
                        <>
                          <Button size="icon-sm" onClick={() => saveEdit(document.id)} aria-label="Save document">
                            <SaveIcon />
                          </Button>
                          <Button size="icon-sm" variant="ghost" onClick={() => setEditingId(null)} aria-label="Cancel edit">
                            <XIcon />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button size="icon-sm" variant="ghost" onClick={() => downloadDocument(document.id)} aria-label="Download document">
                            <DownloadIcon />
                          </Button>
                          <Button size="icon-sm" variant="ghost" onClick={() => startEditing(document)} aria-label="Edit document">
                            <PencilIcon />
                          </Button>
                          <Button size="icon-sm" variant="destructive" onClick={() => deleteDocument(document.id)} aria-label="Delete document">
                            <Trash2Icon />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {editing ? (
                    <div className="grid gap-3 md:grid-cols-[1fr_1fr]">
                      <Input
                        value={editDraft.tags}
                        onChange={(event) => setEditDraft((draft) => ({ ...draft, tags: event.target.value }))}
                        placeholder="tags"
                      />
                      <Input
                        value={editDraft.description}
                        onChange={(event) => setEditDraft((draft) => ({ ...draft, description: event.target.value }))}
                        placeholder="description"
                      />
                    </div>
                  ) : (
                    <>
                      {document.description && (
                        <p className="text-xs text-muted-foreground">{document.description}</p>
                      )}
                      <div className="flex flex-wrap gap-2">
                        {document.tags.map((tag) => (
                          <Badge key={tag} variant="outline">{tag}</Badge>
                        ))}
                      </div>
                      {document.extraction_error && (
                        <p className="text-xs text-destructive">{document.extraction_error}</p>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
