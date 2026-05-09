import { NextRequest, NextResponse } from 'next/server'
import { getConfiguredEnv } from '@/lib/env'
import { createClient } from '@/lib/supabase/server'
import { generateInboundEmail } from '@/lib/utils'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { name, client_name, client_email, scope_raw, scope_structured, hourly_rate, task_categories } = body

    if (!name || !client_name) {
      return NextResponse.json({ error: 'name and client_name required' }, { status: 400 })
    }

    const inbound_email = getConfiguredEnv('INBOUND_EMAIL_DOMAIN')
      ? generateInboundEmail(name)
      : null

    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        user_id: user.id,
        name,
        client_name,
        client_email: client_email || null,
        scope_raw: scope_raw || null,
        scope_structured: scope_structured || null,
        inbound_email,
        hourly_rate: hourly_rate || 100,
        task_categories: task_categories || [],
        status: 'active',
      })
      .select()
      .single()

    if (error) {
      console.error('Create project error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ id: project.id, inbound_email: project.inbound_email ?? null })
  } catch (err) {
    console.error(err)
    const message = err instanceof Error ? err.message : 'Internal error'
    const status = message.includes('configured') ? 503 : 500
    return NextResponse.json({ error: message }, { status })
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: projects } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    return NextResponse.json(projects ?? [])
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
