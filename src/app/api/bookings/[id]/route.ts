import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: true, message: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()
  const { data: booking, error } = await admin
    .from('bookings')
    .select(`
      id,
      booking_type,
      status,
      total_paise,
      payment_status,
      tourist_id,
      listing_id,
      created_at,
      tour_date,
      checkin_date,
      checkout_date,
      listings (
        id,
        title_en,
        listing_type,
        location_name
      )
    `)
    .eq('id', params.id)
    .single()

  if (error || !booking) {
    return NextResponse.json({ error: true, message: 'Booking not found' }, { status: 404 })
  }

  // Only the tourist who made the booking can view it
  if ((booking as unknown as { tourist_id: string }).tourist_id !== user.id) {
    return NextResponse.json({ error: true, message: 'Forbidden' }, { status: 403 })
  }

  const b = booking as unknown as {
    id: string
    booking_type: string
    status: string
    total_paise: number
    payment_status: string
    tourist_id: string
    listing_id: string
    created_at: string
    tour_date: string | null
    checkin_date: string | null
    checkout_date: string | null
    listings: {
      id: string
      title_en: string
      listing_type: string
      location_name: string
    } | null
  }

  return NextResponse.json({
    success: true,
    data: {
      id: b.id,
      listing_id: b.listing_id,
      listing_title: b.listings?.title_en || 'Booking',
      listing_type: b.listings?.listing_type || b.booking_type,
      status: b.status,
      total_paise: b.total_paise,
      payment_status: b.payment_status,
      created_at: b.created_at,
      tour_date: b.tour_date,
      checkin_date: b.checkin_date,
      checkout_date: b.checkout_date,
    },
  })
}
