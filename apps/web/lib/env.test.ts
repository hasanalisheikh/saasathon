/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { afterEach, describe, expect, it } from 'bun:test'
import {
  getConfiguredEnv,
  isAIConfigured,
  isConfiguredEnvValue,
  isMockAIEnabled,
  isPostmarkConfigured,
  isResendConfigured,
} from '@/lib/env'
import { restoreEnv, snapshotEnv } from '@/test-utils/env'

const managedKeys = [
  'OPENROUTER_API_KEY',
  'MOCK_AI',
  'RESEND_API_KEY',
  'RESEND_FROM_EMAIL',
  'POSTMARK_INBOUND_WEBHOOK_TOKEN',
]

const originalEnv = snapshotEnv(managedKeys)

afterEach(() => {
  restoreEnv(originalEnv)
})

describe('env helpers', () => {
  it('rejects placeholder-like values', () => {
    expect(isConfiguredEnvValue('placeholder')).toBe(false)
    expect(isConfiguredEnvValue('re_placeholder')).toBe(false)
    expect(isConfiguredEnvValue('  your-client-id  ')).toBe(false)
    expect(isConfiguredEnvValue('sk-placeholder')).toBe(false)
  })

  it('accepts real-looking values', () => {
    expect(isConfiguredEnvValue('sk-or-v1-real-key')).toBe(true)
    expect(isConfiguredEnvValue('Iv1.realClientId')).toBe(true)
  })

  it('normalizes configured env values', () => {
    process.env.OPENROUTER_API_KEY = '  sk-or-v1-real-key  '
    expect(getConfiguredEnv('OPENROUTER_API_KEY')).toBe('sk-or-v1-real-key')
  })

  it('treats mock AI as configured AI', () => {
    delete process.env.OPENROUTER_API_KEY
    process.env.MOCK_AI = 'true'

    expect(isMockAIEnabled()).toBe(true)
    expect(isAIConfigured()).toBe(true)
  })

  it('requires both resend values and a postmark token', () => {
    process.env.RESEND_API_KEY = 're_real'
    process.env.RESEND_FROM_EMAIL = 'noreply@monad.app'
    process.env.POSTMARK_INBOUND_WEBHOOK_TOKEN = 'postmark-real'

    expect(isResendConfigured()).toBe(true)
    expect(isPostmarkConfigured()).toBe(true)

    process.env.RESEND_API_KEY = 're_placeholder'
    expect(isResendConfigured()).toBe(false)
  })
})
