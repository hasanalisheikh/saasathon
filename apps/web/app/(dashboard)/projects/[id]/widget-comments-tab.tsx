'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@workspace/ui/components/card'
import { Button } from '@workspace/ui/components/button'
import {
  EmptyState,
  EmptyStateTitle,
  EmptyStateDescription,
} from '@workspace/ui/components/empty-state'
import type { WidgetComment } from '@/types'

interface Props {
  comments: WidgetComment[]
  projectId: string
}

export function WidgetCommentsTab({ comments, projectId }: Props) {
  const router = useRouter()
  const [converting, setConverting] = useState<string | null>(null)

  async function convertToRequest(comment: WidgetComment) {
    setConverting(comment.id)
    try {
      const res = await fetch(`/api/projects/${projectId}/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          raw_email_body: comment.comment_text,
          raw_email_from: comment.client_name ?? undefined,
          raw_email_subject: comment.page_url ? `Widget comment on ${comment.page_url}` : 'Widget comment',
          comment_id: comment.id,
        }),
      })
      if (!res.ok) throw new Error(await res.text())
      const { id } = await res.json()
      router.push(`/projects/${projectId}/requests/${id}`)
    } catch (err) {
      console.error(err)
      alert('Failed to convert comment. Please try again.')
    } finally {
      setConverting(null)
    }
  }

  if (!comments.length) {
    return (
      <EmptyState>
        <EmptyStateTitle>No widget comments yet.</EmptyStateTitle>
        <EmptyStateDescription>
          Embed the widget on your client&apos;s site and comments will appear here for manual conversion into a Monad request.
        </EmptyStateDescription>
      </EmptyState>
    )
  }

  return (
    <div className="space-y-2">
      {comments.map((comment) => (
        <Card key={comment.id}>
          <CardContent className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm leading-5">{comment.comment_text}</p>
              <p className="text-xs mt-1 text-muted-foreground/60">
                {comment.client_name ?? 'Anonymous'}
                {comment.page_url ? ` · ${comment.page_url}` : ''}
                {' · '}
                {new Date(comment.created_at).toLocaleDateString()}
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              disabled={converting === comment.id}
              onClick={() => convertToRequest(comment)}
            >
              {converting === comment.id ? 'Converting…' : 'Convert to Request →'}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
