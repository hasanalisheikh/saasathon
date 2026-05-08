"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboardIcon, 
  FolderIcon, 
  FileTextIcon, 
  BlocksIcon, 
  CalendarIcon, 
  SearchIcon 
} from "lucide-react"
import {
  Sidebar,
  useSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarTrigger,
} from "@workspace/ui/components/sidebar"
import { NavUser } from "./nav-user"

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboardIcon },
  { href: "/documents", label: "Documents", icon: FileTextIcon },
  { href: "/integrations", label: "Integrations", icon: BlocksIcon },
  { href: "/calendar", label: "Calendar", icon: CalendarIcon },
]



interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: { name: string; email: string }
  projects: { id: string; name: string }[]
  logoutAction: () => Promise<void>
}

export function AppSidebar({ user, projects, logoutAction, ...props }: AppSidebarProps) {
  const pathname = usePathname()
  const { state, setOpen } = useSidebar()

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              size="lg" 
              render={<Link href="/dashboard" />}
              onClick={(e) => {
                if (state === "collapsed") {
                  e.preventDefault()
                  setOpen(true)
                }
              }}
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <svg width="16" height="16" viewBox="0 0 32 32" fill="none">
                  <circle cx="16" cy="16" r="4" fill="currentColor" />
                  <line x1="16" y1="12" x2="16" y2="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <line x1="20" y1="18.9" x2="27" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <line x1="12" y1="18.9" x2="5" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <span className="truncate font-semibold pr-8 group-data-[collapsible=icon]:hidden">
                monad
              </span>
            </SidebarMenuButton>
            <SidebarTrigger className="absolute right-1 top-1/2 -translate-y-1/2 z-10 transition-none active:!-translate-y-1/2 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:pointer-events-none group-hover/menu-item:!opacity-100 group-hover/menu-item:!pointer-events-auto" />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="py-0">
          <SidebarGroupContent className="relative">
            {state === "collapsed" ? (
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Search" onClick={() => setOpen(true)}>
                    <SearchIcon />
                    <span>Search</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            ) : (
              <>
                <SearchIcon className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 size-4 opacity-50 z-10" />
                <SidebarInput placeholder="Search..." className="pl-8" />
              </>
            )}
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    render={<Link href={item.href} />}
                    isActive={pathname === item.href || pathname.startsWith(item.href + "/")}
                    tooltip={item.label}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="py-0">
          {state === "collapsed" ? (
            <SidebarSeparator className="mx-0" />
          ) : (
            <SidebarGroupLabel>Projects</SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {projects.map((project) => (
                <SidebarMenuItem key={project.id}>
                  <SidebarMenuButton
                    render={<Link href={`/projects/${project.id}`} />}
                    isActive={pathname === `/projects/${project.id}` || pathname.startsWith(`/projects/${project.id}/`)}
                    tooltip={project.name}
                  >
                    <FolderIcon />
                    <span>{project.name}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={user} logoutAction={logoutAction} />
      </SidebarFooter>
    </Sidebar>
  )
}
