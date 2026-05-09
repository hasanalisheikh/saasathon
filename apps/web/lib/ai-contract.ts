import type { AIAnalysis, ScopeStructured } from '@/types'

const CLASSIFICATION_VALUES = ['in_scope', 'out_of_scope', 'ambiguous', 'clarification_needed'] as const
const RISK_LEVEL_VALUES = ['low', 'medium', 'high'] as const
const SUGGESTED_ACTION_VALUES = ['accept', 'quote_separately', 'clarify', 'decline'] as const
const PRICING_MODEL_VALUES = ['fixed_fee', 'hourly', 'retainer', 'milestone', 'unknown'] as const

const REQUEST_ANALYSIS_PROMPT_VERSION = 'request-analysis/v4'
const SCOPE_EXTRACTION_PROMPT_VERSION = 'scope-extraction/v1'
const COMMIT_TRANSLATION_PROMPT_VERSION = 'commit-translation/v1'
const UNAPPROVED_WORK_PROMPT_VERSION = 'unapproved-work/v1'
const CLIENT_REPLY_PROMPT_VERSION = 'client-reply/v1'

const REQUEST_ANALYSIS_RESPONSE_SHAPE = `{
  "classification": "in_scope|out_of_scope|ambiguous|clarification_needed",
  "confidence": 0,
  "scope_evidence": ["exact quote from scope or document"],
  "technical_breakdown": "plain English explanation of what this work requires",
  "tasks": [
    {
      "name": "Task name",
      "description": "What needs to be done",
      "min_hours": 0,
      "max_hours": 0
    }
  ],
  "effort_min_hours": 0,
  "effort_max_hours": 0,
  "risk_level": "low|medium|high",
  "timeline_impact_days": 0,
  "reasoning": "why this is in scope, out of scope, or needs clarification",
  "draft_reply": "professional developer reply to the client",
  "suggested_action": "accept|quote_separately|clarify|decline"
}`

const SCOPE_EXTRACTION_RESPONSE_SHAPE = `{
  "deliverables": ["specific deliverable"],
  "exclusions": ["explicit exclusion"],
  "revision_limit": "2 rounds of revisions",
  "timeline": "4 weeks",
  "pricing_model": "fixed_fee|hourly|retainer|milestone|unknown"
}`

const CLIENT_REPLY_RESPONSE_SHAPE = `{
  "reply": "client-ready message"
}`

