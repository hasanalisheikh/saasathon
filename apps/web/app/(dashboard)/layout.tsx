import { createClient } from "@/lib/supabase/server"
import { logout } from "@/lib/actions/auth"
import { redirect } from "next/navigation"
import { SidebarProvider, SidebarInset } from "@workspace/ui/components/sidebar"
import { AppSidebar } from "./_components/app-sidebar"
import { ResizableSidebar } from "./_components/resizable-sidebar"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@workspace/ui/components/resizable"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", user.id)
    .single()

  const { data: projects } = await supabase
    .from("projects")
    .select("id, name")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <SidebarProvider style={{ "--sidebar-width": "100%" } as React.CSSProperties}>
      <ResizablePanelGroup direction="horizontal" autoSaveId="sidebar-layout">
        <ResizableSidebar>
          <AppSidebar
            user={{
              name: profile?.full_name ?? "Developer",
              email: profile?.email ?? user.email ?? "",
            }}
            projects={projects || []}
            logoutAction={logout}
          />
        </ResizableSidebar>
        <ResizableHandle />
        <ResizablePanel defaultSize={85}>
          <SidebarInset>{children}</SidebarInset>
        </ResizablePanel>
      </ResizablePanelGroup>
    </SidebarProvider>
  )
}
