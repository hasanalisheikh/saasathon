import crypto from 'crypto'
import { getConfiguredEnv, requireConfiguredEnv } from '@/lib/env'

export function isSlackConfigured(): boolean {
  return Boolean(
    getConfiguredEnv('SLACK_CLIENT_ID') &&
    getConfiguredEnv('SLACK_CLIENT_SECRET') &&
    getConfiguredEnv('SLACK_SIGNING_SECRET')
  )
}

export function getSlackClientId(): string {
  return requireConfiguredEnv('SLACK_CLIENT_ID', 'SLACK_CLIENT_ID is required for Slack OAuth.')
}

export function getSlackClientSecret(): string {
  return requireConfiguredEnv('SLACK_CLIENT_SECRET', 'SLACK_CLIENT_SECRET is required for Slack OAuth.')
}

export function getSlackSigningSecret(): string {
  return requireConfiguredEnv('SLACK_SIGNING_SECRET', 'SLACK_SIGNING_SECRET is required for Slack webhook verification.')
}

const SLACK_SCOPES = [
  'channels:history',
  'channels:join',
  'groups:history',
  'chat:write',
  'chat:write.public',
  'channels:read',
  'groups:read',
  'im:write',
  'users:read',
].join(',')

type SlackOAuthState = {
  userId: string
  nonce: string
}

function signSlackState(value: string): string {
  return crypto.createHmac('sha256', getSlackClientSecret()).update(value).digest('base64url')
}

export function buildSlackOAuthUrl(userId: string, appUrl: string): string {
  const state: SlackOAuthState = { userId, nonce: crypto.randomBytes(16).toString('hex') }
  const stateJson = Buffer.from(JSON.stringify(state)).toString('base64url')
  const signature = signSlackState(stateJson)
  const encodedState = `${stateJson}.${signature}`

  const redirectUri = `${appUrl}/api/slack/oauth`
  const params = new URLSearchParams({
    client_id: getSlackClientId(),
    scope: SLACK_SCOPES,
    redirect_uri: redirectUri,
    state: encodedState,
  })

  return `https://slack.com/oauth/v2/authorize?${params}`
}

export function verifyAndDecodeSlackState(encodedState: string): SlackOAuthState | null {
  const dotIndex = encodedState.lastIndexOf('.')
  if (dotIndex === -1) return null

  const stateJson = encodedState.slice(0, dotIndex)
  const signature = encodedState.slice(dotIndex + 1)
  const expectedSignature = signSlackState(stateJson)

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    return null
  }

  try {
    return JSON.parse(Buffer.from(stateJson, 'base64url').toString('utf8')) as SlackOAuthState
  } catch {
    return null
  }
}

type SlackOAuthResponse = {
  access_token: string
  authed_user?: {
    id?: string
  }
  bot_user_id: string
  team: { id: string; name: string }
}

export async function exchangeSlackCode(code: string, appUrl: string): Promise<SlackOAuthResponse> {
  const redirectUri = `${appUrl}/api/slack/oauth`
  const params = new URLSearchParams({
    client_id: getSlackClientId(),
    client_secret: getSlackClientSecret(),
    code,
    redirect_uri: redirectUri,
  })

  const response = await fetch('https://slack.com/api/oauth.v2.access', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  })

  const data = await response.json() as { ok: boolean; error?: string } & Partial<SlackOAuthResponse>

  if (!data.ok) {
    throw new Error(`Slack OAuth error: ${data.error ?? 'unknown'}`)
  }

  return data as SlackOAuthResponse
}

export type SlackChannel = {
  id: string
  is_member?: boolean
  name: string
  is_private: boolean
}

export type PostSlackMessageResult = {
  ts: string
}

type SlackApiResponse = {
  ok?: boolean
  error?: string
}

type SlackPostMessageResponse = SlackApiResponse & {
  ts?: string
}

export type SlackApprovalMessageParams = {
  developerReply: string
  technicalBreakdown: string
  costMin: number
  costMax: number
  approvalUrl: string
  declineUrl: string
}

export type SlackIncludedMessageParams = {
  developerReply: string
  technicalBreakdown: string
  classification: string | null
}

export function buildSlackApprovalMessage(params: SlackApprovalMessageParams): string {
  return [
    params.developerReply.trim(),
    `What this involves: ${params.technicalBreakdown.trim()}`,
    `This work is estimated at $${params.costMin.toLocaleString()}-$${params.costMax.toLocaleString()} and is outside the original project scope.`,
    `You can accept or decline this modification from here: ${params.approvalUrl}`,
  ].join('\n\n')
}

export function buildSlackIncludedMessage(params: SlackIncludedMessageParams): string {
  const summaryLine =
    params.classification === 'in_scope'
      ? 'This work is covered within the current project scope.'
      : 'This change is included and does not require any additional approval.'

  return [
    params.developerReply.trim(),
    `What this involves: ${params.technicalBreakdown.trim()}`,
    summaryLine,
  ].join('\n\n')
}

