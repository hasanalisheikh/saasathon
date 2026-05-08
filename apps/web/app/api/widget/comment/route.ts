import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { project_id, client_token, page_url, element_selector, x_position, y_position, comment_text, client_name } = body

    if (!project_id || !comment_text) {
      return NextResponse.json({ error: 'project_id and comment_text required' }, { status: 400 })
    }

    const supabase = await createServiceClient()

    const { data: project } = await supabase
      .from('projects')
      .select('id, widget_token')
      .eq('id', project_id)
      .single()

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    if (!client_token || client_token !== project.widget_token) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { data: comment, error } = await supabase
      .from('widget_comments')
      .insert({
        project_id,
        page_url: page_url ?? null,
        element_selector: element_selector ?? null,
        x_position: x_position ?? null,
        y_position: y_position ?? null,
        comment_text,
        client_name: client_name ?? null,
      })
      .select()
      .single()

    if (error) {
      console.error('Widget comment insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(comment, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
