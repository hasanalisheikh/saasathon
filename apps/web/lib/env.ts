const PLACEHOLDER_PATTERNS = [
  'your-',
  'placeholder',
  'changeme',
  'change-me',
  'replace-me',
  'replace_with',
  'todo',
  'example',
  're_placeholder',
  'sk-placeholder',
] as const

const DEFAULT_AI_MODEL = 'google/gemini-3.1-flash-lite'
const ENV_ALIASES: Partial<Record<string, string[]>> = {
  GITHUB_APP_CLIENT_ID: ['GITHUB_CLIENT_ID'],
  GITHUB_APP_CLIENT_SECRET: ['GITHUB_CLIENT_SECRET'],
  GITHUB_APP_WEBHOOK_SECRET: ['GITHUB_WEBHOOK_SECRET'],
}

export function readEnv(key: string): string | null {
  const keys = [key, ...(ENV_ALIASES[key] ?? [])]

  for (const envKey of keys) {
    const value = process.env[envKey]?.trim()
    if (value) return value
  }

  return null
}

export function isConfiguredEnvValue(value: string | null | undefined): boolean {
  const normalized = value?.trim().toLowerCase() ?? ''
  if (!normalized) return false

  return !PLACEHOLDER_PATTERNS.some((pattern) => normalized.includes(pattern))
}

export function getConfiguredEnv(key: string): string | null {
  const value = readEnv(key)
  return isConfiguredEnvValue(value) ? value : null
}

export function requireConfiguredEnv(key: string, message?: string): string {
  const value = getConfiguredEnv(key)
  if (!value) {
    throw new Error(message ?? `${key} is not configured.`)
  }
  return value
}

export function isMockAIEnabled(): boolean {
  return readEnv('MOCK_AI') === 'true'
}

export function isAIConfigured(): boolean {
  return isMockAIEnabled() || Boolean(getConfiguredEnv('OPENROUTER_API_KEY'))
}

export function getAIModel(): string {
  return getConfiguredEnv('AI_MODEL') ?? DEFAULT_AI_MODEL
}

export function isResendConfigured(): boolean {
  return Boolean(getConfiguredEnv('RESEND_API_KEY') && getConfiguredEnv('RESEND_FROM_EMAIL'))
}

export function isPostmarkConfigured(): boolean {
  return Boolean(getConfiguredEnv('POSTMARK_INBOUND_WEBHOOK_TOKEN'))
}

export function getAppUrl(): string {
  return requireConfiguredEnv(
    'NEXT_PUBLIC_APP_URL',
    'NEXT_PUBLIC_APP_URL is required for runtime links, callbacks, and AI requests.'
  )
}

export function getInboundEmailDomain(): string {
  return requireConfiguredEnv(
    'INBOUND_EMAIL_DOMAIN',
    'INBOUND_EMAIL_DOMAIN is required to generate inbound project email addresses.'
  )
}
