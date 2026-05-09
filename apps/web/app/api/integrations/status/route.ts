import { NextResponse } from 'next/server'
import { getEnvChecks, getRuntimeDiagnostics } from '@/lib/integrations'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.json({
    checks: getEnvChecks(),
    diagnostics: getRuntimeDiagnostics(),
  })
}
