import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { appendGitHubStatus } from '@/lib/github-connect'

const CLIENT_ID = process.env.GITHUB_CLIENT_ID!
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET!
const STATE_COOKIE = 'github_oauth_state'

type OAuthState = {
  nonce: string
  projectId: string | null
  returnTo: string
  userId: string
}

function isGitHubOAuthReady() {
  return Boolean(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET)
}

function normalizeReturnTo(returnTo: string | null, fallback: string) {
  if (!returnTo) return fallback

  try {
    const url = new URL(returnTo, 'http://monad.local')
    if (url.origin !== 'http://monad.local') return fallback
    if (!url.pathname.startsWith('/') || url.pathname.startsWith('//')) return fallback
    return `${url.pathname}${url.search}`
  } catch {
    return fallback
  }
}

function encodeState(state: OAuthState) {
  return Buffer.from(JSON.stringify(state), 'utf8').toString('base64url')
}

function decodeState(value: string | null): OAuthState | null {
  if (!value) return null

  try {
    const parsed = JSON.parse(Buffer.from(value, 'base64url').toString('utf8'))
    if (
      typeof parsed?.nonce === 'string' &&
      typeof parsed?.returnTo === 'string' &&
      typeof parsed?.userId === 'string' &&
      (typeof parsed?.projectId === 'string' || parsed?.projectId === null)
    ) {
      return parsed as OAuthState
    }
  } catch {
    // Ignore invalid state payloads and fall back to the safe error redirect.
  }

  return null
}

function buildRedirect(req: NextRequest, returnTo: string, status: 'oauth_not_configured' | 'oauth_failed' | 'connected') {
  return NextResponse.redirect(new URL(appendGitHubStatus(returnTo, status), req.url))
}

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  const { searchParams } = req.nextUrl
  const code = searchParams.get('code')
  const projectId = searchParams.get('projectId')
  const fallbackReturnTo = projectId ? `/projects/${projectId}/github-setup` : '/settings'
  const returnTo = normalizeReturnTo(searchParams.get('returnTo'), fallbackReturnTo)
  const state = decodeState(searchParams.get('state'))

  // Step 1: Redirect to GitHub
  if (!code) {
    if (!isGitHubOAuthReady()) {
      return buildRedirect(req, returnTo, 'oauth_not_configured')
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    const callbackUrl = `${appUrl}/api/github/connect`
    const nonce = crypto.randomUUID()
    const authUrl = new URL('https://github.com/login/oauth/authorize')

    authUrl.searchParams.set('client_id', CLIENT_ID)
    authUrl.searchParams.set('scope', 'repo,write:repo_hook')
    authUrl.searchParams.set('redirect_uri', callbackUrl)
    authUrl.searchParams.set(
      'state',
      encodeState({
        nonce,
        projectId,
        returnTo,
        userId: user.id,
      })
    )

    const response = NextResponse.redirect(authUrl)
    response.cookies.set({
      name: STATE_COOKIE,
      value: nonce,
      httpOnly: true,
      sameSite: 'lax',
      secure: req.nextUrl.protocol === 'https:',
      maxAge: 60 * 10,
      path: '/',
    })
    return response
  }

  const safeReturnTo = normalizeReturnTo(state?.returnTo ?? null, fallbackReturnTo)
  const cookieNonce = req.cookies.get(STATE_COOKIE)?.value

  if (!state || state.userId !== user.id || !cookieNonce || cookieNonce !== state.nonce) {
    const response = buildRedirect(req, safeReturnTo, 'oauth_failed')
    response.cookies.delete(STATE_COOKIE)
    return response
  }

  if (!isGitHubOAuthReady()) {
    const response = buildRedirect(req, safeReturnTo, 'oauth_not_configured')
    response.cookies.delete(STATE_COOKIE)
    return response
  }

  // Step 2: Exchange code for token
  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { Accept: 'application/json' },
    body: new URLSearchParams({ client_id: CLIENT_ID, client_secret: CLIENT_SECRET, code }),
  })
  const { access_token, error } = await tokenRes.json()

  if (error || !access_token) {
    const response = buildRedirect(req, safeReturnTo, 'oauth_failed')
    response.cookies.delete(STATE_COOKIE)
    return response
  }

  // Fetch GitHub username to store on the profile
  const ghUser = await fetch('https://api.github.com/user', {
    headers: { Authorization: `Bearer ${access_token}`, 'User-Agent': 'Monad-App' },
  }).then((r) => r.json()).catch(() => null)
  const github_username = ghUser?.login ?? null

  if (!github_username) {
    const response = buildRedirect(req, safeReturnTo, 'oauth_failed')
    response.cookies.delete(STATE_COOKIE)
    return response
  }

  await supabase
    .from('profiles')
    .update({ github_username, github_access_token: access_token })
    .eq('id', user.id)

  const response = buildRedirect(req, safeReturnTo, 'connected')
  response.cookies.delete(STATE_COOKIE)
  return response
}
