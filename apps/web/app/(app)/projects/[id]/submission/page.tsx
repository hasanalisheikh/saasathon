// Feature: Final Submission Checker (PRD Feature 6)
// Engineer builds: paste/upload draft → stream AI report → grade prediction + priority fixes

import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"

export default async function SubmissionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: project } = await supabase
    .from("projects")
    .select("id, title")
    .eq("id", id)
    .single()

  if (!project) notFound()

  const { data: criteria } = await supabase
    .from("rubric_criteria")
    .select("id, name, weight, description")
    .eq("project_id", id)
    .order("weight", { ascending: false })

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-lg font-semibold">Submission Checker</h1>
        <p className="text-muted-foreground text-xs mt-0.5">
          Upload your draft and get a rubric coverage report + predicted grade range
        </p>
      </div>

      {/* TODO: Build submission checker here
          PRD requirements:
          - Draft input: text paste OR file upload (PDF/Word → Supabase 'submissions' bucket)
            For file upload: upload to storage, then extract text client-side or pass URL
          - "Check submission" button → POST /api/submission/check with { draftContent, criteria, projectTitle }
          - Stream response into a structured report panel showing:
            - ## Overall Assessment
            - ## Predicted Grade Range (highlight this prominently)
            - Per-criterion: ✅ Covered | ⚠️ Weak | ❌ Missing
            - ## Priority Actions Before Submission

          Free tier: 1 check per project (track via usage_events table)
          Pro tier: unlimited checks

          See lib/api.ts checkSubmission() for the streaming client
      */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border border-dashed rounded-xl p-8 flex items-center justify-center text-muted-foreground text-sm">
          Draft input (paste or upload)
        </div>
        <div className="border border-dashed rounded-xl p-8 flex items-center justify-center text-muted-foreground text-sm">
          AI report output (streamed)
        </div>
      </div>
    </div>
  )
}
