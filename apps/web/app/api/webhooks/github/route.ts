import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { detectUnapprovedWork, translateCommits } from '@/lib/ai'
import { getConfiguredEnv, isResendConfigured } from '@/lib/env'
import { getPullRequestContext, parseGitHubInstallationId } from '@/lib/github'
import { isGitHubWebhookConfigured } from '@/lib/github-config'
import {
  parseGithubTaskChecklist,
  parseGithubTaskMarkers,
  updateRequestImplementationStatus,
} from '@/lib/request-tasks'
import { sendClientTaskCompletionEmail } from '@/lib/resend'
import crypto from 'crypto'

function verifySignature(payload: string, signature: string | null, secret: string): boolean {
  if (!signature) return false
  const hmac = crypto.createHmac('sha256', secret)
  const digest = 'sha256=' + hmac.update(payload).digest('hex')
  const digestBuffer = Buffer.from(digest)
  const signatureBuffer = Buffer.from(signature)

  if (digestBuffer.length !== signatureBuffer.length) {
    return false
  }

  return crypto.timingSafeEqual(digestBuffer, signatureBuffer)
}

type CompletedTask = {
  id: string
  request_id: string
  project_id: string
  name: string
  description: string | null
  client_notified_at: string | null
}

async function completeTasksByMarkers(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  markers: string[],
): Promise<CompletedTask[]> {
  if (!markers.length) return []

  const { data: tasks } = await supabase
    .from('request_tasks')
    .select('id, request_id, project_id, name, description, status, client_notified_at')
    .in('github_marker', markers)

  const incompleteIds = (tasks ?? [])
    .filter((task: { status: string }) => task.status !== 'completed')
    .map((task: { id: string }) => task.id)

  if (!incompleteIds.length) return []

  const { data: updated } = await supabase
    .from('request_tasks')
    .update({ status: 'completed', completed_at: new Date().toISOString() })
    .in('id', incompleteIds)
    .select('id, request_id, project_id, name, description, client_notified_at')

  return (updated ?? []).filter((task: CompletedTask) => !task.client_notified_at)
}

async function completeAllTasksForRequest(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  requestId: string,
): Promise<CompletedTask[]> {
  const { data: tasks } = await supabase
    .from('request_tasks')
    .select('id, status')
    .eq('request_id', requestId)

  const incompleteIds = (tasks ?? [])
    .filter((task: { status: string }) => task.status !== 'completed')
    .map((task: { id: string }) => task.id)

  if (!incompleteIds.length) return []

  const { data: updated } = await supabase
    .from('request_tasks')
    .update({ status: 'completed', completed_at: new Date().toISOString() })
    .in('id', incompleteIds)
    .select('id, request_id, project_id, name, description, client_notified_at')

  return (updated ?? []).filter((task: CompletedTask) => !task.client_notified_at)
}

async function applyChecklistState(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  body: string | null | undefined,
) {
  const checklist = parseGithubTaskChecklist(body)
  const completedMarkers = checklist.filter((item) => item.completed).map((item) => item.marker)
  const pendingMarkers = checklist.filter((item) => !item.completed).map((item) => item.marker)

  const completedTasks = await completeTasksByMarkers(supabase, completedMarkers)

  if (pendingMarkers.length) {
    await supabase
      .from('request_tasks')
      .update({ status: 'pending', completed_at: null })
      .in('github_marker', pendingMarkers)
  }

  const affectedMarkers = [...completedMarkers, ...pendingMarkers]
  if (affectedMarkers.length) {
    const { data: affectedTasks } = await supabase
      .from('request_tasks')
      .select('request_id')
      .in('github_marker', affectedMarkers)

    const requestIds = [
      ...new Set<string>((affectedTasks ?? []).map((task: { request_id: string }) => task.request_id)),
    ]
    await Promise.all(requestIds.map((requestId) => updateRequestImplementationStatus({ supabase, requestId })))
  }

  return completedTasks
}

