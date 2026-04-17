import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { AppError } from '@/lib/errors/AppError'
import { createRefund } from '@/lib/payments/razorpay'
import { sendWhatsApp } from '@/lib/notifications/whatsapp'

export const dynamic = 'force-dynamic'

// POST /api/bookings/[id]/cancel — tourist cancels a booking
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      new AppError('ERR_AUTH_SESSION_EXPIRED').toUserResponse(),
      { status: 401 }
    )
  }

  const bookingId = params.id
  const admin = createAdminClient()

  // Fetch booking
  const { data: booking, error: bookingError } = await admin
    .from('bookings')
    .select(`
      id, booking_reference, status, tourist_id, provider_id,
      total_paise, payment_status, payment_method,
      razorpay_payment_id, tourist_language, tour_date, checkin_date
    `)
    .eq('id', bookingId)
    .single()

  if (bookingError || !booking) {
    return NextResponse.json(
      { error: true, message: 'Booking not found' },
      { status: 404 }
    )
  }

  // Only the tourist who made the booking can cancel it
  if (booking.tourist_id !== user.id) {
    return NextResponse.json(
      { error: true, message: 'Forbidden: not your booking' },
      { status: 403 }
    )
  }

  // Only allow cancelling pending/confirmed bookings
  const allowedStatuses = ['pending', 'confirmed']
  if (!allowedStatuses.includes(booking.status)) {
    return NextResponse.json(
      { error: true, message: `Cannot cancel a booking with status '${booking.status}'` },
      { status: 400 }
    )
  }

  // Update booking status
  const { error: updateError } = await admin
    .from('bookings')
    .update({
      status: 'cancelled',
      cancellation_reason: 'Tourist cancellation',
      cancelled_by: 'tourist',
      cancelled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', bookingId)

  if (updateError) {
    return NextResponse.json(
      { error: true, message: 'Failed to cancel booking' },
      { status: 500 }
    )
  }

  // Get tourist info for notification
  const { data: tourist } = await admin
    .from('users')
    .select('id, phone, preferred_language, full_name')
    .eq('id', user.id)
    .single()

  const language = tourist?.preferred_language || booking.tourist_language || 'en'

  // Send WhatsApp notification
  if (tourist?.phone) {
    try {
      await sendWhatsApp(
        {
          to: tourist.phone,
          templateName: `gomigo_booking_cancelled_${language}`,
          variables: [booking.booking_reference, 'Tourist cancellation'],
          language,
        },
        bookingId,
        tourist.id
      )
    } catch {
      // Non-fatal — booking is already cancelled
    }
  }

  // If paid online, initiate refund
  if (
    booking.payment_status === 'paid' &&
    booking.razorpay_payment_id &&
    booking.payment_method !== 'cash'
  ) {
    try {
      const refund = await createRefund({
        paymentId: booking.razorpay_payment_id,
        amountPaise: booking.total_paise,
        reason: 'Tourist cancellation',
      })
      await admin
        .from('bookings')
        .update({
          refund_status: 'refund_initiated',
          refund_razorpay_id: refund.id,
        })
        .eq('id', bookingId)
    } catch (refundErr) {
      console.error('Refund initiation failed:', refundErr)
      await admin.from('error_logs').insert({
        error_code: 'ERR_PAYMENT_REFUND_PENDING',
        error_title: 'Refund initiation failed',
        severity: 'high',
        error_message: `Refund failed for booking ${bookingId}`,
        auto_fix_attempted: false,
        created_at: new Date().toISOString(),
      })
    }
  }

  return NextResponse.json({ success: true })
}
