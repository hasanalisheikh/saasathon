'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface Repo {
  id: string
  name: string
  private: boolean
}

export default function GitHubSetupPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [repos, setRepos] = useState<Repo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [linking, setLinking] = useState<string | null>(null)
  const [query, setQuery] = useState('')

  useEffect(() => {
    fetch(`/api/github/repos?projectId=${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setRepos(data)
        } else {
          setError(data.error ?? 'Failed to load repositories')
        }
      })
      .catch(() => setError('Failed to load repositories'))
      .finally(() => setLoading(false))
  }, [id])

  async function handleSelect(repo: Repo) {
    setLinking(repo.id)
    const res = await fetch('/api/github/link-repo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId: id, repoId: repo.id, repoFullName: repo.name }),
    })
    if (res.ok) {
      router.push(`/projects/${id}?tab=github`)
    } else {
      const { error: msg } = await res.json()
      setError(msg ?? 'Failed to link repository')
      setLinking(null)
    }
  }

  const filtered = repos.filter((r) =>
    r.name.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="flex-1 overflow-y-auto p-6 max-w-xl">
      <div className="flex items-center gap-2 text-xs mb-6" style={{ color: '#4a5568' }}>
        <Link href="/projects" style={{ color: '#4a5568' }}>Projects</Link>
        <span>/</span>
        <Link href={`/projects/${id}`} style={{ color: '#4a5568' }}>Project</Link>
        <span>/</span>
        <span style={{ color: '#8892a4' }}>Link GitHub Repo</span>
      </div>

      <h1 className="text-2xl font-light mb-1" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
        Link a GitHub repository
      </h1>
      <p className="text-sm mb-6" style={{ color: '#8892a4' }}>
        Select the repo for this project. Monad will register a webhook and auto-create issues when scope changes are approved.
      </p>

      {loading && (
        <p className="text-sm" style={{ color: '#4a5568' }}>Loading your repositories…</p>
      )}

      {error && (
        <div className="p-4 rounded-lg mb-4" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <p className="text-sm" style={{ color: '#ef4444' }}>{error}</p>
        </div>
      )}

      {!loading && !error && (
        <>
          <input
            type="text"
            placeholder="Filter repositories…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full px-3 py-2 rounded text-sm mb-3 outline-none"
            style={{
              background: '#0f1624',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#f0f4ff',
              fontFamily: 'DM Mono, monospace',
            }}
          />

          {filtered.length === 0 ? (
            <p className="text-sm py-4 text-center" style={{ color: '#4a5568' }}>No repositories found.</p>
          ) : (
            <div className="space-y-1.5">
              {filtered.map((repo) => (
                <button
                  key={repo.id}
                  onClick={() => handleSelect(repo)}
                  disabled={linking !== null}
                  className="w-full text-left px-4 py-3 rounded-lg flex items-center justify-between transition-all"
                  style={{
                    background: linking === repo.id ? 'rgba(245,158,11,0.1)' : '#0f1624',
                    border: '1px solid rgba(255,255,255,0.08)',
                    cursor: linking !== null ? 'not-allowed' : 'pointer',
                    opacity: linking !== null && linking !== repo.id ? 0.5 : 1,
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs px-1.5 py-0.5 rounded flex-shrink-0" style={{ background: 'rgba(255,255,255,0.06)', color: '#4a5568' }}>
                      {repo.private ? 'private' : 'public'}
                    </span>
                    <span className="text-sm truncate" style={{ fontFamily: 'DM Mono, monospace', color: '#f0f4ff' }}>
                      {repo.name}
                    </span>
                  </div>
                  {linking === repo.id ? (
                    <span className="text-xs flex-shrink-0" style={{ color: '#f59e0b' }}>Linking…</span>
                  ) : (
                    <span className="text-xs flex-shrink-0" style={{ color: '#4a5568' }}>Select →</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
