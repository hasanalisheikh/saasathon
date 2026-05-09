"use client"

import * as React from "react"
import { Loader2Icon, PlusIcon, UploadIcon } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import {
  FormError,
  FormField,
  FormHint,
  FormLabel,
} from "@workspace/ui/components/form-field"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"

import type { DocumentType } from "@/types"

type ProjectOption = {
  id: string
  name: string
  client_name: string
}

const DOCUMENT_TYPE_OPTIONS: ReadonlyArray<{
  label: string
  value: DocumentType
}> = [
  { value: "contract", label: "Contract" },
  { value: "proposal", label: "Proposal" },
  { value: "rate_card", label: "Rate card" },
  { value: "brief", label: "Brief" },
  { value: "other", label: "Other" },
]

const nativeSelectClassName =
  "h-9 w-full rounded-md border border-input bg-input/20 px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 dark:bg-input/30"

interface DocumentUploadDialogProps {
  defaultProjectId: string
  error: string
  formRef: React.RefObject<HTMLFormElement | null>
  onOpenChange: (open: boolean) => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  open: boolean
  projects: ProjectOption[]
  uploading: boolean
}

export function DocumentUploadDialog({
  defaultProjectId,
  error,
  formRef,
  onOpenChange,
  onSubmit,
  open,
  projects,
  uploading,
}: DocumentUploadDialogProps) {
  const formKey = `${open ? "open" : "closed"}-${defaultProjectId || "unassigned"}`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="border-b border-border px-6 py-5">
          <DialogTitle>Add document</DialogTitle>
          <DialogDescription>
            Upload contracts, proposals, rate cards, and briefs so Monad can
            reference them during scope analysis.
          </DialogDescription>
        </DialogHeader>

        <form
          key={formKey}
          ref={formRef}
          onSubmit={onSubmit}
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
            <div className="space-y-6">
              <section className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-foreground">
                    File details
                  </h3>
                  <p className="text-xs/5 text-muted-foreground">
                    Supported formats: PDF, DOCX, TXT, and Markdown up to 10
                    MiB.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField className="sm:col-span-2">
                    <FormLabel htmlFor="document-file">File</FormLabel>
                    <Input
                      id="document-file"
                      name="file"
                      type="file"
                      accept=".pdf,.docx,.txt,.md,.markdown"
                      required
                    />
                  </FormField>

                  <FormField className="sm:col-span-2">
                    <FormLabel htmlFor="document-title">Title</FormLabel>
                    <Input
                      id="document-title"
                      name="title"
                      placeholder="Signed master services agreement"
                    />
                    <FormHint>
                      Leave blank to use the uploaded filename.
                    </FormHint>
                  </FormField>

                  <FormField>
                    <FormLabel htmlFor="document-type">Type</FormLabel>
                    <select
                      id="document-type"
                      name="document_type"
                      defaultValue="contract"
                      className={nativeSelectClassName}
                    >
                      {DOCUMENT_TYPE_OPTIONS.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </FormField>

                  <FormField>
                    <FormLabel htmlFor="document-project">Project</FormLabel>
                    <select
                      id="document-project"
                      name="project_id"
                      defaultValue={defaultProjectId}
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

                  <FormField className="sm:col-span-2">
                    <FormLabel htmlFor="document-tags">Tags</FormLabel>
                    <Input
                      id="document-tags"
                      name="tags"
                      placeholder="msa, pricing, phase-1"
                    />
                  </FormField>

                  <FormField className="sm:col-span-2">
                    <FormLabel htmlFor="document-description">
                      Description
                    </FormLabel>
                    <Textarea
                      id="document-description"
                      name="description"
                      rows={4}
                      placeholder="Short note about when this document should be used."
                    />
                  </FormField>
                </div>
              </section>

              {error ? <FormError>{error}</FormError> : null}
            </div>
          </div>

          <DialogFooter className="border-t border-border px-6 py-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={uploading}>
              {uploading ? (
                <Loader2Icon className="animate-spin" />
              ) : (
                <UploadIcon />
              )}
              {uploading ? "Uploading..." : "Upload document"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function AddDocumentButton({
  className,
  onClick,
}: {
  className?: string
  onClick: () => void
}) {
  return (
    <Button
      onClick={onClick}
      className={cn("h-9 min-w-[9rem] justify-center rounded-md", className)}
    >
      <PlusIcon />
      Add Document
    </Button>
  )
}
