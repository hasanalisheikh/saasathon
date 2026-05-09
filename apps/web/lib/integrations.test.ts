/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { afterEach, describe, expect, it } from 'bun:test'
import { getEnvChecks, getRuntimeDiagnostics } from '@/lib/integrations'
import { restoreEnv, snapshotEnv } from '@/test-utils/env'

const managedKeys = [
  'OPENROUTER_API_KEY',
  'MOCK_AI',
  'NEXT_PUBLIC_APP_URL',
  'INBOUND_EMAIL_DOMAIN',
  'RESEND_API_KEY',
  'RESEND_FROM_EMAIL',
  'POSTMARK_INBOUND_WEBHOOK_TOKEN',
  'GITHUB_APP_ID',
  'GITHUB_APP_CLIENT_ID',
  'GITHUB_APP_CLIENT_SECRET',
  'GITHUB_APP_PRIVATE_KEY',
  'GITHUB_APP_SLUG',
  'GITHUB_APP_WEBHOOK_SECRET',
]

const originalEnv = snapshotEnv(managedKeys)

afterEach(() => {
  restoreEnv(originalEnv)
})

describe('integration env checks', () => {
  it('marks placeholder-backed integrations as not ready', () => {
    process.env.OPENROUTER_API_KEY = 'sk-placeholder'
    process.env.RESEND_API_KEY = 're_placeholder'
    process.env.RESEND_FROM_EMAIL = 'noreply@monad.app'
    process.env.POSTMARK_INBOUND_WEBHOOK_TOKEN = 'placeholder'
    process.env.GITHUB_APP_ID = 'placeholder'
    process.env.GITHUB_APP_CLIENT_ID = 'placeholder'
    process.env.GITHUB_APP_CLIENT_SECRET = 'placeholder'
    process.env.GITHUB_APP_PRIVATE_KEY = 'replace-me'
    process.env.GITHUB_APP_SLUG = 'placeholder'
    process.env.GITHUB_APP_WEBHOOK_SECRET = 'placeholder'

    const checks = Object.fromEntries(getEnvChecks().map((check) => [check.label, check.value]))

    expect(checks['AI analysis']).toBe(false)
    expect(checks['Manual request intake']).toBe(true)
    expect(checks['Email delivery (optional)']).toBe(false)
    expect(checks['Legacy inbound email (optional)']).toBe(false)
    expect(checks['GitHub App']).toBe(false)
    expect(checks['GitHub App webhooks']).toBe(false)
  })

  it('marks AI ready when MOCK_AI is enabled', () => {
    delete process.env.OPENROUTER_API_KEY
    process.env.MOCK_AI = 'true'

    const checks = Object.fromEntries(getEnvChecks().map((check) => [check.label, check.value]))
    expect(checks['AI analysis']).toBe(true)
  })

  it('reports runtime diagnostics for deployment-critical config', () => {
    process.env.MOCK_AI = 'true'
    process.env.NEXT_PUBLIC_APP_URL = 'https://monad-weld.vercel.app'
    process.env.INBOUND_EMAIL_DOMAIN = 'inbound.monad-weld.app'

    const diagnostics = getRuntimeDiagnostics()

    expect(diagnostics.appUrl).toBe('https://monad-weld.vercel.app')
    expect(diagnostics.inboundEmailDomain).toBe('inbound.monad-weld.app')
    expect(diagnostics.mockAI).toBe(true)
    expect(diagnostics.checks.find((check) => check.key === 'NEXT_PUBLIC_APP_URL')?.configured).toBe(true)
  })
})
