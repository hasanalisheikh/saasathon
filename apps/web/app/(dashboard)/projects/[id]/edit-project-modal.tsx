'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Textarea } from '@workspace/ui/components/textarea'
import { FormField, FormLabel } from '@workspace/ui/components/form-field'
import { Card, CardContent } from '@workspace/ui/components/card'
import { Badge } from '@workspace/ui/components/badge'
import type { Project, ScopeStructured, TaskCategory } from '@/types'

const SUGGESTED_CATEGORIES: TaskCategory[] = [
  { name: 'Authentication', min_hours: 4, max_hours: 8 },
  { name: 'Payment integration', min_hours: 10, max_hours: 16 },
  { name: 'Booking system', min_hours: 8, max_hours: 14 },
  { name: 'UI component', min_hours: 2, max_hours: 6 },
  { name: 'Database work', min_hours: 3, max_hours: 8 },
  { name: 'API integration', min_hours: 4, max_hours: 10 },
]

interface Props {
  project: Project
}

export function EditProjectModal({ project }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [extracting, setExtracting] = useState(false)
  const [error, setError] = useState('')

  const [name, setName] = useState(project.name)
  const [clientName, setClientName] = useState(project.client_name)
  const [clientEmail, setClientEmail] = useState(project.client_email ?? '')
  const [hourlyRate, setHourlyRate] = useState(project.hourly_rate ?? '')
  const [scopeRaw, setScopeRaw] = useState(project.scope_raw ?? '')
  const [scopeStructured, setScopeStructured] = useState<ScopeStructured | null>(
    project.scope_structured,
  )
  const [taskCategories, setTaskCategories] = useState<TaskCategory[]>(
    project.task_categories ?? [],
  )

  async function extractScope() {
    if (!scopeRaw.trim()) return
    setExtracting(true)
    try {
      const res = await fetch('/api/ai/extract-scope', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scope_raw: scopeRaw }),
      })
      const data = await res.json()
      setScopeStructured(data)
    } catch {
      // silent — structured scope is optional
    } finally {
      setExtracting(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    const body = {
      name,
      client_name: clientName,
      client_email: clientEmail || null,
      hourly_rate: hourlyRate !== '' ? Number(hourlyRate) : null,
      scope_raw: scopeRaw || null,
      scope_structured: scopeStructured,
      task_categories: taskCategories,
    }
    const res = await fetch(`/api/projects/${project.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (res.ok) {
      setOpen(false)
      router.refresh()
    } else {
      const data = await res.json().catch(() => ({}))
      setError((data as { error?: string }).error ?? 'Failed to save. Please try again.')
    }
    setSaving(false)
  }

  function updateCategory(i: number, patch: Partial<TaskCategory>) {
    setTaskCategories((cats) => cats.map((c, j) => (j === i ? { ...c, ...patch } : c)))
  }

  function removeCategory(i: number) {
    setTaskCategories((cats) => cats.filter((_, j) => j !== i))
  }

  function addSuggested(cat: TaskCategory) {
    setTaskCategories((cats) => [...cats, { ...cat }])
  }

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        Edit
      </Button>
    )
  }

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/60"
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-lg rounded-lg border border-border bg-card shadow-xl flex flex-col max-h-[90vh]">
          <div className="px-6 pt-6 pb-4 border-b border-border shrink-0">
            <h2 className="text-sm font-semibold">Edit project</h2>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
              <FormField>
                <FormLabel>Project name</FormLabel>
                <Input value={name} onChange={(e) => setName(e.target.value)} required />
              </FormField>
              <FormField>
                <FormLabel>Client name</FormLabel>
                <Input value={clientName} onChange={(e) => setClientName(e.target.value)} required />
              </FormField>
              <FormField>
                <FormLabel>Client email</FormLabel>
                <Input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                />
              </FormField>
              <FormField>
                <FormLabel>Hourly rate (USD)</FormLabel>
                <Input
                  type="number"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                  className="w-28"
                />
              </FormField>

              {/* Scope */}
              <FormField>
                <FormLabel>Scope</FormLabel>
                <Textarea
                  value={scopeRaw}
                  onChange={(e) => {
                    setScopeRaw(e.target.value)
                    setScopeStructured(null)
                  }}
                  rows={6}
                  placeholder="Describe what is and isn't in scope…"
                />
              </FormField>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={extractScope}
                disabled={extracting || !scopeRaw.trim()}
                className="border-primary/30 text-primary hover:bg-primary/10"
              >
                {extracting ? 'Extracting…' : 'Re-extract scope with AI'}
              </Button>

              {scopeStructured && (
                <Card size="sm">
                  <CardContent className="space-y-2">
                    <ScopeRow icon="✓" label="Deliverables" items={scopeStructured.deliverables} />
                    <ScopeRow
                      icon="✗"
                      label="Exclusions"
                      items={scopeStructured.exclusions}
                      variant="destructive"
                    />
                    {scopeStructured.revision_limit && (
                      <p className="text-xs text-muted-foreground">
                        ↻ Revisions: {scopeStructured.revision_limit}
                      </p>
                    )}
                    {scopeStructured.timeline && (
                      <p className="text-xs text-muted-foreground">
                        ⏱ Timeline: {scopeStructured.timeline}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Task categories */}
              <div>
                <FormLabel className="mb-3">Task categories</FormLabel>
                <div className="space-y-2 mb-3">
                  {taskCategories.map((cat, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <Input
                        value={cat.name}
                        onChange={(e) => updateCategory(i, { name: e.target.value })}
                        placeholder="Category name"
                        className="flex-2"
                      />
                      <Input
                        type="number"
                        value={cat.min_hours}
                        onChange={(e) => updateCategory(i, { min_hours: Number(e.target.value) })}
                        placeholder="Min hrs"
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        value={cat.max_hours}
                        onChange={(e) => updateCategory(i, { max_hours: Number(e.target.value) })}
                        placeholder="Max hrs"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removeCategory(i)}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_CATEGORIES.map((s) => (
                    <Badge
                      key={s.name}
                      variant="outline"
                      className="cursor-pointer hover:bg-muted"
                      onClick={() => addSuggested(s)}
                      render={<button type="button" />}
                    >
                      + {s.name}
                    </Badge>
                  ))}
                </div>
              </div>

              {error && <p className="text-xs text-destructive">{error}</p>}
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border shrink-0">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving…' : 'Save changes'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

function ScopeRow({
  icon,
  label,
  items,
  variant = 'default',
}: {
  icon: string
  label: string
  items: string[]
  variant?: 'default' | 'destructive'
}) {
  if (!items.length) return null
  return (
    <div>
      <p className="text-xs mb-1 text-muted-foreground">{label}:</p>
      {items.map((item, i) => (
        <p
          key={i}
          className={`text-xs ${variant === 'destructive' ? 'text-destructive' : 'text-[var(--green-500)]'}`}
        >
          {icon} {item}
        </p>
      ))}
    </div>
  )
}
