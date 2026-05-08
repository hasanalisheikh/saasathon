import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .eq('user_id', user!.id)
    .single()

  if (!project) notFound()

  const { data: requests } = await supabase
    .from('requests')
    .select('*')
    .eq('project_id', id)
    .order('created_at', { ascending: false })

  const STATUS_FILTERS = ['all', 'pending_review', 'sent_to_client', 'approved', 'declined', 'deferred']

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
        <div className="p-4 rounded-lg mb-6 flex items-center justify-between" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
          <div>
            <p className="text-xs mb-1" style={{ color: '#f59e0b' }}>Inbound email address</p>
            <p className="text-sm" style={{ fontFamily: 'DM Mono, monospace', color: '#f0f4ff' }}>{project.inbound_email}</p>
          </div>
          <p className="text-xs" style={{ color: '#8892a4' }}>Forward or BCC client emails here</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        {['Requests', 'GitHub', 'Proof Pack'].map((tab) => (
          <button
            key={tab}
            className="px-4 py-2 text-xs -mb-px"
            style={{
              fontFamily: 'DM Mono, monospace',
              color: tab === 'Requests' ? '#f59e0b' : '#8892a4',
              borderBottom: tab === 'Requests' ? '1px solid #f59e0b' : '1px solid transparent',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Request filters */}
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

      {/* Request list */}
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
