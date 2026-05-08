export interface PostmarkInboundPayload {
  From: string
  FromFull: { Email: string; Name: string }
  Subject: string
  TextBody: string
  HtmlBody: string
  StrippedTextReply: string
  ToFull: { Email: string; Name: string }[]
  CcFull: { Email: string; Name: string }[]
  ReplyTo: string
  MessageID: string
  Date: string
}

export function extractInboundEmail(payload: PostmarkInboundPayload): {
  from: string
  subject: string
  body: string
  toAddress: string
} {
  const toAddress = payload.ToFull?.[0]?.Email ?? ''
  const body = payload.TextBody || stripHtml(payload.HtmlBody) || ''

  return {
    from: payload.From,
    subject: payload.Subject,
    body: body.trim(),
    toAddress,
  }
}

function stripHtml(html: string): string {
  if (!html) return ''
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}
