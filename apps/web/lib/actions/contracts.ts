"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createContract(data: {
  taskId: string
  projectId: string
  deadline: string
  sessionHours?: number
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { error } = await supabase.from("focus_contracts").insert({
    task_id: data.taskId,
    project_id: data.projectId,
    owner_id: user.id,
    deadline: data.deadline,
    session_hours: data.sessionHours ?? null,
  })

  if (error) return { error: error.message }

  revalidatePath(`/projects/${data.projectId}/contracts`)
  return { success: true }
}

export async function submitContractProof(data: {
  contractId: string
  projectId: string
  proofText?: string
  proofUrl?: string
  aiVerdict: "satisfied" | "partial" | "unsatisfied"
  aiVerdictReason: string
}) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("focus_contracts")
    .update({
      proof_text: data.proofText ?? null,
      proof_url: data.proofUrl ?? null,
      ai_verdict: data.aiVerdict,
      ai_verdict_reason: data.aiVerdictReason,
      status: "completed",
      updated_at: new Date().toISOString(),
    })
    .eq("id", data.contractId)

  if (error) return { error: error.message }

  revalidatePath(`/projects/${data.projectId}/contracts`)
  return { success: true }
}

export async function markContractMissed(contractId: string, projectId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("focus_contracts")
    .update({ status: "missed", updated_at: new Date().toISOString() })
    .eq("id", contractId)

  if (error) return { error: error.message }

  revalidatePath(`/projects/${projectId}/contracts`)
  return { success: true }
}
