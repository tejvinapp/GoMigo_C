import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  Star, Shield, CheckCircle2, Car, Hotel, Compass, MapPin,
  ChevronRight, Zap,
} from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import { formatINR } from '@/lib/utils/currency'
import { applySeasonalPricing } from '@/lib/utils/seasonal'

interface Props {
  params: { id: string }
}

interface ListingDetail {
  id: string
  listing_type: string
  title_en: string | null
  description_en: string | null
  base_price_paise: number
  demand_multiplier: number
  cover_photo_url: string | null
  photo_urls: string[]
  location_name_en: string | null
  location_lat: number | null
  location_lng: number | null
  is_instant_book: boolean
  listing_visible: boolean
  cancellation_policy: string
  seasonal_rules: Record<string, unknown>
  amenities: string[]
  vehicle_type: string | null
  seat_capacity: number | null
  max_guests: number | null
}

interface ProviderProfile {
  id: string
  display_name: string
  profile_photo_url: string | null
  bio_en: string | null
  reputation_score: number
  total_reviews: number
}

interface Destination {
  region_name: string
  slug: string
}

async function getListing(id: string) {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('listings')
    .select(`
      id, listing_type,
      title_en, description_en,
      base_price_paise, demand_multiplier,
      cover_photo_url, photo_urls,
      location_name_en, location_lat, location_lng,
      is_instant_book, listing_visible, cancellation_policy,
      seasonal_rules, amenities,
      vehicle_type, seat_capacity, max_guests,
      provider_profiles (
        id, display_name, profile_photo_url, bio_en,
        reputation_score, total_reviews
      ),
      destinations (region_name, slug)
    `)
    .eq('id', id)
    .eq('listing_visible', true)
    .single()

  if (error || !data) return null
  return data
}

async function getReviews(providerId: string) {
  const admin = createAdminClient()
  const { data } = await admin
    .from('reviews')
    .select('id, rating, review_text_en, created_at, reviewer_id, users!inner(full_name)')
    .eq('provider_id', providerId)
    .eq('is_flagged', false)
    .order('created_at', { ascending: false })
    .limit(5)
  return data || []
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const listing = await getListing(params.id)
  if (!listing) return { title: 'Listing Not Found | GoMiGo' }
  const dest = listing.destinations as unknown as Destination | null
  return {
    title: `${listing.title_en || 'Listing'}${dest ? ` — ${dest.region_name}` : ''} | GoMiGo`,
    description: listing.description_en?.slice(0, 160) || '',
  }
}

