export const GITHUB_STATUS_VALUES = [
  'connected',
  'oauth_not_configured',
  'oauth_failed',
  'repos_unavailable',
  'repo_linked',
] as const

export type GitHubStatus = (typeof GITHUB_STATUS_VALUES)[number]

type ConnectPathParams = {
  projectId?: string | null
  returnTo?: string | null
}

export function buildGitHubConnectPath(params: ConnectPathParams = {}) {
  const searchParams = new URLSearchParams()

  if (params.projectId) {
    searchParams.set('projectId', params.projectId)
  }

  if (params.returnTo) {
    searchParams.set('returnTo', params.returnTo)
  }

  const query = searchParams.toString()
  return query ? `/api/github/connect?${query}` : '/api/github/connect'
}

export function appendGitHubStatus(
  pathname: string,
  status: GitHubStatus,
  extraParams?: Record<string, string | null | undefined>
) {
  const url = new URL(pathname, 'http://monad.local')
  url.searchParams.set('github', status)

  if (extraParams) {
    for (const [key, value] of Object.entries(extraParams)) {
      if (value) {
        url.searchParams.set(key, value)
      }
    }
  }

  return `${url.pathname}${url.search}`
}

export function getGitHubStatusMessage(status: string | null) {
  switch (status) {
    case 'connected':
      return { tone: 'success' as const, text: 'GitHub connected successfully.' }
    case 'repo_linked':
      return { tone: 'success' as const, text: 'GitHub repository linked successfully.' }
    case 'oauth_not_configured':
      return {
        tone: 'error' as const,
        text: 'GitHub OAuth is not configured yet. Add the GitHub client ID and secret to continue.',
      }
    case 'oauth_failed':
      return {
        tone: 'error' as const,
        text: 'GitHub sign-in failed. Please try again.',
      }
    case 'repos_unavailable':
      return {
        tone: 'error' as const,
        text: 'Monad could not load your GitHub repositories. Please reconnect and try again.',
      }
    default:
      return null
  }
}

