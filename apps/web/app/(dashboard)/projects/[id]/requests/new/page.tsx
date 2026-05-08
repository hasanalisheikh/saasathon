"use client"

import { useParams, useRouter } from "next/navigation"
import { useState } from "react"

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
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-6">
          <p className="mb-2 text-xs" style={{ color: "#4a5568" }}>
            Projects / New request
          </p>
          <h1 className="text-xl" style={{ fontFamily: "Fraunces, Georgia, serif" }}>
            Add Client Request
          </h1>
          <p className="mt-2 text-sm" style={{ color: "#8892a4" }}>
            Paste a client email to run the same scope analysis used by inbound email.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <Field label="From">
            <input value={from} onChange={(e) => setFrom(e.target.value)} style={inputStyle} />
          </Field>

          <Field label="Subject">
            <input value={subject} onChange={(e) => setSubject(e.target.value)} style={inputStyle} />
          </Field>

          <Field label="Request body">
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={12}
              required
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </Field>

          {error && (
            <div
              className="rounded p-3 text-xs"
              style={{ background: "rgba(239,68,68,0.10)", border: "1px solid rgba(239,68,68,0.30)", color: "#fecaca" }}
            >
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded px-4 py-2 text-sm"
              style={{ border: "1px solid rgba(255,255,255,0.10)", color: "#8892a4" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !body.trim()}
              className="rounded px-4 py-2 text-sm font-medium"
              style={{
                background: submitting || !body.trim() ? "rgba(245,158,11,0.4)" : "#f59e0b",
                color: "#080c14",
                cursor: submitting ? "not-allowed" : "pointer",
              }}
            >
              {submitting ? "Analysing..." : "Analyse Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs" style={{ color: "#8892a4" }}>
        {label}
      </label>
      {children}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 12px",
  borderRadius: 6,
  background: "#080c14",
  border: "1px solid rgba(255,255,255,0.10)",
  color: "#f0f4ff",
  fontFamily: "DM Mono, monospace",
  fontSize: 13,
  outline: "none",
}
