// Feature: Mark-Risk Dashboard (PRD Feature 2)
// Engineer builds: live 0-100 score, per-criterion traffic lights, AI narrative, auto re-audit

import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"

export default async function RiskPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: project } = await supabase
    .from("projects")
    .select("id, title, risk_score, risk_narrative")
    .eq("id", id)
    .single()

  if (!project) notFound()

  const { data: criteria } = await supabase
    .from("rubric_criteria")
    .select("id, name, weight, status, description")
    .eq("project_id", id)
    .order("weight", { ascending: false })

  const { data: auditHistory } = await supabase
    .from("risk_audits")
    .select("id, score, narrative, trigger_event, created_at")
    .eq("project_id", id)
    .order("created_at", { ascending: false })
    .limit(10)

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-lg font-semibold">Mark-Risk Dashboard</h1>
        <p className="text-muted-foreground text-xs mt-0.5">Live rubric coverage — updates every 3 minutes</p>
      </div>

      {/* TODO: Build the risk dashboard here
          PRD requirements:
          - Big live 0-100 risk score (project.risk_score)
          - AI narrative paragraph (project.risk_narrative)
          - Per-criterion traffic lights: green=covered, amber=partial, red=uncovered
          - Audit history timeline (auditHistory)
          - Auto re-audit: useEffect with setInterval(180_000) → POST /api/risk/audit
            Pass: { projectId: id, criteria: criteria.map(c => ({ ...c, taskCount, completedCount })), triggerEvent: 'timer' }
            On response: updateProject() server action to write new score + narrative to DB

          Real-time: subscribe to tasks changes via Supabase real-time
          → on any task update, trigger immediate re-audit with triggerEvent: 'task_update'

          See lib/api.ts auditRisk() for the API call
          See lib/hooks/use-risk.ts for the polling hook
      */}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-6">
        <div className="border border-dashed rounded-xl p-8 flex items-center justify-center text-muted-foreground text-sm md:col-span-1">
          Risk score widget
        </div>
        <div className="border border-dashed rounded-xl p-8 flex items-center justify-center text-muted-foreground text-sm md:col-span-2">
          AI narrative + criteria traffic lights
        </div>
      </div>

      <div className="border border-dashed rounded-xl p-8 flex items-center justify-center text-muted-foreground text-sm">
        Audit history timeline
      </div>
    </div>
  )
}
