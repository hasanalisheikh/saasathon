export function buildSlackFallbackReply(params: {
  classification: string
  developerName: string
}) {
  const name = params.developerName.trim() || 'Your developer'

  switch (params.classification) {
    case 'out_of_scope':
      return `Thanks for sending this through. With a quick AI analysis, this request may be out of scope or beyond the original brief. ${name} will review it properly and respond as soon as possible.`
    case 'in_scope':
      return `Thanks for sending this through. With a quick AI analysis, this request looks like it may be in scope. ${name} will review it and respond as soon as possible.`
    default:
      return `Thanks for sending this through. With a quick AI analysis, this request may need a little clarification before it can be classified. ${name} will review it and respond as soon as possible.`
  }
}
