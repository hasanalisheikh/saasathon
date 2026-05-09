"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import { FormField, FormLabel, FormHint } from "@workspace/ui/components/form-field"
import { StepProgress } from "@workspace/ui/components/step-progress"
import { PageTitle } from "@workspace/ui/components/page-header"
import { Tag } from "@workspace/ui/components/tag"

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
  { name: "Authentication", min_hours: 4, max_hours: 8 },
  { name: "Payment integration", min_hours: 10, max_hours: 16 },
  { name: "Booking system", min_hours: 8, max_hours: 14 },
  { name: "UI component", min_hours: 2, max_hours: 6 },
  { name: "Database work", min_hours: 3, max_hours: 8 },
  { name: "API integration", min_hours: 4, max_hours: 10 },
]

export default function NewProjectPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [extracting, setExtracting] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [extractError, setExtractError] = useState("")
  const [submitError, setSubmitError] = useState("")
  const [form, setForm] = useState<FormData>({
    name: "",
    client_name: "",
    client_email: "",
    scope_raw: "",
    scope_structured: null,
    hourly_rate: 100,
    task_categories: [{ name: "Feature development", min_hours: 4, max_hours: 8 }],
  })

  async function extractScope() {
    if (!form.scope_raw.trim()) return
    setExtracting(true)
    setExtractError("")
    try {
      const res = await fetch("/api/ai/extract-scope", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scope_raw: form.scope_raw }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error ?? "Could not extract scope")
      }
      setForm((f) => ({ ...f, scope_structured: data }))
    } catch (e) {
      setExtractError(e instanceof Error ? e.message : "Could not extract scope")
    } finally {
      setExtracting(false)
    }
  }

  async function submit() {
    setSubmitting(true)
    setSubmitError("")
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error ?? "Could not create project")
      }
      const { id } = data
      router.push(`/projects/${id}`)
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Could not create project")
      setSubmitting(false)
    }
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 max-w-2xl mx-auto w-full">
      <PageTitle className="mb-2">New Project</PageTitle>
      <StepProgress currentStep={step} totalSteps={3} className="mb-8" />

      {/* Step 1 — Basics */}
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-sm font-medium mb-4 text-muted-foreground">
            Step 1 — Project Basics
          </h2>
          <FormField>
            <FormLabel>Project name *</FormLabel>
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Marcus — Restaurant Website"
            />
          </FormField>
          <FormField>
            <FormLabel>Client name *</FormLabel>
            <Input
              value={form.client_name}
              onChange={(e) => setForm((f) => ({ ...f, client_name: e.target.value }))}
              placeholder="Marcus"
            />
          </FormField>
          <FormField>
            <FormLabel>Client email (optional)</FormLabel>
            <Input
              type="email"
              value={form.client_email}
              onChange={(e) => setForm((f) => ({ ...f, client_email: e.target.value }))}
              placeholder="marcus@example.com"
            />
          </FormField>
          <div className="flex justify-end pt-2">
            <Button
              onClick={() => form.name && form.client_name && setStep(2)}
              disabled={!form.name || !form.client_name}
            >
              Next →
            </Button>
          </div>
        </div>
      )}

      {/* Step 2 — Scope */}
      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-sm font-medium mb-4 text-muted-foreground">
            Step 2 — Scope Definition
          </h2>
          <FormField>
            <FormLabel>Paste your project scope</FormLabel>
            <FormHint>
              Your proposal, contract, or bullet points. AI will extract the key details.
            </FormHint>
            <Textarea
              value={form.scope_raw}
              onChange={(e) => setForm((f) => ({ ...f, scope_raw: e.target.value }))}
              rows={10}
              placeholder="5-page website: Home, Menu, About, Gallery, Contact. Contact form with validation. Basic SEO. 2 rounds of revisions. EXCLUDES: online ordering, payment processing, booking systems..."
            />
          </FormField>

          <Button
            variant="outline"
            onClick={extractScope}
            disabled={extracting || !form.scope_raw.trim()}
            className="border-primary/30 text-primary hover:bg-primary/10"
          >
            {extracting ? "Extracting..." : "Extract Scope with AI"}
          </Button>

          {extractError && (
            <p className="text-xs text-destructive">{extractError}</p>
          )}

          {form.scope_structured && (
            <Card size="sm">
              <CardContent className="space-y-2">
                <ScopeRow icon="✓" label="Deliverables" items={form.scope_structured.deliverables} />
                <ScopeRow icon="✗" label="Exclusions" items={form.scope_structured.exclusions} variant="destructive" />
                {form.scope_structured.revision_limit && (
                  <p className="text-xs text-muted-foreground">
                    ↻ Revisions: {form.scope_structured.revision_limit}
                  </p>
                )}
                {form.scope_structured.timeline && (
                  <p className="text-xs text-muted-foreground">
                    ⏱ Timeline: {form.scope_structured.timeline}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          <div className="flex justify-between pt-2">
            <Button variant="outline" onClick={() => setStep(1)}>
              ← Back
            </Button>
            <Button onClick={() => setStep(3)} disabled={!form.scope_raw.trim()}>
              Next →
            </Button>
          </div>
        </div>
      )}

      {/* Step 3 — Rate Card */}
      {step === 3 && (
        <div className="space-y-4">
          <h2 className="text-sm font-medium mb-4 text-muted-foreground">
            Step 3 — Rate Card
          </h2>
          <FormField>
            <FormLabel>Your hourly rate (USD)</FormLabel>
            <Input
              type="number"
              value={form.hourly_rate}
              onChange={(e) => setForm((f) => ({ ...f, hourly_rate: Number(e.target.value) }))}
              className="w-30"
            />
          </FormField>

          <div>
            <FormLabel className="mb-3">Task categories</FormLabel>
            <div className="space-y-2 mb-3">
              {form.task_categories.map((cat, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <Input
                    value={cat.name}
                    onChange={(e) => {
                      const cats = [...form.task_categories]
                      const c = cats[i]!
                      cats[i] = { name: e.target.value, min_hours: c.min_hours, max_hours: c.max_hours }
                      setForm((f) => ({ ...f, task_categories: cats }))
                    }}
                    placeholder="Category name"
                    className="flex-2"
                  />
                  <Input
                    type="number"
                    value={cat.min_hours}
                    onChange={(e) => {
                      const cats = [...form.task_categories]
                      const c = cats[i]!
                      cats[i] = { name: c.name, min_hours: Number(e.target.value), max_hours: c.max_hours }
                      setForm((f) => ({ ...f, task_categories: cats }))
                    }}
                    placeholder="Min hrs"
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={cat.max_hours}
                    onChange={(e) => {
                      const cats = [...form.task_categories]
                      const c = cats[i]!
                      cats[i] = { name: c.name, min_hours: c.min_hours, max_hours: Number(e.target.value) }
                      setForm((f) => ({ ...f, task_categories: cats }))
                    }}
                    placeholder="Max hrs"
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        task_categories: f.task_categories.filter((_, j) => j !== i),
                      }))
                    }
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              {SUGGESTED_CATEGORIES.map((s) => (
                <Tag
                  key={s.name}
                  variant="outline"
                  className="cursor-pointer hover:bg-muted"
                  onClick={() =>
                    setForm((f) => ({
                      ...f,
                      task_categories: [...f.task_categories, s],
                    }))
                  }
                  render={<button type="button" />}
                >
                  + {s.name}
                </Tag>
              ))}
            </div>
          </div>

          <div className="flex justify-between pt-2">
            <Button variant="outline" onClick={() => setStep(2)}>
              ← Back
            </Button>
            <Button onClick={submit} disabled={submitting}>
              {submitting ? "Creating..." : "Create Project"}
            </Button>
          </div>

          {submitError && (
            <p className="text-xs text-destructive">{submitError}</p>
          )}
        </div>
      )}
    </div>
  )
}

function ScopeRow({
  icon,
  label,
  items,
  variant = "default",
}: {
  icon: string
  label: string
  items: string[]
  variant?: "default" | "destructive"
}) {
  if (!items.length) return null
  return (
    <div>
      <p className="text-xs mb-1 text-muted-foreground">{label}:</p>
      {items.map((item, i) => (
        <p
          key={i}
          className={`text-xs ${variant === "destructive" ? "text-destructive" : "text-[var(--green-500)]"}`}
        >
          {icon} {item}
        </p>
      ))}
    </div>
  )
}
