"use client"

import * as React from "react"
import { ResizablePanel } from "@workspace/ui/components/resizable"
import { useSidebar } from "@workspace/ui/components/sidebar"
import { cn } from "@workspace/ui/lib/utils"
import type { ImperativePanelHandle } from "react-resizable-panels"

const EXPANDED_MIN = 10
const EXPANDED_MAX = 30
const EXPANDED_DEFAULT = 15
const COLLAPSED_SIZE = 4

export function ResizableSidebar({ children }: { children: React.ReactNode }) {
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"
  const panelRef = React.useRef<ImperativePanelHandle>(null)
  const prevStateRef = React.useRef(state)

  React.useEffect(() => {
    if (prevStateRef.current === state) return
    const panel = panelRef.current
    if (!panel) return

    // Apply a brief smooth transition, then resize
    const el = document.querySelector(
      `[data-panel-id="${panel.getId()}"]`
    ) as HTMLElement | null

    if (el) {
      el.style.transition = "flex-grow 200ms ease-out, min-width 200ms ease-out, max-width 200ms ease-out"
      const cleanup = () => { el.style.transition = "" }
      el.addEventListener("transitionend", cleanup, { once: true })
      // Fallback cleanup
      setTimeout(cleanup, 250)
    }

    panel.resize(isCollapsed ? COLLAPSED_SIZE : EXPANDED_DEFAULT)
    prevStateRef.current = state
  }, [state, isCollapsed])

  return (
    <ResizablePanel
      ref={panelRef}
      defaultSize={EXPANDED_DEFAULT}
      minSize={isCollapsed ? COLLAPSED_SIZE : EXPANDED_MIN}
      maxSize={isCollapsed ? COLLAPSED_SIZE : EXPANDED_MAX}
      className={cn(
        isCollapsed ? "min-w-[48px] max-w-[48px]" : "min-w-[240px] max-w-[400px]"
      )}
    >
      {children}
    </ResizablePanel>
  )
}
