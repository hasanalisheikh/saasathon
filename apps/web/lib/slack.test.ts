/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { afterEach, describe, expect, it } from 'bun:test'
import { postSlackMessage } from './slack'

const originalFetch = globalThis.fetch
let fetchCalls = []

afterEach(() => {
  globalThis.fetch = originalFetch
  fetchCalls = []
})

describe('postSlackMessage', () => {
  it('throws when Slack returns ok false', async () => {
    globalThis.fetch = async (...args) => {
      fetchCalls.push(args)
      return new Response(JSON.stringify({ ok: false, error: 'channel_not_found' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    await expect(postSlackMessage('xoxb-test', 'C123', 'hello')).rejects.toThrow(
      'Slack post message error: channel_not_found'
    )
  })

  it('passes thread_ts when present and returns the Slack timestamp', async () => {
    globalThis.fetch = async (...args) => {
      fetchCalls.push(args)
      return new Response(JSON.stringify({ ok: true, ts: '1778331111.000002' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const result = await postSlackMessage('xoxb-test', 'C123', 'hello', '1778327089.609469')

    expect(result).toEqual({ ts: '1778331111.000002' })
    expect(fetchCalls).toHaveLength(1)
    expect(JSON.parse(fetchCalls[0][1].body)).toEqual({
      channel: 'C123',
      text: 'hello',
      thread_ts: '1778327089.609469',
    })
  })
})
