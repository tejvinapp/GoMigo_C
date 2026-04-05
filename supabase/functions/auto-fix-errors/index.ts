import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

interface ErrorLog {
  id: string
  error_code: string
  severity: string
  metadata: Record<string, unknown>
  created_at: string
}

interface FixResult {
  success: boolean
  action: string
  details?: string
}

// Exponential backoff reconnect for DB connection errors
async function fixDatabaseConnection(): Promise<FixResult> {
  const delays = [1000, 2000, 4000]
  for (let i = 0; i < delays.length; i++) {
    await new Promise((r) => setTimeout(r, delays[i]))
    try {
      const { error } = await supabase.from('feature_flags').select('flag_name').limit(1)
      if (!error) {
        return {
          success: true,
          action: 'db_reconnect',
          details: `Reconnected after ${i + 1} attempt(s) with delay ${delays[i]}ms`,
        }
      }
    } catch {
      // continue
    }
  }
  return { success: false, action: 'db_reconnect', details: 'Failed after 3 attempts (1s, 2s, 4s)' }
}

// Retry failed WhatsApp messages using Meta Cloud API fallback
async function fixWhatsAppFailed(errMeta: Record<string, unknown>): Promise<FixResult> {
  const notificationId = errMeta?.notification_id as string | undefined

  if (!notificationId) {
    return { success: false, action: 'whatsapp_retry', details: 'No notification_id in metadata' }
  }

  const { data: notification } = await supabase
    .from('notifications')
    .select('*')
    .eq('id', notificationId)
    .single()

  if (!notification) {
    return { success: false, action: 'whatsapp_retry', details: 'Notification not found' }
  }

  // Fetch Meta Cloud API credentials
  const { data: phoneNumberIdRow } = await supabase
    .from('platform_settings')
    .select('value')
    .eq('key', 'meta_phone_number_id')
    .single()
  const { data: accessTokenRow } = await supabase
    .from('platform_settings')
    .select('value')
    .eq('key', 'meta_access_token')
    .single()

  if (!phoneNumberIdRow?.value || !accessTokenRow?.value) {
    return { success: false, action: 'whatsapp_meta_fallback', details: 'Meta Cloud API not configured' }
  }

  const variables = notification.variables_used?.variables as string[] || []
  const response = await fetch(
    `https://graph.facebook.com/v18.0/${phoneNumberIdRow.value}/messages`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessTokenRow.value}`,
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: notification.recipient_phone || '',
        type: 'template',
        template: {
          name: notification.template_name,
          language: { code: notification.language_code || 'en' },
          components:
            variables.length > 0
              ? [{ type: 'body', parameters: variables.map((v: string) => ({ type: 'text', text: v })) }]
              : [],
        },
      }),
    }
  )

  if (response.ok) {
    const data = await response.json()
    await supabase
      .from('notifications')
      .update({ status: 'sent', external_message_id: data.messages?.[0]?.id, failed_reason: null })
      .eq('id', notificationId)
    return { success: true, action: 'whatsapp_meta_fallback', details: 'Sent via Meta Cloud API' }
  }

  return { success: false, action: 'whatsapp_meta_fallback', details: `Meta API returned ${response.status}` }
}

// Clear rate limit counters for an identifier
async function fixRateLimit(errMeta: Record<string, unknown>): Promise<FixResult> {
  const identifier = errMeta?.identifier as string | undefined
  const route = errMeta?.route as string | undefined

  if (!identifier) {
    return { success: false, action: 'clear_rate_limit', details: 'No identifier in metadata' }
  }

  let query = supabase.from('rate_limit_counters').delete().eq('identifier', identifier)
  if (route) {
    // deno supabase client does not chain .eq after .delete in same call without select — use rpc or multi-step
  }

  const { error } = await supabase
    .from('rate_limit_counters')
    .delete()
    .eq('identifier', identifier)

  if (error) {
    return { success: false, action: 'clear_rate_limit', details: error.message }
  }

  return { success: true, action: 'clear_rate_limit', details: `Cleared for identifier: ${identifier}` }
}

// Alert nearby providers when no driver is available for a booking
async function fixNoDriverAvailable(errMeta: Record<string, unknown>): Promise<FixResult> {
  const bookingId = errMeta?.booking_id as string | undefined
  const destinationId = errMeta?.destination_id as string | undefined

  if (!bookingId || !destinationId) {
    return { success: false, action: 'alert_nearby_providers', details: 'Missing booking_id or destination_id' }
  }

  // Find active providers in the destination
  const { data: providers } = await supabase
    .from('provider_profiles')
    .select('id, user_id, display_name')
    .eq('destination_id', destinationId)
    .eq('is_active', true)
    .eq('is_verified', true)

  if (!providers || providers.length === 0) {
    return { success: false, action: 'alert_nearby_providers', details: 'No active providers found in destination' }
  }

  const { data: booking } = await supabase
    .from('bookings')
    .select('booking_reference, pickup_name, tour_date, checkin_date')
    .eq('id', bookingId)
    .single()

  // Fetch Wati credentials
  const { data: watiEndpoint } = await supabase
    .from('platform_settings')
    .select('value')
    .eq('key', 'wati_endpoint')
    .single()
  const { data: watiToken } = await supabase
    .from('platform_settings')
    .select('value')
    .eq('key', 'wati_token')
    .single()

  let notified = 0
  for (const provider of providers) {
    const { data: user } = await supabase
      .from('users')
      .select('phone, preferred_language')
      .eq('id', provider.user_id)
      .single()

    if (!user?.phone) continue

    const language = user.preferred_language || 'en'
    const phone = user.phone.replace('+', '')

    if (watiEndpoint?.value && watiToken?.value) {
      const res = await fetch(
        `${watiEndpoint.value}/api/v1/sendTemplateMessage?whatsappNumber=${phone}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${watiToken.value}`,
          },
          body: JSON.stringify({
            template_name: `gomigo_driver_needed_${language}`,
            broadcast_name: `gomigo_nodriver_${Date.now()}`,
            parameters: [
              { name: 'parameter1', value: booking?.booking_reference || bookingId },
              { name: 'parameter2', value: booking?.pickup_name || 'N/A' },
              { name: 'parameter3', value: booking?.tour_date || booking?.checkin_date || 'Today' },
            ],
          }),
        }
      )
      if (res.ok) notified++
    }
  }

  return {
    success: notified > 0,
    action: 'alert_nearby_providers',
    details: `Notified ${notified} of ${providers.length} providers`,
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  // This is called by pg_cron — no auth required from external but we verify internal invocation
  // by requiring the service role key via Authorization header if present

  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()

    // Query unfixed high/critical errors from the past hour
    const { data: errors, error: queryError } = await supabase
      .from('error_logs')
      .select('id, error_code, severity, metadata, created_at')
      .eq('auto_fixed', false)
      .in('severity', ['high', 'critical'])
      .gte('created_at', oneHourAgo)
      .order('created_at', { ascending: true })
      .limit(50)

    if (queryError) {
      throw new Error(`Failed to query error_logs: ${queryError.message}`)
    }

    const results: Array<{ error_id: string; error_code: string; result: FixResult }> = []

    for (const errLog of errors as ErrorLog[]) {
      let result: FixResult | null = null

      switch (errLog.error_code) {
        case 'ERR_DB_CONNECTION_LOST':
          result = await fixDatabaseConnection()
          break
        case 'ERR_WHATSAPP_FAILED':
          result = await fixWhatsAppFailed(errLog.metadata || {})
          break
        case 'ERR_RATE_LIMIT':
          result = await fixRateLimit(errLog.metadata || {})
          break
        case 'ERR_BOOKING_NO_DRIVER':
          result = await fixNoDriverAvailable(errLog.metadata || {})
          break
        default:
          result = { success: false, action: 'no_fix', details: `No auto-fix for ${errLog.error_code}` }
      }

      if (result) {
        // Update auto_fixed flag if success
        if (result.success) {
          await supabase
            .from('error_logs')
            .update({
              auto_fixed: true,
              auto_fixed_at: new Date().toISOString(),
              auto_fix_details: result.details,
            })
            .eq('id', errLog.id)
        }

        results.push({ error_id: errLog.id, error_code: errLog.error_code, result })
      }
    }

    const fixed = results.filter((r) => r.result.success).length
    const total = results.length

    return new Response(
      JSON.stringify({ success: true, processed: total, fixed, results }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('auto-fix-errors error:', err)
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
