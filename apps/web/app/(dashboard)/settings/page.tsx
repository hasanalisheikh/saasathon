import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Separator } from "@workspace/ui/components/separator"
import { Badge } from "@workspace/ui/components/badge"
import { FormField, FormLabel } from "@workspace/ui/components/form-field"
import { PageTitle } from "@workspace/ui/components/page-header"

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single()

  return (
    <div className="flex-1 overflow-y-auto p-6 max-w-xl">
      <PageTitle className="mb-8">Settings</PageTitle>

      {/* Profile */}
      <Section title="Profile">
        <form className="space-y-4">
          <FormField>
            <FormLabel>Full name</FormLabel>
            <Input name="full_name" defaultValue={profile?.full_name ?? ""} />
          </FormField>
          <FormField>
            <FormLabel>Email</FormLabel>
            <Input
              name="email"
              defaultValue={profile?.email ?? user?.email ?? ""}
              disabled
              className="opacity-50"
            />
          </FormField>
          <FormField>
            <FormLabel>Company name</FormLabel>
            <Input
              name="company_name"
              defaultValue={profile?.company_name ?? ""}
              placeholder="Your Studio"
            />
          </FormField>
          <FormField>
            <FormLabel>Default hourly rate (USD)</FormLabel>
            <Input
              name="hourly_rate"
              type="number"
              defaultValue={profile?.hourly_rate ?? 100}
              className="w-24"
            />
          </FormField>
          <Button type="submit">Save changes</Button>
        </form>
      </Section>

      {/* Email Forwarding */}
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

      {/* GitHub */}
      <Section title="GitHub">
        <Card size="sm">
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-sm mb-1">Not connected</p>
              <p className="text-xs text-muted-foreground/50">
                Connect GitHub to create issues and track work automatically.
              </p>
            </div>
            <Button variant="outline" render={<a href="/api/github/connect" />} nativeButton={false}>
              Connect GitHub
            </Button>
          </CardContent>
        </Card>
      </Section>

      {/* Notifications */}
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
