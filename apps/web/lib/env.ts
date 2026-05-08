// Validates required environment variables at startup.
// Import this in layout.tsx to catch missing vars early with clear error messages.

const required = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
} as const

const missing = Object.entries(required)
  .filter(([, value]) => !value)
  .map(([key]) => key)

if (missing.length > 0) {
  throw new Error(
    `Missing required environment variables:\n${missing.map((k) => `  • ${k}`).join("\n")}\n\nCopy apps/web/.env.local.example → apps/web/.env.local and fill in the values.`,
  )
}

export const env = {
  supabaseUrl: required.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseAnonKey: required.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  siteUrl: required.NEXT_PUBLIC_SITE_URL!,
  apiUrl: required.NEXT_PUBLIC_API_URL!,
}
