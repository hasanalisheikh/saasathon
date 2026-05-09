import { NextRequest, NextResponse } from 'next/server'
import { getAppUrl } from '@/lib/env'
import { createClient } from '@/lib/supabase/server'
import { buildIssueBody, createIssue } from '@/lib/github'
import { parseGitHubInstallationId } from '@/lib/github'
import { isGitHubAppConfigured } from '@/lib/github-config'
import { ensureRequestTasks } from '@/lib/request-tasks'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!isGitHubAppConfigured()) {
      return NextResponse.json({
        error: 'GitHub App is not configured. Add the GitHub App credentials before creating issues.',
      }, { status: 503 })
    }

    const { request_id } = await req.json()
    if (!request_id) return NextResponse.json({ error: 'request_id required' }, { status: 400 })

    const { data: request } = await supabase
      .from('requests')
      .select('*, project:projects(id, name, github_repo_name, github_installation_id, user_id)')
      .eq('id', request_id)
      .single()

    if (!request) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const project = request.project as Record<string, unknown>
    if (project.user_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const installationId = parseGitHubInstallationId(project.github_installation_id as string | null)

    if (!project.github_repo_name || !installationId) {
      return NextResponse.json({ error: 'GitHub not connected' }, { status: 400 })
    }

    if (request.cost_min === null || request.cost_max === null) {
      return NextResponse.json({
        error: 'Approved requests require a confirmed cost range before Monad can create a GitHub issue.',
      }, { status: 422 })
    }
    if (!request.approved_at || request.status !== 'approved') {
      return NextResponse.json({
        error: 'Monad can only create GitHub issues for approved requests.',
      }, { status: 422 })
    }

    const appUrl = getAppUrl()
    const costRange = `$${request.cost_min.toLocaleString()} – $${request.cost_max.toLocaleString()}`

    const [owner = '', repo = ''] = (project.github_repo_name as string).split('/')
    const requestTasks = await ensureRequestTasks({
      supabase,
      requestId: request.id,
      projectId: project.id as string,
      tasks: request.tasks ?? [],
    })

    const issue = await createIssue({
      installationId,
      owner,
      repo,
      title: request.raw_email_subject ?? 'Client approved feature request',
      body: buildIssueBody({
        clientRequest: request.raw_email_body ?? '',
        technicalBreakdown: request.technical_breakdown ?? '',
        approvedCost: costRange,
        approvalTimestamp: request.approved_at ?? new Date().toISOString(),
        monadRequestUrl: `${appUrl}/projects/${project.id as string}/requests/${request.id}`,
        tasks: requestTasks,
      }),
    })

    await supabase.from('requests').update({
      github_issue_number: issue.number,
      github_issue_url: issue.url,
    }).eq('id', request_id)

    return NextResponse.json({ number: issue.number, url: issue.url })
  } catch (err) {
    console.error('Create issue error:', err)
    return NextResponse.json({ error: 'Failed to create issue' }, { status: 500 })
  }
}
