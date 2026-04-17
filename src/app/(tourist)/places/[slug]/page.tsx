import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MapPin, Car, Hotel, Compass, Star, ArrowRight, Shield } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'

interface Props {
  params: { slug: string }
}

interface Destination {
  id: string
  slug: string
  region_name: string
  description_en: string | null
  seo_title_en: string | null
  meta_description_en: string | null
  sub_destinations: string[] | null
}

async function getDestination(slug: string): Promise<Destination | null> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('destinations')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()
  return data as unknown as Destination | null
}

async function getListingCounts(destinationId: string) {
  const admin = createAdminClient()
  const [cabs, hotels, tours] = await Promise.all([
    admin.from('listings').select('id', { count: 'exact', head: true }).eq('destination_id', destinationId).eq('listing_type', 'cab').eq('listing_visible', true),
    admin.from('listings').select('id', { count: 'exact', head: true }).eq('destination_id', destinationId).eq('listing_type', 'hotel_room').eq('listing_visible', true),
    admin.from('listings').select('id', { count: 'exact', head: true }).eq('destination_id', destinationId).eq('listing_type', 'tour').eq('listing_visible', true),
  ])
  return { cabs: cabs.count || 0, hotels: hotels.count || 0, tours: tours.count || 0 }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const dest = await getDestination(params.slug)
  if (!dest) return { title: 'Destination Not Found' }
  return {
    title: dest.seo_title_en || `${dest.region_name} — Cabs, Hotels & Guides | GoMiGo`,
    description: dest.meta_description_en || dest.description_en || '',
  }
}

export default async function DestinationPage({ params }: Props) {
  const dest = await getDestination(params.slug)
  if (!dest) notFound()

  const counts = await getListingCounts(dest.id)

  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-br from-green-800 to-teal-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-green-300 text-sm mb-4">
            <Link href="/" className="hover:text-white">Home</Link>
            <span>→</span>
            <span>{dest.region_name}</span>
          </div>
          <h1 className="text-4xl font-bold mb-4">{dest.region_name}</h1>
          <p className="text-green-100 max-w-2xl text-lg">{dest.description_en}</p>
          <div className="flex flex-wrap gap-3 mt-6">
            {dest.sub_destinations?.map((sub: string) => (
              <Link key={sub} href={`/places/${sub.toLowerCase()}`} className="bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm hover:bg-white/20 transition-colors">
                📍 {sub}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Service cards */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Book in {dest.region_name}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Car, title: 'Cabs & Autos', count: counts.cabs, href: `/cabs/${params.slug}`, color: 'bg-blue-50 text-blue-600', desc: 'Aadhaar & permit verified drivers' },
            { icon: Hotel, title: 'Hotels & Stays', count: counts.hotels, href: `/hotels/${params.slug}`, color: 'bg-purple-50 text-purple-600', desc: 'From budget to premium' },
            { icon: Compass, title: 'Tour Guides', count: counts.tours, href: `/tours/${params.slug}`, color: 'bg-orange-50 text-orange-600', desc: 'Local experts, real experiences' },
          ].map((s) => (
            <Link key={s.title} href={s.href} className="group bg-white rounded-2xl border border-gray-200 p-6 hover:border-green-300 hover:shadow-md transition-all">
              <div className={`w-12 h-12 ${s.color} rounded-xl flex items-center justify-center mb-4`}>
                <s.icon className="w-6 h-6" />
              </div>
              <div className="text-sm font-medium text-green-600 mb-1">{s.count} available</div>
              <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-green-700">{s.title}</h3>
              <p className="text-gray-500 text-sm">{s.desc}</p>
              <div className="mt-4 flex items-center gap-1 text-green-600 text-sm font-medium">Browse <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></div>
            </Link>
          ))}
        </div>

        {/* Trust badge */}
        <div className="mt-10 bg-green-50 rounded-2xl p-6 flex items-start gap-4">
          <Shield className="w-8 h-8 text-green-600 shrink-0 mt-1" />
          <div>
            <h3 className="font-bold text-gray-900 mb-1">Every Provider is Verified</h3>
            <p className="text-gray-600 text-sm">All drivers on GoMiGo have their Aadhaar identity confirmed via Digilocker and their vehicle permit checked via Parivahan — India's government transport portal. No fake reviews — only real post-trip ratings.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
