import { NextRequest, NextResponse } from 'next/server'
import { getAppUrl, isResendConfigured } from '@/lib/env'
import { createClient } from '@/lib/supabase/server'
import { sendApprovalEmail } from '@/lib/resend'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (!isResendConfigured()) {
      return NextResponse.json({
        error: 'Client email is not configured. Add RESEND_API_KEY and RESEND_FROM_EMAIL to send approval emails.',
      }, { status: 503 })
    }

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

    const appUrl = getAppUrl()
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
    const message = err instanceof Error ? err.message : 'Failed to send email'
    const status = message.includes('not configured') ? 503 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
