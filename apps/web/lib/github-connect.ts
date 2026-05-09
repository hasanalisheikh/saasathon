export const GITHUB_STATUS_VALUES = [
  'app_not_configured',
  'installation_created',
  'installation_selection_required',
  'setup_failed',
  'auth_failed',
  'repo_linked',
  'repo_access_removed',
  'app_uninstalled',
] as const

export type GitHubStatus = (typeof GITHUB_STATUS_VALUES)[number]

type ConnectPathParams = {
  projectId?: string | null
  returnTo?: string | null
  setupAction?: 'install' | 'connect' | null
}

export function buildGitHubConnectPath(params: ConnectPathParams = {}) {
  const searchParams = new URLSearchParams()

  if (params.projectId) {
    searchParams.set('projectId', params.projectId)
  }

  if (params.returnTo) {
    searchParams.set('returnTo', params.returnTo)
  }

  if (params.setupAction) {
    searchParams.set('setupAction', params.setupAction)
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
    case 'installation_created':
      return { tone: 'success' as const, text: 'GitHub App installed. Choose the repository for this project.' }
    case 'repo_linked':
      return { tone: 'success' as const, text: 'GitHub repository linked successfully.' }
    case 'installation_selection_required':
      return {
        tone: 'success' as const,
        text: 'GitHub authorization succeeded. Choose which existing installation should power this project.',
      }
    case 'app_not_configured':
      return {
        tone: 'error' as const,
        text: 'GitHub App setup is incomplete. Add the app ID, client credentials, private key, slug, and webhook secret to continue.',
      }
    case 'setup_failed':
      return {
        tone: 'error' as const,
        text: 'GitHub App installation could not be completed. Please try again.',
      }
    case 'auth_failed':
      return {
        tone: 'error' as const,
        text: 'Monad could not verify your GitHub App installation. Please try again.',
      }
    case 'repo_access_removed':
      return {
        tone: 'error' as const,
        text: 'GitHub repository access changed. Choose a repository again to reconnect this project.',
      }
    case 'app_uninstalled':
      return {
        tone: 'error' as const,
        text: 'The GitHub App was removed for this project. Install it again to continue using GitHub automation.',
      }
    default:
      return null
  }
}
