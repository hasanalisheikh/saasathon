import { Octokit } from '@octokit/rest'
import crypto from 'crypto'
import { requireConfiguredEnv } from '@/lib/env'

const GITHUB_API_VERSION = '2022-11-28'

function getGitHubAppHeaders(token?: string) {
  return {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'Monad-App',
    'X-GitHub-Api-Version': GITHUB_API_VERSION,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

function normalizeGitHubPrivateKey() {
  const key = process.env.GITHUB_PRIVATE_KEY || ''
  return key.replace(/\\n/g, '\n')
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

export function createOctokit(accessToken: string): Octokit {
  return new Octokit({ auth: accessToken })
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

export async function listUserRepos(accessToken: string) {
  const octokit = createOctokit(accessToken)
  const response = await octokit.repos.listForAuthenticatedUser({
    sort: 'updated',
    per_page: 50,
  })
  return response.data.map((r) => ({
    id: String(r.id),
    name: r.full_name,
    private: r.private,
  }))
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
