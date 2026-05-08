# ProjectPilot — Team Setup Guide

## Prerequisites
- [Bun](https://bun.sh) installed
- [Supabase CLI](https://supabase.com/docs/guides/cli) installed (`brew install supabase/tap/supabase`)
- Node >= 20

---

## 1. Install dependencies

```bash
bun install
```

---

## 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → New project
2. Note your **Project URL** and **anon key** (Settings → API)
3. Note your **service role key** (Settings → API → Service Role — keep this secret)

---

## 3. Run the database migrations

In your Supabase project dashboard → SQL Editor, run these files **in order**:

```
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_tier_and_storage.sql
```

Paste each file's contents and click **Run**.

---

## 4. Set up environment variables

### Web app (`apps/web/.env.local`)
```bash
cp apps/web/.env.local.example apps/web/.env.local
```
Fill in:
- `NEXT_PUBLIC_SUPABASE_URL` — your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — your anon key
- `NEXT_PUBLIC_SITE_URL` — `http://localhost:3000` for local dev
- `NEXT_PUBLIC_API_URL` — `http://localhost:8787` for local dev

### API (`apps/api/.dev.vars`)
```bash
cp apps/api/.dev.vars.example apps/api/.dev.vars
```
Fill in:
- `OPENAI_API_KEY` — your OpenAI key (or leave `MOCK_AI=true` to skip)
- `SUPABASE_URL` — same as above
- `SUPABASE_SERVICE_ROLE_KEY` — your service role key
- `ALLOWED_ORIGIN` — `http://localhost:3000`

---

## 5. Run locally

```bash
# Terminal 1 — Next.js web app (localhost:3000)
bun dev --filter=web

# Terminal 2 — Hono API on Cloudflare Workers (localhost:8787)
bun dev --filter=api
```

---

## 6. Deploy

### Web → Vercel
1. Go to [vercel.com](https://vercel.com) → New Project → import this repo
2. Set **Root Directory** to `apps/web`
3. Add the same env vars from step 4 in Vercel's dashboard
4. Deploy

### API → Cloudflare Workers
```bash
cd apps/api
wrangler secret put OPENAI_API_KEY
wrangler secret put SUPABASE_URL
wrangler secret put SUPABASE_SERVICE_ROLE_KEY
wrangler deploy
```

---

## Architecture

```
apps/web/          Next.js App Router — all UI + auth + server actions for CRUD
apps/api/          Hono on Cloudflare Workers — all AI routes (OpenAI streaming)
packages/ui/       Shared shadcn/ui components
supabase/          Database migrations + config
```

**Data flow:**
- UI reads data → Supabase JS client (direct, fast, real-time capable)
- UI mutates data → Next.js server actions → Supabase
- UI triggers AI → `lib/api.ts` → Hono API → OpenAI (streaming)

**Feature areas & page routes:**
| Feature | Route |
|---|---|
| Project list | `/dashboard` |
| New project + brief ingestion | `/projects/new` |
| Task board | `/projects/[id]` |
| Mark-risk dashboard | `/projects/[id]/risk` |
| Focus contracts | `/projects/[id]/contracts` |
| Team chat + summariser | `/projects/[id]/chat` |
| Final submission checker | `/projects/[id]/submission` |
| Project settings / invite | `/projects/[id]/settings` |

**Tier gating:**
- User tier stored in `profiles.tier` (free | pro | org)
- Check with `useUser()` hook → `user.tier`
- Gate features in the UI component — don't rely only on API

---

## Who builds what (suggested split)

| Engineer | Features |
|---|---|
| 1 | Brief ingestion → task board → risk dashboard |
| 2 | Focus contracts → team pulse → Pin of Shame |
| 3 | Chat + summariser → submission checker → settings/invite |
