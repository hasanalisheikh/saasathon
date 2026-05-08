import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { full_name, company_name, hourly_rate } = body

  const { data, error } = await supabase
    .from('profiles')
    .update({
      full_name: full_name ?? null,
      company_name: company_name ?? null,
      hourly_rate: hourly_rate ? Number(hourly_rate) : 100,
    })
    .eq('id', user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
