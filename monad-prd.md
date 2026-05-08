# MONAD — Product Requirements Document
### Version 1.0 | SaaSathon 2026 | 40-Hour Build

---

## THE DEMO SCENARIO (Memorise This)

> Use this story to open the pitch. It is built from real data.

---

**"Three words destroyed Jamie's year."**

Jamie is a freelance developer. Two years in. Charges $90/hour. Has six clients. Loves the work.

In March, a client named Marcus — a restaurant owner — hired Jamie to build a website. Five pages, contact form, basic SEO. $3,600 fixed. Agreed in writing. Project started.

Week three, Marcus emails:

*"Hey Jamie! The site is looking amazing. Quick thing — could we also add online ordering, table bookings, a loyalty points system, and automated email reminders for reservations? Should be pretty quick since you're already in the codebase!"*

Jamie knows this is not quick. Jamie knows this is $4,000 of extra work. But Marcus has been a good client. Jamie doesn't want to seem difficult. Jamie doesn't want to lose the relationship.

So Jamie types three words:

**"Sure, no problem."**

That decision cost Jamie 47 hours of unpaid work.

---

**That story is not unusual. It is the industry norm.**

- <u>57% of agencies lose $1,000–$5,000 every single month</u> to unbilled scope creep *(Ignition, 2025)*
- <u>Only 1% of agencies successfully bill for all out-of-scope work</u> *(Ignition, 2025)*
- <u>The average freelancer loses $7,800–$15,600 per year</u> to unpaid work *(MicroGaps, 2026)*
- <u>52% of all projects experience scope creep</u> *(PMI Pulse of the Profession)*
- <u>80%+ of freelancers experience scope creep</u> on most projects — the highest rate of any industry
- Scope creep costs <u>10–50% of total project revenue</u>

The reason Jamie said yes is not weakness. It is not poor business sense. It is that Jamie had no system. No tool caught the request before Jamie responded. No professional framing made the conversation easy. No evidence trail existed.

**Scope creep is not a discipline problem. It is an infrastructure problem.**

Monad is the infrastructure.

---

**Demo flow (live, in front of crowd):**

1. Open Monad dashboard — show one active project: "Marcus — Restaurant Website"
2. Show the client email arriving in the Monad inbox: *"Can you add bookings, loyalty points, ordering..."*
3. Show AI analysis firing: Out of scope. Evidence. Cost estimate: $3,800–$4,600. Timeline +8 days.
4. Developer reviews. One click: Send to client.
5. Show Marcus receiving a professional email with the breakdown and a single green Approve button.
6. Marcus clicks Approve. GitHub issue appears in real repo. Proof pack updates.
7. Pull up the dashboard: **"Unbilled work protected this session: $4,200."**

Pause. Let that land. Then: *"That is Monad."*

---

---

# PART 1: PRODUCT OVERVIEW

## 1.1 Product Name
**Monad**

*From mathematics and philosophy: a monad is a single, indivisible unit — the fundamental building block. In Haskell, a monad is a clean abstraction layer that wraps complexity and surfaces only what matters. Monad is the single layer between the developer and the client where every request, approval, and piece of work becomes legible, scoped, and protected.*

## 1.2 Tagline
**"Clients email you like normal. We handle the rest."**

Secondary: *"The layer between what clients ask for and what developers build."*

## 1.3 One-Line Pitch
Monad is an AI-powered change management layer for freelance developers and agencies that intercepts client requests, analyses them against agreed project scope, generates professional cost estimates, gets client approval before a single hour is spent, and creates a GitHub-linked audit trail from request to payment.

## 1.4 Target Users

**Primary (paying users):**
- Freelance developers (1–3 years experience, $50–$150/hr, 3–8 active clients)
- Small dev agencies (2–10 people)
- "Vibe coders" — AI-assisted developers taking on client work without formal PM experience
- Design and marketing agencies that contract development

**Secondary:**
- Consultants and creative agencies with recurring client work
- Any service business billing on fixed-price projects

**Non-users (but important):**
- Clients — they interact with Monad via email only. They never log in. They never know the platform exists unless the developer white-labels it.

---

# PART 2: ARCHITECTURE

## 2.1 Stack Decision

Every choice below was made for maximum build speed without sacrificing quality.

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 15 (App Router) | Monorepo, API routes, SSR, fast deployment |
| Language | TypeScript | Type safety, fewer runtime bugs in 48hrs |
| Styling | Tailwind CSS v4 | Fastest styling, consistent design tokens |
| Components | shadcn/ui | Production-grade, fully customisable |
| Database | Supabase (Postgres) | Auth + DB + Realtime + Storage in one |
| Auth | Supabase Auth | Built into the stack, fast to implement |
| AI | OpenAI API (gpt-4o) | Strong reasoning, free credits available |
| Email sending | Resend | Best DX, best deliverability |
| Email inbound | Postmark Inbound | Reliable inbound webhooks, easy parsing |
| GitHub | GitHub OAuth App + REST API + Webhooks | Real integration, impressive demo |
| PDF | @react-pdf/renderer | React-native PDF generation |
| Website widget | Vanilla JS bundle (esbuild) | Zero dependencies, embeds anywhere |
| Deployment | Vercel | Instant, free, GitHub-connected |
| Monorepo | Turborepo (optional if time allows) | Shared packages between app + widget |

## 2.2 Repository Structure

```
monad/
├── README.md
├── package.json                    # root workspace
├── turbo.json                      # optional
│
├── apps/
│   └── web/                        # Main Next.js application
│       ├── app/
│       │   ├── layout.tsx           # Root layout, fonts, theme
│       │   ├── page.tsx             # Landing page (public)
│       │   │
│       │   ├── (auth)/              # Auth group (no sidebar)
│       │   │   ├── login/
│       │   │   │   └── page.tsx
│       │   │   └── signup/
│       │   │       └── page.tsx
│       │   │
│       │   ├── (dashboard)/         # Protected app routes (with sidebar)
│       │   │   ├── layout.tsx       # Sidebar + topbar
│       │   │   ├── dashboard/
│       │   │   │   └── page.tsx     # Home — inbox + project overview
│       │   │   ├── projects/
│       │   │   │   ├── page.tsx     # Project list
│       │   │   │   ├── new/
│       │   │   │   │   └── page.tsx # Create project wizard
│       │   │   │   └── [id]/
│       │   │   │       ├── page.tsx # Project detail
│       │   │   │       ├── requests/
│       │   │   │       │   └── [requestId]/
│       │   │   │       │       └── page.tsx  # Request review screen
│       │   │   │       ├── github/
│       │   │   │       │   └── page.tsx
│       │   │   │       └── proof/
│       │   │   │           └── page.tsx
│       │   │   └── settings/
│       │   │       └── page.tsx
│       │   │
│       │   ├── approve/             # PUBLIC — client approval page
│       │   │   └── [token]/
│       │   │       └── page.tsx     # No login, single approve button
│       │   │
│       │   └── api/
│       │       ├── auth/            # Supabase auth callbacks
│       │       ├── webhooks/
│       │       │   ├── github/
│       │       │   │   └── route.ts # GitHub webhook receiver
│       │       │   └── email/
│       │       │       └── route.ts # Postmark inbound webhook
│       │       ├── ai/
│       │       │   └── analyse/
│       │       │       └── route.ts # Main OpenAI GPT-4o analysis endpoint
│       │       ├── github/
│       │       │   ├── connect/
│       │       │   │   └── route.ts # OAuth flow
│       │       │   └── create-issue/
│       │       │       └── route.ts # Create GitHub issue
│       │       ├── email/
│       │       │   └── send/
│       │       │       └── route.ts # Send approval email to client
│       │       ├── approve/
│       │       │   └── [token]/
│       │       │       └── route.ts # Handle client approval action
│       │       └── pdf/
│       │           └── route.ts     # Generate proof pack PDF
│       │
│       ├── components/
│       │   ├── ui/                  # shadcn base components
│       │   ├── layout/              # Sidebar, TopBar, PageHeader
│       │   ├── dashboard/           # DashboardInbox, ProjectCard, MetricCard
│       │   ├── projects/            # ProjectSetup, ScopeEditor, RateCard
│       │   ├── requests/            # RequestCard, AnalysisPanel, ReplyEditor
│       │   ├── github/              # GitHubConnect, IssueCard, CommitFeed
│       │   ├── approve/             # ClientApprovalPage, ApprovalConfirmation
│       │   └── shared/              # Logo, Badge, EmptyState, LoadingSpinner
│       │
│       ├── lib/
│       │   ├── supabase/            # Client, server, middleware
│       │   ├── openai.ts            # OpenAI API wrapper
│       │   ├── github.ts            # GitHub API wrapper
│       │   ├── resend.ts            # Email sending
│       │   ├── postmark.ts          # Inbound email parsing
│       │   ├── pdf.ts               # Proof pack generation
│       │   └── utils.ts             # Helpers, formatters
│       │
│       ├── types/
│       │   └── index.ts             # All TypeScript types
│       │
│       └── public/
│           └── widget/
│               └── monad.js         # Built widget bundle
│
└── packages/
    └── widget/                      # Website commenting widget
        ├── src/
        │   └── index.ts             # Vanilla JS widget source
        └── dist/
            └── monad-widget.js      # Bundled output
```

## 2.3 Database Schema (Supabase/Postgres)

```sql
-- Users (managed by Supabase Auth)
-- profiles extends auth.users
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  hourly_rate INTEGER DEFAULT 100,
  company_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_email TEXT,
  scope_raw TEXT,                    -- original pasted scope
  scope_structured JSONB,            -- AI-extracted scope profile
  inbound_email TEXT UNIQUE,         -- e.g. project-abc123@inbound.monad.app
  github_repo_id TEXT,               -- GitHub repo ID
  github_repo_name TEXT,             -- e.g. "user/repo"
  github_installation_id TEXT,
  hourly_rate INTEGER,               -- overrides profile rate
  task_categories JSONB,             -- [{name, min_hours, max_hours}]
  status TEXT DEFAULT 'active',      -- active, completed, archived
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Client Requests
CREATE TABLE requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  raw_email_subject TEXT,
  raw_email_body TEXT NOT NULL,
  raw_email_from TEXT,
  source TEXT DEFAULT 'email',       -- email, widget, manual
  
  -- AI Analysis
  classification TEXT,               -- in_scope, out_of_scope, ambiguous, clarification_needed
  confidence INTEGER,                -- 0-100
  scope_evidence TEXT[],             -- quoted lines from original scope
  technical_breakdown TEXT,          -- AI plain-English breakdown
  effort_min_hours INTEGER,
  effort_max_hours INTEGER,
  cost_min INTEGER,
  cost_max INTEGER,
  timeline_impact_days INTEGER,
  risk_level TEXT,                   -- low, medium, high
  
  -- Response
  draft_reply TEXT,
  final_reply TEXT,
  reply_tone TEXT DEFAULT 'professional',  -- friendly, firm, professional
  
  -- Status
  status TEXT DEFAULT 'pending_review',
  -- pending_review, sent_to_client, approved, declined, deferred, accepted_in_scope
  
  -- Approval
  approval_token TEXT UNIQUE DEFAULT gen_random_uuid()::TEXT,
  approval_page_viewed_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  approved_ip TEXT,
  declined_at TIMESTAMPTZ,
  client_understood_cost BOOLEAN DEFAULT FALSE,
  
  -- GitHub
  github_issue_number INTEGER,
  github_issue_url TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- GitHub Events (from webhooks)
CREATE TABLE github_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  request_id UUID REFERENCES requests(id),  -- null if unlinked
  event_type TEXT,                   -- pr_merged, issue_closed, push, deployment
  github_data JSONB,
  plain_english_summary TEXT,        -- AI-generated
  client_notified BOOLEAN DEFAULT FALSE,
  client_notified_at TIMESTAMPTZ,
  is_unapproved_work BOOLEAN DEFAULT FALSE,  -- flagged by AI
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Widget Comments
CREATE TABLE widget_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  page_url TEXT,
  element_selector TEXT,
  x_position FLOAT,
  y_position FLOAT,
  comment_text TEXT NOT NULL,
  client_name TEXT,
  converted_to_request_id UUID REFERENCES requests(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 2.4 Key AI Flows

### Scope Analysis Prompt (GPT-4o)
```
System: You are a professional project scope analyst for software development projects. 
You protect developers from unpaid work by analysing client requests against agreed project scope.
Always respond in valid JSON only. Do not include markdown code fences in your response.

User: 
PROJECT SCOPE:
{scope_raw}

EXTRACTED SCOPE PROFILE:
{scope_structured}

DEVELOPER RATE: ${hourly_rate}/hr
TASK CATEGORIES: {task_categories}

CLIENT REQUEST:
From: {client_email}
Subject: {email_subject}
Body: {email_body}

