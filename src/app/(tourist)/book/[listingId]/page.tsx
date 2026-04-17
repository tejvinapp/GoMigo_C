import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { Shield, Star, ChevronRight, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { formatINR } from '@/lib/utils/currency'
import { applySeasonalPricing } from '@/lib/utils/seasonal'
import BookingForm from '@/components/BookingForm'

export const metadata: Metadata = {
  title: 'Complete Your Booking | GoMiGo',
}

interface Props {
  params: { listingId: string }
}

interface ListingRow {
  id: string
  listing_type: string
  title_en: string | null
  description_en: string | null
  base_price_paise: number
  demand_multiplier: number
  platform_fee_percent: number
  is_instant_book: boolean
  cancellation_policy: string
  location_name_en: string | null
  cover_photo_url: string | null
  seasonal_rules: Record<string, number>
}

interface ProviderRow {
  display_name: string
  profile_photo_url: string | null
  reputation_score: number
  total_reviews: number
}

interface DestRow {
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
      base_price_paise, demand_multiplier, platform_fee_percent,
      is_instant_book, cancellation_policy,
      location_name_en, cover_photo_url, seasonal_rules,
      provider_profiles (
        display_name, profile_photo_url, reputation_score, total_reviews
      ),
      destinations (region_name, slug)
    `)
    .eq('id', id)
    .eq('listing_visible', true)
    .single()
  if (error || !data) return null
  return data
}

export default async function BookingPage({ params }: Props) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?redirect=/book/${params.listingId}`)

  const listing = await getListing(params.listingId)
  if (!listing) notFound()

  const l = listing as unknown as ListingRow
  const provider = (listing.provider_profiles as unknown) as ProviderRow | null
  const dest = (listing.destinations as unknown) as DestRow | null

  const seasonal = applySeasonalPricing(l.base_price_paise, l.seasonal_rules)
  const displayPrice = Math.round(seasonal.finalPaise * l.demand_multiplier)

  const priceLabel =
    l.listing_type === 'hotel_room' ? '/night' :
    l.listing_type === 'tour' ? '/day' : '/trip'

  const typeMap: Record<string, 'cab' | 'auto' | 'hotel' | 'guide'> = {
    cab: 'cab',
    auto: 'auto',
    hotel_room: 'hotel',
    tour: 'guide',
  }
  const bookingType = typeMap[l.listing_type] || 'cab'

  const initials = provider?.display_name
    ?.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2) || 'P'

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
            <Link href={`/listings/${l.id}`} className="hover:text-green-600">{l.title_en || 'Listing'}</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-gray-800 font-medium">Book</span>
          </nav>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Booking form */}
          <div className="lg:col-span-2">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Complete Your Booking</h1>
            <BookingForm
              listingId={l.id}
              listingType={bookingType}
              basePricePaise={displayPrice}
            />
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border shadow-sm p-6 sticky top-4">
              <h2 className="font-semibold text-gray-900 mb-4">Order Summary</h2>

              {/* Listing preview */}
              <div className="flex gap-3 mb-4">
                <div className="w-16 h-16 rounded-xl bg-green-50 flex items-center justify-center text-2xl shrink-0 overflow-hidden">
                  {l.cover_photo_url ? (
                    <img src={l.cover_photo_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    l.listing_type === 'hotel_room' ? '🏨' :
                    l.listing_type === 'tour' ? '🧭' : '🚗'
                  )}
                </div>
                <div>
                  <div className="font-medium text-gray-900 text-sm line-clamp-2">
                    {l.title_en || 'Service'}
                  </div>
                  {l.location_name_en && (
                    <div className="text-xs text-gray-500 mt-0.5">{l.location_name_en}</div>
                  )}
                </div>
              </div>

              {/* Provider */}
              {provider && (
                <div className="flex items-center gap-3 mb-4 pb-4 border-b">
                  <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-sm shrink-0 overflow-hidden">
                    {provider.profile_photo_url ? (
                      <img src={provider.profile_photo_url} alt="" className="w-full h-full object-cover rounded-full" />
                    ) : initials}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{provider.display_name}</div>
                    {provider.reputation_score > 0 && (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        {Number(provider.reputation_score).toFixed(1)} · {provider.total_reviews} reviews
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Price breakdown */}
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between text-gray-600">
                  <span>Base price</span>
                  <span>{formatINR(l.base_price_paise / 100)}{priceLabel}</span>
                </div>
                {l.demand_multiplier > 1 && (
                  <div className="flex justify-between text-amber-600">
                    <span>Season multiplier</span>
                    <span>×{l.demand_multiplier.toFixed(1)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-gray-900 pt-2 border-t">
                  <span>Total</span>
                  <span>{formatINR(displayPrice / 100)}{priceLabel}</span>
                </div>
              </div>

              {/* Trust */}
              <div className="space-y-1.5 text-xs text-gray-500">
                {[
                  'Aadhaar-verified provider',
                  'WhatsApp confirmation',
                  'Secure payment via Razorpay',
                  'Free cancellation available',
                ].map((t) => (
                  <div key={t} className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                    {t}
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
