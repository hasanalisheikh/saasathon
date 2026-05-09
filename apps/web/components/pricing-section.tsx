import Link from 'next/link'
import { Check } from 'lucide-react'

const pricing = [
  {
    name: 'Starter',
    price: '$0',
    sub: 'forever',
    description: 'For professionals needing to establish firm boundaries and streamline stakeholder communication on a single project.',
    features: ['1 active project', '10 analyses per month', 'AI-assisted response drafting', 'Basic proof pack'],
    cta: 'Get Monad Free',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$29',
    sub: 'per month',
    description: 'For growing teams and professionals who need every inbound client or stakeholder request logged, analysed, and seamlessly converted to billable work.',
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
    description: 'For agencies operating at scale, requiring standardized change request workflows, team collaboration, and advanced dispute resolution.',
    features: [
      'Everything in Pro',
      'Team workspace',
      'Automated client milestone updates',
      'Enhanced dispute pack',
      'Priority support',
    ],
    cta: 'Talk to us',
    highlighted: false,
  },
]

export function PricingSection() {
  const primaryPlans = pricing.slice(0, 2)
  const studioPlan = pricing[2]
  if (!studioPlan) return null

  return (
    <section id="pricing" className="bg-background px-5 py-20 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <p className="mb-4 text-sm font-semibold text-muted-foreground">Pricing</p>
            <h2 className="text-3xl font-bold sm:text-4xl">
              Start with the leaks. Scale into the system.
            </h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-muted-foreground">
            Implement guardrails on a single critical project, or deploy Monad across your entire agency to systematically eliminate unbilled hours and standardize change management.
          </p>
        </div>
        <div className="mt-12 grid lg:grid-cols-[2fr_1fr] items-stretch gap-6">
          {/* Starter and Pro Group */}
          <div className="p-8 sm:p-10 flex flex-col border border-border rounded-3xl bg-card">
            <div className="grid sm:grid-cols-2 gap-x-10 gap-y-10 h-full">
              {primaryPlans.map((plan) => (
                <div key={plan.name} className="flex flex-col">
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-2xl font-bold text-foreground">{plan.name}</h3>
                      {plan.highlighted && (
                        <span className="shrink-0 rounded-md border border-border bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground">
                          Best fit
                        </span>
                      )}
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                      <span className="text-[15px] font-medium text-muted-foreground">{plan.sub}</span>
                    </div>
                    <p className="mt-4 min-h-12 text-[15px] leading-relaxed text-muted-foreground">{plan.description}</p>
                  </div>

                  <Link
                    className="mt-6 inline-flex h-10 w-full items-center justify-center rounded-md bg-secondary text-[15px] font-semibold text-secondary-foreground transition hover:bg-secondary/80"
                    href="/signup"
                  >
                    {plan.cta}
                  </Link>

                  <div className="mt-8 flex-1">
                    <p className="font-semibold text-[15px] text-foreground mb-4">
                      {plan.name === 'Starter' ? 'Includes:' : 'Everything in Starter, and:'}
                    </p>
                    <ul className="space-y-3">
                      {plan.features.map((feature) => (
                        <li className="flex items-start gap-3 text-[15px] text-muted-foreground" key={feature}>
                          <Check className="mt-0.5 size-4 shrink-0 text-foreground" />
                          <span className="leading-tight">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Studio Plan */}
          <div className="flex flex-col rounded-3xl border border-border bg-muted/50 p-8 sm:p-10">
            <div>
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-2xl font-bold text-foreground">{studioPlan.name}</h3>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-4xl font-bold text-foreground">{studioPlan.price}</span>
                <span className="text-[15px] font-medium text-muted-foreground">{studioPlan.sub}</span>
              </div>
              <p className="mt-4 min-h-12 text-[15px] leading-relaxed text-muted-foreground">{studioPlan.description}</p>
            </div>

            <Link
              className="mt-6 inline-flex h-10 w-full items-center justify-center rounded-md border border-border bg-background text-[15px] font-semibold text-foreground transition hover:bg-muted"
              href="/signup"
            >
              {studioPlan.cta}
            </Link>

            <div className="mt-8 flex-1">
              <p className="font-semibold text-[15px] text-foreground mb-4">
                Everything in Pro, and:
              </p>
              <ul className="space-y-3">
                {studioPlan.features.filter((f) => f !== 'Everything in Pro').map((feature) => (
                  <li className="flex items-start gap-3 text-[15px] text-muted-foreground" key={feature}>
                    <Check className="mt-0.5 size-4 shrink-0 text-foreground" />
                    <span className="leading-tight">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
