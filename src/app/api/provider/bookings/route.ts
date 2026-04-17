import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { AppError } from '@/lib/errors/AppError'

export const dynamic = 'force-dynamic'

// GET /api/provider/bookings — list provider's bookings with tourist info
export async function GET(request: NextRequest) {
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

  // Get provider profile
  const { data: provider } = await admin
    .from('provider_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!provider) {
    return NextResponse.json(
      { error: true, message: 'Provider profile not found' },
      { status: 403 }
    )
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const limit = Math.min(50, parseInt(searchParams.get('limit') || '10'))
  const offset = (page - 1) * limit

  let countQuery = admin
    .from('bookings')
    .select('id', { count: 'exact', head: true })
    .eq('provider_id', provider.id)

  let dataQuery = admin
    .from('bookings')
    .select(`
      id, booking_reference, booking_type, status,
      total_paise, created_at, tour_date, checkin_date,
      pickup_name, tourist_id,
      users!tourist_id (full_name, phone)
    `)
    .eq('provider_id', provider.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (status && status !== 'all') {
    countQuery = countQuery.eq('status', status)
    dataQuery = dataQuery.eq('status', status)
  }

  const [{ count }, { data: bookings, error }] = await Promise.all([
    countQuery,
    dataQuery,
  ])

  if (error) {
    console.error('Provider bookings fetch error:', error)
    return NextResponse.json(
      { error: true, message: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }

  // Reshape data to include tourist_name and tourist_phone_last4
  const shaped = (bookings || []).map((b) => {
    const tourist = b.users as unknown as { full_name?: string; phone?: string } | null
    const phone = tourist?.phone || ''
    const last4 = phone.replace(/\D/g, '').slice(-4)
    return {
      id: b.id,
      booking_reference: b.booking_reference,
      booking_type: b.booking_type,
      status: b.status,
      total_paise: b.total_paise,
      created_at: b.created_at,
      tour_date: b.tour_date,
      checkin_date: b.checkin_date,
      pickup_name: b.pickup_name,
      tourist_name: tourist?.full_name || 'Tourist',
      tourist_phone_last4: last4,
    }
  })

  return NextResponse.json({
    success: true,
    data: shaped,
    total: count || 0,
    page,
    limit,
  })
}