Analyse this request and return JSON:
{
  "classification": "in_scope|out_of_scope|ambiguous|clarification_needed",
  "confidence": 0-100,
  "scope_evidence": ["quote1", "quote2"],
  "technical_breakdown": "plain English explanation of what this technically requires",
  "tasks": [{"name": "", "description": "", "min_hours": 0, "max_hours": 0}],
  "effort_min_hours": 0,
  "effort_max_hours": 0,
  "risk_level": "low|medium|high",
  "timeline_impact_days": 0,
  "reasoning": "why this is in/out of scope",
  "draft_reply": "professional email reply",
  "suggested_action": "accept|quote_separately|clarify|decline"
}
```

### OpenAI Wrapper (`lib/openai.ts`)
```typescript
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function analyseRequest(params: {
  scopeRaw: string
  scopeStructured: object
  hourlyRate: number
  taskCategories: object[]
  emailFrom: string
  emailSubject: string
  emailBody: string
}) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    response_format: { type: 'json_object' },  // enforces JSON output
    temperature: 0.2,                           // low temp = consistent analysis
    messages: [
      {
        role: 'system',
        content: `You are a professional project scope analyst for software development projects.
You protect developers from unpaid work by analysing client requests against agreed scope.
Always respond in valid JSON only. Do not include markdown code fences.`
      },
      {
        role: 'user',
        content: `PROJECT SCOPE:\n${params.scopeRaw}\n\n
EXTRACTED SCOPE:\n${JSON.stringify(params.scopeStructured)}\n\n
DEVELOPER RATE: $${params.hourlyRate}/hr\n
TASK CATEGORIES: ${JSON.stringify(params.taskCategories)}\n\n
CLIENT REQUEST:\nFrom: ${params.emailFrom}\nSubject: ${params.emailSubject}\nBody: ${params.emailBody}\n\n
Return JSON with: classification, confidence, scope_evidence, technical_breakdown, tasks, effort_min_hours, effort_max_hours, risk_level, timeline_impact_days, reasoning, draft_reply, suggested_action`
      }
    ]
  })

  const content = response.choices[0].message.content
  return JSON.parse(content!)
}

export async function translateCommits(commits: string[]): Promise<string> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    temperature: 0.3,
    messages: [
      {
        role: 'user',
        content: `Translate these GitHub commits into 1-2 sentences of plain English for a non-technical client. Focus on what changed for them, not how.\n\nCommits:\n${commits.join('\n')}`
      }
    ]
  })
  return response.choices[0].message.content!
}
```

### GitHub Commit Translation Prompt (GPT-4o)
```
Translate these GitHub commits into 1-2 sentences of plain English 
for a non-technical client. Focus on what changed for them, not how.
Commits: {commits}
```

---

# PART 3: DESIGN SYSTEM

## 3.1 Design Direction

**"Precision finance meets developer tooling."**

Monad should feel like the love child of Linear and Stripe. Not a startup toy. Not a colourful SaaS. A serious tool that developers trust with their money and their client relationships. Every pixel communicates: *this is professional, this is controlled, this protects you.*

The single unforgettable quality: **every element feels like it belongs to a system**. Nothing is decorative without purpose. The density is high but never cluttered. The dark background signals seriousness. The amber accent signals value — money, protection, revenue.

## 3.2 Colour Tokens

```css
:root {
  /* Backgrounds */
  --bg-base:        #080c14;   /* Near-black navy — deepest background */
  --bg-surface:     #0f1624;   /* Cards, panels */
  --bg-elevated:    #161e2e;   /* Modals, dropdowns */
  --bg-subtle:      #1c2538;   /* Hover states, dividers */

  /* Amber accent system — revenue, money, protection */
  --amber-500:      #f59e0b;   /* Primary accent */
  --amber-400:      #fbbf24;   /* Hover states */
  --amber-600:      #d97706;   /* Active, pressed */
  --amber-100:      #fef3c7;   /* Amber text on dark */
  --amber-900-10:   rgba(245,158,11,0.10); /* Amber tint background */
  --amber-900-20:   rgba(245,158,11,0.20); /* Amber badge bg */

  /* Status colours */
  --green-500:      #10b981;   /* In scope, approved, completed */
  --red-500:        #ef4444;   /* Out of scope, declined */
  --yellow-500:     #f59e0b;   /* Ambiguous (same as amber) */
  --blue-500:       #3b82f6;   /* Info, GitHub */

  /* Text */
  --text-primary:   #f0f4ff;   /* Main content */
  --text-secondary: #8892a4;   /* Metadata, labels */
  --text-muted:     #4a5568;   /* Disabled, placeholders */

  /* Borders */
  --border-subtle:  rgba(255,255,255,0.06);
  --border-default: rgba(255,255,255,0.10);
  --border-strong:  rgba(255,255,255,0.18);
}
```

## 3.3 Typography

```css
/* Display / headings — editorial, trustworthy, slightly literary */
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,400;0,600;1,300&display=swap');

/* UI / body — developer-native, precise, readable at small sizes */
@import url('https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&display=swap');

/* Scale */
--font-display:   'Fraunces', Georgia, serif;
--font-ui:        'DM Mono', 'Fira Code', monospace;

--text-xs:    11px / 16px
--text-sm:    13px / 20px
--text-base:  14px / 22px
--text-lg:    16px / 24px
--text-xl:    20px / 28px
--text-2xl:   28px / 36px
--text-3xl:   40px / 48px
```

## 3.4 Logo

A single geometric "monad" — a filled circle (representing the developer's project) with three short lines radiating at 30°, 150°, and 270°, suggesting the three connections: client email, GitHub, and proof. Clean. Minimal. Memorable.

```svg
<svg width="32" height="32" viewBox="0 0 32 32" fill="none">
  <!-- Central node -->
  <circle cx="16" cy="16" r="4" fill="#f59e0b"/>
  <!-- Three radiating lines -->
  <line x1="16" y1="12" x2="16" y2="4"  stroke="#f59e0b" stroke-width="2" stroke-linecap="round"/>
  <line x1="20" y1="18.9" x2="27" y2="23" stroke="#f59e0b" stroke-width="2" stroke-linecap="round"/>
  <line x1="12" y1="18.9" x2="5" y2="23"  stroke="#f59e0b" stroke-width="2" stroke-linecap="round"/>
</svg>
```

Wordmark: "monad" in lowercase DM Mono, font-weight 500, letter-spacing 0.08em.

## 3.5 Component Patterns

**Classification badges:**
```
IN SCOPE    → green bg (10% opacity), green text, green border
OUT OF SCOPE → red bg, red text, red border
AMBIGUOUS   → amber bg, amber text, amber border
CLARIFY     → blue bg, blue text, blue border
```

**Request cards:**
- Monospace metadata (time, source, client)
- Left border colour = classification colour
- Hover: subtle bg lift + border brightens

**Key interaction:** The Request Review Screen is the hero. Left panel = raw email. Right panel = AI analysis. This split should feel like a cockpit — dense, information-rich, every piece of data having a reason to be there.

---

# PART 4: FEATURES (ALL IDEAS, PRIORITISED)

## Sprint 1 — DEMO MVP (Must ship by demo time)

These are non-negotiable. If nothing else works, these must be flawless.

### F1. Authentication
- Email + password signup/login via Supabase Auth
- Protected route middleware
- Auto-redirect to dashboard after login
- Demo account pre-seeded with data

### F2. Project Creation
- Project name, client name, client email
- Scope input (large text area — paste proposal, contract, bullet points)
- AI scope extraction on save: turns raw text into structured JSON scope profile
  - Deliverables array
  - Exclusions array
  - Revision limit
  - Timeline
  - Pricing model
- Rate card setup: hourly rate + task categories (name, min hours, max hours)
- Auto-generates unique inbound email address: `{project-slug}-{random6}@inbound.monad.app`
- Show forwarding instruction: "Forward or BCC client emails to this address"

### F3. Dashboard / Inbox
- List of projects with active request counts
- **Inbox section** — new unreviewed requests sorted by recency
- Each inbox card shows: client name, project, request preview, classification badge, time received
- "Unbilled work protected" metric (sum of cost estimates of out-of-scope approved requests)

### F4. Inbound Email Processing
- Postmark inbound webhook receives email sent to project address
- Parse: from, subject, body (strip HTML to plain text)
- Create `request` record in DB
- Trigger AI analysis automatically
- Notify developer (in-app — badge on inbox)
- **Fallback for demo if Postmark not ready:** Manual paste input on project page

### F5. AI Scope Analysis (The Hero Feature)
- Call GPT-4o with: raw scope, structured scope profile, rate card, task categories, client email
- Return: classification, confidence, evidence quotes, technical breakdown, task list, effort estimate, cost range, risk level, timeline impact, draft reply
- Store full analysis on request record
- < 8 second response target

### F6. Request Review Screen
This is the most important screen in the product. Make it beautiful.

**Layout:** Two-panel split (60/40)
- **Left panel:** Original client email, exact formatting, metadata (from, to, subject, timestamp, source badge)
- **Right panel:**
  - Classification badge (large, prominent — IN SCOPE / OUT OF SCOPE / AMBIGUOUS)
  - Confidence meter (0-100%, amber fill)
  - Scope evidence section: quoted lines from original scope highlighted in amber
  - Technical breakdown (what this actually involves, in plain English)
  - Effort estimate: "12–18 hours"
  - Cost range: "$960–$1,440" (in amber, large)
  - Timeline impact: "+3–5 days"
  - Risk level badge
  - Suggested action chip

**Draft reply section (below):**
  - Pre-written professional reply from AI
  - Editable textarea
  - Tone selector: Friendly / Professional / Firm
  - **Send to Client button** (primary CTA — amber, prominent)
  - Secondary: Mark as Accepted (in-scope) / Mark as Declined / Defer

### F7. Client Approval Email + Page
When developer clicks "Send to Client":
- Platform sends email via Resend from developer's address (or `noreply@monad.app`)
- Email contains:
  - Professional subject: "Re: [original subject] — Scope Review"
  - Developer's drafted reply
  - Clear breakdown box: what was requested, what it involves, cost estimate
  - Cost confirmation line: **"This work is estimated at $960–$1,440 and is outside the original project scope"**
  - One green button: **"Approve this work →"**
  - One secondary link: "Decline"
- Button links to: `https://monad.app/approve/{token}`

**Client approval page (`/approve/[token]`):**
- No login required
- Shows: project name, what was requested, technical breakdown, cost range
- Checkbox: **"I understand this work is outside the original scope and agree to the estimated cost range of $960–$1,440"**
- Green **"Approve & Schedule"** button
- Decline link
- On approve: timestamp, IP stored; GitHub issue created; developer notified; proof pack updated

### F8. GitHub Issue Creation
After client approval:
- Create GitHub issue in connected repo via REST API
- Issue title: `[Monad] {brief feature description}`
- Issue body: client request, AI breakdown, approved cost, approval timestamp, link back to Monad request
- Add label: `monad-approved`
- Store issue number + URL on request record
- Show in request detail: "GitHub Issue #42 created"

**For demo if GitHub OAuth not ready:** Use GitHub Personal Access Token (much simpler, same API calls)

### F9. Request History
- Per-project list of all requests
- Filterable by status: All / Pending / Sent / Approved / Declined
- Each row: client preview, classification, cost, status, date
- Click → request review screen

### F10. Basic Proof Pack
- Per-project summary page
- Shows: project name, client, scope summary, list of all requests with status + cost
- "Export PDF" button → generates PDF with full chain
- PDF contains: project header, original scope, request history table, approval timestamps

---

## Sprint 2 — High Priority (Build after Sprint 1 is solid)

### F11. GitHub OAuth Connection
- "Connect GitHub" button in project settings
- GitHub OAuth App flow
- Select repository from list of user's repos
- Store installation token
- Show connected repo badge on project

### F12. GitHub Webhooks → Client Notifications
- Register webhook on connected repo
- Listen for: `pull_request.closed` (merged), `issues.closed`, `create` (deployment tag)
- On PR merge: AI generates plain-English summary from commit messages
- Platform sends client email: "Update on your project: [plain English summary]"
- Log as `github_events` record
- Show in project GitHub tab: feed of events with AI translation

### F13. Unapproved Work Detection
- On each PR merge webhook: extract PR title + description + file paths changed
- Compare against approved requests using keyword matching via GPT-4o
- If no matching approved request found: flag developer in dashboard
- Warning card: "This PR may contain unapproved work — no matching client request found"
- Developer can link it to a request or mark as internal

### F14. Website Commenting Widget
**Vanilla JS snippet, hosted at `/widget/monad.js`**

Developer embeds in staging site:
```html
<script 
  src="https://monad.app/widget/monad.js" 
  data-project-id="abc123"
  data-client-token="xyz789">
</script>
```

Widget behaviour:
- Floating "Leave a comment" button (bottom-right, amber)
- Click anywhere on page to place a comment pin
- Comment input box appears
- On submit: POST to Monad API with page URL, element position, comment text
- Comment immediately appears in platform as a new request
- AI analyses it same as an email request
- Developer reviews and quotes in the same flow

Widget design:
- Minimal — single floating button
- Pin markers when in comment mode
- Dark tooltip showing existing comment pins
- Mobile-friendly

---

## Sprint 3 — Full Product (Polish + Remaining Ideas)

### F15. Settings Page
- Profile: name, email, default hourly rate, company name
- Notification preferences: email on new request, email on approval
- Connected services: GitHub status, email forwarding status
- Branding: company name shown in approval emails, optional logo upload

### F16. Analytics Dashboard
Per-project and overall:
- Total requests analysed
- Out-of-scope requests caught
- Total estimated unbilled work protected ($)
- Approval rate (% of out-of-scope requests that got approved + paid)
- Average response time from request to send
- Breakdown by request type (feature, revision, integration, support, etc.)

The **"$X protected this month"** number is the emotional hook. Feature it everywhere.

### F17. Rate Card Learning
After N projects: compare AI estimates vs actual GitHub PR complexity
Surface to developer: "Your auth estimates are typically 20% higher than actual — consider adjusting"

### F18. Multi-Developer Team Support
- Invite team members to project
- Assign requests to specific team members
- Shared request inbox
- Comment thread on each request

### F19. Revision Limit Tracking
- Set revision limit on project (e.g., "2 rounds of revisions")
- AI automatically flags when a request is a revision and increments counter
- Alert when limit reached: "This is revision round 3. Your agreement includes 2 rounds."

### F20. Dispute Pack Enhanced Export
Full dispute evidence PDF:
- Cover page with project + client details
- Original scope document
- Per-request pages: original email, AI analysis, approval screenshot/timestamp, GitHub evidence
- Summary table: all billable work, approved amounts, invoice reference
- Legal disclaimer footer

