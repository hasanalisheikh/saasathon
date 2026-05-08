import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer, type DocumentProps } from '@react-pdf/renderer'
import React, { type JSXElementConstructor } from 'react'
import { createClient } from '@/lib/supabase/server'
import { ProofPackDocument } from '@/lib/proof-pdf'

export async function GET(req: NextRequest, { params }: { params: Promise<{ requestId: string }> }) {
  const { requestId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: request } = await supabase
    .from('requests')
    .select('*, project:projects(id, name, client_name, client_email, hourly_rate, user_id)')
    .eq('id', requestId)
    .single()

  if (!request) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const project = request.project as Record<string, unknown>
  if (project.user_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', user.id)
    .single()

  const element = React.createElement(ProofPackDocument, {
    request,
    project: project as Parameters<typeof ProofPackDocument>[0]['project'],
    developerName: profile?.full_name ?? user.email ?? 'Developer',
    developerEmail: profile?.email ?? user.email ?? '',
  }) as unknown as React.ReactElement<DocumentProps, JSXElementConstructor<DocumentProps>>

  const pdfBuffer = await renderToBuffer(element)
  const filename = `monad-proof-${requestId.slice(0, 8)}.pdf`

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': String(pdfBuffer.byteLength),
    },
  })
}
