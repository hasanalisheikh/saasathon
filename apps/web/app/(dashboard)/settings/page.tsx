'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Separator } from "@workspace/ui/components/separator"
import { Badge } from "@workspace/ui/components/badge"
import { FormField, FormLabel } from "@workspace/ui/components/form-field"
import { PageTitle } from "@workspace/ui/components/page-header"

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
      <PageTitle className="mb-8">Settings</PageTitle>

      <Section title="Profile">
        <form onSubmit={handleSave} className="space-y-4">
          <FormField>
            <FormLabel>Full name</FormLabel>
            <Input
              name="full_name"
              defaultValue={profile?.full_name ?? ""}
              key={profile?.full_name}
            />
          </FormField>
          <FormField>
            <FormLabel>Email</FormLabel>
            <Input
              name="email"
              value={profile?.email ?? userEmail}
              disabled
              className="opacity-50"
              readOnly
            />
          </FormField>
          <FormField>
            <FormLabel>Company name</FormLabel>
            <Input
              name="company_name"
              defaultValue={profile?.company_name ?? ""}
              key={profile?.company_name}
              placeholder="Your Studio"
            />
          </FormField>
          <FormField>
            <FormLabel>Default hourly rate (USD)</FormLabel>
            <Input
              name="hourly_rate"
              type="number"
              defaultValue={profile?.hourly_rate ?? 100}
              key={profile?.hourly_rate}
              className="w-24"
            />
          </FormField>
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save changes'}
            </Button>
            {saved && <span className="text-sm text-emerald-500">Saved ✓</span>}
            {error && <span className="text-sm text-destructive">{error}</span>}
          </div>
        </form>
      </Section>

      <Section title="Email Forwarding">
        <Card size="sm">
          <CardContent>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30">
                Active
              </Badge>
              <span className="text-sm">inbound.monad.app is receiving emails</span>
            </div>
            <p className="text-xs text-muted-foreground/50">
              Each project gets a unique inbound email. Forward or BCC client emails to receive and
              analyse them automatically.
            </p>
          </CardContent>
        </Card>
      </Section>

      <Section title="GitHub">
        <Card size="sm">
          <CardContent className="flex items-center justify-between">
            {isGithubConnected ? (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-emerald-500">●</span>
                  <p className="text-sm">
                    Connected{profile?.github_username ? ` as @${profile.github_username}` : ''}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  GitHub is linked. Issues will be created automatically on approval.
                </p>
              </div>
            ) : (
              <>
                <div>
                  <p className="text-sm mb-1">Not connected</p>
                  <p className="text-xs text-muted-foreground/50">
                    Connect GitHub to create issues and track work automatically.
                  </p>
                </div>
                <Button variant="outline" render={<a href="/api/github/connect" />} nativeButton={false}>
                  Connect GitHub
                </Button>
              </>
            )}
          </CardContent>
        </Card>
        {githubStatus === 'error' && (
          <p className="text-xs mt-2 text-destructive">GitHub connection failed. Please try again.</p>
        )}
      </Section>

      <Section title="Widget">
        <WidgetSnippet />
      </Section>

      <Section title="Notifications">
        <div className="space-y-3">
          {[
            "Email me when a new request is received",
            "Email me when a client approves or declines",
            "Weekly digest of scope creep stats",
          ].map((label) => (
            <label key={label} className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4 accent-amber-500" />
              <span className="text-sm text-muted-foreground">{label}</span>
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
      <h2 className="text-xs uppercase tracking-wider mb-4 text-muted-foreground/50">{title}</h2>
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
    <Card size="sm">
      <CardContent>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-muted-foreground">
            Embed on your client portal or website — replace with your project ID
          </p>
          <Button variant="ghost" size="sm" onClick={copy}>
            {copied ? 'Copied ✓' : 'Copy'}
          </Button>
        </div>
        <pre className="text-xs overflow-x-auto whitespace-pre-wrap break-all font-mono text-primary leading-relaxed">
          {snippet}
        </pre>
      </CardContent>
    </Card>
  )
}
