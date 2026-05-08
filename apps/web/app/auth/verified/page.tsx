'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { BrandMark } from '@/components/brand-mark'
import { broadcastEmailVerified } from '@/lib/auth/cross-tab-sync'

export default function VerifiedPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const verified = searchParams.get('verified')

  useEffect(() => {
    if (verified !== '1') {
      router.replace('/dashboard')
      return
    }
    broadcastEmailVerified()
  }, [verified, router])

  if (verified !== '1') return null

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#05030a] px-4 py-12 text-[#faf7ff]">
      <AuthBackdrop />
      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-sm flex-col justify-center">
        <Link className="mb-8 flex justify-center" href="/" aria-label="Monad home">
          <BrandMark size="lg" />
        </Link>

        <div className="rounded-lg border border-white/10 bg-[#0b0614]/95 p-8 shadow-[0_30px_90px_rgba(0,0,0,0.34)] backdrop-blur text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl border border-[#f59e0b]/25 bg-[#1c1a0a]">
            <svg
              className="h-7 w-7 text-[#f59e0b]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-2xl font-semibold text-white">Email confirmed.</h1>
          <p className="mt-3 text-sm leading-6 text-[#a99dbe]">
            You&apos;re all set. Your other window will refresh automatically — you can close this tab.
          </p>

          <Link
            href="/dashboard"
            className="mt-6 inline-flex h-11 items-center justify-center rounded-md bg-[#f59e0b] px-6 text-sm font-semibold text-[#080c14] shadow-[0_0_24px_rgba(245,158,11,0.22)] transition hover:bg-[#d97706]"
          >
            Go to dashboard →
          </Link>
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
            'linear-gradient(rgba(245,158,11,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11,0.08) 1px, transparent 1px)',
          backgroundSize: '52px 52px',
        }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,3,10,0.4)_0%,#05030a_78%)]" />
      <div
        className="absolute"
        style={{
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(245,158,11,0.07) 0%, transparent 70%)',
          left: '50%',
          top: '30%',
          transform: 'translate(-50%, -50%)',
        }}
      />
    </div>
  )
}
