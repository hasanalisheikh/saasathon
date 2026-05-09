# Monad — Developer Guide

> **Guiding document: [`monad-prd.md`](monad-prd.md)** — this is the canonical PRD. Read it first. Everything below is a quick-reference summary.

> AI-powered scope creep protection for freelance developers and agencies.
> Built for SaaSathon 2026 (40-hour hackathon).

---

## What Monad Does

Monad intercepts client requests, analyses them against the agreed project scope using Gemini 3.1 Flash Lite via OpenRouter, generates a professional cost estimate, gets client approval with one click, and creates a GitHub-linked audit trail. The entire flow from intake → analysis → approval → GitHub takes under 5 minutes.

**Tagline:** "Drop in the request. We handle the rest."

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + custom design tokens |
| Components | shadcn/ui (`@workspace/ui` package) |
| Database | Supabase (Postgres + Auth + Realtime) |
| AI | OpenRouter `google/gemini-3.1-flash-lite` |
| MVP intake | Manual paste now, Slack next |
| Optional email | Resend + Postmark (deferred from MVP) |
| GitHub | GitHub App + REST API |
| PDF | @react-pdf/renderer |
| Deployment | Vercel |
| Monorepo | Turborepo + Bun workspaces |

---

## Repo Layout

```
monad/
├── apps/web/                  # Next.js app (the entire product)
│   ├── app/
│   │   ├── page.tsx           # Landing page
│   │   ├── (auth)/            # Login + signup (no sidebar)
│   │   ├── (dashboard)/       # Protected app (with sidebar)
│   │   │   ├── layout.tsx     # Sidebar + auth check
│   │   │   ├── dashboard/     # Inbox + metrics
│   │   │   ├── projects/      # Project list + new wizard + detail
│   │   │   └── settings/
│   │   ├── approve/[token]/   # PUBLIC client approval page (no login)
│   │   └── api/               # All API routes
│   ├── lib/
│   │   ├── supabase/          # client.ts, server.ts, middleware.ts
│   │   ├── ai.ts              # OpenRouter-compatible AI wrapper: analyseRequest, extractScope, translateCommits
│   │   ├── github.ts          # createIssue, registerWebhook, listUserRepos
│   │   ├── resend.ts          # sendApprovalEmail
│   │   ├── postmark.ts        # extractInboundEmail
│   │   └── utils.ts           # cn, formatCurrency, generateInboundEmail
│   └── types/index.ts         # All TypeScript types
├── packages/
│   ├── ui/                    # shadcn/ui components + Monad design tokens (globals.css)
└── supabase/
    ├── migrations/001_monad_schema.sql
    └── migrations/002_monad_rls.sql
```

---

## Design System

**"Precision finance meets developer tooling."** Think Linear × Stripe.

Always dark. No light mode.

```
Backgrounds:  #080c14 (base) → #0f1624 (surface) → #161e2e (elevated) → #1c2538 (subtle)
Amber accent: #f59e0b (primary) — money, protection, revenue
Green:        #10b981 — approved, in scope
Red:          #ef4444 — out of scope, declined
Text:         #f0f4ff (primary) / #8892a4 (secondary) / #4a5568 (muted)
Fonts:        Fraunces (headings, display numbers) + DM Mono (UI, body, code)
```

Classification badge colours:
- `IN SCOPE` → green
- `OUT OF SCOPE` → red
- `AMBIGUOUS` → amber
- `CLARIFY` → blue

---

## Database (Supabase)

Tables: `profiles`, `projects`, `requests`, `github_events`

Key fields on `requests`:
- `classification` — `in_scope | out_of_scope | ambiguous | clarification_needed`
- `status` — `pending_review | sent_to_client | approved | declined | deferred | accepted_in_scope`
- `approval_token` — UUID used in the public `/approve/[token]` URL
- `cost_min / cost_max` — computed from effort hours × hourly rate

RLS: all tables are locked to the owning developer via `user_id`. The `/api/approve/[token]` route uses `SUPABASE_SERVICE_ROLE_KEY` (server-only) to bypass RLS for client approvals.

---

## Environment Variables

Copy `apps/web/.env.local.example` → `apps/web/.env.local` and fill in:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
OPENROUTER_API_KEY
AI_MODEL=google/gemini-3.1-flash-lite
RESEND_API_KEY
RESEND_FROM_EMAIL
POSTMARK_INBOUND_WEBHOOK_TOKEN
GITHUB_APP_ID
GITHUB_APP_CLIENT_ID
GITHUB_APP_CLIENT_SECRET
GITHUB_APP_PRIVATE_KEY
GITHUB_APP_SLUG
GITHUB_APP_WEBHOOK_SECRET
NEXT_PUBLIC_APP_URL
INBOUND_EMAIL_DOMAIN
MOCK_AI=true   ← set this during dev to skip AI calls
```

---

## Running Locally

```bash
bun install
bun dev         # starts apps/web on :3000
```

---

## Key API Routes

| Route | Method | Purpose |
|---|---|---|
| `/api/ai/analyse` | POST | Run Gemini scope analysis on a request |
| `/api/ai/extract-scope` | POST | Turn raw scope text into structured JSON |
| `/api/projects` | POST/GET | Create / list projects |
| `/api/projects/[id]` | GET/PATCH | Get / update project |
| `/api/requests/[requestId]` | GET/PATCH | Get / update request |
| `/api/email/send` | POST | Optional approval email route via Resend |
| `/api/approve/[token]` | POST | Handle client approve/decline (no auth) |
| `/api/github/install` | GET | Start GitHub App installation flow |
| `/api/github/setup` | GET | Handle GitHub App setup redirect |
| `/api/github/auth/callback` | GET | Verify installation via GitHub App user auth |
| `/api/github/create-issue` | POST | Manually create GitHub issue |
| `/api/webhooks/email` | POST | Optional Postmark inbound webhook |
| `/api/webhooks/github` | POST | GitHub webhook (PR merged, issue closed) |

---

## Demo Flow (Sprint 1 target)

1. Open dashboard → inbox shows Marcus's request with amber badge
2. Click request → Request Review Screen (60/40 split)
3. AI shows: OUT OF SCOPE · 94% confidence · evidence quotes · $3,240–$5,400
4. Click "Mark ready to share →"
5. Marcus receives the scoped reply in Slack with one green "Approve →" link
6. Marcus clicks Approve → GitHub issue created → proof pack updates
7. Dashboard shows: **"Unbilled work protected: $4,320"**

---

## Dev Notes

- `MOCK_AI=true` returns hardcoded analysis without calling OpenRouter — use this for all UI work
- The `/approve/[token]` page is fully public — no login required
- GitHub is project-scoped through a GitHub App installation, not a personal token
- Manual paste input on the project page is the live MVP path while Slack intake is being wired up
- All monetary values stored as integers (cents → whole dollars with hourly rate × hours)

---

## Team Split (PRD reference)

- **Person A** — Frontend/UX: design system, landing, auth, dashboard, Request Review Screen, Approval Page
- **Person B** — Backend/AI: Supabase, OpenRouter/Gemini, GitHub API, approval handler, PDF, Slack-ready intake architecture
- **Person C** — Full Stack: project wizard, project detail, request history, settings, analytics
