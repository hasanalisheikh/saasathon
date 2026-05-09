"use client"

import { useState, useEffect } from 'react'
import { ArrowRight, MessageSquareText, ScanLine, GitPullRequest } from 'lucide-react'
import { cn } from '@workspace/ui/lib/utils'

const workflowSteps = [
  {
    icon: MessageSquareText,
    title: 'Capture the request',
    description: 'Retain context seamlessly from Slack messages, client notes, or direct requests without friction.',
    color: 'bg-[#097fe8]',
    textColor: 'text-white',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop',
  },
  {
    icon: ScanLine,
    title: 'Evaluate the scope',
    description: 'Monad autonomously cross-references requests against the baseline agreement, automatically calculating revised timelines, cost impact, and execution risk.',
    color: 'bg-[#097fe8]',
    textColor: 'text-white',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop',
  },
  {
    icon: GitPullRequest,
    title: 'Empower your team',
    description: 'Your team receives a streamlined review interface where AI drafts a highly professional, contract-backed response to stakeholders, while seamlessly sending them progress updates as features ship.',
    color: 'bg-[#097fe8]',
    textColor: 'text-white',
    image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=2064&auto=format&fit=crop',
  },
]

export function WorkflowSection() {
  const [activeStep, setActiveStep] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % workflowSteps.length)
    }, 22000)
    return () => clearInterval(timer)
  }, [])

  return (
    <section id="how" className="px-5 py-20 bg-neutral-50">
      <div className="mx-auto max-w-7xl">
        <div className="grid lg:grid-cols-[1fr_1.5fr] items-stretch bg-card border border-border rounded-3xl  overflow-hidden">
          {/* Left Column */}
          <div className="px-8 py-10 box-border flex flex-col justify-center">
            <p className="mb-2 text-sm font-semibold text-muted-foreground">Workflow</p>
            <h2 className="mb-6 text-3xl font-bold sm:text-4xl text-foreground">
              Engineered for the critical moment scope expands.
            </h2>
            <button className="mb-10 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
              <ArrowRight className="size-4" />
            </button>

            <div className="flex flex-col">
              {workflowSteps.map((step, index) => {
                const isActive = activeStep === index
                const Icon = step.icon
                return (
                  <button
                    key={step.title}
                    onClick={() => setActiveStep(index)}
                    className="flex flex-col p-4 text-left transition-all border-b border-border last:border-b-0 hover:bg-neutral-100 hover:border-transparent hover:rounded-xl dark:hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors",
                        step.color
                      )}>
                        <Icon className={cn("size-4", step.textColor)} />
                      </div>
                      <span className="font-bold text-[16px] text-foreground">
                        {step.title}
                      </span>
                    </div>
                    {/* Expandable description area */}
                    <div className={cn(
                      "grid transition-all duration-300 ease-in-out",
                      isActive ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    )}>
                      <div className="overflow-hidden">
                        <p className="pl-12 pr-4 pt-2 pb-2 text-[15px] leading-relaxed text-muted-foreground">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Right Column - Graphic Placeholder */}
          <div className="relative min-h-[400px] w-full bg-muted/30 border-t lg:border-t-0 lg:border-l border-border overflow-hidden">
            {workflowSteps.map((step, index) => (
              <img
                key={step.title}
                src={step.image}
                alt={step.title}
                className={cn(
                  "absolute inset-0 w-full h-full object-cover transition-opacity duration-500",
                  activeStep === index ? "opacity-100" : "opacity-0"
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
