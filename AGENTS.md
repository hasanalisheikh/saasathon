# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project overview
- Product: Monad (scope-change analysis + approval workflow for client requests).
- Monorepo: Bun workspaces + Turborepo.
- Main app: `apps/web` (Next.js App Router + Supabase + API routes).
- Shared packages:
  - `packages/ui` (shared UI components/styles)
  - `packages/widget` (embeddable browser comment widget compiled to `apps/web/public/widget.js`)

## Critical context from existing project rules/docs
- `CLAUDE.md` points to `monad-prd.md` as the canonical product reference; read that first for product intent before major changes.
- For local UI work, prefer `MOCK_AI=true` to avoid live OpenRouter calls.
- Client approval is public via `/approve/[token]` and backend approval handling uses Supabase service-role access; do not add auth requirements to the approval path.
- GitHub integration is based on a GitHub App flow (installations + webhooks), not personal access tokens.

## Common commands
Run from repository root unless noted.

### Install and run
- Install dependencies: `bun install`
- Start dev (all workspace dev tasks via turbo): `bun run dev`
- Start only web app dev server: `bun run --cwd apps/web dev`

### Quality and build
- Build all workspaces: `bun run build`
- Lint all workspaces: `bun run lint`
- Typecheck all workspaces: `bun run typecheck`
- Format all workspaces: `bun run format`

### Tests
- Run default test suite (currently targets `apps/web`): `bun run test`
- Run all tests in web app directly: `bun run --cwd apps/web test`
- Run a single test file from repo root: `bun test apps/web/lib/github.test.ts`
- Run a single API route test file: `bun test apps/web/app/api/ai/analyse/route.test.ts`

### Widget package
- Build widget once: `bun run --cwd packages/widget build`
- Watch/rebuild widget during development: `bun run --cwd packages/widget dev`

## Environment and runtime configuration
- Copy example env: `apps/web/.env.local.example` -> `apps/web/.env.local`.
- App runtime expects Supabase + app URL variables at minimum; many API paths hard-fail when required env is missing.
- Integration readiness checks are centralized in `apps/web/lib/integrations.ts` and env parsing/placeholder detection lives in `apps/web/lib/env.ts`.

## High-level architecture

### 1) Web app structure (Next.js App Router)
- Public routes (landing/auth/approval) are under `apps/web/app`.
- Authenticated product UI is grouped under `apps/web/app/(dashboard)`.
- Backend endpoints are route handlers under `apps/web/app/api/**/route.ts`.
- Middleware in `apps/web/middleware.ts` enforces auth for non-public pages while allowing `/approve/*` and `/api/*`.

### 2) Data + auth layer (Supabase)
- Supabase clients:
  - Request-scoped user client: `apps/web/lib/supabase/server.ts` (`createClient`)
  - Service-role client for privileged operations: `createServiceClient`
  - Browser client for client components: `apps/web/lib/supabase/client.ts`
- Base schema starts in `supabase/migrations/001_monad_schema.sql`.
- Later migrations add:
  - Document ingestion + extracted text + request task tracking (`007_documents_and_task_sync.sql`)
  - GitHub App support fields (`009_github_app_support.sql`)
  - Slack workspace/channel linkage (`011_slack_integration.sql`, `012_slack_thread.sql`)

### 3) Core request lifecycle (most important flow)
1. A request is created from manual input, inbound email, Slack webhook, or widget conversion.
2. AI analysis runs via `analyseAndPersistRequest` (`apps/web/lib/request-analysis.ts`), which:
   - validates baseline scope context (scope text/structured scope/documents),
   - calls AI contract logic (`apps/web/lib/ai.ts` + `apps/web/lib/ai-contract.ts`) or mock mode,
   - persists classification, costs, reasoning, draft reply, and generated tasks.
3. Client approves via public token page (`apps/web/app/approve/[token]/page.tsx` + `/api/approve/[token]`):
   - request marked approved/declined,
   - request tasks ensured,
   - optional GitHub issue created,
   - optional developer notification email sent.
4. GitHub webhooks (`apps/web/app/api/webhooks/github/route.ts`) sync implementation progress:
   - map PR/issue activity to Monad task markers,
   - update request implementation status,
   - optionally notify client when tasks complete.

### 4) AI boundary
- All prompt/response contracts are centralized in `apps/web/lib/ai-contract.ts`.
- `apps/web/lib/ai.ts` is the provider adapter (OpenRouter-compatible OpenAI SDK client).
- Keep strict JSON response parsing intact; many downstream assumptions rely on parsed shape and enum normalization.

### 5) Integrations subsystem
- Integrations UI is in `apps/web/app/(dashboard)/integrations`.
- GitHub connection state + OAuth/install helper logic is in:
  - `apps/web/lib/github.ts`
  - `apps/web/lib/github-app.ts`
  - `apps/web/lib/github-config.ts`
- Slack OAuth + signature verification utilities are in `apps/web/lib/slack.ts`; Slack inbound events enter via `/api/webhooks/slack`.

### 6) Documents and proof artifacts
- Document upload/extraction lives in `apps/web/app/api/documents/route.ts` and `apps/web/lib/documents.ts`.
- Extracted document text is fed into request analysis context.
- Proof-pack PDF generation is in `apps/web/lib/proof-pdf.tsx`, served by `/api/requests/[requestId]/proof`.

## Testing notes for contributors/agents
- Tests use Bun’s test runner (`bun:test`).
- Existing coverage focuses on route handlers and integration/env utilities (see `apps/web/app/api/**/route.test.ts` and `apps/web/lib/*.test.ts`).
- When adding/changing request lifecycle logic, update or add tests near impacted routes/lib modules rather than only UI-level checks.
