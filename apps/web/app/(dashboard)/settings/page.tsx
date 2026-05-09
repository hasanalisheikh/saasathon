'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { RuntimeDiagnostics } from '@/lib/integrations'
import { Card, CardContent } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"
import { FormField, FormLabel } from "@workspace/ui/components/form-field"
import { PageHeader, PageTitle, PageDescription } from "@workspace/ui/components/page-header"
import { getGitHubStatusMessage } from '@/lib/github-connect'
import { isGitHubInstallationId } from '@/lib/github-config'
import {
  deriveGitHubAppUrls,
  getGitHubMissingChecks,
  resolveGitHubSettingsConnectHref,
} from '@/lib/github-settings'

const STRENGTH_HINT = 'Min. 8 characters · one uppercase letter · one special character (!@#$%^&*)'

interface Profile {
  full_name: string | null
  email: string | null
  company_name: string | null
  hourly_rate: number | null
}

interface GitHubStatusResponse {
  appReady: boolean
  webhookReady: boolean
}

interface ProjectSnippet {
  id: string
  name: string
  widget_token: string
  github_repo_name: string | null
  github_installation_id: string | null
}

export default function SettingsPage() {
  return <SettingsContent />
}

function SettingsContent() {
  const searchParams = useSearchParams()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [projects, setProjects] = useState<ProjectSnippet[]>([])
  const [userEmail, setUserEmail] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [diagnostics, setDiagnostics] = useState<RuntimeDiagnostics | null>(null)

  const [githubInfo, setGitHubInfo] = useState<GitHubStatusResponse | null>(null)
  const [githubStatus, setGithubStatus] = useState<string | null>(null)
  const [githubPickerOpen, setGithubPickerOpen] = useState(false)
  const [githubProjectQuery, setGithubProjectQuery] = useState('')
  const [hasGitHubWebhookEvent, setHasGitHubWebhookEvent] = useState(false)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setUserEmail(user.email ?? '')
      setGithubStatus(searchParams.get('github'))
      const [{ data: profileData }, { data: projectsData }, githubResponse] = await Promise.all([
        supabase.from('profiles').select('full_name, email, company_name, hourly_rate').eq('id', user.id).single(),
        supabase
          .from('projects')
          .select('id, name, widget_token, github_repo_name, github_installation_id')
          .eq('user_id', user.id)
          .order('created_at'),
        fetch('/api/github/status'),
      ])
      if (profileData) setProfile(profileData)
      if (projectsData) setProjects(projectsData)
      if (githubResponse.ok) {
        const data = await githubResponse.json()
        setGitHubInfo(data)
      }

      const diagnosticsRes = await fetch('/api/integrations/status')
      if (diagnosticsRes.ok) {
        const diagnosticsData = await diagnosticsRes.json()
        setDiagnostics(diagnosticsData.diagnostics ?? null)
      }

      if (projectsData?.length) {
        const { data: githubEventsData } = await supabase
          .from('github_events')
          .select('id')
          .in('project_id', projectsData.map((project) => project.id))
          .limit(1)

        setHasGitHubWebhookEvent(Boolean(githubEventsData?.length))
      } else {
        setHasGitHubWebhookEvent(false)
      }
    }
    load()
  }, [searchParams])

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

  const githubAppReady = githubInfo?.appReady ?? false
  const githubWebhookReady = githubInfo?.webhookReady ?? false
  const githubMessage = getGitHubStatusMessage(githubStatus as any)
  const linkedGitHubProjects = projects.filter((project) => Boolean(project.github_repo_name))
  const installedGitHubProjects = projects.filter((project) => isGitHubInstallationId(project.github_installation_id))
  const githubAppUrls = deriveGitHubAppUrls(diagnostics?.appUrl ?? null)
  const githubMissingChecks = getGitHubMissingChecks(diagnostics?.checks ?? [])
  const filteredGitHubProjects = useMemo(
    () =>
      projects.filter((project) =>
        project.name.toLowerCase().includes(githubProjectQuery.toLowerCase())
      ),
    [githubProjectQuery, projects]
  )
  const githubValidationChecklist = [
    {
      label: 'Vercel envs present',
      status: githubMissingChecks.app.length === 0 ? 'Ready' : 'Needs setup',
      tone: githubMissingChecks.app.length === 0 ? 'text-emerald-500' : 'text-destructive',
    },
    {
      label: 'GitHub App URLs match deployment',
      status: githubAppUrls ? 'Verify in GitHub App settings' : 'Add NEXT_PUBLIC_APP_URL first',
      tone: githubAppUrls ? 'text-foreground' : 'text-destructive',
    },
    {
      label: 'Project installed',
      status: installedGitHubProjects.length > 0 ? `${installedGitHubProjects.length} project(s)` : 'None yet',
      tone: installedGitHubProjects.length > 0 ? 'text-emerald-500' : 'text-muted-foreground',
    },
    {
      label: 'Repository linked',
      status: linkedGitHubProjects.length > 0 ? `${linkedGitHubProjects.length} project(s)` : 'None yet',
      tone: linkedGitHubProjects.length > 0 ? 'text-emerald-500' : 'text-muted-foreground',
    },
    {
      label: 'Webhook events received',
      status: hasGitHubWebhookEvent ? 'Received' : 'No events yet',
      tone: hasGitHubWebhookEvent ? 'text-emerald-500' : 'text-muted-foreground',
    },
  ]

  function handleLaunchGitHub(project: ProjectSnippet) {
    setGithubPickerOpen(false)
    setGithubProjectQuery('')
    window.location.assign(resolveGitHubSettingsConnectHref(project))
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 max-w-3xl space-y-8">
      <PageHeader>
        <div>
          <PageTitle>Settings</PageTitle>
          <PageDescription>
            Manage your profile, request intake setup, and external integrations.
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

      <Section title="Request Intake">
        <Card size="sm">
          <CardContent>
            <p className="text-sm mb-2 text-foreground">
              Manual request capture is live today and remains the recommended intake path while we finish native channel integrations.
            </p>
            <p className="text-xs text-muted-foreground/70">
              Native Slack intake is planned next. Until that ships, add requests manually from the project page and use the saved reply when you send the response back in Slack.
            </p>
            <p className="mt-3 text-xs text-muted-foreground/50">
              Legacy email domain: {diagnostics?.inboundEmailDomain ?? 'Not configured'}
            </p>
          </CardContent>
        </Card>
      </Section>

      <Section title="GitHub">
        <Card size="sm">
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={githubAppReady ? 'text-emerald-500' : 'text-destructive'}>●</span>
                  <p className="text-sm font-medium">
                    {githubAppReady ? 'GitHub App ready' : 'GitHub App setup incomplete'}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Launch the existing project-scoped GitHub flow from Settings, then finish install and repo linking on the project GitHub page.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setGithubPickerOpen(true)}
                disabled={projects.length === 0}
              >
                Connect GitHub
              </Button>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <div className="rounded-lg border border-border/80 bg-muted/30 p-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Core app envs</p>
                <p className="mt-1 text-lg font-medium">
                  {githubMissingChecks.app.length === 0 ? 'Ready' : 'Needs setup'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {githubMissingChecks.app.length === 0
                    ? 'App credentials and public URL are configured.'
                    : `Missing: ${githubMissingChecks.app.map((check) => check.label).join(', ')}`}
                </p>
              </div>
              <div className="rounded-lg border border-border/80 bg-muted/30 p-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Webhook</p>
                <p className="mt-1 text-lg font-medium">
                  {githubWebhookReady ? 'Configured' : 'Needs setup'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {githubWebhookReady
                    ? 'Webhook verification is configured.'
                    : githubMissingChecks.webhook.length > 0
                      ? `Missing: ${githubMissingChecks.webhook.map((check) => check.label).join(', ')}`
                      : 'Webhook verification still needs setup.'}
                </p>
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <div className="rounded-lg border border-border/80 bg-muted/30 p-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Installed</p>
                <p className="mt-1 text-lg font-medium">{installedGitHubProjects.length} projects</p>
                <p className="text-xs text-muted-foreground">Projects with the GitHub App installed.</p>
              </div>
              <div className="rounded-lg border border-border/80 bg-muted/30 p-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Linked repos</p>
                <p className="mt-1 text-lg font-medium">{linkedGitHubProjects.length} projects</p>
                <p className="text-xs text-muted-foreground">
                  {hasGitHubWebhookEvent ? 'Webhook activity has been received.' : 'No GitHub webhook activity received yet.'}
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-border/80 p-4">
              <p className="text-sm font-medium">GitHub App URLs</p>
              {githubAppUrls ? (
                <div className="mt-3 space-y-2">
                  {[
                    ['Homepage URL', githubAppUrls.homepageUrl],
                    ['Setup URL', githubAppUrls.setupUrl],
                    ['Callback URL', githubAppUrls.callbackUrl],
                    ['Webhook URL', githubAppUrls.webhookUrl],
                  ].map(([label, value]) => (
                    <div key={label} className="grid gap-1 sm:grid-cols-[120px_1fr]">
                      <span className="text-xs text-muted-foreground">{label}</span>
                      <code className="break-all rounded bg-muted/40 px-2 py-1 text-xs text-foreground">
                        {value}
                      </code>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-xs text-muted-foreground">
                  Add `NEXT_PUBLIC_APP_URL` to derive the exact GitHub App URLs for production.
                </p>
              )}
            </div>

            <div className="rounded-lg border border-border/80 p-4">
              <p className="text-sm font-medium">Production checklist</p>
              <div className="mt-3 space-y-2">
                {githubValidationChecklist.map((item) => (
                  <div key={item.label} className="flex items-center justify-between gap-3 text-xs">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className={item.tone}>{item.status}</span>
                  </div>
                ))}
              </div>
              <ol className="mt-4 space-y-1 text-xs text-muted-foreground">
                <li>1. Rotate `GITHUB_APP_CLIENT_SECRET` in GitHub App settings if it was exposed.</li>
                <li>2. Update the GitHub App envs in Vercel and redeploy.</li>
                <li>3. Copy the exact URLs above into the GitHub App homepage, setup, callback, and webhook fields.</li>
                <li>4. Launch GitHub from a project, complete install, choose a repository, and verify webhook activity appears.</li>
              </ol>
            </div>

            {projects.length > 0 ? (
              <div className="space-y-2">
                {projects.slice(0, 4).map((project) => (
                  <div key={project.id} className="flex items-center justify-between gap-3 rounded-lg border border-border/80 px-3 py-2 text-sm">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{project.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {project.github_repo_name
                          ? project.github_repo_name
                          : isGitHubInstallationId(project.github_installation_id)
                            ? 'GitHub App installed · choose repository'
                            : 'Not connected yet'}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      render={<Link href={`/projects/${project.id}/github-setup`} />}
                      nativeButton={false}
                    >
                      Manage
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Create a project first, then connect GitHub from that project.</p>
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

      <Section title="Runtime Readiness">
        <Card size="sm">
          <CardContent className="space-y-4">
            <div className="grid gap-2 sm:grid-cols-2">
              <p className="text-xs text-muted-foreground">
                AI mode: <span className="text-foreground">{diagnostics?.mockAI ? 'Mock' : 'Live'}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Model: <span className="text-foreground">{diagnostics?.aiModel ?? 'Not configured'}</span>
              </p>
              <p className="text-xs text-muted-foreground sm:col-span-2">
                Public app URL: <span className="text-foreground">{diagnostics?.appUrl ?? 'Not configured'}</span>
              </p>
            </div>

            <div className="space-y-2">
              {diagnostics?.checks.map((check) => (
                <div key={check.key} className="flex items-center justify-between gap-3 text-xs">
                  <span className="text-muted-foreground">{check.label}</span>
                  <span className={check.configured ? 'text-emerald-500' : 'text-destructive'}>
                    {check.configured ? 'Configured' : check.required ? 'Required' : 'Optional'}
                  </span>
                </div>
              )) ?? (
                <p className="text-xs text-muted-foreground">Loading runtime diagnostics…</p>
              )}
            </div>
          </CardContent>
        </Card>
      </Section>

      <Section title="Widget">
        <WidgetSnippet appUrl={diagnostics?.appUrl ?? null} projects={projects} />
      </Section>

      <Section title="Danger Zone">
        <DeleteAccountForm />
      </Section>

      <Dialog
        open={githubPickerOpen}
        onOpenChange={(open) => {
          setGithubPickerOpen(open)
          if (!open) setGithubProjectQuery('')
        }}
      >
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Choose a project</DialogTitle>
            <DialogDescription>
              Settings launches the same project-scoped GitHub flow. Pick the project you want to install or manage first.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <Input
              placeholder="Search projects..."
              value={githubProjectQuery}
              onChange={(event) => setGithubProjectQuery(event.target.value)}
            />
            <div className="max-h-[320px] space-y-2 overflow-y-auto">
              {filteredGitHubProjects.length === 0 ? (
                <div className="rounded-md border border-dashed border-border px-3 py-8 text-center text-sm text-muted-foreground">
                  No projects found.
                </div>
              ) : (
                filteredGitHubProjects.map((project) => {
                  const connectHref = resolveGitHubSettingsConnectHref(project)
                  const launchLabel = isGitHubInstallationId(project.github_installation_id)
                    ? 'Manage GitHub'
                    : 'Install GitHub App'

                  return (
                    <button
                      key={project.id}
                      onClick={() => handleLaunchGitHub(project)}
                      className="flex w-full items-center justify-between rounded-md border border-border px-3 py-3 text-left transition-colors hover:bg-muted/50"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{project.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {project.github_repo_name
                            ? project.github_repo_name
                            : isGitHubInstallationId(project.github_installation_id)
                              ? 'GitHub App installed · choose repository'
                              : 'Not connected yet'}
                        </p>
                        <p className="truncate text-[11px] text-muted-foreground/60">{connectHref}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{launchLabel}</span>
                    </button>
                  )
                })
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
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

function WidgetSnippet({ appUrl, projects }: { appUrl: string | null; projects: ProjectSnippet[] }) {
  const [copied, setCopied] = useState(false)
  const [selectedId, setSelectedId] = useState<string>('')

  const selected = projects.find(p => p.id === selectedId) ?? projects[0]

  const snippet = !appUrl
    ? 'NEXT_PUBLIC_APP_URL must be configured before Monad can generate an embed snippet.'
    : selected
    ? `<script src="${appUrl}/widget.js"\n  data-project-id="${selected.id}"\n  data-client-token="${selected.widget_token}"\n></script>`
    : `<script src="${appUrl}/widget.js"\n  data-project-id="YOUR_PROJECT_ID"\n  data-client-token="YOUR_CLIENT_TOKEN"\n></script>`

  const copy = () => {
    if (!appUrl || !selected) return
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
              disabled={!appUrl}
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          ) : (
            <p className="text-xs text-muted-foreground">Create a project to get your embed snippet</p>
          )}
          <Button variant="ghost" size="sm" onClick={copy} disabled={!appUrl || !selected}>
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
