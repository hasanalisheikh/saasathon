import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { Classification, RequestStatus, RiskLevel } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatCostRange(min: number, max: number): string {
  return `${formatCurrency(min)} – ${formatCurrency(max)}`
}

export function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

export function classificationLabel(c: Classification): string {
  switch (c) {
    case 'in_scope': return 'In Scope'
    case 'out_of_scope': return 'Out of Scope'
    case 'ambiguous': return 'Ambiguous'
    case 'clarification_needed': return 'Clarify'
    default: return 'Analysing...'
  }
}

export function classificationColor(c: Classification): string {
  switch (c) {
    case 'in_scope': return 'green'
    case 'out_of_scope': return 'red'
    case 'ambiguous': return 'amber'
    case 'clarification_needed': return 'blue'
    default: return 'gray'
  }
}

export function statusLabel(s: RequestStatus): string {
  switch (s) {
    case 'pending_review': return 'Pending Review'
    case 'sent_to_client': return 'Sent to Client'
    case 'approved': return 'Approved'
    case 'declined': return 'Declined'
    case 'deferred': return 'Deferred'
    case 'accepted_in_scope': return 'Accepted (In Scope)'
    default: return s
  }
}

export function riskLabel(r: RiskLevel): string {
  switch (r) {
    case 'low': return 'Low Risk'
    case 'medium': return 'Medium Risk'
    case 'high': return 'High Risk'
    default: return 'Unknown'
  }
}

export function generateInboundEmail(projectSlug: string): string {
  const random = Math.random().toString(36).substring(2, 8)
  const slug = projectSlug
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 20)
  const domain = process.env.INBOUND_EMAIL_DOMAIN ?? 'inbound.monad.app'
  return `${slug}-${random}@${domain}`
}

export function computeCost(hours: number, hourlyRate: number): number {
  return Math.round(hours * hourlyRate)
}