### F21. "Accidental Yes" Detector
When developer writes a reply manually and it contains: "sure", "no problem", "happy to", "of course", "will do" — and the request was classified as out-of-scope — surface warning before sending:

*"⚠️ Your reply appears to accept out-of-scope work without mentioning cost or getting approval. Are you sure?"*

This is the feature that makes people gasp in the demo.

### F22. Email Integration (Full Gmail/Outlook OAuth)
- Connect Gmail via OAuth
- Watch specific label or inbox
- Auto-detect emails from known clients
- Surface in Monad inbox for review
- Reply via Monad sends from Gmail account

### F23. White-Label Mode (Agency Plan)
- Custom from-name in approval emails: "Jake from Pixel Studio" not "Monad"
- Custom colour in approval emails
- Option to remove Monad branding from approval page

---

# PART 5: BUSINESS MODEL

## 5.1 Pricing

### Free (Starter)
**$0/month forever**
- 1 active project
- 10 request analyses per month
- AI scope classification + draft reply
- Client approval flow
- Basic proof pack (in-app only, no PDF export)
- Monad-branded approval emails

### Pro
**$29/month** (or $23/month billed annually — 20% off → $276/year)
- Unlimited projects
- Unlimited request analyses
- GitHub integration (issue creation)
- PDF proof pack export
- GitHub webhook → client notifications
- Website commenting widget
- Unapproved work detection
- Analytics dashboard
- Remove Monad branding from approval emails
- Email support

### Agency
**$79/month** (or $63/month billed annually → $756/year)
- Everything in Pro
- Team workspace (up to 8 members)
- White-label approval emails (custom from-name + logo)
- Custom branding on approval pages
- Priority AI processing
- Full Gmail/Outlook OAuth integration
- Enhanced dispute pack PDF
- Revision limit tracking
- Priority support + onboarding call

### Enterprise
**Custom pricing**
- Unlimited team members
- SSO / SAML
- Custom integrations
- Dedicated account manager
- SLA guarantee
- Self-hosted option (future)

## 5.2 Unit Economics

| Plan | Price | COGS (AI + infra) | Gross Margin |
|---|---|---|---|
| Free | $0 | ~$0.80/user/month | — |
| Pro | $29 | ~$2.50/user/month | ~91% |
| Agency | $79 | ~$5/user/month | ~94% |

AI cost estimate: GPT-4o at ~$0.005/1K output tokens. Average analysis = ~1,500 output tokens. 100 analyses/month = ~$0.75. Well within margins. Free credits cover the entire hackathon and initial user testing.

## 5.3 Payback Period Calculation (for pitch)
A Pro user at $29/month needs to prevent **less than 20 minutes of unpaid work per month** to break even at $87/hr average developer rate. The average freelancer loses $650–$1,300/month to scope creep. Monad's payback is immediate.

## 5.4 Go-To-Market (Post-Hackathon)
1. Product Hunt launch (Developer/Freelance category)
2. Hacker News Show HN
3. Reddit: r/freelance, r/webdev, r/devops
4. Twitter/X dev community
5. "Vibe coding" community (Cursor, Replit users taking on client work)

---

# PART 6: TEAM SPLIT

## Overview
Three full-stack developers. All capable. Split by ownership area, not by capability. Everyone writes frontend and backend — these are domain assignments, not skill limits.

**Ground rules:**
- Merge to `main` only through PRs
- Short PR descriptions, fast reviews
- One person owns the demo script and keeps it updated as features ship
- Nobody touches the demo seed data without telling the team

---

## Person A — "The Product" (Frontend + UX Lead)

**Owns:**
- Design system implementation (CSS variables, Tailwind config, global styles)
- Landing page (`/`)
- Auth pages (login, signup)
- Dashboard layout (sidebar, topbar, routing)
- Dashboard home page (inbox, metrics)
- Project list page
- **Request Review Screen** — this is the most important screen, Person A owns it fully
- Client Approval Page (`/approve/[token]`) — public, no login, must be beautiful
- Demo preparation (seed data, demo script, demo account)

**Sprint 1 priority order:**
1. Design system + layout shell (Hour 1–3)
2. Auth pages (Hour 3–5)
3. Dashboard + sidebar (Hour 5–8)
4. Request Review Screen (Hour 8–16) ← most time here
5. Client Approval Page (Hour 16–20)
6. Demo prep + polish (Hour 35–40)

---

## Person B — "The Engine" (Backend + AI Lead)

**Owns:**
- Supabase setup (schema, RLS policies, client/server helpers)
- All API routes
- OpenAI integration (`/api/ai/analyse`)
- Postmark inbound email webhook (`/api/webhooks/email`)
- Resend email sending (`/api/email/send`)
- GitHub OAuth flow (`/api/github/connect`)
- GitHub issue creation (`/api/github/create-issue`)
- GitHub webhook receiver (`/api/webhooks/github`)
- Approval handler (`/api/approve/[token]`)
- PDF generation (`/api/pdf`)

**Sprint 1 priority order:**
1. Supabase schema + helpers (Hour 1–3)
2. OpenAI analysis endpoint (Hour 3–6)
3. Email inbound webhook (Hour 6–9)
4. Approval handler + token logic (Hour 9–12)
5. Resend email sending (Hour 12–14)
6. GitHub issue creation (Hour 14–18)
7. PDF generation (Hour 30–35)

---

## Person C — "The Builder" (Full Stack + Widget)

**Owns:**
- Project creation wizard (new project page, scope input, rate card)
- Project detail page (tabs: Requests, GitHub, Proof Pack)
- Individual request history list
- Settings page
- Website commenting widget (vanilla JS bundle)
- Widget embed API endpoint
- GitHub webhook event display (GitHub tab)
- Analytics dashboard
- **Fallback paste input** (if email inbound not ready for demo)

**Sprint 1 priority order:**
1. Project creation wizard (Hour 1–6)
2. Project detail page + request history (Hour 6–12)
3. Fallback manual paste input + trigger AI (Hour 12–15)
4. Settings page skeleton (Hour 15–18)
5. Widget (Hour 20–28)
6. Analytics dashboard (Hour 28–35)

---

## Timeline Overview (40 Hours)

| Hour | A | B | C |
|---|---|---|---|
| 0–3 | Design system + layout | Supabase setup | Project creation form |
| 3–6 | Auth pages | OpenAI API | Project creation form cont. |
| 6–10 | Dashboard + inbox | Email inbound webhook | Project detail page |
| 10–16 | **Request Review Screen** | Approval handler + email | Request history list |
| 16–20 | Client Approval Page | GitHub issue creation | Fallback paste input |
| 20–25 | Polish review screen | GitHub OAuth | Widget start |
| 25–30 | Connect flows end-to-end | GitHub webhooks | Widget cont. |
| 30–35 | Analytics display | PDF generation | Analytics dashboard |
| 35–38 | Demo polish + seed data | Bug fixes | Bug fixes |
| 38–40 | **Full demo rehearsal** | **Full demo rehearsal** | **Full demo rehearsal** |

---

# PART 7: DEMO SCRIPT

## Setup (Before Demo)
- Pre-create project: "Marcus — The Rustic Table Restaurant"
- Pre-paste scope: "5-page website: Home, Menu, About, Gallery, Contact. Contact form with validation. Basic SEO meta tags. Mobile responsive. 2 rounds of revisions included. EXCLUDES: online ordering, payment processing, booking systems, loyalty programs, automated emails, custom integrations."
- Rate card: $90/hr. Task categories: Booking system (8–14hrs), Payment integration (10–16hrs), Loyalty system (12–20hrs), Email automation (6–10hrs)
- Pre-receive one email (Postmark inbound triggered, or manually pasted): "Hey Jamie! Site is looking amazing. Could we also add online ordering, table bookings, a loyalty points system, and automated email reminders for reservations? Should be pretty quick since you're already in the codebase!"
- Demo approval page ready on a phone to click live
- GitHub repo connected with label `monad-approved` pre-created

## Script

**[Open dashboard]**
"This is Monad. The inbox you're looking at is scope-aware."

**[Point to amber badge]**
"This email from Marcus arrived 10 minutes ago. Before I've even read it, Monad has already analysed it."

**[Click into request]**
"Left side — Marcus's email, exactly as he sent it. Right side — Monad's analysis."

**[Highlight OUT OF SCOPE badge]**
"Out of scope. 94% confidence."

**[Point to evidence panel]**
"Here's why: Monad found these three lines in the original scope agreement. Exclusions, stated clearly. Marcus asked for four of them."

**[Scroll to cost estimate]**
"What he's actually asking for: booking system, payment processing, loyalty points, email automation. Estimated 36–60 hours. $3,240 to $5,400."

**[Point to draft reply]**
"Monad has already written my reply. Professional. Relationship-preserving. With the breakdown Marcus needs to understand what he's asking for."

**[Click Send to Client]**
"I click send."

**[Show phone / second screen]**
"Marcus gets this email."

**[Show approval page]**
"One button. No login. He can see exactly what he's approving and what it costs. He ticks the checkbox — 'I understand this is outside original scope' — and clicks Approve."

**[Click approve on phone]**

**[Switch back to laptop — show GitHub]**
"GitHub issue, created. Timestamped. Linked to this request."

**[Show proof pack]**
"And here — the full audit trail. Request, evidence, approval, cost, GitHub link. If Marcus ever disputes this invoice, I export this PDF."

**[Show dashboard metric — amber number]**
"Unbilled work protected in this demo: $4,320."

**[Pause]**

"Three words almost cost Jamie $4,320 of his time. Monad makes sure no developer has to say 'sure, no problem' ever again."

---

# PART 8: GITHUB REPO SETUP

## Initial Setup Commands
```bash
# 1. Create repo on GitHub: monad (public)

# 2. Clone and initialise
git clone https://github.com/[your-org]/monad
cd monad

# 3. Initialise Next.js
npx create-next-app@latest apps/web \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir=false \
  --import-alias="@/*"

# 4. Install dependencies
cd apps/web
npm install @supabase/supabase-js @supabase/ssr
npm install openai
npm install resend
npm install @react-pdf/renderer
npm install @octokit/rest
npm install lucide-react
npm install clsx tailwind-merge
npx shadcn@latest init
npx shadcn@latest add button input textarea badge card separator tabs
npm install framer-motion

# 5. Environment variables
cp .env.example .env.local
```

## .env.example
```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# OpenAI
OPENAI_API_KEY=

# Resend (email sending)
RESEND_API_KEY=
RESEND_FROM_EMAIL=noreply@monad.app

# Postmark (inbound email)
POSTMARK_INBOUND_WEBHOOK_TOKEN=
POSTMARK_SERVER_TOKEN=

# GitHub App
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_WEBHOOK_SECRET=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
INBOUND_EMAIL_DOMAIN=inbound.monad.app
```

## Branch Strategy
```
main              # deployable at all times — Vercel auto-deploys
├── dev           # integration branch — merge here first
│   ├── feat/person-a-dashboard
│   ├── feat/person-b-ai-engine  
│   └── feat/person-c-projects
```

## Commit Convention
```
feat: add request review screen
fix: approval token validation
ui: polish client approval page
api: github issue creation endpoint
db: add widget_comments table
demo: seed data for Marcus project
```

---

# PART 9: KEY RISKS AND MITIGATIONS

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Postmark inbound not working | Medium | High | Build paste fallback on Day 1 |
| GitHub OAuth takes too long | Medium | Medium | Use Personal Access Token for demo |
| Claude too slow (>10s) | Low | Medium | Show loading state, cache results |
| PDF generation buggy | Medium | Low | Just show in-app, skip export if needed |
| Widget breaks staging site | Medium | Low | Don't demo widget if unstable |
| Supabase RLS misconfigured | High | High | Test auth + data isolation early |
| Demo WiFi fails | Low | High | Run demo on localhost, have Vercel backup |

---

# PART 10: POST-HACKATHON ROADMAP

**Month 1:** Stability, real user testing, fix edge cases in email parsing
**Month 2:** Gmail OAuth, full webhook reliability, mobile-responsive polish
**Month 3:** Team features (Agency plan), white-label, Stripe billing
**Month 4:** Rate card learning, analytics depth, revision tracking
**Month 6:** API for integrations, Zapier connector, Slack notifications
**Month 12:** Enterprise features, SSO, self-hosted option

---

---

# PART 11: SCREEN SPECIFICATIONS (ALL PAGES)

Complete wireframe descriptions for every page. Person A builds all of these.

---

## 11.1 Landing Page (`/`)

**Goal:** Convert a developer who landed here into a signup in under 60 seconds.

**Layout:** Single-page, dark, three sections.

**Section 1 — Hero**
- Full-width. Centred.
- Eyebrow label (small caps, amber): `SCOPE PROTECTION FOR DEVELOPERS`
- H1 (Fraunces, large, italic): *"Clients email you like normal."* / `We handle the rest.`
- Subhead (DM Mono, muted): "Monad catches scope creep before you accidentally say yes. AI analysis, client approval, GitHub evidence — all from a single forwarded email."
- Two CTAs side by side: `Start free →` (amber button) and `See how it works` (ghost button)
- Below CTAs: social proof line — "57% of agencies lose $1K–$5K/month to scope creep. Monad stops it."
- Hero visual: animated mockup of the Request Review Screen (screenshot or live component)

**Section 2 — How it works**
Three steps, horizontal on desktop, stacked on mobile:
1. `Forward the email` — "BCC client emails to your Monad project address. Nothing changes for them."
2. `AI analyses the request` — "Monad checks it against your scope, estimates cost, and drafts a professional reply."
3. `Client approves, GitHub tracks it` — "One-click approval. GitHub issue created. Audit trail built."

