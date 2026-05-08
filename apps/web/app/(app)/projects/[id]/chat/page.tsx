// Feature: AI Chat & Summariser (PRD Feature 5) — Pro tier only
// Engineer builds: project chat, task comments, passive AI scan, manual summarise button

import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"

export default async function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: project } = await supabase
    .from("projects")
    .select("id, title")
    .eq("id", id)
    .single()

  if (!project) notFound()

  const { data: messages } = await supabase
    .from("chat_messages")
    .select(`
      id, content, ai_flagged, ai_flag_reason, created_at,
      profiles(full_name, avatar_url)
    `)
    .eq("project_id", id)
    .is("task_id", null)
    .order("created_at", { ascending: true })
    .limit(100)

  return (
    <div className="flex flex-col h-[calc(100svh-0px)]">
      <div className="border-b p-4 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-sm font-semibold">Project Chat</h1>
          <p className="text-muted-foreground text-xs">{project.title}</p>
        </div>
        {/* TODO: "Summarise Chat" button → POST /api/chat/summarise → stream summary in a sheet/dialog */}
      </div>

      {/* TODO: Build chat UI here
          PRD requirements:
          - Message list with avatar, name, timestamp
          - ai_flagged messages show a warning banner below the message
          - Real-time: subscribe to chat_messages via Supabase real-time
          - Message input at bottom → sendMessage() server action
            → after insert, POST /api/chat/scan in background to check for risk signals
            → if flagged: updateMessage() to set ai_flagged=true, ai_flag_reason
            → if rubric risk detected: trigger risk re-audit

          "Summarise Chat" button:
          - POST /api/chat/summarise with { messages, criteria, projectTitle }
          - Stream response into a side panel (Sheet component)
          - Show 5 sections: Decisions, New Tasks, Blockers, Questions, Rubric Risk Signals

          See lib/api.ts summariseChat(), scanMessage()
          See lib/actions/messages.ts for server actions
      */}
      <div className="flex-1 border border-dashed m-4 rounded-xl flex items-center justify-center text-muted-foreground text-sm">
        Chat UI — build here (Pro tier)
      </div>
    </div>
  )
}
