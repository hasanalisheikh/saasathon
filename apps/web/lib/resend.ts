import { Resend } from 'resend'

function getResend() {
  return new Resend(process.env.RESEND_API_KEY)
}

const FROM = () => process.env.RESEND_FROM_EMAIL ?? 'noreply@monad.app'

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
    body { background: #080c14; color: #f0f4ff; font-family: 'Courier New', monospace; margin: 0; padding: 40px 20px; }
    .container { max-width: 560px; margin: 0 auto; }
    .logo { color: #f59e0b; font-size: 18px; font-weight: 500; letter-spacing: 0.1em; }
    .card { background: #0f1624; border: 1px solid rgba(255,255,255,0.10); border-radius: 8px; padding: 24px; margin: 24px 0; }
    .label { color: #8892a4; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 4px; }
    .value { color: #f0f4ff; font-size: 14px; }
    .cost { color: #f59e0b; font-size: 28px; font-weight: 600; margin: 16px 0 4px; }
    .cost-label { color: #8892a4; font-size: 12px; }
    .out-of-scope { color: #ef4444; font-size: 12px; margin-top: 8px; }
    .button { display: block; background: #10b981; color: #fff; text-decoration: none; text-align: center; padding: 16px 32px; border-radius: 6px; font-size: 16px; font-weight: 600; margin: 32px 0 16px; }
    .decline { color: #8892a4; font-size: 12px; text-align: center; }
    .decline a { color: #8892a4; }
    .footer { color: #4a5568; font-size: 11px; margin-top: 40px; }
    .divider { border-top: 1px solid rgba(255,255,255,0.06); margin: 20px 0; padding-top: 20px; }
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
