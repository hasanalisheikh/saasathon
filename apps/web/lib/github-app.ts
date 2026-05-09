import { Octokit } from '@octokit/rest'
import jwt from 'jsonwebtoken'

const GITHUB_APP_ID = process.env.GITHUB_APP_ID
const GITHUB_PRIVATE_KEY = process.env.GITHUB_PRIVATE_KEY

export function generateAppJwt() {
  if (!GITHUB_APP_ID || !GITHUB_PRIVATE_KEY) {
    throw new Error('GITHUB_APP_ID or GITHUB_PRIVATE_KEY is not configured')
  }

  const now = Math.floor(Date.now() / 1000)
  const payload = {
    iat: now - 60, // Issued at time, 60 seconds in the past to allow for clock drift
    exp: now + 600, // JWT expiration time (10 minute maximum)
    iss: GITHUB_APP_ID, // GitHub App's identifier
  }

  return jwt.sign(payload, GITHUB_PRIVATE_KEY, { algorithm: 'RS256' })
}

export async function getInstallationAccessToken(installationId: string) {
  const appJwt = generateAppJwt()
  
  const response = await fetch(
    `https://api.github.com/app/installations/${installationId}/access_tokens`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${appJwt}`,
        Accept: 'application/vnd.github+json',
        'User-Agent': 'Monad-App',
      },
    }
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Failed to get installation access token: ${JSON.stringify(error)}`)
  }

  const data = await response.json()
  return data.token as string
}

export async function getInstallationOctokit(installationId: string) {
  const token = await getInstallationAccessToken(installationId)
  return new Octokit({ auth: token })
}
