import type { Metadata } from 'next'
import '@workspace/ui/globals.css'

import { ThemeProvider } from "@workspace/ui/components/theme-provider"
import { Toaster } from "@workspace/ui/components/sonner"

export const metadata: Metadata = {
  title: 'Monad - Scope Creep Control',
  description: 'Turn client requests into priced, approved, GitHub-backed change requests.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
