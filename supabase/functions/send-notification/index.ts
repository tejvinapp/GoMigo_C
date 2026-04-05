import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NotificationPayload {
  user_id: string
  type: string
  channel: 'whatsapp' | 'email' | 'sms'
  language: string
  variables: Record<string, string>
  recipient_phone?: string
  recipient_email?: string
}

// Replace {{variable}} placeholders
function interpolate(template: string, variables: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] ?? `{{${key}}}`)
}

async function sendWhatsApp(
  phone: string,
  templateName: string,
  variables: Record<string, string>,
  watiApiUrl: string,
  watiApiToken: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Wati.io uses template messages with named parameters
    const body = {
      template_name: templateName,
      broadcast_name: `gomigo_${templateName}_${Date.now()}`,
      receivers: [
        {
          whatsappNumber: phone.replace(/\D/g, ''),
          customParams: Object.entries(variables).map(([name, default_value]) => ({
            name,
            default_value,
          })),
        },
      ],
    }

    const res = await fetch(`${watiApiUrl}/api/v1/sendTemplateMessages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${watiApiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const errText = await res.text()
      return { success: false, error: `Wati error ${res.status}: ${errText}` }
    }

    return { success: true }
  } catch (err) {
    return { success: false, error: String(err) }
  }
}

async function sendEmail(
  to: string,
  subject: string,
  htmlBody: string,
  smtpConfig: {
    host: string
    port: number
    user: string
    password: string
    from: string
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    // Using Deno SMTP-compatible approach via fetch to a mail relay or SMTP API
    // For full Deno SMTP, use deno-smtp or a transactional API like SendGrid/Mailgun
    // Here we use a generic SMTP REST endpoint if configured, else log a warning
    const smtpApiUrl = Deno.env.get('SMTP_API_URL')
    if (smtpApiUrl) {
      const res = await fetch(smtpApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to,
          subject,
          html: htmlBody,
          from: smtpConfig.from,
          auth: { user: smtpConfig.user, pass: smtpConfig.password },
        }),
      })
      if (!res.ok) {
        const errText = await res.text()
        return { success: false, error: `SMTP API error ${res.status}: ${errText}` }
      }
      return { success: true }
    }
    console.warn('No SMTP_API_URL configured; email not sent to', to)
    return { success: false, error: 'SMTP not configured' }
  } catch (err) {
    return { success: false, error: String(err) }
  }
}

async function sendSMS(
  phone: string,
  message: string,
  msg91AuthKey: string,
  msg91SenderId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch('https://api.msg91.com/api/v5/flow/', {
      method: 'POST',
      headers: {
        authkey: msg91AuthKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        template_id: 'gomigo_sms',
        sender: msg91SenderId,
        mobiles: phone.replace(/\D/g, ''),
        VAR1: message,
      }),
    })

    if (!res.ok) {
      const errText = await res.text()
      return { success: false, error: `MSG91 error ${res.status}: ${errText}` }
    }
    return { success: true }
  } catch (err) {
    return { success: false, error: String(err) }
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const payload: NotificationPayload = await req.json()
    const { user_id, type, channel, language, variables, recipient_phone, recipient_email } = payload

    if (!user_id || !type || !channel) {
      return new Response(
        JSON.stringify({ error: 'user_id, type, and channel are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Fetch template
    const { data: template, error: templateError } = await supabase
      .from('notification_templates')
      .select('*')
      .eq('type', type)
      .eq('channel', channel)
      .eq('language', language)
      .maybeSingle()

    // Fallback to English if language-specific template not found
    let resolvedTemplate = template
    if (!resolvedTemplate && language !== 'en') {
      const { data: fallback } = await supabase
        .from('notification_templates')
        .select('*')
        .eq('type', type)
        .eq('channel', channel)
        .eq('language', 'en')
        .maybeSingle()
      resolvedTemplate = fallback
    }

    if (templateError) console.error('Template fetch error:', templateError)

    // Fetch platform settings for credentials
    const { data: settings } = await supabase
      .from('platform_settings')
      .select('key, value')
      .in('key', [
        'wati_api_url',
        'wati_api_token',
        'smtp_host',
        'smtp_port',
        'smtp_user',
        'smtp_password',
        'smtp_from',
        'msg91_auth_key',
        'msg91_sender_id',
      ])

    const settingsMap: Record<string, string> = {}
    for (const s of settings ?? []) {
      settingsMap[s.key] = s.value
    }

    // Determine recipient info from user if not provided
    let phone = recipient_phone
    let email = recipient_email

    if (!phone || !email) {
      const { data: user } = await supabase
        .from('users')
        .select('whatsapp_number, email')
        .eq('id', user_id)
        .single()
      if (user) {
        phone = phone ?? user.whatsapp_number
        email = email ?? user.email
      }
    }

    let dispatchResult: { success: boolean; error?: string } = { success: false, error: 'No dispatch attempted' }
    let renderedBody = ''

    if (resolvedTemplate) {
      renderedBody = interpolate(resolvedTemplate.body ?? '', variables)
      const subject = interpolate(resolvedTemplate.subject ?? type, variables)

      if (channel === 'whatsapp' && phone) {
        const watiUrl = settingsMap['wati_api_url'] ?? Deno.env.get('WATI_API_URL') ?? ''
        const watiToken = settingsMap['wati_api_token'] ?? Deno.env.get('WATI_API_TOKEN') ?? ''
        // Use the template_name from the template row if available, else fall back to type
        const watiTemplateName = resolvedTemplate.wati_template_name ?? type
        dispatchResult = await sendWhatsApp(phone, watiTemplateName, variables, watiUrl, watiToken)
      } else if (channel === 'email' && email) {
        dispatchResult = await sendEmail(email, subject, renderedBody, {
          host: settingsMap['smtp_host'] ?? '',
          port: parseInt(settingsMap['smtp_port'] ?? '587'),
          user: settingsMap['smtp_user'] ?? '',
          password: settingsMap['smtp_password'] ?? '',
          from: settingsMap['smtp_from'] ?? 'noreply@gomigo.in',
        })
      } else if (channel === 'sms' && phone) {
        const msg91Key = settingsMap['msg91_auth_key'] ?? Deno.env.get('MSG91_AUTH_KEY') ?? ''
        const msg91Sender = settingsMap['msg91_sender_id'] ?? 'GOMIGO'
        dispatchResult = await sendSMS(phone, renderedBody, msg91Key, msg91Sender)
      } else {
        dispatchResult = { success: false, error: `No recipient for channel ${channel}` }
      }
    } else {
      dispatchResult = { success: false, error: `No template found for type=${type} channel=${channel} language=${language}` }
    }

    // Log to notifications table
    const { error: logError } = await supabase.from('notifications').insert({
      user_id,
      type,
      channel,
      status: dispatchResult.success ? 'sent' : 'failed',
      error_message: dispatchResult.error ?? null,
      body: renderedBody,
      data: variables,
    })

    if (logError) console.error('Error logging notification:', logError)

    if (!dispatchResult.success) {
      // Log to error_logs for auto-fix-errors to pick up
      await supabase.from('error_logs').insert({
        error_code: 'ERR_WHATSAPP_FAILED',
        message: dispatchResult.error,
        context: { user_id, type, channel },
        severity: 'high',
        auto_fixed: false,
      })
    }

    return new Response(
      JSON.stringify({
        success: dispatchResult.success,
        error: dispatchResult.error ?? null,
      }),
      {
        status: dispatchResult.success ? 200 : 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (err) {
    console.error('Unhandled error in send-notification:', err)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
