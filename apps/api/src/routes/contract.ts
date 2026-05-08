import { Hono } from "hono"
import { getOpenAI } from "../lib/openai"
import { MOCK_CONTRACT_VALIDATE_RESPONSE, MOCK_CONTRACT_TIME_RESPONSE } from "../lib/mock"
import type { Env } from "../index"

export const contractRoute = new Hono<{ Bindings: Env }>()

// POST /api/contract/validate
// Body: { taskTitle, taskDescription, criterionName, criterionDescription, proof }
// Returns: { verdict, reason, suggestion }
contractRoute.post("/validate", async (c) => {
  const { taskTitle, taskDescription, criterionName, criterionDescription, proof } =
    await c.req.json<{
      taskTitle: string
      taskDescription: string
      criterionName: string
      criterionDescription: string
      proof: string
    }>()

  if (!proof || !criterionName) {
    return c.json({ error: "proof and criterionName are required" }, 400)
  }

  if (c.env.MOCK_AI === "true") {
    return c.json(MOCK_CONTRACT_VALIDATE_RESPONSE)
  }

  const openai = getOpenAI(c.env)

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are ProjectPilot's proof validation engine. A student has submitted proof of completing a task linked to a rubric criterion. Assess whether the proof satisfies the criterion.

Return strictly valid JSON:
{
  "verdict": "satisfied|partial|unsatisfied",
  "reason": "<1-2 sentences explaining the verdict>",
  "suggestion": "<actionable next step if partial or unsatisfied, null if satisfied>"
}

Be fair but rigorous. The goal is to help students, not gatekeep.`,
      },
      {
        role: "user",
        content: `Task: ${taskTitle}
Task description: ${taskDescription ?? "N/A"}

Rubric criterion: ${criterionName}
Criterion description: ${criterionDescription ?? "N/A"}

Student's proof:
${proof}`,
      },
    ],
    response_format: { type: "json_object" },
  })

  const result = JSON.parse(response.choices[0].message.content ?? "{}")
  return c.json(result)
})

// POST /api/contract/suggest-time
// Body: { taskTitle, taskDescription, criterionWeight, existingContracts }
// Returns: { suggestedHours, reasoning, warningIfAny }
contractRoute.post("/suggest-time", async (c) => {
  const { taskTitle, taskDescription, criterionWeight, existingContracts } =
    await c.req.json<{
      taskTitle: string
      taskDescription: string
      criterionWeight: number
      existingContracts: { deadline: string; hours: number }[]
    }>()

  if (c.env.MOCK_AI === "true") {
    return c.json(MOCK_CONTRACT_TIME_RESPONSE)
  }

  const openai = getOpenAI(c.env)

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are a study-time advisor. Suggest realistic work session hours for a student task.

Return strictly valid JSON:
{
  "suggestedHours": <number>,
  "reasoning": "<1 sentence>",
  "warning": "<dependency or bottleneck warning, or null>"
}`,
      },
      {
        role: "user",
        content: `Task: ${taskTitle}
Description: ${taskDescription ?? "N/A"}
Rubric weight: ${criterionWeight}%
Existing scheduled contracts: ${JSON.stringify(existingContracts)}`,
      },
    ],
    response_format: { type: "json_object" },
  })

  const result = JSON.parse(response.choices[0].message.content ?? "{}")
  return c.json(result)
})
