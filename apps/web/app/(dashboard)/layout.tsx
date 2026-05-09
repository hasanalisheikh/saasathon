import { createClient } from "@/lib/supabase/server"
import { logout } from "@/lib/actions/auth"
import { redirect } from "next/navigation"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@workspace/ui/components/sidebar"
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

  const commitHash = getCommitHash()

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
        <ResizableHandle className="hidden md:flex" />
        <ResizablePanel defaultSize={85} className="overflow-hidden">
          <SidebarInset className="h-full flex flex-col overflow-hidden">
            <header className="px-6 pt-6 shrink-0 bg-background flex items-center gap-2">
              <SidebarTrigger className="-ml-1 md:hidden" />
              <DynamicBreadcrumb projects={projects || []} />
              <div className="ml-auto rounded border border-border px-2 py-1 text-xs text-muted-foreground">
                build {commitHash}
              </div>
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

function getCommitHash() {
  const fullHash =
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ||
    process.env.NEXT_PUBLIC_COMMIT_SHA ||
    process.env.GIT_COMMIT_SHA

  if (!fullHash) return "unknown"
  return fullHash.slice(0, 7)
}
