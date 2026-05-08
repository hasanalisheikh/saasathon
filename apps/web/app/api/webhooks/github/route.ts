import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { translateCommits, detectUnapprovedWork } from '@/lib/openai'
import crypto from 'crypto'

function verifySignature(payload: string, signature: string | null, secret: string): boolean {
  if (!signature) return false
  const hmac = crypto.createHmac('sha256', secret)
  const digest = 'sha256=' + hmac.update(payload).digest('hex')
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature))
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()
    const signature = req.headers.get('x-hub-signature-256')
    const event = req.headers.get('x-github-event')

    const secret = process.env.GITHUB_WEBHOOK_SECRET ?? ''
    if (secret && !verifySignature(rawBody, signature, secret)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const payload = JSON.parse(rawBody)
    const supabase = await createServiceClient()

    // Find project by repo
    const repoFullName = payload.repository?.full_name
    if (!repoFullName) return NextResponse.json({ ok: true })

    const { data: project } = await supabase
      .from('projects')
      .select('id, user_id')
      .eq('github_repo_name', repoFullName)
      .single()

    if (!project) return NextResponse.json({ ok: true })

    let eventType = 'push'
    let plainSummary: string | null = null
    let isUnapproved = false

    if (event === 'pull_request' && payload.action === 'closed' && payload.pull_request?.merged) {
      eventType = 'pr_merged'

      // Translate commits to plain English
      const commits = (payload.commits ?? []).map((c: Record<string, string>) => c.message).filter(Boolean)
      if (commits.length > 0) {
        plainSummary = await translateCommits(commits).catch(() => null)
      }

      // Check for unapproved work
      const { data: approvedRequests } = await supabase
        .from('requests')
        .select('technical_breakdown')
        .eq('project_id', project.id)
        .eq('status', 'approved')

      if (approvedRequests?.length) {
        const result = await detectUnapprovedWork({
          approvedRequests: approvedRequests as { technical_breakdown: string }[],
          prTitle: payload.pull_request.title,
          prBody: payload.pull_request.body ?? '',
          filesChanged: (payload.pull_request.changed_files ?? []),
        }).catch(() => null)

        isUnapproved = result?.is_approved_work === false && (result?.confidence ?? 0) > 60
      }
    } else if (event === 'issues' && payload.action === 'closed') {
      eventType = 'issue_closed'
    }

    await supabase.from('github_events').insert({
      project_id: project.id,
      event_type: eventType,
      github_data: payload,
      plain_english_summary: plainSummary,
      is_unapproved_work: isUnapproved,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('GitHub webhook error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
