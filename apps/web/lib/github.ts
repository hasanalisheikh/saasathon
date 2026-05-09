import crypto from 'crypto'
import { getAppUrl, requireConfiguredEnv } from '@/lib/env'

const GITHUB_API_VERSION = '2022-11-28'
export const GITHUB_APP_STATE_COOKIE = 'monad_github_app_state'
export const GITHUB_APP_INSTALLATIONS_COOKIE = 'monad_github_installations'

export type GitHubAppFlow = 'connect' | 'install'

type GitHubAppState = {
  flow?: GitHubAppFlow
  installationId: string | null
  nonce: string
  projectId: string
  returnTo: string
  userId: string
}

export type GitHubInstallationOption = {
  accountLogin: string | null
  id: string
  targetType: string | null
}

type GitHubInstallationSelectionState = {
  installations: GitHubInstallationOption[]
  nonce: string
  projectId: string
  returnTo: string
  userId: string
}

function getGitHubAppHeaders(token?: string) {
  return {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'Monad-App',
    'X-GitHub-Api-Version': GITHUB_API_VERSION,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

async function requestGitHubJson<T>(url: string, init: RequestInit, context: string): Promise<T> {
  const response = await fetch(url, init)

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`${context}: ${response.status} ${errorBody}`)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

async function requestGitHub(url: string, init: RequestInit, context: string) {
  const response = await fetch(url, init)

  if (response.ok) {
    return response
  }

  const errorBody = await response.text()
  throw new Error(`${context}: ${response.status} ${errorBody}`)
}

export function parseGitHubInstallationId(value: string | null | undefined) {
  const normalized = value?.trim() ?? ''
  return /^\d+$/.test(normalized) ? normalized : null
}

function normalizeGitHubFlow(value: string | null | undefined): GitHubAppFlow {
  return value === 'connect' ? 'connect' : 'install'
}

function getGitHubAppSlug() {
  return requireConfiguredEnv('GITHUB_APP_SLUG', 'GITHUB_APP_SLUG is required for GitHub App install links.')
}

function getGitHubClientId() {
  return requireConfiguredEnv('GITHUB_APP_CLIENT_ID', 'GITHUB_APP_CLIENT_ID is required for GitHub App auth.')
}

function getGitHubClientSecret() {
  return requireConfiguredEnv('GITHUB_APP_CLIENT_SECRET', 'GITHUB_APP_CLIENT_SECRET is required for GitHub App auth.')
}

function getGitHubStateSecret() {
  return getGitHubClientSecret()
}

function signGitHubState(value: string) {
  return crypto.createHmac('sha256', getGitHubStateSecret()).update(value).digest('base64url')
}

export function normalizeGitHubReturnTo(returnTo: string | null | undefined, fallback: string) {
  const normalizedFallback = fallback.startsWith('/') ? fallback : `/${fallback}`
  if (!returnTo) return normalizedFallback

  try {
    const url = new URL(returnTo, 'http://monad.local')
    if (url.origin !== 'http://monad.local') return normalizedFallback
    if (!url.pathname.startsWith('/') || url.pathname.startsWith('/api/')) return normalizedFallback
    return `${url.pathname}${url.search}`
  } catch {
    return normalizedFallback
  }
}

export function encodeGitHubAppState(state: GitHubAppState) {
  const payload = Buffer.from(JSON.stringify(state)).toString('base64url')
  const signature = signGitHubState(payload)
  return `${payload}.${signature}`
}

export function decodeGitHubAppState(input: string | null | undefined): GitHubAppState | null {
  if (!input) return null

  const [payload, signature] = input.split('.')
  if (!payload || !signature) return null

  const expectedSignature = signGitHubState(payload)
  const signatureBuffer = Buffer.from(signature)
  const expectedSignatureBuffer = Buffer.from(expectedSignature)

  if (signatureBuffer.length !== expectedSignatureBuffer.length) {
    return null
  }

  if (!crypto.timingSafeEqual(signatureBuffer, expectedSignatureBuffer)) {
    return null
  }

  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as GitHubAppState
    return {
      flow: normalizeGitHubFlow(parsed.flow),
      installationId: parseGitHubInstallationId(parsed.installationId) ?? null,
      nonce: parsed.nonce,
      projectId: parsed.projectId,
      returnTo: normalizeGitHubReturnTo(parsed.returnTo, '/integrations'),
      userId: parsed.userId,
    }
  } catch {
    return null
  }
}

export function encodeGitHubInstallationSelectionState(state: GitHubInstallationSelectionState) {
  const payload = Buffer.from(JSON.stringify(state)).toString('base64url')
  const signature = signGitHubState(payload)
  return `${payload}.${signature}`
}

export function decodeGitHubInstallationSelectionState(
  input: string | null | undefined
): GitHubInstallationSelectionState | null {
  if (!input) return null

  const [payload, signature] = input.split('.')
  if (!payload || !signature) return null

  const expectedSignature = signGitHubState(payload)
  const signatureBuffer = Buffer.from(signature)
  const expectedSignatureBuffer = Buffer.from(expectedSignature)

  if (signatureBuffer.length !== expectedSignatureBuffer.length) {
    return null
  }

  if (!crypto.timingSafeEqual(signatureBuffer, expectedSignatureBuffer)) {
    return null
  }

  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as GitHubInstallationSelectionState
    return {
      installations: Array.isArray(parsed.installations)
        ? parsed.installations
            .map((installation) => ({
              accountLogin:
                typeof installation?.accountLogin === 'string' && installation.accountLogin.trim().length > 0
                  ? installation.accountLogin
                  : null,
              id: parseGitHubInstallationId(installation?.id) ?? '',
              targetType:
                typeof installation?.targetType === 'string' && installation.targetType.trim().length > 0
                  ? installation.targetType
                  : null,
            }))
            .filter((installation) => installation.id)
        : [],
      nonce: parsed.nonce,
      projectId: parsed.projectId,
      returnTo: normalizeGitHubReturnTo(parsed.returnTo, '/integrations'),
      userId: parsed.userId,
    }
  } catch {
    return null
  }
}

