import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-razorpay-signature',
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

// HMAC-SHA256 verification using Deno's native crypto
async function verifySignature(
  body: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const encoder = new TextEncoder()
  const keyData = encoder.encode(secret)
  const messageData = encoder.encode(body)

  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const signatureBuffer = await crypto.subtle.sign('HMAC', key, messageData)
  const expectedHex = Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')

  // Constant-time comparison
  if (expectedHex.length !== signature.length) return false
  let mismatch = 0
  for (let i = 0; i < expectedHex.length; i++) {
    mismatch |= expectedHex.charCodeAt(i) ^ signature.charCodeAt(i)
  }
  return mismatch === 0
}

async function getWebhookSecret(): Promise<string | null> {
  const { data } = await supabase
    .from('platform_settings')
    .select('value')
    .eq('key', 'razorpay_webhook_secret')
    .single()
  return data?.value ?? null
}

async function sendNotification(params: {
  user_id: string
  type: string
  channel: string
  language: string
  variables: Record<string, string>
  recipient_phone?: string
}) {
  await supabase.functions.invoke('send-notification', { body: params })
}

async function logActivity(params: {
  action: string
  entity_type: string
  entity_id?: string
  new_value?: Record<string, unknown>
  metadata?: Record<string, unknown>
}) {
  await supabase.from('admin_activity_log').insert({
    action: params.action,
    entity_type: params.entity_type,
    entity_id: params.entity_id,
    new_value: params.new_value,
    metadata: params.metadata,
    created_at: new Date().toISOString(),
  })
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const rawBody = await req.text()
  const signature = req.headers.get('x-razorpay-signature') ?? ''

  // 1. Verify webhook signature
  const webhookSecret = await getWebhookSecret()
  if (!webhookSecret) {
    console.error('Razorpay webhook secret not configured')
    return new Response(JSON.stringify({ error: 'Webhook not configured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const isValid = await verifySignature(rawBody, signature, webhookSecret)
  if (!isValid) {
    console.error('Invalid Razorpay webhook signature')
    return new Response(JSON.stringify({ error: 'Invalid signature' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // 2. Parse event
  let event: Record<string, unknown>
  try {
    event = JSON.parse(rawBody)
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const eventType = event.event as string
  const payload = event.payload as Record<string, unknown>

  try {
    // 3. Handle event types
    if (eventType === 'payment.captured') {
      const paymentEntity = (payload.payment as Record<string, unknown>)?.entity as Record<string, unknown>
      const razorpayOrderId = paymentEntity?.order_id as string
      const razorpayPaymentId = paymentEntity?.id as string
      const amount = paymentEntity?.amount as number

      if (!razorpayOrderId) {
        return new Response(JSON.stringify({ error: 'Missing order_id' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      // Fetch booking by razorpay_order_id
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .select('id, tourist_id, provider_id, booking_reference, tourist_language, status')
        .eq('razorpay_order_id', razorpayOrderId)
        .single()

      if (bookingError || !booking) {
        console.error('Booking not found for order:', razorpayOrderId)
        return new Response(JSON.stringify({ error: 'Booking not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      // Update booking status to confirmed
      await supabase
        .from('bookings')
        .update({
          status: 'confirmed',
          payment_status: 'paid',
          razorpay_payment_id: razorpayPaymentId,
          paid_at: new Date().toISOString(),
        })
        .eq('id', booking.id)

      // Get tourist info for notification
      const { data: tourist } = await supabase
        .from('users')
        .select('phone, preferred_language')
        .eq('id', booking.tourist_id)
        .single()

      // Trigger send-notification for tourist
      await sendNotification({
        user_id: booking.tourist_id,
        type: 'booking_confirmed',
        channel: 'whatsapp',
        language: tourist?.preferred_language || booking.tourist_language || 'en',
        variables: {
          booking_reference: booking.booking_reference,
          amount: `₹${Math.round(amount / 100)}`,
        },
        recipient_phone: tourist?.phone,
      })

      await logActivity({
        action: 'payment_captured',
        entity_type: 'bookings',
        entity_id: booking.id,
        new_value: { status: 'confirmed', razorpay_payment_id: razorpayPaymentId },
        metadata: { event: eventType, amount },
      })
    } else if (eventType === 'payment.failed') {
      const paymentEntity = (payload.payment as Record<string, unknown>)?.entity as Record<string, unknown>
      const razorpayOrderId = paymentEntity?.order_id as string
      const errorDescription = (paymentEntity?.error_description as string) || 'Payment failed'

      if (!razorpayOrderId) {
        return new Response(JSON.stringify({ error: 'Missing order_id' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const { data: booking } = await supabase
        .from('bookings')
        .select('id, tourist_id, booking_reference, tourist_language')
        .eq('razorpay_order_id', razorpayOrderId)
        .single()

      if (booking) {
        await supabase
          .from('bookings')
          .update({ status: 'payment_failed', payment_status: 'failed' })
          .eq('id', booking.id)

        const { data: tourist } = await supabase
          .from('users')
          .select('phone, preferred_language')
          .eq('id', booking.tourist_id)
          .single()

        await sendNotification({
          user_id: booking.tourist_id,
          type: 'payment_failed',
          channel: 'whatsapp',
          language: tourist?.preferred_language || booking.tourist_language || 'en',
          variables: {
            booking_reference: booking.booking_reference,
            reason: errorDescription,
          },
          recipient_phone: tourist?.phone,
        })

        await logActivity({
          action: 'payment_failed',
          entity_type: 'bookings',
          entity_id: booking.id,
          new_value: { status: 'payment_failed' },
          metadata: { event: eventType, error: errorDescription },
        })
      }
    } else if (eventType === 'refund.processed') {
      const refundEntity = (payload.refund as Record<string, unknown>)?.entity as Record<string, unknown>
      const razorpayPaymentId = refundEntity?.payment_id as string
      const refundId = refundEntity?.id as string
      const refundAmount = refundEntity?.amount as number

      if (razorpayPaymentId) {
        const { data: booking } = await supabase
          .from('bookings')
          .select('id, tourist_id, booking_reference, tourist_language')
          .eq('razorpay_payment_id', razorpayPaymentId)
          .single()

        if (booking) {
          await supabase
            .from('bookings')
            .update({
              refund_status: 'refunded',
              refund_id: refundId,
              refunded_at: new Date().toISOString(),
            })
            .eq('id', booking.id)

          const { data: tourist } = await supabase
            .from('users')
            .select('phone, preferred_language')
            .eq('id', booking.tourist_id)
            .single()

          await sendNotification({
            user_id: booking.tourist_id,
            type: 'refund_processed',
            channel: 'whatsapp',
            language: tourist?.preferred_language || booking.tourist_language || 'en',
            variables: {
              booking_reference: booking.booking_reference,
              refund_amount: `₹${Math.round(refundAmount / 100)}`,
            },
            recipient_phone: tourist?.phone,
          })

          await logActivity({
            action: 'refund_processed',
            entity_type: 'bookings',
            entity_id: booking.id,
            new_value: { refund_status: 'refunded', refund_id: refundId },
            metadata: { event: eventType, refund_amount: refundAmount },
          })
        }
      }
    } else if (eventType === 'subscription.activated') {
      const subscriptionEntity = (payload.subscription as Record<string, unknown>)?.entity as Record<string, unknown>
      const subscriptionId = subscriptionEntity?.id as string
      const planId = subscriptionEntity?.plan_id as string
      const currentEnd = subscriptionEntity?.current_end as number

      // Find provider by subscription id
      const { data: provider } = await supabase
        .from('provider_profiles')
        .select('id, user_id')
        .eq('razorpay_subscription_id', subscriptionId)
        .single()

      if (provider) {
        // Determine tier from plan_id
        let tier = 'standard'
        if (planId?.includes('premium')) tier = 'premium'
        else if (planId?.includes('enterprise')) tier = 'enterprise'

        const expiresAt = currentEnd
          ? new Date(currentEnd * 1000).toISOString()
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

        await supabase
          .from('provider_profiles')
          .update({ subscription_tier: tier, subscription_expires_at: expiresAt })
          .eq('id', provider.id)

        await logActivity({
          action: 'subscription_activated',
          entity_type: 'provider_profiles',
          entity_id: provider.id,
          new_value: { tier, expires_at: expiresAt },
          metadata: { event: eventType, subscription_id: subscriptionId },
        })
      }
    } else if (eventType === 'subscription.cancelled') {
      const subscriptionEntity = (payload.subscription as Record<string, unknown>)?.entity as Record<string, unknown>
      const subscriptionId = subscriptionEntity?.id as string

      const { data: provider } = await supabase
        .from('provider_profiles')
        .select('id')
        .eq('razorpay_subscription_id', subscriptionId)
        .single()

      if (provider) {
        await supabase
          .from('provider_profiles')
          .update({ subscription_tier: 'free', subscription_expires_at: null })
          .eq('id', provider.id)

        await logActivity({
          action: 'subscription_cancelled',
          entity_type: 'provider_profiles',
          entity_id: provider.id,
          new_value: { tier: 'free' },
          metadata: { event: eventType, subscription_id: subscriptionId },
        })
      }
    } else {
      // Unhandled event type — log and acknowledge
      console.log('Unhandled Razorpay event:', eventType)
    }

    return new Response(JSON.stringify({ received: true, event: eventType }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Webhook handler error:', err)
    await logActivity({
      action: 'webhook_error',
      entity_type: 'webhooks',
      metadata: { event: eventType, error: String(err) },
    })
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
