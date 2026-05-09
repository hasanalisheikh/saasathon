/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { describe, expect, it } from 'bun:test'
import {
  deriveGitHubAppUrls,
  getGitHubMissingChecks,
  resolveGitHubSettingsConnectHref,
} from '@/lib/github-settings'

describe('github settings helpers', () => {
  it('builds project-scoped settings connect paths', () => {
    expect(
      resolveGitHubSettingsConnectHref({
        id: 'project-1',
        github_installation_id: null,
      })
    ).toBe('/projects/project-1/github-setup')

    expect(
      resolveGitHubSettingsConnectHref({
        id: 'project-2',
        github_installation_id: '12345',
      })
    ).toBe('/projects/project-2/github-setup')
  })

  it('derives GitHub App URLs from NEXT_PUBLIC_APP_URL', () => {
    expect(deriveGitHubAppUrls('https://monad-weld.vercel.app/')).toEqual({
      homepageUrl: 'https://monad-weld.vercel.app',
      setupUrl: 'https://monad-weld.vercel.app/api/github/setup',
      callbackUrl: 'https://monad-weld.vercel.app/api/github/auth/callback',
      webhookUrl: 'https://monad-weld.vercel.app/api/webhooks/github',
    })
  })

  it('groups missing app and webhook checks separately', () => {
    const result = getGitHubMissingChecks([
      {
        key: 'GITHUB_APP_CLIENT_SECRET',
        label: 'GitHub App client secret',
        required: false,
        configured: false,
      },
      {
        key: 'GITHUB_APP_WEBHOOK_SECRET',
        label: 'GitHub App webhook secret',
        required: false,
        configured: false,
      },
      {
        key: 'NEXT_PUBLIC_APP_URL',
        label: 'Public app URL',
        required: true,
        configured: true,
      },
    ])

    expect(result.app.map((check) => check.key)).toEqual(['GITHUB_APP_CLIENT_SECRET'])
    expect(result.webhook.map((check) => check.key)).toEqual(['GITHUB_APP_WEBHOOK_SECRET'])
  })
})
