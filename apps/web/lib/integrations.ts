import { isAIConfigured, isPostmarkConfigured, isResendConfigured } from '@/lib/env'
import { isGitHubAppConfigured, isGitHubWebhookConfigured } from '@/lib/github-config'

export type EnvCheck = {
  label: string
  value: boolean
}

export function getEnvChecks(): EnvCheck[] {
  return [
    { label: 'AI analysis', value: isAIConfigured() },
    { label: 'Client email (Resend)', value: isResendConfigured() },
    { label: 'GitHub App', value: isGitHubAppConfigured() },
    { label: 'GitHub App webhooks', value: isGitHubWebhookConfigured() },
    { label: 'Inbound email (Postmark)', value: isPostmarkConfigured() },
  ]
}