**Section 3 — Pricing**
Three plan cards: Free / Pro / Agency. Use exact pricing from Part 5.
CTA on each: `Get started` / `Start Pro trial` / `Contact us`

**Footer:** Logo + tagline. Links: Pricing, GitHub (repo), Twitter. "© 2026 Monad"

---

## 11.2 Auth Pages (`/login`, `/signup`)

**Layout:** Centred card on dark bg. Logo top-centre.

**Signup fields:**
- Full name
- Email
- Password (min 8 chars)
- `Create account` button (amber, full width)
- Divider: "Already have an account? Log in"

**Login fields:**
- Email
- Password
- `Sign in` button
- "Forgot password?" link
- "New to Monad? Sign up"

**After auth:** redirect to `/dashboard`

---

## 11.3 App Shell (Dashboard Layout)

**Persistent sidebar (left, 220px wide, dark `--bg-surface`):**

Top section:
- Monad logo + wordmark
- `New Request` button (amber, full width — opens paste modal as fallback)

Navigation links (DM Mono, 13px):
- `Dashboard` (home icon)
- `Projects` (folder icon)
- `Settings` (gear icon)

Bottom of sidebar:
- User avatar + name + email (small)
- Plan badge: `FREE` / `PRO` / `AGENCY`

**Topbar (right of sidebar, 60px tall):**
- Current page title (left)
- Notification bell with badge count (right)
- Nothing else — keep it clean

---

## 11.4 Dashboard Home (`/dashboard`)

**Top row — 3 metric cards:**
| Metric | Value | Sub |
|---|---|---|
| Requests This Month | `14` | amber number, large |
| Out-of-Scope Caught | `9` | red badge |
| Unbilled Work Protected | `$4,320` | green, Fraunces italic, largest element on page |

**Inbox section (main content):**
- Section header: "Needs Review" + count badge
- List of `RequestCard` components, sorted newest first
- Each card:
  - Left colour bar = classification colour
  - Top row: client name (bold) + project name (muted) + time ago (right-aligned, muted)
  - Middle: email subject (truncated at 80 chars)
  - Bottom row: classification badge + cost estimate chip (if out of scope) + source badge (email/widget/manual)
- Empty state: amber icon + "No new requests. Your inbox is clear." (show when inbox empty)

**Recent Activity section (below inbox):**
- Last 5 approved/declined requests across all projects
- Each row: project name, request summary, status chip, date

---

## 11.5 Project List (`/projects`)

**Header:** "Projects" title + `New Project` button (top right, amber)

**Project cards grid (2-col desktop, 1-col mobile):**
Each card (`--bg-surface`, border, hover lift):
- Project name (bold, Fraunces)
- Client name + client email (muted)
- Status badge: Active / Completed / Archived
- Stats row: `X requests` · `Y out-of-scope` · `$Z protected`
- Bottom: inbound email address (monospace, truncated, copy icon)
- Connected GitHub repo badge (if connected)
- Click → project detail

---

## 11.6 New Project Wizard (`/projects/new`)

**3-step wizard with progress indicator at top.**

**Step 1 — Project Basics**
- Project name (text input, required)
- Client name (text input, required)
- Client email (email input, optional but recommended)
- `Next →` button

**Step 2 — Scope Definition**
- Label: "Paste your project scope"
- Help text: "This can be your proposal, contract, bullet points, or any written agreement. AI will extract the key details."
- Large textarea (12 rows min)
- Below textarea: "Or use our template →" (link that pre-fills a sample)
- `Extract Scope with AI` button — calls GPT-4o, shows spinner, then renders extracted scope preview:
  ```
  ✓ Deliverables: 5-page website, contact form, basic SEO
  ✓ Exclusions: online ordering, booking system, custom integrations
  ✓ Revisions: 2 rounds
  ✓ Timeline: 4 weeks
  ✓ Pricing: Fixed fee
  ```
- User can edit any extracted field inline
- `Next →`

**Step 3 — Rate Card**
- Hourly rate (number input, default from profile)
- Task categories (repeatable row): Name + Min hours + Max hours + `+` to add row
  - Pre-populated suggestions: Authentication, Payment integration, Booking system, UI component, Database work, API integration, Testing, Deployment
- `Create Project` button (amber)

**After creation:**
- Auto-generate inbound email
- Redirect to project detail
- Show onboarding banner: "Your project inbound email is `{email}`. Forward client emails here."

---

## 11.7 Project Detail (`/projects/[id]`)

**Page header:**
- Project name (Fraunces, large)
- Client name + email (muted)
- Status badge
- `⋯` menu: Edit, Archive, Delete

**Tab bar:** Requests · GitHub · Proof Pack

---

### Tab: Requests

**Filter bar:** All · Pending Review · Sent to Client · Approved · Declined · Deferred

**Request list:** Same `RequestCard` as dashboard inbox but full-width, denser.

**Empty states:**
- No requests yet: "No requests yet. Forward client emails to `{email}` to get started."
- Filter empty: "No requests match this filter."

---

### Tab: GitHub

**If not connected:**
- Centred card: GitHub icon + "Connect your GitHub repo to track work automatically."
- `Connect GitHub` button (runs OAuth flow)

**If connected:**
- Repo name + link badge (top right): `octocat/restaurant-site ↗`
- `Monad-approved` issues count
- Event feed (newest first):
  - Each event: event type icon + plain-English AI summary + time
  - Example: `✓ PR merged · "The booking system you approved on May 3rd has been completed" · 2hrs ago`
  - `⚠ Unapproved work` events in amber: `"This PR adds payment processing but no approved request was found"`
- `Disconnect repo` link (bottom, muted)

---

### Tab: Proof Pack

**Summary header:**
- Project name, client, date range
- Total requests: 14 · Out-of-scope caught: 9 · Approved: 7 · Total value: $6,840

**Request table:**
| # | Date | Request Summary | Classification | Cost | Status | Approval |
|---|---|---|---|---|---|---|
| 1 | May 1 | Booking system | OUT OF SCOPE | $1,120 | Approved | ✓ May 2, 14:03 |

**Export button:** `Export Proof Pack PDF` (amber, top right)

---

## 11.8 Request Review Screen (`/projects/[id]/requests/[requestId]`)

**This is the most important screen. Spend the most design time here.**

**Back breadcrumb:** `← Projects / Marcus – Restaurant Website / Requests`

**Two-column layout (60/40 split):**

**LEFT PANEL — Raw Client Email:**
- Panel header: "Client Request" (label) + source badge (EMAIL / WIDGET / MANUAL)
- Email metadata card:
  - From: `marcus@rusticatable.com`
  - To: `project-abc123@inbound.monad.app`
  - Subject: `RE: Website update`
  - Received: `Today at 2:14 PM`
- Email body: full text, exact formatting, `--bg-elevated` background, monospace font, generous padding
- Separator
- **"Accidental Yes" warning zone** (only shows if developer is typing a reply with acceptance language — see F21)

**RIGHT PANEL — AI Analysis:**

Top: Large classification badge
```
┌─────────────────────────────────┐
│  ⚠  OUT OF SCOPE                │  ← red background, white text, full width
│     94% confidence              │  ← amber confidence bar below
└─────────────────────────────────┘
```

**Scope Evidence:**
Label: "Evidence from original scope"
Each quote in a highlighted block (amber left border, `--bg-surface` bg):
```
│ "EXCLUDES: online ordering, payment processing, booking systems..."
│ "5-page website, contact form, basic SEO only"
```

**Technical Breakdown:**
Label: "What this actually involves"
Plain text paragraph from AI (DM Mono, 13px, `--text-secondary`)

**Effort & Cost:**
Two-column stat block:
```
Effort          Cost Estimate
12–18 hrs       $960 – $1,440
```
Cost in amber, Fraunces, large. Effort in muted mono.

**Timeline Impact:**
`+ 3–5 days to delivery` (small chip, red background)

**Risk Level:**
`HIGH RISK` / `MEDIUM RISK` / `LOW RISK` badge

**Suggested Action chip:**
`→ Quote separately` / `→ Accept` / `→ Clarify` / `→ Decline`

---

**DRAFT REPLY SECTION (full width below both panels):**

Section header: "Reply to Client"

Tone selector (pill tabs): `Friendly` · `Professional` · `Firm`

Editable textarea (pre-filled by AI, full draft reply):
- Border: `--border-default`
- Background: `--bg-surface`
- Font: DM Mono
- Resize: vertical
- Accidental Yes detector listens here (see F21)

**Action row:**
- Primary: `Send to Client →` (amber button, right-aligned)
- Secondary row (left-aligned, smaller): `Mark as In-Scope` · `Defer` · `Decline`

---

## 11.9 Client Approval Page (`/approve/[token]`) — PUBLIC

**No auth. No sidebar. Standalone page.**

**Full-page layout, centred, max-width 600px, dark bg with subtle noise texture.**

**Top:**
- Monad logo (small, top-left) — or developer's company name if white-labelled
- `PROJECT SCOPE REVIEW` label (small caps, amber, centred)

**Request summary card (`--bg-surface`, border, rounded):**
- "From: Jamie @ DevStudio"
- "Regarding: The Rustic Table Restaurant — Website Project"
- Separator
- "What you requested:"
  > *"Can you also add online ordering, table bookings, a loyalty points system, and automated email reminders?"*
- Separator
- "What this involves:" (AI technical breakdown, plain English)
- Separator
- Cost block (large, prominent):
  ```
  Estimated additional cost:   $3,240 – $5,400
  Estimated additional time:   +8–12 days
  ```
  `This work is outside the original project scope.`

**Consent checkbox (required before approve button activates):**
`☐ I understand this work is outside the original project scope and agree to the estimated cost range shown above.`

**Two buttons:**
- `Approve & Schedule →` (green, full width, disabled until checkbox ticked)
- `Decline this request` (text link, muted, below button)

**After approve:**
- Checkmark animation
- "Request approved. Jamie has been notified and will be in touch to schedule this work."
- Reference: `Approval #MND-0042 · Recorded May 9, 2026, 14:32 NZST`

**After decline:**
- "Request declined. Jamie has been notified."

---

## 11.10 Settings (`/settings`)

**Four sections on a single page:**

**Profile**
- Full name, email (read-only — change via Supabase Auth), company name, default hourly rate
- `Save changes` button

**Email Forwarding**
- Explanation: "Each project gets a unique inbound email. Forward or BCC client emails to receive and analyse them automatically."
- Status: `✓ Active — inbound.monad.app is receiving emails` (or error state)

**GitHub**
- Status: Connected / Not connected
- If connected: show GitHub username + `Disconnect` link
- If not: `Connect GitHub Account` button

**Notifications**
- Toggle: Email me when a new request is received
- Toggle: Email me when a client approves or declines
- Toggle: Weekly digest of scope creep stats

**Billing** (Sprint 3)
- Current plan badge
- `Upgrade plan` CTA
- Manage billing link (Stripe portal)

---

# PART 12: COMPLETE TYPESCRIPT TYPES

Save as `apps/web/types/index.ts`. Import across the entire codebase.

```typescript
// ─── Auth ────────────────────────────────────────────────────────────────────

export interface Profile {
  id: string
  full_name: string | null
  email: string
  hourly_rate: number
  company_name: string | null
  created_at: string
}

// ─── Projects ────────────────────────────────────────────────────────────────

export interface TaskCategory {
  name: string
  min_hours: number
  max_hours: number
}

export interface ScopeStructured {
  deliverables: string[]
  exclusions: string[]
  revision_limit: string | null
  timeline: string | null
  pricing_model: string | null
}

export type ProjectStatus = 'active' | 'completed' | 'archived'

export interface Project {
  id: string
  user_id: string
  name: string
  client_name: string
  client_email: string | null
  scope_raw: string | null
  scope_structured: ScopeStructured | null
  inbound_email: string
  github_repo_id: string | null
  github_repo_name: string | null
  github_installation_id: string | null
  hourly_rate: number | null
  task_categories: TaskCategory[]
  status: ProjectStatus
  created_at: string
  updated_at: string
}

// ─── Requests ────────────────────────────────────────────────────────────────

export type Classification =
  | 'in_scope'
  | 'out_of_scope'
  | 'ambiguous'
  | 'clarification_needed'
  | null

export type RiskLevel = 'low' | 'medium' | 'high' | null

export type RequestStatus =
  | 'pending_review'
  | 'sent_to_client'
  | 'approved'
  | 'declined'
  | 'deferred'
  | 'accepted_in_scope'

export type RequestSource = 'email' | 'widget' | 'manual'

export type ReplyTone = 'friendly' | 'professional' | 'firm'

export type SuggestedAction =
  | 'accept'
  | 'quote_separately'
  | 'clarify'
  | 'decline'

export interface AITask {
  name: string
  description: string
  min_hours: number
  max_hours: number
}

export interface AIAnalysis {
  classification: Classification
  confidence: number
  scope_evidence: string[]
  technical_breakdown: string
  tasks: AITask[]
  effort_min_hours: number
  effort_max_hours: number
  risk_level: RiskLevel
  timeline_impact_days: number
  reasoning: string
  draft_reply: string
  suggested_action: SuggestedAction
}

export interface Request {
  id: string
  project_id: string
  raw_email_subject: string | null
  raw_email_body: string
  raw_email_from: string | null
  source: RequestSource
  // AI Analysis
  classification: Classification
  confidence: number | null
  scope_evidence: string[]
  technical_breakdown: string | null
  effort_min_hours: number | null
  effort_max_hours: number | null
  cost_min: number | null
  cost_max: number | null
  timeline_impact_days: number | null
  risk_level: RiskLevel
  // Response
  draft_reply: string | null
  final_reply: string | null
  reply_tone: ReplyTone
  // Status
  status: RequestStatus
  // Approval
  approval_token: string
  approval_page_viewed_at: string | null
  approved_at: string | null
  approved_ip: string | null
  declined_at: string | null
  client_understood_cost: boolean
  // GitHub
  github_issue_number: number | null
  github_issue_url: string | null
  created_at: string
  updated_at: string
}

// Request with project data joined
export interface RequestWithProject extends Request {
  project: Pick<Project, 'id' | 'name' | 'client_name' | 'client_email' | 'hourly_rate'>
}

// ─── GitHub Events ────────────────────────────────────────────────────────────

export type GitHubEventType =
  | 'pr_merged'
  | 'issue_closed'
  | 'push'
  | 'deployment'

export interface GitHubEvent {
  id: string
  project_id: string
  request_id: string | null
  event_type: GitHubEventType
  github_data: Record<string, unknown>
  plain_english_summary: string | null
  client_notified: boolean
  client_notified_at: string | null
  is_unapproved_work: boolean
  created_at: string
}

// ─── Widget Comments ──────────────────────────────────────────────────────────

export interface WidgetComment {
  id: string
  project_id: string
  page_url: string
  element_selector: string | null
  x_position: number
  y_position: number
  comment_text: string
  client_name: string | null
  converted_to_request_id: string | null
  created_at: string
}

// ─── API Payloads ─────────────────────────────────────────────────────────────

export interface AnalyseRequestPayload {
  request_id: string
}

export interface SendToClientPayload {
  request_id: string
  final_reply: string
  tone: ReplyTone
}

export interface ApproveRequestPayload {
  token: string
  client_understood: boolean
}

// ─── Dashboard Metrics ────────────────────────────────────────────────────────

export interface DashboardMetrics {
  requests_this_month: number
  out_of_scope_caught: number
  unbilled_work_protected: number  // in dollars
  approval_rate: number            // 0-100 percentage
}
```

