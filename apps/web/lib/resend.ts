import { Resend } from 'resend'
import { requireConfiguredEnv } from '@/lib/env'

function getResend() {
  return new Resend(requireConfiguredEnv('RESEND_API_KEY', 'Resend is not configured. Add RESEND_API_KEY to send email.'))
}

const FROM = () => requireConfiguredEnv('RESEND_FROM_EMAIL', 'Resend is not configured. Add RESEND_FROM_EMAIL to send email.')

const emailStyles = `
    body { background: #f8fafc; color: #171717; font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; margin: 0; padding: 40px 20px; }
    .container { max-width: 560px; margin: 0 auto; }
    .logo { color: #171717; font-size: 18px; font-weight: 700; letter-spacing: 0; }
    .card { background: #ffffff; border: 1px solid #e5e5e5; border-radius: 8px; padding: 24px; margin: 24px 0; }
    .label { color: #737373; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 4px; }
    .value { color: #171717; font-size: 14px; line-height: 1.6; }
    .cost { color: #171717; font-size: 28px; font-weight: 650; margin: 16px 0 4px; }
    .cost-label { color: #737373; font-size: 12px; }
    .out-of-scope { color: #dc2626; font-size: 12px; margin-top: 8px; }
    .button { display: block; background: #171717; color: #ffffff; text-decoration: none; text-align: center; padding: 14px 32px; border-radius: 6px; font-size: 15px; font-weight: 700; margin: 32px 0 16px; }
    .decline { color: #737373; font-size: 12px; text-align: center; }
    .decline a { color: #525252; }
    .footer { color: #737373; font-size: 11px; margin-top: 40px; }
    .divider { border-top: 1px solid #eeeeee; margin: 20px 0; padding-top: 20px; }
`

function buildApprovalEmailHtml(params: {
  clientName: string
  developerReply: string
  requestSummary: string
  technicalBreakdown: string
  costRange: string
  timelineDays: number
  approvalUrl: string
  declineUrl: string
  projectName: string
  requestId: string
}) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
${emailStyles}
  </style>
</head>
<body>
  <div class="container">
    <div style="margin-bottom: 32px;"><div class="logo">monad</div></div>
    <p>Hi ${params.clientName},</p>
    <p>${params.developerReply}</p>
    <div class="card">
      <div class="label">Your Request</div>
      <div class="value">${params.requestSummary}</div>
      <div class="divider">
        <div class="label">What This Involves</div>
        <div class="value">${params.technicalBreakdown}</div>
      </div>
      <div class="divider">
        <div class="cost">${params.costRange}</div>
        <div class="cost-label">estimated additional cost · +${params.timelineDays} days</div>
        <div class="out-of-scope">⚠ This work is outside the original project scope</div>
      </div>
    </div>
    <a href="${params.approvalUrl}" class="button">Approve this work →</a>
    <div class="decline"><a href="${params.declineUrl}">Decline this request</a></div>
    <div class="footer">
      This approval request was sent via Monad · monad.app<br>
      Project: ${params.projectName} · Reference: ${params.requestId}
    </div>
  </div>
</body>
</html>`
}

export async function sendApprovalEmail(params: {
  to: string
  subject: string
  clientName: string
  developerReply: string
  requestSummary: string
  technicalBreakdown: string
  costRange: string
  timelineDays: number
  approvalUrl: string
  declineUrl: string
  projectName: string
  requestId: string
}) {
  return getResend().emails.send({
    from: FROM(),
    to: params.to,
    subject: params.subject,
    html: buildApprovalEmailHtml(params),
  })
}

export async function sendDeveloperNotification(params: {
  to: string
  subject: string
  html: string
}) {
  return getResend().emails.send({
    from: FROM(),
    to: params.to,
    subject: params.subject,
    html: params.html,
  })
}

function buildDeveloperApprovalHtml(params: {
  clientName: string
  requestSummary: string
  costRange: string
  approvedAt: string
  projectName: string
  requestUrl: string
  githubIssueUrl?: string
}) {
  const githubRow = params.githubIssueUrl
    ? `<div class="divider">
        <div class="label">GitHub Issue</div>
        <div class="value"><a href="${params.githubIssueUrl}" style="color:#171717;">${params.githubIssueUrl}</a></div>
       </div>`
    : ''

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
${emailStyles}
    .badge { display: inline-block; background: #f5f5f5; color: #171717; border: 1px solid #e5e5e5; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; padding: 3px 10px; border-radius: 4px; text-transform: uppercase; }
    .headline { font-size: 22px; font-weight: 600; margin: 16px 0 4px; }
  </style>
</head>
<body>
  <div class="container">
    <div style="margin-bottom: 24px;"><div class="logo">monad</div></div>
    <div class="badge">approved</div>
    <div class="headline">${params.clientName} approved your estimate</div>
    <p style="color:#737373;font-size:14px;">The client signed off. This work is now billable.</p>
    <div class="card">
      <div class="label">Project</div>
      <div class="value">${params.projectName}</div>
      <div class="divider">
        <div class="label">Request</div>
        <div class="value">${params.requestSummary}</div>
      </div>
      <div class="divider">
        <div class="cost">${params.costRange}</div>
        <div class="cost-label">approved additional cost · approved ${new Date(params.approvedAt).toUTCString()}</div>
      </div>
      ${githubRow}
    </div>
    <a href="${params.requestUrl}" class="button">View proof pack →</a>
    <div class="footer">Sent by Monad · monad.app</div>
  </div>
</body>
</html>`
}

