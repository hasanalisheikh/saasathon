// Feature: Project Settings + Team Invite
// Engineer builds: rename project, invite members by email, manage roles, delete project

import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"

export default async function SettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: project } = await supabase
    .from("projects")
    .select("id, title, mode, due_date, target_grade, status, owner_id")
    .eq("id", id)
    .single()

  if (!project) notFound()

  const { data: members } = await supabase
    .from("project_members")
    .select("id, role, joined_at, profiles(id, full_name, email, avatar_url)")
    .eq("project_id", id)

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-lg font-semibold">Project Settings</h1>
      </div>

      {/* TODO: Build settings page here
          Sections:
          1. Project details form: title, due_date, target_grade, status
             → updateProject() server action

          2. Team members list (members array):
             - Avatar, name, email, role badge
             - Owner can change role or remove members → updateMember() / removeMember()

          3. Invite members (team mode only):
             - Email input → inviteMember() server action
             - Look up user by email in profiles table
             - If found: add to project_members
             - If not found: show "User not found — they must sign up first"

          4. Danger zone:
             - Archive project → updateProject({ status: 'archived' })
             - Delete project (owner only) → deleteProject() — requires confirmation dialog
      */}
      <div className="space-y-4">
        <div className="border border-dashed rounded-xl p-8 flex items-center justify-center text-muted-foreground text-sm">
          Project details form
        </div>
        <div className="border border-dashed rounded-xl p-8 flex items-center justify-center text-muted-foreground text-sm">
          Team members + invite
        </div>
        <div className="border border-dashed rounded-xl p-8 flex items-center justify-center text-muted-foreground text-sm">
          Danger zone
        </div>
      </div>
    </div>
  )
}
