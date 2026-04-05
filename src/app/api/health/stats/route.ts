import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 300 // 5 minutes

export async function GET() {
  try {
    const { createClient } = await import('@supabase/supabase-js')

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return NextResponse.json({ totalProviders: 23, totalDrivers: 15, totalHotels: 5, totalGuides: 3 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const [driversRes, hotelsRes, guidesRes] = await Promise.allSettled([
      supabase
        .from('provider_profiles')
        .select('id', { count: 'exact', head: true })
        .eq('listing_visible', true),
      supabase
        .from('listings')
        .select('id', { count: 'exact', head: true })
        .eq('listing_type', 'hotel_room')
        .eq('listing_visible', true),
      supabase
        .from('listings')
        .select('id', { count: 'exact', head: true })
        .eq('listing_type', 'tour')
        .eq('listing_visible', true),
    ])

    const totalProviders = driversRes.status === 'fulfilled' ? (driversRes.value.count || 0) : 23
    const totalHotels = hotelsRes.status === 'fulfilled' ? (hotelsRes.value.count || 0) : 5
    const totalGuides = guidesRes.status === 'fulfilled' ? (guidesRes.value.count || 0) : 3
    const totalDrivers = Math.max(0, totalProviders - totalHotels - totalGuides)

    return NextResponse.json({ totalProviders, totalDrivers, totalHotels, totalGuides })
  } catch {
    return NextResponse.json({ totalProviders: 23, totalDrivers: 15, totalHotels: 5, totalGuides: 3 })
  }
}
