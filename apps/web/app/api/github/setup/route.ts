import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { appendGitHubStatus } from '@/lib/github-connect'
import { isGitHubAppConfigured } from '@/lib/github-config'
import {
  buildGitHubAppAuthorizationUrl,
  decodeGitHubAppState,
  encodeGitHubAppState,
  GITHUB_APP_STATE_COOKIE,
  normalizeGitHubReturnTo,
  parseGitHubInstallationId,
} from '@/lib/github'

function buildRedirect(
  req: NextRequest,
  returnTo: string,
  status: 'app_not_configured' | 'setup_failed'
) {
  const response = NextResponse.redirect(new URL(appendGitHubStatus(returnTo, status), req.url))
  response.cookies.delete(GITHUB_APP_STATE_COOKIE)
  return response
}

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  const currentState = decodeGitHubAppState(req.nextUrl.searchParams.get('state'))
  const fallbackReturnTo = normalizeGitHubReturnTo(
    currentState?.returnTo ?? null,
    currentState?.projectId ? `/projects/${currentState.projectId}/github-setup` : '/integrations'
  )

  if (!isGitHubAppConfigured()) {
    return buildRedirect(req, fallbackReturnTo, 'app_not_configured')
  }

  const installationId = parseGitHubInstallationId(req.nextUrl.searchParams.get('installation_id'))
  const cookieNonce = req.cookies.get(GITHUB_APP_STATE_COOKIE)?.value

  if (
    !currentState ||
    !installationId ||
    currentState.userId !== user.id ||
    !cookieNonce ||
    cookieNonce !== currentState.nonce
  ) {
    return buildRedirect(req, fallbackReturnTo, 'setup_failed')
  }

  const { data: project } = await supabase
    .from('projects')
    .select('id')
    .eq('id', currentState.projectId)
    .eq('user_id', user.id)
    .single()

  if (!project) {
    return buildRedirect(req, fallbackReturnTo, 'setup_failed')
  }

  const signedState = encodeGitHubAppState({
    ...currentState,
    installationId,
  })

  const response = NextResponse.redirect(buildGitHubAppAuthorizationUrl(signedState))
  response.cookies.set({
    name: GITHUB_APP_STATE_COOKIE,
    value: currentState.nonce,
    httpOnly: true,
    sameSite: 'lax',
    secure: req.nextUrl.protocol === 'https:',
    maxAge: 60 * 10,
    path: '/',
  })

  return response
}