export function buildGitHubAppInstallUrl(state: string) {
  return `https://github.com/apps/${getGitHubAppSlug()}/installations/new?state=${encodeURIComponent(state)}`
}

export function buildGitHubAppAuthorizationUrl(state: string) {
  const params = new URLSearchParams({
    client_id: getGitHubClientId(),
    redirect_uri: `${getAppUrl()}/api/github/auth/callback`,
    state,
  })

  return `https://github.com/login/oauth/authorize?${params.toString()}`
}

export async function getGitHubAppJwt() {
  const { generateAppJwt } = await import('./github-app')
  return generateAppJwt()
}

export async function createInstallationAccessToken(installationId: string) {
  const { getInstallationAccessToken } = await import('./github-app')
  return getInstallationAccessToken(installationId)
}

export async function listInstallationRepos(installationId: string) {
  const { listInstallationRepos: listRepos } = await import('./github-app')
  return listRepos(installationId)
}

export async function listAppInstallations() {
  const { listAppInstallations: listInstalls } = await import('./github-app')
  return listInstalls()
}

export async function getPullRequestContext(params: {
  installationId: string
  owner: string
  repo: string
  pullNumber: number
}) {
  const { getPullRequestContext: getContext } = await import('./github-app')
  return getContext(params)
}

export async function exchangeCodeForGitHubUserToken(code: string) {
  const params = new URLSearchParams({
    client_id: getGitHubClientId(),
    client_secret: getGitHubClientSecret(),
    code,
    redirect_uri: `${getAppUrl()}/api/github/auth/callback`,
  })

  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  })

  const data = await response.json() as {
    access_token?: string
    error?: string
    error_description?: string
  }

  if (!response.ok || !data.access_token) {
    throw new Error(
      `Failed to exchange GitHub user token: ${data.error_description ?? data.error ?? response.statusText}`
    )
  }

  return data.access_token
}

export async function listUserInstallations(accessToken: string) {
  const response = await requestGitHubJson<{
    installations: Array<{ id: number; account?: { login?: string | null; type?: string | null } | null }>
  }>(
    'https://api.github.com/user/installations?per_page=100',
    {
      headers: getGitHubAppHeaders(accessToken),
    },
    'Failed to list user installations'
  )

  return response.installations
    .map((installation) => ({
      accountLogin: installation.account?.login?.trim() || null,
      id: String(installation.id),
      targetType: installation.account?.type?.trim() || null,
    }))
    .filter((installation) => Boolean(parseGitHubInstallationId(installation.id)))
}

export async function createIssue(params: {
  installationId: string
  owner: string
  repo: string
  title: string
  body: string
}): Promise<{ number: number; url: string }> {
  const accessToken = await createInstallationAccessToken(params.installationId)
  const [owner, repo] = params.owner.includes('/') ? params.owner.split('/') : [params.owner, params.repo]

  try {
    await requestGitHub(
      `https://api.github.com/repos/${owner}/${repo}/labels`,
      {
        method: 'POST',
        headers: {
          ...getGitHubAppHeaders(accessToken),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'monad-approved',
          color: 'f59e0b',
          description: 'Approved via Monad scope management',
        }),
      },
      'Failed to ensure monad-approved label'
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : ''
    if (!message.includes('422')) {
      throw error
    }
  }

  const response = await requestGitHubJson<{
    html_url: string
    number: number
  }>(
    `https://api.github.com/repos/${owner}/${repo}/issues`,
    {
      method: 'POST',
      headers: {
        ...getGitHubAppHeaders(accessToken),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: `[Monad] ${params.title}`,
        body: params.body,
        labels: ['monad-approved'],
      }),
    },
    'Failed to create GitHub issue'
  )

  return {
    number: response.number,
    url: response.html_url,
  }
}

export function buildIssueBody(params: {
  clientRequest: string
  technicalBreakdown: string
  approvedCost: string
  approvalTimestamp: string
  monadRequestUrl: string
  tasks?: {
    name: string
    description: string | null
    min_hours: number | null
    max_hours: number | null
    github_marker: string
  }[]
}) {
  const checklist = params.tasks?.length
    ? `\n## Implementation Checklist\n${params.tasks
        .map((task) => {
          const estimate = task.min_hours && task.max_hours
            ? ` (${task.min_hours}-${task.max_hours}h)`
            : ''
          const description = task.description ? ` - ${task.description}` : ''
          return `- [ ] ${task.name}${estimate}${description} <!-- ${task.github_marker} -->`
        })
        .join('\n')}\n`
    : ''

  return `## Client Request
${params.clientRequest}

## Technical Breakdown
${params.technicalBreakdown}

## Approved Cost
${params.approvedCost}

${checklist}

## Approval
Approved by client on ${params.approvalTimestamp}

---
[View in Monad](${params.monadRequestUrl})
`
}
