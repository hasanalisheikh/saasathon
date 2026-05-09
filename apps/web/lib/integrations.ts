import {
  getAIModel,
  getAppUrl,
  getConfiguredEnv,
  getInboundEmailDomain,
  isAIConfigured,
  isMockAIEnabled,
  isPostmarkConfigured,
  isResendConfigured,
} from '@/lib/env'
import { isGitHubAppConfigured, isGitHubWebhookConfigured } from '@/lib/github-config'

export type EnvCheck = {
  label: string
  value: boolean
}

export type RuntimeConfigCheck = {
  key: string
  label: string
  required: boolean
  configured: boolean
}

export type RuntimeDiagnostics = {
  appUrl: string | null
  inboundEmailDomain: string | null
  mockAI: boolean
  aiModel: string | null
  checks: RuntimeConfigCheck[]
}

export function getEnvChecks(): EnvCheck[] {
  return [
    { label: 'AI analysis', value: isAIConfigured() },
    { label: 'Manual request intake', value: true },
    { label: 'GitHub App', value: isGitHubAppConfigured() },
    { label: 'GitHub App webhooks', value: isGitHubWebhookConfigured() },
    { label: 'Email delivery (optional)', value: isResendConfigured() },
    { label: 'Legacy inbound email (optional)', value: isPostmarkConfigured() },
  ]
}

export function getRuntimeDiagnostics(): RuntimeDiagnostics {
  const checks: RuntimeConfigCheck[] = [
    {
      key: 'NEXT_PUBLIC_SUPABASE_URL',
      label: 'Supabase URL',
      required: true,
      configured: Boolean(getConfiguredEnv('NEXT_PUBLIC_SUPABASE_URL')),
    },
    {
      key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      label: 'Supabase anon key',
      required: true,
      configured: Boolean(getConfiguredEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')),
    },
    {
      key: 'SUPABASE_SERVICE_ROLE_KEY',
      label: 'Supabase service role key',
      required: true,
      configured: Boolean(getConfiguredEnv('SUPABASE_SERVICE_ROLE_KEY')),
    },
    {
      key: 'OPENROUTER_API_KEY',
      label: 'OpenRouter API key',
      required: !isMockAIEnabled(),
      configured: isMockAIEnabled() || Boolean(getConfiguredEnv('OPENROUTER_API_KEY')),
    },
    {
      key: 'AI_MODEL',
      label: 'AI model',
      required: false,
      configured: Boolean(getConfiguredEnv('AI_MODEL')),
    },
    {
      key: 'NEXT_PUBLIC_APP_URL',
      label: 'Public app URL',
      required: true,
      configured: Boolean(getConfiguredEnv('NEXT_PUBLIC_APP_URL')),
    },
    {
      key: 'INBOUND_EMAIL_DOMAIN',
      label: 'Legacy inbound email domain',
      required: false,
      configured: Boolean(getConfiguredEnv('INBOUND_EMAIL_DOMAIN')),
    },
    {
      key: 'POSTMARK_INBOUND_WEBHOOK_TOKEN',
      label: 'Postmark inbound webhook token',
      required: false,
      configured: Boolean(getConfiguredEnv('POSTMARK_INBOUND_WEBHOOK_TOKEN')),
    },
    {
      key: 'RESEND_API_KEY',
      label: 'Resend API key',
      required: false,
      configured: Boolean(getConfiguredEnv('RESEND_API_KEY')),
    },
    {
      key: 'RESEND_FROM_EMAIL',
      label: 'Resend from email',
      required: false,
      configured: Boolean(getConfiguredEnv('RESEND_FROM_EMAIL')),
    },
    {
      key: 'GITHUB_APP_ID',
      label: 'GitHub App ID',
      required: false,
      configured: Boolean(getConfiguredEnv('GITHUB_APP_ID')),
    },
    {
      key: 'GITHUB_APP_CLIENT_ID',
      label: 'GitHub App client ID',
      required: false,
      configured: Boolean(getConfiguredEnv('GITHUB_APP_CLIENT_ID')),
    },
    {
      key: 'GITHUB_APP_CLIENT_SECRET',
      label: 'GitHub App client secret',
      required: false,
      configured: Boolean(getConfiguredEnv('GITHUB_APP_CLIENT_SECRET')),
    },
    {
      key: 'GITHUB_APP_PRIVATE_KEY',
      label: 'GitHub App private key',
      required: false,
      configured: Boolean(getConfiguredEnv('GITHUB_APP_PRIVATE_KEY')),
    },
    {
      key: 'GITHUB_APP_SLUG',
      label: 'GitHub App slug',
      required: false,
      configured: Boolean(getConfiguredEnv('GITHUB_APP_SLUG')),
    },
    {
      key: 'GITHUB_APP_WEBHOOK_SECRET',
      label: 'GitHub App webhook secret',
      required: false,
      configured: Boolean(getConfiguredEnv('GITHUB_APP_WEBHOOK_SECRET')),
    },
  ]

  return {
    appUrl: safeConfiguredValue(getAppUrl),
    inboundEmailDomain: safeConfiguredValue(getInboundEmailDomain),
    mockAI: isMockAIEnabled(),
    aiModel: isAIConfigured() ? getAIModel() : null,
    checks,
  }
}

function safeConfiguredValue(getter: () => string): string | null {
  try {
    return getter()
  } catch {
    return null
  }
}
