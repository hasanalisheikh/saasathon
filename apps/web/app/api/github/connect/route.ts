import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const CLIENT_ID = process.env.GITHUB_CLIENT_ID!
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET!

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = req.nextUrl
  const code = searchParams.get('code')
  const projectId = searchParams.get('state')

  // Step 1: Redirect to GitHub
  if (!code) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    const callbackUrl = `${appUrl}/api/github/connect`
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&scope=repo,write:repo_hook&state=${projectId ?? user.id}&redirect_uri=${encodeURIComponent(callbackUrl)}`
    return NextResponse.redirect(authUrl)
  }

  // Step 2: Exchange code for token
  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: CLIENT_ID, client_secret: CLIENT_SECRET, code }),
  })
  const { access_token, error } = await tokenRes.json()

  if (error || !access_token) {
    return NextResponse.redirect(new URL('/settings?github=error', req.url))
  }

  // Fetch GitHub username to store on the profile
  const ghUser = await fetch('https://api.github.com/user', {
    headers: { Authorization: `Bearer ${access_token}`, 'User-Agent': 'Monad-App' },
  }).then((r) => r.json()).catch(() => null)
  const github_username = ghUser?.login ?? null

  // Always persist username + token on profile
  await supabase.from('profiles').update({ github_username }).eq('id', user.id)

  // Store token on project (if projectId) or profile
  if (projectId && projectId !== user.id) {
    await supabase.from('projects').update({
      github_installation_id: access_token,
    }).eq('id', projectId).eq('user_id', user.id)
    return NextResponse.redirect(new URL(`/projects/${projectId}/github-setup`, req.url))
  }

  return NextResponse.redirect(new URL('/settings?github=connected', req.url))
}
