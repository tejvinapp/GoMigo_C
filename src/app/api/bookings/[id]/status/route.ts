import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/src/lib/supabase/server'
import { createAdminClient } from '@/src/lib/supabase/admin'
import { AppError } from '@/src/lib/errors/AppError'
import { sendWhatsApp } from '@/src/lib/notifications/whatsapp'
import { createRefund } from '@/src/lib/payments/razorpay'
import { notifyError } from '@/src/lib/errors/notify'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const UpdateStatusSchema = z.object({
  status: z.enum(['confirmed', 'cancelled', 'completed']),
  reason: z.string().max(500).optional(),
})

// PATCH /api/bookings/[id]/status — provider updates booking status
export async function PATCH(
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
  if (!bookingId) {
    return NextResponse.json(
      { error: true, message: 'Booking ID is required' },
      { status: 400 }
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: true, message: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = UpdateStatusSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: true, message: 'Invalid request', issues: parsed.error.issues },
      { status: 400 }
    )
  }

  const { status, reason } = parsed.data
  const admin = createAdminClient()

  // Fetch booking details
  const { data: booking, error: bookingError } = await admin
    .from('bookings')
    .select(`
      id, booking_reference, status, tourist_id, provider_id,
      tourist_language, total_paise, payment_method, payment_status,
      razorpay_payment_id, razorpay_order_id,
      pickup_name, tour_date, checkin_date
    `)
    .eq('id', bookingId)
    .single()

  if (bookingError || !booking) {
    return NextResponse.json(
      { error: true, message: 'Booking not found' },
      { status: 404 }
    )
  }

  // Verify authenticated user is the provider for this booking
  const { data: provider } = await admin
    .from('provider_profiles')
    .select('id, display_name, user_id')
    .eq('id', booking.provider_id)
    .eq('user_id', user.id)
    .single()

  if (!provider) {
    return NextResponse.json(
      { error: true, message: 'Forbidden: you are not the provider for this booking' },
      { status: 403 }
    )
  }

  // Validate status transitions
  const allowedTransitions: Record<string, string[]> = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['completed', 'cancelled'],
    completed: [],
    cancelled: [],
    payment_failed: ['cancelled'],
  }

  const currentStatus = booking.status as string
  if (!allowedTransitions[currentStatus]?.includes(status)) {
    return NextResponse.json(
      {
        error: true,
        message: `Cannot transition from '${currentStatus}' to '${status}'`,
      },
      { status: 400 }
    )
  }

  try {
    // Update booking status
    const { data: updated, error: updateError } = await admin
      .from('bookings')
      .update({
        status,
        cancellation_reason: status === 'cancelled' ? (reason ?? null) : null,
        completed_at: status === 'completed' ? new Date().toISOString() : null,
        cancelled_at: status === 'cancelled' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId)
      .select('id, booking_reference, status, updated_at')
      .single()

    if (updateError) {
      throw new Error(`Failed to update booking: ${updateError.message}`)
    }

    // Fetch tourist info for notification
    const { data: tourist } = await admin
      .from('users')
      .select('id, phone, preferred_language, full_name')
      .eq('id', booking.tourist_id)
      .single()

    const language = tourist?.preferred_language || booking.tourist_language || 'en'

    // Send WhatsApp notification to tourist
    if (tourist?.phone) {
      let templateName = ''
      let variables: string[] = []

      if (status === 'confirmed') {
        templateName = `gomigo_booking_confirmed_${language}`
        variables = [
          booking.booking_reference,
          provider.display_name || 'Provider',
          booking.tour_date || booking.checkin_date || 'your booking date',
          booking.pickup_name || 'pickup location',
        ]
      } else if (status === 'cancelled') {
        templateName = `gomigo_booking_cancelled_${language}`
        variables = [
          booking.booking_reference,
          reason || 'Provider cancelled',
        ]
      } else if (status === 'completed') {
        templateName = `gomigo_booking_completed_${language}`
        variables = [
          booking.booking_reference,
          provider.display_name || 'Provider',
        ]
      }

      if (templateName) {
        await sendWhatsApp(
          {
            to: tourist.phone,
            templateName,
            variables,
            language,
          },
          bookingId,
          tourist.id
        )
      }
    }

    // If cancelling with online payment: trigger Razorpay refund
    if (
      status === 'cancelled' &&
      booking.payment_status === 'paid' &&
      booking.razorpay_payment_id &&
      booking.payment_method !== 'cash'
    ) {
      try {
        const refund = await createRefund({
          paymentId: booking.razorpay_payment_id,
          amountPaise: booking.total_paise,
          reason: reason || 'Provider cancellation',
        })

        await admin
          .from('bookings')
          .update({
            refund_status: 'refund_initiated',
            refund_id: refund.id,
          })
          .eq('id', bookingId)
      } catch (refundErr) {
        // Log refund failure but don't fail the status update
        console.error('Refund initiation failed:', refundErr)
        await admin.from('error_logs').insert({
          error_code: 'ERR_PAYMENT_REFUND_PENDING',
          severity: 'high',
          message: `Refund failed for booking ${bookingId}`,
          metadata: {
            booking_id: bookingId,
            payment_id: booking.razorpay_payment_id,
            error: String(refundErr),
          },
          auto_fixed: false,
          created_at: new Date().toISOString(),
        })
      }
    }

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(error.toUserResponse(), { status: error.httpStatus })
    }
    await notifyError(error as Error, {
      userId: user.id,
      route: `/api/bookings/${bookingId}/status`,
      httpMethod: 'PATCH',
    })
    return NextResponse.json(
      { error: true, message: 'Failed to update booking status' },
      { status: 500 }
    )
  }
}

// GET /api/bookings/[id]/status — get current status of a booking
export async function GET(
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

  const admin = createAdminClient()
  const { data: booking, error } = await admin
    .from('bookings')
    .select('id, booking_reference, status, payment_status, updated_at, tourist_id, provider_id')
    .eq('id', params.id)
    .single()

  if (error || !booking) {
    return NextResponse.json(
      { error: true, message: 'Booking not found' },
      { status: 404 }
    )
  }

  // Verify user has access
  const isTourist = booking.tourist_id === user.id
  const { data: providerCheck } = await admin
    .from('provider_profiles')
    .select('id')
    .eq('id', booking.provider_id)
    .eq('user_id', user.id)
    .single()

  if (!isTourist && !providerCheck) {
    return NextResponse.json(
      { error: true, message: 'Forbidden: no access to this booking' },
      { status: 403 }
    )
  }

  return NextResponse.json({
    success: true,
    data: {
      id: booking.id,
      booking_reference: booking.booking_reference,
      status: booking.status,
      payment_status: booking.payment_status,
      updated_at: booking.updated_at,
    },
  })
}
