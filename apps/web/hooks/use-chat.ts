"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Database } from "@/lib/supabase/types"

type ChatMessage = Database["public"]["Tables"]["chat_messages"]["Row"] & {
  profiles: { full_name: string | null; avatar_url: string | null } | null
}

export function useChat(projectId: string, taskId?: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const supabase = createClient()
    let query = supabase
      .from("chat_messages")
      .select("*, profiles(full_name, avatar_url)")
      .eq("project_id", projectId)
      .order("created_at", { ascending: true })
      .limit(200)

    if (taskId) {
      query = query.eq("task_id", taskId)
    } else {
      query = query.is("task_id", null)
    }

    const { data } = await query
    setMessages((data as ChatMessage[]) ?? [])
    setLoading(false)
  }, [projectId, taskId])

  useEffect(() => {
    load()

    // Real-time subscription for live chat
    const supabase = createClient()
    const channel = supabase
      .channel(`chat:${projectId}:${taskId ?? "project"}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "chat_messages",
        filter: `project_id=eq.${projectId}`,
      }, () => {
        load()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [projectId, taskId, load])

  return { messages, loading, refresh: load }
}