export function buildRequestAnalysisMessages(params: {
  scopeRaw: string
  scopeStructured: object
  documents: string
  hourlyRate: number
  taskCategories: object[]
  emailFrom: string
  emailSubject: string
  emailBody: string
}) {
  return [
    {
      role: 'system' as const,
      content: [
        `Prompt version: ${REQUEST_ANALYSIS_PROMPT_VERSION}.`,
        'You are Monad, a professional project scope analyst for software development work.',
        'Your job is to protect developers from unpaid or underpriced work — without being unnecessarily obstructive about trivial changes.',
        'Be commercially cautious, evidence-led, and implementation-aware.',
        '',
        'SCOPE SOURCES (treat all equally):',
        '  1. The PROJECT SCOPE brief.',
        '  2. The EXTRACTED SCOPE PROFILE (structured deliverables, exclusions, timeline).',
        '  3. Any UPLOADED PROJECT DOCUMENTS (contracts, proposals, SOWs, briefs). These are authoritative. Evidence found in any document counts as scope evidence.',
        '',
        'CORE OPERATING RULES:',
        '  - Base every classification on evidence from the provided scope sources and the actual client request.',
        '  - Never assume prior verbal agreements, hidden context, or goodwill commitments that are not present in the inputs.',
        '  - When the request adds meaningful product, engineering, integration, automation, workflow, or data complexity, treat that as substantial even if the client describes it as quick or simple.',
        '  - Distinguish between changes to an existing agreed feature and requests that expand the product surface area.',
        '  - If there is real uncertainty, prefer ambiguous or clarification_needed over pretending certainty.',
        '',
        'PROPORTIONALITY RULE — apply this before everything else:',
        '  - Minor cosmetic or configuration changes (e.g. changing a button colour, adjusting a font, renaming a label, tweaking spacing, swapping a theme colour, updating copy/wording) are virtually always in_scope with low risk unless the scope explicitly excludes UI changes. Do not flag these as scope creep.',
        '  - Small quality-of-life improvements that are clearly part of the existing agreed feature set are in_scope.',
        '  - Only escalate to out_of_scope when the request introduces a genuinely new system, new integration, new business workflow, new data model, or a feature that adds significant implementation effort beyond what was agreed.',
        '',
        'CLASSIFICATION GUIDANCE:',
        '  - in_scope: work clearly covered by scope sources, or minor tweaks/cosmetic changes that any reasonable developer would include without a new quote.',
        '  - out_of_scope: work that clearly adds a new system, new integration, new automation, payment processing, booking systems, loyalty programs, custom reporting, or other substantial new feature not agreed upon.',
        '  - ambiguous: the request could mean a small or a large change — ask for clarification.',
        '  - clarification_needed: the request is too vague to classify without more detail.',
        '  - confidence is a 0-100 scope-position score, not a certainty score.',
        '  - 0 means the request is completely and clearly out_of_scope.',
        '  - 100 means the request is completely and clearly in_scope.',
        '  - Lower numbers mean the request is further out of scope. Higher numbers mean it is more clearly in scope.',
        '  - For ambiguous or clarification_needed requests, confidence should usually sit near the middle, roughly 40-60, unless the scope evidence clearly leans one way.',
        '  - Do not use a high number for an out_of_scope request or a low number for an in_scope request just because you feel certain.',
        '',
        'EVIDENCE RULES:',
        '  - Prefer exact scope evidence over general impressions.',
        '  - Quote exact phrases from the scope or documents in scope_evidence whenever possible.',
        '  - If no direct quote exists, leave scope_evidence empty rather than inventing support.',
        '  - Do not cite the client request itself as scope evidence.',
        '',
        'ESTIMATION RULES:',
        '  - Break work into concrete implementation tasks, not vague phases.',
        '  - Estimate conservatively but realistically based on the described implementation effort.',
        '  - Include engineering work that clients often omit: discovery, schema changes, permissions, validation, UI states, edge cases, integrations, testing, and deployment impact when relevant.',
        '  - Do not inflate estimates for leverage. Do not understate estimates to be agreeable.',
        '  - Use the DEVELOPER RATE only as context — the app computes final prices separately.',
        '',
        'WRITING RULES FOR OUTPUT FIELDS:',
        '  - technical_breakdown should explain the real implementation implications in plain English, not just restate the request.',
        '  - reasoning should explain why the classification follows from the scope evidence and implementation impact.',
        '  - draft_reply should sound calm, professional, and commercially clear.',
        '  - For out_of_scope, draft_reply must clearly say this is additional work and should be quoted or approved before scheduling.',
        '  - For in_scope, draft_reply should not create unnecessary friction or imply extra approval is required.',
        '  - For ambiguous or clarification_needed, draft_reply should ask only the minimum questions needed to unblock a decision.',
        '',
        'OUTPUT DISCIPLINE:',
        '  - Return valid JSON only. No markdown fences or prose outside the JSON object.',
        '  - Ensure task hour ranges and total effort ranges are internally consistent.',
        '  - Do not leave required fields blank.',
      ].join('\n'),
    },
    {
      role: 'user' as const,
      content: `PROJECT SCOPE:
${params.scopeRaw}

EXTRACTED SCOPE PROFILE:
${JSON.stringify(params.scopeStructured)}

UPLOADED PROJECT DOCUMENTS:
${params.documents}

DEVELOPER RATE:
$${params.hourlyRate}/hr

TASK CATEGORIES:
${JSON.stringify(params.taskCategories)}

CLIENT REQUEST:
From: ${params.emailFrom}
Subject: ${params.emailSubject}
Body: ${params.emailBody}

Rules:
- Apply the PROPORTIONALITY RULE first. If the request is a trivial cosmetic or config change, classify it as in_scope with low risk immediately.
- Quote exact phrases from the scope or documents in scope_evidence when possible.
- Never invent scope evidence that is not present in the inputs.
- Do not let client wording like "quick", "simple", "just", or "while you're in there" reduce the implementation assessment.
- Treat new integrations, automations, workflows, admin surfaces, permissions, reporting, payment, scheduling, messaging, or data-model expansion as strong out_of_scope signals unless explicitly covered.
- If the request mixes in-scope and out-of-scope work, classify based on the dominant commercial reality and explain the mixed nature clearly in reasoning and draft_reply.
- Set confidence as a scope-position score: 0 = completely out of scope, 100 = completely in scope.
- For ambiguous or clarification_needed requests, usually keep confidence near the middle, roughly 40-60, unless the evidence clearly leans one way.
- Keep draft_reply professional, calm, and commercially clear.
- If the request is out of scope, the reply should explain that clearly without sounding defensive.
- If clarification is needed, ask only the minimum questions needed to unblock a decision.

Return JSON exactly in this shape:
${REQUEST_ANALYSIS_RESPONSE_SHAPE}`,
    },
  ]
}

