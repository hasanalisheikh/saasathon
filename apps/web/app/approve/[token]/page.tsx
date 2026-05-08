import { BrandMark } from '@/components/brand-mark'
import { createServiceClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export default async function ApprovePage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>
  searchParams: Promise<{ action?: string }>
}) {
  const { token } = await params
  const { action } = await searchParams
  const supabase = await createServiceClient()

  const { data: request } = await supabase
    .from('requests')
    .select('*, project:projects(name, client_name)')
    .eq('approval_token', token)
    .single()

  if (!request) notFound()

  // One-click decline from email link
  if (action === 'decline' && !request.approved_at && !request.declined_at) {
    await supabase
      .from('requests')
      .update({ status: 'declined', declined_at: new Date().toISOString() })
      .eq('approval_token', token)

    return (
      <main className="relative min-h-screen overflow-hidden bg-[#05030a] px-4 py-10 text-[#faf7ff]">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              'linear-gradient(rgba(139,92,246,0.13) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.13) 1px, transparent 1px)',
            backgroundSize: '54px 54px',
          }}
        />
        <div className="relative z-10 mx-auto w-full max-w-2xl">
          <div className="mb-8 flex items-center justify-between gap-4">
            <BrandMark size="sm" />
            <p className="rounded-md border border-[#8b5cf6]/30 bg-[#120a22]/80 px-3 py-1.5 text-xs font-semibold text-[#d8ccff]">
              Project scope review
            </p>
          </div>
          <AlreadyActioned approved={false} />
        </div>
      </main>
    )
  }

  if (!request.approval_page_viewed_at) {
    await supabase
      .from('requests')
      .update({ approval_page_viewed_at: new Date().toISOString() })
      .eq('id', request.id)
  }

  const alreadyActioned = request.approved_at || request.declined_at

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#05030a] px-4 py-10 text-[#faf7ff]">
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            'linear-gradient(rgba(139,92,246,0.13) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.13) 1px, transparent 1px)',
          backgroundSize: '54px 54px',
        }}
      />
      <div className="relative z-10 mx-auto w-full max-w-2xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <BrandMark size="sm" />
          <p className="rounded-md border border-[#8b5cf6]/30 bg-[#120a22]/80 px-3 py-1.5 text-xs font-semibold text-[#d8ccff]">
            Project scope review
          </p>
        </div>

        {alreadyActioned ? (
          <AlreadyActioned approved={!!request.approved_at} />
        ) : (
          <ApprovalCard request={request} token={token} />
        )}
      </div>
    </main>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ApprovalCard({ request, token }: { request: any; token: string }) {
  const project = request.project as Record<string, string>

  return (
    <div className="overflow-hidden rounded-lg border border-white/10 bg-[#0b0614]/95 shadow-[0_30px_90px_rgba(0,0,0,0.34)] backdrop-blur">
      <div className="space-y-6 p-6">
        <div>
          <p className="text-sm text-[#8f82a8]">Regarding</p>
          <p className="mt-1 text-lg font-semibold text-white">{project?.name}</p>
        </div>

        <div className="h-px bg-white/10" />

        <div>
          <p className="mb-2 text-sm font-medium text-[#c9bddc]">What you requested</p>
          <blockquote className="rounded-md border-l-2 border-[#a78bfa] bg-[#120a22] px-4 py-3 text-sm leading-6 text-[#eee8ff]">
            {(request.raw_email_body as string)?.slice(0, 300)}
          </blockquote>
        </div>

        {request.technical_breakdown && (
          <>
            <div className="h-px bg-white/10" />
            <div>
              <p className="mb-2 text-sm font-medium text-[#c9bddc]">What this involves</p>
              <p className="text-sm leading-7 text-[#afa3c5]">{request.technical_breakdown as string}</p>
            </div>
          </>
        )}

        {request.cost_min && request.cost_max && (
          <>
            <div className="h-px bg-white/10" />
            <div className="rounded-lg border border-[#8b5cf6]/25 bg-[#08040f] p-4">
              <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-baseline">
                <p className="text-sm text-[#8f82a8]">Estimated additional cost</p>
                <p className="text-2xl font-semibold text-[#c4b5fd]">
                  ${(request.cost_min as number).toLocaleString()} - $
                  {(request.cost_max as number).toLocaleString()}
                </p>
              </div>
              {request.timeline_impact_days && (
                <p className="mt-2 text-sm text-[#8f82a8]">
                  Estimated additional time: +{request.timeline_impact_days as number} days
                </p>
              )}
              <p className="mt-3 rounded-md border border-[#fb7185]/25 bg-[#3b0b1d]/25 px-3 py-2 text-sm text-[#fecdd3]">
                This work is outside the original project scope.
              </p>
            </div>
          </>
        )}
      </div>

      <ApprovalForm token={token} costMin={request.cost_min as number} costMax={request.cost_max as number} />
    </div>
  )
}

function ApprovalForm({ token, costMin, costMax }: { token: string; costMin: number; costMax: number }) {
  return (
    <>
      <form action={`/api/approve/${token}`} method="POST" className="space-y-4 border-t border-white/10 p-6">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            name="understood"
            required
            className="mt-1 size-4"
            style={{ accentColor: '#8b5cf6' }}
          />
          <span className="text-sm leading-6 text-[#afa3c5]">
            I understand this work is outside the original project scope and agree to the estimated cost
            range of{' '}
            <strong className="font-semibold text-[#c4b5fd]">
              ${costMin?.toLocaleString()} - ${costMax?.toLocaleString()}
            </strong>{' '}
            shown above.
          </span>
        </label>

        <button
          type="submit"
          name="action"
          value="approve"
          className="h-12 w-full rounded-md bg-[#34d399] text-sm font-semibold text-[#03130e] transition hover:bg-[#6ee7b7]"
        >
          Approve and schedule
        </button>

      </form>

      <form action={`/api/approve/${token}`} method="POST" className="px-6 pb-6">
        <button
          type="submit"
          name="action"
          value="decline"
          className="w-full rounded-md py-2 text-sm text-[#8f82a8] transition hover:bg-white/[0.04] hover:text-white"
        >
          Decline this request
        </button>
      </form>
    </>
  )
}

function AlreadyActioned({ approved }: { approved: boolean }) {
  return (
    <div className="rounded-lg border border-white/10 bg-[#0b0614]/95 p-8 text-center shadow-[0_30px_90px_rgba(0,0,0,0.34)] backdrop-blur">
      <span
        className={`inline-flex rounded-md px-3 py-1.5 text-sm font-semibold ${
          approved ? 'bg-[#12352b] text-[#86efac]' : 'bg-[#3b0b1d] text-[#fecdd3]'
        }`}
      >
        {approved ? 'Approved' : 'Declined'}
      </span>
      <p className="mt-5 text-lg font-semibold text-white">
        {approved ? 'Request approved.' : 'Request declined.'}
      </p>
      <p className="mt-2 text-sm leading-6 text-[#8f82a8]">
        {approved
          ? 'The developer has been notified and will be in touch to schedule this work.'
          : 'The developer has been notified.'}
      </p>
    </div>
  )
}
