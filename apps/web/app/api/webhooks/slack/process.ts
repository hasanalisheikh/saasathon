import { createServiceClient } from '@/lib/supabase/server'
import { classifySlackRequest, generateSlackIntakeReply } from '@/lib/ai'
import { getAppUrl, isMockAIEnabled } from '@/lib/env'
import {
  getSlackUserDisplayName,
  postSlackMessage,
} from '@/lib/slack'
import { buildSlackFallbackReply } from './reply'

export async function processSlackEvent(params: {
  channel: string
  teamId: string
  text: string
  threadTs: string
  user: string
}) {
  try {
    const supabase = await createServiceClient()

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, full_name, slack_access_token')
      .eq('slack_team_id', params.teamId)
      .single()

    if (!profile) return

    const { data: project } = await supabase
      .from('projects')
      .select('id')
      .eq('user_id', profile.id)
      .eq('slack_channel_id', params.channel)
      .single()

    if (!project) return

    const intake = await classifySlackIntake(params.text)
    if (!intake.is_request) return

    const requesterName = profile.slack_access_token
      ? await getSlackUserDisplayName(profile.slack_access_token, params.user).catch((error) => {
          console.error('Failed to resolve Slack requester name:', error)
          return params.user
        })
      : params.user

    const { data: request, error } = await supabase
      .from('requests')
      .insert({
        project_id: project.id,
        raw_email_from: requesterName,
        raw_email_subject: intake.title,
        raw_email_body: params.text,
        source: 'slack',
        slack_thread_ts: params.threadTs,
        slack_channel_id: params.channel,
        status: 'pending_review',
        analysis_status: 'queued',
      })
      .select('id')
      .single()

    if (error || !request) {
      console.error('Failed to create Slack request:', error)
      return
    }

    const analysisPayload = await runSlackAnalysis({
      requestId: request.id,
      supabase,
    })

    if (!profile.slack_access_token) return

    try {
      const reply = analysisPayload.ok
        ? await buildSlackAutoReply({
            classification: analysisPayload.classification,
            confidence: analysisPayload.confidence,
            developerName: profile.full_name ?? 'Your developer',
            requestText: params.text,
          })
        : buildSlackFallbackReply({
            classification: 'clarification_needed',
            developerName: profile.full_name ?? 'Your developer',
          })

      await postSlackMessage(
        profile.slack_access_token,
        params.channel,
        reply,
        params.threadTs
      )
    } catch (slackError) {
      console.error('Slack acknowledgement failed after analysis completed:', slackError)
    }
  } catch (err) {
    console.error('Slack webhook processing error:', err)
  }
}

async function classifySlackIntake(messageText: string): Promise<{
  is_request: boolean
  title: string | null
}> {
  try {
    const result = await classifySlackRequest(messageText)
    return {
      is_request: result.is_request,
      title: result.is_request ? normalizeSlackRequestTitle(result.title, messageText) : null,
    }
  } catch (error) {
    console.error('Slack intake classification failed, using fallback:', error)
    return fallbackClassifySlackIntake(messageText)
  }
}

function fallbackClassifySlackIntake(messageText: string): {
  is_request: boolean
  title: string | null
} {
  const text = normalizeSlackMessageText(messageText)
  const looksLikeRequest =
    /\b(can|could|would|will)\s+you\b/i.test(text) ||
    /\b(please|need|needs|want|would like|looking for)\b/i.test(text) ||
    /\b(add|build|create|implement|fix|update|change|modify|remove|support|integrate|redesign)\b/i.test(text)

  if (!looksLikeRequest) {
    return { is_request: false, title: null }
  }

  return {
    is_request: true,
    title: normalizeSlackRequestTitle(null, messageText),
  }
}

function normalizeSlackRequestTitle(aiTitle: string | null, messageText: string): string {
  const aiCandidate = aiTitle
    ?.replace(/^["'`]+|["'`]+$/g, '')
    .replace(/[.?!:;,]+$/g, '')
    .trim()

  if (aiCandidate) return aiCandidate

  const text = normalizeSlackMessageText(messageText)
  const extracted =
    text.match(/\b(?:can|could|would|will)\s+you\s+(?:please\s+)?(.+?)(?:[?.!]|$)/i)?.[1] ??
    text.match(/\b(?:please\s+)?(?:add|build|create|implement|fix|update|change|modify|remove|support|integrate|redesign)\b(.+?)(?:[?.!]|$)/i)?.[0] ??
    text

  const cleaned = extracted
    .replace(/\b(?:quick thing|quick question|when you have a chance|if possible|thanks|thank you)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  const words = cleaned.split(' ').filter(Boolean).slice(0, 8)
  const title = words
    .map((word) => word.replace(/^[^a-z0-9]+|[^a-z0-9]+$/gi, ''))
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  return title || 'Slack Feature Request'
}

function normalizeSlackMessageText(messageText: string): string {
  return messageText
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

async function runSlackAnalysis(params: {
  requestId: string
  supabase: Awaited<ReturnType<typeof createServiceClient>>
}): Promise<{ ok: true; classification: string; confidence: number } | { ok: false }> {
  try {
    const appUrl = getAppUrl()
    const response = await fetch(`${appUrl}/api/ai/analyse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ request_id: params.requestId }),
    })

    const payload = await response.json().catch(() => ({})) as {
      analysis?: {
        classification?: string
        confidence?: number
      }
      classification?: string
    }

    if (!response.ok) {
      return { ok: false }
    }

    return {
      ok: true,
      classification:
        payload.classification ??
        payload.analysis?.classification ??
        'clarification_needed',
      confidence: payload.analysis?.confidence ?? 50,
    }
  } catch (fetchError) {
    console.error('Async Slack request analysis failed:', fetchError)
    await params.supabase
      .from('requests')
      .update({
        analysis_status: 'failed',
        analysis_error: 'Could not enqueue AI analysis from the Slack webhook.',
      })
      .eq('id', params.requestId)

    return { ok: false }
  }
}

async function buildSlackAutoReply(params: {
  classification: string
  confidence: number
  developerName: string
  requestText: string
}) {
  if (isMockAIEnabled()) {
    return buildSlackFallbackReply({
      classification: params.classification,
      developerName: params.developerName,
    })
  }

  try {
    return await generateSlackIntakeReply(params)
  } catch (error) {
    console.error('Slack intake reply generation failed:', error)
    return buildSlackFallbackReply({
      classification: params.classification,
      developerName: params.developerName,
    })
  }
}
