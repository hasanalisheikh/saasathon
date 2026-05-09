'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { CopyIcon, EllipsisIcon, MailIcon, PencilIcon, PlusIcon } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'
import type { Project } from '@/types'
import { EditProjectModal } from './edit-project-modal'

interface ProjectPageActionsProps {
  appUrl: string | null
  project: Project
}

export function ProjectPageActions({ appUrl, project }: ProjectPageActionsProps) {
  const [editOpen, setEditOpen] = useState(false)

  const widgetSnippet = useMemo(
    () =>
      appUrl
        ? `<script src="${appUrl}/widget.js" data-project-id="${project.id}" data-client-token="${project.widget_token}"></script>`
        : null,
    [appUrl, project.id, project.widget_token],
  )

  async function copyText(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value)
      toast.success(`${label} copied`)
    } catch {
      toast.error(`Couldn't copy ${label.toLowerCase()}`)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="outline"
              size="icon-lg"
              aria-label="Project actions"
              className="rounded-lg border-border/80 bg-background hover:bg-muted"
            />
          }
        >
          <EllipsisIcon className="size-5 text-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <PencilIcon />
            Edit project
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link href={`/projects/${project.id}/requests/new`} />}>
            <PlusIcon />
            Add request
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            disabled={!widgetSnippet}
            onClick={() => {
              if (!widgetSnippet) return
              copyText(widgetSnippet, 'Widget embed')
            }}
          >
            <CopyIcon />
            Copy widget embed
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={!project.inbound_email}
            onClick={() => {
              if (!project.inbound_email) return
              copyText(project.inbound_email, 'Legacy email address')
            }}
          >
            <MailIcon />
            Copy legacy email
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditProjectModal project={project} open={editOpen} onOpenChange={setEditOpen} hideTrigger />
    </>
  )
}
