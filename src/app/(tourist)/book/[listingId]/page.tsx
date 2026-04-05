import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { Shield, Star, ChevronRight, CheckCircle2, ArrowLeft } from 'lucide-react'
import { createClient } from '@/src/lib/supabase/server'
import { formatINR } from '@/src/lib/utils/currency'
import BookingForm from '@/src/components/BookingForm'

export const metadata: Metadata = {
  title: 'Complete Your Booking | GoMiGo',
}

interface Props {
  params: { listingId: string }
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
      is_instant_book,
      is_verified,
      cancellation_policy,
      location_name,
      gallery_urls,
      platform_fee_percent,
      provider_profiles (
        display_name,
        avatar_url,
        avg_rating,
        review_count,
        is_verified
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

export default async function BookingPage({ params }: Props) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const listing = await getListing(params.listingId)
  if (!listing) notFound()

  const provider = listing.provider_profiles as {
    display_name: string
    avatar_url: string | null
    avg_rating: number
    review_count: number
    is_verified: boolean
  } | null

  const dest = listing.destinations as { region_name: string; slug: string } | null

  const priceLabel =
    listing.listing_type === 'hotel_room' ? '/night' :
    listing.listing_type === 'tour' ? '/day' : '/trip'

  const initials = provider?.display_name
    ?.split(' ')
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?'

  const coverPhoto = (listing.gallery_urls as string[] | null)?.[0] || null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-1.5 text-sm text-gray-500">
            <Link href="/" className="hover:text-green-600 transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link
              href={`/listings/${listing.id}`}
              className="hover:text-green-600 transition-colors truncate max-w-xs"
            >
              {listing.title}
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-gray-800 font-medium">Book</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Back link */}
        <Link
          href={`/listings/${listing.id}`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-green-600 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to listing
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">Complete Your Booking</h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* ── Booking form (left 3/5) ── */}
          <div className="lg:col-span-3">
            <BookingForm
              listingId={listing.id}
              listingType={listing.listing_type as 'cab' | 'auto' | 'hotel_room' | 'tour'}
              basePricePaise={listing.base_price_paise as number}
              demandMultiplier={listing.demand_multiplier as number}
              platformFeePercent={(listing.platform_fee_percent as number) ?? 10}
              isInstantBook={listing.is_instant_book as boolean}
            />
          </div>

          {/* ── Summary card (right 2/5) ── */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 space-y-4">
              {/* Listing summary */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                {coverPhoto && (
                  <div className="h-40 bg-gray-100">
                    <img
                      src={coverPhoto}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                {!coverPhoto && (
                  <div className="h-32 bg-gradient-to-br from-green-100 to-teal-100 flex items-center justify-center text-4xl">
                    {listing.listing_type === 'hotel_room' ? '🏨' :
                     listing.listing_type === 'tour' ? '🧭' : '🚗'}
                  </div>
                )}

                <div className="p-5">
                  <h3 className="font-bold text-gray-900 leading-snug mb-1">{listing.title}</h3>
                  {dest && (
                    <p className="text-xs text-gray-500 mb-3">{dest.region_name}</p>
                  )}

                  {/* Provider row */}
                  {provider && (
                    <div className="flex items-center gap-2.5 py-3 border-y border-gray-100">
                      {provider.avatar_url ? (
                        <img
                          src={provider.avatar_url}
                          alt={provider.display_name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-xs">
                          {initials}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-medium text-gray-900 truncate">{provider.display_name}</span>
                          {provider.is_verified && (
                            <Shield className="w-3.5 h-3.5 text-green-600 shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span className="text-xs text-gray-500">
                            {(provider.avg_rating || 0).toFixed(1)} ({provider.review_count || 0})
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Price */}
                  <div className="mt-4">
                    <div className="flex items-baseline justify-between">
                      <span className="text-gray-600 text-sm">Base price</span>
                      <span className="font-bold text-gray-900">
                        {formatINR(listing.base_price_paise as number)}
                        <span className="text-xs font-normal text-gray-500 ml-1">{priceLabel}</span>
                      </span>
                    </div>
                    {(listing.demand_multiplier as number) > 1 && (
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-amber-600">Peak season</span>
                        <span className="text-xs text-amber-700 font-medium">
                          +{Math.round(((listing.demand_multiplier as number) - 1) * 100)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Security notice */}
              <div className="bg-green-50 border border-green-100 rounded-2xl p-4">
                <div className="space-y-2">
                  {[
                    'Secure payment via Razorpay',
                    'WhatsApp confirmation after booking',
                    'Instant book — no waiting',
                    'Cancellation within policy window',
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2 text-xs text-green-700">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              {/* Help */}
              <p className="text-xs text-gray-400 text-center px-2">
                Need help? WhatsApp us at{' '}
                <a
                  href="https://wa.me/918XXX000001"
                  className="text-green-600 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  +91 8XXX-000-001
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
