import { Hono } from "hono"
import { getOpenAI, streamToResponse } from "../lib/openai"
import { mockStream, MOCK_CHAT_SUMMARY, MOCK_CHAT_SCAN_FLAGGED, MOCK_CHAT_SCAN_CLEAR } from "../lib/mock"
import type { Env } from "../index"

type Message = { author: string; content: string; createdAt: string }

export const chatRoute = new Hono<{ Bindings: Env }>()

// POST /api/chat/summarise
// Body: { messages: Message[], criteria: string[], projectTitle: string }
// Streams back a structured summary
chatRoute.post("/summarise", async (c) => {
  const { messages, criteria, projectTitle } = await c.req.json<{
    messages: Message[]
    criteria: string[]
    projectTitle: string
  }>()

  if (!messages?.length) {
    return c.json({ error: "messages are required" }, 400)
  }

  if (c.env.MOCK_AI === "true") {
    return mockStream(MOCK_CHAT_SUMMARY)
  }

  const openai = getOpenAI(c.env)

  const transcript = messages
    .map((m) => `[${m.author} @ ${m.createdAt}]: ${m.content}`)
    .join("\n")

  const stream = await openai.chat.completions.create({
    model: "gpt-4o",
    stream: true,
    messages: [
      {
        role: "system",
        content: `You are ProjectPilot's chat summariser. Extract structured intelligence from a project team chat.

Output a concise structured summary with these sections:
## Decisions Made
## New Tasks Identified
## Blockers Raised
## Unresolved Questions
## Rubric Risk Signals

For Rubric Risk Signals: flag any criterion from the list that was dropped, forgotten, or at risk based on the conversation.

Be specific — quote names and concrete details. Keep each bullet to one sentence.`,
      },
      {
        role: "user",
        content: `Project: ${projectTitle}
Rubric criteria to watch: ${criteria.join(", ")}

Chat transcript:
${transcript}`,
      },
    ],
  })

  return streamToResponse(stream)
})

// POST /api/chat/scan
// Body: { message: string, criteria: string[] }
// Returns: { flagged: boolean, reason: string | null }
// Called passively on each new message to detect risk signals
chatRoute.post("/scan", async (c) => {
  const { message, criteria } = await c.req.json<{
    message: string
    criteria: string[]
  }>()

  if (c.env.MOCK_AI === "true") {
    // Flag ~1 in 4 messages to simulate realistic passive detection
    const shouldFlag = Math.random() < 0.25
    return c.json(shouldFlag ? MOCK_CHAT_SCAN_FLAGGED : MOCK_CHAT_SCAN_CLEAR)
  }

  const openai = getOpenAI(c.env)

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are a rubric risk scanner. Given a single chat message and a list of rubric criteria, determine if the message contains a risk signal — e.g. someone dropping a criterion, saying they can't finish something, or a deadline being missed.

Return strictly valid JSON: {"flagged": boolean, "reason": "<short reason or null>"}`,
      },
      {
        role: "user",
        content: `Criteria: ${criteria.join(", ")}\n\nMessage: ${message}`,
      },
    ],
    response_format: { type: "json_object" },
  })

  const result = JSON.parse(response.choices[0].message.content ?? '{"flagged":false,"reason":null}')
  return c.json(result)
})
