/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { afterEach, describe, expect, it } from 'bun:test'
import { GET } from './route'
import { restoreEnv, snapshotEnv } from '@/test-utils/env'

const managedKeys = [
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

describe('/api/github/status', () => {
  it('reports not configured when GitHub App values are placeholders', async () => {
    process.env.GITHUB_APP_ID = 'placeholder'
    process.env.GITHUB_APP_CLIENT_ID = 'Iv1.placeholder'
    process.env.GITHUB_APP_CLIENT_SECRET = 'placeholder'
    process.env.GITHUB_APP_PRIVATE_KEY = 'replace-me'
    process.env.GITHUB_APP_SLUG = 'placeholder'
    process.env.GITHUB_APP_WEBHOOK_SECRET = 'placeholder'

    const response = await GET()

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({
      appReady: false,
      webhookReady: false,
    })
  })

  it('separates GitHub App readiness from webhook readiness', async () => {
    process.env.GITHUB_APP_ID = '123456'
    process.env.GITHUB_APP_CLIENT_ID = 'Iv1.real-client-id'
    process.env.GITHUB_APP_CLIENT_SECRET = 'real-client-secret'
    process.env.GITHUB_APP_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----real-----END PRIVATE KEY-----'
    process.env.GITHUB_APP_SLUG = 'monad-app'
    process.env.GITHUB_APP_WEBHOOK_SECRET = 'placeholder'

    const response = await GET()

    expect(await response.json()).toEqual({
      appReady: true,
      webhookReady: false,
    })
  })
})
