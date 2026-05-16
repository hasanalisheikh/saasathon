# Monad

AI-powered scope creep protection for freelance developers and small agencies.

Monad turns client requests into structured, priced, approved change orders before the work starts. It analyzes each request against the original project scope, drafts a professional client response, captures approval, and links the approved work to GitHub so there is a clear audit trail from ask to implementation.

Built during SaaSathon 2026 as a full-stack productivity SaaS MVP.

## The Problem

Freelancers and agencies lose margin when client requests arrive casually through Slack, email, or quick calls:

- "Can we just add bookings?"
- "Could this also support online ordering?"
- "Should be quick since you are already in the codebase."

Those asks often become unpaid work because the developer has to choose between protecting scope and preserving the client relationship. Monad gives them a system that catches the request, explains the impact, and gets approval before implementation begins.

## What Monad Does

Monad provides an end-to-end workflow for scope-change management:

1. A client request is captured from manual entry, Slack, or email.
2. AI compares the request against the project scope, documents, exclusions, hourly rate, and task categories.
3. Monad classifies the request as in scope, out of scope, ambiguous, or needing clarification.
4. It generates evidence, technical breakdown, effort range, cost estimate, timeline impact, task list, and a client-ready reply.
5. The developer reviews and sends a public approval link.
6. The client approves or declines without logging in.
7. Approved work can create a GitHub issue and update the project audit trail.

## Product Highlights

- AI scope analysis using a strict JSON contract and OpenRouter-compatible provider adapter.
- Public approval flow with service-role Supabase handling, designed so clients never need product accounts.
- Slack intake and reply workflow for capturing real client messages where they already happen.
- GitHub App integration for installation flow, repo linking, issue creation, and webhook-based progress updates.
- Document ingestion so contracts, scope briefs, and supporting files can inform analysis.
- Proof-pack PDF generation for project history, evidence, estimates, and approval records.
- Dashboard metrics for protected revenue, pending requests, approval rate, and project activity.

## Tech Stack

- Next.js App Router
- TypeScript
- React 19
- Tailwind CSS v4
- Bun workspaces
- Turborepo
- Supabase Auth, Postgres, Storage, and RLS
- OpenRouter-compatible AI integration
- GitHub App API and webhooks
- Slack OAuth and signed webhooks
- Resend and Postmark integration points
- React PDF rendering

## Repository Structure

```text
apps/web              Main Next.js SaaS application
packages/ui           Shared design system and UI components
supabase/migrations   Database schema, RLS, and integration migrations
monad-prd.md          Product requirements and demo narrative
```

## Key Routes

- `/dashboard` - product overview, inbox, metrics, and active projects
- `/projects` - project setup, scope context, request history, and integrations
- `/projects/[id]/requests/[requestId]` - AI analysis review and client reply workflow
- `/approve/[token]` - public client approval page
- `/integrations` - GitHub and Slack connection status
- `/api/ai/analyse` - request analysis endpoint
- `/api/webhooks/slack` - Slack inbound request capture
- `/api/webhooks/github` - GitHub implementation progress sync

## Local Development

Install dependencies:

```bash
bun install
```

Create local environment variables:

```bash
cp apps/web/.env.local.example apps/web/.env.local
```

For local UI work without live AI calls, set:

```bash
MOCK_AI=true
```

Start the full workspace:

```bash
bun run dev
```

Start only the web app:

```bash
bun run --cwd apps/web dev
```

## Quality Checks

```bash
bun run test
bun run typecheck
bun run lint
bun run build
```

## Environment Notes

The app expects Supabase configuration for auth, database, and storage. AI analysis can run either through an OpenRouter API key or with `MOCK_AI=true` for local development.

Production integrations are optional but supported:

- GitHub App credentials for repo linking, issue creation, and webhooks
- Slack app credentials for OAuth, channel linking, and inbound request capture
- Resend and Postmark credentials for outbound and inbound email workflows

## Demo Scenario

The core demo follows a freelance developer receiving a casual client request to add online ordering, bookings, loyalty points, and reminder emails to a fixed-scope restaurant website.

Monad classifies the request as out of scope, surfaces the scope evidence, estimates the added cost and timeline, drafts a professional response, sends an approval link, and turns client approval into a GitHub-linked implementation record.

## Why This Project Matters

Monad is built around a practical productivity problem: protecting client relationships while making unpaid scope creep visible before it becomes lost revenue. The product combines AI reasoning, approval workflow, collaboration tools, and implementation tracking into one focused SaaS experience.
