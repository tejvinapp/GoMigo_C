import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { formatINR } from '@/lib/utils/currency'
import { PlusCircle, Eye, EyeOff, Star, MapPin } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ProviderListingsPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('provider_profiles')
    .select('id, display_name')
    .eq('user_id', user.id)
    .single()

  if (!profile) redirect('/')

  const { data: listings } = await admin
    .from('listings')
    .select(`
      id, listing_type, title_en, base_price_paise, listing_visible,
      cover_photo_url, location_name_en, booking_count,
      destinations (region_name)
    `)
    .eq('provider_id', profile.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  const typeMap: Record<string, string> = {
    cab: 'Cab',
    auto: 'Auto',
    hotel_room: 'Hotel / Stay',
    tour: 'Tour Guide',
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Listings</h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage your services on GoMiGo</p>
        </div>
        <Link
          href="/provider/listings/new"
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          New Listing
        </Link>
      </div>

      {!listings || listings.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 py-20 text-center">
          <div className="text-5xl mb-4">🏕️</div>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">No listings yet</h2>
          <p className="text-gray-500 text-sm mb-6">
            Start by adding your first service — cabs, hotels, auto, or tour guide.
          </p>
          <Link
            href="/provider/listings/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            Add Your First Listing
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {listings.map((l) => {
            const dest = l.destinations as unknown as { region_name: string } | null
            return (
              <div key={l.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative h-36 bg-gray-100">
                  {l.cover_photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={l.cover_photo_url}
                      alt={l.title_en || ''}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">
                      {l.listing_type === 'hotel_room' ? '🏨' : l.listing_type === 'tour' ? '🧭' : '🚗'}
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <span
                      className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                        l.listing_visible
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {l.listing_visible ? (
                        <Eye className="w-3 h-3" />
                      ) : (
                        <EyeOff className="w-3 h-3" />
                      )}
                      {l.listing_visible ? 'Live' : 'Hidden'}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                      {typeMap[l.listing_type] || l.listing_type}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">
                    {l.title_en || 'Untitled'}
                  </h3>
                  {(l.location_name_en || dest?.region_name) && (
                    <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                      <MapPin className="w-3 h-3" />
                      {l.location_name_en || dest?.region_name}
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-sm font-bold text-gray-900">
                      {formatINR(l.base_price_paise / 100)}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      {l.booking_count} bookings
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
