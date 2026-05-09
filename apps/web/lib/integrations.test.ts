/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { afterEach, describe, expect, it } from 'bun:test'
import { getEnvChecks } from '@/lib/integrations'
import { restoreEnv, snapshotEnv } from '@/test-utils/env'

const managedKeys = [
  'OPENROUTER_API_KEY',
  'MOCK_AI',
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
    expect(checks['Client email (Resend)']).toBe(false)
    expect(checks['Inbound email (Postmark)']).toBe(false)
    expect(checks['GitHub App']).toBe(false)
    expect(checks['GitHub App webhooks']).toBe(false)
  })

  it('marks AI ready when MOCK_AI is enabled', () => {
    delete process.env.OPENROUTER_API_KEY
    process.env.MOCK_AI = 'true'

    const checks = Object.fromEntries(getEnvChecks().map((check) => [check.label, check.value]))
    expect(checks['AI analysis']).toBe(true)
  })
})
