import { NextRequest, NextResponse } from 'next/server'
import { verifyWebhookSignature, createRefund } from '@/lib/payments/razorpay'
import { createAdminClient } from '@/lib/supabase/admin'
import { notifyError } from '@/lib/errors/notify'
import { AppError } from '@/lib/errors/AppError'
import { sendWhatsApp } from '@/lib/notifications/whatsapp'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('x-razorpay-signature') || ''

  // ALWAYS verify signature before processing
  const isValid = await verifyWebhookSignature(body, signature)
  if (!isValid) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let event: Record<string, unknown>
  try {
    event = JSON.parse(body)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const admin = createAdminClient()

  try {
    const eventType = event.event as string
    const payload = event.payload as Record<string, unknown>

    switch (eventType) {
      case 'payment.captured': {
        const payment = (payload.payment as Record<string, unknown>).entity as Record<string, unknown>
        const orderId = payment.order_id as string
        const paymentId = payment.id as string
        const amountPaise = payment.amount as number
        const method = payment.method as string

        // Update booking payment status
        await admin
          .from('bookings')
          .update({
            razorpay_payment_id: paymentId,
            payment_status: 'paid',
            payment_method: method,
            status: 'confirmed',
          })
          .eq('razorpay_order_id', orderId)

        // Get booking details for notifications
        const { data: booking } = await admin
          .from('bookings')
          .select('id, booking_reference, tourist_id, provider_id, tourist_language, pickup_name, checkin_date, tour_date')
          .eq('razorpay_order_id', orderId)
          .single()

        if (booking) {
          // Get tourist phone
          const { data: tourist } = await admin
            .from('users')
            .select('phone, full_name')
            .eq('id', booking.tourist_id)
            .single()

          if (tourist) {
            await sendWhatsApp({
              to: tourist.phone,
              templateName: `gomigo_booking_confirmed_${booking.tourist_language}`,
              variables: [booking.booking_reference, tourist.full_name || 'Traveller'],
              language: booking.tourist_language,
            }, booking.id, booking.tourist_id)
          }
        }
        break
      }

      case 'payment.failed': {
        const payment = (payload.payment as Record<string, unknown>).entity as Record<string, unknown>
        const orderId = payment.order_id as string

        await admin
          .from('bookings')
          .update({ payment_status: 'unpaid', status: 'pending' })
          .eq('razorpay_order_id', orderId)
        break
      }

      case 'refund.processed': {
        const refund = (payload.refund as Record<string, unknown>).entity as Record<string, unknown>
        const paymentId = refund.payment_id as string
        const refundId = refund.id as string
        const refundAmount = refund.amount as number

        await admin
          .from('bookings')
          .update({
            refund_status: 'completed',
            refund_razorpay_id: refundId,
            refund_amount_paise: refundAmount,
            status: 'refunded',
          })
          .eq('razorpay_payment_id', paymentId)
        break
      }

      case 'subscription.charged': {
        const subscription = (payload.subscription as Record<string, unknown>).entity as Record<string, unknown>
        const razorpaySubId = subscription.id as string

        await admin
          .from('subscriptions')
          .update({
            status: 'active',
            failure_count: 0,
            last_payment_attempt_at: new Date().toISOString(),
          })
          .eq('razorpay_subscription_id', razorpaySubId)
        break
      }

      case 'subscription.halted': {
        const subscription = (payload.subscription as Record<string, unknown>).entity as Record<string, unknown>
        const razorpaySubId = subscription.id as string

        // Get provider and suspend their listing
        const { data: sub } = await admin
          .from('subscriptions')
          .update({ status: 'suspended', failure_count: 4 })
          .eq('razorpay_subscription_id', razorpaySubId)
          .select('provider_id')
          .single()

        if (sub) {
          await admin
            .from('provider_profiles')
            .update({ listing_visible: false })
            .eq('id', sub.provider_id)
        }
        break
      }

      default:
        // Unknown event — ignore safely
        break
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    await notifyError(error as Error, { route: '/api/webhooks/razorpay', httpMethod: 'POST' })
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
