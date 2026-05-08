import { Hono } from "hono"
import { getOpenAI, streamToResponse } from "../lib/openai"
import { mockStream, MOCK_BRIEF_RESPONSE } from "../lib/mock"
import type { Env } from "../index"

export const briefRoute = new Hono<{ Bindings: Env }>()

// POST /api/brief/ingest
// Body: { brief: string, projectId: string }
// Streams back: project summary → rubric criteria → tasks (JSON lines)
briefRoute.post("/ingest", async (c) => {
  const { brief, projectId } = await c.req.json<{ brief: string; projectId: string }>()

  if (!brief || !projectId) {
    return c.json({ error: "brief and projectId are required" }, 400)
  }

  if (c.env.MOCK_AI === "true") {
    return mockStream(MOCK_BRIEF_RESPONSE)
  }

  const openai = getOpenAI(c.env)

  const stream = await openai.chat.completions.create({
    model: "gpt-4o",
    stream: true,
    messages: [
      {
        role: "system",
        content: `You are ProjectPilot's brief ingestion engine. Your job is to analyse an assignment brief and produce a structured project plan.

Output format — stream three JSON blocks separated by "---SECTION---":

SECTION 1 (project summary):
{"type":"summary","title":"<project title>","deliverables":["..."],"keyDates":["..."],"submissionFormat":"...","highRiskAreas":["..."]}

SECTION 2 (rubric criteria array):
{"type":"criteria","items":[{"name":"...","description":"...","weight":<number 0-100>}]}

SECTION 3 (tasks array):
{"type":"tasks","items":[{"title":"...","description":"...","priority":"low|medium|high|critical","effortHours":<number>,"criterionName":"...","dependencies":[]}]}

Rules:
- Weight values in criteria must sum to 100
- Every task must reference a criterionName from the criteria list
- Add structural tasks the brief implies but doesn't state (e.g. "Proofread", "Format references")
- Be specific, actionable, and realistic for a student deadline context`,
      },
      {
        role: "user",
        content: `Project ID: ${projectId}\n\nAssignment Brief:\n${brief}`,
      },
    ],
  })

  return streamToResponse(stream)
})
