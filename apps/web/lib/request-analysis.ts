import { analyseRequest } from '@/lib/ai'
import { isAIConfigured, isMockAIEnabled } from '@/lib/env'
import { replaceRequestTasks } from '@/lib/request-tasks'
import { createServiceClient } from '@/lib/supabase/server'
import type { AIAnalysis, Classification, ProjectDocumentContext } from '@/types'

type AnalysisFailureKind =
  | 'missing_scope'
  | 'not_configured'
  | 'invalid_response'
  | 'provider_error'

type AnalysisSuccess = {
  analysis: AIAnalysis
  analysis_status: 'completed'
  classification: Classification
}

type AnalysisFailure = {
  analysis_error: string
  analysis_status: 'failed'
  failure_kind: AnalysisFailureKind
}

export type PersistedAnalysisResult = AnalysisSuccess | AnalysisFailure

class AnalysisError extends Error {
  constructor(
    readonly kind: AnalysisFailureKind,
    message: string,
  ) {
    super(message)
    this.name = 'AnalysisError'
  }
}

export async function analyseAndPersistRequest(requestId: string): Promise<PersistedAnalysisResult> {
  const supabase = createServiceClient()

  const { data: request } = await supabase
    .from('requests')
    .select('*, project:projects(id, user_id, scope_raw, scope_structured, hourly_rate, task_categories)')
    .eq('id', requestId)
    .single()

  if (!request) {
    throw new Error('Request not found')
  }

  const project = request.project as Record<string, unknown>
  const projectId = request.project_id as string

  const { data: documents } = await supabase
    .from('documents')
    .select('title, document_type, tags, extracted_text')
    .eq('project_id', projectId)
    .eq('extraction_status', 'completed')
    .not('extracted_text', 'is', null)
    .order('created_at', { ascending: false })
    .limit(10)

  const startedAt = new Date().toISOString()
  await supabase
    .from('requests')
    .update({
      analysis_status: 'running',
      analysis_error: null,
      analysis_started_at: startedAt,
      analysis_completed_at: null,
    })
    .eq('id', requestId)

  try {
    const scopeRaw = (project.scope_raw as string) ?? ''
    const scopeStructured = (project.scope_structured as object | null) ?? null
    const hourlyRate = (project.hourly_rate as number) ?? 90
    const taskCategories = (project.task_categories as object[]) ?? []
    const documentRows = (documents ?? []) as ProjectDocumentContext[]

    if (!hasScopeBaseline(scopeRaw, scopeStructured, documentRows)) {
      throw new AnalysisError(
        'missing_scope',
        'Add a project scope brief or supporting documents before running AI analysis.'
      )
    }

    let analysis: AIAnalysis

    if (isMockAIEnabled()) {
      analysis = getMockAnalysis()
    } else {
      if (!isAIConfigured()) {
        throw new AnalysisError(
          'not_configured',
          'AI analysis is not configured. Add OPENROUTER_API_KEY or set MOCK_AI=true for local development.'
        )
      }

      analysis = await analyseRequest({
        scopeRaw,
        scopeStructured: scopeStructured ?? {},
        hourlyRate,
        taskCategories,
        documents: documentRows,
        emailFrom: request.raw_email_from ?? '',
        emailSubject: request.raw_email_subject ?? '',
        emailBody: request.raw_email_body,
      })
    }

    const costMin = Math.round((analysis.effort_min_hours ?? 0) * hourlyRate)
    const costMax = Math.round((analysis.effort_max_hours ?? 0) * hourlyRate)
    const completedAt = new Date().toISOString()

    await supabase
      .from('requests')
      .update({
        classification: analysis.classification,
        confidence: analysis.confidence,
        scope_evidence: analysis.scope_evidence,
        technical_breakdown: analysis.technical_breakdown,
        tasks: analysis.tasks,
        effort_min_hours: analysis.effort_min_hours,
        effort_max_hours: analysis.effort_max_hours,
        cost_min: costMin,
        cost_max: costMax,
        timeline_impact_days: analysis.timeline_impact_days,
        risk_level: analysis.risk_level,
        reasoning: analysis.reasoning,
        draft_reply: analysis.draft_reply,
        suggested_action: analysis.suggested_action,
        analysis_status: 'completed',
        analysis_error: null,
        analysis_completed_at: completedAt,
      })
      .eq('id', requestId)

    if (request.status !== 'approved') {
      await replaceRequestTasks({
        supabase,
        requestId,
        projectId,
        tasks: analysis.tasks,
      })
    }

    return {
      analysis,
      analysis_status: 'completed',
      classification: analysis.classification,
    }
  } catch (error) {
    const failure = toAnalysisFailure(error)

    await supabase
      .from('requests')
      .update({
        analysis_status: 'failed',
        analysis_error: failure.analysis_error,
      })
      .eq('id', requestId)

    return failure
  }
}

