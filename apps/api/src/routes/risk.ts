import { Hono } from "hono"
import { getOpenAI } from "../lib/openai"
import type { Env } from "../index"

type Criterion = { name: string; weight: number; taskCount: number; completedCount: number }

export const riskRoute = new Hono<{ Bindings: Env }>()

// POST /api/risk/audit
// Body: { projectId, criteria: Criterion[], triggerEvent: string }
// Returns: { score, narrative, criteriaStatuses }
riskRoute.post("/audit", async (c) => {
  const { projectId, criteria, triggerEvent } = await c.req.json<{
    projectId: string
    criteria: Criterion[]
    triggerEvent: string
  }>()

  if (!projectId || !criteria) {
    return c.json({ error: "projectId and criteria are required" }, 400)
  }

  const openai = getOpenAI(c.env)

  const criteriaText = criteria
    .map(
      (cr) =>
        `- "${cr.name}" (${cr.weight}%): ${cr.taskCount} task(s), ${cr.completedCount} complete`,
    )
    .join("\n")

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are ProjectPilot's mark-risk engine. Analyse rubric coverage and return a JSON risk report.

Output strictly valid JSON:
{
  "score": <integer 0-100>,
  "narrative": "<2-3 sentence plain-English summary for a student>",
  "criteriaStatuses": [
    {"name": "...", "status": "covered|partial|uncovered", "reason": "..."}
  ]
}

Scoring rules:
- Start at 100
- Deduct (weight%) for each uncovered criterion
- Deduct (weight% * 0.4) for each partial criterion (has tasks but none complete)
- Round to nearest integer`,
      },
      {
        role: "user",
        content: `Project: ${projectId}\nTrigger: ${triggerEvent}\n\nCriteria coverage:\n${criteriaText}`,
      },
    ],
    response_format: { type: "json_object" },
  })

  const result = JSON.parse(response.choices[0].message.content ?? "{}")
  return c.json(result)
})
