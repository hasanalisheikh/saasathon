import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { listUserRepos, listInstallationRepos } from '@/lib/github'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const projectId = req.nextUrl.searchParams.get('projectId')
  if (!projectId) return NextResponse.json({ error: 'projectId required' }, { status: 400 })

  const { data: project } = await supabase
    .from('projects')
    .select('id')
    .eq('id', projectId)
    .eq('user_id', user.id)
    .single()

  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('github_access_token, github_installation_id')
    .eq('id', user.id)
    .single()

  if (profile?.github_installation_id) {
    const repos = await listInstallationRepos(profile.github_installation_id)
    return NextResponse.json(repos)
  }

  if (!profile?.github_access_token) {
    return NextResponse.json({
      error: 'GitHub App not installed. Please go to Settings to install it.',
    }, { status: 400 })
  }

  const repos = await listUserRepos(profile.github_access_token)
  return NextResponse.json(repos)
}
