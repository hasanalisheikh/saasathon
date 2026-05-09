import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import {
  ArrowRight,
  Check,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  FileText,
  GitBranch,
  GitPullRequest,
  LockKeyhole,
  MessageSquareText,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Workflow,
} from 'lucide-react'
import { BrandMark } from '@/components/brand-mark'

const workflowSteps: Array<{
  icon: LucideIcon
  title: string
  description: string
}> = [
  {
    icon: MessageSquareText,
    title: 'Capture the ask',
    description: 'Drop in the Slack message, client note, or manual request and keep the context intact.',
  },
  {
    icon: ScanLine,
    title: 'Get the scope read',
    description: 'Monad compares the ask against the original agreement, cost, timeline, and risk.',
  },
  {
    icon: GitPullRequest,
    title: 'Approve before build',
    description: 'Clients get a clean approval page and you get the GitHub trail before work starts.',
  },
]

const signals = [
  { label: 'Potential leak blocked', value: '$4,850', icon: CircleDollarSign },
  { label: 'Approval time saved', value: '3.2h', icon: Clock3 },
  { label: 'Proof pack ready', value: '1 click', icon: FileText },
]

const evidenceItems = [
  'Original client wording',
  'Scope comparison',
  'Cost and timeline impact',
  'Approval timestamp',
  'GitHub issue reference',
]

const pricing = [
  {
    name: 'Starter',
    price: '$0',
    sub: 'forever',
    description: 'For one project that needs a sharper boundary.',
    features: ['1 active project', '10 analyses per month', 'Client approval flow', 'Basic proof pack'],
    cta: 'Start free',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$29',
    sub: 'per month',
    description: 'For freelancers who want every client ask logged.',
    features: [
      'Unlimited projects',
      'Unlimited analyses',
      'GitHub issue creation',
      'PDF proof exports',
      'Unapproved work detection',
    ],
    cta: 'Start Pro',
    highlighted: true,
  },
  {
    name: 'Studio',
    price: '$79',
    sub: 'per month',
    description: 'For teams standardising change requests.',
    features: [
      'Everything in Pro',
      'Team workspace',
      'White-label approvals',
      'Enhanced dispute pack',
      'Priority support',
    ],
    cta: 'Talk to us',
    highlighted: false,
  },
]

