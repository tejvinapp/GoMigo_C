import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/src/lib/supabase/server'
import { createAdminClient } from '@/src/lib/supabase/admin'
import { AppError } from '@/src/lib/errors/AppError'
import { notifyError } from '@/src/lib/errors/notify'
import { checkRateLimit } from '@/src/lib/utils/rateLimit'
import { calculateBookingAmounts } from '@/src/lib/utils/currency'
import { applySeasonalPricing } from '@/src/lib/utils/seasonal'
import { createOrder } from '@/src/lib/payments/razorpay'
import { z } from 'zod'

const CreateBookingSchema = z.object({
  listingId: z.string().uuid(),
  bookingType: z.enum(['cab', 'auto', 'hotel', 'tour']),
  pickupLat: z.number().optional(),
  pickupLng: z.number().optional(),
  pickupName: z.string().max(200).optional(),
  destinationLat: z.number().optional(),
  destinationLng: z.number().optional(),
  destinationName: z.string().max(200).optional(),
  checkinDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  checkoutDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  tourDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  numPassengers: z.number().int().min(1).max(20).optional(),
  numRooms: z.number().int().min(1).max(10).optional(),
  paymentMethod: z.enum(['upi', 'card', 'netbanking', 'cash']),
})

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      new AppError('ERR_AUTH_SESSION_EXPIRED').toUserResponse(),
      { status: 401 }
    )
  }

  // Rate limit check
  const ip = request.headers.get('x-forwarded-for') || 'unknown'
  const { allowed } = await checkRateLimit(user.id, 'bookings/create')
  if (!allowed) {
    return NextResponse.json(
      new AppError('ERR_RATE_LIMIT').toUserResponse(),
      { status: 429 }
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: true, message: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = CreateBookingSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: true, message: 'Invalid request', issues: parsed.error.issues }, { status: 400 })
  }

  const data = parsed.data
  const admin = createAdminClient()

  try {
    // Get listing details
    const { data: listing, error: listingError } = await admin
      .from('listings')
      .select('id, provider_id, base_price_paise, demand_multiplier, seasonal_rules, platform_fee_percent, is_instant_book, listing_visible, cancellation_policy, destination_id')
      .eq('id', data.listingId)
      .eq('listing_visible', true)
      .single()

    if (listingError || !listing) {
      throw new AppError('ERR_LISTING_NOT_FOUND')
    }

    // Get provider's user info for language preference
    const { data: providerUser } = await admin
      .from('provider_profiles')
      .select('user_id')
      .eq('id', listing.provider_id)
      .single()

    // Get tourist's language preference
    const { data: touristData } = await admin
      .from('users')
      .select('preferred_language')
      .eq('id', user.id)
      .single()

    const touristLanguage = touristData?.preferred_language || 'en'

    // Calculate price with seasonal adjustments
    const seasonal = applySeasonalPricing(listing.base_price_paise, listing.seasonal_rules)
    const priceWithDemand = Math.round(seasonal.finalPaise * listing.demand_multiplier)

    // For hotels: multiply by number of nights
    let baseAmount = priceWithDemand
    if (data.bookingType === 'hotel' && data.checkinDate && data.checkoutDate) {
      const nights = Math.max(1, (new Date(data.checkoutDate).getTime() - new Date(data.checkinDate).getTime()) / 86400000)
      baseAmount = priceWithDemand * nights * (data.numRooms || 1)
    }

    const amounts = calculateBookingAmounts(
      baseAmount,
      listing.platform_fee_percent,
      18, // GST %
      listing.is_instant_book // Instant book discount
    )

    // Create booking record
    const { data: booking, error: bookingError } = await admin
      .from('bookings')
      .insert({
        tourist_id: user.id,
        listing_id: data.listingId,
        provider_id: listing.provider_id,
        booking_type: data.bookingType,
        status: 'pending',
        pickup_lat: data.pickupLat,
        pickup_lng: data.pickupLng,
        pickup_name: data.pickupName,
        destination_lat: data.destinationLat,
        destination_lng: data.destinationLng,
        destination_name: data.destinationName,
        checkin_date: data.checkinDate,
        checkout_date: data.checkoutDate,
        tour_date: data.tourDate,
        num_passengers: data.numPassengers,
        num_rooms: data.numRooms,
        num_nights: data.checkinDate && data.checkoutDate
          ? Math.max(1, (new Date(data.checkoutDate).getTime() - new Date(data.checkinDate).getTime()) / 86400000)
          : undefined,
        base_amount_paise: amounts.basePaise,
        platform_fee_paise: amounts.platformFeePaise,
        gst_paise: amounts.gstOnFeePaise,
        total_paise: amounts.totalPaise,
        provider_payout_paise: amounts.providerPayoutPaise,
        payment_method: data.paymentMethod,
        payment_status: data.paymentMethod === 'cash' ? 'unpaid' : 'unpaid',
        tourist_language: touristLanguage,
      })
      .select('id, booking_reference, total_paise')
      .single()

    if (bookingError || !booking) {
      throw new Error('Failed to create booking')
    }

    // For online payment: create Razorpay order
    let razorpayOrderId: string | undefined
    if (data.paymentMethod !== 'cash') {
      try {
        const order = await createOrder({
          amountPaise: amounts.totalPaise,
          bookingId: booking.id,
          bookingReference: booking.booking_reference,
        })
        razorpayOrderId = order.id

        await admin
          .from('bookings')
          .update({ razorpay_order_id: order.id })
          .eq('id', booking.id)
      } catch {
        // If Razorpay fails, we still have the booking — let user retry payment
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        bookingId: booking.id,
        bookingReference: booking.booking_reference,
        razorpayOrderId,
        totalPaise: amounts.totalPaise,
        status: 'pending',
      },
    })
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(error.toUserResponse(), { status: error.httpStatus })
    }
    await notifyError(error as Error, { userId: user.id, route: '/api/bookings', httpMethod: 'POST' })
    return NextResponse.json({ error: true, message: 'Failed to create booking' }, { status: 500 })
  }
}

// GET /api/bookings — list current user's bookings
export async function GET(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(new AppError('ERR_AUTH_SESSION_EXPIRED').toUserResponse(), { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)

  const admin = createAdminClient()
  let query = admin
    .from('bookings')
    .select('id, booking_reference, booking_type, status, total_paise, payment_status, created_at, checkin_date, tour_date, pickup_name, destination_name')
    .eq('tourist_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (status) query = query.eq('status', status)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: true, message: 'Failed to fetch bookings' }, { status: 500 })

  return NextResponse.json({ success: true, data: data || [] })
}
