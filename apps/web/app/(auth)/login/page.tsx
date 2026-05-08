import Link from 'next/link'
import { BrandMark } from '@/components/brand-mark'
import { login, resendVerificationAction } from '@/lib/actions/auth'
import { VerificationPoller } from '../_components/verification-poller'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string
    message?: string
    unconfirmed?: string
    email?: string
    awaiting_verification?: string
  }>
}) {
  const { error, message, unconfirmed, email, awaiting_verification } = await searchParams
  const isUnconfirmed = unconfirmed === '1'
  const isAwaiting = awaiting_verification === '1'

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#05030a] px-4 py-12 text-[#faf7ff]">
      <AuthBackdrop />
      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-sm flex-col justify-center">
        <Link className="mb-8 flex justify-center" href="/" aria-label="Monad home">
          <BrandMark size="lg" />
        </Link>

        <div className="rounded-lg border border-white/10 bg-[#0b0614]/95 p-7 shadow-[0_30px_90px_rgba(0,0,0,0.34)] backdrop-blur">
          <h1 className="text-2xl font-semibold text-white">Sign in</h1>
          <p className="mt-2 text-sm leading-6 text-[#a99dbe]">
            Get back to the requests waiting for a scope decision.
          </p>

          {error && (
            <div className="mt-5 rounded-md border border-[#fb7185]/30 bg-[#3b0b1d]/35 p-3 text-sm text-[#fecdd3]">
              {error}
            </div>
          )}

          {message && !isAwaiting && (
            <div className="mt-5 rounded-md border border-[#34d399]/30 bg-[#0b3328]/35 p-3 text-sm text-[#bbf7d0]">
              {message}
            </div>
          )}

          {isUnconfirmed && (
            <div className="mt-5 rounded-md border border-[#f59e0b]/30 bg-[#1c1a0a]/60 p-3">
              <p className="text-sm text-[#fcd34d]">
                Your email hasn&apos;t been verified yet. Check your inbox or resend the link below.
              </p>
              <form action={resendVerificationAction} className="mt-2">
                <input type="hidden" name="email" value={email ?? ''} />
                <button
                  type="submit"
                  className="text-xs font-medium text-[#f59e0b] underline-offset-2 hover:underline"
                >
                  Resend verification email
                </button>
              </form>
            </div>
          )}

          {isAwaiting && (
            <div className="mt-5 rounded-md border border-[#34d399]/30 bg-[#0b3328]/35 p-3">
              <p className="text-sm text-[#bbf7d0]">
                {message ?? 'Check your email to confirm your account.'}
                {email && (
                  <span className="block mt-0.5 text-xs text-[#6ee7b7] opacity-75">{email}</span>
                )}
              </p>
              <p className="mt-1 text-xs text-[#6ee7b7]">This window will refresh automatically once verified.</p>
              <form action={resendVerificationAction} className="mt-2">
                <input type="hidden" name="email" value={email ?? ''} />
                <button
                  type="submit"
                  className="text-xs font-medium text-[#34d399] underline-offset-2 hover:underline"
                >
                  Resend email
                </button>
              </form>
              <VerificationPoller />
            </div>
          )}

          <form action={login} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#c9bddc]">Email</label>
              <input
                type="email"
                name="email"
                required
                defaultValue={email ?? ''}
                className="h-11 w-full rounded-md border border-white/10 bg-[#07040d] px-3 text-sm text-white outline-none transition placeholder:text-[#655879] focus:border-[#a78bfa] focus:ring-2 focus:ring-[#8b5cf6]/25"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-sm font-medium text-[#c9bddc]">Password</label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-[#8f82a8] transition hover:text-[#c4b5fd]"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                name="password"
                required
                className="h-11 w-full rounded-md border border-white/10 bg-[#07040d] px-3 text-sm text-white outline-none transition placeholder:text-[#655879] focus:border-[#a78bfa] focus:ring-2 focus:ring-[#8b5cf6]/25"
                placeholder="Enter your password"
              />
            </div>
            <button
              type="submit"
              className="mt-2 h-11 w-full rounded-md bg-[#8b5cf6] text-sm font-semibold text-white shadow-[0_0_28px_rgba(139,92,246,0.28)] transition hover:bg-[#7c3aed]"
            >
              Sign in
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-[#8f82a8]">
            New to Monad?{' '}
            <Link className="font-medium text-[#c4b5fd] transition hover:text-white" href="/signup">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}

function AuthBackdrop() {
  return (
    <div aria-hidden="true" className="absolute inset-0">
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            'linear-gradient(rgba(139,92,246,0.13) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.13) 1px, transparent 1px)',
          backgroundSize: '52px 52px',
        }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,3,10,0.4)_0%,#05030a_78%)]" />
    </div>
  )
}