---

# PART 13: SUPABASE RLS POLICIES

Run these after creating the schema. Critical — without RLS, any user can read any data.

```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE github_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE widget_comments ENABLE ROW LEVEL SECURITY;

-- Profiles: users can only see/edit their own profile
CREATE POLICY "Users own their profile"
  ON profiles FOR ALL
  USING (auth.uid() = id);

-- Projects: users can only see/edit their own projects
CREATE POLICY "Users own their projects"
  ON projects FOR ALL
  USING (auth.uid() = user_id);

-- Requests: users can access requests for their projects only
CREATE POLICY "Users access requests for their projects"
  ON requests FOR ALL
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- GitHub events: same as requests
CREATE POLICY "Users access github_events for their projects"
  ON github_events FOR ALL
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- Widget comments: same
CREATE POLICY "Users access widget_comments for their projects"
  ON widget_comments FOR ALL
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- IMPORTANT: The approve/{token} route uses the service role key (bypasses RLS)
-- so the client can approve without being logged in.
-- Never expose SUPABASE_SERVICE_ROLE_KEY to the browser.
```

---

# PART 14: THIRD-PARTY SERVICE SETUP

## 14.1 Postmark (Inbound Email)

1. Create account at postmarkapp.com
2. Create a Server (name: "Monad")
3. Go to **Inbound** tab → set inbound domain: `inbound.monad.app`
4. Add DNS record: `MX inbound.monad.app → inbound.postmarkapp.com` (priority 10)
5. Set **Inbound webhook URL**: `https://your-vercel-url.app/api/webhooks/email`
6. Copy **Server API Token** → `POSTMARK_SERVER_TOKEN` in `.env.local`

**Inbound webhook payload** (what Postmark POSTs to your endpoint):
```json
{
  "From": "marcus@rusticatable.com",
  "Subject": "RE: Website update",
  "TextBody": "Hey Jamie! Could we also add...",
  "ToFull": [{ "Email": "project-abc123@inbound.monad.app" }]
}
```

**Your webhook handler** (`/api/webhooks/email/route.ts`) must:
1. Extract the `To` address to find the project
2. Look up the project by `inbound_email`
3. Create a `request` record
4. Call `/api/ai/analyse` with the new request ID
5. Return `200 OK` immediately (Postmark retries on non-200)

**Fallback for demo:** If DNS not propagated in time, add a "Paste email" button on the project page that manually creates a request and triggers analysis. This takes 30 minutes to build and is your safety net.

---

## 14.2 Resend (Outbound Email)

1. Create account at resend.com
2. Add domain: `monad.app` (or use `onboarding@resend.dev` for testing without a domain)
3. Copy API key → `RESEND_API_KEY`
4. Set `RESEND_FROM_EMAIL=noreply@monad.app`

