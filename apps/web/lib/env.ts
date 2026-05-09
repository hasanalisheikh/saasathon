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

export function readEnv(key: string): string | null {
  const value = process.env[key]?.trim()
  return value ? value : null
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

export function isResendConfigured(): boolean {
  return Boolean(getConfiguredEnv('RESEND_API_KEY') && getConfiguredEnv('RESEND_FROM_EMAIL'))
}

export function isPostmarkConfigured(): boolean {
  return Boolean(getConfiguredEnv('POSTMARK_INBOUND_WEBHOOK_TOKEN'))
}

export function getAppUrl(): string {
  return getConfiguredEnv('NEXT_PUBLIC_APP_URL') ?? 'http://localhost:3000'
}
