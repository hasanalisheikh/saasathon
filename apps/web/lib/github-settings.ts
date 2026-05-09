import type { RuntimeConfigCheck } from '@/lib/integrations'

export type GitHubSettingsProject = {
  id: string
  github_installation_id: string | null
}

const GITHUB_APP_CHECK_KEYS = new Set([
  'NEXT_PUBLIC_APP_URL',
  'GITHUB_APP_ID',
  'GITHUB_APP_CLIENT_ID',
  'GITHUB_APP_CLIENT_SECRET',
  'GITHUB_APP_PRIVATE_KEY',
  'GITHUB_APP_SLUG',
  'NEXT_PUBLIC_GITHUB_APP_SLUG',
])

const GITHUB_WEBHOOK_CHECK_KEYS = new Set(['GITHUB_APP_WEBHOOK_SECRET'])

export function resolveGitHubSettingsConnectHref(project: GitHubSettingsProject) {
  return `/projects/${project.id}/github-setup`
}

export function deriveGitHubAppUrls(appUrl: string | null) {
  if (!appUrl) return null

  try {
    const url = new URL(appUrl)
    url.pathname = ''
    url.search = ''
    url.hash = ''

    const base = url.toString().replace(/\/$/, '')

    return {
      homepageUrl: base,
      setupUrl: `${base}/api/github/setup`,
      callbackUrl: `${base}/api/github/auth/callback`,
      webhookUrl: `${base}/api/webhooks/github`,
    }
  } catch {
    return null
  }
}

export function getGitHubMissingChecks(checks: RuntimeConfigCheck[]) {
  return {
    app: checks.filter((check) => GITHUB_APP_CHECK_KEYS.has(check.key) && !check.configured),
    webhook: checks.filter((check) => GITHUB_WEBHOOK_CHECK_KEYS.has(check.key) && !check.configured),
  }
}
