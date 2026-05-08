import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch pending requests across all projects
  const { data: pendingRequests } = await supabase
    .from('requests')
    .select('*, project:projects(id, name, client_name)')
    .eq('projects.user_id', user!.id)
    .eq('status', 'pending_review')
    .order('created_at', { ascending: false })
    .limit(20)

  // Metrics
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const { data: monthRequests } = await supabase
    .from('requests')
    .select('classification, cost_min, cost_max, status')
    .gte('created_at', startOfMonth)

  const requestsThisMonth = monthRequests?.length ?? 0
  const outOfScopeCaught = monthRequests?.filter((r) => r.classification === 'out_of_scope').length ?? 0
  const unbilledProtected = monthRequests
    ?.filter((r) => r.status === 'approved' && r.classification === 'out_of_scope')
    .reduce((sum, r) => sum + ((r.cost_min + r.cost_max) / 2 || 0), 0) ?? 0

  return (
    <div className="flex-1 overflow-y-auto p-6">
      {/* Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <MetricCard label="Requests This Month" value={String(requestsThisMonth)} />
        <MetricCard label="Out-of-Scope Caught" value={String(outOfScopeCaught)} accent="red" />
        <MetricCard
          label="Unbilled Work Protected"
          value={`$${Math.round(unbilledProtected).toLocaleString()}`}
          accent="amber"
          large
        />
      </div>

      {/* Inbox */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-sm font-medium" style={{ fontFamily: 'DM Mono, monospace' }}>Needs Review</h2>
          {(pendingRequests?.length ?? 0) > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
              {pendingRequests!.length}
            </span>
          )}
        </div>

        {!pendingRequests?.length ? (
          <div className="flex flex-col items-center py-16 rounded-lg" style={{ border: '1px dashed rgba(255,255,255,0.08)' }}>
            <p className="text-sm" style={{ color: '#4a5568' }}>No new requests. Your inbox is clear.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {pendingRequests.map((req) => (
              <RequestCard key={req.id} request={req} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function MetricCard({ label, value, accent, large }: { label: string; value: string; accent?: 'red' | 'amber'; large?: boolean }) {
  const color = accent === 'red' ? '#ef4444' : accent === 'amber' ? '#f59e0b' : '#f0f4ff'
  return (
    <div className="p-5 rounded-lg" style={{ background: '#0f1624', border: '1px solid rgba(255,255,255,0.08)' }}>
      <p className="text-xs mb-2" style={{ color: '#8892a4' }}>{label}</p>
      <p
        className={large ? 'text-3xl font-light italic' : 'text-2xl'}
        style={{ color, fontFamily: large ? 'Fraunces, Georgia, serif' : 'DM Mono, monospace' }}
      >
        {value}
      </p>
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function RequestCard({ request }: { request: any }) {
  const classificationColors: Record<string, string> = {
    out_of_scope: '#ef4444',
    in_scope: '#10b981',
    ambiguous: '#f59e0b',
    clarification_needed: '#3b82f6',
  }

  const classification = request.classification as string
  const borderColor = classificationColors[classification] ?? '#8892a4'

  return (
    <a
      href={`/projects/${(request.project as Record<string, string>)?.id}/requests/${request.id as string}`}
      className="block p-4 rounded-lg transition-colors"
      style={{
        background: '#0f1624',
        border: '1px solid rgba(255,255,255,0.08)',
        borderLeft: `3px solid ${borderColor}`,
      }}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium">{(request.project as Record<string, string>)?.client_name}</span>
        <span className="text-xs" style={{ color: '#4a5568' }}>
          {new Date(request.created_at as string).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      <p className="text-sm truncate mb-2" style={{ color: '#8892a4', maxWidth: 480 }}>
        {(request.raw_email_subject as string) || (request.raw_email_body as string)?.slice(0, 80)}
      </p>
      <div className="flex items-center gap-2">
        {classification && (
          <span className="text-xs px-2 py-0.5 rounded uppercase" style={{ color: borderColor, background: `${borderColor}18`, letterSpacing: '0.05em' }}>
            {classification.replace('_', ' ')}
          </span>
        )}
        {request.cost_min && request.cost_max && (
          <span className="text-xs" style={{ color: '#f59e0b' }}>
            ${(request.cost_min as number).toLocaleString()}–${(request.cost_max as number).toLocaleString()}
          </span>
        )}
      </div>
    </a>
  )
}
