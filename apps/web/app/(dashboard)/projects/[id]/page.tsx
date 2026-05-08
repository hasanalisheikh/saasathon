import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { EmbedSnippet } from './embed-snippet'

const TABS = ['requests', 'github', 'proof-pack'] as const
type Tab = typeof TABS[number]

export default async function ProjectDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ tab?: string }>
}) {
  const { id } = await params
  const { tab: rawTab } = await searchParams
  const activeTab: Tab = (TABS as readonly string[]).includes(rawTab ?? '') ? (rawTab as Tab) : 'requests'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .eq('user_id', user!.id)
    .single()

  if (!project) notFound()

  const [{ data: requests }, { data: githubEvents }] = await Promise.all([
    supabase
      .from('requests')
      .select('*')
      .eq('project_id', id)
      .order('created_at', { ascending: false }),
    supabase
      .from('github_events')
      .select('*')
      .eq('project_id', id)
      .order('created_at', { ascending: false })
      .limit(50),
  ])

  const approvedRequests = (requests ?? []).filter((r) => r.status === 'approved')
  const STATUS_FILTERS = ['all', 'pending_review', 'sent_to_client', 'approved', 'declined', 'deferred']

  const TAB_LABELS: Record<Tab, string> = {
    requests: 'Requests',
    github: 'GitHub',
    'proof-pack': 'Proof Pack',
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs mb-2" style={{ color: '#4a5568' }}>
            <Link href="/projects" style={{ color: '#4a5568' }}>Projects</Link>
            <span>/</span>
            <span style={{ color: '#8892a4' }}>{project.name}</span>
          </div>
          <h1 className="text-2xl font-light" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>{project.name}</h1>
          <p className="text-sm mt-1" style={{ color: '#8892a4' }}>{project.client_name}{project.client_email ? ` · ${project.client_email}` : ''}</p>
        </div>
        <Link
          href={`/projects/${id}/requests/new`}
          className="px-4 py-2 rounded text-sm font-medium"
          style={{ background: '#f59e0b', color: '#080c14' }}
        >
          + Add Request
        </Link>
      </div>

      {/* Inbound email banner */}
      {project.inbound_email && (
        <div className="p-4 rounded-lg mb-4 flex items-center justify-between" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
          <div>
            <p className="text-xs mb-1" style={{ color: '#f59e0b' }}>Inbound email address</p>
            <p className="text-sm" style={{ fontFamily: 'DM Mono, monospace', color: '#f0f4ff' }}>{project.inbound_email}</p>
          </div>
          <p className="text-xs" style={{ color: '#8892a4' }}>Forward or BCC client emails here</p>
        </div>
      )}

      {/* Widget embed snippet */}
      <div className="mb-6">
        <p className="text-xs uppercase tracking-wider mb-2" style={{ color: '#4a5568' }}>Widget embed</p>
        <EmbedSnippet projectId={id} />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        {TABS.map((tab) => (
          <Link
            key={tab}
            href={`/projects/${id}?tab=${tab}`}
            className="px-4 py-2 text-xs -mb-px"
            style={{
              fontFamily: 'DM Mono, monospace',
              color: activeTab === tab ? '#f59e0b' : '#8892a4',
              borderBottom: activeTab === tab ? '1px solid #f59e0b' : '1px solid transparent',
            }}
          >
            {TAB_LABELS[tab]}
          </Link>
        ))}
      </div>

      {/* ── REQUESTS TAB ── */}
      {activeTab === 'requests' && (
        <>
          <div className="flex gap-2 mb-4 flex-wrap">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f}
                className="text-xs px-3 py-1 rounded-full capitalize"
                style={{
                  background: f === 'all' ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.04)',
                  color: f === 'all' ? '#f59e0b' : '#8892a4',
                  border: '1px solid ' + (f === 'all' ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.08)'),
                }}
              >
                {f.replace('_', ' ')}
              </button>
            ))}
          </div>

          {!requests?.length ? (
            <div className="flex flex-col items-center py-16 rounded-lg" style={{ border: '1px dashed rgba(255,255,255,0.08)' }}>
              <p className="text-sm mb-2" style={{ color: '#4a5568' }}>No requests yet.</p>
              <p className="text-xs" style={{ color: '#4a5568' }}>
                Forward client emails to <span style={{ fontFamily: 'DM Mono', color: '#8892a4' }}>{project.inbound_email}</span>
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {requests.map((req) => (
                <Link
                  key={req.id}
                  href={`/projects/${id}/requests/${req.id}`}
                  className="flex items-center justify-between p-4 rounded-lg transition-all"
                  style={{
                    background: '#0f1624',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderLeft: `3px solid ${classColor(req.classification)}`,
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{req.raw_email_subject || req.raw_email_body?.slice(0, 60)}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#4a5568' }}>
                      {req.raw_email_from} · {new Date(req.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                    {req.classification && (
                      <span className="text-xs px-2 py-0.5 rounded uppercase" style={{ color: classColor(req.classification), background: `${classColor(req.classification)}18` }}>
                        {req.classification.replace('_', ' ')}
                      </span>
                    )}
                    {req.cost_min && (
                      <span className="text-xs" style={{ color: '#f59e0b' }}>
                        ${req.cost_min.toLocaleString()}–${req.cost_max?.toLocaleString()}
                      </span>
                    )}
                    <StatusBadge status={req.status} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── GITHUB TAB ── */}
      {activeTab === 'github' && (
        <div className="space-y-3">
          {!project.github_repo_name && (
            <div className="p-4 rounded-lg flex items-center justify-between mb-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div>
                <p className="text-sm mb-1">No GitHub repo linked</p>
                <p className="text-xs" style={{ color: '#4a5568' }}>Connect a repo to auto-create issues on approval and track PR activity.</p>
              </div>
              <a
                href={`/api/github/connect?state=${id}`}
                className="px-3 py-1.5 rounded text-xs"
                style={{ background: 'rgba(255,255,255,0.06)', color: '#f0f4ff', border: '1px solid rgba(255,255,255,0.10)', whiteSpace: 'nowrap' }}
              >
                Connect GitHub
              </a>
            </div>
          )}

          {project.github_repo_name && (
            <div className="p-3 rounded-lg mb-4 flex items-center justify-between" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
              <div className="flex items-center gap-2">
                <span style={{ color: '#10b981', fontSize: 10 }}>●</span>
                <span className="text-xs" style={{ color: '#10b981' }}>Connected to</span>
                <span className="text-xs" style={{ fontFamily: 'DM Mono, monospace', color: '#f0f4ff' }}>{project.github_repo_name}</span>
              </div>
              <Link
                href={`/projects/${id}/github-setup`}
                className="text-xs"
                style={{ color: '#4a5568' }}
              >
                Change repo
              </Link>
            </div>
          )}

          {!githubEvents?.length ? (
            <div className="flex flex-col items-center py-16 rounded-lg" style={{ border: '1px dashed rgba(255,255,255,0.08)' }}>
              <p className="text-sm mb-1" style={{ color: '#4a5568' }}>No GitHub activity yet.</p>
              <p className="text-xs" style={{ color: '#4a5568' }}>Merged PRs and closed issues will appear here.</p>
            </div>
          ) : (
            githubEvents.map((event) => (
              <GitHubEventRow key={event.id} event={event} />
            ))
          )}
        </div>
      )}

      {/* ── PROOF PACK TAB ── */}
      {activeTab === 'proof-pack' && (
        <div className="space-y-3">
          <div className="p-4 rounded-lg mb-2" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}>
            <p className="text-xs leading-5" style={{ color: '#8892a4' }}>
              Proof packs are legally-defensible PDFs documenting the original client request, AI scope analysis, cost estimate, and client approval with IP and timestamp. Download one per approved request.
            </p>
          </div>

          {!approvedRequests.length ? (
            <div className="flex flex-col items-center py-16 rounded-lg" style={{ border: '1px dashed rgba(255,255,255,0.08)' }}>
              <p className="text-sm mb-1" style={{ color: '#4a5568' }}>No approved requests yet.</p>
              <p className="text-xs" style={{ color: '#4a5568' }}>Proof packs are generated once a client approves a scope change.</p>
            </div>
          ) : (
            approvedRequests.map((req) => (
              <div
                key={req.id}
                className="flex items-center justify-between p-4 rounded-lg"
                style={{ background: '#0f1624', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{req.raw_email_subject || req.raw_email_body?.slice(0, 60)}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs" style={{ color: '#4a5568' }}>
                      Approved {new Date(req.approved_at).toLocaleDateString()}
                    </span>
                    {req.cost_min && req.cost_max && (
                      <span className="text-xs" style={{ color: '#f59e0b' }}>
                        ${req.cost_min.toLocaleString()}–${req.cost_max.toLocaleString()}
                      </span>
                    )}
                    {req.github_issue_url && (
                      <a
                        href={req.github_issue_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs"
                        style={{ color: '#3b82f6' }}
                      >
                        Issue #{req.github_issue_number}
                      </a>
                    )}
                  </div>
                </div>
                <a
                  href={`/api/requests/${req.id}/proof`}
                  download
                  className="ml-4 px-3 py-1.5 rounded text-xs font-medium flex-shrink-0"
                  style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' }}
                >
                  Download PDF
                </a>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

function classColor(c: string | null) {
  switch (c) {
    case 'out_of_scope': return '#ef4444'
    case 'in_scope': return '#10b981'
    case 'ambiguous': return '#f59e0b'
    case 'clarification_needed': return '#3b82f6'
    default: return '#4a5568'
  }
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string }> = {
    pending_review: { label: 'Pending', color: '#f59e0b' },
    sent_to_client: { label: 'Sent', color: '#3b82f6' },
    approved: { label: 'Approved', color: '#10b981' },
    declined: { label: 'Declined', color: '#ef4444' },
    deferred: { label: 'Deferred', color: '#8892a4' },
    accepted_in_scope: { label: 'In Scope', color: '#10b981' },
  }
  const s = map[status] ?? { label: status, color: '#8892a4' }
  return (
    <span className="text-xs px-2 py-0.5 rounded" style={{ color: s.color, background: `${s.color}18` }}>
      {s.label}
    </span>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function GitHubEventRow({ event }: { event: any }) {
  const typeMap: Record<string, { label: string; color: string; icon: string }> = {
    pr_merged: { label: 'PR Merged', color: '#a78bfa', icon: '⎇' },
    issue_closed: { label: 'Issue Closed', color: '#10b981', icon: '✓' },
    push: { label: 'Push', color: '#3b82f6', icon: '↑' },
    deployment: { label: 'Deployed', color: '#f59e0b', icon: '⚡' },
  }
  const meta = typeMap[event.event_type as string] ?? { label: event.event_type, color: '#8892a4', icon: '·' }
  const ghData = event.github_data as Record<string, unknown>
  const prUrl = (ghData?.pull_request as Record<string, unknown>)?.html_url as string | undefined
  const issueUrl = (ghData?.issue as Record<string, unknown>)?.html_url as string | undefined
  const externalUrl = prUrl ?? issueUrl

  return (
    <div
      className="p-4 rounded-lg"
      style={{
        background: '#0f1624',
        border: '1px solid rgba(255,255,255,0.08)',
        borderLeft: `3px solid ${meta.color}`,
        ...(event.is_unapproved_work ? { borderColor: '#ef4444', borderLeftColor: '#ef4444' } : {}),
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs px-2 py-0.5 rounded" style={{ color: meta.color, background: `${meta.color}18` }}>
              {meta.icon} {meta.label}
            </span>
            {event.is_unapproved_work && (
              <span className="text-xs px-2 py-0.5 rounded" style={{ color: '#ef4444', background: 'rgba(239,68,68,0.12)' }}>
                ⚠ Unapproved work detected
              </span>
            )}
          </div>
          {event.plain_english_summary ? (
            <p className="text-sm leading-5" style={{ color: '#f0f4ff' }}>{event.plain_english_summary as string}</p>
          ) : (
            <p className="text-xs" style={{ color: '#4a5568' }}>
              {(ghData?.pull_request as Record<string, unknown>)?.title as string
                ?? (ghData?.head_commit as Record<string, unknown>)?.message as string
                ?? 'No description'}
            </p>
          )}
          <p className="text-xs mt-1" style={{ color: '#4a5568' }}>
            {new Date(event.created_at as string).toLocaleString()}
          </p>
        </div>
        {externalUrl && (
          <a
            href={externalUrl}
            target="_blank"
            rel="noreferrer"
            className="text-xs flex-shrink-0"
            style={{ color: '#3b82f6' }}
          >
            View →
          </a>
        )}
      </div>
    </div>
  )
}
