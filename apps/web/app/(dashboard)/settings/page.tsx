'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useSearchParams } from 'next/navigation'

interface Profile {
  full_name: string | null
  email: string | null
  company_name: string | null
  hourly_rate: number | null
  github_username: string | null
}

export default function SettingsPage() {
  const searchParams = useSearchParams()
  const githubStatus = searchParams.get('github')

  const [profile, setProfile] = useState<Profile | null>(null)
  const [userEmail, setUserEmail] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserEmail(user.email ?? '')
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) setProfile(data)
    }
    load()
  }, [])

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    setError('')

    const form = e.currentTarget
    const fd = new FormData(form)

    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: fd.get('full_name'),
        company_name: fd.get('company_name'),
        hourly_rate: fd.get('hourly_rate'),
      }),
    })

    if (res.ok) {
      const updated = await res.json()
      setProfile(updated)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } else {
      setError('Failed to save. Please try again.')
    }
    setSaving(false)
  }

  const isGithubConnected = githubStatus === 'connected' || !!profile?.github_username

  return (
    <div className="flex-1 overflow-y-auto p-6 max-w-xl">
      <h1 className="text-xl mb-8" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>Settings</h1>

      <Section title="Profile">
        <form onSubmit={handleSave} className="space-y-4">
          <Field label="Full name">
            <input
              name="full_name"
              defaultValue={profile?.full_name ?? ''}
              key={profile?.full_name}
              style={inputStyle}
            />
          </Field>
          <Field label="Email">
            <input
              name="email"
              value={profile?.email ?? userEmail}
              disabled
              style={{ ...inputStyle, opacity: 0.5 }}
              readOnly
            />
          </Field>
          <Field label="Company name">
            <input
              name="company_name"
              defaultValue={profile?.company_name ?? ''}
              key={profile?.company_name}
              placeholder="Your Studio"
              style={inputStyle}
            />
          </Field>
          <Field label="Default hourly rate (USD)">
            <input
              name="hourly_rate"
              type="number"
              defaultValue={profile?.hourly_rate ?? 100}
              key={profile?.hourly_rate}
              style={{ ...inputStyle, width: 100 }}
            />
          </Field>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="text-sm px-4 py-2 rounded"
              style={{ background: '#f59e0b', color: '#080c14', opacity: saving ? 0.7 : 1 }}
            >
              {saving ? 'Saving…' : 'Save changes'}
            </button>
            {saved && <span className="text-sm" style={{ color: '#10b981' }}>Saved ✓</span>}
            {error && <span className="text-sm" style={{ color: '#ef4444' }}>{error}</span>}
          </div>
        </form>
      </Section>

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

      <Section title="GitHub">
        <div className="p-4 rounded-lg flex items-center justify-between" style={{ background: '#080c14', border: '1px solid rgba(255,255,255,0.06)' }}>
          {isGithubConnected ? (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span style={{ color: '#10b981' }}>●</span>
                <p className="text-sm">
                  Connected{profile?.github_username ? ` as @${profile.github_username}` : ''}
                </p>
              </div>
              <p className="text-xs" style={{ color: '#4a5568' }}>GitHub is linked. Issues will be created automatically on approval.</p>
            </div>
          ) : (
            <>
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
            </>
          )}
          {githubStatus === 'error' && (
            <p className="text-xs mt-2" style={{ color: '#ef4444' }}>GitHub connection failed. Please try again.</p>
          )}
        </div>
      </Section>

      <Section title="Widget">
        <WidgetSnippet />
      </Section>

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

function WidgetSnippet() {
  const [copied, setCopied] = useState(false)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://monad.app'
  const snippet = `<script src="${appUrl}/widget.js" data-project-id="YOUR_PROJECT_ID"></script>`

  const copy = () => {
    navigator.clipboard.writeText(snippet)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="p-4 rounded-lg" style={{ background: '#080c14', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs" style={{ color: '#8892a4' }}>Embed on your client portal or website — replace with your project ID</p>
        <button
          onClick={copy}
          className="text-xs px-2 py-0.5 rounded"
          style={{ background: 'rgba(255,255,255,0.06)', color: copied ? '#10b981' : '#8892a4', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          {copied ? 'Copied ✓' : 'Copy'}
        </button>
      </div>
      <pre
        className="text-xs overflow-x-auto whitespace-pre-wrap break-all"
        style={{ fontFamily: 'DM Mono, monospace', color: '#f59e0b', lineHeight: 1.6 }}
      >
        {snippet}
      </pre>
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
