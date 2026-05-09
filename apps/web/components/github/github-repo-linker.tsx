'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Icon } from '@iconify/react'
import { AlertCircleIcon, CheckCircle2Icon, Loader2Icon } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent } from '@workspace/ui/components/card'
import { Input } from '@workspace/ui/components/input'
import { toast } from 'sonner'
import type { GitHubStatus } from '@/lib/github-connect'

type Repo = {
  id: string
  name: string
  private: boolean
}

type GitHubRepoLinkerProps = {
  connectHref: string
  githubAppReady: boolean
  githubStatus?: GitHubStatus | null
  hasGitHubInstallation: boolean
  linkedRepoName?: string | null
  onCancel?: () => void
  onLinked?: (repo: Repo) => void
  projectId: string
  projectName?: string
  redirectAfterLink?: string | null
}

function StatusNotice({
  message,
  tone,
}: {
  message: string
  tone: 'error' | 'success'
}) {
  return (
    <div
      className={
        tone === 'error'
          ? 'mb-4 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive'
          : 'mb-4 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-sm text-emerald-600'
      }
    >
      {message}
    </div>
  )
}

function getStatusMessage(status?: GitHubStatus | null) {
  switch (status) {
    case 'installation_created':
      return { tone: 'success' as const, text: 'GitHub App installed. Choose the repository for this project.' }
    case 'app_not_configured':
      return {
        tone: 'error' as const,
        text: 'GitHub App setup is incomplete. Add the GitHub App credentials to continue.',
      }
    case 'setup_failed':
      return { tone: 'error' as const, text: 'GitHub App installation could not be completed. Please try again.' }
    case 'auth_failed':
      return { tone: 'error' as const, text: 'Monad could not verify the GitHub App installation. Please try again.' }
    case 'repo_linked':
      return { tone: 'success' as const, text: 'Repository linked successfully.' }
    case 'repo_access_removed':
      return { tone: 'error' as const, text: 'Repository access changed. Choose a repository again to reconnect this project.' }
    case 'app_uninstalled':
      return { tone: 'error' as const, text: 'The GitHub App was removed. Install it again to reconnect this project.' }
    default:
      return null
  }
}

export function GitHubRepoLinker({
  connectHref,
  githubAppReady,
  githubStatus,
  hasGitHubInstallation,
  linkedRepoName,
  onCancel,
  onLinked,
  projectId,
  projectName,
  redirectAfterLink,
}: GitHubRepoLinkerProps) {
  const router = useRouter()
  const canLoadRepos = githubAppReady && hasGitHubInstallation
  const [repos, setRepos] = useState<Repo[]>([])
  const [loading, setLoading] = useState(canLoadRepos)
  const [error, setError] = useState<string | null>(null)
  const [linking, setLinking] = useState<string | null>(null)
  const [query, setQuery] = useState('')

  const statusNotice = getStatusMessage(githubStatus)

  useEffect(() => {
    let cancelled = false

    if (!canLoadRepos) {
      return
    }

    fetch(`/api/github/repos?projectId=${projectId}`)
      .then(async (response) => {
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error ?? 'Failed to load repositories')
        }

        if (!cancelled) {
          setRepos(Array.isArray(data) ? data : [])
        }
      })
      .catch((err: Error) => {
        if (cancelled) return
        setError(err.message)
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [canLoadRepos, projectId])

  const filteredRepos = useMemo(
    () => repos.filter((repo) => repo.name.toLowerCase().includes(query.toLowerCase())),
    [query, repos]
  )

  async function handleSelect(repo: Repo) {
    setLinking(repo.id)
    setError(null)

    try {
      const response = await fetch('/api/github/link-repo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, repoId: repo.id, repoFullName: repo.name }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error ?? 'Failed to link repository')
      }

      toast.success(`Linked ${repo.name}`)
      onLinked?.(repo)

      if (redirectAfterLink) {
        router.push(redirectAfterLink)
        router.refresh()
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to link repository'
      setError(message)
      toast.error(message)
      setLinking(null)
    }
  }

  if (!githubAppReady) {
    return (
      <div className="space-y-4">
        {statusNotice && <StatusNotice message={statusNotice.text} tone={statusNotice.tone} />}
        <Card size="sm">
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <AlertCircleIcon className="mt-0.5 size-4 text-destructive" />
              <div className="space-y-1">
                <p className="text-sm font-medium">GitHub App setup is incomplete</p>
                <p className="text-sm text-muted-foreground">
                  Add the GitHub App ID, client credentials, slug, private key, and webhook secret before installing the app for {projectName ?? 'this project'}.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              {onCancel && (
                <Button variant="ghost" onClick={onCancel}>
                  Close
                </Button>
              )}
              <Button render={<Link href={connectHref} />} nativeButton={false}>
                Retry setup
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!hasGitHubInstallation) {
    return (
      <div className="space-y-4">
        {statusNotice && <StatusNotice message={statusNotice.text} tone={statusNotice.tone} />}
        <Card size="sm">
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <Icon icon="logos:github-icon" className="mt-0.5 size-5 shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Install the GitHub App first</p>
                <p className="text-sm text-muted-foreground">
                  Monad needs the GitHub App installed before it can list repositories for {projectName ?? 'this project'}.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2">
              {onCancel && (
                <Button variant="ghost" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              <Button render={<Link href={connectHref} />} nativeButton={false}>
                Install GitHub App
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {statusNotice && <StatusNotice message={statusNotice.text} tone={statusNotice.tone} />}

      {linkedRepoName && (
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-sm text-emerald-600">
          <div className="flex items-center gap-2">
            <CheckCircle2Icon className="size-4" />
            <span>Currently linked to {linkedRepoName}</span>
          </div>
        </div>
      )}

      {error && <StatusNotice message={error} tone="error" />}

      <Input
        type="text"
        placeholder="Filter repositories..."
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />

      <div className="space-y-1.5">
        {canLoadRepos && loading ? (
          <div className="flex items-center justify-center rounded-lg border border-border/80 px-4 py-8 text-sm text-muted-foreground">
            <Loader2Icon className="mr-2 size-4 animate-spin" />
            Loading repositories...
          </div>
        ) : filteredRepos.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
            No repositories are available to this installation.
          </div>
        ) : (
          filteredRepos.map((repo) => (
            <button
              key={repo.id}
              onClick={() => handleSelect(repo)}
              disabled={Boolean(linking)}
              className="flex w-full items-center justify-between rounded-lg border border-border/80 bg-background px-4 py-3 text-left transition-colors hover:border-primary/30 hover:bg-muted/40 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                  {repo.private ? 'private' : 'public'}
                </span>
                <span className="truncate text-sm">{repo.name}</span>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">
                {linking === repo.id ? 'Linking...' : 'Select'}
              </span>
            </button>
          ))
        )}
      </div>

      {onCancel && (
        <div className="flex justify-end">
          <Button variant="ghost" onClick={onCancel}>
            Close
          </Button>
        </div>
      )}
    </div>
  )
}
