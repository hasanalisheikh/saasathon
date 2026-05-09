import OpenAI from 'openai'
import type { AIAnalysis, ProjectDocumentContext } from '@/types'
import {
  buildClientReplyMessages,
  buildCommitTranslationMessages,
  buildRequestAnalysisMessages,
  buildSlackIntakeReplyMessages,
  buildScopeExtractionMessages,
  buildUnapprovedWorkMessages,
  extractJsonObject,
  parseAIAnalysis,
  parseClientReply,
  parseCommitTranslation,
  parseScopeStructured,
  parseUnapprovedWorkResult,
} from '@/lib/ai-contract'
import { getAIModel, getAppUrl, requireConfiguredEnv } from '@/lib/env'

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1'
const DEFAULT_AI_MODEL = 'google/gemini-3.1-flash-lite'

let _client: OpenAI | null = null
let _model = DEFAULT_AI_MODEL

function getAIClient(): OpenAI {
  if (!_client) {
    const apiKey = requireConfiguredEnv(
      'OPENROUTER_API_KEY',
      'OPENROUTER_API_KEY is required for AI analysis. Set MOCK_AI=true to use local mock responses.'
    )

    _client = new OpenAI({
      apiKey,
      baseURL: OPENROUTER_BASE_URL,
      defaultHeaders: {
        'HTTP-Referer': getAppUrl(),
        'X-Title': 'Monad',
      },
    })
    _model = getAIModel() || DEFAULT_AI_MODEL
  }
  return _client
}

export async function analyseRequest(params: {
  scopeRaw: string
  scopeStructured: object
  hourlyRate: number
  taskCategories: object[]
  documents?: ProjectDocumentContext[]
  emailFrom: string
  emailSubject: string
  emailBody: string
}): Promise<AIAnalysis> {
  const client = getAIClient()
  const documentContext = buildDocumentContext(params.documents ?? [])
  const response = await client.chat.completions.create({
    model: _model,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    response_format: { type: 'json_object' } as any,
    temperature: 0.2,
    messages: buildRequestAnalysisMessages({
      scopeRaw: params.scopeRaw,
      scopeStructured: params.scopeStructured,
      documents: documentContext,
      hourlyRate: params.hourlyRate,
      taskCategories: params.taskCategories,
      emailFrom: params.emailFrom,
      emailSubject: params.emailSubject,
      emailBody: params.emailBody,
    }),
  })

  return parseAIAnalysis(readJsonMessageContent(response, 'request analysis'))
}

function buildDocumentContext(documents: ProjectDocumentContext[]): string {
  if (!documents.length) return 'No uploaded project documents are assigned to this project.'

  let usedCharacters = 0
  const maxTotalCharacters = 12000

  return documents
    .map((document) => {
      const remaining = maxTotalCharacters - usedCharacters
      if (remaining <= 0) return null

      const text = (document.extracted_text ?? '').slice(0, Math.min(4000, remaining))
      usedCharacters += text.length

      return [
        `Title: ${document.title}`,
        `Type: ${document.document_type}`,
        `Tags: ${Array.isArray(document.tags) ? document.tags.join(', ') : 'none'}`,
        `Text:\n${text || '(no extracted text)'}`,
      ].join('\n')
    })
    .filter(Boolean)
    .join('\n\n---\n\n')
}

export async function extractScope(scopeRaw: string): Promise<object> {
  const client = getAIClient()
  const response = await client.chat.completions.create({
    model: _model,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    response_format: { type: 'json_object' } as any,
    temperature: 0.1,
    messages: buildScopeExtractionMessages(scopeRaw),
  })

  return parseScopeStructured(readJsonMessageContent(response, 'scope extraction'))
}

export async function translateCommits(commits: string[]): Promise<string> {
  const client = getAIClient()
  const response = await client.chat.completions.create({
    model: _model,
    temperature: 0.3,
    messages: buildCommitTranslationMessages(commits),
  })
  return parseCommitTranslation(readTextMessageContent(response, 'commit translation'))
}

export async function generateClientReply(params: {
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
}): Promise<string> {
  const client = getAIClient()
  const response = await client.chat.completions.create({
    model: _model,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    response_format: { type: 'json_object' } as any,
    temperature: params.tone === 'friendly' ? 0.45 : 0.25,
    messages: buildClientReplyMessages(params),
  })

  return parseClientReply(readJsonMessageContent(response, 'client reply generation'))
}

export async function generateSlackIntakeReply(params: {
  classification: string
  confidence: number
  developerName: string
  requestText: string
}): Promise<string> {
  const client = getAIClient()
  const response = await client.chat.completions.create({
    model: _model,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    response_format: { type: 'json_object' } as any,
    temperature: 0.4,
    messages: buildSlackIntakeReplyMessages(params),
  })

  return parseClientReply(readJsonMessageContent(response, 'slack intake reply generation'))
}

export async function detectUnapprovedWork(params: {
  approvedRequests: { technical_breakdown: string }[]
  prTitle: string
  prBody: string
  filesChanged: string[]
}): Promise<{ is_approved_work: boolean; confidence: number; matched_request: string | null; reasoning: string }> {
  const client = getAIClient()
  const response = await client.chat.completions.create({
    model: _model,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    response_format: { type: 'json_object' } as any,
    temperature: 0.2,
    messages: buildUnapprovedWorkMessages(params),
  })

  return parseUnapprovedWorkResult(readJsonMessageContent(response, 'unapproved work detection'))
}

function readJsonMessageContent(response: OpenAI.Chat.Completions.ChatCompletion, operation: string): unknown {
  return extractJsonObject(readTextMessageContent(response, operation))
}

function readTextMessageContent(response: OpenAI.Chat.Completions.ChatCompletion, operation: string): string {
  const content = response.choices?.[0]?.message?.content as unknown

  if (typeof content === 'string') {
    return content
  }

  if (Array.isArray(content)) {
    const joined = content
      .map((part) => {
        if (part && typeof part === 'object' && 'text' in part && typeof part.text === 'string') {
          return part.text
        }

        return ''
      })
      .join('')
      .trim()

    if (joined) return joined
  }

  throw new Error(`OpenRouter returned an empty ${operation} response.`)
}
