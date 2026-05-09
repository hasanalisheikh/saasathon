import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { appendGitHubStatus } from '@/lib/github-connect'
import { isGitHubAppConfigured } from '@/lib/github-config'
import {
  buildGitHubAppAuthorizationUrl,
  encodeGitHubAppState,
  GITHUB_APP_STATE_COOKIE,
  normalizeGitHubReturnTo,
} from '@/lib/github'

function buildRedirect(req: NextRequest, returnTo: string, status: 'app_not_configured' | 'auth_failed') {
  return NextResponse.redirect(new URL(appendGitHubStatus(returnTo, status), req.url))
}

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  const projectId = req.nextUrl.searchParams.get('projectId')
  if (!projectId) {
    return NextResponse.redirect(new URL('/integrations', req.url))
  }

  const fallbackReturnTo = `/projects/${projectId}/github-setup`
  const returnTo = normalizeGitHubReturnTo(req.nextUrl.searchParams.get('returnTo'), fallbackReturnTo)

  if (!isGitHubAppConfigured()) {
    return buildRedirect(req, returnTo, 'app_not_configured')
  }

  const { data: project } = await supabase
    .from('projects')
    .select('id')
    .eq('id', projectId)
    .eq('user_id', user.id)
    .single()

  if (!project) {
    return buildRedirect(req, returnTo, 'auth_failed')
  }

  const nonce = crypto.randomUUID()
  const signedState = encodeGitHubAppState({
    flow: 'connect',
    installationId: null,
    nonce,
    projectId,
    returnTo,
    userId: user.id,
  })

  const response = NextResponse.redirect(buildGitHubAppAuthorizationUrl(signedState))
  response.cookies.set({
    name: GITHUB_APP_STATE_COOKIE,
    value: nonce,
    httpOnly: true,
    sameSite: 'lax',
    secure: req.nextUrl.protocol === 'https:',
    maxAge: 60 * 10,
    path: '/',
  })

  return response
}
