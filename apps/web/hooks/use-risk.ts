"use client"

import { useEffect, useCallback, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { auditRisk, type RiskCriterionInput } from "@/lib/api"

const AUDIT_INTERVAL_MS = 3 * 60 * 1000 // 3 minutes per PRD

type Options = {
  projectId: string
  getCriteria: () => RiskCriterionInput[]
  onAuditComplete: (score: number, narrative: string) => void
}

// Handles continuous background risk auditing.
// Call from the risk dashboard page — it will poll every 3 minutes
// and also expose a `triggerAudit` function for on-demand re-audits.
export function useRiskAudit({ projectId, getCriteria, onAuditComplete }: Options) {
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const runAudit = useCallback(async (triggerEvent: string) => {
    const criteria = getCriteria()
    if (!criteria.length) return
    try {
      const result = await auditRisk(projectId, criteria, triggerEvent)
      onAuditComplete(result.score, result.narrative)
    } catch (err) {
      console.error("Risk audit failed:", err)
    }
  }, [projectId, getCriteria, onAuditComplete])

  useEffect(() => {
    // Initial audit on mount
    runAudit("page_load")

    // Rolling timer every 3 minutes
    timerRef.current = setInterval(() => runAudit("timer"), AUDIT_INTERVAL_MS)

    // Real-time: re-audit on any task change
    const supabase = createClient()
    const channel = supabase
      .channel(`risk:${projectId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks", filter: `project_id=eq.${projectId}` }, () => {
        runAudit("task_update")
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "focus_contracts", filter: `project_id=eq.${projectId}` }, () => {
        runAudit("contract_update")
      })
      .subscribe()

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      supabase.removeChannel(channel)
    }
  }, [projectId, runAudit])

  return { triggerAudit: runAudit }
}
