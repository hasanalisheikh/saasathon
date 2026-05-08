"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, LogOut, Plus } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar"
import { Badge } from "@workspace/ui/components/badge"
import { Separator } from "@workspace/ui/components/separator"
import { cn } from "@workspace/ui/lib/utils"
import { logout } from "@/lib/actions/auth"

type User = {
  email: string
  full_name: string | null
  avatar_url: string | null
  tier: "free" | "pro" | "org"
}

export function AppSidebar({ user }: { user: User }) {
  const pathname = usePathname()

  const initials = user.full_name
    ? user.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user.email[0]?.toUpperCase() ?? "?"

  return (
    <aside className="border-border bg-background flex h-svh w-52 shrink-0 flex-col border-r">
      {/* Logo */}
      <div className="flex h-12 items-center gap-2 px-4">
        <div className="bg-primary size-5 rounded" />
        <span className="text-sm font-semibold">ProjectPilot</span>
      </div>

      <Separator />

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-2">
        <div className="space-y-0.5">
          <NavItem href="/dashboard" icon={LayoutDashboard} label="Dashboard" active={pathname === "/dashboard"} />
        </div>
      </nav>

      <Separator />

      {/* User */}
      <div className="p-3 space-y-2">
        <div className="flex items-center gap-2 min-w-0">
          <Avatar className="size-6 shrink-0">
            <AvatarImage src={user.avatar_url ?? undefined} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium truncate">{user.full_name ?? user.email}</p>
            <Badge variant={user.tier === "free" ? "secondary" : "default"} className="mt-0.5">
              {user.tier}
            </Badge>
          </div>
        </div>
        <form action={logout}>
          <Button variant="ghost" size="sm" type="submit" className="w-full justify-start gap-2 text-muted-foreground">
            <LogOut className="size-3.5" />
            Sign out
          </Button>
        </form>
      </div>
    </aside>
  )
}

function NavItem({
  href,
  icon: Icon,
  label,
  active,
}: {
  href: string
  icon: React.ElementType
  label: string
  active: boolean
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors",
        active
          ? "bg-primary/10 text-primary font-medium"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      <Icon className="size-3.5 shrink-0" />
      {label}
    </Link>
  )
}
