"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function sendMessage(data: {
  projectId: string
  taskId?: string
  content: string
  aiFlagged?: boolean
  aiFlagReason?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { error } = await supabase.from("chat_messages").insert({
    project_id: data.projectId,
    task_id: data.taskId ?? null,
    user_id: user.id,
    content: data.content,
    ai_flagged: data.aiFlagged ?? false,
    ai_flag_reason: data.aiFlagReason ?? null,
  })

  if (error) return { error: error.message }

  revalidatePath(`/projects/${data.projectId}/chat`)
  return { success: true }
}

export async function flagMessage(messageId: string, projectId: string, reason: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("chat_messages")
    .update({ ai_flagged: true, ai_flag_reason: reason })
    .eq("id", messageId)

  if (error) return { error: error.message }

  revalidatePath(`/projects/${projectId}/chat`)
  return { success: true }
}

export async function saveRiskAudit(data: {
  projectId: string
  score: number
  narrative: string
  triggerEvent: string
}) {
  const supabase = await createClient()

  const { error } = await supabase.from("risk_audits").insert({
    project_id: data.projectId,
    score: data.score,
    narrative: data.narrative,
    trigger_event: data.triggerEvent,
  })

  if (error) return { error: error.message }
  return { success: true }
}
