/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { describe, expect, it } from 'bun:test'
import { buildRequestAnalysisMessages } from './ai-contract'

describe('buildRequestAnalysisMessages', () => {
  it('defines confidence as a scope-position score instead of a certainty score', () => {
    const messages = buildRequestAnalysisMessages({
      scopeRaw: 'Build a marketing website.',
      scopeStructured: { deliverables: ['Website'], exclusions: ['Booking system'] },
      documents: 'No uploaded project documents are assigned to this project.',
      hourlyRate: 120,
      taskCategories: [],
      emailFrom: 'client@example.com',
      emailSubject: 'Quick change',
      emailBody: 'Can you add online booking?',
    })

    expect(messages).toHaveLength(2)

    const systemPrompt = messages[0].content
    const userPrompt = messages[1].content

    expect(systemPrompt).toContain('confidence is a 0-100 scope-position score, not a certainty score.')
    expect(systemPrompt).toContain('0 means the request is completely and clearly out_of_scope.')
    expect(systemPrompt).toContain('100 means the request is completely and clearly in_scope.')
    expect(systemPrompt).toContain('confidence should usually sit near the middle, roughly 40-60')
    expect(systemPrompt).toContain('Do not use a high number for an out_of_scope request or a low number for an in_scope request just because you feel certain.')

    expect(userPrompt).toContain('Set confidence as a scope-position score: 0 = completely out of scope, 100 = completely in scope.')
    expect(userPrompt).toContain('For ambiguous or clarification_needed requests, usually keep confidence near the middle, roughly 40-60')
  })
})
