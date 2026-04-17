import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import {
  Star, Shield, CheckCircle2, Car, Hotel, Compass, MapPin,
  Languages, TrendingUp, ChevronRight, Clock, Users, Calendar,
  ArrowRight,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { formatINR } from '@/lib/utils/currency'
import { format } from 'date-fns'

const ListingMap = dynamic(() => import('@/components/ListingMap'), { ssr: false })

interface Props {
  params: { id: string }
}

async function getListing(id: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('listings')
    .select(`
      id,
      listing_type,
      title,
      description,
      base_price_paise,
      demand_multiplier,
      languages_spoken,
      location_lat,
      location_lng,
      location_name,
      gallery_urls,
      is_verified,
      is_instant_book,
      cancellation_policy,
      seasonal_rules,
      destination_id,
      provider_id,
      provider_profiles (
        id,
        display_name,
        avatar_url,
        bio,
        avg_rating,
        review_count,
        is_verified,
        aadhaar_verified,
        vehicle_permit_verified
      ),
      destinations (
        region_name,
        slug
      )
    `)
    .eq('id', id)
    .eq('listing_visible', true)
    .single()

  if (error || !data) return null
  return data
}

async function getReviews(listingId: string) {
  const supabase = createClient()
  const { data } = await supabase
    .from('reviews')
    .select('id, rating, comment, created_at, tourist_name, tourist_avatar_url')
    .eq('listing_id', listingId)
    .order('created_at', { ascending: false })
    .limit(5)
  return data || []
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const listing = await getListing(params.id)
  if (!listing) return { title: 'Listing Not Found | GoMiGo' }
  const dest = listing.destinations as { region_name: string } | null
  return {
    title: `${listing.title}${dest ? ` — ${dest.region_name}` : ''} | GoMiGo`,
    description: listing.description?.slice(0, 160) || '',
  }
}

function StarDisplay({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) {
  const stars = Array.from({ length: 5 }, (_, i) => {
    const filled = i + 1 <= Math.floor(rating)
    const partial = !filled && i < rating
    return { filled, partial }
  })
  const cls = size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'
  return (
    <div className="flex items-center gap-0.5">
      {stars.map((s, i) => (
        <Star
          key={i}
          className={`${cls} ${s.filled ? 'fill-amber-400 text-amber-400' : s.partial ? 'fill-amber-200 text-amber-400' : 'fill-gray-200 text-gray-300'}`}
        />
      ))}
    </div>
  )
}

function ServiceTypeBadge({ type }: { type: string }) {
  const map: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    cab: { label: 'Cab', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: <Car className="w-3.5 h-3.5" /> },
    auto: { label: 'Auto Rickshaw', color: 'bg-yellow-50 text-yellow-700 border-yellow-200', icon: <Car className="w-3.5 h-3.5" /> },
    hotel_room: { label: 'Hotel / Stay', color: 'bg-purple-50 text-purple-700 border-purple-200', icon: <Hotel className="w-3.5 h-3.5" /> },
    tour: { label: 'Tour Guide', color: 'bg-orange-50 text-orange-700 border-orange-200', icon: <Compass className="w-3.5 h-3.5" /> },
  }
  const config = map[type] || { label: type, color: 'bg-gray-50 text-gray-700 border-gray-200', icon: null }
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${config.color}`}>
      {config.icon}
      {config.label}
    </span>
  )
}

export default async function ListingDetailPage({ params }: Props) {
  const [listing, reviews] = await Promise.all([
    getListing(params.id),
    getReviews(params.id),
  ])

  if (!listing) notFound()

  const provider = listing.provider_profiles as {
    display_name: string
    avatar_url: string | null
    bio: string | null
    avg_rating: number
    review_count: number
    is_verified: boolean
    aadhaar_verified: boolean
    vehicle_permit_verified: boolean
  } | null

  const dest = listing.destinations as { region_name: string; slug: string } | null

  const priceLabel =
    listing.listing_type === 'hotel_room' ? '/night' :
    listing.listing_type === 'tour' ? '/day' :
    '/trip'

  const galleryUrls: string[] = (listing.gallery_urls as string[] | null)?.slice(0, 5) || []

  const hasDemandSurge = (listing.demand_multiplier as number) > 1

  const initials = provider?.display_name
    ?.split(' ')
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '??'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-1.5 text-sm text-gray-500">
            <Link href="/" className="hover:text-green-600 transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            {dest && (
              <>
                <Link href={`/places/${dest.slug}`} className="hover:text-green-600 transition-colors">{dest.region_name}</Link>
                <ChevronRight className="w-3.5 h-3.5" />
              </>
            )}
            <span className="text-gray-800 font-medium truncate max-w-xs">{listing.title}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Left / Main column ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Gallery */}
            {galleryUrls.length > 0 ? (
              <div className="rounded-2xl overflow-hidden bg-gray-200">
                <div className="grid grid-cols-4 grid-rows-2 gap-1.5 h-80">
                  <div className="col-span-2 row-span-2">
                    <img
                      src={galleryUrls[0]}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {galleryUrls.slice(1, 5).map((url, i) => (
                    <div key={i} className="col-span-1 row-span-1 relative">
                      <img
                        src={url}
                        alt={`${listing.title} photo ${i + 2}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl h-64 bg-gradient-to-br from-green-100 to-teal-100 flex items-center justify-center">
                <div className="text-6xl">
                  {listing.listing_type === 'hotel_room' ? '🏨' :
                   listing.listing_type === 'tour' ? '🧭' : '🚗'}
                </div>
              </div>
            )}

            {/* Title & type */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <ServiceTypeBadge type={listing.listing_type} />
                {listing.is_verified && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
                    <Shield className="w-3.5 h-3.5" /> Verified
                  </span>
                )}
                {listing.is_instant_book && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Instant Book
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{listing.title}</h1>
              {dest && (
                <div className="flex items-center gap-1 text-gray-500 text-sm">
                  <MapPin className="w-4 h-4 text-green-500" />
                  <span>{listing.location_name || dest.region_name}</span>
                </div>
              )}
            </div>

            {/* Seasonal pricing notice */}
            {hasDemandSurge && (
              <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
                <TrendingUp className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-800">Peak Season Pricing Active</p>
                  <p className="text-xs text-amber-700 mt-0.5">
                    Current demand multiplier: {(listing.demand_multiplier as number).toFixed(1)}x. Prices are higher during this season.
                    Book early to secure your spot.
                  </p>
                </div>
              </div>
            )}

            {/* Description */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-3">About This Service</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">{listing.description}</p>
            </div>

            {/* Service details */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Service Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                    <Car className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Service Type</p>
                    <p className="text-sm font-semibold text-gray-900 capitalize">
                      {listing.listing_type === 'hotel_room' ? 'Hotel / Stay' :
                       listing.listing_type === 'tour' ? 'Tour Guide' :
                       listing.listing_type}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                    <span className="text-lg font-bold text-green-600">₹</span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Base Price</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatINR(listing.base_price_paise as number)}
                      <span className="text-xs font-normal text-gray-500 ml-1">{priceLabel}</span>
                    </p>
                  </div>
                </div>

                {(listing.languages_spoken as string[] | null)?.length ? (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                      <Languages className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Languages Spoken</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {(listing.languages_spoken as string[]).join(', ')}
                      </p>
                    </div>
                  </div>
                ) : null}

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                    <Clock className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Cancellation</p>
                    <p className="text-sm font-semibold text-gray-900 capitalize">
                      {listing.cancellation_policy || 'Flexible'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Provider profile */}
            {provider && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Your Provider</h2>
                <div className="flex items-start gap-4">
                  {provider.avatar_url ? (
                    <img
                      src={provider.avatar_url}
                      alt={provider.display_name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-green-100 shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-xl shrink-0 border-2 border-green-200">
                      {initials}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold text-gray-900">{provider.display_name}</h3>
                      {provider.is_verified && (
                        <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full font-medium">
                          <Shield className="w-3 h-3" /> Verified
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <StarDisplay rating={provider.avg_rating || 0} />
                      <span className="text-sm font-semibold text-gray-900">
                        {(provider.avg_rating || 0).toFixed(1)}
                      </span>
                      <span className="text-sm text-gray-500">
                        ({provider.review_count || 0} reviews)
                      </span>
                    </div>
                    {provider.bio && (
                      <p className="text-sm text-gray-600 mt-2 leading-relaxed">{provider.bio}</p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {provider.aadhaar_verified && (
                        <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-medium">
                          Aadhaar Verified
                        </span>
                      )}
                      {provider.vehicle_permit_verified && (
                        <span className="text-xs bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full font-medium">
                          Permit Verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Map */}
            {listing.location_lat && listing.location_lng && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Location</h2>
                <div className="rounded-xl overflow-hidden h-64 border border-gray-100">
                  <ListingMap
                    lat={listing.location_lat as number}
                    lng={listing.location_lng as number}
                    title={listing.title}
                  />
                </div>
                {listing.location_name && (
                  <div className="flex items-center gap-2 mt-3 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 text-green-500" />
                    {listing.location_name}
                  </div>
                )}
              </div>
            )}

            {/* Reviews */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-gray-900">Guest Reviews</h2>
                {provider && (
                  <div className="flex items-center gap-2">
                    <StarDisplay rating={provider.avg_rating || 0} size="lg" />
                    <span className="text-xl font-bold text-gray-900">{(provider.avg_rating || 0).toFixed(1)}</span>
                    <span className="text-sm text-gray-500">/ 5</span>
                  </div>
                )}
              </div>

              {reviews.length === 0 ? (
                <div className="text-center py-8">
                  <Star className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No reviews yet — be the first to review after your trip!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                      <div className="flex items-start gap-3">
                        {review.tourist_avatar_url ? (
                          <img
                            src={review.tourist_avatar_url}
                            alt={review.tourist_name || 'Tourist'}
                            className="w-9 h-9 rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-medium text-sm shrink-0">
                            {(review.tourist_name || 'T')[0].toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-semibold text-gray-900">
                              {review.tourist_name || 'Anonymous Tourist'}
                            </span>
                            <span className="text-xs text-gray-400 shrink-0">
                              {format(new Date(review.created_at), 'MMM d, yyyy')}
                            </span>
                          </div>
                          <StarDisplay rating={review.rating} />
                          {review.comment && (
                            <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">{review.comment}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Right / Sticky sidebar ── */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              {/* Pricing card */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <div className="mb-4">
                  <div className="text-3xl font-bold text-gray-900">
                    {formatINR(listing.base_price_paise as number)}
                    <span className="text-base font-normal text-gray-500 ml-1">{priceLabel}</span>
                  </div>
                  {hasDemandSurge && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-amber-600 font-medium">
                      <TrendingUp className="w-3.5 h-3.5" />
                      Peak season +{Math.round(((listing.demand_multiplier as number) - 1) * 100)}%
                    </div>
                  )}
                </div>

                <div className="space-y-3 mb-5 text-sm">
                  {provider && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Rating</span>
                      <div className="flex items-center gap-1.5">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span className="font-semibold text-gray-900">
                          {(provider.avg_rating || 0).toFixed(1)}
                        </span>
                        <span className="text-gray-400">({provider.review_count || 0})</span>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Cancellation</span>
                    <span className="font-medium text-gray-900 capitalize">{listing.cancellation_policy || 'Flexible'}</span>
                  </div>
                  {listing.is_instant_book && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Booking</span>
                      <span className="font-medium text-green-700">Instant Confirm</span>
                    </div>
                  )}
                </div>

                <Link
                  href={`/book/${listing.id}`}
                  className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3.5 rounded-xl transition-colors text-base"
                >
                  Book Now <ArrowRight className="w-4 h-4" />
                </Link>

                <p className="text-xs text-gray-400 text-center mt-3">
                  You won't be charged yet · WhatsApp confirmation sent
                </p>
              </div>

              {/* Verification card */}
              {provider && (
                <div className="bg-green-50 border border-green-100 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-semibold text-green-800">Verified Provider</span>
                  </div>
                  <div className="space-y-2">
                    {provider.aadhaar_verified && (
                      <div className="flex items-center gap-2 text-xs text-green-700">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Identity verified via Aadhaar / Digilocker
                      </div>
                    )}
                    {provider.vehicle_permit_verified && (
                      <div className="flex items-center gap-2 text-xs text-green-700">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Vehicle permit checked via Parivahan
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs text-green-700">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Reviews only from completed trips
                    </div>
                  </div>
                </div>
              )}

              {/* Contact notice */}
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-xs text-blue-800">
                <strong>First booking?</strong> Our team will personally call you to make sure your trip goes perfectly.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
