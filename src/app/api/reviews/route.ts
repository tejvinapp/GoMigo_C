import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/src/lib/supabase/server'
import { createAdminClient } from '@/src/lib/supabase/admin'
import { AppError } from '@/src/lib/errors/AppError'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const CreateReviewSchema = z.object({
  booking_id: z.string().uuid(),
  listing_id: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
  language: z.string().max(5).optional().default('en'),
})

// GET /api/reviews?listing_id=xxx
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const listingId = searchParams.get('listing_id')
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const limit = Math.min(50, parseInt(searchParams.get('limit') || '20'))
  const offset = (page - 1) * limit

  if (!listingId) {
    return NextResponse.json(
      { error: true, message: 'listing_id query parameter is required' },
      { status: 400 }
    )
  }

  const admin = createAdminClient()

  const { data, count, error } = await admin
    .from('reviews')
    .select(
      `
        id, rating, comment, language, created_at,
        users!tourist_id (
          id,
          full_name
        )
      `,
      { count: 'exact' }
    )
    .eq('listing_id', listingId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    return NextResponse.json(
      { error: true, message: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }

  // Privacy: return first name only
  const sanitized = (data || []).map((r) => {
    const userRow = r.users as { id: string; full_name: string | null } | null
    const fullName = userRow?.full_name || ''
    const firstName = fullName.split(' ')[0] || 'Traveller'
    return {
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      language: r.language,
      created_at: r.created_at,
      reviewer_name: firstName,
    }
  })

  return NextResponse.json({
    success: true,
    data: sanitized,
    total: count ?? 0,
    page,
    limit,
  })
}

// POST /api/reviews — create a new review
export async function POST(request: NextRequest) {
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

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: true, message: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = CreateReviewSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: true, message: 'Invalid request', issues: parsed.error.issues },
      { status: 400 }
    )
  }

  const { booking_id, listing_id, rating, comment, language } = parsed.data
  const admin = createAdminClient()

  // Validate: booking must exist and belong to this user
  const { data: booking, error: bookingError } = await admin
    .from('bookings')
    .select('id, tourist_id, provider_id, status, listing_id')
    .eq('id', booking_id)
    .single()

  if (bookingError || !booking) {
    return NextResponse.json(
      { error: true, message: 'Booking not found' },
      { status: 404 }
    )
  }

  if (booking.tourist_id !== user.id) {
    return NextResponse.json(
      { error: true, message: 'Forbidden: this booking does not belong to you' },
      { status: 403 }
    )
  }

  // Booking must be for this listing
  if (booking.listing_id !== listing_id) {
    return NextResponse.json(
      { error: true, message: 'Booking is not for this listing' },
      { status: 400 }
    )
  }

  // Booking status must be completed
  if (booking.status !== 'completed') {
    return NextResponse.json(
      { error: true, message: 'Reviews can only be submitted for completed bookings' },
      { status: 400 }
    )
  }

  // No existing review for this booking
  const { data: existingReview } = await admin
    .from('reviews')
    .select('id')
    .eq('booking_id', booking_id)
    .single()

  if (existingReview) {
    return NextResponse.json(
      { error: true, message: 'You have already submitted a review for this booking' },
      { status: 409 }
    )
  }

  // Insert review
  const { data: review, error: insertError } = await admin
    .from('reviews')
    .insert({
      booking_id,
      listing_id,
      tourist_id: user.id,
      provider_id: booking.provider_id,
      rating,
      comment: comment ?? null,
      language,
      created_at: new Date().toISOString(),
    })
    .select('id, rating, comment, created_at')
    .single()

  if (insertError) {
    return NextResponse.json(
      { error: true, message: 'Failed to create review' },
      { status: 500 }
    )
  }

  // Trigger provider reputation recalculation (fire-and-forget)
  admin
    .rpc('recalculate_provider_reputation', { p_provider_id: booking.provider_id })
    .then(() => {})
    .catch(() => {})

  return NextResponse.json({ success: true, data: review }, { status: 201 })
}