**Approval email HTML template:**

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { background: #080c14; color: #f0f4ff; font-family: 'Courier New', monospace; margin: 0; padding: 40px 20px; }
    .container { max-width: 560px; margin: 0 auto; }
    .header { margin-bottom: 32px; }
    .logo { color: #f59e0b; font-size: 18px; font-weight: 500; letter-spacing: 0.1em; }
    .card { background: #0f1624; border: 1px solid rgba(255,255,255,0.10); border-radius: 8px; padding: 24px; margin: 24px 0; }
    .label { color: #8892a4; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 4px; }
    .value { color: #f0f4ff; font-size: 14px; }
    .cost { color: #f59e0b; font-size: 28px; font-weight: 600; margin: 16px 0 4px; }
    .cost-label { color: #8892a4; font-size: 12px; }
    .out-of-scope { color: #ef4444; font-size: 12px; margin-top: 8px; }
    .button { display: block; background: #10b981; color: #fff; text-decoration: none; text-align: center; padding: 16px 32px; border-radius: 6px; font-size: 16px; font-weight: 600; margin: 32px 0 16px; }
    .decline { color: #8892a4; font-size: 12px; text-align: center; }
    .decline a { color: #8892a4; }
    .footer { color: #4a5568; font-size: 11px; margin-top: 40px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">monad</div>
    </div>

    <p>Hi {{client_name}},</p>
    <p>{{developer_reply}}</p>

    <div class="card">
      <div class="label">Your Request</div>
      <div class="value">{{request_summary}}</div>

      <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.06);">
        <div class="label">What This Involves</div>
        <div class="value">{{technical_breakdown}}</div>
      </div>

      <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.06);">
        <div class="cost">{{cost_range}}</div>
        <div class="cost-label">estimated additional cost · +{{timeline_days}} days</div>
        <div class="out-of-scope">⚠ This work is outside the original project scope</div>
      </div>
    </div>

    <a href="{{approval_url}}" class="button">Approve this work →</a>
    <div class="decline"><a href="{{decline_url}}">Decline this request</a></div>

    <div class="footer">
      This approval request was sent via Monad · monad.app<br>
      Project: {{project_name}} · Reference: {{request_id}}
    </div>
  </div>
</body>
</html>
```

---

## 14.3 GitHub App / OAuth Setup

**Option A — GitHub OAuth App (simpler, faster for hackathon):**
1. GitHub → Settings → Developer Settings → OAuth Apps → New OAuth App
2. Name: `Monad`
3. Homepage URL: `https://your-app.vercel.app`
4. Callback URL: `https://your-app.vercel.app/api/github/connect`
5. Copy Client ID + Client Secret → env vars

**OAuth flow (`/api/github/connect/route.ts`):**
```typescript
// Step 1: Redirect to GitHub
const authUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&scope=repo,write:repo_hook&state=${userId}`

// Step 2: GitHub redirects back with ?code=xxx
const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
  method: 'POST',
  headers: { Accept: 'application/json' },
  body: JSON.stringify({ client_id, client_secret, code })
})
const { access_token } = await tokenRes.json()
// Save access_token to project record
```

**Option B — Personal Access Token (fastest, good for demo):**
- Developer generates a GitHub PAT with `repo` scope
- Pastes it into Settings → GitHub in Monad
- No OAuth flow needed
- Same API calls, zero setup complexity
- **Recommended if pressed for time**

**Webhook setup (after repo connected):**
```typescript
import { Octokit } from '@octokit/rest'
const octokit = new Octokit({ auth: access_token })

await octokit.repos.createWebhook({
  owner, repo,
  config: {
    url: `${APP_URL}/api/webhooks/github`,
    content_type: 'json',
    secret: GITHUB_WEBHOOK_SECRET
  },
  events: ['pull_request', 'issues', 'push']
})
```

---

# PART 15: ADDITIONAL AI PROMPTS

## 15.1 Scope Extraction Prompt

Called when a new project is created to turn raw scope text into structured JSON.

```typescript
const scopeExtractionPrompt = `
You are extracting project scope details from a freelancer's proposal or contract.
Return only valid JSON with no markdown fences.

INPUT TEXT:
${scopeRaw}

Return JSON:
{
  "deliverables": ["array of specific deliverables mentioned"],
  "exclusions": ["array of things explicitly excluded"],
  "revision_limit": "e.g. '2 rounds of revisions' or null if not mentioned",
  "timeline": "e.g. '4 weeks' or null",
  "pricing_model": "fixed_fee | hourly | retainer | milestone | unknown"
}

Rules:
- Only extract what is explicitly stated. Do not infer.
- If something is not mentioned, use null or empty array.
- Keep deliverable descriptions concise (under 10 words each).
`
```

## 15.2 Unapproved Work Detection Prompt

Called when a GitHub PR is merged.

```typescript
const unapprovedWorkPrompt = `
You are checking whether a GitHub pull request contains work that was approved by the client.

APPROVED CLIENT REQUESTS for this project:
${approvedRequests.map(r => `- ${r.technical_breakdown}`).join('\n')}

PULL REQUEST:
Title: ${pr.title}
Description: ${pr.body}
Files changed: ${pr.files.join(', ')}

Does this PR correspond to an approved client request?
Return JSON:
{
  "is_approved_work": true | false,
  "confidence": 0-100,
  "matched_request": "brief description of matched request or null",
  "reasoning": "why this is or is not approved work"
}
`
```

---

# PART 16: WEBSITE COMMENTING WIDGET

## Widget Source (`packages/widget/src/index.ts`)

Full implementation guide for the vanilla JS widget.

```typescript
// Monad Website Commenting Widget
// Embed: <script src="https://monad.app/widget/monad.js" data-project-id="xxx" data-client-token="yyy">

(function() {
  const projectId = document.currentScript?.getAttribute('data-project-id')
  const clientToken = document.currentScript?.getAttribute('data-client-token')
  const API_URL = 'https://monad.app/api/widget/comment'

  if (!projectId) return

  // Inject styles
  const style = document.createElement('style')
  style.textContent = `
    #monad-widget-btn {
      position: fixed; bottom: 24px; right: 24px; z-index: 99999;
      background: #f59e0b; color: #080c14; border: none; border-radius: 6px;
      padding: 10px 16px; font-family: monospace; font-size: 13px;
      cursor: pointer; box-shadow: 0 4px 12px rgba(245,158,11,0.4);
      transition: transform 0.15s, box-shadow 0.15s;
    }
    #monad-widget-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(245,158,11,0.5); }
    #monad-widget-btn.active { background: #ef4444; color: white; }
    .monad-pin {
      position: absolute; width: 28px; height: 28px; z-index: 99998;
      background: #f59e0b; border-radius: 50%; border: 2px solid white;
      cursor: pointer; transform: translate(-50%, -50%);
      display: flex; align-items: center; justify-content: center;
      font-size: 11px; font-weight: bold; color: #080c14;
    }
    #monad-comment-box {
      position: fixed; z-index: 99999;
      background: #0f1624; border: 1px solid rgba(255,255,255,0.15);
      border-radius: 8px; padding: 16px; width: 280px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.5);
    }
    #monad-comment-box textarea {
      width: 100%; height: 80px; background: #080c14;
      border: 1px solid rgba(255,255,255,0.1); border-radius: 4px;
      color: #f0f4ff; font-family: monospace; font-size: 13px;
      padding: 8px; resize: none; box-sizing: border-box;
    }
    #monad-comment-box button {
      background: #f59e0b; color: #080c14; border: none;
      border-radius: 4px; padding: 8px 16px; cursor: pointer;
      font-family: monospace; font-size: 12px; margin-top: 8px;
    }
  `
  document.head.appendChild(style)

  // State
  let isActive = false
  let pinCount = 0

  // Floating button
  const btn = document.createElement('button')
  btn.id = 'monad-widget-btn'
  btn.textContent = '+ Leave comment'
  document.body.appendChild(btn)

  btn.addEventListener('click', () => {
    isActive = !isActive
    btn.textContent = isActive ? '✕ Cancel' : '+ Leave comment'
    btn.classList.toggle('active', isActive)
    document.body.style.cursor = isActive ? 'crosshair' : ''
  })

  // Click to place pin
  document.addEventListener('click', (e) => {
    if (!isActive) return
    if ((e.target as Element).closest('#monad-widget-btn')) return

    e.preventDefault()
    e.stopPropagation()

    const x = e.pageX
    const y = e.pageY

    // Place pin
    pinCount++
    const pin = document.createElement('div')
    pin.className = 'monad-pin'
    pin.textContent = String(pinCount)
    pin.style.left = x + 'px'
    pin.style.top = y + 'px'
    document.body.appendChild(pin)

    // Show comment box near pin
    showCommentBox(x, y, pin)
    isActive = false
    btn.textContent = '+ Leave comment'
    btn.classList.remove('active')
    document.body.style.cursor = ''
  }, true)

  function showCommentBox(x: number, y: number, pin: HTMLElement) {
    const box = document.createElement('div')
    box.id = 'monad-comment-box'
    box.style.left = Math.min(x + 16, window.innerWidth - 300) + 'px'
    box.style.top = Math.min(y + 16, window.scrollY + window.innerHeight - 160) + 'px'

    box.innerHTML = `
      <div style="color:#8892a4;font-size:11px;margin-bottom:8px;font-family:monospace;">LEAVE A COMMENT</div>
      <textarea placeholder="Describe what you'd like changed..."></textarea>
      <div style="display:flex;gap:8px;margin-top:8px;">
        <button id="monad-submit-btn">Submit</button>
        <button id="monad-cancel-btn" style="background:transparent;color:#8892a4;border:1px solid rgba(255,255,255,0.1);">Cancel</button>
      </div>
    `
    document.body.appendChild(box)

    box.querySelector('#monad-cancel-btn')!.addEventListener('click', () => {
      box.remove()
      pin.remove()
      pinCount--
    })

    box.querySelector('#monad-submit-btn')!.addEventListener('click', async () => {
      const text = (box.querySelector('textarea') as HTMLTextAreaElement).value.trim()
      if (!text) return

      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId,
          client_token: clientToken,
          page_url: window.location.href,
          x_position: x / document.documentElement.scrollWidth,
          y_position: y / document.documentElement.scrollHeight,
          comment_text: text
        })
      })

      box.innerHTML = `<div style="color:#10b981;font-family:monospace;font-size:13px;padding:8px;">✓ Comment sent to developer</div>`
      setTimeout(() => box.remove(), 2000)
    })
  }
})()
```

## Widget API Endpoint (`/api/widget/comment/route.ts`)

```typescript
export async function POST(req: Request) {
  const { project_id, page_url, x_position, y_position, comment_text } = await req.json()

  // 1. Save widget comment to DB
  // 2. Create a request record with source = 'widget'
  // 3. Trigger AI analysis
  // 4. Return 200
}
```

---

# PART 17: DEMO SEED DATA

Run this SQL in Supabase SQL editor before the demo. Creates the Marcus project with pre-analysed request ready to show.

```sql
-- 1. Create a demo user (or use your own auth.uid())
-- Replace 'YOUR_USER_ID' with your actual Supabase auth user ID

-- 2. Insert demo project
INSERT INTO projects (
  id, user_id, name, client_name, client_email,
  scope_raw, scope_structured,
  inbound_email, hourly_rate, task_categories, status
) VALUES (
  'demo-project-001',
  'YOUR_USER_ID',
  'Restaurant Website Redesign',
  'Marcus Chen',
  'marcus@rusticatable.com',
  '5-page website: Home, Menu, About, Gallery, Contact. Contact form with validation. Basic SEO meta tags. Mobile responsive design. 2 rounds of revisions included. EXCLUDES: online ordering, payment processing, booking systems, loyalty programs, automated email campaigns, custom integrations.',
  '{
    "deliverables": ["5-page website", "contact form", "basic SEO meta tags", "mobile responsive design"],
    "exclusions": ["online ordering", "payment processing", "booking systems", "loyalty programs", "automated email campaigns", "custom integrations"],
    "revision_limit": "2 rounds",
    "timeline": "4 weeks",
    "pricing_model": "fixed_fee"
  }',
  'marcus-rustic-abc123@inbound.monad.app',
  90,
  '[
    {"name": "Booking system", "min_hours": 8, "max_hours": 14},
    {"name": "Payment integration", "min_hours": 10, "max_hours": 16},
    {"name": "Loyalty system", "min_hours": 12, "max_hours": 20},
    {"name": "Email automation", "min_hours": 6, "max_hours": 10}
  ]',
  'active'
);

-- 3. Insert the demo request (pre-analysed so no API call needed during demo)
INSERT INTO requests (
  id, project_id,
  raw_email_subject, raw_email_body, raw_email_from, source,
  classification, confidence,
  scope_evidence, technical_breakdown,
  effort_min_hours, effort_max_hours, cost_min, cost_max,
  timeline_impact_days, risk_level,
  draft_reply, status
) VALUES (
  'demo-request-001',
  'demo-project-001',
  'RE: Website — Quick additions?',
  'Hey Jamie! The site is looking absolutely amazing — really happy with how it is coming together. Quick thing though — could we also add online ordering, table bookings, a loyalty points system, and automated email reminders for reservations? Should be pretty quick since you are already in the codebase! Thanks, Marcus',
  'marcus@rusticatable.com',
  'email',
  'out_of_scope',
  94,
  ARRAY[
    'EXCLUDES: online ordering, payment processing, booking systems, loyalty programs, automated email campaigns',
    'Scope: 5-page website, contact form, basic SEO meta tags, mobile responsive design'
  ],
  'This request involves four separate systems: (1) an online ordering module requiring a product database, cart, and order management; (2) a table booking system with availability calendar and confirmation emails; (3) a loyalty points engine tracking customer accounts and reward tiers; and (4) an email automation system for reservation reminders. Each is a substantial feature. None were included in the original agreement.',
  36, 60, 3240, 5400,
  10, 'high',
  'Hi Marcus, great to hear the site is looking good! I''ve reviewed your request and wanted to give you a clear picture of what''s involved. The additions you''ve described — online ordering, table bookings, loyalty points, and automated emails — are each significant features that go beyond the original project scope. I''ve put together a breakdown of the work and cost involved below. Happy to discuss further or get these scheduled as a separate phase.',
  'pending_review'
);
```

---

# PART 18: THE "ACCIDENTAL YES" DETECTOR (F21 — Implementation)

This is the feature that makes people gasp. Implement it in the Request Review Screen.

**How it works:**

The draft reply textarea has a `onChange` listener. When the developer types, JavaScript checks the reply text against a list of acceptance phrases. If:
1. The current request classification is `out_of_scope` or `ambiguous`, AND
2. The reply contains acceptance language

A warning banner animates in above the Send button.

**Acceptance phrases to detect (case-insensitive):**
```
"sure", "no problem", "of course", "happy to", "will do",
"can do", "sounds good", "no worries", "absolutely",
"yep", "yeah", "ok", "okay", "i'll do it", "we can do that",
"i can add", "we can add", "i'll add"
```

**Warning banner (amber, slides in from bottom):**
```
⚠  Your reply appears to accept out-of-scope work without 
   mentioning cost or requesting approval.
   
   Are you sure you want to send this?
   
   [Send anyway]   [Add cost mention →]
```

"Add cost mention →" button inserts this text at the end of the draft:
> *"This work is outside our original agreement. I'll send you a change-order with the details and cost for your approval before we proceed."*

**React implementation (inside RequestReviewScreen):**

```typescript
const ACCEPTANCE_PHRASES = [
  'sure', 'no problem', 'of course', 'happy to', 'will do',
  'can do', 'sounds good', 'no worries', 'absolutely',
  'yep', 'yeah', 'i\'ll do it', 'we can do that',
  'i can add', 'we can add', 'i\'ll add'
]

const [replyText, setReplyText] = useState(request.draft_reply ?? '')
const [showAccidentalYesWarning, setShowAccidentalYesWarning] = useState(false)

useEffect(() => {
  const isRisky = 
    (request.classification === 'out_of_scope' || request.classification === 'ambiguous') &&
    ACCEPTANCE_PHRASES.some(phrase => 
      replyText.toLowerCase().includes(phrase)
    )
  setShowAccidentalYesWarning(isRisky)
}, [replyText, request.classification])
```

---

---

# PART 19: PRODUCTIVITY THEME POSITIONING

## Why Monad is a productivity tool (not just a finance tool)

This distinction matters for the pitch. Judges are scoring on the productivity theme. Every sentence should reinforce it.

**The productivity problem Monad solves:**

The average freelance developer loses **6–8 hours per week** to scope management overhead:
- Reading and re-reading client requests trying to remember what was agreed
- Hunting through email chains for the original contract
- Drafting careful replies that won't damage the relationship
- Writing change orders from scratch
- Following up for approvals that never come
- Dealing with rework after unapproved changes get built anyway

None of that is real work. All of it kills focus. Every unexpected client email is an unplanned context switch that research shows costs **23 minutes of deep work recovery** (Gloria Mark, UC Irvine). A developer with four active clients receiving two unexpected requests per day is losing nearly two hours per day to recovery time alone — before they've even dealt with the request.

Monad eliminates the overhead entirely. The developer opens one screen, sees the analysis already done, clicks send, and returns to building. The cognitive load of scope management drops to near zero.

**How to say this in the pitch:**

> "Scope creep doesn't just cost money. Every unexpected client request is a context switch. Research shows it takes 23 minutes to recover deep focus after an interruption. Developers with multiple clients face this several times a day. Monad removes the overhead entirely — the analysis is done, the reply is written, the approval is handled. The developer stays in flow."

**How this maps to productivity specifically:**

| Productivity dimension | What Monad does |
|---|---|
| Time saved | Eliminates 6–8hrs/week of scope admin |
| Focus protected | Removes context-switching overhead from client requests |
| Cognitive load reduced | AI handles analysis, drafting, evidence gathering |
| Workflow automation | Email → analysis → approval → GitHub ticket, automated |
| Rework prevented | Unapproved work detection stops wasted build cycles |
| Decision speed | Scope decisions in seconds vs 30–60 minutes manually |

**The one-line productivity pitch:**

> "Monad automates the most cognitively expensive part of client work so developers can stay focused on building."

Use this as your theme anchor. Return to it after every feature demo moment.

---

# PART 20: COMPLETE API ROUTE IMPLEMENTATIONS

Copy-paste ready. These are the five routes that make the product work. Build these first.

---

## 20.1 Postmark Inbound Email Webhook
**`app/api/webhooks/email/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { analyseRequest } from '@/lib/openai'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Postmark sends ToFull as an array
    const toEmail = body.ToFull?.[0]?.Email?.toLowerCase()
    if (!toEmail) return NextResponse.json({ ok: false }, { status: 400 })

    const supabase = createClient()

    // Find the project by inbound email address
    const { data: project, error } = await supabase
      .from('projects')
      .select('*, profiles(hourly_rate)')
      .eq('inbound_email', toEmail)
      .single()

    if (error || !project) {
      console.error('No project found for email:', toEmail)
      return NextResponse.json({ ok: false }, { status: 404 })
    }

    // Strip HTML from email body — use text version
    const rawBody = body.TextBody || body.HtmlBody?.replace(/<[^>]*>/g, '') || ''

    // Create request record
    const { data: request, error: insertError } = await supabase
      .from('requests')
      .insert({
        project_id: project.id,
        raw_email_subject: body.Subject || '(no subject)',
        raw_email_body: rawBody.trim(),
        raw_email_from: body.From,
        source: 'email',
        status: 'pending_review',
      })
      .select()
      .single()

    if (insertError || !request) {
      console.error('Failed to insert request:', insertError)
      return NextResponse.json({ ok: false }, { status: 500 })
    }

    // Trigger AI analysis (non-blocking — fire and forget)
    // This means the webhook returns fast and analysis happens async
    fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/ai/analyse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ request_id: request.id }),
    }).catch(console.error)

    // Postmark needs a 200 or it retries
    return NextResponse.json({ ok: true, request_id: request.id })
  } catch (err) {
    console.error('Email webhook error:', err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
```

---

## 20.2 AI Analysis Endpoint
**`app/api/ai/analyse/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { analyseRequest } from '@/lib/openai'

export async function POST(req: NextRequest) {
  try {
    const { request_id } = await req.json()
    if (!request_id) return NextResponse.json({ error: 'Missing request_id' }, { status: 400 })

    const supabase = createClient()

    // Fetch request + project in one query
    const { data: request, error } = await supabase
      .from('requests')
      .select(`
        *,
        project:projects (
          id, name, client_name, scope_raw, scope_structured,
          hourly_rate, task_categories
        )
      `)
      .eq('id', request_id)
      .single()

    if (error || !request) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    const project = request.project as any

    // Call GPT-4o
    const analysis = await analyseRequest({
      scopeRaw: project.scope_raw || '',
      scopeStructured: project.scope_structured || {},
      hourlyRate: project.hourly_rate || 100,
      taskCategories: project.task_categories || [],
      emailFrom: request.raw_email_from || 'unknown',
      emailSubject: request.raw_email_subject || '',
      emailBody: request.raw_email_body,
    })

    // Calculate cost from effort * rate
    const rate = project.hourly_rate || 100
    const costMin = Math.round(analysis.effort_min_hours * rate)
    const costMax = Math.round(analysis.effort_max_hours * rate)

    // Update request with full analysis
    const { error: updateError } = await supabase
      .from('requests')
      .update({
        classification: analysis.classification,
        confidence: analysis.confidence,
        scope_evidence: analysis.scope_evidence,
        technical_breakdown: analysis.technical_breakdown,
        effort_min_hours: analysis.effort_min_hours,
        effort_max_hours: analysis.effort_max_hours,
        cost_min: costMin,
        cost_max: costMax,
        timeline_impact_days: analysis.timeline_impact_days,
        risk_level: analysis.risk_level,
        draft_reply: analysis.draft_reply,
        status: 'pending_review',
        updated_at: new Date().toISOString(),
      })
      .eq('id', request_id)

    if (updateError) {
      console.error('Failed to update request with analysis:', updateError)
      return NextResponse.json({ error: 'Update failed' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, analysis })
  } catch (err) {
    console.error('Analysis error:', err)
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
  }
}
```

---

## 20.3 Send to Client (Approval Email)
**`app/api/email/send/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendApprovalEmail } from '@/lib/resend'

export async function POST(req: NextRequest) {
  try {
    const { request_id, final_reply, tone } = await req.json()

    const supabase = createClient()

    const { data: request, error } = await supabase
      .from('requests')
      .select(`*, project:projects (name, client_name, client_email, hourly_rate)`)
      .eq('id', request_id)
      .single()

    if (error || !request) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const project = request.project as any

    if (!project.client_email) {
      return NextResponse.json(
        { error: 'No client email on this project. Add it in project settings.' },
        { status: 400 }
      )
    }

    const approvalUrl = `${process.env.NEXT_PUBLIC_APP_URL}/approve/${request.approval_token}`
    const declineUrl = `${approvalUrl}?action=decline`

    // Send via Resend
    await sendApprovalEmail({
      to: project.client_email,
      clientName: project.client_name,
      projectName: project.name,
      developerReply: final_reply,
      requestSummary: request.raw_email_body.slice(0, 200) + '...',
      technicalBreakdown: request.technical_breakdown || '',
      costMin: request.cost_min || 0,
      costMax: request.cost_max || 0,
      timelineDays: request.timeline_impact_days || 0,
      approvalUrl,
      declineUrl,
      requestRef: `MND-${request_id.slice(0, 6).toUpperCase()}`,
    })

    // Update request status
    await supabase
      .from('requests')
      .update({
        status: 'sent_to_client',
        final_reply,
        reply_tone: tone,
        updated_at: new Date().toISOString(),
      })
      .eq('id', request_id)

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Send email error:', err)
    return NextResponse.json({ error: 'Send failed' }, { status: 500 })
  }
}
```

---

## 20.4 Client Approval Handler
**`app/api/approve/[token]/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createGitHubIssue } from '@/lib/github'

export async function POST(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { action, client_understood } = await req.json()
    // action: 'approve' | 'decline'

    const supabase = createClient()

    const { data: request, error } = await supabase
      .from('requests')
      .select(`*, project:projects (*)`)
      .eq('approval_token', params.token)
      .single()

    if (error || !request) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 404 })
    }

    if (request.status === 'approved' || request.status === 'declined') {
      return NextResponse.json(
        { error: 'This request has already been actioned.' },
        { status: 409 }
      )
    }

    const clientIp =
      req.headers.get('x-forwarded-for')?.split(',')[0] ||
      req.headers.get('x-real-ip') ||
      'unknown'

    if (action === 'decline') {
      await supabase
        .from('requests')
        .update({
          status: 'declined',
          declined_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', request.id)

      return NextResponse.json({ ok: true, action: 'declined' })
    }

    // APPROVE flow
    const project = request.project as any
    let githubIssueNumber: number | null = null
    let githubIssueUrl: string | null = null

    // Create GitHub issue if repo connected
    if (project.github_repo_name) {
      try {
        const issue = await createGitHubIssue({
          repoFullName: project.github_repo_name,
          title: `[Monad] ${request.technical_breakdown?.slice(0, 60) || 'Client approved feature'}`,
          body: buildGitHubIssueBody(request),
        })
        githubIssueNumber = issue.number
        githubIssueUrl = issue.html_url
      } catch (githubErr) {
        // Non-fatal — log and continue
        console.error('GitHub issue creation failed:', githubErr)
      }
    }

    await supabase
      .from('requests')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_ip: clientIp,
        client_understood_cost: client_understood,
        github_issue_number: githubIssueNumber,
        github_issue_url: githubIssueUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', request.id)

    return NextResponse.json({
      ok: true,
      action: 'approved',
      github_issue_url: githubIssueUrl,
    })
  } catch (err) {
    console.error('Approval handler error:', err)
    return NextResponse.json({ error: 'Action failed' }, { status: 500 })
  }
}

