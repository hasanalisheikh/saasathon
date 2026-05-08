import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { analyseRequest } from '@/lib/openai'

export async function POST(req: NextRequest) {
  try {
    const { request_id } = await req.json()
    if (!request_id) return NextResponse.json({ error: 'request_id required' }, { status: 400 })

    const supabase = await createServiceClient()

    // Load request + project
    const { data: request } = await supabase
      .from('requests')
      .select('*, project:projects(scope_raw, scope_structured, hourly_rate, task_categories)')
      .eq('id', request_id)
      .single()

    if (!request) return NextResponse.json({ error: 'Request not found' }, { status: 404 })

    const project = request.project as Record<string, unknown>

    // Mock mode for dev
    if (process.env.MOCK_AI === 'true') {
      const mock = {
        classification: 'out_of_scope',
        confidence: 94,
        scope_evidence: ['EXCLUDES: online ordering, payment processing, booking systems', '5-page website, contact form, basic SEO only'],
        technical_breakdown: 'This request covers four separate systems: online ordering (payment processing, menu management, cart), table booking (calendar, availability, email confirmations), loyalty points (user accounts, point tracking, redemption), and automated emails (template system, scheduling, SMTP). Each is a significant integration.',
        tasks: [
          { name: 'Booking system', description: 'Calendar UI, availability logic, confirmation emails', min_hours: 8, max_hours: 14 },
          { name: 'Online ordering', description: 'Cart, checkout, payment gateway', min_hours: 12, max_hours: 18 },
          { name: 'Loyalty points', description: 'User accounts, point tracking, redemption UI', min_hours: 10, max_hours: 16 },
          { name: 'Email automation', description: 'Templates, scheduling, SMTP integration', min_hours: 6, max_hours: 10 },
        ],
        effort_min_hours: 36,
        effort_max_hours: 58,
        risk_level: 'high',
        timeline_impact_days: 10,
        reasoning: 'The original scope explicitly excludes all four of the requested features. Each represents a significant standalone project.',
        draft_reply: `Hi Marcus,\n\nThanks for the kind words — really glad the site is looking good!\n\nI've reviewed your request for online ordering, table bookings, a loyalty points system, and automated email reminders. These are all great additions, but I want to be transparent with you: each of these is a significant feature that falls outside our original project scope.\n\nOur agreement covers the 5-page website, contact form, and basic SEO — and explicitly excludes online ordering, payment processing, booking systems, and custom integrations.\n\nI'd love to help you build these features. I've put together an estimate so you can see exactly what's involved before we proceed. Please review the details and approve if you'd like to move forward.\n\nBest,\nJamie`,
        suggested_action: 'quote_separately',
      }

      const hourlyRate = (project.hourly_rate as number) ?? 90
      const costMin = Math.round(mock.effort_min_hours * hourlyRate)
      const costMax = Math.round(mock.effort_max_hours * hourlyRate)

      await supabase.from('requests').update({
        ...mock,
        cost_min: costMin,
        cost_max: costMax,
        status: 'pending_review',
      }).eq('id', request_id)

      return NextResponse.json({ ok: true, classification: mock.classification })
    }

    // Real AI analysis
    const hourlyRate = (project.hourly_rate as number) ?? 90
    const analysis = await analyseRequest({
      scopeRaw: (project.scope_raw as string) ?? '',
      scopeStructured: (project.scope_structured as object) ?? {},
      hourlyRate,
      taskCategories: (project.task_categories as object[]) ?? [],
      emailFrom: request.raw_email_from ?? '',
      emailSubject: request.raw_email_subject ?? '',
      emailBody: request.raw_email_body,
    })

    const costMin = Math.round((analysis.effort_min_hours ?? 0) * hourlyRate)
    const costMax = Math.round((analysis.effort_max_hours ?? 0) * hourlyRate)

    await supabase.from('requests').update({
      classification: analysis.classification,
      confidence: analysis.confidence,
      scope_evidence: analysis.scope_evidence,
      technical_breakdown: analysis.technical_breakdown,
      effort_min_hours: analysis.effort_min_hours,
      effort_max_hours: analysis.effort_max_hours,
      cost_min: costMin,
      cost_max: costMax,
      timeline_impact_days: analysis.timeline_impact_days,
      risk_level: analysis.risk_level,
      draft_reply: analysis.draft_reply,
    }).eq('id', request_id)

    return NextResponse.json({ ok: true, classification: analysis.classification })
  } catch (err) {
    console.error('AI analyse error:', err)
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
  }
}
