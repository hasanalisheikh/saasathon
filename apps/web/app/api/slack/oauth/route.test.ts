/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { afterEach, describe, expect, it, mock } from 'bun:test'
import { NextRequest } from 'next/server'
import { restoreEnv, snapshotEnv } from '@/test-utils/env'

let updatedProfilePayload = null
let updatedProfileId = null

const fakeSupabase = {
  from(table) {
    if (table !== 'profiles') {
      throw new Error(`Unexpected table: ${table}`)
    }

    return {
      update(payload) {
        updatedProfilePayload = payload
        return {
          eq(column, value) {
            updatedProfileId = { column, value }
            return Promise.resolve({ error: null })
          },
        }
      },
    }
  },
}

mock.module('@/lib/supabase/server', () => ({
  createServiceClient: () => fakeSupabase,
}))

mock.module('@/lib/slack', () => ({
  verifyAndDecodeSlackState: () => ({ userId: 'user_123', nonce: 'nonce_456' }),
  exchangeSlackCode: async () => ({
    access_token: 'xoxb-test',
    bot_user_id: 'U_BOT',
    authed_user: { id: 'U_HUMAN' },
    team: { id: 'T_TEAM', name: 'Workspace Name' },
  }),
}))

const { GET } = await import('./route')

const managedKeys = ['NEXT_PUBLIC_APP_URL']
const originalEnv = snapshotEnv(managedKeys)

afterEach(() => {
  updatedProfilePayload = null
  updatedProfileId = null
  restoreEnv(originalEnv)
})

describe('/api/slack/oauth', () => {
  it('stores the human slack_user_id alongside the bot credentials', async () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://monad-weld.vercel.app'

    const request = new NextRequest(
      'https://monad-weld.vercel.app/api/slack/oauth?code=code_123&state=state_456'
    )

    const response = await GET(request)

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe(
      'https://monad-weld.vercel.app/integrations?slack=connected'
    )
    expect(updatedProfilePayload).toEqual({
      slack_access_token: 'xoxb-test',
      slack_team_id: 'T_TEAM',
      slack_team_name: 'Workspace Name',
      slack_bot_user_id: 'U_BOT',
      slack_user_id: 'U_HUMAN',
    })
    expect(updatedProfileId).toEqual({ column: 'id', value: 'user_123' })
  })
})