class SlackApiError extends Error {
  code: string

  constructor(context: string, code: string) {
    super(`${context}: ${code}`)
    this.name = 'SlackApiError'
    this.code = code
  }
}

async function slackApiRequest<T>(
  botToken: string,
  path: string,
  init?: RequestInit
): Promise<T> {
  const response = await fetch(`https://slack.com/api/${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${botToken}`,
      ...(init?.headers ?? {}),
    },
  })

  const data = await response.json() as T & { error?: string; ok?: boolean }

  if (!response.ok) {
    throw new Error(`Slack API request failed: ${response.status}`)
  }

  if (!data.ok) {
    throw new SlackApiError(`Slack ${path} error`, data.error ?? 'unknown')
  }

  return data
}

export async function listSlackChannels(botToken: string): Promise<SlackChannel[]> {
  const params = new URLSearchParams({
    types: 'public_channel,private_channel',
    exclude_archived: 'true',
    limit: '200',
  })

  const data = await slackApiRequest<{ channels?: SlackChannel[] }>(
    botToken,
    `conversations.list?${params.toString()}`
  )

  return (data.channels ?? []).sort((a, b) => a.name.localeCompare(b.name))
}

export async function getSlackUserDisplayName(botToken: string, userId: string): Promise<string> {
  const params = new URLSearchParams({ user: userId })
  const data = await slackApiRequest<{
    user?: {
      name?: string
      profile?: {
        display_name?: string
        real_name?: string
      }
      real_name?: string
    }
  }>(
    botToken,
    `users.info?${params.toString()}`
  )

  const candidates = [
    data.user?.profile?.display_name,
    data.user?.profile?.real_name,
    data.user?.real_name,
    data.user?.name,
  ]

  return candidates.map((value) => value?.trim() ?? '').find(Boolean) ?? userId
}

type SlackChannelInfo = {
  id: string
  is_member: boolean
  is_private: boolean
  name: string
}

async function getSlackChannelInfo(botToken: string, channelId: string): Promise<SlackChannelInfo> {
  const params = new URLSearchParams({ channel: channelId })
  const data = await slackApiRequest<{ channel: SlackChannelInfo }>(
    botToken,
    `conversations.info?${params.toString()}`
  )

  return data.channel
}

async function joinSlackChannel(botToken: string, channelId: string): Promise<void> {
  const body = new URLSearchParams({ channel: channelId })
  await slackApiRequest(
    botToken,
    'conversations.join',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    }
  )
}

export async function ensureSlackChannelAccess(botToken: string, channelId: string): Promise<void> {
  const channel = await getSlackChannelInfo(botToken, channelId)
  if (channel.is_member) return

  if (channel.is_private) {
    throw new Error(
      `Monad is not in #${channel.name}. Invite the Slack app to that private channel before linking or sending messages.`
    )
  }

  try {
    await joinSlackChannel(botToken, channelId)
  } catch (error) {
    if (error instanceof SlackApiError) {
      throw new Error(
        `Monad could not join #${channel.name}. Reconnect Slack with updated permissions or invite the app before sending messages.`
      )
    }
    throw error
  }
}

export async function verifySlackSignature(rawBody: string, headers: Headers): Promise<boolean> {
  const timestamp = headers.get('x-slack-request-timestamp')
  const signature = headers.get('x-slack-signature')

  if (!timestamp || !signature) return false

  // Reject requests older than 5 minutes
  const age = Math.abs(Date.now() / 1000 - parseInt(timestamp, 10))
  if (age > 300) return false

  const signingSecret = getSlackSigningSecret()
  const baseString = `v0:${timestamp}:${rawBody}`
  const hmac = crypto.createHmac('sha256', signingSecret)
  const digest = `v0=${hmac.update(baseString).digest('hex')}`

  try {
    return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature))
  } catch {
    return false
  }
}

export async function postSlackMessage(
  botToken: string,
  channelId: string,
  text: string,
  threadTs?: string,
): Promise<PostSlackMessageResult> {
  const body: Record<string, string> = { channel: channelId, text }
  if (threadTs) body.thread_ts = threadTs

  try {
    const result = await slackApiRequest<SlackPostMessageResponse>(
      botToken,
      'chat.postMessage',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    )
    if (!result.ts) {
      throw new Error('Slack post message error: missing message timestamp')
    }
    return { ts: result.ts }
  } catch (error) {
    if (error instanceof SlackApiError && error.code === 'not_in_channel') {
      await ensureSlackChannelAccess(botToken, channelId)
      const retryResult = await slackApiRequest<SlackPostMessageResponse>(
        botToken,
        'chat.postMessage',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        }
      )
      if (!retryResult.ts) {
        throw new Error('Slack post message error: missing message timestamp')
      }
      return { ts: retryResult.ts }
    }

    if (error instanceof SlackApiError) {
      throw new Error(`Slack post message error: ${error.code}`)
    }

    throw error
  }
}
