// Feature: Brief Ingestion & Plan Generation (PRD Feature 1)
// Engineer builds: paste/upload brief → streaming AI plan → task board population

export default function NewProjectPage() {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-lg font-semibold">New project</h1>
        <p className="text-muted-foreground text-xs mt-0.5">
          Paste your assignment brief and AI will generate a full rubric-linked task plan
        </p>
      </div>

      {/* TODO: Build the new project wizard here
          Steps:
          1. Project name, mode (solo/team), due date, target grade
          2. Brief input (text paste or PDF upload via Supabase Storage 'briefs' bucket)
          3. POST to /api/brief/ingest with { brief, projectId }
          4. Stream response: parse ---SECTION--- delimiters
             - Section 1 JSON → show project summary card
             - Section 2 JSON → create rubric_criteria rows via createCriteria() server action
             - Section 3 JSON → create tasks rows via createTasks() server action
          5. Redirect to /projects/[id] when stream completes

          See lib/api.ts streamBriefIngest() for the streaming client
          See lib/actions/projects.ts for server actions
      */}
      <div className="border border-dashed rounded-xl p-12 flex items-center justify-center text-muted-foreground text-sm">
        Brief ingestion UI — build here
      </div>
    </div>
  )
}
