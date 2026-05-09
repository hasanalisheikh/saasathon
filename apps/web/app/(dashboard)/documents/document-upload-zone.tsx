"use client"

import * as React from "react"
import { useState, useRef, useEffect } from "react"
import { FileTextIcon, Loader2, UploadCloud, FileIcon, Trash2, LayoutGrid, List, Download } from "lucide-react"
import {
  EmptyState,
  EmptyStateIcon,
  EmptyStateTitle,
  EmptyStateDescription,
  EmptyStateAction,
} from "@workspace/ui/components/empty-state"
import { Button } from "@workspace/ui/components/button"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { cn } from "@workspace/ui/lib/utils"
import { PageHeader, PageTitle, PageDescription, PageActions } from "@workspace/ui/components/page-header"
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@workspace/ui/components/table"

interface Document {
  id: string
  name: string
  file_path: string
  file_size: number
  mime_type: string
  created_at: string
  projects?: { name: string; client_name: string } | null
}

export function DocumentUploadZone() {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewType, setViewType] = useState<'list' | 'grid'>('list')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/documents')
      if (res.ok) {
        const data = await res.json()
        setDocuments(data)
      } else {
        throw new Error('Failed to fetch documents')
      }
    } catch (error) {
      toast.error('Failed to load documents')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      await handleUpload(file)
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      await handleUpload(file)
    }
  }

  const handleUpload = async (file: File) => {
    try {
      setIsUploading(true)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast.error('You must be logged in to upload documents')
        return
      }

      // 1. Upload to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file)

      if (uploadError) {
        throw new Error(uploadError.message)
      }

      // 2. Insert into database
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: file.name,
          file_path: filePath,
          file_size: file.size,
          mime_type: file.type,
        })
      })

      if (!res.ok) {
        throw new Error('Failed to save document metadata')
      }

      toast.success('Document uploaded successfully')
      fetchDocuments()
    } catch (error: any) {
      toast.error(error.message || 'Error uploading document')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/documents?id=${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete document')
      toast.success('Document deleted')
      fetchDocuments()
    } catch (error) {
      toast.error('Error deleting document')
    }
  }

  const handleDownload = async (filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(filePath)
        
      if (error) throw error

      const url = window.URL.createObjectURL(data)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      toast.error('Error downloading document')
    }
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <PageHeader>
        <div>
          <PageTitle>Documents</PageTitle>
          <PageDescription>
            Manage client legal contracts, hourly rates, and all legal documents. These files provide context for the AI to automatically draft precise, personalised quotes.
          </PageDescription>
        </div>
        <PageActions>
          <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-md border">
            <Button
              variant={viewType === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewType('list')}
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant={viewType === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewType('grid')}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
          </div>
        </PageActions>
      </PageHeader>

      {/* Upload Zone */}
      <div
        className={cn(
          "relative flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg transition-colors duration-200",
          isDragging ? "border-primary bg-primary/5" : "border-border hover:bg-muted/30"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
          accept=".pdf,.doc,.docx,.txt,.csv,.xls,.xlsx"
        />

        <div className="flex flex-col items-center gap-4 text-center">
          <div className="p-4 bg-primary/10 rounded-full text-primary">
            {isUploading ? (
              <Loader2 className="w-8 h-8 animate-spin" />
            ) : (
              <UploadCloud className="w-8 h-8" />
            )}
          </div>
          
          <div className="space-y-1">
            <h3 className="font-medium text-lg">
              {isUploading ? "Uploading..." : "Upload a Document"}
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              {isUploading 
                ? "Please wait while we upload your file." 
                : "Drag and drop your file here, or click to select from your computer."}
            </p>
          </div>

          {!isUploading && (
            <Button 
              className="mt-2"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              Browse Files
            </Button>
          )}
        </div>
      </div>

      {/* Documents Loading State */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center border border-dashed rounded-lg bg-muted/20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : documents.length > 0 ? (
        /* Documents Display */
        viewType === 'list' ? (
          <div className="rounded-lg border bg-muted/15">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="w-[400px]">Name</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Date Added</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.id} className="bg-muted/20 hover:bg-muted/30">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 text-primary rounded-lg shrink-0">
                          <FileIcon className="w-4 h-4" />
                        </div>
                        <span 
                          className="hover:underline cursor-pointer truncate max-w-[250px]"
                          onClick={() => handleDownload(doc.file_path, doc.name)}
                        >
                          {doc.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {(doc.file_size / 1024).toFixed(1)} KB
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(doc.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleDownload(doc.file_path, doc.name)}>
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(doc.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {documents.map((doc) => (
              <div 
                key={doc.id} 
                className="group relative flex flex-col overflow-hidden rounded-xl border bg-muted/25 shadow-sm transition-colors hover:border-primary/50 hover:bg-muted/35 dark:bg-muted/30 dark:hover:bg-muted/40"
              >
                <div 
                  className="flex-1 flex cursor-pointer flex-col items-center justify-center bg-muted/20 p-8"
                  onClick={() => handleDownload(doc.file_path, doc.name)}
                >
                  <FileIcon className="w-12 h-12 text-primary/40 group-hover:text-primary transition-colors" />
                </div>
                
                <div className="flex flex-col gap-1 border-t bg-muted/20 p-4">
                  <h4 
                    className="font-medium text-sm truncate cursor-pointer hover:underline"
                    onClick={() => handleDownload(doc.file_path, doc.name)}
                    title={doc.name}
                  >
                    {doc.name}
                  </h4>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{(doc.file_size / 1024).toFixed(1)} KB</span>
                    <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                  <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full shadow-sm" onClick={() => handleDownload(doc.file_path, doc.name)}>
                    <Download className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="destructive" size="icon" className="h-8 w-8 rounded-full shadow-sm" onClick={() => handleDelete(doc.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <EmptyState className="bg-transparent border-none">
          <EmptyStateIcon>
            <FileTextIcon />
          </EmptyStateIcon>
          <EmptyStateTitle>No documents yet</EmptyStateTitle>
          <EmptyStateDescription>
            Documents you upload will appear here.
          </EmptyStateDescription>
        </EmptyState>
      )}
    </div>
  )
}
