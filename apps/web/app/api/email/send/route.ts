import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendApprovalEmail } from '@/lib/resend'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { request_id, final_reply, tone } = await req.json()
    if (!request_id || !final_reply) {
      return NextResponse.json({ error: 'request_id and final_reply required' }, { status: 400 })
    }

    // Load request + project + profile
    const { data: request } = await supabase
      .from('requests')
      .select('*, project:projects(name, client_name, client_email, user_id)')
      .eq('id', request_id)
      .single()

    if (!request) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const project = request.project as Record<string, unknown>
    if (project.user_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    if (!project.client_email) {
      return NextResponse.json({ error: 'No client email on this project' }, { status: 400 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, company_name')
      .eq('id', user.id)
      .single()

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    const approvalUrl = `${appUrl}/approve/${request.approval_token}`
    const declineUrl = `${appUrl}/approve/${request.approval_token}?action=decline`

    const costRange = request.cost_min && request.cost_max
      ? `$${request.cost_min.toLocaleString()} – $${request.cost_max.toLocaleString()}`
      : 'To be confirmed'

    await sendApprovalEmail({
      to: project.client_email as string,
      subject: `Re: ${request.raw_email_subject ?? 'Your request'} — Scope Review`,
      clientName: project.client_name as string,
      developerReply: final_reply,
      requestSummary: request.raw_email_body?.slice(0, 300) ?? '',
      technicalBreakdown: request.technical_breakdown ?? '',
      costRange,
      timelineDays: request.timeline_impact_days ?? 0,
      approvalUrl,
      declineUrl,
      projectName: project.name as string,
      requestId: request_id,
    })

    // Update request status
    await supabase.from('requests').update({
      status: 'sent_to_client',
      final_reply,
      reply_tone: tone ?? 'professional',
    }).eq('id', request_id)

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Send email error:', err)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
