/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { afterEach, describe, expect, it } from 'bun:test'
import {
  getAIModel,
  getAppUrl,
  getConfiguredEnv,
  getInboundEmailDomain,
  isAIConfigured,
  isConfiguredEnvValue,
  isMockAIEnabled,
  isPostmarkConfigured,
  isResendConfigured,
  readEnv,
} from '@/lib/env'
import { restoreEnv, snapshotEnv } from '@/test-utils/env'

const managedKeys = [
  'OPENROUTER_API_KEY',
  'MOCK_AI',
  'AI_MODEL',
  'NEXT_PUBLIC_APP_URL',
  'INBOUND_EMAIL_DOMAIN',
  'RESEND_API_KEY',
  'RESEND_FROM_EMAIL',
  'POSTMARK_INBOUND_WEBHOOK_TOKEN',
  'GITHUB_APP_PRIVATE_KEY',
  'GITHUB_PRIVATE_KEY',
  'GITHUB_APP_SLUG',
  'NEXT_PUBLIC_GITHUB_APP_SLUG',
  'GITHUB_APP_WEBHOOK_SECRET',
  'GITHUB_WEBHOOK_SECRET',
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

  it('reads GitHub env aliases during rollout', () => {
    process.env.GITHUB_PRIVATE_KEY = '  -----BEGIN PRIVATE KEY-----\\nreal\\n-----END PRIVATE KEY-----  '
    process.env.NEXT_PUBLIC_GITHUB_APP_SLUG = ' monad-saasathon '
    process.env.GITHUB_WEBHOOK_SECRET = ' webhook-secret '

    expect(readEnv('GITHUB_APP_PRIVATE_KEY')).toBe('-----BEGIN PRIVATE KEY-----\\nreal\\n-----END PRIVATE KEY-----')
    expect(getConfiguredEnv('GITHUB_APP_PRIVATE_KEY')).toBe('-----BEGIN PRIVATE KEY-----\\nreal\\n-----END PRIVATE KEY-----')
    expect(getConfiguredEnv('GITHUB_APP_SLUG')).toBe('monad-saasathon')
    expect(getConfiguredEnv('GITHUB_APP_WEBHOOK_SECRET')).toBe('webhook-secret')
  })

  it('treats mock AI as configured AI', () => {
    delete process.env.OPENROUTER_API_KEY
    process.env.MOCK_AI = 'true'

    expect(isMockAIEnabled()).toBe(true)
    expect(isAIConfigured()).toBe(true)
  })

  it('requires runtime URLs and domains instead of falling back silently', () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://monad-weld.vercel.app'
    process.env.INBOUND_EMAIL_DOMAIN = 'inbound.monad-weld.app'
    process.env.AI_MODEL = 'google/gemini-3.1-flash-lite'

    expect(getAppUrl()).toBe('https://monad-weld.vercel.app')
    expect(getInboundEmailDomain()).toBe('inbound.monad-weld.app')
    expect(getAIModel()).toBe('google/gemini-3.1-flash-lite')
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
