import Link from 'next/link'
import { BrandMark } from '@/components/brand-mark'
import { forgotPasswordAction } from '@/lib/actions/auth'

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>
}) {
  const { error, message } = await searchParams

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#05030a] px-4 py-12 text-[#faf7ff]">
      <AuthBackdrop />
      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-sm flex-col justify-center">
        <Link className="mb-8 flex justify-center" href="/" aria-label="Monad home">
          <BrandMark size="lg" />
        </Link>

        <div className="rounded-lg border border-white/10 bg-[#0b0614]/95 p-7 shadow-[0_30px_90px_rgba(0,0,0,0.34)] backdrop-blur">
          <h1 className="text-2xl font-semibold text-white">Reset password</h1>
          <p className="mt-2 text-sm leading-6 text-[#a99dbe]">
            Enter your email and we&apos;ll send a reset link if that account exists.
          </p>

          {error && (
            <div className="mt-5 rounded-md border border-[#fb7185]/30 bg-[#3b0b1d]/35 p-3 text-sm text-[#fecdd3]">
              {error}
            </div>
          )}

          {message && (
            <div className="mt-5 rounded-md border border-[#34d399]/30 bg-[#0b3328]/35 p-3 text-sm text-[#bbf7d0]">
              {message}
            </div>
          )}

          <form action={forgotPasswordAction} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#c9bddc]">Email</label>
              <input
                type="email"
                name="email"
                required
                className="h-11 w-full rounded-md border border-white/10 bg-[#07040d] px-3 text-sm text-white outline-none transition placeholder:text-[#655879] focus:border-[#a78bfa] focus:ring-2 focus:ring-[#8b5cf6]/25"
                placeholder="you@example.com"
              />
            </div>
            <button
              type="submit"
              className="mt-2 h-11 w-full rounded-md bg-[#f59e0b] text-sm font-semibold text-[#080c14] shadow-[0_0_24px_rgba(245,158,11,0.22)] transition hover:bg-[#d97706]"
            >
              Send reset link
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-[#8f82a8]">
            Remembered it?{' '}
            <Link className="font-medium text-[#c4b5fd] transition hover:text-white" href="/login">
              Sign in
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
