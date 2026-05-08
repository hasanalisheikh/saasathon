import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#080c14' }}>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <MonadLogo />
        </div>

        <div className="p-8 rounded-lg" style={{ background: '#0f1624', border: '1px solid rgba(255,255,255,0.10)' }}>
          <h1 className="text-xl mb-6" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>Sign in</h1>

          <form className="space-y-4">
            <div>
              <label className="block text-xs mb-1.5" style={{ color: '#8892a4' }}>Email</label>
              <input
                type="email"
                name="email"
                required
                className="w-full px-3 py-2 rounded text-sm outline-none"
                style={{
                  background: '#080c14',
                  border: '1px solid rgba(255,255,255,0.10)',
                  color: '#f0f4ff',
                  fontFamily: 'DM Mono, monospace',
                }}
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-xs mb-1.5" style={{ color: '#8892a4' }}>Password</label>
              <input
                type="password"
                name="password"
                required
                className="w-full px-3 py-2 rounded text-sm outline-none"
                style={{
                  background: '#080c14',
                  border: '1px solid rgba(255,255,255,0.10)',
                  color: '#f0f4ff',
                  fontFamily: 'DM Mono, monospace',
                }}
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded text-sm font-medium mt-2"
              style={{ background: '#f59e0b', color: '#080c14' }}
            >
              Sign in
            </button>
          </form>

          <p className="text-xs text-center mt-5" style={{ color: '#4a5568' }}>
            New to Monad?{' '}
            <Link href="/signup" style={{ color: '#f59e0b' }}>Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

function MonadLogo() {
  return (
    <div className="flex items-center gap-2">
      <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="4" fill="#f59e0b"/>
        <line x1="16" y1="12" x2="16" y2="4" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round"/>
        <line x1="20" y1="18.9" x2="27" y2="23" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round"/>
        <line x1="12" y1="18.9" x2="5" y2="23" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round"/>
      </svg>
      <span style={{ fontFamily: 'DM Mono, monospace', fontWeight: 500, letterSpacing: '0.08em', color: '#f0f4ff' }}>monad</span>
    </div>
  )
}