export default async function ListingDetailPage({ params }: Props) {
  const listing = await getListing(params.id)
  if (!listing) notFound()

  const l = listing as unknown as ListingDetail
  const provider = (listing.provider_profiles as unknown) as ProviderProfile | null
  const dest = (listing.destinations as unknown) as Destination | null

  const seasonal = applySeasonalPricing(l.base_price_paise, l.seasonal_rules as Record<string, number>)
  const displayPrice = Math.round(seasonal.finalPaise * l.demand_multiplier)

  const priceLabel =
    l.listing_type === 'hotel_room' ? '/night' :
    l.listing_type === 'tour' ? '/day' : '/trip'

  const typeLabel =
    l.listing_type === 'hotel_room' ? 'Hotel / Stay' :
    l.listing_type === 'tour' ? 'Tour Guide' :
    l.listing_type === 'cab' ? 'Cab' : 'Auto Rickshaw'

  const typeIcon =
    l.listing_type === 'hotel_room' ? '🏨' :
    l.listing_type === 'tour' ? '🧭' : '🚗'

  const allPhotos = [l.cover_photo_url, ...(l.photo_urls || [])].filter(Boolean) as string[]
  const reviews = provider ? await getReviews(provider.id) : []

  const initials = provider?.display_name
    ?.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2) || 'P'

  const bookingHref = `/book/${l.id}`

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <nav className="flex items-center gap-1.5 text-sm text-gray-500">
            <Link href="/" className="hover:text-green-600">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            {dest && (
              <>
                <Link href={`/places/${dest.slug}`} className="hover:text-green-600">{dest.region_name}</Link>
                <ChevronRight className="w-3.5 h-3.5" />
              </>
            )}
            <span className="text-gray-800 font-medium truncate max-w-xs">{l.title_en || typeLabel}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Photo gallery */}
            {allPhotos.length > 0 ? (
              <div className="rounded-2xl overflow-hidden h-72 bg-gray-200">
                <img src={allPhotos[0]} alt={l.title_en || ''} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="rounded-2xl h-64 bg-gradient-to-br from-green-100 to-teal-100 flex items-center justify-center text-7xl">
                {typeIcon}
              </div>
            )}

            {/* Title */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full border bg-green-50 text-green-700 border-green-200">
                  {typeLabel}
                </span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full border bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1">
                  <Shield className="w-3 h-3" /> Aadhaar Verified
                </span>
                {l.is_instant_book && (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full border bg-purple-50 text-purple-700 border-purple-200 flex items-center gap-1">
                    <Zap className="w-3 h-3" /> Instant Book
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{l.title_en || typeLabel}</h1>
              {l.location_name_en && (
                <div className="flex items-center gap-1 text-gray-500 text-sm">
                  <MapPin className="w-4 h-4 text-green-500" />
                  {l.location_name_en}
                </div>
              )}
            </div>

            {/* Description */}
            {l.description_en && (
              <div className="bg-white rounded-2xl border p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-3">About This Service</h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">{l.description_en}</p>
              </div>
            )}

            {/* Details */}
            <div className="bg-white rounded-2xl border p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Details</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {l.vehicle_type && (
                  <div><span className="text-gray-500">Vehicle</span><div className="font-medium mt-0.5">{l.vehicle_type}</div></div>
                )}
                {l.seat_capacity && (
                  <div><span className="text-gray-500">Seats</span><div className="font-medium mt-0.5">{l.seat_capacity} passengers</div></div>
                )}
                {l.max_guests && (
                  <div><span className="text-gray-500">Max guests</span><div className="font-medium mt-0.5">{l.max_guests}</div></div>
                )}
                <div>
                  <span className="text-gray-500">Cancellation</span>
                  <div className="font-medium mt-0.5 capitalize">{l.cancellation_policy}</div>
                </div>
              </div>
              {l.amenities && l.amenities.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <div className="text-sm text-gray-500 mb-2">Amenities</div>
                  <div className="flex flex-wrap gap-2">
                    {l.amenities.map((a) => (
                      <span key={a} className="text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full">
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Provider */}
            {provider && (
              <div className="bg-white rounded-2xl border p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Your Provider</h2>
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-xl shrink-0">
                    {provider.profile_photo_url ? (
                      <img src={provider.profile_photo_url} alt={provider.display_name} className="w-full h-full rounded-full object-cover" />
                    ) : initials}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{provider.display_name}</div>
                    {provider.reputation_score > 0 && (
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span className="font-medium text-sm">{Number(provider.reputation_score).toFixed(1)}</span>
                        <span className="text-gray-500 text-sm">({provider.total_reviews} reviews)</span>
                      </div>
                    )}
                    <div className="flex gap-2 mt-2">
                      <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Aadhaar Verified
                      </span>
                    </div>
                    {provider.bio_en && (
                      <p className="text-gray-600 text-sm mt-3 leading-relaxed">{provider.bio_en}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Reviews */}
            {reviews.length > 0 && (
              <div className="bg-white rounded-2xl border p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Reviews</h2>
                <div className="space-y-4">
                  {reviews.map((r: Record<string, unknown>) => (
                    <div key={r.id as string} className="border-b last:border-0 pb-4 last:pb-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex">
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star key={i} className={`w-3.5 h-3.5 ${i < (r.rating as number) ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}`} />
                          ))}
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {((r.users as Record<string, unknown> | null)?.full_name as string) || 'Verified Tourist'}
                        </span>
                      </div>
                      {r.review_text_en && (
                        <p className="text-sm text-gray-600">{r.review_text_en as string}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Booking sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border shadow-sm p-6 sticky top-4">
              <div className="mb-4">
                <span className="text-3xl font-bold text-gray-900">{formatINR(displayPrice / 100)}</span>
                <span className="text-gray-500 text-sm ml-1">{priceLabel}</span>
              </div>

              {seasonal.seasonLabel !== 'Normal' && (
                <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
                  ⚡ {seasonal.seasonLabel} pricing active
                </div>
              )}

              <Link
                href={bookingHref}
                className="block w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-3.5 rounded-xl text-center transition-colors"
              >
                {l.is_instant_book ? '⚡ Book Instantly' : 'Request to Book'}
              </Link>

              <div className="mt-4 space-y-2 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-600 shrink-0" />
                  WhatsApp confirmation in minutes
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-600 shrink-0" />
                  Pay online or cash at service
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-600 shrink-0" />
                  Free cancellation available
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-green-600 shrink-0" />
                  Aadhaar-verified provider
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
