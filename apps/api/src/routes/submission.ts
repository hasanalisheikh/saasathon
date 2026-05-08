import { Hono } from "hono"
import { getOpenAI, streamToResponse } from "../lib/openai"
import { mockStream, MOCK_SUBMISSION_REPORT } from "../lib/mock"
import type { Env } from "../index"

type Criterion = { name: string; weight: number; description: string }

export const submissionRoute = new Hono<{ Bindings: Env }>()

// POST /api/submission/check
// Body: { draftContent: string, criteria: Criterion[], projectTitle: string }
// Streams back a full submission report
submissionRoute.post("/check", async (c) => {
  const { draftContent, criteria, projectTitle } = await c.req.json<{
    draftContent: string
    criteria: Criterion[]
    projectTitle: string
  }>()

  if (!draftContent || !criteria?.length) {
    return c.json({ error: "draftContent and criteria are required" }, 400)
  }

  if (c.env.MOCK_AI === "true") {
    return mockStream(MOCK_SUBMISSION_REPORT)
  }

  const openai = getOpenAI(c.env)

  const criteriaText = criteria
    .map((cr) => `- ${cr.name} (${cr.weight}%): ${cr.description ?? "No description"}`)
    .join("\n")

  const stream = await openai.chat.completions.create({
    model: "gpt-4o",
    stream: true,
    messages: [
      {
        role: "system",
        content: `You are ProjectPilot's final submission checker. Analyse a student's draft submission against rubric criteria.

Output a structured pre-submission report:

## Overall Assessment
<2-3 sentence summary>

## Predicted Grade Range
<e.g. "B– to B (65–72%)"> with 1-sentence justification

## Criteria Coverage

For each criterion, output:
### [Criterion name] ([weight]%) — ✅ Covered | ⚠️ Weak | ❌ Missing
<1-2 sentences of specific evidence or gap analysis>
<If weak or missing: one actionable fix suggestion>

## Priority Actions Before Submission
<Numbered list of the top 3 things to fix, ordered by mark impact>

IMPORTANT: This tool identifies rubric alignment only. It does not generate assignment content.`,
      },
      {
        role: "user",
        content: `Project: ${projectTitle}

Rubric criteria:
${criteriaText}

Draft submission:
${draftContent}`,
      },
    ],
  })

  return streamToResponse(stream)
})