function hasScopeBaseline(
  scopeRaw: string,
  scopeStructured: object | null,
  documents: ProjectDocumentContext[],
) {
  if (scopeRaw.trim()) return true

  const structured = scopeStructured as Record<string, unknown> | null
  if (structured) {
    const deliverables = Array.isArray(structured.deliverables) ? structured.deliverables : []
    const exclusions = Array.isArray(structured.exclusions) ? structured.exclusions : []

    if (deliverables.length || exclusions.length) return true
    if (typeof structured.revision_limit === 'string' && structured.revision_limit.trim()) return true
    if (typeof structured.timeline === 'string' && structured.timeline.trim()) return true
  }

  return documents.some((document) => document.extracted_text?.trim())
}

function toAnalysisFailure(error: unknown): AnalysisFailure {
  if (error instanceof AnalysisError) {
    return {
      analysis_error: error.message,
      analysis_status: 'failed',
      failure_kind: error.kind,
    }
  }

  const message = error instanceof Error ? error.message : 'Analysis failed'
  const lowered = message.toLowerCase()
  const failureKind: AnalysisFailureKind =
    lowered.includes('configured')
      ? 'not_configured'
      : lowered.includes('json') || lowered.includes('zod') || lowered.includes('empty')
        ? 'invalid_response'
        : 'provider_error'

  return {
    analysis_error: message,
    analysis_status: 'failed',
    failure_kind: failureKind,
  }
}

function getMockAnalysis(): AIAnalysis {
  return {
    classification: 'out_of_scope',
    confidence: 94,
    scope_evidence: [
      'EXCLUDES: online ordering, payment processing, booking systems',
      '5-page website, contact form, basic SEO only',
    ],
    technical_breakdown:
      'This request adds four substantial systems: online ordering, table bookings, loyalty points, and reminder emails. Each requires separate product logic, persistence, and user-facing flows.',
    tasks: [
      {
        name: 'Booking system',
        description: 'Calendar UI, availability logic, confirmation emails',
        min_hours: 8,
        max_hours: 14,
      },
      {
        name: 'Online ordering',
        description: 'Cart, checkout, payment gateway',
        min_hours: 12,
        max_hours: 18,
      },
      {
        name: 'Loyalty points',
        description: 'User accounts, point tracking, redemption UI',
        min_hours: 10,
        max_hours: 16,
      },
      {
        name: 'Email automation',
        description: 'Templates, scheduling, SMTP integration',
        min_hours: 6,
        max_hours: 10,
      },
    ],
    effort_min_hours: 36,
    effort_max_hours: 58,
    risk_level: 'high',
    timeline_impact_days: 10,
    reasoning:
      'The original scope explicitly excludes the requested systems and integrations, so this should be quoted separately.',
    draft_reply: `Hi Marcus,

Thanks for the kind words.

I reviewed the request for online ordering, table bookings, loyalty points, and reminder emails. Those additions go beyond the original website scope and each one requires meaningful new implementation work.

I can absolutely quote this properly for you. I have broken down the expected work and estimate so you can review it before we proceed.

Best,
Jamie`,
    suggested_action: 'quote_separately',
  }
}
