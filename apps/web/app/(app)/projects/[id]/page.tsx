// Feature: Task Board (PRD Feature 1 — post-generation)
// Engineer builds: Kanban/list board with rubric criterion tags, owner assignment, status updates

import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: project } = await supabase
    .from("projects")
    .select("id, title, mode, status, risk_score, risk_narrative, due_date, brief")
    .eq("id", id)
    .single()

  if (!project) notFound()

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-lg font-semibold">{project.title}</h1>
        <p className="text-muted-foreground text-xs mt-0.5">Task board</p>
      </div>

      {/* TODO: Build the task board here
          Data to fetch (use hooks or server-side):
          - useTasks(id) → tasks with rubric_criterion_id, owner_id, status, priority, deadline
          - useRubricCriteria(id) → criteria for filter/grouping
          - useProjectMembers(id) → for owner assignment dropdown

          Interactions:
          - Create task → createTask() server action
          - Update task status (drag or click) → updateTask() server action
          - Assign owner → updateTask() server action
          - Mark complete → updateTask() + triggers risk re-audit via POST /api/risk/audit

          Each task card should show:
          - Title, priority badge, status
          - Rubric criterion badge (with weight %)
          - Owner avatar + deadline
          - Effort hours estimate
      */}
      <div className="border border-dashed rounded-xl p-12 flex items-center justify-center text-muted-foreground text-sm">
        Task board — build here
      </div>
    </div>
  )
}
