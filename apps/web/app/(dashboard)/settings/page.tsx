'use client'

import { Suspense } from 'react'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { FormField, FormLabel } from "@workspace/ui/components/form-field"
import { PageHeader, PageTitle, PageDescription } from "@workspace/ui/components/page-header"
import { buildGitHubConnectPath, getGitHubStatusMessage } from '@/lib/github-connect'

const STRENGTH_HINT = 'Min. 8 characters · one uppercase letter · one special character (!@#$%^&*)'

interface Profile {
  full_name: string | null
  email: string | null
  company_name: string | null
  hourly_rate: number | null
  github_username: string | null
}

interface GitHubStatusResponse {
  oauthReady: boolean
  connected: boolean
  github_username: string | null
}

interface ProjectSnippet {
  id: string
  name: string
  widget_token: string
}

export default function SettingsPage() {
  return (
    <Suspense>
      <SettingsContent />
    </Suspense>
  )
}

function SettingsContent() {
  const searchParams = useSearchParams()
  const githubStatus = searchParams.get('github')

  const [profile, setProfile] = useState<Profile | null>(null)
  const [projects, setProjects] = useState<ProjectSnippet[]>([])
  const [userEmail, setUserEmail] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [githubInfo, setGitHubInfo] = useState<GitHubStatusResponse | null>(null)
  const [githubPat, setGitHubPat] = useState('')
  const [githubPatSaving, setGitHubPatSaving] = useState(false)
  const [githubPatError, setGitHubPatError] = useState('')
  const [githubPatSuccess, setGitHubPatSuccess] = useState('')

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserEmail(user.email ?? '')
      const [{ data: profileData }, { data: projectsData }, githubResponse] = await Promise.all([
        supabase.from('profiles').select('full_name, email, company_name, hourly_rate, github_username').eq('id', user.id).single(),
        supabase.from('projects').select('id, name, widget_token').eq('user_id', user.id).order('created_at'),
        fetch('/api/github/status'),
      ])
      if (profileData) setProfile(profileData)
      if (projectsData) setProjects(projectsData)
      if (githubResponse.ok) {
        const data = await githubResponse.json()
        setGitHubInfo(data)
      }
    }
    load()
  }, [])

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    setError('')

    const form = e.currentTarget
    const fd = new FormData(form)

    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: fd.get('full_name'),
        company_name: fd.get('company_name'),
        hourly_rate: fd.get('hourly_rate'),
      }),
    })

    if (res.ok) {
      const updated = await res.json()
      setProfile(updated)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } else {
      setError('Failed to save. Please try again.')
    }
    setSaving(false)
  }

  const isGithubConnected = githubStatus === 'connected' || githubInfo?.connected || !!profile?.github_username
  const githubOauthReady = githubInfo?.oauthReady ?? true
  const githubMessage = getGitHubStatusMessage(githubStatus)
  const connectHref = buildGitHubConnectPath({ returnTo: '/settings' })

  const handleConnectPat = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setGitHubPatSaving(true)
    setGitHubPatError('')
    setGitHubPatSuccess('')

    try {
      const response = await fetch('/api/github/pat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_token: githubPat }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error ?? 'Failed to connect GitHub token')
      }

      setGitHubInfo({
        oauthReady: githubOauthReady,
        connected: true,
        github_username: data.github_username ?? null,
      })
      setProfile((current) => current ? { ...current, github_username: data.github_username ?? current.github_username } : current)
      setGitHubPat('')
      setGitHubPatSuccess('GitHub token connected successfully.')
    } catch (err) {
      setGitHubPatError(err instanceof Error ? err.message : 'Failed to connect GitHub token')
    } finally {
      setGitHubPatSaving(false)
    }
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 max-w-xl space-y-8">
      <PageHeader>
        <div>
          <PageTitle>Settings</PageTitle>
          <PageDescription>
            Manage your profile, notification preferences, and external integrations.
          </PageDescription>
        </div>
      </PageHeader>

      <Section title="Profile">
        <form onSubmit={handleSave} className="space-y-4">
          <FormField>
            <FormLabel>Full name</FormLabel>
            <Input
              name="full_name"
              defaultValue={profile?.full_name ?? ""}
              key={profile?.full_name}
            />
          </FormField>
          <FormField>
            <FormLabel>Email</FormLabel>
            <Input
              name="email"
              value={profile?.email ?? userEmail}
              disabled
              className="opacity-50"
              readOnly
            />
          </FormField>
          <FormField>
            <FormLabel>Company name</FormLabel>
            <Input
              name="company_name"
              defaultValue={profile?.company_name ?? ""}
              key={profile?.company_name}
              placeholder="Your Studio"
            />
          </FormField>
          <FormField>
            <FormLabel>Default hourly rate (USD)</FormLabel>
            <Input
              name="hourly_rate"
              type="number"
              defaultValue={profile?.hourly_rate ?? 100}
              key={profile?.hourly_rate}
              className="w-24"
            />
          </FormField>
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save changes'}
            </Button>
            {saved && <span className="text-sm text-emerald-500">Saved ✓</span>}
            {error && <span className="text-sm text-destructive">{error}</span>}
          </div>
        </form>
      </Section>

      <Section title="Security">
        <ChangePasswordForm />
      </Section>

      <Section title="Email Forwarding">
        <Card size="sm">
          <CardContent>
            <p className="text-sm mb-1 font-mono text-primary">inbound.monad.app</p>
            <p className="text-xs text-muted-foreground/50">
              Each project gets a unique inbound address at this domain. Forward or BCC client
              emails there to receive and analyse them automatically.
            </p>
          </CardContent>
        </Card>
      </Section>

      <Section title="GitHub">
        <Card size="sm">
          <CardContent className="space-y-4">
            {isGithubConnected ? (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-emerald-500">●</span>
                  <p className="text-sm">
                    Connected{profile?.github_username ? ` as @${profile.github_username}` : ''}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  GitHub is linked. Issues will be created automatically on approval.
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm mb-1">Not connected</p>
                  <p className="text-xs text-muted-foreground/50">
                    {githubOauthReady
                      ? 'Connect GitHub to create issues and track work automatically.'
                      : 'GitHub OAuth is not configured yet. Add a personal access token below to continue.'}
                  </p>
                </div>
                {githubOauthReady ? (
                  <Button
                    variant="outline"
                    render={<Link href={connectHref} />}
                    nativeButton={false}
                  >
                    Connect GitHub
                  </Button>
                ) : (
                  <Button variant="outline" render={<Link href="#github-pat" />} nativeButton={false}>
                    Use Personal Access Token
                  </Button>
                )}
              </div>
            )}

            {(!githubOauthReady || !isGithubConnected) && (
              <form id="github-pat" onSubmit={handleConnectPat} className="space-y-3 rounded-lg border border-border/80 bg-muted/30 p-4">
                <div>
                  <p className="text-sm font-medium">Connect with a personal access token</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Paste a GitHub token with `repo` scope. Monad will validate it and use it for repo browsing, linking, and issue creation.
                  </p>
                </div>
                <FormField>
                  <FormLabel>GitHub personal access token</FormLabel>
                  <Input
                    type="password"
                    value={githubPat}
                    onChange={(event) => setGitHubPat(event.target.value)}
                    placeholder="ghp_..."
                    autoComplete="off"
                  />
                </FormField>
                <div className="flex items-center gap-3">
                  <Button type="submit" disabled={githubPatSaving || !githubPat.trim()}>
                    {githubPatSaving ? 'Validating…' : 'Connect GitHub Token'}
                  </Button>
                  {githubPatSuccess && <span className="text-xs text-emerald-600">{githubPatSuccess}</span>}
                  {githubPatError && <span className="text-xs text-destructive">{githubPatError}</span>}
                </div>
              </form>
            )}
          </CardContent>
        </Card>
        {githubMessage && githubMessage.tone === 'error' && (
          <p className="text-xs mt-2 text-destructive">{githubMessage.text}</p>
        )}
        {githubMessage && githubMessage.tone === 'success' && (
          <p className="text-xs mt-2 text-emerald-600">{githubMessage.text}</p>
        )}
      </Section>

      <Section title="Widget">
        <WidgetSnippet projects={projects} />
      </Section>

      <Section title="Danger Zone">
        <DeleteAccountForm />
      </Section>
    </div>
  )
}

