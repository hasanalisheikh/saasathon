import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { createIssue, buildIssueBody } from '@/lib/github'
import { sendDeveloperApprovalEmail } from '@/lib/resend'

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params
    const formData = await req.formData()
    const action = formData.get('action') as string
    const understood = formData.get('understood') === 'on'

    const supabase = await createServiceClient()

    const { data: request } = await supabase
      .from('requests')
      .select('*, project:projects(id, name, client_name, github_repo_name, github_installation_id, user_id)')
      .eq('approval_token', token)
      .single()

    if (!request) {
      return NextResponse.redirect(new URL('/approve/invalid', req.url))
    }

    const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown'
    const now = new Date().toISOString()

    if (action === 'decline') {
      await supabase.from('requests').update({
        status: 'declined',
        declined_at: now,
      }).eq('approval_token', token)

      return NextResponse.redirect(new URL(`/approve/${token}`, req.url))
    }

    if (action === 'approve' && understood) {
      await supabase.from('requests').update({
        status: 'approved',
        approved_at: now,
        approved_ip: ip,
        client_understood_cost: true,
      }).eq('approval_token', token)

      const project = request.project as Record<string, unknown>
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
      let githubIssueUrl: string | null = null

      // Create GitHub issue if repo connected
      if (project.github_repo_name && project.github_installation_id) {
        try {
          const costRange = request.cost_min && request.cost_max
            ? `$${request.cost_min.toLocaleString()} – $${request.cost_max.toLocaleString()}`
            : 'TBC'

          const issueBody = buildIssueBody({
            clientRequest: request.raw_email_body ?? '',
            technicalBreakdown: request.technical_breakdown ?? '',
            approvedCost: costRange,
            approvalTimestamp: now,
            monadRequestUrl: `${appUrl}/projects/${project.id as string}/requests/${request.id}`,
          })

          const [owner = '', repo = ''] = (project.github_repo_name as string).split('/')
          const issue = await createIssue({
            accessToken: project.github_installation_id as string,
            owner,
            repo,
            title: request.raw_email_subject ?? 'Client approved feature request',
            body: issueBody,
          })

          await supabase.from('requests').update({
            github_issue_number: issue.number,
            github_issue_url: issue.url,
          }).eq('id', request.id)

          githubIssueUrl = issue.url
        } catch (err) {
          console.error('GitHub issue creation failed:', err)
          // Non-fatal — approval still worked
        }
      }

      // Notify the developer
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', project.user_id as string)
          .single()

        if (profile?.email) {
          const costRange = request.cost_min && request.cost_max
            ? `$${request.cost_min.toLocaleString()} – $${request.cost_max.toLocaleString()}`
            : 'TBC'

          await sendDeveloperApprovalEmail({
            to: profile.email,
            clientName: (project.client_name as string | undefined) ?? 'Your client',
            requestSummary: request.raw_email_subject ?? 'Feature request',
            costRange,
            approvedAt: now,
            projectName: project.name as string,
            requestUrl: `${appUrl}/projects/${project.id as string}/requests/${request.id}`,
            githubIssueUrl: githubIssueUrl ?? undefined,
          })
        }
      } catch (err) {
        console.error('Developer notification failed:', err)
        // Non-fatal
      }
    }

    return NextResponse.redirect(new URL(`/approve/${token}`, req.url))
  } catch (err) {
    console.error('Approve handler error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
