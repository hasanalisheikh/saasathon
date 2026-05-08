"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createProject(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data, error } = await supabase
    .from("projects")
    .insert({
      owner_id: user.id,
      title: formData.get("title") as string,
      brief: (formData.get("brief") as string) || null,
      mode: (formData.get("mode") as "solo" | "team") ?? "solo",
      due_date: (formData.get("due_date") as string) || null,
      target_grade: (formData.get("target_grade") as string) || null,
    })
    .select("id")
    .single()

  if (error) return { error: error.message }

  revalidatePath("/dashboard")
  redirect(`/projects/${data.id}`)
}

export async function updateProject(
  projectId: string,
  updates: {
    title?: string
    brief?: string | null
    due_date?: string | null
    target_grade?: string | null
    status?: "active" | "submitted" | "archived"
    risk_score?: number
    risk_narrative?: string | null
  },
) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("projects")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", projectId)

  if (error) return { error: error.message }

  revalidatePath(`/projects/${projectId}`)
  revalidatePath(`/projects/${projectId}/risk`)
  return { success: true }
}

export async function deleteProject(projectId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", projectId)
    .eq("owner_id", user.id)

  if (error) return { error: error.message }

  revalidatePath("/dashboard")
  redirect("/dashboard")
}

export async function inviteMember(projectId: string, email: string) {
  const supabase = await createClient()

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .single()

  if (profileError || !profile) return { error: "No account found with that email. They must sign up first." }

  const { error } = await supabase
    .from("project_members")
    .insert({ project_id: projectId, user_id: profile.id, role: "member" })

  if (error) {
    if (error.code === "23505") return { error: "This person is already a member." }
    return { error: error.message }
  }

  revalidatePath(`/projects/${projectId}/settings`)
  return { success: true }
}

export async function removeMember(projectId: string, userId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("project_members")
    .delete()
    .eq("project_id", projectId)
    .eq("user_id", userId)

  if (error) return { error: error.message }

  revalidatePath(`/projects/${projectId}/settings`)
  return { success: true }
}
