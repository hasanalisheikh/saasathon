/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { describe, expect, it } from 'bun:test'
import { buildSlackFallbackReply } from './reply'

describe('/api/webhooks/slack fallback replies', () => {
  it('mentions possible out of scope work in a friendly way', () => {
    expect(
      buildSlackFallbackReply({
        classification: 'out_of_scope',
        developerName: 'Jamie',
      })
    ).toContain('may be out of scope')
  })

  it('mentions likely in-scope work when the analysis leans in scope', () => {
    expect(
      buildSlackFallbackReply({
        classification: 'in_scope',
        developerName: 'Jamie',
      })
    ).toContain('may be in scope')
  })

  it('falls back to clarification language for uncertain requests', () => {
    expect(
      buildSlackFallbackReply({
        classification: 'ambiguous',
        developerName: 'Jamie',
      })
    ).toContain('may need a little clarification')
  })
})
