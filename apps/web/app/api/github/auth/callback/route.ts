import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { appendGitHubStatus } from '@/lib/github-connect'
import { isGitHubAppConfigured } from '@/lib/github-config'
import {
  buildGitHubAppInstallUrl,
  decodeGitHubAppState,
  encodeGitHubAppState,
  encodeGitHubInstallationSelectionState,
  exchangeCodeForGitHubUserToken,
  GITHUB_APP_INSTALLATIONS_COOKIE,
  GITHUB_APP_STATE_COOKIE,
  listUserInstallations,
  normalizeGitHubReturnTo,
} from '@/lib/github'

function buildRedirect(
  req: NextRequest,
  returnTo: string,
  status:
    | 'app_not_configured'
    | 'auth_failed'
    | 'installation_created'
    | 'installation_selection_required'
) {
  const response = NextResponse.redirect(new URL(appendGitHubStatus(returnTo, status), req.url))
  response.cookies.delete(GITHUB_APP_STATE_COOKIE)
  if (status !== 'installation_selection_required') {
    response.cookies.delete(GITHUB_APP_INSTALLATIONS_COOKIE)
  }
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

  const code = req.nextUrl.searchParams.get('code')
  const currentState = decodeGitHubAppState(req.nextUrl.searchParams.get('state'))
  const fallbackReturnTo = normalizeGitHubReturnTo(
    currentState?.returnTo ?? null,
    currentState?.projectId ? `/projects/${currentState.projectId}/github-setup` : '/integrations'
  )
  const cookieNonce = req.cookies.get(GITHUB_APP_STATE_COOKIE)?.value

  if (
    !isGitHubAppConfigured() ||
    !code ||
    !currentState ||
    currentState.userId !== user.id ||
    (cookieNonce && cookieNonce !== currentState.nonce)
  ) {
    return buildRedirect(req, fallbackReturnTo, isGitHubAppConfigured() ? 'auth_failed' : 'app_not_configured')
  }

  try {
    const userToken = await exchangeCodeForGitHubUserToken(code)
    const installations = await listUserInstallations(userToken)

    if (!currentState.installationId) {
      if (installations.length === 0) {
        const restartState = encodeGitHubAppState({
          ...currentState,
          flow: 'install',
          installationId: null,
        })

        const response = NextResponse.redirect(buildGitHubAppInstallUrl(restartState))
        response.cookies.set({
          name: GITHUB_APP_STATE_COOKIE,
          value: currentState.nonce,
          httpOnly: true,
          sameSite: 'lax',
          secure: req.nextUrl.protocol === 'https:',
          maxAge: 60 * 10,
          path: '/',
        })
        response.cookies.delete(GITHUB_APP_INSTALLATIONS_COOKIE)
        return response
      }

      if (installations.length > 0) {
        const response = buildRedirect(req, fallbackReturnTo, 'installation_selection_required')
        response.cookies.set({
          name: GITHUB_APP_INSTALLATIONS_COOKIE,
          value: encodeGitHubInstallationSelectionState({
            installations,
            nonce: currentState.nonce,
            projectId: currentState.projectId,
            returnTo: currentState.returnTo,
            userId: currentState.userId,
          }),
          httpOnly: true,
          sameSite: 'lax',
          secure: req.nextUrl.protocol === 'https:',
          maxAge: 60 * 10,
          path: '/',
        })
        return response
      }
    }

    if (!installations.some((installation) => installation.id === currentState.installationId)) {
      return buildRedirect(req, fallbackReturnTo, 'auth_failed')
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .update({ github_access_token: userToken })
      .eq('id', user.id)

    if (profileError) {
      console.error('Failed to store GitHub user token:', profileError)
    }

    const { data: project, error } = await supabase
      .from('projects')
      .update({
        github_installation_id: currentState.installationId,
        github_repo_id: null,
        github_repo_name: null,
      })
      .eq('id', currentState.projectId)
      .eq('user_id', user.id)
      .select('id')
      .single()

    if (error || !project) {
      return buildRedirect(req, fallbackReturnTo, 'auth_failed')
    }

    return buildRedirect(req, fallbackReturnTo, 'installation_created')
  } catch (error) {
    console.error('GitHub App callback error:', error)
    return buildRedirect(req, fallbackReturnTo, 'auth_failed')
  }
}
