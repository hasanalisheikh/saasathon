import { createClient } from '@/lib/supabase/server'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single()

  return (
    <div className="flex-1 overflow-y-auto p-6 max-w-xl">
      <h1 className="text-xl mb-8" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>Settings</h1>

      {/* Profile */}
      <Section title="Profile">
        <form className="space-y-4">
          <Field label="Full name">
            <input name="full_name" defaultValue={profile?.full_name ?? ''} style={inputStyle} />
          </Field>
          <Field label="Email">
            <input name="email" defaultValue={profile?.email ?? user?.email ?? ''} disabled style={{ ...inputStyle, opacity: 0.5 }} />
          </Field>
          <Field label="Company name">
            <input name="company_name" defaultValue={profile?.company_name ?? ''} placeholder="Your Studio" style={inputStyle} />
          </Field>
          <Field label="Default hourly rate (USD)">
            <input name="hourly_rate" type="number" defaultValue={profile?.hourly_rate ?? 100} style={{ ...inputStyle, width: 100 }} />
          </Field>
          <button type="submit" className="text-sm px-4 py-2 rounded" style={{ background: '#f59e0b', color: '#080c14' }}>
            Save changes
          </button>
        </form>
      </Section>

      {/* Email Forwarding */}
      <Section title="Email Forwarding">
        <div className="p-4 rounded-lg" style={{ background: '#080c14', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2 mb-2">
            <span style={{ color: '#10b981' }}>●</span>
            <span className="text-sm">Active — inbound.monad.app is receiving emails</span>
          </div>
          <p className="text-xs" style={{ color: '#4a5568' }}>
            Each project gets a unique inbound email. Forward or BCC client emails to receive and analyse them automatically.
          </p>
        </div>
      </Section>

      {/* GitHub */}
      <Section title="GitHub">
        <div className="p-4 rounded-lg flex items-center justify-between" style={{ background: '#080c14', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div>
            <p className="text-sm mb-1">Not connected</p>
            <p className="text-xs" style={{ color: '#4a5568' }}>Connect GitHub to create issues and track work automatically.</p>
          </div>
          <a
            href="/api/github/connect"
            className="text-sm px-4 py-2 rounded"
            style={{ background: 'rgba(255,255,255,0.06)', color: '#f0f4ff', border: '1px solid rgba(255,255,255,0.10)' }}
          >
            Connect GitHub
          </a>
        </div>
      </Section>

      {/* Notifications */}
      <Section title="Notifications">
        <div className="space-y-3">
          {[
            'Email me when a new request is received',
            'Email me when a client approves or declines',
            'Weekly digest of scope creep stats',
          ].map((label) => (
            <label key={label} className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4 accent-amber-500" />
              <span className="text-sm" style={{ color: '#8892a4' }}>{label}</span>
            </label>
          ))}
        </div>
      </Section>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="text-xs uppercase tracking-wider mb-4" style={{ color: '#4a5568' }}>{title}</h2>
      {children}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs mb-1.5" style={{ color: '#8892a4' }}>{label}</label>
      {children}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  borderRadius: 6,
  background: '#080c14',
  border: '1px solid rgba(255,255,255,0.10)',
  color: '#f0f4ff',
  fontFamily: 'DM Mono, monospace',
  fontSize: 13,
  outline: 'none',
}