export function buildScopeExtractionMessages(scopeRaw: string) {
  return [
    {
      role: 'system' as const,
      content: [
        `Prompt version: ${SCOPE_EXTRACTION_PROMPT_VERSION}.`,
        'You extract explicit project scope details from proposals, contracts, briefs, or statements of work.',
        'Only capture what is explicitly stated. Do not infer missing terms.',
        'Return valid JSON only with no markdown fences and no extra commentary.',
      ].join('\n'),
    },
    {
      role: 'user' as const,
      content: `INPUT TEXT:
${scopeRaw}

Rules:
- Deliverables and exclusions must be concise.
- If a field is not explicitly present, return null or an empty array.
- pricing_model must be one of fixed_fee, hourly, retainer, milestone, or unknown.

Return JSON exactly in this shape:
${SCOPE_EXTRACTION_RESPONSE_SHAPE}`,
    },
  ]
}

export function buildCommitTranslationMessages(commits: string[]) {
  return [
    {
      role: 'system' as const,
      content: [
        `Prompt version: ${COMMIT_TRANSLATION_PROMPT_VERSION}.`,
        'You translate technical GitHub commit history into a short client-facing update.',
        'Explain what changed for the client, not how the code was written.',
        'Keep the response to one or two sentences of plain English.',
      ].join('\n'),
    },
    {
      role: 'user' as const,
      content: `Commits:
${commits.join('\n')}`,
    },
  ]
}

