import type { Metadata } from 'next'
import '@workspace/ui/globals.css'

export const metadata: Metadata = {
  title: 'Monad - Scope Creep Control',
  description: 'Turn client emails into priced, approved, GitHub-backed change requests.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
