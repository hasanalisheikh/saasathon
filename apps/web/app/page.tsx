import Link from 'next/link'

export default function LandingPage() {
  return (
    <main className="min-h-screen" style={{ background: '#080c14', color: '#f0f4ff' }}>
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <MonadLogo />
        <div className="flex items-center gap-6">
          <Link href="#pricing" className="text-sm" style={{ color: '#8892a4' }}>Pricing</Link>
          <Link href="/login" className="text-sm" style={{ color: '#8892a4' }}>Log in</Link>
          <Link href="/signup" className="text-sm px-4 py-2 rounded" style={{ background: '#f59e0b', color: '#080c14', fontWeight: 500 }}>
            Start free →
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center text-center px-6 pt-24 pb-20">
        <p className="text-xs uppercase tracking-widest mb-6" style={{ color: '#f59e0b', letterSpacing: '0.15em' }}>
          Scope Protection for Developers
        </p>
        <h1 className="text-5xl mb-3 font-light italic" style={{ fontFamily: 'Fraunces, Georgia, serif', maxWidth: 640 }}>
          Clients email you like normal.
        </h1>
        <h2 className="text-5xl mb-8 font-light" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
          We handle the rest.
        </h2>
        <p className="text-base mb-10 max-w-xl" style={{ color: '#8892a4', fontFamily: 'DM Mono, monospace' }}>
          Monad catches scope creep before you accidentally say yes. AI analysis, client approval, GitHub evidence — all from a single forwarded email.
        </p>
        <div className="flex gap-4">
          <Link href="/signup" className="px-6 py-3 rounded text-sm font-medium" style={{ background: '#f59e0b', color: '#080c14' }}>
            Start free →
          </Link>
          <a href="#how" className="px-6 py-3 rounded text-sm" style={{ border: '1px solid rgba(255,255,255,0.10)', color: '#f0f4ff' }}>
            See how it works
          </a>
        </div>
        <p className="mt-8 text-xs" style={{ color: '#4a5568' }}>
          57% of agencies lose $1K–$5K/month to scope creep. Monad stops it.
        </p>
      </section>

      {/* How it works */}
      <section id="how" className="px-8 py-20 max-w-5xl mx-auto">
        <h3 className="text-2xl text-center mb-12" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>How it works</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { step: '01', title: 'Forward the email', desc: 'BCC client emails to your Monad project address. Nothing changes for them.' },
            { step: '02', title: 'AI analyses the request', desc: 'Monad checks it against your scope, estimates cost, and drafts a professional reply.' },
            { step: '03', title: 'Client approves, GitHub tracks it', desc: 'One-click approval. GitHub issue created. Audit trail built.' },
          ].map((item) => (
            <div key={item.step} className="p-6 rounded-lg" style={{ background: '#0f1624', border: '1px solid rgba(255,255,255,0.10)' }}>
              <p className="text-xs mb-3" style={{ color: '#f59e0b', fontFamily: 'DM Mono, monospace' }}>{item.step}</p>
              <h4 className="text-base font-medium mb-2">{item.title}</h4>
              <p className="text-sm" style={{ color: '#8892a4' }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-8 py-20 max-w-5xl mx-auto">
        <h3 className="text-2xl text-center mb-12" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>Pricing</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              name: 'Free', price: '$0', sub: 'forever',
              features: ['1 active project', '10 analyses/month', 'AI scope classification', 'Client approval flow', 'Basic proof pack'],
              cta: 'Get started', highlight: false,
            },
            {
              name: 'Pro', price: '$29', sub: '/month',
              features: ['Unlimited projects', 'Unlimited analyses', 'GitHub integration', 'PDF proof pack export', 'Unapproved work detection', 'Analytics dashboard'],
              cta: 'Start Pro trial', highlight: true,
            },
            {
              name: 'Agency', price: '$79', sub: '/month',
              features: ['Everything in Pro', 'Team workspace (8 members)', 'White-label approval emails', 'Full Gmail/Outlook OAuth', 'Enhanced dispute pack', 'Priority support'],
              cta: 'Contact us', highlight: false,
            },
          ].map((plan) => (
            <div key={plan.name} className="p-6 rounded-lg" style={{
              background: plan.highlight ? '#1c2538' : '#0f1624',
              border: plan.highlight ? '1px solid #f59e0b' : '1px solid rgba(255,255,255,0.10)',
            }}>
              <p className="text-sm font-medium mb-1">{plan.name}</p>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl font-semibold" style={{ color: plan.highlight ? '#f59e0b' : '#f0f4ff' }}>{plan.price}</span>
                <span className="text-sm" style={{ color: '#8892a4' }}>{plan.sub}</span>
              </div>
              <ul className="space-y-2 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="text-sm flex gap-2" style={{ color: '#8892a4' }}>
                    <span style={{ color: '#10b981' }}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="block text-center py-2 px-4 rounded text-sm font-medium" style={{
                background: plan.highlight ? '#f59e0b' : 'transparent',
                color: plan.highlight ? '#080c14' : '#f0f4ff',
                border: plan.highlight ? 'none' : '1px solid rgba(255,255,255,0.10)',
              }}>
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="px-8 py-10 border-t text-center text-xs" style={{ borderColor: 'rgba(255,255,255,0.06)', color: '#4a5568' }}>
        <div className="flex justify-center mb-4">
          <MonadLogo />
        </div>
        <p>The layer between what clients ask for and what developers build.</p>
        <p className="mt-2">© 2026 Monad</p>
      </footer>
    </main>
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
