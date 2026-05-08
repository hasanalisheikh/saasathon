// Feature: Team Pulse & Pin of Shame (PRD Feature 4) — Pro tier only
// Engineer builds: contribution charts, AI team health summary, Pin of Shame toggle, badges

import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"

export default async function PulsePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: project } = await supabase
    .from("projects")
    .select("id, title, mode")
    .eq("id", id)
    .single()

  if (!project) notFound()

  const { data: scores } = await supabase
    .from("contribution_scores")
    .select(`
      id, tasks_completed, contracts_done, contracts_missed,
      chat_messages, pin_of_shame, badge, ai_narrative, computed_at,
      profiles(id, full_name, avatar_url)
    `)
    .eq("project_id", id)

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-lg font-semibold">Team Pulse</h1>
        <p className="text-muted-foreground text-xs mt-0.5">Contribution insights and accountability</p>
      </div>

      {/* TODO: Build Team Pulse + Pin of Shame here
          PRD requirements:
          - Per-member contribution cards showing:
            - Tasks completed, contracts done/missed, messages sent
            - Progress bars for rubric criteria covered
            - Activity frequency chart (recharts or similar)
          - AI team health narrative (stored in contribution_scores.ai_narrative)
          - "Refresh scores" → recompute contribution_scores from raw data
            then POST to a future /api/pulse/score endpoint for AI narrative

          Pin of Shame (toggleable, off by default):
          - Toggle stored in localStorage or project settings
          - Algorithm: (contracts_missed * 3) + overdue_tasks - tasks_completed
          - Lowest scorer gets pin_of_shame=true in contribution_scores
          - Display: AI-generated dramatic message stored in ai_narrative for that user
          - 🏴 flag next to their name

          Positive badges (auto-awarded):
          - rubric_rescuer: covered a red criterion
          - focus_beast: 5+ contracts completed with no misses
          - clutch_contributor: completed 3+ tasks in last 24h before deadline
          - deadline_saver: completed a critical task <6h before deadline

          Note: This is a Pro tier feature — show upgrade prompt if user.tier === 'free'
      */}
      <div className="border border-dashed rounded-xl p-12 flex items-center justify-center text-muted-foreground text-sm">
        Team Pulse UI — build here (Pro tier)
      </div>
    </div>
  )
}
