import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { DOCUMENT_BUCKET, DOCUMENT_TYPES, parseTags } from '@/lib/documents'
import type { DocumentType } from '@/types'

function isDocumentType(value: string): value is DocumentType {
  return DOCUMENT_TYPES.some((type) => type.value === value)
}

async function loadOwnedDocument(params: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any
  documentId: string
  userId: string
}) {
  const { data } = await params.supabase
    .from('documents')
    .select('*')
    .eq('id', params.documentId)
    .eq('user_id', params.userId)
    .single()

  return data
}

async function ownsProject(params: {
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

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ documentId: string }> }) {
  const { documentId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const existing = await loadOwnedDocument({ supabase, documentId, userId: user.id })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json()
  const patch: Record<string, unknown> = {}

  if ('title' in body) {
    const title = String(body.title ?? '').trim()
    if (!title) return NextResponse.json({ error: 'title is required' }, { status: 400 })
    patch.title = title
  }

  if ('description' in body) {
    const description = String(body.description ?? '').trim()
    patch.description = description || null
  }

  if ('tags' in body) {
    patch.tags = Array.isArray(body.tags)
      ? parseTags(body.tags.join(','))
      : parseTags(String(body.tags ?? ''))
  }

  if ('document_type' in body) {
    const documentType = String(body.document_type ?? '')
    if (!isDocumentType(documentType)) {
      return NextResponse.json({ error: 'Invalid document_type' }, { status: 400 })
    }
    patch.document_type = documentType
  }

  if ('project_id' in body) {
    const projectId = body.project_id ? String(body.project_id) : null
    if (!(await ownsProject({ supabase, projectId, userId: user.id }))) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }
    patch.project_id = projectId
  }

  const { data, error } = await supabase
    .from('documents')
    .update(patch)
    .eq('id', documentId)
    .eq('user_id', user.id)
    .select('*, project:projects(id, name, client_name)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ documentId: string }> }) {
  const { documentId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const existing = await loadOwnedDocument({ supabase, documentId, userId: user.id })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await supabase.storage.from(DOCUMENT_BUCKET).remove([existing.storage_path as string])

  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', documentId)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
