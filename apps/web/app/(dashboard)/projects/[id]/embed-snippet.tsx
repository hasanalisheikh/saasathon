'use client'

import { useState } from 'react'

export function EmbedSnippet({ projectId }: { projectId: string }) {
  const [copied, setCopied] = useState(false)
  const snippet = `<script src="${process.env.NEXT_PUBLIC_APP_URL ?? 'https://monad.app'}/widget.js" data-project-id="${projectId}"></script>`

  const copy = () => {
    navigator.clipboard.writeText(snippet)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="p-4 rounded-lg" style={{ background: '#080c14', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs" style={{ color: '#8892a4' }}>Paste into your client portal or website</p>
        <button
          onClick={copy}
          className="text-xs px-2 py-0.5 rounded"
          style={{ background: 'rgba(255,255,255,0.06)', color: copied ? '#10b981' : '#8892a4', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          {copied ? 'Copied ✓' : 'Copy'}
        </button>
      </div>
      <pre
        className="text-xs overflow-x-auto whitespace-pre-wrap break-all"
        style={{ fontFamily: 'DM Mono, monospace', color: '#f59e0b', lineHeight: 1.6 }}
      >
        {snippet}
      </pre>
    </div>
  )
}
