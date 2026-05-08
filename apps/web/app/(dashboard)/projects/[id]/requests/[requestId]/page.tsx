"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import type { Request, Project } from "@/types"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { Textarea } from "@workspace/ui/components/textarea"
import { Separator } from "@workspace/ui/components/separator"
import { PageHeader, PageTitle, PageDescription } from "@workspace/ui/components/page-header"
import {
  ClassificationBadge,
  SourceBadge,
  getClassificationColorClass,
} from "@workspace/ui/components/status-badge"
import { TonePicker } from "@workspace/ui/components/tone-picker"
import type { Tone } from "@workspace/ui/components/tone-picker"

const ACCIDENTAL_YES = ["sure", "no problem", "happy to", "of course", "will do", "sounds good", "absolutely"]

export default function RequestReviewPage() {
  const { id, requestId } = useParams<{ id: string; requestId: string }>()
  const router = useRouter()

  const [request, setRequest] = useState<Request | null>(null)
  const [project, setProject] = useState<Project | null>(null)
  const [reply, setReply] = useState("")
  const [tone, setTone] = useState<Tone>("professional")
  const [sending, setSending] = useState(false)
  const [analysing, setAnalysing] = useState(false)
  const [accidentalYes, setAccidentalYes] = useState(false)

  async function loadRequest() {
    const [reqRes, projRes] = await Promise.all([
      fetch(`/api/requests/${requestId}`),
      fetch(`/api/projects/${id}`),
    ])
    const reqData = await reqRes.json()
    const projData = await projRes.json()
    setRequest(reqData)
    setProject(projData)
    setReply(reqData.draft_reply ?? '')
  }

  useEffect(() => {
    loadRequest()
  }, [id, requestId])

  async function reanalyse() {
    setAnalysing(true)
    try {
      await fetch('/api/ai/analyse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request_id: requestId }),
      })
      await loadRequest()
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
    try {
      await fetch("/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ request_id: requestId, final_reply: reply, tone }),
      })
      router.push(`/projects/${id}`)
    } finally {
      setSending(false)
    }
  }

  async function updateStatus(status: string) {
    await fetch(`/api/requests/${requestId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
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
              Review the client's request against the agreed scope and prepare a response.
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

          {/* Classification panel */}
          <Card
            className={`border-l-4 ${colorClass}`}
          >
            <CardContent className="space-y-3">
              <span className="text-lg font-bold">
                {classLabel[request.classification ?? ""] ?? "ANALYSING"}
              </span>
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

          {/* Effort & Cost */}
          {request.effort_min_hours && (
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
            setReply(e.target.value)
            checkAccidentalYes(e.target.value)
          }}
          rows={8}
        />

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
