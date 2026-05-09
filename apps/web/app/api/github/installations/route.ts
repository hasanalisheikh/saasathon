import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  decodeGitHubInstallationSelectionState,
  GITHUB_APP_INSTALLATIONS_COOKIE,
  listAppInstallations,
  parseGitHubInstallationId,
} from '@/lib/github'
import { isGitHubAppConfigured } from '@/lib/github-config'

async function validateProject(req: NextRequest, projectId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  const { data: project } = await supabase
    .from('projects')
    .select('id')
    .eq('id', projectId)
    .eq('user_id', user.id)
    .single()

  if (!project) {
    return { error: NextResponse.json({ error: 'Not found' }, { status: 404 }) }
  }

  return { project, supabase, user }
}

function readInstallationSelection(req: NextRequest) {
  return decodeGitHubInstallationSelectionState(req.cookies.get(GITHUB_APP_INSTALLATIONS_COOKIE)?.value)
}


export async function GET(req: NextRequest) {
  if (!isGitHubAppConfigured()) {
    return NextResponse.json({
      error: 'GitHub App is not configured. Add the GitHub App credentials to continue.',
    }, { status: 503 })
  }

  const projectId = req.nextUrl.searchParams.get('projectId')
  if (!projectId) {
    return NextResponse.json({ error: 'projectId required' }, { status: 400 })
  }

  const validation = await validateProject(req, projectId)
  if (validation.error) return validation.error

  // Try to read from cookie first (fresh install/auth flow)
  const selection = readInstallationSelection(req)
  if (selection && selection.projectId === projectId && selection.userId === validation.user.id) {
    return NextResponse.json(selection.installations)
  }

  // Fallback: Fetch all installations for the user using their OAuth token
  const { data: profile } = await validation.supabase
    .from('profiles')
    .select('github_access_token')
    .eq('id', validation.user.id)
    .single()

  if (profile?.github_access_token) {
    try {
      const { listUserInstallations } = await import('@/lib/github')
      const installations = await listUserInstallations(profile.github_access_token)
      return NextResponse.json(installations)
    } catch (err) {
      console.error('Failed to list user installations from token:', err)
    }
  }

  return NextResponse.json([])
}

export async function POST(req: NextRequest) {
  if (!isGitHubAppConfigured()) {
    return NextResponse.json({
      error: 'GitHub App is not configured. Add the GitHub App credentials to continue.',
    }, { status: 503 })
  }

  const { installationId, projectId } = await req.json()
  const normalizedInstallationId = parseGitHubInstallationId(installationId)

  if (!projectId || !normalizedInstallationId) {
    return NextResponse.json({ error: 'projectId and installationId required' }, { status: 400 })
  }

  const validation = await validateProject(req, projectId)
  if (validation.error) return validation.error

  const selection = readInstallationSelection(req)
  let isAvailable = false

  if (selection && selection.projectId === projectId && selection.userId === validation.user.id) {
    isAvailable = selection.installations.some((i) => i.id === normalizedInstallationId)
  }

  if (!isAvailable) {
    const { data: profile } = await validation.supabase
      .from('profiles')
      .select('github_access_token')
      .eq('id', validation.user.id)
      .single()

    if (profile?.github_access_token) {
      try {
        const { listUserInstallations } = await import('@/lib/github')
        const installations = await listUserInstallations(profile.github_access_token)
        isAvailable = installations.some((i) => i.id === normalizedInstallationId)
      } catch (err) {
        console.error('Failed to verify installation ownership:', err)
      }
    }
  }

  if (!isAvailable) {
    return NextResponse.json({ error: 'Installation is not available for this project' }, { status: 400 })
  }

  const { error } = await validation.supabase
    .from('projects')
    .update({
      github_installation_id: normalizedInstallationId,
      github_repo_id: null,
      github_repo_name: null,
    })
    .eq('id', projectId)
    .eq('user_id', validation.user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.delete(GITHUB_APP_INSTALLATIONS_COOKIE)
  return response
}
