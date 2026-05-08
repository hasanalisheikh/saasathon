import type { AITask, RequestTask } from '@/types'

function normalizeTasks(tasks: AITask[] | null | undefined): AITask[] {
  return (tasks ?? [])
    .filter((task) => task?.name?.trim())
    .map((task) => ({
      name: task.name.trim(),
      description: task.description?.trim() ?? '',
      min_hours: Number.isFinite(task.min_hours) ? task.min_hours : 0,
      max_hours: Number.isFinite(task.max_hours) ? task.max_hours : 0,
    }))
}

export async function replaceRequestTasks(params: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any
  requestId: string
  projectId: string
  tasks: AITask[] | null | undefined
}) {
  await params.supabase.from('request_tasks').delete().eq('request_id', params.requestId)

  const tasks = normalizeTasks(params.tasks)
  if (!tasks.length) return []

  const rows = tasks.map((task, index) => ({
    request_id: params.requestId,
    project_id: params.projectId,
    position: index,
    name: task.name,
    description: task.description || null,
    min_hours: task.min_hours || null,
    max_hours: task.max_hours || null,
    status: 'pending',
  }))

  const { data, error } = await params.supabase
    .from('request_tasks')
    .insert(rows)
    .select()
    .order('position', { ascending: true })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function ensureRequestTasks(params: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any
  requestId: string
  projectId: string
  tasks: AITask[] | null | undefined
}) {
  const { data: existing } = await params.supabase
    .from('request_tasks')
    .select('*')
    .eq('request_id', params.requestId)
    .order('position', { ascending: true })

  if (existing?.length) return existing as RequestTask[]

  return replaceRequestTasks(params)
}

export async function updateRequestImplementationStatus(params: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any
  requestId: string
}) {
  const { data: tasks } = await params.supabase
    .from('request_tasks')
    .select('status')
    .eq('request_id', params.requestId)

  const statuses = (tasks ?? []).map((task: { status: string }) => task.status)
  const implementationStatus =
    statuses.length > 0 && statuses.every((status: string) => status === 'completed')
      ? 'completed'
      : statuses.some((status: string) => status === 'completed' || status === 'in_progress')
        ? 'in_progress'
        : 'not_started'

  await params.supabase
    .from('requests')
    .update({ implementation_status: implementationStatus })
    .eq('id', params.requestId)

  return implementationStatus
}

export function parseGithubTaskChecklist(body: string | null | undefined) {
  const matches: { marker: string; completed: boolean }[] = []
  const regex = /-\s+\[([ xX])\]\s+.*?<!--\s*(monad-task:[0-9a-f-]+)\s*-->/g
  let match: RegExpExecArray | null

  while ((match = regex.exec(body ?? '')) !== null) {
    matches.push({
      completed: match[1]?.toLowerCase() === 'x',
      marker: match[2]!,
    })
  }

  return matches
}

export function parseGithubTaskMarkers(text: string | null | undefined): string[] {
  const markers = new Set<string>()
  const regex = /monad-task:[0-9a-f-]+/g
  let match: RegExpExecArray | null

  while ((match = regex.exec(text ?? '')) !== null) {
    markers.add(match[0]!)
  }

  return [...markers]
}
