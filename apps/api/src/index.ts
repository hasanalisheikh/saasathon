import { Hono } from "hono"
import { cors } from "hono/cors"
import { briefRoute } from "./routes/brief"
import { riskRoute } from "./routes/risk"
import { contractRoute } from "./routes/contract"
import { chatRoute } from "./routes/chat"
import { submissionRoute } from "./routes/submission"

export type Env = {
  OPENAI_API_KEY: string
  SUPABASE_URL: string
  SUPABASE_SERVICE_ROLE_KEY: string
  ALLOWED_ORIGIN: string
}

const app = new Hono<{ Bindings: Env }>()

app.use("*", async (c, next) => {
  const handler = cors({
    origin: c.env.ALLOWED_ORIGIN ?? "*",
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  })
  return handler(c, next)
})

app.get("/", (c) => c.json({ status: "ok", service: "ProjectPilot API" }))

app.route("/api/brief", briefRoute)
app.route("/api/risk", riskRoute)
app.route("/api/contract", contractRoute)
app.route("/api/chat", chatRoute)
app.route("/api/submission", submissionRoute)

export default app
