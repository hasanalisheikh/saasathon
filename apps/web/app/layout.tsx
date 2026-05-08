import type { Metadata } from 'next'
import '@workspace/ui/globals.css'

export const metadata: Metadata = {
  title: 'Monad — Scope Protection for Developers',
  description: 'Clients email you like normal. We handle the rest.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
