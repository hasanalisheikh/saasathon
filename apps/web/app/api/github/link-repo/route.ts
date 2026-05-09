import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { registerWebhook } from '@/lib/github'
import { isGitHubOAuthConfigured } from '@/lib/github-config'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { projectId, repoId, repoFullName } = await req.json()
  if (!projectId || !repoId || !repoFullName) {
    return NextResponse.json({ error: 'projectId, repoId, and repoFullName required' }, { status: 400 })
  }

  const { data: project } = await supabase
    .from('projects')
    .select('id')
    .eq('id', projectId)
    .eq('user_id', user.id)
    .single()

  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('github_access_token')
    .eq('id', user.id)
    .single()

  if (!profile?.github_access_token) {
    return NextResponse.json({
      error: isGitHubOAuthConfigured()
        ? 'GitHub account not connected'
        : 'GitHub is not connected yet. Add a personal access token in Settings to continue.',
    }, { status: 400 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const webhookUrl = `${appUrl}/api/webhooks/github`
  const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET ?? ''

  // Best-effort webhook registration — repo may already have one or token may lack write:repo_hook
  try {
    await registerWebhook({
      accessToken: profile.github_access_token,
      repoFullName,
      webhookUrl,
      secret: webhookSecret,
    })
  } catch {
    // Swallow — common if webhook already exists; repo linking still succeeds
  }

  const { error } = await supabase
    .from('projects')
    .update({
      github_repo_id: repoId,
      github_repo_name: repoFullName,
      github_installation_id: profile.github_access_token,
    })
    .eq('id', projectId)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