export async function sendDeveloperApprovalEmail(params: {
  to: string
  clientName: string
  requestSummary: string
  costRange: string
  approvedAt: string
  projectName: string
  requestUrl: string
  githubIssueUrl?: string
}) {
  return getResend().emails.send({
    from: FROM(),
    to: params.to,
    subject: `✓ ${params.clientName} approved — ${params.costRange} · ${params.projectName}`,
    html: buildDeveloperApprovalHtml(params),
  })
}

function buildDeveloperDeclineHtml(params: {
  clientName: string
  requestSummary: string
  declinedAt: string
  projectName: string
  requestUrl: string
}) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
${emailStyles}
    .badge { display: inline-block; background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; padding: 3px 10px; border-radius: 4px; text-transform: uppercase; }
    .headline { font-size: 22px; font-weight: 600; margin: 16px 0 4px; }
  </style>
</head>
<body>
  <div class="container">
    <div style="margin-bottom: 24px;"><div class="logo">monad</div></div>
    <div class="badge">declined</div>
    <div class="headline">${params.clientName} declined the request</div>
    <p style="color:#737373;font-size:14px;">The client chose not to proceed with this modification.</p>
    <div class="card">
      <div class="label">Project</div>
      <div class="value">${params.projectName}</div>
      <div class="divider">
        <div class="label">Request</div>
        <div class="value">${params.requestSummary}</div>
      </div>
      <div class="divider">
        <div class="label">Declined at</div>
        <div class="value">${new Date(params.declinedAt).toUTCString()}</div>
      </div>
    </div>
    <a href="${params.requestUrl}" class="button">View request →</a>
    <div class="footer">Sent by Monad · monad.app</div>
  </div>
</body>
</html>`
}

export async function sendDeveloperDeclineEmail(params: {
  to: string
  clientName: string
  requestSummary: string
  declinedAt: string
  projectName: string
  requestUrl: string
}) {
  return getResend().emails.send({
    from: FROM(),
    to: params.to,
    subject: `Declined: ${params.clientName} · ${params.projectName}`,
    html: buildDeveloperDeclineHtml(params),
  })
}

function buildClientTaskCompletionHtml(params: {
  clientName: string
  projectName: string
  requestSummary: string
  tasks: { name: string; description: string | null }[]
}) {
  const taskList = params.tasks
    .map((task) => `<li><strong>${task.name}</strong>${task.description ? ` — ${task.description}` : ''}</li>`)
    .join('')

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
${emailStyles}
    li { margin: 10px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div style="margin-bottom: 24px;"><div class="logo">monad</div></div>
    <p>Hi ${params.clientName},</p>
    <p>A quick update: work has been completed on ${params.projectName}.</p>
    <div class="card">
      <div class="label">Original request</div>
      <div class="value">${params.requestSummary}</div>
      <div style="border-top:1px solid #eeeeee; margin:20px 0; padding-top:20px;">
        <div class="label">Completed</div>
        <ul class="value">${taskList}</ul>
      </div>
    </div>
    <p style="color:#737373;font-size:14px;">Your developer will follow up if there are deployment notes or next steps.</p>
    <div class="footer">Sent by Monad · monad.app</div>
  </div>
</body>
</html>`
}

export async function sendClientTaskCompletionEmail(params: {
  to: string
  clientName: string
  projectName: string
  requestSummary: string
  tasks: { name: string; description: string | null }[]
}) {
  return getResend().emails.send({
    from: FROM(),
    to: params.to,
    subject: `Completed update — ${params.projectName}`,
    html: buildClientTaskCompletionHtml(params),
  })
}