async function notifyClientForCompletedTasks(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  tasks: CompletedTask[],
) {
  if (!isResendConfigured()) {
    console.warn('Skipped client task completion emails because Resend is not configured.')
    return
  }

  const tasksByRequest = new Map<string, CompletedTask[]>()

  for (const task of tasks) {
    tasksByRequest.set(task.request_id, [...(tasksByRequest.get(task.request_id) ?? []), task])
  }

  for (const [requestId, requestTasks] of tasksByRequest) {
    const { data: request } = await supabase
      .from('requests')
      .select('raw_email_subject, raw_email_body, project:projects(name, client_name, client_email)')
      .eq('id', requestId)
      .single()

    const project = request?.project as Record<string, unknown> | undefined
    const clientEmail = project?.client_email as string | undefined
    if (!request || !project || !clientEmail) continue

    await sendClientTaskCompletionEmail({
      to: clientEmail,
      clientName: (project.client_name as string | undefined) ?? 'there',
      projectName: (project.name as string | undefined) ?? 'your project',
      requestSummary: request.raw_email_subject ?? request.raw_email_body?.slice(0, 160) ?? 'Approved request',
      tasks: requestTasks.map((task) => ({ name: task.name, description: task.description })),
    })

    await supabase
      .from('request_tasks')
      .update({ client_notified_at: new Date().toISOString() })
      .in('id', requestTasks.map((task) => task.id))
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!isGitHubWebhookConfigured()) {
      return NextResponse.json({
        error: 'GitHub App webhooks are not configured. Add GITHUB_APP_WEBHOOK_SECRET to receive GitHub events.',
      }, { status: 503 })
    }

    const rawBody = await req.text()
    const signature = req.headers.get('x-hub-signature-256')
    const event = req.headers.get('x-github-event')

    const secret = getConfiguredEnv('GITHUB_APP_WEBHOOK_SECRET')!
    if (!verifySignature(rawBody, signature, secret)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const payload = JSON.parse(rawBody)
    const supabase = await createServiceClient()
    const installationId = parseGitHubInstallationId(String(payload.installation?.id ?? ''))

    if (event === 'installation' && installationId) {
      if (['deleted', 'suspend'].includes(payload.action)) {
        await supabase
          .from('projects')
          .update({
            github_installation_id: null,
            github_repo_id: null,
            github_repo_name: null,
          })
          .eq('github_installation_id', installationId)
      }

      return NextResponse.json({ ok: true })
    }

    if (event === 'installation_repositories' && installationId) {
      const removedRepos = Array.isArray(payload.repositories_removed)
        ? payload.repositories_removed
            .map((repository: { full_name?: string }) => repository.full_name)
            .filter((fullName: string | undefined): fullName is string => Boolean(fullName))
        : []

      if (removedRepos.length) {
        await supabase
          .from('projects')
          .update({
            github_repo_id: null,
            github_repo_name: null,
          })
          .eq('github_installation_id', installationId)
          .in('github_repo_name', removedRepos)
      }

      return NextResponse.json({ ok: true })
    }

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
    let requestIdForEvent: string | null = null
    let completedTasksForNotification: CompletedTask[] = []
    const [owner = '', repo = ''] = repoFullName.split('/')

    if (event === 'pull_request' && payload.action === 'closed' && payload.pull_request?.merged) {
      eventType = 'pr_merged'

      const installationIdForPr = parseGitHubInstallationId(String(payload.installation?.id ?? ''))
      let filesChanged: string[] = []

      if (installationIdForPr) {
        const pullRequestContext = await getPullRequestContext({
          installationId: installationIdForPr,
          owner,
          repo,
          pullNumber: payload.pull_request.number,
        }).catch((error) => {
          console.error('GitHub pull request context lookup failed:', error)
          return null
        })

        const commits = pullRequestContext?.commits ?? []
        filesChanged = pullRequestContext?.files ?? []

        if (commits.length > 0) {
          plainSummary = await translateCommits(commits).catch((error) => {
            console.error('GitHub commit translation failed:', error)
            return null
          })
        }
      }

      if (!plainSummary) {
        const fallbackCommits = (payload.commits ?? []).map((c: Record<string, string>) => c.message).filter(Boolean)
        if (fallbackCommits.length > 0) {
          plainSummary = await translateCommits(fallbackCommits).catch((error) => {
            console.error('GitHub commit translation failed:', error)
            return null
          })
        }
      }

      if (plainSummary === null && payload.pull_request.title) {
        plainSummary = payload.pull_request.title
      }

      // Scan PR for Monad markers
      const prText = `${payload.pull_request.title}\n${payload.pull_request.body ?? ''}`
      const markers = parseGithubTaskMarkers(prText)
      
      // Also look for "Closes #123" and find if #123 is a monad-linked issue
      const closesRegex = /(?:close|closes|closed|fix|fixes|fixed|resolve|resolves|resolved)\s+#(\d+)/gi
      let match
      while ((match = closesRegex.exec(prText)) !== null) {
        const issueNumber = parseInt(match[1]!, 10)
        const { data: linkedRequest } = await supabase
          .from('requests')
          .select('id')
          .eq('project_id', project.id)
          .eq('github_issue_number', issueNumber)
          .single()
        
        if (linkedRequest) {
          // If a PR closes a linked issue, we can mark all tasks for that request as completed
          const { data: linkedTasks } = await supabase
            .from('request_tasks')
            .select('github_marker')
            .eq('request_id', linkedRequest.id)
          
          if (linkedTasks) {
            linkedTasks.forEach((t: { github_marker: string }) => {
              if (t.github_marker) markers.push(t.github_marker)
            })
          }
        }
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
          filesChanged,
        }).catch((error) => {
          console.error('GitHub unapproved-work detection failed:', error)
          return null
        })

        isUnapproved = result?.is_approved_work === false && (result?.confidence ?? 0) > 60
      }

      completedTasksForNotification = await completeTasksByMarkers(supabase, [...new Set(markers)])

      const affectedRequestIds = [...new Set(completedTasksForNotification.map((task) => task.request_id))]
      requestIdForEvent = affectedRequestIds[0] ?? null
      await Promise.all(affectedRequestIds.map((requestId) => updateRequestImplementationStatus({ supabase, requestId })))
    } else if (event === 'issues' && payload.action === 'closed') {
      eventType = 'issue_closed'
      const { data: linkedRequest } = await supabase
        .from('requests')
        .select('id')
        .eq('project_id', project.id)
        .eq('github_issue_number', payload.issue?.number)
        .single()

      if (linkedRequest) {
        requestIdForEvent = linkedRequest.id
        completedTasksForNotification = await completeAllTasksForRequest(supabase, linkedRequest.id)
        await updateRequestImplementationStatus({ supabase, requestId: linkedRequest.id })
      }
    } else if (event === 'issues' && ['edited', 'reopened'].includes(payload.action)) {
      eventType = 'issue_updated'
      const { data: linkedRequest } = await supabase
        .from('requests')
        .select('id')
        .eq('project_id', project.id)
        .eq('github_issue_number', payload.issue?.number)
        .single()

      requestIdForEvent = linkedRequest?.id ?? null
      completedTasksForNotification = await applyChecklistState(supabase, payload.issue?.body)
    }

    if (completedTasksForNotification.length) {
      await notifyClientForCompletedTasks(supabase, completedTasksForNotification)
    }

    await supabase.from('github_events').insert({
      project_id: project.id,
      request_id: requestIdForEvent,
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
