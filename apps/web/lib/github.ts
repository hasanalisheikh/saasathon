import crypto from 'crypto'
import { getAppUrl, requireConfiguredEnv } from '@/lib/env'

const GITHUB_API_VERSION = '2022-11-28'
const GITHUB_STATE_SECRET = () => requireConfiguredEnv('GITHUB_APP_CLIENT_SECRET', 'GitHub App client secret is not configured.')

export const GITHUB_APP_STATE_COOKIE = 'github_app_state'

export type GitHubAppState = {
  installationId: string | null
  nonce: string
  projectId: string
  returnTo: string
  userId: string
}

type GitHubInstallationSummary = {
  id: number
}

type GitHubInstallationRepo = {
  id: number
  full_name: string
  private: boolean
}

function getGitHubAppHeaders(token?: string) {
  return {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'Monad-App',
    'X-GitHub-Api-Version': GITHUB_API_VERSION,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

function base64UrlEncode(value: string) {
  return Buffer.from(value, 'utf8').toString('base64url')
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a)
  const right = Buffer.from(b)

  if (left.length !== right.length) {
    return false
  }

  return crypto.timingSafeEqual(left, right)
}

function getSignedStateSignature(payload: string) {
  return crypto.createHmac('sha256', GITHUB_STATE_SECRET()).update(payload).digest('base64url')
}

function normalizeGitHubPrivateKey() {
  return requireConfiguredEnv('GITHUB_APP_PRIVATE_KEY', 'GitHub App private key is not configured.').replace(/\\n/g, '\n')
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

export function normalizeGitHubReturnTo(returnTo: string | null, fallback: string) {
  if (!returnTo) return fallback

  try {
    const url = new URL(returnTo, 'http://monad.local')
    if (url.origin !== 'http://monad.local') return fallback
    if (!url.pathname.startsWith('/') || url.pathname.startsWith('//')) return fallback
    return `${url.pathname}${url.search}`
  } catch {
    return fallback
  }
}

export function encodeGitHubAppState(state: GitHubAppState) {
  const payload = base64UrlEncode(JSON.stringify(state))
  const signature = getSignedStateSignature(payload)
  return `${payload}.${signature}`
}

export function decodeGitHubAppState(value: string | null): GitHubAppState | null {
  if (!value) return null

  const [payload, signature] = value.split('.')
  if (!payload || !signature) return null
  if (!safeEqual(signature, getSignedStateSignature(payload))) return null

  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))

    if (
      typeof parsed?.nonce === 'string' &&
      typeof parsed?.projectId === 'string' &&
      typeof parsed?.returnTo === 'string' &&
      typeof parsed?.userId === 'string' &&
      (typeof parsed?.installationId === 'string' || parsed?.installationId === null)
    ) {
      return parsed as GitHubAppState
    }
  } catch {
    return null
  }

  return null
}

export function buildGitHubAppInstallUrl(state: string) {
  const installUrl = new URL(`https://github.com/apps/${requireConfiguredEnv('GITHUB_APP_SLUG', 'GitHub App slug is not configured.')}/installations/new`)
  installUrl.searchParams.set('state', state)
  return installUrl
}

export function buildGitHubAppAuthorizationUrl(state: string) {
  const callbackUrl = `${getAppUrl()}/api/github/auth/callback`
  const authUrl = new URL('https://github.com/login/oauth/authorize')
  authUrl.searchParams.set('client_id', requireConfiguredEnv('GITHUB_APP_CLIENT_ID', 'GitHub App client ID is not configured.'))
  authUrl.searchParams.set('redirect_uri', callbackUrl)
  authUrl.searchParams.set('state', state)
  return authUrl
}

export function parseGitHubInstallationId(value: string | null | undefined) {
  const normalized = value?.trim() ?? ''
  return /^\d+$/.test(normalized) ? normalized : null
}

export async function exchangeCodeForGitHubUserToken(code: string) {
  const callbackUrl = `${getAppUrl()}/api/github/auth/callback`

  const tokenResponse = await requestGitHubJson<{
    access_token?: string
    error?: string
    error_description?: string
  }>(
    'https://github.com/login/oauth/access_token',
    {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: new URLSearchParams({
        client_id: requireConfiguredEnv('GITHUB_APP_CLIENT_ID', 'GitHub App client ID is not configured.'),
        client_secret: requireConfiguredEnv('GITHUB_APP_CLIENT_SECRET', 'GitHub App client secret is not configured.'),
        code,
        redirect_uri: callbackUrl,
      }),
    },
    'GitHub user token exchange failed'
  )

  if (tokenResponse.error || !tokenResponse.access_token) {
    throw new Error(tokenResponse.error_description ?? tokenResponse.error ?? 'GitHub user token exchange failed')
  }

  return tokenResponse.access_token
}

export async function listUserInstallations(userToken: string) {
  const response = await requestGitHubJson<{ installations: GitHubInstallationSummary[] }>(
    'https://api.github.com/user/installations?per_page=100',
    {
      headers: getGitHubAppHeaders(userToken),
    },
    'Failed to load GitHub App installations'
  )

  return response.installations.map((installation) => String(installation.id))
}

export async function getGitHubAppJwt() {
  const now = Math.floor(Date.now() / 1000)
  const header = base64UrlEncode(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const payload = base64UrlEncode(JSON.stringify({
    iat: now - 60,
    exp: now + (9 * 60),
    iss: requireConfiguredEnv('GITHUB_APP_ID', 'GitHub App ID is not configured.'),
  }))
  const unsignedToken = `${header}.${payload}`
  const signature = crypto.sign('RSA-SHA256', Buffer.from(unsignedToken), normalizeGitHubPrivateKey()).toString('base64url')

  return `${unsignedToken}.${signature}`
}

export async function createInstallationAccessToken(installationId: string) {
  const appJwt = await getGitHubAppJwt()
  const response = await requestGitHubJson<{ token: string }>(
    `https://api.github.com/app/installations/${installationId}/access_tokens`,
    {
      method: 'POST',
      headers: getGitHubAppHeaders(appJwt),
    },
    'Failed to mint GitHub installation token'
  )

  return response.token
}

export async function listInstallationRepos(installationId: string) {
  const installationToken = await createInstallationAccessToken(installationId)
  const response = await requestGitHubJson<{ repositories: GitHubInstallationRepo[] }>(
    'https://api.github.com/installation/repositories?per_page=100',
    {
      headers: getGitHubAppHeaders(installationToken),
    },
    'Failed to load installation repositories'
  )

  return response.repositories.map((repository) => ({
    id: String(repository.id),
    name: repository.full_name,
    private: repository.private,
  }))
}

export async function createIssue(params: {
  installationId: string
  owner: string
  repo: string
  title: string
  body: string
}): Promise<{ number: number; url: string }> {
  const accessToken = await createInstallationAccessToken(params.installationId)
  const [owner, repo] = params.owner.includes('/')
    ? params.owner.split('/')
    : [params.owner, params.repo]

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
