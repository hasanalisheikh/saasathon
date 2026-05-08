"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createTask(data: {
  projectId: string
  title: string
  description?: string
  rubricCriterionId?: string
  ownerId?: string
  deadline?: string
  effortHours?: number
  priority?: "low" | "medium" | "high" | "critical"
  aiGenerated?: boolean
}) {
  const supabase = await createClient()

  const { error } = await supabase.from("tasks").insert({
    project_id: data.projectId,
    title: data.title,
    description: data.description ?? null,
    rubric_criterion_id: data.rubricCriterionId ?? null,
    owner_id: data.ownerId ?? null,
    deadline: data.deadline ?? null,
    effort_hours: data.effortHours ?? null,
    priority: data.priority ?? "medium",
    ai_generated: data.aiGenerated ?? false,
  })

  if (error) return { error: error.message }

  revalidatePath(`/projects/${data.projectId}`)
  return { success: true }
}

export async function createTasksBatch(
  projectId: string,
  tasks: {
    title: string
    description?: string
    criterionName: string
    priority: string
    effortHours: number
  }[],
  criteriaMap: Record<string, string>, // criterionName → criterionId
) {
  const supabase = await createClient()

  const rows = tasks.map((t) => ({
    project_id: projectId,
    title: t.title,
    description: t.description ?? null,
    rubric_criterion_id: criteriaMap[t.criterionName] ?? null,
    priority: t.priority as "low" | "medium" | "high" | "critical",
    effort_hours: t.effortHours,
    ai_generated: true,
  }))

  const { error } = await supabase.from("tasks").insert(rows)
  if (error) return { error: error.message }

  revalidatePath(`/projects/${projectId}`)
  return { success: true }
}

export async function updateTask(
  taskId: string,
  projectId: string,
  updates: {
    title?: string
    description?: string | null
    status?: "todo" | "in_progress" | "done"
    owner_id?: string | null
    deadline?: string | null
    priority?: "low" | "medium" | "high" | "critical"
    rubric_criterion_id?: string | null
  },
) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("tasks")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", taskId)

  if (error) return { error: error.message }

  revalidatePath(`/projects/${projectId}`)
  return { success: true }
}

export async function deleteTask(taskId: string, projectId: string) {
  const supabase = await createClient()

  const { error } = await supabase.from("tasks").delete().eq("id", taskId)
  if (error) return { error: error.message }

  revalidatePath(`/projects/${projectId}`)
  return { success: true }
}