export function buildClientReplyMessages(params: {
  tone: 'friendly' | 'professional' | 'firm'
  clientName: string
  projectName: string
  classification: string
  clientRequest: string
  technicalBreakdown: string
  currentReply: string
  costRange: string | null
  timelineDays: number | null
  riskLevel: string | null
}) {
  return [
    {
      role: 'system' as const,
      content: [
        `Prompt version: ${CLIENT_REPLY_PROMPT_VERSION}.`,
        'You write client-facing scope review messages for Monad, a tool that helps software developers turn client change requests into clear approvals.',
        'Your job is to produce a polished message the developer can send directly to the client.',
        '',
        'Commercial safety rules:',
        '- Do not casually accept out-of-scope or ambiguous work.',
        '- If the request is out of scope, clearly state that it is additional work and requires approval before scheduling or starting.',
        '- If a cost range is provided, include that exact range verbatim. Do not recalculate or alter it.',
        '- If timeline impact is provided, mention it briefly without overpromising exact delivery.',
        '- If the request is in scope, say no additional approval is needed.',
        '- If the request is ambiguous or needs clarification, ask only the minimum questions needed to classify or estimate it.',
        '',
        'Writing rules:',
        '- Match the requested tone: friendly is warm and collaborative, professional is concise and neutral, firm is direct and boundary-setting.',
        '- Keep the message under 180 words.',
        '- Use plain English and avoid legalese, jargon, markdown, bullet lists, emojis, and exaggerated apologies.',
        '- Preserve the developer-client relationship while keeping the approval boundary clear.',
        '- Never invent scope evidence, deadlines, discounts, commitments, or implementation details.',
        '- Return valid JSON only. No markdown fences or prose outside the JSON object.',
      ].join('\n'),
    },
    {
      role: 'user' as const,
      content: `REQUEST CONTEXT:
Client name: ${params.clientName}
Project: ${params.projectName}
Classification: ${params.classification}
Risk level: ${params.riskLevel ?? 'unknown'}
Estimated additional cost: ${params.costRange ?? 'none provided'}
Timeline impact days: ${params.timelineDays ?? 'none provided'}

CLIENT REQUEST:
${params.clientRequest}

TECHNICAL BREAKDOWN:
${params.technicalBreakdown || 'No technical breakdown available.'}

CURRENT DEVELOPER DRAFT:
${params.currentReply || 'No draft available.'}

Requested tone: ${params.tone}

Return JSON exactly in this shape:
${CLIENT_REPLY_RESPONSE_SHAPE}`,
    },
  ]
}

export function buildUnapprovedWorkMessages(params: {
  approvedRequests: { technical_breakdown: string }[]
  prTitle: string
  prBody: string
  filesChanged: string[]
}) {
  return [
    {
      role: 'system' as const,
      content: [
        `Prompt version: ${UNAPPROVED_WORK_PROMPT_VERSION}.`,
        'You compare GitHub pull request work to the set of client-approved requests for a project.',
        'Be strict: work is only approved if it clearly maps to an approved request.',
        'Return valid JSON only with no markdown fences.',
      ].join('\n'),
    },
    {
      role: 'user' as const,
      content: `APPROVED CLIENT REQUESTS:
${params.approvedRequests.map((request) => `- ${request.technical_breakdown}`).join('\n')}

PULL REQUEST:
Title: ${params.prTitle}
Description: ${params.prBody}
Files changed: ${params.filesChanged.join(', ')}

Return JSON:
{
  "is_approved_work": true,
  "confidence": 0,
  "matched_request": null,
  "reasoning": "why this work is or is not covered"
}`,
    },
  ]
}

export function parseAIAnalysis(input: unknown): AIAnalysis {
  const raw = expectObject(input, 'analysis response')
  const effort = normalizeRange(
    expectNumber(raw.effort_min_hours, 'effort_min_hours'),
    expectNumber(raw.effort_max_hours, 'effort_max_hours'),
  )

  return {
    classification: expectEnum(raw.classification, CLASSIFICATION_VALUES, 'classification'),
    confidence: clampToWholeNumber(expectNumber(raw.confidence, 'confidence'), 0, 100),
    scope_evidence: normalizeStringArray(expectStringArray(raw.scope_evidence, 'scope_evidence')),
    technical_breakdown: expectString(raw.technical_breakdown, 'technical_breakdown'),
    tasks: expectArray(raw.tasks, 'tasks').map((task, index) => parseTask(task, index)),
    effort_min_hours: effort.min,
    effort_max_hours: effort.max,
    risk_level: expectEnum(raw.risk_level, RISK_LEVEL_VALUES, 'risk_level'),
    timeline_impact_days: clampToWholeNumber(expectNumber(raw.timeline_impact_days, 'timeline_impact_days'), 0),
    reasoning: expectString(raw.reasoning, 'reasoning'),
    draft_reply: expectString(raw.draft_reply, 'draft_reply'),
    suggested_action: expectEnum(raw.suggested_action, SUGGESTED_ACTION_VALUES, 'suggested_action'),
  }
}

