import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', user.id)
    .single()

  return (
    <div className="flex h-screen" style={{ background: '#080c14' }}>
      {/* Sidebar */}
      <aside className="w-[220px] flex flex-col flex-shrink-0 border-r" style={{ background: '#0f1624', borderColor: 'rgba(255,255,255,0.06)' }}>
        {/* Logo */}
        <div className="px-5 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <Link href="/dashboard" className="flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="4" fill="#f59e0b"/>
              <line x1="16" y1="12" x2="16" y2="4" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round"/>
              <line x1="20" y1="18.9" x2="27" y2="23" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round"/>
              <line x1="12" y1="18.9" x2="5" y2="23" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span style={{ fontFamily: 'DM Mono, monospace', fontWeight: 500, letterSpacing: '0.08em', color: '#f0f4ff', fontSize: 14 }}>monad</span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          <NavLink href="/dashboard" label="Dashboard" />
          <NavLink href="/projects" label="Projects" />
          <NavLink href="/settings" label="Settings" />
        </nav>

        {/* User */}
        <div className="px-4 py-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <p className="text-xs font-medium truncate" style={{ color: '#f0f4ff' }}>{profile?.full_name ?? 'Developer'}</p>
          <p className="text-xs truncate" style={{ color: '#4a5568' }}>{profile?.email ?? user.email}</p>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  )
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center px-3 py-2 rounded text-xs transition-colors"
      style={{ fontFamily: 'DM Mono, monospace', color: '#8892a4' }}
    >
      {label}
    </Link>
  )
}
