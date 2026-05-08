"use client"

import { useParams, useRouter } from "next/navigation"
import { useState } from "react"
import Link from "next/link"
import { Card } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import { FormField, FormLabel, FormError } from "@workspace/ui/components/form-field"
import { PageHeader, PageTitle, PageDescription } from "@workspace/ui/components/page-header"

export default function NewRequestPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [subject, setSubject] = useState("Quick additions before launch")
  const [from, setFrom] = useState("Marcus <marcus@example.com>")
  const [body, setBody] = useState(`Hey Jamie,

The site is looking great. Before we launch, could you also add online ordering, table bookings, loyalty points, and automated reminder emails?

Should be quick since the design is already done.

Cheers,
Marcus`)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      const res = await fetch(`/api/projects/${id}/requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          raw_email_from: from,
          raw_email_subject: subject,
          raw_email_body: body,
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error ?? "Could not create request")
      }

      router.push(`/projects/${id}/requests/${data.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create request")
      setSubmitting(false)
    }
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="mx-auto w-full max-w-2xl space-y-8">
        <PageHeader>
          <div>
            <PageTitle>Add Client Request</PageTitle>
            <PageDescription>
              Paste a client email to run the same scope analysis used by inbound email.
            </PageDescription>
          </div>
        </PageHeader>

        <form onSubmit={submit} className="space-y-4">
          <FormField>
            <FormLabel>From</FormLabel>
            <Input value={from} onChange={(e) => setFrom(e.target.value)} />
          </FormField>

          <FormField>
            <FormLabel>Subject</FormLabel>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
          </FormField>

          <FormField>
            <FormLabel>Request body</FormLabel>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={12}
              required
            />
          </FormField>

          {error && <FormError>{error}</FormError>}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || !body.trim()}>
              {submitting ? "Analysing..." : "Analyse Request"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