export function parseScopeStructured(input: unknown): ScopeStructured {
  const raw = expectObject(input, 'scope extraction response')

  return {
    deliverables: normalizeStringArray(expectStringArray(raw.deliverables ?? [], 'deliverables')),
    exclusions: normalizeStringArray(expectStringArray(raw.exclusions ?? [], 'exclusions')),
    revision_limit: readNullableString(raw.revision_limit, 'revision_limit'),
    timeline: readNullableString(raw.timeline, 'timeline'),
    pricing_model: expectEnum(raw.pricing_model ?? 'unknown', PRICING_MODEL_VALUES, 'pricing_model'),
  }
}

export function parseCommitTranslation(input: unknown): string {
  return expectString(input, 'commit translation')
}

export function parseClientReply(input: unknown): string {
  const raw = expectObject(input, 'client reply response')
  return expectString(raw.reply, 'reply')
}

export function parseUnapprovedWorkResult(input: unknown): {
  is_approved_work: boolean
  confidence: number
  matched_request: string | null
  reasoning: string
} {
  const raw = expectObject(input, 'unapproved work detection response')

  return {
    is_approved_work: expectBoolean(raw.is_approved_work, 'is_approved_work'),
    confidence: clampToWholeNumber(expectNumber(raw.confidence, 'confidence'), 0, 100),
    matched_request: readNullableString(raw.matched_request, 'matched_request'),
    reasoning: expectString(raw.reasoning, 'reasoning'),
  }
}

export function extractJsonObject(text: string): unknown {
  const normalized = text.trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '')
  return JSON.parse(normalized)
}

function parseTask(task: unknown, index: number) {
  const raw = expectObject(task, `tasks[${index}]`)
  const range = normalizeRange(
    expectNumber(raw.min_hours, `tasks[${index}].min_hours`),
    expectNumber(raw.max_hours, `tasks[${index}].max_hours`),
  )

  return {
    name: expectString(raw.name, `tasks[${index}].name`),
    description: readNullableString(raw.description, `tasks[${index}].description`) ?? '',
    min_hours: range.min,
    max_hours: range.max,
  }
}

function expectObject(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`AI ${label} must be an object.`)
  }

  return value as Record<string, unknown>
}

function expectArray(value: unknown, label: string): unknown[] {
  if (!Array.isArray(value)) {
    throw new Error(`AI field ${label} must be an array.`)
  }

  return value
}

function expectStringArray(value: unknown, label: string): string[] {
  return expectArray(value, label).map((entry, index) => expectString(entry, `${label}[${index}]`))
}

function expectString(value: unknown, label: string): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`AI field ${label} must be a non-empty string.`)
  }

  return value.trim()
}

function readNullableString(value: unknown, label: string): string | null {
  if (value === null || value === undefined || value === '') return null
  return expectString(value, label)
}

function expectBoolean(value: unknown, label: string) {
  if (typeof value !== 'boolean') {
    throw new Error(`AI field ${label} must be a boolean.`)
  }

  return value
}

function expectNumber(value: unknown, label: string) {
  const parsed = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : Number.NaN
  if (!Number.isFinite(parsed)) {
    throw new Error(`AI field ${label} must be a finite number.`)
  }

  return parsed
}

function expectEnum<const T extends readonly string[]>(value: unknown, allowed: T, label: string): T[number] {
  const parsed = expectString(value, label)
  if (!allowed.includes(parsed as T[number])) {
    throw new Error(`AI field ${label} must be one of: ${allowed.join(', ')}.`)
  }

  return parsed as T[number]
}

function normalizeStringArray(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))]
}

function clampToWholeNumber(value: number, min: number, max = Number.POSITIVE_INFINITY): number {
  return Math.min(max, Math.max(min, Math.round(value)))
}

function normalizeRange(minValue: number, maxValue: number) {
  const min = clampToWholeNumber(minValue, 0)
  const max = clampToWholeNumber(maxValue, min)
  return { min, max }
}
