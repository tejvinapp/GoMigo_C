// Admin error notification — sends email + writes to error_logs table
import { createAdminClient } from '@/lib/supabase/admin'
import type { AppError } from './AppError'

interface ErrorContext {
  userId?: string
  userRole?: string
  route?: string
  httpMethod?: string
  httpStatus?: number
  userAgent?: string
}

/**
 * Log an error to the database and notify the admin by email.
 * Called from API route error handlers and Edge Functions.
 */
export async function notifyError(
  error: AppError | Error,
  context: ErrorContext = {}
): Promise<void> {
  const supabase = createAdminClient()

  const isAppError = 'code' in error && 'severity' in error
  const code = isAppError ? (error as AppError).code : 'ERR_UNKNOWN'
  const severity = isAppError ? (error as AppError).severity : 'medium'
  const adminMessage = isAppError ? (error as AppError).adminMessage : error.message
  const autoFixable = isAppError ? (error as AppError).autoFixable : false

  // 1. Write to error_logs table
  let logId: string | undefined
  try {
    const { data } = await supabase
      .from('error_logs')
      .insert({
        error_code: code,
        error_title: error.message.slice(0, 200),
        error_message: adminMessage,
        stack_trace: error.stack,
        user_id: context.userId,
        user_role: context.userRole,
        route: context.route,
        http_method: context.httpMethod,
        http_status: context.httpStatus,
        user_agent: context.userAgent,
        severity,
        auto_fix_attempted: false,
      })
      .select('id')
      .single()
    logId = data?.id
  } catch (dbErr) {
    console.error('Failed to write error log to DB:', dbErr)
  }

  // 2. Email admin for high/critical errors
  if (severity === 'high' || severity === 'critical') {
    try {
      const { sendAdminAlert } = await import('@/lib/email/index')
      const subject = `[${severity.toUpperCase()}] ${code} — GoMiGo Production`
      const html = buildAdminEmailHTML({ code, adminMessage, context, severity, autoFixable, logId, stack: error.stack })
      await sendAdminAlert(subject, html)

      if (logId) {
        await supabase
          .from('error_logs')
          .update({ admin_notified_at: new Date().toISOString() })
          .eq('id', logId)
      }
    } catch (emailErr) {
      console.error('Failed to send admin error email:', emailErr)
    }
  }
}

function buildAdminEmailHTML(params: {
  code: string
  adminMessage: string
  context: ErrorContext
  severity: string
  autoFixable: boolean
  logId?: string
  stack?: string
}): string {
  const { code, adminMessage, context, severity, autoFixable, logId, stack } = params
  const severityColor = severity === 'critical' ? '#dc2626' : '#ea580c'

  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: monospace; color: #1f2937; max-width: 700px; margin: 0 auto; padding: 20px;">
  <div style="background: ${severityColor}; color: white; padding: 16px 20px; border-radius: 8px; margin-bottom: 20px;">
    <div style="font-size: 18px; font-weight: bold;">[${severity.toUpperCase()}] ${code}</div>
    <div style="opacity: 0.9; margin-top: 4px;">GoMiGo Production Error — ${new Date().toISOString()}</div>
  </div>

  <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
    <tr><td style="padding: 8px; background: #f9fafb; font-weight: bold; width: 180px;">What happened</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${adminMessage}</td></tr>
    ${context.userId ? `<tr><td style="padding: 8px; background: #f9fafb; font-weight: bold;">User ID</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${context.userId}</td></tr>` : ''}
    ${context.route ? `<tr><td style="padding: 8px; background: #f9fafb; font-weight: bold;">Route</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${context.httpMethod} ${context.route}</td></tr>` : ''}
    <tr><td style="padding: 8px; background: #f9fafb; font-weight: bold;">Auto-fixable</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${autoFixable ? '✅ Yes — auto-fix attempted' : '❌ No — manual action needed'}</td></tr>
    ${logId ? `<tr><td style="padding: 8px; background: #f9fafb; font-weight: bold;">Log ID</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${logId}</td></tr>` : ''}
  </table>

  ${stack ? `
  <div style="background: #1f2937; color: #d1fae5; padding: 16px; border-radius: 8px; font-size: 12px; overflow-x: auto; margin-bottom: 20px;">
    <div style="color: #6b7280; margin-bottom: 8px;">Stack Trace:</div>
    <pre style="margin: 0; white-space: pre-wrap;">${stack.slice(0, 2000)}</pre>
  </div>` : ''}

  <p style="color: #6b7280; font-size: 12px;">This is an automated alert from GoMiGo. Check the admin dashboard for full details.</p>
</body>
</html>`
}
