import { Octokit } from '@octokit/rest'

export function createOctokit(accessToken: string): Octokit {
  return new Octokit({ auth: accessToken })
}

export async function createIssue(params: {
  accessToken: string
  owner: string
  repo: string
  title: string
  body: string
}): Promise<{ number: number; url: string }> {
  const octokit = createOctokit(params.accessToken)
  const [owner, repo] = params.owner.includes('/')
    ? params.owner.split('/')
    : [params.owner, params.repo]

  const response = await octokit.issues.create({
    owner: owner!,
    repo: repo!,
    title: `[Monad] ${params.title}`,
    body: params.body,
    labels: ['monad-approved'],
  })

  return {
    number: response.data.number,
    url: response.data.html_url,
  }
}

export async function registerWebhook(params: {
  accessToken: string
  repoFullName: string
  webhookUrl: string
  secret: string
}) {
  const octokit = createOctokit(params.accessToken)
  const [owner, repo] = params.repoFullName.split('/')

  await octokit.repos.createWebhook({
    owner: owner!,
    repo: repo!,
    config: {
      url: params.webhookUrl,
      content_type: 'json',
      secret: params.secret,
    },
    events: ['pull_request', 'issues', 'push'],
  })
}

export async function listUserRepos(accessToken: string) {
  const octokit = createOctokit(accessToken)
  const response = await octokit.repos.listForAuthenticatedUser({
    sort: 'updated',
    per_page: 50,
  })
  return response.data.map((r) => ({
    id: String(r.id),
    name: r.full_name,
    private: r.private,
  }))
}

export function buildIssueBody(params: {
  clientRequest: string
  technicalBreakdown: string
  approvedCost: string
  approvalTimestamp: string
  monadRequestUrl: string
}) {
  return `## Client Request
${params.clientRequest}

## Technical Breakdown
${params.technicalBreakdown}

## Approved Cost
${params.approvedCost}

## Approval
Approved by client on ${params.approvalTimestamp}

---
[View in Monad](${params.monadRequestUrl})
`
}
