import { NextResponse } from 'next/server'
import { isGitHubAppConfigured, isGitHubWebhookConfigured } from '@/lib/github-config'

export async function GET() {
  return NextResponse.json({
    appReady: isGitHubAppConfigured(),
    webhookReady: isGitHubWebhookConfigured(),
  })
}
