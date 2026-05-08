// Typed client for the Hono AI API (apps/api).
// All streaming functions return an async generator that yields text chunks.
// All JSON functions return typed results.

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8787"

async function fetchJSON<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error((err as { error?: string }).error ?? "API error")
  }
  return res.json() as Promise<T>
}

async function* fetchStream(path: string, body: unknown): AsyncGenerator<string> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok || !res.body) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error((err as { error?: string }).error ?? "Stream error")
  }
  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      yield decoder.decode(value, { stream: true })
    }
  } finally {
    reader.releaseLock()
  }
}

// ─── Brief Ingestion ────────────────────────────────────────────────────────

export type BriefSection =
  | { type: "summary"; title: string; deliverables: string[]; keyDates: string[]; submissionFormat: string; highRiskAreas: string[] }
  | { type: "criteria"; items: { name: string; description: string; weight: number }[] }
  | { type: "tasks"; items: { title: string; description: string; priority: string; effortHours: number; criterionName: string; dependencies: string[] }[] }

export async function* streamBriefIngest(brief: string, projectId: string): AsyncGenerator<BriefSection> {
  let buffer = ""
  const sections: string[] = []

  for await (const chunk of fetchStream("/api/brief/ingest", { brief, projectId })) {
    buffer += chunk
    const parts = buffer.split("---SECTION---")
    // All complete sections except the last (which may be incomplete)
    for (let i = 0; i < parts.length - 1; i++) {
      const text = parts[i]!.trim()
      if (text) {
        try {
          yield JSON.parse(text) as BriefSection
        } catch {
          // malformed chunk — skip
        }
      }
    }
    buffer = parts[parts.length - 1] ?? ""
  }
  // Final section
  const text = buffer.trim()
  if (text) {
    try {
      yield JSON.parse(text) as BriefSection
    } catch {
      // ignore
    }
  }
}

// ─── Risk Audit ─────────────────────────────────────────────────────────────

export type RiskAuditResult = {
  score: number
  narrative: string
  criteriaStatuses: { name: string; status: "covered" | "partial" | "uncovered"; reason: string }[]
}

export type RiskCriterionInput = {
  name: string
  weight: number
  taskCount: number
  completedCount: number
}

export async function auditRisk(
  projectId: string,
  criteria: RiskCriterionInput[],
  triggerEvent: string,
): Promise<RiskAuditResult> {
  return fetchJSON("/api/risk/audit", { projectId, criteria, triggerEvent })
}

// ─── Focus Contracts ─────────────────────────────────────────────────────────

export type ContractVerdict = {
  verdict: "satisfied" | "partial" | "unsatisfied"
  reason: string
  suggestion: string | null
}

export async function validateProof(params: {
  taskTitle: string
  taskDescription: string
  criterionName: string
  criterionDescription: string
  proof: string
}): Promise<ContractVerdict> {
  return fetchJSON("/api/contract/validate", params)
}

export type TimeSuggestion = {
  suggestedHours: number
  reasoning: string
  warning: string | null
}

export async function suggestContractTime(params: {
  taskTitle: string
  taskDescription: string
  criterionWeight: number
  existingContracts: { deadline: string; hours: number }[]
}): Promise<TimeSuggestion> {
  return fetchJSON("/api/contract/suggest-time", params)
}

// ─── Chat ────────────────────────────────────────────────────────────────────

export type ChatMessage = { author: string; content: string; createdAt: string }

export async function* summariseChat(
  messages: ChatMessage[],
  criteria: string[],
  projectTitle: string,
): AsyncGenerator<string> {
  yield* fetchStream("/api/chat/summarise", { messages, criteria, projectTitle })
}

export type ScanResult = { flagged: boolean; reason: string | null }

export async function scanMessage(message: string, criteria: string[]): Promise<ScanResult> {
  return fetchJSON("/api/chat/scan", { message, criteria })
}

// ─── Submission Checker ──────────────────────────────────────────────────────

export type SubmissionCriterion = { name: string; weight: number; description: string }

export async function* checkSubmission(
  draftContent: string,
  criteria: SubmissionCriterion[],
  projectTitle: string,
): AsyncGenerator<string> {
  yield* fetchStream("/api/submission/check", { draftContent, criteria, projectTitle })
}
