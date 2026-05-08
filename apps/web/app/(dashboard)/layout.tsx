import { createClient } from "@/lib/supabase/server"
import { logout } from "@/lib/actions/auth"
import { redirect } from "next/navigation"
import { SidebarProvider, SidebarInset } from "@workspace/ui/components/sidebar"
import { AppSidebar } from "./_components/app-sidebar"
import { ResizableSidebar } from "./_components/resizable-sidebar"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@workspace/ui/components/resizable"
import { DynamicBreadcrumb } from "./_components/dynamic-breadcrumb"

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
    <SidebarProvider className="h-svh overflow-hidden" style={{ "--sidebar-width": "100%" } as React.CSSProperties}>
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
        <ResizablePanel defaultSize={85} className="overflow-hidden">
          <SidebarInset className="h-full flex flex-col overflow-hidden">
            <header className="px-6 pt-6 shrink-0 bg-background">
              <DynamicBreadcrumb projects={projects || []} />
            </header>
            <div className="flex-1 min-h-0 overflow-y-auto">
              {children}
            </div>
          </SidebarInset>
        </ResizablePanel>
      </ResizablePanelGroup>
    </SidebarProvider>
  )
}