// GET — load approval page data (public, no auth)
export async function GET(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  const supabase = createClient()

  const { data: request, error } = await supabase
    .from('requests')
    .select(`
      id, raw_email_body, technical_breakdown,
      cost_min, cost_max, timeline_impact_days,
      status, approved_at, declined_at,
      project:projects (name, client_name)
    `)
    .eq('approval_token', params.token)
    .single()

  if (error || !request) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Record that client viewed the page
  await supabase
    .from('requests')
    .update({ approval_page_viewed_at: new Date().toISOString() })
    .eq('approval_token', params.token)
    .is('approval_page_viewed_at', null) // only set once

  return NextResponse.json(request)
}

function buildGitHubIssueBody(request: any): string {
  return `## Client-Approved Feature Request

**Requested by:** ${request.raw_email_from}
**Approved:** ${new Date().toISOString()}
**Approval ref:** MND-${request.id.slice(0, 6).toUpperCase()}

### Original Client Request
${request.raw_email_body}

### Technical Breakdown
${request.technical_breakdown}

### Approved Cost Estimate
$${request.cost_min}–$${request.cost_max} (${request.effort_min_hours}–${request.effort_max_hours} hours)

### Timeline Impact
+${request.timeline_impact_days} days

---
*Created automatically by [Monad](https://monad.app) — scope protection for developers*`
}
```

---

## 20.5 GitHub Issue Creation
**`lib/github.ts`**

```typescript
import { Octokit } from '@octokit/rest'
import { createClient } from '@/lib/supabase/server'

// Get stored GitHub token for a project
async function getOctokitForProject(projectId: string): Promise<Octokit> {
  // Option A: PAT stored in env (fastest for hackathon)
  if (process.env.GITHUB_PERSONAL_ACCESS_TOKEN) {
    return new Octokit({ auth: process.env.GITHUB_PERSONAL_ACCESS_TOKEN })
  }

  // Option B: OAuth token stored per project in DB
  const supabase = createClient()
  const { data } = await supabase
    .from('projects')
    .select('github_access_token')
    .eq('id', projectId)
    .single()

  if (!data?.github_access_token) {
    throw new Error('No GitHub token found for this project')
  }

  return new Octokit({ auth: data.github_access_token })
}

export async function createGitHubIssue({
  repoFullName,
  title,
  body,
  projectId,
}: {
  repoFullName: string  // e.g. "username/repo-name"
  title: string
  body: string
  projectId?: string
}) {
  const [owner, repo] = repoFullName.split('/')
  const octokit = projectId
    ? await getOctokitForProject(projectId)
    : new Octokit({ auth: process.env.GITHUB_PERSONAL_ACCESS_TOKEN })

  // Ensure label exists (create if not)
  try {
    await octokit.issues.createLabel({
      owner, repo,
      name: 'monad-approved',
      color: 'f59e0b',
      description: 'Approved via Monad scope management',
    })
  } catch {
    // Label already exists — ignore
  }

  const { data: issue } = await octokit.issues.create({
    owner, repo, title, body,
    labels: ['monad-approved'],
  })

  return {
    number: issue.number,
    html_url: issue.html_url,
  }
}

export async function getRepoList(accessToken: string) {
  const octokit = new Octokit({ auth: accessToken })
  const { data } = await octokit.repos.listForAuthenticatedUser({
    sort: 'updated',
    per_page: 50,
  })
  return data.map(r => ({
    id: r.id,
    full_name: r.full_name,
    private: r.private,
    updated_at: r.updated_at,
  }))
}
```

---

# PART 21: SUPABASE SETUP

The boilerplate you need before anything else works. Build these in hour 1.

## 21.1 Middleware
**`middleware.ts`** (root of `apps/web`)

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const isPublicPath =
    request.nextUrl.pathname.startsWith('/login') ||
    request.nextUrl.pathname.startsWith('/signup') ||
    request.nextUrl.pathname.startsWith('/approve') ||
    request.nextUrl.pathname.startsWith('/api') ||
    request.nextUrl.pathname === '/'

  if (!user && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|widget).*)'],
}
```

## 21.2 Server Client
**`lib/supabase/server.ts`**

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}

