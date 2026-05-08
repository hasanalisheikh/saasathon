'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { BrandMark } from '@/components/brand-mark'
import { createClient } from '@/lib/supabase/client'
import { resetPasswordAction } from '@/lib/actions/auth'

type PageState = 'loading' | 'no-session' | 'ready'

const STRENGTH_HINT = 'Min. 8 characters · one uppercase letter · one special character (!@#$%^&*)'

export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const [state, setState] = useState<PageState>('loading')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data }) => {
      setState(data.session ? 'ready' : 'no-session')
    })
  }, [])

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#05030a] px-4 py-12 text-[#faf7ff]">
      <AuthBackdrop />
      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-sm flex-col justify-center">
        <Link className="mb-8 flex justify-center" href="/" aria-label="Monad home">
          <BrandMark size="lg" />
        </Link>

        <div className="rounded-lg border border-white/10 bg-[#0b0614]/95 p-7 shadow-[0_30px_90px_rgba(0,0,0,0.34)] backdrop-blur">
          {state === 'loading' && (
            <div className="flex flex-col items-center py-6 text-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#f59e0b] border-t-transparent" />
              <p className="mt-3 text-sm text-[#8892a4]">Verifying your link…</p>
            </div>
          )}

          {state === 'no-session' && (
            <>
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl border border-[#fb7185]/20 bg-[#3b0b1d]/40">
                <svg className="h-7 w-7 text-[#fb7185]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
              </div>
              <h1 className="text-xl font-semibold text-white">This link has expired</h1>
              <p className="mt-2 text-sm leading-6 text-[#a99dbe]">
                Password reset links are single-use and expire after 1 hour. Request a new one below.
              </p>
              <Link
                href="/forgot-password"
                className="mt-6 flex h-11 items-center justify-center rounded-md bg-[#f59e0b] text-sm font-semibold text-[#080c14] shadow-[0_0_24px_rgba(245,158,11,0.22)] transition hover:bg-[#d97706]"
              >
                Request a new link
              </Link>
              <p className="mt-4 text-center text-sm text-[#8f82a8]">
                <Link className="font-medium text-[#c4b5fd] transition hover:text-white" href="/login">
                  Back to sign in
                </Link>
              </p>
            </>
          )}

          {state === 'ready' && (
            <>
              <h1 className="text-2xl font-semibold text-white">Choose a new password</h1>
              <p className="mt-2 text-sm leading-6 text-[#a99dbe]">
                Pick something strong — you won&apos;t be able to reuse the old one.
              </p>

              {error && (
                <div className="mt-5 rounded-md border border-[#fb7185]/30 bg-[#3b0b1d]/35 p-3 text-sm text-[#fecdd3]">
                  {error}
                </div>
              )}

              <form action={resetPasswordAction} className="mt-6 space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#c9bddc]">New password</label>
                  <input
                    type="password"
                    name="password"
                    required
                    className="h-11 w-full rounded-md border border-white/10 bg-[#07040d] px-3 text-sm text-white outline-none transition placeholder:text-[#655879] focus:border-[#a78bfa] focus:ring-2 focus:ring-[#8b5cf6]/25"
                    placeholder="Enter new password"
                  />
                  <p className="mt-1.5 text-xs text-[#655879]">{STRENGTH_HINT}</p>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#c9bddc]">Confirm new password</label>
                  <input
                    type="password"
                    name="confirm_password"
                    required
                    className="h-11 w-full rounded-md border border-white/10 bg-[#07040d] px-3 text-sm text-white outline-none transition placeholder:text-[#655879] focus:border-[#a78bfa] focus:ring-2 focus:ring-[#8b5cf6]/25"
                    placeholder="Repeat new password"
                  />
                </div>
                <button
                  type="submit"
                  className="mt-2 h-11 w-full rounded-md bg-[#f59e0b] text-sm font-semibold text-[#080c14] shadow-[0_0_24px_rgba(245,158,11,0.22)] transition hover:bg-[#d97706]"
                >
                  Set new password
                </button>
              </form>
            </>
          )}
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
