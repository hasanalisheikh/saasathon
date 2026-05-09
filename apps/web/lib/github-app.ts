import crypto from 'crypto'
import { requireConfiguredEnv } from '@/lib/env'

const GITHUB_API_VERSION = '2022-11-28'


export type AppInstallation = {
  accountLogin: string | null
  id: string
  targetType: string | null
}

function getGitHubApiHeaders(token?: string) {
  return {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'Monad-App',
    'X-GitHub-Api-Version': GITHUB_API_VERSION,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

function getGitHubAppId() {
  return requireConfiguredEnv('GITHUB_APP_ID', 'GITHUB_APP_ID is required for GitHub App authentication.')
}

function getGitHubPrivateKey() {
  const key = requireConfiguredEnv(
    'GITHUB_APP_PRIVATE_KEY',
    'GITHUB_APP_PRIVATE_KEY is required for GitHub App authentication.'
  )

  return key.replace(/\\n/g, '\n')
}

function createJwtSegment(input: object) {
  return Buffer.from(JSON.stringify(input)).toString('base64url')
}

async function requestGitHubJson<T>(url: string, init: RequestInit, context: string): Promise<T> {
  const response = await fetch(url, init)

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`${context}: ${response.status} ${errorBody}`)
  }

  return response.json() as Promise<T>
}

export function generateAppJwt() {
  const appId = getGitHubAppId()
  const privateKey = getGitHubPrivateKey()
  const now = Math.floor(Date.now() / 1000)

  const header = createJwtSegment({
    alg: 'RS256',
    typ: 'JWT',
  })
  const payload = createJwtSegment({
    iat: now - 60,
    exp: now + 600,
    iss: appId,
  })

  const signer = crypto.createSign('RSA-SHA256')
  signer.update(`${header}.${payload}`)
  signer.end()

  const signature = signer.sign(privateKey).toString('base64url')
  return `${header}.${payload}.${signature}`
}

export async function getInstallationAccessToken(installationId: string) {
  const appJwt = generateAppJwt()
  const data = await requestGitHubJson<{ token: string }>(
    `https://api.github.com/app/installations/${installationId}/access_tokens`,
    {
      method: 'POST',
      headers: getGitHubApiHeaders(appJwt),
    },
    'Failed to get installation access token'
  )

  return data.token
}

export async function listAppInstallations(): Promise<AppInstallation[]> {
  const appJwt = generateAppJwt()
  const data = await requestGitHubJson<
    Array<{ id: number; account?: { login?: string | null; type?: string | null } | null }>
  >(
    'https://api.github.com/app/installations?per_page=100',
    {
      headers: getGitHubApiHeaders(appJwt),
    },
    'Failed to list GitHub App installations'
  )

  return data.map((installation) => ({
    accountLogin: installation.account?.login?.trim() || null,
    id: String(installation.id),
    targetType: installation.account?.type?.trim() || null,
  }))
}

export type InstallationRepo = {
  id: string
  name: string
  ownerLogin: string
  private: boolean
}

export async function listInstallationRepos(installationId: string): Promise<InstallationRepo[]> {
  const accessToken = await getInstallationAccessToken(installationId)
  const data = await requestGitHubJson<{
    repositories: Array<{ id: number; full_name: string; private: boolean; owner: { login: string } }>
  }>(
    'https://api.github.com/installation/repositories?per_page=100',
    {
      headers: getGitHubApiHeaders(accessToken),
    },
    'Failed to list installation repositories'
  )

  return data.repositories.map((repo) => ({
    id: String(repo.id),
    name: repo.full_name,
    ownerLogin: repo.owner.login,
    private: repo.private,
  }))
}

export async function getPullRequestContext(params: {
  installationId: string
  owner: string
  repo: string
  pullNumber: number
}) {
  const accessToken = await getInstallationAccessToken(params.installationId)

  const [commitsResponse, filesResponse] = await Promise.all([
    requestGitHubJson<Array<{ commit?: { message?: string } }>>(
      `https://api.github.com/repos/${params.owner}/${params.repo}/pulls/${params.pullNumber}/commits?per_page=100`,
      {
        headers: getGitHubApiHeaders(accessToken),
      },
      'Failed to list pull request commits'
    ),
    requestGitHubJson<Array<{ filename?: string }>>(
      `https://api.github.com/repos/${params.owner}/${params.repo}/pulls/${params.pullNumber}/files?per_page=100`,
      {
        headers: getGitHubApiHeaders(accessToken),
      },
      'Failed to list pull request files'
    ),
  ])

  return {
    commits: commitsResponse
      .map((commit) => commit.commit?.message?.trim() ?? '')
      .filter(Boolean),
    files: filesResponse
      .map((file) => file.filename?.trim() ?? '')
      .filter(Boolean),
  }
}
