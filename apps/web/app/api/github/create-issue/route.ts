import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createIssue, buildIssueBody } from '@/lib/github'
import { ensureRequestTasks } from '@/lib/request-tasks'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

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

    if (!project.github_repo_name || !project.github_installation_id) {
      return NextResponse.json({ error: 'GitHub not connected' }, { status: 400 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    const costRange = request.cost_min && request.cost_max
      ? `$${request.cost_min.toLocaleString()} – $${request.cost_max.toLocaleString()}`
      : 'TBC'

    const [owner = '', repo = ''] = (project.github_repo_name as string).split('/')
    const requestTasks = await ensureRequestTasks({
      supabase,
      requestId: request.id,
      projectId: project.id as string,
      tasks: request.tasks ?? [],
    })

    const issue = await createIssue({
      accessToken: project.github_installation_id as string,
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
