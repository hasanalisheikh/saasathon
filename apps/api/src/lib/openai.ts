import OpenAI from "openai"
import type { Env } from "../index"

export function getOpenAI(env: Env) {
  return new OpenAI({ apiKey: env.OPENAI_API_KEY })
}

export function streamToResponse(stream: AsyncIterable<OpenAI.Chat.ChatCompletionChunk>) {
  const encoder = new TextEncoder()

  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content ?? ""
          if (text) controller.enqueue(encoder.encode(text))
        }
      } finally {
        controller.close()
      }
    },
  })

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
      "X-Content-Type-Options": "nosniff",
    },
  })
}
