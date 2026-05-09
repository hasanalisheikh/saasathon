/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { afterEach, describe, expect, it, mock } from 'bun:test'
import { NextRequest } from 'next/server'
import { restoreEnv, snapshotEnv } from '@/test-utils/env'

let currentUser = { id: 'user_123' }

mock.module('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: {
      getUser: async () => ({ data: { user: currentUser } }),
    },
  }),
}))

const { GET } = await import('./route')

const managedKeys = [
  'GITHUB_APP_ID',
  'GITHUB_APP_CLIENT_ID',
  'GITHUB_APP_CLIENT_SECRET',
  'GITHUB_APP_PRIVATE_KEY',
  'GITHUB_APP_SLUG',
]

const originalEnv = snapshotEnv(managedKeys)

afterEach(() => {
  currentUser = { id: 'user_123' }
  restoreEnv(originalEnv)
})

describe('/api/github/install', () => {
  it('redirects to setup-required when the GitHub App is not configured', async () => {
    process.env.GITHUB_APP_ID = 'placeholder'
    process.env.GITHUB_APP_CLIENT_ID = 'Iv1.placeholder'
    process.env.GITHUB_APP_CLIENT_SECRET = 'placeholder'
    process.env.GITHUB_APP_PRIVATE_KEY = 'replace-me'
    process.env.GITHUB_APP_SLUG = 'placeholder'

    const response = await GET(new NextRequest('http://localhost/api/github/install?projectId=project_1'))

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toContain('/projects/project_1/github-setup?github=app_not_configured')
  })
})
