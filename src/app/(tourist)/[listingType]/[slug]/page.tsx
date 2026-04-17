import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Star, MapPin, Zap, Clock, Users, ChevronRight } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import { formatINR } from '@/lib/utils/currency'

interface Props {
  params: { listingType: string; slug: string }
}

// Map URL segment → DB listing_type
const TYPE_MAP: Record<string, string> = {
  cabs: 'cab',
  hotels: 'hotel_room',
  tours: 'tour',
  auto: 'auto',
}

const TYPE_LABELS: Record<string, { singular: string; plural: string; icon: string }> = {
  cabs:   { singular: 'Cab',        plural: 'Cabs',        icon: '🚗' },
  hotels: { singular: 'Hotel',      plural: 'Hotels',      icon: '🏨' },
  tours:  { singular: 'Tour Guide', plural: 'Tour Guides', icon: '🧭' },
  auto:   { singular: 'Auto',       plural: 'Autos',       icon: '🛺' },
}

interface ListingRow {
  id: string
  listing_type: string
  title_en: string | null
  base_price_paise: number
  demand_multiplier: number
  cover_photo_url: string | null
  location_name_en: string | null
  is_instant_book: boolean
  cancellation_policy: string
  provider_profiles: {
    id: string
    display_name: string
    profile_photo_url: string | null
    reputation_score: number
    total_reviews: number
  } | null
  destinations: {
    slug: string
    region_name: string
  } | null
}

async function getListings(dbType: string, destinationSlug: string) {
  const admin = createAdminClient()

  // First, resolve the destination by slug
  // Also handle sub-destinations (e.g., /cabs/ooty where ooty is a sub-destination of nilgiris)
  let { data: dest } = await admin
    .from('destinations')
    .select('id, region_name, slug, sub_destinations')
    .eq('slug', destinationSlug)
    .eq('is_active', true)
    .maybeSingle()

  // If not found by direct slug, search sub_destinations array
  if (!dest) {
    const { data: allDests } = await admin
      .from('destinations')
      .select('id, region_name, slug, sub_destinations')
      .eq('is_active', true)
    dest = allDests?.find((d) =>
      (d.sub_destinations as string[] || []).some(
        (s) => s.toLowerCase() === destinationSlug.toLowerCase()
      )
    ) || allDests?.[0] || null
  }

  if (!dest) return { listings: [], destination: null }

  const { data, error } = await admin
    .from('listings')
    .select(`
      id, listing_type,
      title_en, base_price_paise, demand_multiplier,
      cover_photo_url, location_name_en,
      is_instant_book, cancellation_policy,
      provider_profiles (
        id, display_name, profile_photo_url, reputation_score, total_reviews
      ),
      destinations (slug, region_name)
    `)
    .eq('listing_visible', true)
    .eq('listing_type', dbType)
    .is('deleted_at', null)
    .limit(30)

  if (error) return { listings: [], destination: dest }

  return { listings: (data || []) as unknown as ListingRow[], destination: dest }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const label = TYPE_LABELS[params.listingType]
  if (!label) return { title: 'Not Found' }
  const dest = params.slug.charAt(0).toUpperCase() + params.slug.slice(1)
  return {
    title: `${label.plural} in ${dest} | GoMiGo`,
    description: `Book verified ${label.plural.toLowerCase()} in ${dest}. Aadhaar-verified local providers. Instant WhatsApp confirmation.`,
  }
}

export default async function ListingTypePage({ params }: Props) {
  const dbType = TYPE_MAP[params.listingType]
  if (!dbType) return notFound()

  const label = TYPE_LABELS[params.listingType]
  const { listings, destination } = await getListings(dbType, params.slug)

  const destName = destination?.region_name ||
    params.slug.charAt(0).toUpperCase() + params.slug.slice(1)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link href="/" className="hover:text-green-700">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href={`/places/${params.slug}`} className="hover:text-green-700">{destName}</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-800">{label.plural}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {label.icon} {label.plural} in {destName}
          </h1>
          <p className="text-gray-500 mt-1">
            {listings.length > 0
              ? `${listings.length} verified ${label.plural.toLowerCase()} available`
              : `No ${label.plural.toLowerCase()} listed yet — check back soon!`}
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {listings.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">{label.icon}</div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              No {label.plural} Listed Yet
            </h2>
            <p className="text-gray-500 mb-6">
              We&apos;re onboarding verified {label.plural.toLowerCase()} in {destName}.
              Check back soon or list your service.
            </p>
            <div className="flex gap-3 justify-center">
              <Link
                href="/provider/register"
                className="bg-green-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-800 transition-colors"
              >
                List Your {label.singular}
              </Link>
              <Link
                href="/"
                className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Back to Home
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <Link
                key={listing.id}
                href={`/listings/${listing.id}`}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group"
              >
                {/* Cover photo */}
                <div className="h-48 bg-gradient-to-br from-green-100 to-green-50 relative">
                  {listing.cover_photo_url ? (
                    <img
                      src={listing.cover_photo_url}
                      alt={listing.title_en || ''}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl">
                      {label.icon}
                    </div>
                  )}
                  {listing.is_instant_book && (
                    <span className="absolute top-2 left-2 bg-green-700 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Zap className="w-3 h-3" /> Instant
                    </span>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 group-hover:text-green-700 transition-colors line-clamp-1">
                    {listing.title_en || `${label.singular} in ${destName}`}
                  </h3>

                  {listing.location_name_en && (
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" />
                      {listing.location_name_en}
                    </p>
                  )}

                  {listing.provider_profiles && (
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-xs font-bold text-green-700">
                        {listing.provider_profiles.display_name?.charAt(0) || 'P'}
                      </div>
                      <span className="text-sm text-gray-600">
                        {listing.provider_profiles.display_name}
                      </span>
                      {listing.provider_profiles.reputation_score > 0 && (
                        <span className="text-sm text-amber-600 flex items-center gap-0.5 ml-auto">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          {Number(listing.provider_profiles.reputation_score).toFixed(1)}
                          <span className="text-gray-400">({listing.provider_profiles.total_reviews})</span>
                        </span>
                      )}
                    </div>
                  )}

                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <span className="text-lg font-bold text-gray-900">
                        {formatINR(Math.round(listing.base_price_paise * listing.demand_multiplier / 100))}
                      </span>
                      <span className="text-sm text-gray-500">
                        {params.listingType === 'hotels' ? '/night' : '/trip'}
                      </span>
                    </div>
                    <span className="text-sm text-green-700 font-medium group-hover:underline">
                      View →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* CTA for providers */}
        <div className="mt-12 bg-green-50 rounded-xl p-6 text-center border border-green-100">
          <h3 className="font-semibold text-gray-900 mb-1">
            Are you a local {label.singular.toLowerCase()} in {destName}?
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            List free for 60 days. No credit card needed.
          </p>
          <Link
            href="/provider/register"
            className="inline-block bg-green-700 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-green-800 transition-colors"
          >
            List Your {label.singular} Free →
          </Link>
        </div>
      </div>
    </div>
  )
}
