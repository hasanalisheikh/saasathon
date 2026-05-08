import { createClient } from "@/lib/supabase/server"
import { logout } from "@/lib/actions/auth"
import { redirect } from "next/navigation"
import { SidebarProvider, SidebarInset } from "@workspace/ui/components/sidebar"
import { AppSidebar } from "./_components/app-sidebar"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", user.id)
    .single()

  return (
    <SidebarProvider>
      <AppSidebar
        user={{
          name: profile?.full_name ?? "Developer",
          email: profile?.email ?? user.email ?? "",
        }}
        logoutAction={logout}
      />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  )
}
