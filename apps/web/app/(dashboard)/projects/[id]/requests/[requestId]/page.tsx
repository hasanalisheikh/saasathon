"use client"

import { useCallback, useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import type { Request, Project, RequestTask } from "@/types"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { Textarea } from "@workspace/ui/components/textarea"
import { Separator } from "@workspace/ui/components/separator"
import { PageHeader, PageTitle, PageDescription } from "@workspace/ui/components/page-header"
import {
  SourceBadge,
  getClassificationColorClass,
} from "@workspace/ui/components/status-badge"
import { TonePicker } from "@workspace/ui/components/tone-picker"
import type { Tone } from "@workspace/ui/components/tone-picker"

const ACCIDENTAL_YES = ["sure", "no problem", "happy to", "of course", "will do", "sounds good", "absolutely"]
const ANALYSIS_POLL_INTERVAL_MS = 2000
const ANALYSIS_TIMEOUT_MS = 20000

type RequestWithTaskRows = Request & {
  task_rows?: RequestTask[]
}

export default function RequestReviewPage() {
  const { id, requestId } = useParams<{ id: string; requestId: string }>()
  const router = useRouter()

  const [request, setRequest] = useState<RequestWithTaskRows | null>(null)
  const [, setProject] = useState<Project | null>(null)
  const [reply, setReply] = useState("")
  const [replyTouched, setReplyTouched] = useState(false)
  const [tone, setTone] = useState<Tone>("professional")
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState("")
  const [analysing, setAnalysing] = useState(false)
  const [analysisError, setAnalysisError] = useState("")
  const [accidentalYes, setAccidentalYes] = useState(false)

  const loadRequest = useCallback(async function loadRequest() {
    const [reqRes, projRes] = await Promise.all([
      fetch(`/api/requests/${requestId}`),
      fetch(`/api/projects/${id}`),
    ])
    const reqData = await reqRes.json()
    const projData = await projRes.json()

    if (!reqRes.ok) {
      throw new Error((reqData as { error?: string }).error ?? "Failed to load request")
    }

    if (!projRes.ok) {
      throw new Error((projData as { error?: string }).error ?? "Failed to load project")
    }

    setRequest(reqData)
    setProject(projData)
    setAnalysisError("")
    if (!replyTouched) {
      setReply(reqData.final_reply ?? reqData.draft_reply ?? "")
      setTone(reqData.reply_tone ?? "professional")
    }
  }, [id, replyTouched, requestId])

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadRequest().catch((error) => {
        setAnalysisError(error instanceof Error ? error.message : "Failed to load request.")
      })
    }, 0)

    return () => window.clearTimeout(timeout)
  }, [loadRequest])

  const isAwaitingAnalysis = Boolean(
    request &&
      !request.classification &&
      !request.draft_reply &&
      !request.final_reply
  )

  useEffect(() => {
    if (!request || !isAwaitingAnalysis) return

    let cancelled = false
    const deadline = new Date(request.created_at).getTime() + ANALYSIS_TIMEOUT_MS

    async function poll() {
      while (!cancelled) {
        await new Promise((resolve) => window.setTimeout(resolve, ANALYSIS_POLL_INTERVAL_MS))
        if (cancelled) return

        try {
          await loadRequest()
        } catch (error) {
          if (!cancelled) {
            setAnalysisError(error instanceof Error ? error.message : "Failed to refresh request analysis.")
          }
          return
        }

        if (Date.now() >= deadline && !cancelled) {
          setAnalysisError("AI analysis is taking longer than expected. You can review manually or try re-analysing.")
          return
        }
      }
    }

    void poll()

    return () => {
      cancelled = true
    }
  }, [isAwaitingAnalysis, loadRequest, request])

  async function reanalyse() {
    setAnalysing(true)
    setAnalysisError("")
    try {
      const res = await fetch('/api/ai/analyse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request_id: requestId }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setAnalysisError((data as { error?: string }).error ?? "Analysis failed. Please try again.")
        return
      }
      await loadRequest()
    } catch (error) {
      setAnalysisError(error instanceof Error ? error.message : "Analysis failed. Please try again.")
    } finally {
      setAnalysing(false)
    }
  }

  function checkAccidentalYes(text: string) {
    const lower = text.toLowerCase()
    const isOutOfScope = request?.classification === "out_of_scope" || request?.classification === "ambiguous"
    if (!isOutOfScope) { setAccidentalYes(false); return }
    setAccidentalYes(ACCIDENTAL_YES.some((w) => lower.includes(w)))
  }

  async function sendToClient() {
    setSending(true)
    setSendError("")
    try {
      const res = await fetch("/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ request_id: requestId, final_reply: reply, tone }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setSendError((data as { error?: string }).error ?? "Failed to send email. Please try again.")
        return
      }
      router.push(`/projects/${id}`)
    } finally {
      setSending(false)
    }
  }

  async function updateStatus(status: string) {
    setSendError("")
    const res = await fetch(`/api/requests/${requestId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setSendError((data as { error?: string }).error ?? "Failed to update request status.")
      return
    }
    router.push(`/projects/${id}`)
  }

  if (!request) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    )
  }

  const colorClass = getClassificationColorClass(request.classification)
  const taskRows = request.task_rows ?? []
  const completedTaskCount = taskRows.filter((task) => task.status === "completed").length
  const progressPercent = taskRows.length ? Math.round((completedTaskCount / taskRows.length) * 100) : 0
  const classLabel: Record<string, string> = {
    out_of_scope: "OUT OF SCOPE",
    in_scope: "IN SCOPE",
    ambiguous: "AMBIGUOUS",
    clarification_needed: "CLARIFY",
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-6 py-6 border-b border-border">
        <PageHeader>
          <div>
            <PageTitle>Request Review</PageTitle>
            <PageDescription>
              Review the client&apos;s request against the agreed scope and prepare a response.
            </PageDescription>
          </div>
        </PageHeader>
      </div>

      {/* Two-panel layout */}
      <div className="flex gap-0 min-h-[calc(100vh-120px)]">

        {/* LEFT — Raw email (60%) */}
        <div className="w-[60%] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Client Request
            </p>
            <SourceBadge source={request.source} />
          </div>

          {/* Email metadata */}
          <Card size="sm">
            <CardContent className="space-y-2">
              {([
                ["From", request.raw_email_from],
                ["Subject", request.raw_email_subject],
                ["Received", new Date(request.created_at).toLocaleString()],
              ] as [string, string | null][]).map(
                ([k, v]) =>
                  v && (
                    <div key={k} className="flex gap-3">
                      <span className="text-xs w-16 flex-shrink-0 text-muted-foreground/50">
                        {k}
                      </span>
                      <span className="text-xs text-muted-foreground">{v}</span>
                    </div>
                  )
              )}
            </CardContent>
          </Card>

          {/* Email body */}
          <Card>
            <CardContent>
              <pre className="text-sm whitespace-pre-wrap leading-relaxed text-foreground min-h-[200px]">
                {request.raw_email_body}
              </pre>
            </CardContent>
          </Card>
        </div>

        {/* Vertical divider */}
        <Separator orientation="vertical" />

        {/* RIGHT — AI Analysis (40%) */}
        <div className="w-[40%] p-6 space-y-5">

          {/* Panel header with re-analyse button */}
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">AI Analysis</p>
            <Button
              variant={!request?.classification ? "default" : "outline"}
              size="sm"
              onClick={reanalyse}
              disabled={analysing}
            >
              {analysing ? (
                <>
                  <span className="inline-block animate-spin">↻</span>
                  Analysing…
                </>
              ) : (
                <>↻ Re-analyse</>
              )}
            </Button>
          </div>

          {analysisError && (
            <Card className="border-destructive/30 bg-destructive/10">
              <CardContent className="text-xs text-destructive">
                {analysisError}
              </CardContent>
            </Card>
          )}

          {/* Classification panel */}
          <Card
            className={`border-l-4 ${colorClass}`}
          >
            <CardContent className="space-y-3">
              <span className="text-lg font-bold">
                {classLabel[request.classification ?? ""] ?? (isAwaitingAnalysis ? "ANALYSING…" : "READY FOR REVIEW")}
              </span>
              {isAwaitingAnalysis && (
                <p className="text-xs text-muted-foreground">
                  Monad is still generating the classification and draft reply. You can keep reviewing manually while it runs.
                </p>
              )}
              {request.confidence !== null && (
                <div>
                  <div className="flex justify-between text-xs mb-1 text-muted-foreground">
                    <span>Confidence</span>
                    <span>{request.confidence}%</span>
                  </div>
                  <div className="h-1 rounded-full bg-border">
                    <div
                      className="h-1 rounded-full transition-all bg-primary"
                      style={{ width: `${request.confidence}%` }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Scope evidence */}
          {request.scope_evidence?.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-wider mb-2 text-muted-foreground">
                Evidence from original scope
              </p>
              <div className="space-y-2">
                {request.scope_evidence.map((quote, i) => (
                  <div
                    key={i}
                    className="px-3 py-2 rounded text-xs italic border-l-2 border-primary bg-primary/5 text-foreground"
                  >
                    &ldquo;{quote}&rdquo;
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Technical breakdown */}
          {request.technical_breakdown && (
            <div>
              <p className="text-xs uppercase tracking-wider mb-2 text-muted-foreground">
                What this actually involves
              </p>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {request.technical_breakdown}
              </p>
            </div>
          )}

          {/* Task breakdown */}
          {request.tasks?.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-wider mb-2 text-muted-foreground">
                Task Breakdown
              </p>
              <div className="space-y-1">
                {request.tasks.map((task, i) => (
                  <div key={i} className="flex items-start justify-between gap-2 py-1.5 border-b border-border last:border-0">
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-foreground">{task.name}</p>
                      {task.description && (
                        <p className="text-xs text-muted-foreground mt-0.5">{task.description}</p>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
                      {task.min_hours}–{task.max_hours}h
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {taskRows.length > 0 && (
            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Implementation Progress
                </p>
                <Badge variant={request.implementation_status === "completed" ? "default" : "outline"}>
                  {completedTaskCount}/{taskRows.length} complete
                </Badge>
              </div>
              <div className="mb-2 h-1 rounded-full bg-border">
                <div
                  className="h-1 rounded-full bg-primary transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="space-y-1">
                {taskRows.map((task) => (
                  <div key={task.id} className="flex items-start justify-between gap-2 py-1.5 border-b border-border last:border-0">
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-foreground">{task.name}</p>
                      {task.description && (
                        <p className="text-xs text-muted-foreground mt-0.5">{task.description}</p>
                      )}
                    </div>
                    <Badge variant={task.status === "completed" ? "default" : "outline"}>
                      {task.status.replace("_", " ")}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Effort & Cost */}
          {request.classification === "out_of_scope" && request.effort_min_hours && (
            <Card size="sm">
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs mb-1 text-muted-foreground/50">Effort</p>
                  <p className="text-sm font-ui text-muted-foreground">
                    {request.effort_min_hours}–{request.effort_max_hours} hrs
                  </p>
                </div>
                <div>
                  <p className="text-xs mb-1 text-muted-foreground/50">Cost Estimate</p>
                  {request.cost_min && request.cost_max && (
                    <p className="text-xl font-semibold text-primary">
                      ${request.cost_min.toLocaleString()}–${request.cost_max.toLocaleString()}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Timeline + Risk */}
          <div className="flex gap-3">
            {request.timeline_impact_days !== null && (
              <Badge variant="destructive">+{request.timeline_impact_days} days</Badge>
            )}
            {request.risk_level && (
              <Badge variant="outline" className="uppercase">
                {request.risk_level} risk
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Reply section */}
      <Separator />
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Reply to Client
          </p>
          <TonePicker value={tone} onChange={setTone} />
        </div>

        {accidentalYes && (
          <Card className="border-primary/30 bg-primary/10">
            <CardContent className="flex gap-3 items-start">
              <span>⚠️</span>
              <p className="text-xs text-[var(--amber-100)]">
                Your reply appears to accept out-of-scope work without mentioning cost or getting
                approval. Are you sure?
              </p>
            </CardContent>
          </Card>
        )}

        <Textarea
          value={reply}
          onChange={(e) => {
            setReplyTouched(true)
            setReply(e.target.value)
            checkAccidentalYes(e.target.value)
          }}
          rows={8}
        />

        {sendError && (
          <Card className="border-destructive/30 bg-destructive/10">
            <CardContent className="flex gap-3 items-center">
              <span className="text-destructive text-xs">{sendError}</span>
            </CardContent>
          </Card>
        )}

        <div className="flex items-center justify-between">
          <div className="flex gap-3">
            <Button variant="outline" size="sm" onClick={() => updateStatus("accepted_in_scope")}>
              Mark as In-Scope
            </Button>
            <Button variant="outline" size="sm" onClick={() => updateStatus("deferred")}>
              Defer
            </Button>
            <Button variant="destructive" size="sm" onClick={() => updateStatus("declined")}>
              Decline
            </Button>
          </div>
          <Button onClick={sendToClient} disabled={sending || !reply.trim()}>
            {sending ? "Sending..." : "Send to Client →"}
          </Button>
        </div>
      </div>
    </div>
  )
}
