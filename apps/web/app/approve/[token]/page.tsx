import { createServiceClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export default async function ApprovePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const supabase = await createServiceClient()

  const { data: request } = await supabase
    .from('requests')
    .select('*, project:projects(name, client_name)')
    .eq('approval_token', token)
    .single()

  if (!request) notFound()

  // Mark page as viewed
  if (!request.approval_page_viewed_at) {
    await supabase
      .from('requests')
      .update({ approval_page_viewed_at: new Date().toISOString() })
      .eq('id', request.id)
  }

  const alreadyActioned = request.approved_at || request.declined_at

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: '#080c14' }}>
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <MonadLogo />
          <p className="text-xs uppercase tracking-widest" style={{ color: '#f59e0b', letterSpacing: '0.15em' }}>
            Project Scope Review
          </p>
        </div>

        {alreadyActioned ? (
          <AlreadyActioned approved={!!request.approved_at} />
        ) : (
          <ApprovalCard request={request} token={token} />
        )}
      </div>
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ApprovalCard({ request, token }: { request: any; token: string }) {
  const project = request.project as Record<string, string>

  return (
    <div className="rounded-lg overflow-hidden" style={{ background: '#0f1624', border: '1px solid rgba(255,255,255,0.10)' }}>
      <div className="p-6 space-y-5">
        {/* From / project */}
        <div className="space-y-1 text-sm" style={{ color: '#8892a4' }}>
          <p>Regarding: <span style={{ color: '#f0f4ff' }}>{project?.name}</span></p>
        </div>

        <hr style={{ borderColor: 'rgba(255,255,255,0.06)' }} />

        {/* Request */}
        <div>
          <p className="text-xs mb-2" style={{ color: '#4a5568' }}>What you requested:</p>
          <blockquote className="text-sm italic px-3 py-2 rounded" style={{ borderLeft: '2px solid #f59e0b', background: 'rgba(245,158,11,0.06)', color: '#f0f4ff' }}>
            {(request.raw_email_body as string)?.slice(0, 300)}
          </blockquote>
        </div>

        {/* Technical breakdown */}
        {request.technical_breakdown && (
          <>
            <hr style={{ borderColor: 'rgba(255,255,255,0.06)' }} />
            <div>
              <p className="text-xs mb-2" style={{ color: '#4a5568' }}>What this involves:</p>
              <p className="text-sm" style={{ color: '#8892a4' }}>{request.technical_breakdown as string}</p>
            </div>
          </>
        )}

        {/* Cost */}
        {request.cost_min && request.cost_max && (
          <>
            <hr style={{ borderColor: 'rgba(255,255,255,0.06)' }} />
            <div className="p-4 rounded-lg" style={{ background: '#080c14', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex justify-between items-baseline mb-1">
                <p className="text-xs" style={{ color: '#4a5568' }}>Estimated additional cost:</p>
                <p className="text-2xl font-light italic" style={{ fontFamily: 'Fraunces, Georgia, serif', color: '#f59e0b' }}>
                  ${(request.cost_min as number).toLocaleString()} – ${(request.cost_max as number).toLocaleString()}
                </p>
              </div>
              {request.timeline_impact_days && (
                <p className="text-xs" style={{ color: '#4a5568' }}>
                  Estimated additional time: +{request.timeline_impact_days as number} days
                </p>
              )}
              <p className="text-xs mt-2" style={{ color: '#ef4444' }}>
                ⚠ This work is outside the original project scope.
              </p>
            </div>
          </>
        )}
      </div>

      {/* Action form */}
      <ApprovalForm token={token} costMin={request.cost_min as number} costMax={request.cost_max as number} />
    </div>
  )
}

function ApprovalForm({ token, costMin, costMax }: { token: string; costMin: number; costMax: number }) {
  return (
    <form action={`/api/approve/${token}`} method="POST" className="p-6 border-t space-y-4" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
      <label className="flex items-start gap-3 cursor-pointer">
        <input type="checkbox" name="understood" required className="mt-1 w-4 h-4" style={{ accentColor: '#f59e0b' }} />
        <span className="text-sm" style={{ color: '#8892a4' }}>
          I understand this work is outside the original project scope and agree to the estimated cost range of{' '}
          <strong style={{ color: '#f59e0b' }}>
            ${costMin?.toLocaleString()} – ${costMax?.toLocaleString()}
          </strong>{' '}
          shown above.
        </span>
      </label>

      <button
        type="submit"
        name="action"
        value="approve"
        className="w-full py-3 rounded text-sm font-medium"
        style={{ background: '#10b981', color: '#fff' }}
      >
        Approve & Schedule →
      </button>

      <button
        type="submit"
        name="action"
        value="decline"
        className="w-full text-xs py-1"
        style={{ color: '#4a5568', background: 'none', border: 'none', cursor: 'pointer' }}
      >
        Decline this request
      </button>
    </form>
  )
}

function AlreadyActioned({ approved }: { approved: boolean }) {
  return (
    <div className="text-center p-8 rounded-lg" style={{ background: '#0f1624', border: '1px solid rgba(255,255,255,0.10)' }}>
      <div className="text-4xl mb-4">{approved ? '✅' : '❌'}</div>
      <p className="text-base mb-2" style={{ color: '#f0f4ff' }}>
        {approved ? 'Request approved.' : 'Request declined.'}
      </p>
      <p className="text-sm" style={{ color: '#4a5568' }}>
        {approved
          ? 'The developer has been notified and will be in touch to schedule this work.'
          : 'The developer has been notified.'}
      </p>
    </div>
  )
}

function MonadLogo() {
  return (
    <div className="flex items-center gap-2">
      <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="4" fill="#f59e0b"/>
        <line x1="16" y1="12" x2="16" y2="4" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round"/>
        <line x1="20" y1="18.9" x2="27" y2="23" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round"/>
        <line x1="12" y1="18.9" x2="5" y2="23" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round"/>
      </svg>
      <span style={{ fontFamily: 'DM Mono, monospace', fontWeight: 500, letterSpacing: '0.08em', color: '#f0f4ff', fontSize: 14 }}>monad</span>
    </div>
  )
}
