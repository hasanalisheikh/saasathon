const PLACEHOLDER_PATTERNS = [
  "your-",
  "placeholder",
  "changeme",
  "change-me",
  "replace-me",
  "replace_with",
  "todo",
  "example",
] as const

function isConfiguredSecret(value: string | null | undefined) {
  const normalized = value?.trim().toLowerCase() ?? ""
  if (!normalized) return false

  return !PLACEHOLDER_PATTERNS.some((pattern) => normalized.includes(pattern))
}

export function isGitHubOAuthConfigured() {
  return isConfiguredSecret(process.env.GITHUB_CLIENT_ID) && isConfiguredSecret(process.env.GITHUB_CLIENT_SECRET)
}

export function getGitHubConnectCtaHref(returnTo = "/settings") {
  return isGitHubOAuthConfigured() ? `/api/github/connect?returnTo=${encodeURIComponent(returnTo)}` : "/settings#github-pat"
}