// Service role client — bypasses RLS — NEVER use in browser
export function createServiceClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}
```

## 21.3 Browser Client
**`lib/supabase/client.ts`**

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

---

# PART 22: TAILWIND CONFIG + GLOBAL CSS

## 22.1 Tailwind Config
**`tailwind.config.ts`**

```typescript
import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Backgrounds
        base:     '#080c14',
        surface:  '#0f1624',
        elevated: '#161e2e',
        subtle:   '#1c2538',

        // Amber accent — revenue, protection
        amber: {
          100: '#fef3c7',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },

        // Status
        green:  { 500: '#10b981' },
        red:    { 500: '#ef4444' },
        blue:   { 500: '#3b82f6' },

        // Text
        primary:   '#f0f4ff',
        secondary: '#8892a4',
        muted:     '#4a5568',
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        mono:    ['DM Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        xs:   ['11px', '16px'],
        sm:   ['13px', '20px'],
        base: ['14px', '22px'],
        lg:   ['16px', '24px'],
        xl:   ['20px', '28px'],
        '2xl': ['28px', '36px'],
        '3xl': ['40px', '48px'],
      },
      borderColor: {
        subtle:  'rgba(255,255,255,0.06)',
        default: 'rgba(255,255,255,0.10)',
        strong:  'rgba(255,255,255,0.18)',
      },
      animation: {
        'slide-in': 'slideIn 0.2s ease-out',
        'fade-in':  'fadeIn 0.15s ease-out',
        'pulse-amber': 'pulseAmber 2s ease-in-out infinite',
      },
      keyframes: {
        slideIn: {
          '0%':   { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',   opacity: '1' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        pulseAmber: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.5' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config
```

## 22.2 Global CSS
**`app/globals.css`**

```css
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,600;1,9..144,300&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * { box-sizing: border-box; }

  html {
    background-color: #080c14;
    color: #f0f4ff;
    font-family: 'DM Mono', 'Fira Code', monospace;
    font-size: 14px;
    -webkit-font-smoothing: antialiased;
  }

  ::selection {
    background: rgba(245, 158, 11, 0.3);
    color: #fef3c7;
  }

  /* Custom scrollbar */
  ::-webkit-scrollbar       { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: #080c14; }
  ::-webkit-scrollbar-thumb { background: #1c2538; border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: #2a3548; }
}

@layer components {
  /* Card */
  .card {
    @apply bg-surface border border-default rounded-lg p-6;
  }

  /* Classification badges */
  .badge-in-scope {
    @apply inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-medium;
    background: rgba(16, 185, 129, 0.12);
    color: #10b981;
    border: 1px solid rgba(16, 185, 129, 0.25);
  }

  .badge-out-of-scope {
    @apply inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-medium;
    background: rgba(239, 68, 68, 0.12);
    color: #ef4444;
    border: 1px solid rgba(239, 68, 68, 0.25);
  }

  .badge-ambiguous {
    @apply inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-medium;
    background: rgba(245, 158, 11, 0.12);
    color: #f59e0b;
    border: 1px solid rgba(245, 158, 11, 0.25);
  }

  .badge-clarify {
    @apply inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-medium;
    background: rgba(59, 130, 246, 0.12);
    color: #3b82f6;
    border: 1px solid rgba(59, 130, 246, 0.25);
  }

  /* Sidebar nav link */
  .nav-link {
    @apply flex items-center gap-3 px-3 py-2 rounded-md text-secondary text-sm transition-colors;
  }
  .nav-link:hover { @apply bg-subtle text-primary; }
  .nav-link.active { @apply bg-subtle text-primary; }
  .nav-link.active span { @apply text-amber-500; }

  /* Primary button */
  .btn-primary {
    @apply inline-flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium font-mono;
    @apply bg-amber-500 text-base hover:bg-amber-400 active:bg-amber-600;
    @apply transition-colors duration-150;
  }

  /* Ghost button */
  .btn-ghost {
    @apply inline-flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium font-mono;
    @apply text-secondary hover:text-primary hover:bg-subtle;
    @apply border border-default transition-colors duration-150;
  }

  /* Input */
  .input {
    @apply w-full bg-elevated border border-default rounded-md px-3 py-2.5;
    @apply text-primary text-sm font-mono placeholder:text-muted;
    @apply focus:outline-none focus:border-amber-500 transition-colors;
  }

  /* Evidence quote block */
  .evidence-quote {
    @apply bg-elevated rounded-md px-4 py-3 text-sm font-mono text-secondary;
    border-left: 3px solid #f59e0b;
  }

  /* Scope evidence highlight */
  .scope-highlight {
    background: rgba(245, 158, 11, 0.15);
    color: #fbbf24;
    border-radius: 2px;
    padding: 0 2px;
  }
}
```

---

# PART 23: KEY COMPONENT IMPLEMENTATIONS

The most reused components. Build these early so every screen can use them.

---

## 23.1 ClassificationBadge
**`components/shared/ClassificationBadge.tsx`**

```tsx
import type { Classification } from '@/types'

const CONFIG = {
  out_of_scope: {
    label: 'OUT OF SCOPE',
    className: 'badge-out-of-scope',
    dot: '●',
  },
  in_scope: {
    label: 'IN SCOPE',
    className: 'badge-in-scope',
    dot: '●',
  },
  ambiguous: {
    label: 'AMBIGUOUS',
    className: 'badge-ambiguous',
    dot: '◐',
  },
  clarification_needed: {
    label: 'CLARIFY',
    className: 'badge-clarify',
    dot: '?',
  },
} as const

interface Props {
  classification: Classification
  size?: 'sm' | 'lg'
}

export function ClassificationBadge({ classification, size = 'sm' }: Props) {
  if (!classification) return null
  const config = CONFIG[classification]

  if (size === 'lg') {
    return (
      <div className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-mono font-semibold w-full ${config.className}`}
        style={{ fontSize: '15px' }}>
        <span>{config.dot}</span>
        <span>{config.label}</span>
      </div>
    )
  }

  return (
    <span className={config.className}>
      {config.dot} {config.label}
    </span>
  )
}
```

---

## 23.2 ConfidenceMeter
**`components/shared/ConfidenceMeter.tsx`**

```tsx
interface Props {
  confidence: number  // 0-100
}

export function ConfidenceMeter({ confidence }: Props) {
  const colour =
    confidence >= 80 ? '#f59e0b' :
    confidence >= 60 ? '#fbbf24' : '#8892a4'

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-xs font-mono text-secondary uppercase tracking-wider">
          Confidence
        </span>
        <span className="text-xs font-mono" style={{ color: colour }}>
          {confidence}%
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-subtle overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${confidence}%`, backgroundColor: colour }}
        />
      </div>
    </div>
  )
}
```

---

## 23.3 MetricCard
**`components/dashboard/MetricCard.tsx`**

```tsx
interface Props {
  label: string
  value: string | number
  sub?: string
  variant?: 'default' | 'amber' | 'green' | 'red'
  className?: string
}

const variantStyles = {
  default: 'text-primary',
  amber:   'text-amber-500 font-display italic',
  green:   'text-green-500',
  red:     'text-red-500',
}

export function MetricCard({ label, value, sub, variant = 'default', className }: Props) {
  return (
    <div className={`card flex flex-col gap-2 ${className ?? ''}`}>
      <span className="text-xs font-mono text-secondary uppercase tracking-wider">
        {label}
      </span>
      <span className={`text-2xl font-semibold ${variantStyles[variant]}`}>
        {value}
      </span>
      {sub && (
        <span className="text-xs font-mono text-muted">{sub}</span>
      )}
    </div>
  )
}
```

---

## 23.4 RequestCard (Inbox)
**`components/dashboard/RequestCard.tsx`**

```tsx
import Link from 'next/link'
import { ClassificationBadge } from '@/components/shared/ClassificationBadge'
import type { RequestWithProject } from '@/types'

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

const sourceLabel = { email: 'EMAIL', widget: 'WIDGET', manual: 'MANUAL' }

interface Props {
  request: RequestWithProject
}

export function RequestCard({ request }: Props) {
  const leftBorderColor =
    request.classification === 'out_of_scope' ? '#ef4444' :
    request.classification === 'in_scope'     ? '#10b981' :
    request.classification === 'ambiguous'    ? '#f59e0b' : '#3b82f6'

  return (
    <Link
      href={`/projects/${request.project_id}/requests/${request.id}`}
      className="block bg-surface rounded-lg border border-default hover:border-strong hover:bg-elevated transition-all duration-150 overflow-hidden animate-slide-in"
      style={{ borderLeft: `3px solid ${leftBorderColor}` }}
    >
      <div className="p-4">
        {/* Top row */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm font-mono font-medium text-primary truncate">
              {request.project.client_name}
            </span>
            <span className="text-muted">·</span>
            <span className="text-xs font-mono text-secondary truncate">
              {request.project.name}
            </span>
          </div>
          <span className="text-xs font-mono text-muted whitespace-nowrap flex-shrink-0">
            {timeAgo(request.created_at)}
          </span>
        </div>

        {/* Subject */}
        <p className="text-sm font-mono text-secondary mb-3 line-clamp-2">
          {request.raw_email_subject || request.raw_email_body.slice(0, 100)}
        </p>

        {/* Bottom row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            {request.classification && (
              <ClassificationBadge classification={request.classification} />
            )}
            {!request.classification && (
              <span className="badge-clarify animate-pulse-amber">
                ● ANALYSING...
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {request.cost_min != null && request.classification === 'out_of_scope' && (
              <span className="text-xs font-mono text-amber-500">
                ${request.cost_min.toLocaleString()}–${request.cost_max?.toLocaleString()}
              </span>
            )}
            <span className="text-xs font-mono text-muted px-1.5 py-0.5 border border-subtle rounded">
              {sourceLabel[request.source]}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
```

---

## 23.5 Resend Helper
**`lib/resend.ts`**

```typescript
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface ApprovalEmailParams {
  to: string
  clientName: string
  projectName: string
  developerReply: string
  requestSummary: string
  technicalBreakdown: string
  costMin: number
  costMax: number
  timelineDays: number
  approvalUrl: string
  declineUrl: string
  requestRef: string
}

export async function sendApprovalEmail(params: ApprovalEmailParams) {
  const {
    to, clientName, projectName, developerReply,
    requestSummary, technicalBreakdown,
    costMin, costMax, timelineDays,
    approvalUrl, declineUrl, requestRef,
  } = params

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to,
    subject: `Project update — ${projectName}`,
    html: buildApprovalEmailHtml({
      clientName, projectName, developerReply, requestSummary,
      technicalBreakdown, costMin, costMax, timelineDays,
      approvalUrl, declineUrl, requestRef,
    }),
  })
}

export async function sendClientCompletionEmail(params: {
  to: string
  clientName: string
  projectName: string
  summary: string
  requestRef: string
}) {
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: params.to,
    subject: `Update on your project — ${params.projectName}`,
    html: `
      <div style="background:#080c14;color:#f0f4ff;font-family:monospace;padding:40px 20px;max-width:560px;margin:0 auto;">
        <div style="color:#f59e0b;font-size:18px;letter-spacing:0.1em;margin-bottom:32px;">monad</div>
        <p>Hi ${params.clientName},</p>
        <p>Good news — here's an update on your project:</p>
        <div style="background:#0f1624;border:1px solid rgba(255,255,255,0.10);border-radius:8px;padding:24px;margin:24px 0;">
          <div style="color:#10b981;font-size:13px;">✓ COMPLETED</div>
          <p style="margin:12px 0 0;">${params.summary}</p>
        </div>
        <div style="color:#4a5568;font-size:11px;margin-top:40px;">
          Ref: ${params.requestRef} · monad.app
        </div>
      </div>
    `,
  })
}

function buildApprovalEmailHtml(p: Omit<ApprovalEmailParams, 'to'>): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="background:#080c14;color:#f0f4ff;font-family:'Courier New',monospace;margin:0;padding:40px 20px;">
<div style="max-width:560px;margin:0 auto;">
  <div style="color:#f59e0b;font-size:18px;letter-spacing:0.1em;margin-bottom:32px;">monad</div>

  <p style="margin-bottom:24px;">Hi ${p.clientName},</p>
  <p style="margin-bottom:24px;line-height:1.6;">${p.developerReply}</p>

  <div style="background:#0f1624;border:1px solid rgba(255,255,255,0.10);border-radius:8px;padding:24px;margin:24px 0;">
    <div style="color:#8892a4;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:8px;">Your Request</div>
    <div style="font-size:14px;line-height:1.6;">${p.requestSummary}</div>

    <div style="margin-top:20px;padding-top:20px;border-top:1px solid rgba(255,255,255,0.06);">
      <div style="color:#8892a4;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:8px;">What This Involves</div>
      <div style="font-size:13px;line-height:1.6;color:#8892a4;">${p.technicalBreakdown}</div>
    </div>

    <div style="margin-top:20px;padding-top:20px;border-top:1px solid rgba(255,255,255,0.06);">
      <div style="color:#f59e0b;font-size:28px;font-weight:600;">$${p.costMin.toLocaleString()}–$${p.costMax.toLocaleString()}</div>
      <div style="color:#8892a4;font-size:12px;">estimated additional cost · +${p.timelineDays} days</div>
      <div style="color:#ef4444;font-size:12px;margin-top:8px;">⚠ This work is outside the original project scope</div>
    </div>
  </div>

  <a href="${p.approvalUrl}"
    style="display:block;background:#10b981;color:#fff;text-decoration:none;text-align:center;padding:16px 32px;border-radius:6px;font-size:16px;font-weight:600;margin:32px 0 16px;">
    Approve this work →
  </a>

  <div style="text-align:center;">
    <a href="${p.declineUrl}" style="color:#8892a4;font-size:12px;">Decline this request</a>
  </div>

  <div style="color:#4a5568;font-size:11px;margin-top:40px;line-height:1.6;">
    Ref: ${p.requestRef} · Project: ${p.projectName} · monad.app
  </div>
</div>
</body>
</html>`
}
```

---

# PART 24: PITCH STRUCTURE FOR JUDGES

This is separate from the demo script. The demo script is what you do on screen. This is the verbal structure around it.

**Total time: 5 minutes. Structure every word.**

---

### Minute 0:00–0:45 — The Story (emotional hook)

Do not open with the product. Open with Jamie.

> "Three words destroyed Jamie's year. Jamie is a freelance developer. Good one. Six clients. In March, a client asked for a 'quick addition' — online ordering, table bookings, loyalty points, and automated emails. Jamie said *sure, no problem*. That decision cost 47 unpaid hours."

Pause. Look up from the screen.

> "57% of agencies lose up to $5,000 every month to exactly this. Only 1% successfully bill for all out-of-scope work. The average freelancer loses $15,000 a year. Not because they're bad at business. Because they have no system."

---

### Minute 0:45–1:15 — The Problem Frame (productivity angle)

> "And here's what nobody talks about — it's not just the money. Every unexpected client request is a context switch. Research shows it takes 23 minutes to recover deep focus after an interruption. Developers with multiple clients face this several times a day. Scope creep doesn't just steal revenue. It kills productivity."

---

### Minute 1:15–1:30 — The Solution (one sentence)

> "Monad is the layer between what clients ask for and what developers build. Clients email you like normal. We handle the rest."

---

### Minute 1:30–3:30 — The Demo (live, controlled)

Follow the demo script from Part 7 exactly. Do not improvise here. Every step should be rehearsed until it takes the same amount of time every run.

Key moments to pause and let land:
- When the OUT OF SCOPE badge appears
- When the cost estimate shows ($3,240–$5,400)
- When the client clicks Approve on the phone and the GitHub issue appears
- When the dashboard shows "Unbilled work protected: $4,320"

---

### Minute 3:30–4:15 — The Business (why people pay)

> "Pro plan — $29 a month. A developer at $90 an hour needs to protect 20 minutes of unpaid work per month to break even. The average freelancer is losing $650 to $1,300 a month to scope creep. The payback is immediate and obvious."

> "Free tier hooks individual developers. Pro converts them. Agency plan at $79 targets small studios with teams — that's the recurring revenue layer."

---

### Minute 4:15–4:45 — The Moat (why this isn't just ChatGPT)

Judges will think this. Address it directly.

> "You might think — couldn't I just paste this into ChatGPT? No. ChatGPT doesn't remember your project scope. It doesn't send the email. It doesn't host the approval page. It doesn't create the GitHub issue. It doesn't build the audit trail. The product isn't the AI analysis — it's the workflow. Every project you run through Monad builds an approval history that becomes your evidence if a client ever disputes an invoice. That history is the moat."

---

### Minute 4:45–5:00 — The Close

> "We built Monad because developers are losing thousands of dollars a year not because they're bad at their jobs — but because they're too busy doing their jobs to fight for what they're owed. Monad fights for them. Automatically."

Short pause.

> "Monad. Clients email you like normal. We handle the rest."

---

### Q&A prep — anticipated judge questions

| Question | Answer |
|---|---|
| "Isn't this just ChatGPT?" | "ChatGPT can't remember your scope, send emails, host approval pages, create GitHub issues, or build an audit trail. The workflow is the product." |
| "What about Bonsai / HoneyBook?" | "Those manage money after the work is done. We catch the moment before the developer accidentally agrees to unpaid work." |
| "How do you get clients to use it?" | "They don't use it. They receive a normal-looking email from their developer. One click on a link. That's all they do." |
| "What's stopping someone from copying this?" | "The approval history and rate card calibration. The longer you use it, the more accurate your estimates become and the stronger your evidence trail is." |
| "Is this legal proof?" | "It's a commercial approval trail — timestamped, IP-recorded, checkbox-confirmed. It makes disputes resolvable without legal action, which is what matters in practice." |

---

# PART 25: PRE-DEMO CHECKLIST

Run through this in the 2 hours before presenting. In order.

**Environment:**
- [ ] Vercel deployment live and accessible
- [ ] All env vars set in Vercel dashboard (not just local)
- [ ] Supabase is on the correct project (not local dev)
- [ ] Demo seed SQL has been run — check Marcus project exists in Supabase table editor
- [ ] Demo request is in `pending_review` status (reset it if you ran a rehearsal)
- [ ] GitHub repo connected — `monad-approved` label exists
- [ ] Postmark inbound email tested OR fallback paste input confirmed working

**The demo flow — run it once:**
- [ ] Log in as demo account — lands on dashboard
- [ ] Inbox shows Marcus's request with OUT OF SCOPE badge
- [ ] Click into request — both panels render correctly
- [ ] Cost shows $3,240–$5,400 in amber
- [ ] Evidence quotes are visible
- [ ] Draft reply is populated
- [ ] Click "Send to Client" — no error
- [ ] Open approval page URL on phone — renders correctly
- [ ] Checkbox works
- [ ] Approve button activates after checkbox
- [ ] Click Approve on phone
- [ ] Switch to laptop — GitHub issue visible (or mock visible)
- [ ] Dashboard metric updates to show protected value
- [ ] Proof pack shows the request with approval timestamp

**Reset for actual demo:**
- [ ] Reset request status back to `pending_review` in Supabase
- [ ] Clear `approved_at`, `github_issue_number` fields
- [ ] Close any test approval tabs on phone
- [ ] Refresh dashboard to clear any cached state

**Presentation:**
- [ ] Screen mirroring works (test with projector/display if possible)
- [ ] Browser zoom set to 110% (easier for crowd to read)
- [ ] Tab order: dashboard → request → approval page (phone) → GitHub → proof pack
- [ ] Phone unlocked, approval page URL bookmarked or in notes app
- [ ] All team members know their role during the demo (who talks, who clicks, who holds the phone)
- [ ] Timer running — 5 minutes is strict

---

*PRD Version 1.2 — Final — Built for SaaSathon 2026 — 40 hours to demo — Ship it.*
