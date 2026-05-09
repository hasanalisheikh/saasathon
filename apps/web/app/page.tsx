import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import {
  ArrowRight,
  Check,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  FileText,
  Fingerprint,
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
import { WorkflowSection } from '@/components/workflow-section'
import { PricingSection } from '@/components/pricing-section'

const platformFeatures = [
  {
    icon: Fingerprint,
    title: 'Contextual AI extraction',
    description: 'Monad ingests raw, unstructured messages from Slack or email, parsing the exact technical requirements and filtering out conversational noise.',
    color: 'bg-[#097fe8]',
  },
  {
    icon: ShieldCheck,
    title: 'Predictive risk modelling',
    description: 'Autonomously flags potential architectural conflicts and technical debt vectors before you agree to a seemingly simple change.',
    color: 'bg-[#097fe8]',
  },
  {
    icon: MessageSquareText,
    title: 'Diplomatic response generation',
    description: 'Eliminates friction with stakeholders by drafting firm, professional, and contract-aligned responses that preserve relationships while protecting your boundaries.',
    color: 'bg-[#097fe8]',
  },
  {
    icon: Workflow,
    title: 'Real-time stakeholder parity',
    description: 'Keeps the entire feedback loop transparent. Clients receive automated, jargon-free progress updates synced directly from your commit history.',
    color: 'bg-[#097fe8]',
  },
]

const evidenceItems = [
  'Contract-backed AI responses',
  'Itemised deliverable receipts',
  'Verifiable conversation links',
  'Automated feature updates',
  'Mutual accountability audit log',
]



export default function LandingPage() {
  return (
    <main className="min-h-screen bg-neutral-50 text-foreground relative">
      <nav className="sticky top-0 z-40 px-5 py-4 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto grid max-w-7xl grid-cols-3 items-center gap-4">
          <div className="flex items-center justify-start">
            <Link href="/" aria-label="Monad home">
              <BrandMark size="md" />
            </Link>
          </div>
          <div className="flex items-center justify-center gap-6">
            <a className="hidden text-sm font-medium text-muted-foreground hover:text-foreground sm:inline transition-colors" href="#how">
              Workflow
            </a>
            <a className="hidden text-sm font-medium text-muted-foreground hover:text-foreground sm:inline transition-colors" href="#pricing">
              Pricing
            </a>
          </div>
          <div className="flex items-center justify-end gap-5">
            <Link
              className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              href="/signup"
            >
              Get Monad Free
            </Link>
            <Link className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors" href="/login">
              Log in
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative px-5 py-10 overflow-hidden">
        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <h1 className="font-sans text-[4.4rem] font-bold tracking-tight leading-15">
            Scope creep control.
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-[17px] leading-6 text-muted-foreground">
            Monad elevates informal client requests into structured, approved, and GitHub-verified change orders before
            they quietly evolve into unbilled deliverables.
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <Link
              className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-[15px] font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              href="/signup"
            >
              Get Monad Free
            </Link>
            <a
              className="inline-flex h-10 items-center justify-center rounded-md bg-secondary px-6 text-[15px] font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
              href="#how"
            >
              See the workflow
            </a>
          </div>

        </div>
      </section>

      <section className="bg-muted/50 border-y border-border px-5 py-6">
        <div className="mx-auto flex max-w-4xl justify-between flex-wrap gap-4 text-sm text-muted-foreground font-medium">
          <p className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-primary" />
            Itemised receipts halt invoice shock
          </p>
          <p className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-primary" />
            Absolute clarity on deliverables
          </p>
          <p className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-primary" />
            Zero uncompensated scope extensions
          </p>
        </div>
      </section>

      <WorkflowSection />

      <section className="px-5 py-4 bg-neutral-50">
        <div className="mx-auto max-w-7xl">
          <div className=" mb-8">
            <h2 className="text-3xl font-bold sm:text-4xl">
              Equipping your team for absolute clarity.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground max-w-3xl">
              A complete suite of tools designed to standardise how you process inbound requests, evaluate scope boundaries, and communicate with critical stakeholders.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {platformFeatures.map((feature) => (
              <div key={feature.title} className="border border-border bg-card text-card-foreground p-6 rounded-lg">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full mb-4 ${feature.color}`}>
                  <feature.icon className="size-4 text-white" />
                </div>
                <h3 className="font-bold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-stretch border border-border rounded-3xl overflow-hidden bg-background">
          <div className="px-8 py-10 flex flex-col justify-center">
            <p className="mb-4 text-sm font-semibold text-primary">The proof layer</p>
            <h2 className="text-3xl font-bold sm:text-4xl">
              Comprehensive audit trails for every decision.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
              Before engaging the client, Monad equips you with the essential context: the initial request, automatically calculated timeline impacts, execution risks, and a professionally drafted response anchored in your agreement. Every change is documented via an itemized receipt linked directly back to their original ask-eliminating end-of-project invoice shock and providing a definitive audit trail for mutual legal and financial accountability.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {evidenceItems.map((item) => (
                <p className="flex items-center gap-3 text-sm text-foreground" key={item}>
                  <span className="flex size-4 shrink-0 items-center justify-center rounded bg-blue-500 text-white">
                    <Check className="size-2.5" strokeWidth={3} />
                  </span>
                  {item}
                </p>
              ))}
            </div>
          </div>
          <div className="relative h-full min-h-[300px] w-full overflow-hidden border-t lg:border-t-0 lg:border-l border-border bg-muted">
            <img
              src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop"
              alt="Audit trail dashboard"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      <PricingSection />

      <footer className="border-t border-border bg-muted/50 px-5 py-10 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 text-sm text-muted-foreground md:flex-row md:items-center">
          <BrandMark size="sm" />
          <p>The layer between what clients ask for and what developers build.</p>
          <p>(c) 2026 Monad</p>
        </div>
      </footer>
    </main>
  )
}

