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
    expect(systemPrompt).toContain('Use the full range honestly. Do not jump to extremes when the evidence is mixed.')
    expect(systemPrompt).toContain('40-60: genuinely mixed, borderline, or underspecified. This band should usually pair with ambiguous or clarification_needed.')
    expect(systemPrompt).toContain('confidence should usually sit near the middle, roughly 40-60')
    expect(systemPrompt).toContain('If there is substantial evidence on both sides, do not force a binary answer. Use ambiguous and explain both interpretations.')
    expect(systemPrompt).toContain('When confidence lands between roughly 35 and 65, a binary classification should be rare and must be strongly justified by direct scope evidence.')
    expect(systemPrompt).toContain('Do not use a high number for an out_of_scope request or a low number for an in_scope request just because you feel certain.')

    expect(userPrompt).toContain('Set confidence as a scope-position score: 0 = completely out of scope, 100 = completely in scope.')
    expect(userPrompt).toContain('Use the full range honestly: 0-20 clearly out_of_scope, 21-39 leans out_of_scope, 40-60 genuinely mixed or underspecified, 61-79 leans in_scope, 80-100 clearly in_scope.')
    expect(userPrompt).toContain('For ambiguous or clarification_needed requests, usually keep confidence near the middle, roughly 40-60')
    expect(userPrompt).toContain('If there is substantial evidence on both sides, do not force a binary classification. Use ambiguous and explain both sides in reasoning.')
  })
})
