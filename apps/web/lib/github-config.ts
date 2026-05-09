import { getConfiguredEnv } from '@/lib/env'

export function isGitHubAppConfigured() {
  return [
    getConfiguredEnv('GITHUB_APP_ID'),
    getConfiguredEnv('GITHUB_APP_CLIENT_ID'),
    getConfiguredEnv('GITHUB_APP_CLIENT_SECRET'),
    getConfiguredEnv('GITHUB_APP_PRIVATE_KEY'),
    getConfiguredEnv('GITHUB_APP_SLUG'),
  ].every(Boolean)
}

export function isGitHubWebhookConfigured() {
  return Boolean(getConfiguredEnv('GITHUB_APP_WEBHOOK_SECRET'))
}

export function isGitHubInstallationId(value: string | null | undefined) {
  return /^\d+$/.test(value?.trim() ?? '')
}
