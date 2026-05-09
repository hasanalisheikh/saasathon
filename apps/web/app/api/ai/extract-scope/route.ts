import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { extractScope } from '@/lib/ai'
import { isAIConfigured, isMockAIEnabled } from '@/lib/env'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { scope_raw } = await req.json()
    if (!scope_raw) return NextResponse.json({ error: 'scope_raw required' }, { status: 400 })

    if (isMockAIEnabled()) {
      return NextResponse.json({
        deliverables: ['5-page website (Home, Menu, About, Gallery, Contact)', 'Contact form with validation', 'Basic SEO meta tags', 'Mobile responsive design'],
        exclusions: ['Online ordering', 'Payment processing', 'Booking systems', 'Loyalty programs', 'Automated emails', 'Custom integrations'],
        revision_limit: '2 rounds of revisions',
        timeline: '4 weeks',
        pricing_model: 'fixed_fee',
      })
    }

    if (!isAIConfigured()) {
      return NextResponse.json({
        error: 'AI analysis is not configured. Add OPENROUTER_API_KEY or set MOCK_AI=true for local development.',
      }, { status: 503 })
    }

    const result = await extractScope(scope_raw)
    return NextResponse.json(result)
  } catch (err) {
    console.error('Extract scope error:', err)
    return NextResponse.json({ error: 'Failed to extract scope' }, { status: 500 })
  }
}
