import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getAppUrl } from '@/lib/env'
import { buildIssueBody, createIssue, parseGitHubInstallationId } from '@/lib/github'
import { ensureRequestTasks } from '@/lib/request-tasks'
import { sendDeveloperApprovalEmail, sendDeveloperDeclineEmail } from '@/lib/resend'

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

    if (request.approved_at) {
      return NextResponse.redirect(new URL(`/approve/${token}`, req.url))
    }

    const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown'
    const now = new Date().toISOString()

    if (action === 'decline') {
      await supabase.from('requests').update({
        status: 'declined',
        declined_at: now,
      }).eq('approval_token', token)

      try {
        const project = request.project as Record<string, unknown>
        const appUrl = getAppUrl()
        const { data: profile } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', project.user_id as string)
          .single()

        if (profile?.email) {
          await sendDeveloperDeclineEmail({
            to: profile.email,
            clientName: (project.client_name as string | undefined) ?? 'Your client',
            requestSummary: request.raw_email_subject ?? 'Feature request',
            declinedAt: now,
            projectName: project.name as string,
            requestUrl: `${appUrl}/projects/${project.id as string}/requests/${request.id}`,
          })
        }
      } catch (err) {
        console.error('Developer decline notification failed:', err)
      }

      return NextResponse.redirect(new URL(`/approve/${token}`, req.url))
    }

    if (action === 'approve' && understood) {
      const approvedCost = formatApprovedCostRange(request.cost_min, request.cost_max)

      const { data: approvedRequest, error: approvalError } = await supabase
        .from('requests')
        .update({
          status: 'approved',
          approved_at: now,
          approved_ip: ip,
          client_understood_cost: true,
        })
        .eq('id', request.id)
        .is('approved_at', null)
        .select('id')
        .maybeSingle()

      if (approvalError) throw approvalError

      if (!approvedRequest) {
        return NextResponse.redirect(new URL(`/approve/${token}`, req.url))
      }

      const project = request.project as Record<string, unknown>
      const appUrl = getAppUrl()
      let githubIssueUrl: string | null = null
      const installationId = parseGitHubInstallationId(project.github_installation_id as string | null)
      
      const requestTasks = await ensureRequestTasks({
        supabase,
        requestId: request.id,
        projectId: project.id as string,
        tasks: request.tasks ?? [],
      })

      // Create GitHub issue if repo connected
      if (project.github_repo_name && installationId) {
        try {
          const issueBody = buildIssueBody({
            clientRequest: request.raw_email_body ?? '',
            technicalBreakdown: request.technical_breakdown ?? '',
            approvedCost: approvedCost,
            approvalTimestamp: now,
            monadRequestUrl: `${appUrl}/projects/${project.id as string}/requests/${request.id}`,
            tasks: requestTasks,
          })

          const [owner = '', repo = ''] = (project.github_repo_name as string).split('/')
          const issue = await createIssue({
            installationId,
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
          await sendDeveloperApprovalEmail({
            to: profile.email,
            clientName: (project.client_name as string | undefined) ?? 'Your client',
            requestSummary: request.raw_email_subject ?? 'Feature request',
            costRange: approvedCost,
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

function formatApprovedCostRange(costMin: number | null, costMax: number | null) {
  if (costMin === null || costMax === null) {
    throw new Error('Approved requests require a confirmed cost range before Monad can continue the approval flow.')
  }

  return `$${costMin.toLocaleString()} – $${costMax.toLocaleString()}`
}