export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#020202] text-[#fafafa]">
      <nav className="sticky top-0 z-40 border-b border-white/10 bg-[#020202]/85 px-5 py-4 backdrop-blur-xl sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Link href="/" aria-label="Monad home">
            <BrandMark size="md" />
          </Link>
          <div className="flex items-center gap-2 sm:gap-5">
            <a className="hidden text-sm text-[#a3a3a3] transition hover:text-white sm:inline" href="#how">
              Workflow
            </a>
            <a className="hidden text-sm text-[#a3a3a3] transition hover:text-white sm:inline" href="#pricing">
              Pricing
            </a>
            <Link className="text-sm text-[#a3a3a3] transition hover:text-white" href="/login">
              Log in
            </Link>
            <Link
              className="inline-flex h-9 items-center gap-2 rounded-md bg-[#262626] px-3 text-sm font-semibold text-white shadow-[0_0_28px_rgba(23,23,23,0.32)] transition hover:bg-[#404040] sm:px-4"
              href="/signup"
            >
              Start free
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative isolate min-h-[78svh] overflow-hidden px-5 pb-14 pt-16 sm:px-8 sm:pt-20 lg:px-12">
        <HeroScene />
        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="max-w-4xl py-10 sm:py-14 lg:py-20">
            <div className="mb-6 inline-flex items-center gap-2 rounded-md border border-[#262626]/30 bg-[#171717]/80 px-3 py-2 text-sm font-medium text-[#e5e5e5] backdrop-blur">
              <ShieldCheck className="size-4 text-[#22d3ee]" />
              Scope protection for developers and studios
            </div>
            <h1 className="max-w-4xl text-5xl font-semibold leading-[0.95] text-white sm:text-7xl lg:text-8xl">
              Scope creep control.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-[#d4d4d4] sm:text-xl">
              Monad turns messy client requests into priced, approved, GitHub-backed change requests before
              they quietly become free work.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-[#171717] px-5 text-sm font-semibold text-white shadow-[0_0_34px_rgba(23,23,23,0.34)] transition hover:bg-[#262626]"
                href="/signup"
              >
                <Sparkles className="size-4" />
                Start free
              </Link>
              <a
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-white/15 bg-white/[0.03] px-5 text-sm font-semibold text-[#fafafa] transition hover:border-[#e5e5e5]/50 hover:bg-white/[0.06]"
                href="#how"
              >
                See the workflow
                <ArrowRight className="size-4" />
              </a>
            </div>
            <div className="mt-10 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
              {signals.map((signal) => (
                <div
                  className="rounded-md border border-white/10 bg-[#0a0a0a]/75 p-4 shadow-[0_18px_60px_rgba(0,0,0,0.24)] backdrop-blur"
                  key={signal.label}
                >
                  <signal.icon className="mb-3 size-4 text-[#22d3ee]" />
                  <p className="text-2xl font-semibold text-white">{signal.value}</p>
                  <p className="mt-1 text-sm text-[#a3a3a3]">{signal.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#0a0a0a] px-5 py-6 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-4 text-sm text-[#a3a3a3] md:grid-cols-3">
          <p className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-[#34d399]" />
            No portal for clients to learn
          </p>
          <p className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-[#34d399]" />
            No guessing what was approved
          </p>
          <p className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-[#34d399]" />
            No unpaid &quot;quick additions&quot;
          </p>
        </div>
      </section>

      <section id="how" className="px-5 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="mb-4 text-sm font-semibold text-[#d4d4d4]">How Monad works</p>
            <h2 className="text-3xl font-semibold text-white sm:text-5xl">
              Built around the moment scope gets slippery.
            </h2>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {workflowSteps.map((step, index) => (
              <div
                className="rounded-lg border border-white/10 bg-[#111111] p-6 transition hover:border-[#262626]/50 hover:bg-[#171717]"
                key={step.title}
              >
                <div className="mb-8 flex items-center justify-between">
                  <div className="flex size-11 items-center justify-center rounded-md bg-[#262626] text-[#e5e5e5]">
                    <step.icon className="size-5" />
                  </div>
                  <span className="text-sm font-semibold text-[#6d5f85]">0{index + 1}</span>
                </div>
                <h3 className="text-xl font-semibold text-white">{step.title}</h3>
                <p className="mt-3 leading-7 text-[#a3a3a3]">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#0a0a0a] px-5 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <p className="mb-4 text-sm font-semibold text-[#22d3ee]">The proof layer</p>
            <h2 className="text-3xl font-semibold text-white sm:text-5xl">
              Every decision leaves a clean trail.
            </h2>
            <p className="mt-5 max-w-xl text-lg leading-8 text-[#d4d4d4]">
              When the client approves, Monad packages the context you need: the ask, the scope gap,
              the estimate, and the implementation reference.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {evidenceItems.map((item) => (
                <p className="flex items-center gap-3 text-sm text-[#e5e5e5]" key={item}>
                  <span className="flex size-6 items-center justify-center rounded-md bg-[#182d2b] text-[#34d399]">
                    <Check className="size-4" />
                  </span>
                  {item}
                </p>
              ))}
            </div>
          </div>
          <EvidencePanel />
        </div>
      </section>

      <section id="pricing" className="px-5 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <p className="mb-4 text-sm font-semibold text-[#d4d4d4]">Pricing</p>
              <h2 className="text-3xl font-semibold text-white sm:text-5xl">
                Start with the leaks. Scale into the system.
              </h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-[#a3a3a3]">
              Keep the public site simple for launch, then let the dashboard carry the deeper reporting.
            </p>
          </div>
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {pricing.map((plan) => (
              <div
                className={`rounded-lg border p-6 ${
                  plan.highlighted
                    ? 'border-[#171717] bg-[#171717] shadow-[0_0_60px_rgba(23,23,23,0.18)]'
                    : 'border-white/10 bg-[#111111]'
                }`}
                key={plan.name}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white">{plan.name}</h3>
                    <p className="mt-2 min-h-12 text-sm leading-6 text-[#a3a3a3]">{plan.description}</p>
                  </div>
                  {plan.highlighted && (
                    <span className="rounded-md border border-[#171717]/40 bg-[#262626] px-2 py-1 text-xs font-semibold text-[#f5f5f5]">
                      Best fit
                    </span>
                  )}
                </div>
                <div className="mt-7 flex items-end gap-2">
                  <span className="text-4xl font-semibold text-white">{plan.price}</span>
                  <span className="pb-1 text-sm text-[#737373]">{plan.sub}</span>
                </div>
                <ul className="mt-7 space-y-3">
                  {plan.features.map((feature) => (
                    <li className="flex gap-3 text-sm text-[#d4d4d4]" key={feature}>
                      <Check className="mt-0.5 size-4 shrink-0 text-[#34d399]" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  className={`mt-8 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md text-sm font-semibold transition ${
                    plan.highlighted
                      ? 'bg-[#171717] text-white hover:bg-[#262626]'
                      : 'border border-white/15 bg-white/[0.03] text-white hover:border-[#e5e5e5]/50 hover:bg-white/[0.06]'
                  }`}
                  href="/signup"
                >
                  {plan.cta}
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-[#020202] px-5 py-10 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 text-sm text-[#737373] md:flex-row md:items-center">
          <BrandMark size="sm" />
          <p>The layer between what clients ask for and what developers build.</p>
          <p>(c) 2026 Monad</p>
        </div>
      </footer>
    </main>
  )
}

function HeroScene() {
  return (
    <div aria-hidden="true" className="absolute inset-0 -z-10">
      <div
        className="absolute inset-0 opacity-35"
        style={{
          backgroundImage:
            'linear-gradient(rgba(23,23,23,0.13) 1px, transparent 1px), linear-gradient(90deg, rgba(23,23,23,0.13) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
        }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,#020202_0%,rgba(5,3,10,0.9)_38%,rgba(5,3,10,0.34)_100%)]" />
      <div className="absolute -right-72 top-10 hidden w-[920px] rotate-[-5deg] rounded-lg border border-[#262626]/25 bg-[#0a0a0a]/95 shadow-[0_0_90px_rgba(23,23,23,0.22)] backdrop-blur md:block xl:right-[-120px]">
        <div className="flex h-11 items-center gap-2 border-b border-white/10 px-4">
          <span className="size-2 rounded-full bg-[#fb7185]" />
          <span className="size-2 rounded-full bg-[#facc15]" />
          <span className="size-2 rounded-full bg-[#34d399]" />
          <span className="ml-4 text-xs text-[#737373]">monad / change-request-142</span>
        </div>
        <div className="grid grid-cols-[1.05fr_0.95fr] gap-px bg-[#262626]/15">
          <div className="bg-[#0a0a0a] p-5">
            <div className="rounded-md border border-white/10 bg-[#0e0818] p-4">
              <div className="flex items-center gap-3">
                <MessageSquareText className="size-5 text-[#22d3ee]" />
                <div>
                  <p className="text-sm font-semibold text-white">Client request detected</p>
                  <p className="text-xs text-[#737373]">
                    &quot;Can we also add subscriptions this week?&quot;
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4 grid gap-3">
              {[
                ['Original scope', 'Brochure site and contact form'],
                ['New ask', 'Recurring billing and account area'],
                ['Classification', 'Out of scope'],
              ].map(([label, value]) => (
                <div className="rounded-md border border-white/10 bg-[#111111] p-4" key={label}>
                  <p className="text-xs text-[#737373]">{label}</p>
                  <p className="mt-1 text-sm font-medium text-[#f5f5f5]">{value}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-[#111111] p-5">
            <div className="rounded-md border border-[#171717]/30 bg-[#171717] p-5">
              <div className="mb-5 flex items-center justify-between">
                <p className="text-sm font-semibold text-white">Approval packet</p>
                <LockKeyhole className="size-4 text-[#e5e5e5]" />
              </div>
              <div className="space-y-3">
                <div className="h-2 rounded-full bg-[#404040]" />
                <div className="h-2 w-4/5 rounded-full bg-[#404040]" />
                <div className="h-2 w-3/5 rounded-full bg-[#404040]" />
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-md bg-[#0a0a0a] p-3">
                  <p className="text-xs text-[#737373]">Cost impact</p>
                  <p className="mt-1 text-xl font-semibold text-[#e5e5e5]">$2.4k</p>
                </div>
                <div className="rounded-md bg-[#0a0a0a] p-3">
                  <p className="text-xs text-[#737373]">Timeline</p>
                  <p className="mt-1 text-xl font-semibold text-[#22d3ee]">+5d</p>
                </div>
              </div>
              <div className="mt-5 flex items-center gap-2 rounded-md bg-[#262626] px-3 py-2 text-xs text-[#e5e5e5]">
                <GitBranch className="size-4 text-[#34d399]" />
                GitHub issue prepared after approval
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function EvidencePanel() {
  return (
    <div className="rounded-lg border border-white/10 bg-[#111111] p-5 shadow-[0_30px_90px_rgba(0,0,0,0.26)]">
      <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-md bg-[#262626] text-[#e5e5e5]">
            <Workflow className="size-5" />
          </div>
          <div>
            <p className="font-semibold text-white">Change request approved</p>
            <p className="text-sm text-[#737373]">ready for implementation</p>
          </div>
        </div>
        <span className="rounded-md bg-[#12352b] px-2 py-1 text-xs font-semibold text-[#86efac]">
          Signed
        </span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-md border border-white/10 bg-[#0a0a0a] p-4">
          <p className="text-xs text-[#737373]">Client ask</p>
          <p className="mt-2 text-sm leading-6 text-[#e5e5e5]">
            Add paid subscriptions and member-only pages to the launch scope.
          </p>
        </div>
        <div className="rounded-md border border-white/10 bg-[#0a0a0a] p-4">
          <p className="text-xs text-[#737373]">Scope result</p>
          <p className="mt-2 text-sm leading-6 text-[#e5e5e5]">
            Outside baseline agreement. Requires backend, billing, and account QA.
          </p>
        </div>
      </div>
      <div className="mt-4 rounded-md border border-[#262626]/25 bg-[#171717] p-4">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs text-[#737373]">Approved estimate</p>
            <p className="mt-1 text-3xl font-semibold text-white">$2,400 - $3,100</p>
          </div>
          <div className="rounded-md border border-white/10 bg-[#0a0a0a] px-3 py-2 text-sm text-[#e5e5e5]">
            issue #142
          </div>
        </div>
      </div>
    </div>
  )
}
