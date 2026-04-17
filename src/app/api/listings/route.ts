import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { applySeasonalPricing } from '@/lib/utils/seasonal'
import { applyDemandMultiplier } from '@/lib/utils/currency'

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

  // Build query
  let query = admin
    .from('listings')
    .select(`
      id, listing_type,
      title_en, title_ta, title_te, title_kn, title_ml, title_hi, title_mr, title_or,
      base_price_paise, demand_multiplier, seasonal_rules,
      cover_photo_url, location_name_en, location_lat, location_lng,
      is_instant_book, listing_visible, cancellation_policy,
      view_count, booking_count,
      provider_profiles!inner (
        id, display_name, profile_photo_url, reputation_score, total_reviews, sort_boost,
        kyc_documents!inner (status)
      ),
      destinations!inner (slug, region_name)
    `, { count: 'exact' })
    .eq('listing_visible', true)
    .is('deleted_at', null)
    .range(offset, offset + limit - 1)
    .order('sort_boost', { ascending: false, foreignTable: 'provider_profiles' })
    .order('booking_count', { ascending: false })

  if (listingType) query = query.eq('listing_type', listingType)
  if (destinationSlug) query = query.eq('destinations.slug', destinationSlug)

  const { data, count, error } = await query

  if (error) {
    return NextResponse.json({ error: true, message: 'Failed to fetch listings' }, { status: 500 })
  }

  // Increment view count in background (fire-and-forget)
  if (data && data.length > 0) {
    const ids = data.map((l) => l.id)
    admin.rpc('increment_listing_views', { listing_ids: ids }).then(() => {}).catch(() => {})
  }

  // Transform listings — pick correct language title
  const titleKey = `title_${lang}` as keyof typeof data[0]
  const listings = (data || []).map((l) => {
    const seasonal = applySeasonalPricing(l.base_price_paise, l.seasonal_rules)
    const finalPrice = applyDemandMultiplier(seasonal.finalPaise, l.demand_multiplier)

    return {
      id: l.id,
      listingType: l.listing_type,
      title: (l[titleKey] as string) || l.title_en || '',
      basePricePaise: l.base_price_paise,
      displayPricePaise: finalPrice,
      seasonLabel: seasonal.seasonLabel,
      coverPhotoUrl: l.cover_photo_url,
      locationName: l.location_name_en || '',
      locationLat: l.location_lat,
      locationLng: l.location_lng,
      isInstantBook: l.is_instant_book,
      cancellationPolicy: l.cancellation_policy,
      provider: {
        id: (l.provider_profiles as Record<string, unknown>).id,
        name: (l.provider_profiles as Record<string, unknown>).display_name,
        photo: (l.provider_profiles as Record<string, unknown>).profile_photo_url,
        rating: (l.provider_profiles as Record<string, unknown>).reputation_score,
        reviewCount: (l.provider_profiles as Record<string, unknown>).total_reviews,
        isVerified: true,
        sortBoost: (l.provider_profiles as Record<string, unknown>).sort_boost,
      },
    }
  })

  return NextResponse.json({
    success: true,
    data: listings,
    pagination: { page, limit, total: count || 0, pages: Math.ceil((count || 0) / limit) },
  })
}
