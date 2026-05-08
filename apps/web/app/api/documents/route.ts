import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { createClient } from '@/lib/supabase/server'
import {
  DOCUMENT_BUCKET,
  DOCUMENT_TYPES,
  MAX_DOCUMENT_BYTES,
  extractDocumentText,
  inferMimeType,
  isAllowedDocument,
  parseTags,
  safeFileName,
} from '@/lib/documents'
import type { DocumentType } from '@/types'

export const runtime = 'nodejs'

function isDocumentType(value: string): value is DocumentType {
  return DOCUMENT_TYPES.some((type) => type.value === value)
}

async function verifyProjectOwnership(params: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any
  projectId: string | null
  userId: string
}) {
  if (!params.projectId) return true

  const { data: project } = await params.supabase
    .from('projects')
    .select('id')
    .eq('id', params.projectId)
    .eq('user_id', params.userId)
    .single()

  return !!project
}

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const url = new URL(req.url)
  const projectId = url.searchParams.get('project_id')
  const tag = url.searchParams.get('tag')
  const type = url.searchParams.get('type')

  let query = supabase
    .from('documents')
    .select('*, project:projects(id, name, client_name)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (projectId) query = query.eq('project_id', projectId)
  if (tag) query = query.contains('tags', [tag.toLowerCase()])
  if (type && isDocumentType(type)) query = query.eq('document_type', type)

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const formData = await req.formData()
    const file = formData.get('file')
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'file is required' }, { status: 400 })
    }

    if (file.size > MAX_DOCUMENT_BYTES) {
      return NextResponse.json({ error: 'File must be 10 MiB or smaller' }, { status: 400 })
    }

    const mimeType = inferMimeType(file.name, file.type)
    if (!isAllowedDocument(file.name, mimeType)) {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 })
    }

    const projectId = String(formData.get('project_id') ?? '').trim() || null
    const ownsProject = await verifyProjectOwnership({ supabase, projectId, userId: user.id })
    if (!ownsProject) return NextResponse.json({ error: 'Project not found' }, { status: 404 })

    const requestedType = String(formData.get('document_type') ?? 'contract')
    const documentType = isDocumentType(requestedType) ? requestedType : 'other'
    const documentId = randomUUID()
    const fileName = safeFileName(file.name)
    const storagePath = `${user.id}/${documentId}/${fileName}`
    const title = String(formData.get('title') ?? '').trim() || file.name.replace(/\.[^.]+$/, '')
    const description = String(formData.get('description') ?? '').trim() || null
    const tags = parseTags(formData.get('tags'))
    const buffer = Buffer.from(await file.arrayBuffer())

    let extractedText: string | null = null
    let extractionStatus: 'completed' | 'failed' = 'completed'
    let extractionError: string | null = null

    try {
      extractedText = await extractDocumentText({ buffer, fileName: file.name, mimeType })
    } catch (err) {
      extractionStatus = 'failed'
      extractionError = err instanceof Error ? err.message.slice(0, 500) : 'Text extraction failed'
    }

    const { error: uploadError } = await supabase.storage
      .from(DOCUMENT_BUCKET)
      .upload(storagePath, buffer, {
        contentType: mimeType,
        upsert: false,
      })

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    const { data: document, error: insertError } = await supabase
      .from('documents')
      .insert({
        id: documentId,
        user_id: user.id,
        project_id: projectId,
        title,
        description,
        tags,
        document_type: documentType,
        file_name: file.name,
        file_size: file.size,
        mime_type: mimeType,
        storage_bucket: DOCUMENT_BUCKET,
        storage_path: storagePath,
        extraction_status: extractionStatus,
        extraction_error: extractionError,
        extracted_text: extractedText,
      })
      .select('*, project:projects(id, name, client_name)')
      .single()

    if (insertError) {
      await supabase.storage.from(DOCUMENT_BUCKET).remove([storagePath])
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json(document, { status: 201 })
  } catch (err) {
    console.error('Document upload error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
