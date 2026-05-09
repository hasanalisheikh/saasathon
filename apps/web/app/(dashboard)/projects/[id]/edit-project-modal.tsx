'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SparklesIcon, PlusIcon, Trash2Icon } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Textarea } from '@workspace/ui/components/textarea'
import { FormError, FormField, FormHint, FormLabel } from '@workspace/ui/components/form-field'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog'
import { Separator } from '@workspace/ui/components/separator'
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
  open?: boolean
  onOpenChange?: (open: boolean) => void
  hideTrigger?: boolean
}

export function EditProjectModal({ project, open: openProp, onOpenChange, hideTrigger = false }: Props) {
  const router = useRouter()
  const [internalOpen, setInternalOpen] = useState(false)
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
  const open = openProp ?? internalOpen

  function setOpen(nextOpen: boolean) {
    if (openProp === undefined) {
      setInternalOpen(nextOpen)
    }

    onOpenChange?.(nextOpen)
  }

  function resetForm() {
    setName(project.name)
    setClientName(project.client_name)
    setClientEmail(project.client_email ?? '')
    setHourlyRate(project.hourly_rate ?? '')
    setScopeRaw(project.scope_raw ?? '')
    setScopeStructured(project.scope_structured)
    setTaskCategories(project.task_categories ?? [])
    setSaving(false)
    setExtracting(false)
    setError('')
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)

    if (!nextOpen) {
      resetForm()
    }
  }

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
      handleOpenChange(false)
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
    setTaskCategories((cats) => {
      if (cats.some((existing) => existing.name.toLowerCase() === cat.name.toLowerCase())) {
        return cats
      }

      return [...cats, { ...cat }]
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {!hideTrigger && (
        <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
          Edit
        </Button>
      )}

      <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="border-b border-border px-6 py-5">
          <DialogTitle>Edit project</DialogTitle>
          <DialogDescription>
            Update project details, refresh the extracted scope, and keep pricing ranges aligned
            with the work you actually deliver.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
            <div className="space-y-6">
              <section className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-medium">Project details</h3>
                  <p className="text-xs/relaxed text-muted-foreground">
                    These values are used throughout approvals, summaries, and pricing.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField className="sm:col-span-2">
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
                      placeholder="client@company.com"
                    />
                  </FormField>

                  <FormField>
                    <FormLabel>Hourly rate (USD)</FormLabel>
                    <Input
                      type="number"
                      min="0"
                      step="1"
                      inputMode="numeric"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(e.target.value)}
                      placeholder="150"
                    />
                    <FormHint>Used as the baseline for cost estimates.</FormHint>
                  </FormField>
                </div>
              </section>

              <Separator />

              <section className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-medium">Scope</h3>
                  <p className="text-xs/relaxed text-muted-foreground">
                    Keep a clean source-of-truth brief, then regenerate structured scope when it
                    changes.
                  </p>
                </div>

                <FormField>
                  <FormLabel>Scope brief</FormLabel>
                  <Textarea
                    value={scopeRaw}
                    onChange={(e) => {
                      setScopeRaw(e.target.value)
                      setScopeStructured(null)
                    }}
                    rows={8}
                    placeholder="Describe what is in scope, what is excluded, and any revision or delivery expectations."
                  />
                  <FormHint>
                    Re-extract after major edits so deliverables and exclusions stay current.
                  </FormHint>
                </FormField>

                <div className="flex justify-start">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={extractScope}
                    disabled={extracting || !scopeRaw.trim()}
                  >
                    <SparklesIcon />
                    {extracting ? 'Extracting...' : 'Re-extract with AI'}
                  </Button>
                </div>

                {scopeStructured && (
                  <Card size="sm" className="border border-border/80 bg-muted/20">
                    <CardHeader className="gap-1 border-b border-border/80">
                      <CardTitle>Structured scope</CardTitle>
                      <CardDescription>
                        Generated from the brief above and used in downstream analysis.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                      <ScopeRow icon="✓" label="Deliverables" items={scopeStructured.deliverables} />
                      <ScopeRow
                        icon="✗"
                        label="Exclusions"
                        items={scopeStructured.exclusions}
                        variant="destructive"
                      />

                      {(scopeStructured.revision_limit || scopeStructured.timeline) && (
                        <div className="grid gap-2 sm:grid-cols-2">
                          {scopeStructured.revision_limit && (
                            <p className="text-xs/relaxed text-muted-foreground">
                              Revisions: {scopeStructured.revision_limit}
                            </p>
                          )}
                          {scopeStructured.timeline && (
                            <p className="text-xs/relaxed text-muted-foreground">
                              Timeline: {scopeStructured.timeline}
                            </p>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </section>

              <Separator />

              <section className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-medium">Task categories</h3>
                  <p className="text-xs/relaxed text-muted-foreground">
                    Shape the estimate ranges that Monad can reuse across similar requests.
                  </p>
                </div>

                <div className="space-y-3">
                  {taskCategories.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-xs/relaxed text-muted-foreground">
                      No task categories yet. Add one manually or start with a suggested category.
                    </div>
                  ) : (
                    <div className="overflow-hidden rounded-lg border border-border/80">
                      <div className="hidden grid-cols-[minmax(0,1.6fr)_minmax(0,0.7fr)_minmax(0,0.7fr)_auto] gap-3 border-b border-border/80 bg-muted/30 px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground sm:grid">
                        <span>Category</span>
                        <span>Min hours</span>
                        <span>Max hours</span>
                        <span className="sr-only">Remove</span>
                      </div>

                      <div className="divide-y divide-border/80">
                        {taskCategories.map((cat, i) => (
                          <div
                            key={`${cat.name}-${i}`}
                            className="grid gap-3 bg-muted/10 p-3 sm:grid-cols-[minmax(0,1.6fr)_minmax(0,0.7fr)_minmax(0,0.7fr)_auto] sm:items-end"
                          >
                            <FormField className="sm:space-y-0">
                              <FormLabel className="sm:sr-only">Category</FormLabel>
                              <Input
                                value={cat.name}
                                onChange={(e) => updateCategory(i, { name: e.target.value })}
                                placeholder="Category name"
                              />
                            </FormField>

                            <FormField className="sm:space-y-0">
                              <FormLabel className="sm:sr-only">Min hours</FormLabel>
                              <Input
                                type="number"
                                min="0"
                                step="1"
                                inputMode="numeric"
                                value={cat.min_hours}
                                onChange={(e) => updateCategory(i, { min_hours: Number(e.target.value) })}
                                placeholder="2"
                              />
                            </FormField>

                            <FormField className="sm:space-y-0">
                              <FormLabel className="sm:sr-only">Max hours</FormLabel>
                              <Input
                                type="number"
                                min="0"
                                step="1"
                                inputMode="numeric"
                                value={cat.max_hours}
                                onChange={(e) => updateCategory(i, { max_hours: Number(e.target.value) })}
                                placeholder="6"
                              />
                            </FormField>

                            <div className="flex items-end justify-end">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => removeCategory(i)}
                                aria-label={`Remove ${cat.name || 'task category'}`}
                              >
                                <Trash2Icon />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-medium text-foreground">Suggested categories</p>
                  <div className="flex flex-wrap gap-2">
                  {SUGGESTED_CATEGORIES.map((suggested) => {
                    const alreadyAdded = taskCategories.some(
                      (category) => category.name.toLowerCase() === suggested.name.toLowerCase(),
                    )

                    return (
                      <Button
                        key={suggested.name}
                        type="button"
                        variant={alreadyAdded ? 'secondary' : 'outline'}
                        size="sm"
                        disabled={alreadyAdded}
                        onClick={() => addSuggested(suggested)}
                      >
                        <PlusIcon />
                        {alreadyAdded ? `${suggested.name} added` : suggested.name}
                      </Button>
                    )
                  })}
                  </div>
                </div>
              </section>

              {error && <FormError>{error}</FormError>}
            </div>
          </div>

          <DialogFooter className="border-t border-border px-6 py-4">
            <Button type="button" variant="ghost" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
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
    <div className="space-y-2">
      <p className="text-xs font-medium text-foreground">{label}</p>
      <div className="space-y-1">
        {items.map((item, i) => (
          <p
            key={i}
            className={`text-xs/relaxed ${variant === 'destructive' ? 'text-destructive' : 'text-[var(--green-500)]'}`}
          >
            {icon} {item}
          </p>
        ))}
      </div>
    </div>
  )
}