function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSuccess(false)
    setError('')

    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
    })

    const data = await res.json()

    if (res.ok) {
      setSuccess(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setSuccess(false), 3000)
    } else {
      setError(data.error ?? 'Failed to change password.')
    }
    setSaving(false)
  }

  return (
    <Card size="sm">
      <CardContent>
        <p className="text-sm font-medium mb-4">Change password</p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <FormField>
            <FormLabel>Current password</FormLabel>
            <Input
              type="password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              required
              placeholder="Your current password"
            />
          </FormField>
          <FormField>
            <FormLabel>New password</FormLabel>
            <Input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
              placeholder="Enter new password"
            />
            <p className="text-xs text-muted-foreground/50 mt-1">{STRENGTH_HINT}</p>
          </FormField>
          <FormField>
            <FormLabel>Confirm new password</FormLabel>
            <Input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              placeholder="Repeat new password"
            />
          </FormField>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <div className="flex items-center gap-3 pt-1">
            <Button type="submit" disabled={saving}>
              {saving ? 'Updating…' : 'Update password'}
            </Button>
            {success && <span className="text-sm text-emerald-500">Password updated ✓</span>}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

function DeleteAccountForm() {
  const [showConfirm, setShowConfirm] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  const handleDelete = async () => {
    setDeleting(true)
    setError('')

    const res = await fetch('/api/auth/delete-account', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirmText }),
    })

    if (res.ok) {
      window.location.href = '/'
    } else {
      const data = await res.json()
      setError(data.error ?? 'Failed to delete account.')
      setDeleting(false)
    }
  }

  return (
    <Card size="sm" className="border-destructive/30">
      <CardContent>
        <p className="text-sm font-medium mb-1">Delete account</p>
        <p className="text-xs text-muted-foreground/70 mb-4">
          This permanently deletes your account, all projects, and all request history. This cannot be undone.
        </p>

        {!showConfirm ? (
          <Button
            variant="outline"
            onClick={() => setShowConfirm(true)}
            className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:border-destructive/60"
          >
            Delete my account
          </Button>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Type <span className="font-mono font-bold text-foreground">DELETE</span> to confirm:
            </p>
            <Input
              value={confirmText}
              onChange={e => setConfirmText(e.target.value)}
              placeholder="DELETE"
              className="font-mono"
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
            <div className="flex gap-2">
              <Button
                onClick={handleDelete}
                disabled={deleting || confirmText !== 'DELETE'}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleting ? 'Deleting…' : 'Confirm deletion'}
              </Button>
              <Button
                variant="ghost"
                onClick={() => { setShowConfirm(false); setConfirmText(''); setError('') }}
                disabled={deleting}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="text-xs uppercase tracking-wider mb-4 text-muted-foreground/50">{title}</h2>
      {children}
    </div>
  )
}

