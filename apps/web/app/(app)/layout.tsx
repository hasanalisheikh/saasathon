import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url, email, tier")
    .eq("id", user.id)
    .single()

  return (
    <div className="flex min-h-svh">
      <AppSidebar user={profile ?? { email: user.email ?? "", full_name: null, avatar_url: null, tier: "free" }} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
