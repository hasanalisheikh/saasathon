"use client"

import Link from "next/link"
import { LogOutIcon, ChevronsUpDownIcon, SunIcon, MoonIcon, SettingsIcon } from "lucide-react"
import { useTheme } from "next-themes"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@workspace/ui/components/sidebar"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"

const DICEBEAR_AVATAR_URL =
  "https://api.dicebear.com/9.x/identicon/svg?seed=Alexander"

interface NavUserProps {
  user: {
    name: string
    email: string
  }
  logoutAction: () => Promise<void>
}

function getUserInitials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "D"
  )
}

export function NavUser({ user, logoutAction }: NavUserProps) {
  const { isMobile } = useSidebar()
  const { theme, setTheme } = useTheme()
  const avatarLabel = user.name || user.email || "User"
  const initials = getUserInitials(avatarLabel)

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger render={<SidebarMenuButton size="lg" />}>
            <Avatar className="size-8 rounded-md after:rounded-md">
              <AvatarImage
                src={DICEBEAR_AVATAR_URL}
                alt={`${avatarLabel} profile picture`}
                className="rounded-md"
              />
              <AvatarFallback className="rounded-md text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left leading-tight">
              <span className="truncate text-sm font-medium">
                {user.name}
              </span>
              <span className="truncate text-xs text-muted-foreground">
                {user.email}
              </span>
            </div>
            <ChevronsUpDownIcon className="ml-auto size-4 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <div className="flex items-center gap-2 px-2 py-1.5">
              <Avatar className="size-8 rounded-md after:rounded-md">
                <AvatarImage
                  src={DICEBEAR_AVATAR_URL}
                  alt={`${avatarLabel} profile picture`}
                  className="rounded-md"
                />
                <AvatarFallback className="rounded-md text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 leading-tight">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-sm text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<Link href="/settings" />}>
              <SettingsIcon className="mr-2 size-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              {theme === "dark" ? (
                <SunIcon className="mr-2 size-4" />
              ) : (
                <MoonIcon className="mr-2 size-4" />
              )}
              Toggle Theme
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <form action={logoutAction}>
              <DropdownMenuItem render={<button type="submit" className="w-full" />}>
                <LogOutIcon className="mr-2 size-4" />
                Sign out
              </DropdownMenuItem>
            </form>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
