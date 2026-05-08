import OpenAI from 'openai'
import type { AIAnalysis } from '@/types'

let _openai: OpenAI | null = null
let _model = 'gpt-4o'

function getOpenAI(): OpenAI {
  if (!_openai) {
    if (process.env.NVIDIA_NIM_API_KEY) {
      _openai = new OpenAI({
        apiKey: process.env.NVIDIA_NIM_API_KEY,
        baseURL: 'https://integrate.api.nvidia.com/v1',
      })
      _model = process.env.AI_MODEL || 'meta/llama-3.3-70b-instruct'
    } else if (process.env.OPENROUTER_API_KEY) {
      _openai = new OpenAI({
        apiKey: process.env.OPENROUTER_API_KEY,
        baseURL: 'https://openrouter.ai/api/v1',
        defaultHeaders: {
          'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
          'X-Title': 'Monad',
        },
      })
      _model = process.env.AI_MODEL || 'openai/gpt-4o'
    } else {
      _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
      _model = process.env.AI_MODEL || 'gpt-4o'
    }
  }
  return _openai
}

export async function analyseRequest(params: {
  scopeRaw: string
  scopeStructured: object
  hourlyRate: number
  taskCategories: object[]
  emailFrom: string
  emailSubject: string
  emailBody: string
}): Promise<AIAnalysis> {
  const client = getOpenAI()
  const response = await client.chat.completions.create({
    model: _model,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    response_format: { type: 'json_object' } as any,
    temperature: 0.2,
    messages: [
      {
        role: 'system',
        content: `You are a professional project scope analyst for software development projects.
You protect developers from unpaid work by analysing client requests against agreed project scope.
Always respond in valid JSON only. Do not include markdown code fences.`,
      },
      {
        role: 'user',
        content: `PROJECT SCOPE:\n${params.scopeRaw}\n\nEXTRACTED SCOPE:\n${JSON.stringify(params.scopeStructured)}\n\nDEVELOPER RATE: $${params.hourlyRate}/hr\nTASK CATEGORIES: ${JSON.stringify(params.taskCategories)}\n\nCLIENT REQUEST:\nFrom: ${params.emailFrom}\nSubject: ${params.emailSubject}\nBody: ${params.emailBody}\n\nReturn JSON with: classification, confidence, scope_evidence, technical_breakdown, tasks, effort_min_hours, effort_max_hours, risk_level, timeline_impact_days, reasoning, draft_reply, suggested_action`,
      },
    ],
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const content = (response as any).choices?.[0]?.message?.content ?? '{}'
  return JSON.parse(content) as AIAnalysis
}

export async function extractScope(scopeRaw: string): Promise<object> {
  const client = getOpenAI()
  const response = await client.chat.completions.create({
    model: _model,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    response_format: { type: 'json_object' } as any,
    temperature: 0.1,
    messages: [
      {
        role: 'user',
        content: `You are extracting project scope details from a freelancer's proposal or contract.
Return only valid JSON with no markdown fences.

INPUT TEXT:
${scopeRaw}

Return JSON:
{
  "deliverables": ["array of specific deliverables mentioned"],
  "exclusions": ["array of things explicitly excluded"],
  "revision_limit": "e.g. '2 rounds of revisions' or null if not mentioned",
  "timeline": "e.g. '4 weeks' or null",
  "pricing_model": "fixed_fee | hourly | retainer | milestone | unknown"
}

Rules:
- Only extract what is explicitly stated. Do not infer.
- If something is not mentioned, use null or empty array.
- Keep deliverable descriptions concise (under 10 words each).`,
      },
    ],
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return JSON.parse((response as any).choices?.[0]?.message?.content ?? '{}')
}

export async function translateCommits(commits: string[]): Promise<string> {
  const client = getOpenAI()
  const response = await client.chat.completions.create({
    model: _model,
    temperature: 0.3,
    messages: [
      {
        role: 'user',
        content: `Translate these GitHub commits into 1-2 sentences of plain English for a non-technical client. Focus on what changed for them, not how.\n\nCommits:\n${commits.join('\n')}`,
      },
    ],
  })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (response as any).choices?.[0]?.message?.content ?? ''
}

export async function detectUnapprovedWork(params: {
  approvedRequests: { technical_breakdown: string }[]
  prTitle: string
  prBody: string
  filesChanged: string[]
}): Promise<{ is_approved_work: boolean; confidence: number; matched_request: string | null; reasoning: string }> {
  const client = getOpenAI()
  const response = await client.chat.completions.create({
    model: _model,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    response_format: { type: 'json_object' } as any,
    temperature: 0.2,
    messages: [
      {
        role: 'user',
        content: `You are checking whether a GitHub pull request contains work that was approved by the client.

APPROVED CLIENT REQUESTS for this project:
${params.approvedRequests.map((r) => `- ${r.technical_breakdown}`).join('\n')}

PULL REQUEST:
Title: ${params.prTitle}
Description: ${params.prBody}
Files changed: ${params.filesChanged.join(', ')}

Return JSON: { "is_approved_work": true, "confidence": 0, "matched_request": null, "reasoning": "" }`,
      },
    ],
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return JSON.parse((response as any).choices?.[0]?.message?.content ?? '{"is_approved_work":true,"confidence":50,"matched_request":null,"reasoning":""}')
}
