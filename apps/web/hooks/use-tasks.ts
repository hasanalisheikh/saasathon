"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Database } from "@/lib/supabase/types"

type Task = Database["public"]["Tables"]["tasks"]["Row"]

export function useTasks(projectId: string) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: true })

    if (error) setError(error.message)
    else setTasks(data ?? [])
    setLoading(false)
  }, [projectId])

  useEffect(() => {
    load()

    // Real-time subscription — re-fetch on any task change
    const supabase = createClient()
    const channel = supabase
      .channel(`tasks:${projectId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks", filter: `project_id=eq.${projectId}` }, () => {
        load()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [projectId, load])

  return { tasks, loading, error, refresh: load }
}
