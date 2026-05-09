import Link from 'next/link'
import type { ComponentType } from 'react'
import {
  CheckCircle2,
  ExternalLink,
  Fingerprint,
  MessageSquareText,
  ShieldCheck,
} from 'lucide-react'
import { BrandMark } from '@/components/brand-mark'
import { HeroSignal } from '@/components/hero-signal'
import { WorkflowSection } from '@/components/workflow-section'
import { PricingSection } from '@/components/pricing-section'

type PlatformFeature = {
  icon: ComponentType<{ className?: string }>
  title: string
  color: string
  description?: string
  summary?: string
}

const problemStats = [
  {
    value: '52%',
    title: 'of projects hit uncontrolled scope changes',
    description:
      'PMI found that more than half of projects completed in the prior year experienced scope creep.',
    source: 'PMI Pulse of the Profession',
    href: 'https://www.pmi.org/learning/library/scope-creep-rising-11308',
  },
  {
    value: '57%',
    title: 'of agencies lose $1K-$5K every month',
    description:
      'Ignition found another 30% lose more than $5K monthly on unbilled projects and tasks.',
    source: 'Ignition Agency Pricing Report',
    href: 'https://www.ignitionapp.com/news/2025-agency-pricing-cashflow-report',
  },
  {
    value: '1%',
    title: 'of agencies bill every out-of-scope request',
    description:
      'The Drum reported that almost every agency absorbs at least some out-of-scope work.',
    source: 'The Drum / Ignition',
    href: 'https://www.thedrum.com/news/cash-flow-crunch-us-agencies-struggle-grow-late-payments-and-scope-creep-bite',
  },
  {
    value: '58.7%',
    title: 'of MSPs cite scope creep as their top challenge',
    description:
      'Moovila and The Channel Company found scope creep ranked above timeline and scheduling issues.',
    source: 'Moovila MSP Trends',
    href: 'https://www.prnewswire.com/news-releases/project-management-scope-creep-tops-list-of-challenges-for-59-of-msps-moovila-report-finds-302590885.html',
  },
  {
    value: '45%',
    title: 'average budget overrun on large IT projects',
    description:
      'McKinsey and Oxford also found those projects delivered 56% less value than predicted.',
    source: 'McKinsey + Oxford',
    href: 'https://www.mckinsey.com/capabilities/tech-and-ai/our-insights/delivering-large-scale-it-projects-on-time-on-budget-and-on-value',
  },
]

const platformFeatures: PlatformFeature[] = [
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
    icon: CheckCircle2,
    title: 'The proof layer',
    summary: 'Before you reply, Monad assembles the original ask, timeline impact, execution risks, contract-backed response, deliverable receipts, feature updates, and a verifiable audit trail into one review surface. Every change stays linked to the source conversation, so invoice shock never shows up at the end.',
    color: 'bg-[#097fe8]',
  },
]

export default function LandingPage() {
  return (
    <main className="relative min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-40 px-5 py-4 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto grid max-w-7xl grid-cols-[auto_1fr] items-center gap-4 sm:grid-cols-3">
          <div className="flex items-center justify-start">
            <Link href="/" aria-label="Monad home">
              <BrandMark size="md" />
            </Link>
          </div>
          <div className="hidden items-center justify-center gap-6 sm:flex">
            <a className="hidden text-sm font-medium text-muted-foreground hover:text-foreground sm:inline transition-colors" href="#how">
              Workflow
            </a>
            <a className="hidden text-sm font-medium text-muted-foreground hover:text-foreground sm:inline transition-colors" href="#pricing">
              Pricing
            </a>
          </div>
          <div className="flex items-center justify-end gap-3 sm:gap-5">
            <Link
              className="inline-flex h-9 items-center rounded-md bg-primary px-3 text-xs font-medium whitespace-nowrap text-primary-foreground transition-colors hover:bg-primary/90 sm:px-4 sm:text-sm"
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

      <section className="relative flex min-h-[calc(100svh-74px)] flex-col overflow-hidden">
        <div className="relative flex flex-1 items-center px-5 py-8 sm:py-10">
          <HeroSignal />
          <div className="relative z-10 mx-auto max-w-3xl text-center">
            <h1 className="font-sans text-5xl font-bold tracking-tight leading-none sm:text-[4.4rem] sm:leading-15">
              Scope creep control.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-[17px] leading-6 text-muted-foreground">
              Monad elevates informal client requests into structured, approved, and GitHub-verified change orders before
              they quietly evolve into unbilled deliverables.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-4">
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
        </div>

        <div className="mt-auto border-y border-border bg-muted/50 px-5 py-5">
          <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-x-10 gap-y-3 text-center text-sm font-medium text-muted-foreground lg:flex-nowrap">
            <p className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-[#097fe8]" />
              Itemised receipts halt invoice shock
            </p>
            <p className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-[#097fe8]" />
              Absolute clarity on deliverables
            </p>
            <p className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-[#097fe8]" />
              Zero uncompensated scope extensions
            </p>
          </div>
        </div>
      </section>

      <section className="bg-background px-5 pt-20 pb-10">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <p className="mb-2 text-sm font-semibold text-primary">The problem</p>
              <h2 className="max-w-3xl text-3xl font-bold sm:text-4xl">
                Scope creep is quiet until it reaches the invoice.
              </h2>
            </div>
            <p className="max-w-2xl text-base leading-relaxed text-muted-foreground lg:ml-auto">
              It starts as a quick favour, a small revision, or one extra feature. Without a formal approval trail,
              those informal asks become missed timelines, swallowed margin, and awkward client conversations after
              the work is already done.
            </p>
          </div>
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {problemStats.map((stat) => (
              <a
                aria-label={`${stat.title} source: ${stat.source}`}
                className="group flex min-h-[250px] flex-col justify-between rounded-lg border border-border bg-card p-5 text-card-foreground transition-all hover:border-[#097fe8]/60 hover:bg-muted/40"
                href={stat.href}
                key={stat.title}
                rel="noopener noreferrer"
                target="_blank"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-4xl font-bold tracking-tight text-foreground">{stat.value}</p>
                    <ExternalLink className="mt-1 size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-[#097fe8]" />
                  </div>
                  <h3 className="mt-5 text-sm font-bold leading-snug text-foreground">{stat.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{stat.description}</p>
                </div>
                <p className="mt-6 text-xs font-semibold text-primary">{stat.source}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      <WorkflowSection />

      <section className="bg-background px-5 py-4">
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
                <div className={`mb-4 flex h-8 w-8 items-center justify-center rounded-full ${feature.color}`}>
                  <feature.icon className="size-4 text-white" />
                </div>
                <h3 className="font-bold mb-2">{feature.title}</h3>
                {feature.description ? (
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                ) : null}
                {feature.summary ? (
                  <p className="text-sm text-muted-foreground">{feature.summary}</p>
                ) : null}
              </div>
            ))}
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
