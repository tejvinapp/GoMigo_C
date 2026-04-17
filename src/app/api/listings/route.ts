import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { applySeasonalPricing } from '@/lib/utils/seasonal'
import { applyDemandMultiplier } from '@/lib/utils/currency'
import { AppError } from '@/lib/errors/AppError'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const destinationSlug = searchParams.get('destination')
  const listingType = searchParams.get('type') // cab, auto, hotel_room, tour
  const lang = searchParams.get('lang') || 'en'
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const limit = Math.min(50, parseInt(searchParams.get('limit') || '20'))
  const offset = (page - 1) * limit

  const admin = createAdminClient()

  try {
    // First resolve destination slug to id if provided
    let destinationId: string | null = null
    if (destinationSlug) {
      const { data: dest } = await admin
        .from('destinations')
        .select('id')
        .eq('slug', destinationSlug)
        .eq('is_active', true)
        .single()
      if (dest) destinationId = dest.id
    }

    // Build query — use left join for provider_profiles to avoid empty results
    let query = admin
      .from('listings')
      .select(`
        id, listing_type,
        title_en, title_ta, title_te, title_kn, title_ml, title_hi, title_mr, title_or,
        base_price_paise, demand_multiplier, seasonal_rules,
        cover_photo_url, location_name_en, location_lat, location_lng,
        is_instant_book, listing_visible, cancellation_policy,
        view_count, booking_count,
        provider_profiles (
          id, display_name, profile_photo_url, reputation_score, total_reviews, sort_boost
        ),
        destinations (slug, region_name)
      `, { count: 'exact' })
      .eq('listing_visible', true)
      .is('deleted_at', null)
      .order('booking_count', { ascending: false })
      .range(offset, offset + limit - 1)

    if (listingType) query = query.eq('listing_type', listingType)
    if (destinationId) query = query.eq('destination_id', destinationId)

    const { data, count, error } = await query

    if (error) {
      console.error('Listings query error:', error)
      return NextResponse.json({ error: true, message: 'Failed to fetch listings', detail: error.message }, { status: 500 })
    }

    // Transform listings — pick correct language title
    const validLangs = ['en', 'ta', 'te', 'kn', 'ml', 'hi', 'mr', 'or']
    const safeLang = validLangs.includes(lang) ? lang : 'en'

    const listings = (data || []).map((l) => {
      const seasonal = applySeasonalPricing(l.base_price_paise, l.seasonal_rules)
      const finalPrice = applyDemandMultiplier(seasonal.finalPaise, l.demand_multiplier)
      const provider = l.provider_profiles as Record<string, unknown> | null

      const titleKey = `title_${safeLang}` as keyof typeof l
      const title = (l[titleKey] as string | null) || l.title_en || ''

      return {
        id: l.id,
        listingType: l.listing_type,
        title,
        basePricePaise: l.base_price_paise,
        displayPricePaise: finalPrice,
        seasonLabel: seasonal.seasonLabel,
        coverPhotoUrl: l.cover_photo_url,
        locationName: l.location_name_en || '',
        locationLat: l.location_lat,
        locationLng: l.location_lng,
        isInstantBook: l.is_instant_book,
        cancellationPolicy: l.cancellation_policy,
        provider: provider ? {
          id: provider.id,
          name: provider.display_name,
          photo: provider.profile_photo_url,
          rating: provider.reputation_score,
          reviewCount: provider.total_reviews,
          isVerified: true,
          sortBoost: provider.sort_boost,
        } : null,
      }
    })

    return NextResponse.json({
      success: true,
      data: listings,
      pagination: { page, limit, total: count || 0, pages: Math.ceil((count || 0) / limit) },
    })
  } catch (err) {
    console.error('Listings API error:', err)
    return NextResponse.json({ error: true, message: 'Failed to fetch listings' }, { status: 500 })
  }
}

// POST /api/listings — create a new listing (provider only)
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

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: true, message: 'Invalid JSON' }, { status: 400 })
  }

  const { serviceType, description, locationName, photos = [], ...rest } = body

  // Map form serviceType to DB listing_type
  const listingTypeMap: Record<string, string> = {
    cab: 'cab',
    auto: 'auto',
    hotel: 'hotel_room',
    guide: 'tour',
  }
  const listingType = listingTypeMap[serviceType as string]
  if (!listingType) {
    return NextResponse.json({ error: true, message: 'Invalid service type' }, { status: 400 })
  }

  // Get first active destination (default to Nilgiris for now)
  const { data: destination } = await admin
    .from('destinations')
    .select('id')
    .eq('is_active', true)
    .limit(1)
    .single()

  if (!destination) {
    return NextResponse.json({ error: true, message: 'No active destination found' }, { status: 400 })
  }

  // Calculate base price based on type
  let basePricePaise = 150000 // default ₹1500
  if (listingType === 'cab' || listingType === 'auto') {
    basePricePaise = ((rest.basePricePerKmPaise as number) || 1500) * 20 // assume 20km avg trip
  } else if (listingType === 'tour') {
    basePricePaise = (rest.dailyRatePaise as number) || 150000
  } else if (listingType === 'hotel_room') {
    const rooms = (rest.roomTypes as Array<{ pricePaise: number }>) || []
    basePricePaise = rooms[0]?.pricePaise || 200000
  }

  const { data: listing, error } = await admin
    .from('listings')
    .insert({
      provider_id: provider.id,
      destination_id: destination.id,
      listing_type: listingType,
      title_en: (rest.propertyName as string) ||
        (rest.vehicleModel ? `${rest.vehicleModel} (${rest.vehicleNumber || ''})` : null) ||
        `${serviceType} Service`,
      description_en: description as string,
      base_price_paise: basePricePaise,
      location_name_en: locationName as string,
      cover_photo_url: (photos as string[])[0] || null,
      photo_urls: (photos as string[]).slice(1),
      amenities: (rest.amenities as string[]) || [],
      vehicle_type: (rest.vehicleModel as string) || null,
      vehicle_number: (rest.vehicleNumber as string) || null,
      seat_capacity: (rest.capacity as number) || null,
      listing_visible: false, // requires admin approval
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select('id, booking_reference:id')
    .single()

  if (error) {
    console.error('Create listing error:', error)
    return NextResponse.json({ error: true, message: 'Failed to create listing' }, { status: 500 })
  }

  return NextResponse.json({ success: true, data: { id: listing.id } }, { status: 201 })
}
