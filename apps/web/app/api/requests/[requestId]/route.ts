import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { RequestStatus } from '@/types'

const MANUAL_STATUS_TRANSITIONS: RequestStatus[] = ['accepted_in_scope', 'deferred', 'declined']

export async function GET(req: NextRequest, { params }: { params: Promise<{ requestId: string }> }) {
  const { requestId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: request } = await supabase
    .from('requests')
    .select('*, project:projects(id, name, client_name, client_email, hourly_rate, user_id)')
    .eq('id', requestId)
    .single()

  if (!request) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Verify ownership
  const project = request.project as Record<string, unknown>
  if (project.user_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data: taskRows } = await supabase
    .from('request_tasks')
    .select('*')
    .eq('request_id', requestId)
    .order('position', { ascending: true })

  return NextResponse.json({ ...request, task_rows: taskRows ?? [] })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ requestId: string }> }) {
  const { requestId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const status = body?.status as RequestStatus | undefined

  if (!status || !MANUAL_STATUS_TRANSITIONS.includes(status)) {
    return NextResponse.json({ error: 'Unsupported status transition' }, { status: 400 })
  }

  // Verify ownership via join
  const { data: existing } = await supabase
    .from('requests')
    .select('project:projects(user_id)')
    .eq('id', requestId)
    .single()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const proj = (existing?.project as any) ?? null
  if (!proj || proj.user_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const updates =
    status === 'accepted_in_scope'
      ? { status, classification: 'in_scope' as const }
      : { status }

  const { data, error } = await supabase
    .from('requests')
    .update(updates)
    .eq('id', requestId)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
