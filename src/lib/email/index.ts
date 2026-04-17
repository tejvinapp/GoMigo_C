/**
 * Email sending utility for GoMiGo.
 * Uses the Resend API or falls back to a no-op in development.
 */

interface EmailPayload {
  to: string | string[]
  subject: string
  html: string
  from?: string
}

export async function sendEmail(payload: EmailPayload): Promise<{ success: boolean }> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[email] No RESEND_API_KEY — skipping send:', payload.subject)
    }
    return { success: false }
  }

  const from = payload.from ?? 'GoMiGo <noreply@gomigo.in>'
  const to = Array.isArray(payload.to) ? payload.to : [payload.to]

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to, subject: payload.subject, html: payload.html }),
  })

  return { success: res.ok }
}

export async function sendAdminAlert(subject: string, body: string): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL
  if (!adminEmail) return
  await sendEmail({ to: adminEmail, subject: `[GoMiGo Alert] ${subject}`, html: `<pre>${body}</pre>` })
}
