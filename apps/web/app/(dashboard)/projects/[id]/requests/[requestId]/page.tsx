'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Request, Project } from '@/types'

const ACCIDENTAL_YES = ['sure', 'no problem', 'happy to', 'of course', 'will do', 'sounds good', 'absolutely']

export default function RequestReviewPage() {
  const { id, requestId } = useParams<{ id: string; requestId: string }>()
  const router = useRouter()

  const [request, setRequest] = useState<Request | null>(null)
  const [project, setProject] = useState<Project | null>(null)
  const [reply, setReply] = useState('')
  const [tone, setTone] = useState<'friendly' | 'professional' | 'firm'>('professional')
  const [sending, setSending] = useState(false)
  const [accidentalYes, setAccidentalYes] = useState(false)

  useEffect(() => {
    async function load() {
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
    load()
  }, [id, requestId])

  function checkAccidentalYes(text: string) {
    const lower = text.toLowerCase()
    const isOutOfScope = request?.classification === 'out_of_scope' || request?.classification === 'ambiguous'
    if (!isOutOfScope) { setAccidentalYes(false); return }
    setAccidentalYes(ACCIDENTAL_YES.some((w) => lower.includes(w)))
  }

  async function sendToClient() {
    setSending(true)
    try {
      await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request_id: requestId, final_reply: reply, tone }),
      })
      router.push(`/projects/${id}`)
    } finally {
      setSending(false)
    }
  }

  async function updateStatus(status: string) {
    await fetch(`/api/requests/${requestId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    router.push(`/projects/${id}`)
  }

  if (!request) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-sm" style={{ color: '#4a5568' }}>Loading...</p>
      </div>
    )
  }

  const classColors: Record<string, string> = {
    out_of_scope: '#ef4444',
    in_scope: '#10b981',
    ambiguous: '#f59e0b',
    clarification_needed: '#3b82f6',
  }
  const classColor = classColors[request.classification ?? ''] ?? '#8892a4'
  const classLabel: Record<string, string> = {
    out_of_scope: 'OUT OF SCOPE',
    in_scope: 'IN SCOPE',
    ambiguous: 'AMBIGUOUS',
    clarification_needed: 'CLARIFY',
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Topbar */}
      <div className="flex items-center gap-2 px-6 py-3 border-b text-xs" style={{ borderColor: 'rgba(255,255,255,0.06)', color: '#4a5568' }}>
        <Link href="/projects" style={{ color: '#4a5568' }}>Projects</Link>
        <span>/</span>
        <Link href={`/projects/${id}`} style={{ color: '#4a5568' }}>{project?.name ?? 'Project'}</Link>
        <span>/</span>
        <span style={{ color: '#8892a4' }}>Request Review</span>
      </div>

      {/* Two-panel */}
      <div className="flex gap-0 divide-x" style={{ borderColor: 'rgba(255,255,255,0.06)', minHeight: 'calc(100vh - 120px)' }}>

        {/* LEFT — Raw email (60%) */}
        <div className="w-[60%] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wider" style={{ color: '#8892a4' }}>Client Request</p>
            <SourceBadge source={request.source} />
          </div>

          {/* Email metadata */}
          <div className="p-4 rounded-lg space-y-2" style={{ background: '#0f1624', border: '1px solid rgba(255,255,255,0.08)' }}>
            {[
              ['From', request.raw_email_from],
              ['Subject', request.raw_email_subject],
              ['Received', new Date(request.created_at).toLocaleString()],
            ].map(([k, v]) => v && (
              <div key={k} className="flex gap-3">
                <span className="text-xs w-16 flex-shrink-0" style={{ color: '#4a5568' }}>{k}</span>
                <span className="text-xs" style={{ color: '#8892a4' }}>{v}</span>
              </div>
            ))}
          </div>

          {/* Email body */}
          <div
            className="p-5 rounded-lg text-sm whitespace-pre-wrap leading-relaxed"
            style={{ background: '#0f1624', border: '1px solid rgba(255,255,255,0.08)', fontFamily: 'DM Mono, monospace', color: '#f0f4ff', minHeight: 200 }}
          >
            {request.raw_email_body}
          </div>
        </div>

        {/* RIGHT — AI Analysis (40%) */}
        <div className="w-[40%] p-6 space-y-5" style={{ borderLeft: '1px solid rgba(255,255,255,0.06)' }}>

          {/* Classification badge */}
          <div className="p-4 rounded-lg" style={{ background: `${classColor}15`, border: `1px solid ${classColor}40` }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg font-bold" style={{ color: classColor }}>
                {classLabel[request.classification ?? ''] ?? 'ANALYSING'}
              </span>
            </div>
            {request.confidence !== null && (
              <div>
                <div className="flex justify-between text-xs mb-1" style={{ color: '#8892a4' }}>
                  <span>Confidence</span>
                  <span style={{ color: classColor }}>{request.confidence}%</span>
                </div>
                <div className="h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <div
                    className="h-1 rounded-full"
                    style={{ width: `${request.confidence}%`, background: classColor }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Scope evidence */}
          {request.scope_evidence?.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-wider mb-2" style={{ color: '#8892a4' }}>Evidence from original scope</p>
              <div className="space-y-2">
                {request.scope_evidence.map((quote, i) => (
                  <div key={i} className="px-3 py-2 rounded text-xs italic" style={{ borderLeft: '2px solid #f59e0b', background: 'rgba(245,158,11,0.06)', color: '#f0f4ff' }}>
                    &ldquo;{quote}&rdquo;
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Technical breakdown */}
          {request.technical_breakdown && (
            <div>
              <p className="text-xs uppercase tracking-wider mb-2" style={{ color: '#8892a4' }}>What this actually involves</p>
              <p className="text-xs leading-relaxed" style={{ color: '#8892a4', fontFamily: 'DM Mono, monospace' }}>
                {request.technical_breakdown}
              </p>
            </div>
          )}

          {/* Effort & Cost */}
          {request.effort_min_hours && (
            <div className="grid grid-cols-2 gap-4 p-4 rounded-lg" style={{ background: '#080c14', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div>
                <p className="text-xs mb-1" style={{ color: '#4a5568' }}>Effort</p>
                <p className="text-sm" style={{ fontFamily: 'DM Mono, monospace', color: '#8892a4' }}>
                  {request.effort_min_hours}–{request.effort_max_hours} hrs
                </p>
              </div>
              <div>
                <p className="text-xs mb-1" style={{ color: '#4a5568' }}>Cost Estimate</p>
                {request.cost_min && request.cost_max && (
                  <p className="text-xl font-light" style={{ fontFamily: 'Fraunces, Georgia, serif', color: '#f59e0b' }}>
                    ${request.cost_min.toLocaleString()}–${request.cost_max.toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Timeline + Risk */}
          <div className="flex gap-3">
            {request.timeline_impact_days !== null && (
              <span className="text-xs px-2 py-1 rounded" style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444' }}>
                +{request.timeline_impact_days} days
              </span>
            )}
            {request.risk_level && (
              <span className="text-xs px-2 py-1 rounded uppercase" style={{ background: 'rgba(255,255,255,0.06)', color: '#8892a4' }}>
                {request.risk_level} risk
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Reply section */}
      <div className="border-t p-6 space-y-4" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-wider" style={{ color: '#8892a4' }}>Reply to Client</p>
          <TonePicker tone={tone} onChange={setTone} />
        </div>

        {accidentalYes && (
          <div className="p-3 rounded-lg flex gap-3 items-start" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)' }}>
            <span>⚠️</span>
            <p className="text-xs" style={{ color: '#fef3c7' }}>
              Your reply appears to accept out-of-scope work without mentioning cost or getting approval. Are you sure?
            </p>
          </div>
        )}

        <textarea
          value={reply}
          onChange={(e) => { setReply(e.target.value); checkAccidentalYes(e.target.value) }}
          rows={8}
          className="w-full p-4 rounded-lg text-sm outline-none"
          style={{
            background: '#0f1624',
            border: '1px solid rgba(255,255,255,0.10)',
            color: '#f0f4ff',
            fontFamily: 'DM Mono, monospace',
            resize: 'vertical',
          }}
        />

        <div className="flex items-center justify-between">
          <div className="flex gap-3">
            <button onClick={() => updateStatus('accepted_in_scope')} className="text-xs px-3 py-1.5 rounded" style={{ color: '#8892a4', border: '1px solid rgba(255,255,255,0.08)' }}>Mark as In-Scope</button>
            <button onClick={() => updateStatus('deferred')} className="text-xs px-3 py-1.5 rounded" style={{ color: '#8892a4', border: '1px solid rgba(255,255,255,0.08)' }}>Defer</button>
            <button onClick={() => updateStatus('declined')} className="text-xs px-3 py-1.5 rounded" style={{ color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>Decline</button>
          </div>
          <button
            onClick={sendToClient}
            disabled={sending || !reply.trim()}
            className="px-5 py-2 rounded text-sm font-medium"
            style={{ background: sending ? 'rgba(245,158,11,0.4)' : '#f59e0b', color: '#080c14', cursor: sending ? 'not-allowed' : 'pointer' }}
          >
            {sending ? 'Sending...' : 'Send to Client →'}
          </button>
        </div>
      </div>
    </div>
  )
}

function SourceBadge({ source }: { source: string }) {
  const map: Record<string, string> = { email: '#3b82f6', widget: '#10b981', manual: '#8892a4' }
  const color = map[source] ?? '#8892a4'
  return (
    <span className="text-xs px-2 py-0.5 rounded uppercase" style={{ color, background: `${color}18` }}>
      {source}
    </span>
  )
}

function TonePicker({ tone, onChange }: { tone: string; onChange: (t: 'friendly' | 'professional' | 'firm') => void }) {
  return (
    <div className="flex gap-1">
      {(['friendly', 'professional', 'firm'] as const).map((t) => (
        <button
          key={t}
          onClick={() => onChange(t)}
          className="text-xs px-3 py-1 rounded capitalize"
          style={{
            background: tone === t ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.04)',
            color: tone === t ? '#f59e0b' : '#8892a4',
            border: tone === t ? '1px solid rgba(245,158,11,0.3)' : '1px solid rgba(255,255,255,0.08)',
          }}
        >
          {t}
        </button>
      ))}
    </div>
  )
}
