import { NextRequest, NextResponse } from 'next/server'
import { getAppUrl, isPostmarkConfigured } from '@/lib/env'
import { createServiceClient } from '@/lib/supabase/server'
import { extractInboundEmail, isAuthorizedPostmarkRequest, type PostmarkInboundPayload } from '@/lib/postmark'

export async function POST(req: NextRequest) {
  try {
    if (!isPostmarkConfigured()) {
      return NextResponse.json({
        error: 'Inbound email is not configured. Add POSTMARK_INBOUND_WEBHOOK_TOKEN to receive Postmark webhooks.',
      }, { status: 503 })
    }

    if (!isAuthorizedPostmarkRequest(req)) {
      return NextResponse.json({ error: 'Invalid inbound webhook token' }, { status: 401 })
    }

    const payload = (await req.json()) as PostmarkInboundPayload
    const { from, subject, body, toAddress } = extractInboundEmail(payload)

    if (!body || !toAddress) {
      return NextResponse.json({ error: 'Missing body or to address' }, { status: 400 })
    }

    const supabase = await createServiceClient()

    // Find project by inbound email
    const { data: project } = await supabase
      .from('projects')
      .select('id, scope_raw, scope_structured, hourly_rate, task_categories')
      .eq('inbound_email', toAddress)
      .single()

    if (!project) {
      console.warn(`No project found for inbound email: ${toAddress}`)
      return NextResponse.json({ ok: true }) // 200 so Postmark doesn't retry
    }

    // Create request record
    const { data: request, error } = await supabase
      .from('requests')
      .insert({
        project_id: project.id,
        raw_email_from: from,
        raw_email_subject: subject,
        raw_email_body: body,
        source: 'email',
        status: 'pending_review',
        analysis_status: 'queued',
      })
      .select()
      .single()

    if (error || !request) {
      console.error('Failed to create request:', error)
      return NextResponse.json({ error: 'DB error' }, { status: 500 })
    }

    // Trigger AI analysis (fire-and-forget — don't await so Postmark gets 200 fast)
    try {
      const appUrl = getAppUrl()
      fetch(`${appUrl}/api/ai/analyse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request_id: request.id }),
      }).catch(async (error) => {
        console.error('Async request analysis failed:', error)
        await supabase
          .from('requests')
          .update({
            analysis_status: 'failed',
            analysis_error: 'Could not enqueue AI analysis from the inbound email webhook.',
          })
          .eq('id', request.id)
      })
    } catch (error) {
      console.error('Inbound email analysis scheduling error:', error)
      await supabase
        .from('requests')
        .update({
          analysis_status: 'failed',
          analysis_error: error instanceof Error ? error.message : 'Could not enqueue AI analysis.',
        })
        .eq('id', request.id)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Inbound webhook error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
