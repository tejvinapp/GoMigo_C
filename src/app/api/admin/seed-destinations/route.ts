import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

// One-time seed route — protected by SEED_SECRET env var
// Call: GET /api/admin/seed-destinations?secret=<SEED_SECRET>
export async function GET(request: NextRequest) {
  const secret = new URL(request.url).searchParams.get('secret')
  if (!secret || secret !== process.env.SEED_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const destinations = [
    {
      region_name: 'Ooty',
      slug: 'ooty',
      sub_destinations: ['Emerald Lake', 'Avalanche', 'Pykara', 'Mudumalai', 'Gudalur'],
      is_active: true,
      description_en: 'The Queen of Hill Stations in Tamil Nadu, famous for tea gardens, the Nilgiri Mountain Railway (UNESCO Heritage), Botanical Gardens, Ooty Lake, and cool misty weather year-round.',
      seo_title_en: 'Ooty — Cabs, Hotels & Tour Guides | GoMiGo',
      meta_description_en: "Book verified local cabs, budget hotels, and expert tour guides in Ooty. India's favourite hill station on GoMiGo.",
      seasonal_rules: { peak: { months: [4, 5, 6, 10, 11, 12], multiplier: 1.5 }, offpeak: { months: [1, 2, 3, 7, 8, 9], multiplier: 1.0 } },
      languages_spoken: ['en', 'ta', 'hi'],
    },
    {
      region_name: 'Coonoor',
      slug: 'coonoor',
      sub_destinations: ["Sim's Park", "Dolphin's Nose", "Lamb's Rock", 'Droog Fort', "Law's Falls"],
      is_active: true,
      description_en: "A serene hill station in the Nilgiris, known for Sim's Park, Dolphin's Nose viewpoint, stunning tea estates, and a quieter, cooler atmosphere than Ooty.",
      seo_title_en: 'Coonoor — Cabs, Hotels & Tour Guides | GoMiGo',
      meta_description_en: 'Book verified cabs, stays, and local guides in Coonoor. Explore Nilgiri tea estates with GoMiGo.',
      seasonal_rules: { peak: { months: [4, 5, 6, 10, 11, 12], multiplier: 1.3 }, offpeak: { months: [1, 2, 3, 7, 8, 9], multiplier: 1.0 } },
      languages_spoken: ['en', 'ta'],
    },
    {
      region_name: 'Kotagiri',
      slug: 'kotagiri',
      sub_destinations: ['Kodanad Viewpoint', 'Catherine Falls', 'Elk Falls', 'Rangasamy Peak'],
      is_active: true,
      description_en: 'The oldest hill station in the Nilgiris with panoramic valley views, Catherine Falls, and a quieter alternative to Ooty. Ideal for nature lovers and trekkers.',
      seo_title_en: 'Kotagiri — Cabs, Hotels & Tour Guides | GoMiGo',
      meta_description_en: 'Discover Kotagiri with GoMiGo. Book local cabs, eco-stays, and guided nature treks in the Nilgiris.',
      seasonal_rules: { peak: { months: [4, 5, 6, 11, 12], multiplier: 1.2 }, offpeak: { months: [1, 2, 3, 7, 8, 9, 10], multiplier: 1.0 } },
      languages_spoken: ['en', 'ta'],
    },
    {
      region_name: 'Kodaikanal',
      slug: 'kodaikanal',
      sub_destinations: ['Kodai Lake', 'Pillar Rocks', 'Green Valley Views', 'Bear Shola Falls', 'Berijam Lake'],
      is_active: true,
      description_en: 'The Princess of Hill Stations in the Palani Hills, Tamil Nadu. Famous for Kodai Lake, Bryant Park, star-shaped roads, Pillar Rocks, and the cool climate at 2,133m altitude.',
      seo_title_en: 'Kodaikanal — Cabs, Hotels & Tour Guides | GoMiGo',
      meta_description_en: 'Explore Kodaikanal with GoMiGo. Book verified cabs, mountain stays, and local guides in the Palani Hills.',
      seasonal_rules: { peak: { months: [4, 5, 6, 10, 11], multiplier: 1.4 }, offpeak: { months: [1, 2, 3, 7, 8, 9, 12], multiplier: 1.0 } },
      languages_spoken: ['en', 'ta', 'hi'],
    },
    {
      region_name: 'Munnar',
      slug: 'munnar',
      sub_destinations: ['Top Station', 'Eravikulam National Park', 'Mattupetty Dam', 'Chinnar', 'Devikulam'],
      is_active: true,
      description_en: "A mesmerising hill station in Kerala's Western Ghats, famous for rolling tea plantations, Eravikulam National Park (home to Nilgiri Tahr), and misty mountain views.",
      seo_title_en: 'Munnar — Cabs, Hotels & Tour Guides | GoMiGo',
      meta_description_en: "Book verified local cabs, plantation stays, and guides in Munnar. Explore God's Own Country with GoMiGo.",
      seasonal_rules: { peak: { months: [10, 11, 12, 1, 2], multiplier: 1.5 }, offpeak: { months: [3, 4, 5, 6, 7, 8, 9], multiplier: 1.0 } },
      languages_spoken: ['en', 'ml', 'hi'],
    },
    {
      region_name: 'Coorg',
      slug: 'coorg',
      sub_destinations: ['Madikeri', 'Abbey Falls', "Raja's Seat", 'Dubare Elephant Camp', 'Nagarhole'],
      is_active: true,
      description_en: "The Scotland of India — a lush coffee-growing district in Karnataka's Western Ghats, known for misty hills, Kaveri river rafting, Tibetan monasteries, and spice estates.",
      seo_title_en: 'Coorg — Cabs, Hotels & Tour Guides | GoMiGo',
      meta_description_en: 'Explore Coorg with GoMiGo. Book local cabs, coffee estate stays, and guides for Madikeri and beyond.',
      seasonal_rules: { peak: { months: [10, 11, 12, 1, 2, 3], multiplier: 1.4 }, offpeak: { months: [4, 5, 6, 7, 8, 9], multiplier: 1.0 } },
      languages_spoken: ['en', 'kn', 'hi'],
    },
    {
      region_name: 'Manali',
      slug: 'manali',
      sub_destinations: ['Solang Valley', 'Rohtang Pass', 'Old Manali', 'Naggar', 'Kullu'],
      is_active: true,
      description_en: 'A high-altitude Himalayan resort town in Himachal Pradesh, famous for snow-capped peaks, Rohtang Pass, adventure sports, and the gateway to Spiti and Lahaul valleys.',
      seo_title_en: 'Manali — Cabs, Hotels & Tour Guides | GoMiGo',
      meta_description_en: 'Book verified cabs, mountain stays, and adventure guides in Manali with GoMiGo.',
      seasonal_rules: { peak: { months: [5, 6, 7, 8, 10], multiplier: 1.6 }, offpeak: { months: [1, 2, 3, 4, 9, 11, 12], multiplier: 1.0 } },
      languages_spoken: ['en', 'hi'],
    },
    {
      region_name: 'Darjeeling',
      slug: 'darjeeling',
      sub_destinations: ['Tiger Hill', 'Batasia Loop', 'Mirik', 'Kalimpong', 'Kurseong'],
      is_active: true,
      description_en: 'The Queen of Hills in West Bengal, world-famous for Darjeeling tea, the Toy Train (UNESCO Heritage), Tiger Hill sunrise over Kangchenjunga, and colonial-era charm.',
      seo_title_en: 'Darjeeling — Cabs, Hotels & Tour Guides | GoMiGo',
      meta_description_en: 'Explore Darjeeling with GoMiGo. Book verified local cabs, heritage hotels, and guides for sunrise at Tiger Hill.',
      seasonal_rules: { peak: { months: [4, 5, 6, 10, 11], multiplier: 1.5 }, offpeak: { months: [1, 2, 3, 7, 8, 9, 12], multiplier: 1.0 } },
      languages_spoken: ['en', 'hi'],
    },
    {
      region_name: 'Mussoorie',
      slug: 'mussoorie',
      sub_destinations: ['Mall Road', 'Kempty Falls', 'Lal Tibba', 'Dhanaulti', 'Landour'],
      is_active: true,
      description_en: 'The Queen of Hills in Uttarakhand, perched in the Garhwal Himalayas with views of the Doon Valley and snow-capped peaks. Famous for Kempty Falls, Mall Road, and colonial heritage.',
      seo_title_en: 'Mussoorie — Cabs, Hotels & Tour Guides | GoMiGo',
      meta_description_en: 'Book verified cabs, hotels, and local guides in Mussoorie with GoMiGo. Explore the Queen of Hills.',
      seasonal_rules: { peak: { months: [4, 5, 6, 10, 11], multiplier: 1.5 }, offpeak: { months: [1, 2, 3, 7, 8, 9, 12], multiplier: 1.0 } },
      languages_spoken: ['en', 'hi'],
    },
    {
      region_name: 'Shimla',
      slug: 'shimla',
      sub_destinations: ['The Ridge', 'Kufri', 'Naldehra', 'Chail', 'Fagu'],
      is_active: true,
      description_en: "India's colonial summer capital in Himachal Pradesh. Known for the toy train (UNESCO), Mall Road, apple orchards, and snow-covered winters. A year-round favourite.",
      seo_title_en: 'Shimla — Cabs, Hotels & Tour Guides | GoMiGo',
      meta_description_en: 'Explore Shimla with GoMiGo. Book Kalka-Shimla toy train taxis, mountain hotels, and local guides.',
      seasonal_rules: { peak: { months: [4, 5, 6, 12, 1], multiplier: 1.5 }, offpeak: { months: [2, 3, 7, 8, 9, 10, 11], multiplier: 1.0 } },
      languages_spoken: ['en', 'hi'],
    },
  ]

  const { data, error } = await supabase
    .from('destinations')
    .upsert(destinations, { onConflict: 'slug' })
    .select('id, slug, region_name')

  if (error) {
    return NextResponse.json(
      { error: true, message: error.message, detail: error.details },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    message: `Seeded ${data?.length || 0} destinations`,
    destinations: data,
  })
}
