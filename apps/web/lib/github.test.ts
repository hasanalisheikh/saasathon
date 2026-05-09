/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { afterEach, describe, expect, it } from 'bun:test'
import {
  decodeGitHubInstallationSelectionState,
  decodeGitHubAppState,
  encodeGitHubInstallationSelectionState,
  encodeGitHubAppState,
  normalizeGitHubReturnTo,
} from '@/lib/github'
import { restoreEnv, snapshotEnv } from '@/test-utils/env'

const managedKeys = ['GITHUB_APP_CLIENT_SECRET']
const originalEnv = snapshotEnv(managedKeys)

afterEach(() => {
  restoreEnv(originalEnv)
})

describe('github helpers', () => {
  it('normalizes GitHub return paths to safe in-app routes', () => {
    expect(normalizeGitHubReturnTo('/projects/123/github-setup?tab=repo', '/integrations')).toBe(
      '/projects/123/github-setup?tab=repo'
    )
    expect(normalizeGitHubReturnTo('https://evil.example.com/phish', '/integrations')).toBe('/integrations')
    expect(normalizeGitHubReturnTo('/api/github/install', '/integrations')).toBe('/integrations')
  })

  it('round-trips signed GitHub App state', () => {
    process.env.GITHUB_APP_CLIENT_SECRET = 'real-client-secret'

    const encoded = encodeGitHubAppState({
      flow: 'connect',
      installationId: '12345',
      nonce: 'nonce-1',
      projectId: 'project-1',
      returnTo: '/projects/project-1/github-setup',
      userId: 'user-1',
    })

    expect(decodeGitHubAppState(encoded)).toEqual({
      flow: 'connect',
      installationId: '12345',
      nonce: 'nonce-1',
      projectId: 'project-1',
      returnTo: '/projects/project-1/github-setup',
      userId: 'user-1',
    })
  })

  it('rejects tampered GitHub App state without throwing', () => {
    process.env.GITHUB_APP_CLIENT_SECRET = 'real-client-secret'

    const encoded = encodeGitHubAppState({
      flow: 'install',
      installationId: null,
      nonce: 'nonce-2',
      projectId: 'project-2',
      returnTo: '/projects/project-2/github-setup',
      userId: 'user-2',
    })

    expect(decodeGitHubAppState(`${encoded}x`)).toBeNull()
    expect(decodeGitHubAppState('bad-payload.short')).toBeNull()
  })

  it('round-trips signed installation selection state', () => {
    process.env.GITHUB_APP_CLIENT_SECRET = 'real-client-secret'

    const encoded = encodeGitHubInstallationSelectionState({
      installations: [
        { id: '12345', accountLogin: 'monad-saasathon', targetType: 'Organization' },
        { id: '67890', accountLogin: 'hasanalisheikh', targetType: 'User' },
      ],
      nonce: 'nonce-3',
      projectId: 'project-3',
      returnTo: '/projects/project-3/github-setup',
      userId: 'user-3',
    })

    expect(decodeGitHubInstallationSelectionState(encoded)).toEqual({
      installations: [
        { id: '12345', accountLogin: 'monad-saasathon', targetType: 'Organization' },
        { id: '67890', accountLogin: 'hasanalisheikh', targetType: 'User' },
      ],
      nonce: 'nonce-3',
      projectId: 'project-3',
      returnTo: '/projects/project-3/github-setup',
      userId: 'user-3',
    })
  })
})