function WidgetSnippet({ projects }: { projects: ProjectSnippet[] }) {
  const [copied, setCopied] = useState(false)
  const [selectedId, setSelectedId] = useState<string>('')
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://monad.app'

  const selected = projects.find(p => p.id === selectedId) ?? projects[0]

  const snippet = selected
    ? `<script src="${appUrl}/widget.js"\n  data-project-id="${selected.id}"\n  data-client-token="${selected.widget_token}"\n></script>`
    : `<script src="${appUrl}/widget.js"\n  data-project-id="YOUR_PROJECT_ID"\n  data-client-token="YOUR_CLIENT_TOKEN"\n></script>`

  const copy = () => {
    navigator.clipboard.writeText(snippet)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card size="sm">
      <CardContent>
        <div className="flex items-center justify-between mb-3">
          {projects.length > 0 ? (
            <select
              className="text-xs bg-transparent border border-border rounded px-2 py-1 text-foreground font-mono"
              value={selectedId || selected?.id || ''}
              onChange={e => setSelectedId(e.target.value)}
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          ) : (
            <p className="text-xs text-muted-foreground">Create a project to get your embed snippet</p>
          )}
          <Button variant="ghost" size="sm" onClick={copy} disabled={!selected}>
            {copied ? 'Copied ✓' : 'Copy'}
          </Button>
        </div>
        <pre className="text-xs overflow-x-auto whitespace-pre-wrap break-all font-mono text-primary leading-relaxed">
          {snippet}
        </pre>
        <p className="text-xs text-muted-foreground/50 mt-2">
          Embed on your client&apos;s site. The token authenticates comments to this project.
        </p>
      </CardContent>
    </Card>
  )
}
