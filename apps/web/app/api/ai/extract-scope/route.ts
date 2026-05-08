import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { extractScope } from '@/lib/openai'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { scope_raw } = await req.json()
    if (!scope_raw) return NextResponse.json({ error: 'scope_raw required' }, { status: 400 })

    if (process.env.MOCK_AI === 'true') {
      return NextResponse.json({
        deliverables: ['5-page website (Home, Menu, About, Gallery, Contact)', 'Contact form with validation', 'Basic SEO meta tags', 'Mobile responsive design'],
        exclusions: ['Online ordering', 'Payment processing', 'Booking systems', 'Loyalty programs', 'Automated emails', 'Custom integrations'],
        revision_limit: '2 rounds of revisions',
        timeline: '4 weeks',
        pricing_model: 'fixed_fee',
      })
    }

    const result = await extractScope(scope_raw)
    return NextResponse.json(result)
  } catch (err) {
    console.error('Extract scope error:', err)
    return NextResponse.json({ error: 'Failed to extract scope' }, { status: 500 })
  }
}
