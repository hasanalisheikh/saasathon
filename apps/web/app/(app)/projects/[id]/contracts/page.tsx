// Feature: Focus Contracts (PRD Feature 3)
// Engineer builds: create contract, AI time suggestion, proof submission, AI verdict display

import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"

export default async function ContractsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: project } = await supabase
    .from("projects")
    .select("id, title, mode")
    .eq("id", id)
    .single()

  if (!project) notFound()

  const { data: contracts } = await supabase
    .from("focus_contracts")
    .select(`
      id, deadline, session_hours, status, ai_verdict, ai_verdict_reason, proof_text, proof_url,
      tasks(id, title, rubric_criterion_id, rubric_criteria(name, weight)),
      profiles(full_name, avatar_url)
    `)
    .eq("project_id", id)
    .order("deadline", { ascending: true })

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-lg font-semibold">Focus Contracts</h1>
        <p className="text-muted-foreground text-xs mt-0.5">
          Commit to tasks, submit proof, get AI validation
        </p>
      </div>

      {/* TODO: Build focus contracts UI here
          PRD requirements:
          - "New contract" button → dialog with:
            - Task selector (from project tasks)
            - Deadline picker
            - AI-suggested session time: POST /api/contract/suggest-time → show suggestion inline
            - Rubric criterion badge (auto-filled from task)

          - Contract list (group by: Active / Completed / Missed)
          - Each contract card shows: task, owner, deadline, criterion+weight, status badge
          - "Submit proof" button → dialog with text/URL input
            → POST /api/contract/validate → show AI verdict inline
            → createContractProof() server action to update proof + verdict in DB

          - Missed contracts: auto-flagged at deadline — status check via created_at vs now()
          - On missed: updateProject() to trigger risk re-audit

          See lib/api.ts validateProof(), suggestContractTime()
          See lib/actions/contracts.ts for server actions
      */}
      <div className="border border-dashed rounded-xl p-12 flex items-center justify-center text-muted-foreground text-sm">
        Focus contracts UI — build here
      </div>
    </div>
  )
}
