'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Step = 1 | 2 | 3

interface FormData {
  name: string
  client_name: string
  client_email: string
  scope_raw: string
  scope_structured: {
    deliverables: string[]
    exclusions: string[]
    revision_limit: string | null
    timeline: string | null
    pricing_model: string | null
  } | null
  hourly_rate: number
  task_categories: { name: string; min_hours: number; max_hours: number }[]
}

const SUGGESTED_CATEGORIES = [
  { name: 'Authentication', min_hours: 4, max_hours: 8 },
  { name: 'Payment integration', min_hours: 10, max_hours: 16 },
  { name: 'Booking system', min_hours: 8, max_hours: 14 },
  { name: 'UI component', min_hours: 2, max_hours: 6 },
  { name: 'Database work', min_hours: 3, max_hours: 8 },
  { name: 'API integration', min_hours: 4, max_hours: 10 },
]

export default function NewProjectPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [extracting, setExtracting] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState<FormData>({
    name: '',
    client_name: '',
    client_email: '',
    scope_raw: '',
    scope_structured: null,
    hourly_rate: 100,
    task_categories: [{ name: 'Feature development', min_hours: 4, max_hours: 8 }],
  })

  async function extractScope() {
    if (!form.scope_raw.trim()) return
    setExtracting(true)
    try {
      const res = await fetch('/api/ai/extract-scope', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scope_raw: form.scope_raw }),
      })
      const data = await res.json()
      setForm((f) => ({ ...f, scope_structured: data }))
    } catch (e) {
      console.error(e)
    } finally {
      setExtracting(false)
    }
  }

  async function submit() {
    setSubmitting(true)
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const { id } = await res.json()
      router.push(`/projects/${id}`)
    } catch (e) {
      console.error(e)
      setSubmitting(false)
    }
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 max-w-2xl mx-auto w-full">
      <h1 className="text-xl mb-2" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>New Project</h1>

      {/* Progress */}
      <div className="flex gap-2 mb-8">
        {([1, 2, 3] as Step[]).map((s) => (
          <div
            key={s}
            className="h-1 flex-1 rounded-full"
            style={{ background: step >= s ? '#f59e0b' : 'rgba(255,255,255,0.08)' }}
          />
        ))}
      </div>

      {/* Step 1 — Basics */}
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-sm font-medium mb-4" style={{ color: '#8892a4' }}>Step 1 — Project Basics</h2>
          <Field label="Project name *">
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Marcus — Restaurant Website"
              style={inputStyle}
            />
          </Field>
          <Field label="Client name *">
            <input
              value={form.client_name}
              onChange={(e) => setForm((f) => ({ ...f, client_name: e.target.value }))}
              placeholder="Marcus"
              style={inputStyle}
            />
          </Field>
          <Field label="Client email (recommended)">
            <input
              type="email"
              value={form.client_email}
              onChange={(e) => setForm((f) => ({ ...f, client_email: e.target.value }))}
              placeholder="marcus@example.com"
              style={inputStyle}
            />
          </Field>
          <div className="flex justify-end pt-2">
            <Btn onClick={() => form.name && form.client_name && setStep(2)} disabled={!form.name || !form.client_name}>
              Next →
            </Btn>
          </div>
        </div>
      )}

      {/* Step 2 — Scope */}
      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-sm font-medium mb-4" style={{ color: '#8892a4' }}>Step 2 — Scope Definition</h2>
          <Field label="Paste your project scope" hint="Your proposal, contract, or bullet points. AI will extract the key details.">
            <textarea
              value={form.scope_raw}
              onChange={(e) => setForm((f) => ({ ...f, scope_raw: e.target.value }))}
              rows={10}
              placeholder="5-page website: Home, Menu, About, Gallery, Contact. Contact form with validation. Basic SEO. 2 rounds of revisions. EXCLUDES: online ordering, payment processing, booking systems..."
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </Field>

          <button
            onClick={extractScope}
            disabled={extracting || !form.scope_raw.trim()}
            className="text-sm px-4 py-2 rounded"
            style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' }}
          >
            {extracting ? 'Extracting...' : 'Extract Scope with AI'}
          </button>

          {form.scope_structured && (
            <div className="p-4 rounded-lg space-y-2" style={{ background: '#080c14', border: '1px solid rgba(255,255,255,0.06)' }}>
              <ScopeRow icon="✓" label="Deliverables" items={form.scope_structured.deliverables} />
              <ScopeRow icon="✗" label="Exclusions" items={form.scope_structured.exclusions} color="#ef4444" />
              {form.scope_structured.revision_limit && (
                <p className="text-xs" style={{ color: '#8892a4' }}>↻ Revisions: {form.scope_structured.revision_limit}</p>
              )}
              {form.scope_structured.timeline && (
                <p className="text-xs" style={{ color: '#8892a4' }}>⏱ Timeline: {form.scope_structured.timeline}</p>
              )}
            </div>
          )}

          <div className="flex justify-between pt-2">
            <Btn secondary onClick={() => setStep(1)}>← Back</Btn>
            <Btn onClick={() => setStep(3)} disabled={!form.scope_raw.trim()}>Next →</Btn>
          </div>
        </div>
      )}

      {/* Step 3 — Rate Card */}
      {step === 3 && (
        <div className="space-y-4">
          <h2 className="text-sm font-medium mb-4" style={{ color: '#8892a4' }}>Step 3 — Rate Card</h2>
          <Field label="Your hourly rate (USD)">
            <input
              type="number"
              value={form.hourly_rate}
              onChange={(e) => setForm((f) => ({ ...f, hourly_rate: Number(e.target.value) }))}
              style={{ ...inputStyle, width: 120 }}
            />
          </Field>

          <div>
            <label className="block text-xs mb-3" style={{ color: '#8892a4' }}>Task categories</label>
            <div className="space-y-2 mb-3">
              {form.task_categories.map((cat, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    value={cat.name}
                    onChange={(e) => {
                      const cats = [...form.task_categories]
                      const c = cats[i]!
                      cats[i] = { name: e.target.value, min_hours: c.min_hours, max_hours: c.max_hours }
                      setForm((f) => ({ ...f, task_categories: cats }))
                    }}
                    placeholder="Category name"
                    style={{ ...inputStyle, flex: 2 }}
                  />
                  <input
                    type="number"
                    value={cat.min_hours}
                    onChange={(e) => {
                      const cats = [...form.task_categories]
                      const c = cats[i]!
                      cats[i] = { name: c.name, min_hours: Number(e.target.value), max_hours: c.max_hours }
                      setForm((f) => ({ ...f, task_categories: cats }))
                    }}
                    placeholder="Min hrs"
                    style={{ ...inputStyle, flex: 1 }}
                  />
                  <input
                    type="number"
                    value={cat.max_hours}
                    onChange={(e) => {
                      const cats = [...form.task_categories]
                      const c = cats[i]!
                      cats[i] = { name: c.name, min_hours: c.min_hours, max_hours: Number(e.target.value) }
                      setForm((f) => ({ ...f, task_categories: cats }))
                    }}
                    placeholder="Max hrs"
                    style={{ ...inputStyle, flex: 1 }}
                  />
                  <button
                    onClick={() => setForm((f) => ({ ...f, task_categories: f.task_categories.filter((_, j) => j !== i) }))}
                    style={{ color: '#4a5568', fontSize: 16, lineHeight: 1 }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              {SUGGESTED_CATEGORIES.map((s) => (
                <button
                  key={s.name}
                  onClick={() => setForm((f) => ({ ...f, task_categories: [...f.task_categories, s] }))}
                  className="text-xs px-2 py-1 rounded"
                  style={{ background: 'rgba(255,255,255,0.04)', color: '#8892a4', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  + {s.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between pt-2">
            <Btn secondary onClick={() => setStep(2)}>← Back</Btn>
            <Btn onClick={submit} disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Project'}
            </Btn>
          </div>
        </div>
      )}
    </div>
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs mb-1.5" style={{ color: '#8892a4' }}>{label}</label>
      {hint && <p className="text-xs mb-2" style={{ color: '#4a5568' }}>{hint}</p>}
      {children}
    </div>
  )
}

function ScopeRow({ icon, label, items, color = '#10b981' }: { icon: string; label: string; items: string[]; color?: string }) {
  if (!items.length) return null
  return (
    <div>
      <p className="text-xs mb-1" style={{ color: '#8892a4' }}>{label}:</p>
      {items.map((item, i) => (
        <p key={i} className="text-xs" style={{ color }}>{icon} {item}</p>
      ))}
    </div>
  )
}

function Btn({ children, onClick, disabled, secondary }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean; secondary?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-4 py-2 rounded text-sm font-medium"
      style={secondary
        ? { background: 'transparent', color: '#8892a4', border: '1px solid rgba(255,255,255,0.10)' }
        : { background: disabled ? 'rgba(245,158,11,0.4)' : '#f59e0b', color: '#080c14', cursor: disabled ? 'not-allowed' : 'pointer' }
      }
    >
      {children}
    </button>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  borderRadius: 6,
  background: '#080c14',
  border: '1px solid rgba(255,255,255,0.10)',
  color: '#f0f4ff',
  fontFamily: 'DM Mono, monospace',
  fontSize: 13,
  outline: 'none',
}
