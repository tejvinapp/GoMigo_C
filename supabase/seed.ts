#!/usr/bin/env tsx
/**
 * GoMiGo Development Seed Script
 * Populates the database with realistic test data
 * Run: npm run db:seed
 */
import { createClient } from '@supabase/supabase-js'

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hj04zWl196z2-SBc0'

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// ── Name pools ────────────────────────────────────────────────────────────────
const tamilFirst = [
  'Murugan', 'Selvam', 'Rajan', 'Kumaran', 'Senthil',
  'Arjun', 'Karthik', 'Vijay', 'Suresh', 'Ramesh',
  'Ganesan', 'Palani', 'Siva', 'Vel', 'Mani',
]
const teluguFirst = [
  'Ravi', 'Suresh', 'Venkat', 'Krishna', 'Prasad',
  'Chandra', 'Satya', 'Mohan', 'Babu', 'Naresh',
]
const lastNames = [
  'Kumar', 'Raja', 'Murugan', 'Selvam', 'Nair',
  'Pillai', 'Iyer', 'Sharma', 'Reddy', 'Rao',
  'Naidu', 'Krishnan', 'Swamy', 'Yadav', 'Das',
]

const vehicleModels = [
  'Swift Dzire', 'Maruti Ertiga', 'Toyota Innova',
  'Mahindra Bolero', 'Tata Nexon', 'Honda Amaze', 'Hyundai Xcent',
]
const hotelNames = [
  'Hill View Stay', 'Nature Nest', 'Green Valley Inn',
  'Mountain Breeze', 'Tea Garden Resort', 'Misty Hills Lodge',
  'Sunset Point Hotel', 'Nilgiri Heights', 'Cloud Forest Inn', 'Valley Vista',
]
const guideSpecialties = ['nature', 'history', 'food', 'adventure', 'wellness']
const allFirst = [...tamilFirst, ...teluguFirst]

// ── Helpers ───────────────────────────────────────────────────────────────────
function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length]
}
function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}
function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function seed() {
  console.log('🌱 GoMiGo seed starting…\n')

  // ── 1. Destinations ──────────────────────────────────────────────────────
  console.log('📍 Seeding destinations…')
  const { data: destinations, error: destErr } = await supabase
    .from('destinations')
    .upsert(
      [
        {
          name: 'Ooty',
          slug: 'ooty',
          description:
            'The Queen of Hill Stations in Tamil Nadu, famous for tea gardens, Nilgiri Mountain Railway, and Botanical Gardens.',
          state: 'Tamil Nadu',
          coordinates: { lat: 11.4102, lng: 76.695 },
          is_active: true,
          seasonal_rules: {
            peak: { months: [4, 5, 6, 10, 11, 12], multiplier: 1.5 },
            offpeak: { months: [1, 2, 3, 7, 8, 9], multiplier: 1.0 },
          },
        },
        {
          name: 'Coonoor',
          slug: 'coonoor',
          description:
            "A serene hill station in the Nilgiris, known for Sim's Park, Dolphin's Nose viewpoint, and tea estates.",
          state: 'Tamil Nadu',
          coordinates: { lat: 11.353, lng: 76.7959 },
          is_active: true,
          seasonal_rules: {
            peak: { months: [4, 5, 6, 10, 11, 12], multiplier: 1.3 },
            offpeak: { months: [1, 2, 3, 7, 8, 9], multiplier: 1.0 },
          },
        },
        {
          name: 'Kotagiri',
          slug: 'kotagiri',
          description:
            'The oldest hill station in the Nilgiris, offering panoramic views and a quieter alternative to Ooty.',
          state: 'Tamil Nadu',
          coordinates: { lat: 11.428, lng: 76.8626 },
          is_active: true,
          seasonal_rules: {
            peak: { months: [4, 5, 6, 11, 12], multiplier: 1.2 },
            offpeak: { months: [1, 2, 3, 7, 8, 9, 10], multiplier: 1.0 },
          },
        },
      ],
      { onConflict: 'slug' }
    )
    .select()

  if (destErr || !destinations) {
    console.error('❌ Destinations failed:', destErr?.message)
    process.exit(1)
  }
  console.log(`✅ ${destinations.length} destinations\n`)

  // ── 2. Providers ─────────────────────────────────────────────────────────
  console.log('👥 Seeding 50 providers…')
  const providerProfiles: { id: string; destination_id: string }[] = []

  for (let i = 0; i < 50; i++) {
    const firstName = pick(allFirst, i)
    const lastName = pick(lastNames, i)
    const phone = `+91${9800000000 + i}`
    const dest = destinations[i % destinations.length]

    // Auth user
    const { data: authData, error: authErr } =
      await supabase.auth.admin.createUser({
        phone,
        phone_confirm: true,
        user_metadata: { full_name: `${firstName} ${lastName}` },
      })

    if (authErr || !authData.user) {
      // User may already exist — skip gracefully
      if (i % 10 === 0) process.stdout.write('.')
      continue
    }

    const uid = authData.user.id

    // users row
    await supabase.from('users').upsert({
      id: uid,
      full_name: `${firstName} ${lastName}`,
      phone,
      preferred_language: i % 2 === 0 ? 'ta' : 'te',
      referral_code: `${firstName.toUpperCase().slice(0, 4)}${1000 + i}`,
      consent_given_at: new Date().toISOString(),
    })

    // role
    await supabase.from('user_roles').insert({ user_id: uid, role: 'provider' })

    // provider_profile
    const tier = i < 5 ? 'pro' : i < 20 ? 'basic' : 'free'
    const { data: pp } = await supabase
      .from('provider_profiles')
      .insert({
        user_id: uid,
        destination_id: dest.id,
        business_name: `${firstName} ${pick(['Tours', 'Travels', 'Services'], i)}`,
        is_verified: i < 40,
        reputation_score: (3.5 + Math.random() * 1.5).toFixed(2),
        subscription_tier: tier,
        subscription_expires_at:
          tier !== 'free'
            ? new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
            : null,
      })
      .select('id, destination_id')
      .single()

    if (pp) providerProfiles.push(pp)

    if ((i + 1) % 10 === 0) console.log(`  ${i + 1}/50 providers done`)
    await sleep(50) // respect Supabase auth rate limits
  }
  console.log(`✅ ${providerProfiles.length} provider profiles created\n`)

  // ── 3. Listings ──────────────────────────────────────────────────────────
  if (providerProfiles.length === 0) {
    console.warn('⚠️  No provider profiles — skipping listings')
  } else {
    console.log('🏪 Seeding 200 listings…')
    const listingTypes = ['cab', 'auto', 'hotel', 'tour_guide'] as const
    let count = 0

    const listingRows = Array.from({ length: 200 }, (_, i) => {
      const provider = pick(providerProfiles, i)
      const type = listingTypes[i % listingTypes.length]

      let title = '',
        pricePaise = 0,
        currencyUnit = '',
        description = ''

      switch (type) {
        case 'cab': {
          const model = pick(vehicleModels, i)
          title = `${model} – Local Sightseeing`
          pricePaise = rand(1500, 3000) // ₹15–30 / km
          currencyUnit = 'per_km'
          description = `Comfortable ${model} for sightseeing. AC available. Experienced driver.`
          break
        }
        case 'auto':
          title = 'Auto Rickshaw – Local Travel'
          pricePaise = rand(800, 1500) // ₹8–15 / km
          currencyUnit = 'per_km'
          description = 'Affordable auto rickshaw for short distances in the hill station.'
          break
        case 'hotel':
          title = pick(hotelNames, i)
          pricePaise = rand(200000, 1500000) // ₹2000–15000 / night
          currencyUnit = 'per_night'
          description = 'Comfortable stay with mountain views. Includes breakfast. Free WiFi.'
          break
        case 'tour_guide': {
          const spec = pick(guideSpecialties, i)
          title = `${spec.charAt(0).toUpperCase() + spec.slice(1)} Tour Guide`
          pricePaise = rand(80000, 200000) // ₹800–2000 / day
          currencyUnit = 'per_day'
          description = `Expert local guide specialising in ${spec}. Available in English, Tamil & Hindi.`
          break
        }
      }

      return {
        provider_id: provider.id,
        destination_id: provider.destination_id,
        listing_type: type,
        title,
        description,
        price_paise: pricePaise,
        currency_unit: currencyUnit,
        demand_multiplier: 1.0,
        languages_spoken: ['en', 'ta'],
        is_active: true,
      }
    })

    // Insert in batches of 50
    for (let b = 0; b < listingRows.length; b += 50) {
      const batch = listingRows.slice(b, b + 50)
      const { error } = await supabase.from('listings').insert(batch)
      if (error) console.warn(`  batch ${b / 50 + 1} warn:`, error.message)
      count += batch.length
      console.log(`  ${count}/200 listings inserted`)
    }
    console.log(`✅ ${count} listings created\n`)
  }

  // ── 4. Feature flags ──────────────────────────────────────────────────────
  console.log('🚩 Ensuring feature flags…')
  await supabase.from('feature_flags').upsert(
    [
      { name: 'ai_itinerary', is_enabled: true, description: 'AI trip planner' },
      { name: 'byoai', is_enabled: true, description: 'Bring Your Own AI Key' },
      { name: 'driver_tracking', is_enabled: false, description: 'Real-time driver location' },
      { name: 'referral_rewards', is_enabled: true, description: 'Referral programme' },
      { name: 'dynamic_pricing', is_enabled: true, description: 'Seasonal demand multiplier' },
      { name: 'whatsapp_otp', is_enabled: true, description: 'OTP via WhatsApp' },
      { name: 'hotel_reviews', is_enabled: true, description: 'Review system for hotels' },
      { name: 'guide_booking', is_enabled: true, description: 'Tour guide booking' },
    ],
    { onConflict: 'name' }
  )
  console.log('✅ Feature flags ready\n')

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log('─────────────────────────────────')
  console.log('✅ GoMiGo seed complete!')
  console.log(`   Destinations : 3 (Ooty, Coonoor, Kotagiri)`)
  console.log(`   Providers    : ${providerProfiles.length}`)
  console.log(`   Listings     : up to 200`)
  console.log(`   Feature flags: 8`)
  console.log('─────────────────────────────────')
  console.log('\nNext steps:')
  console.log('  npm run dev          → start dev server')
  console.log('  npx supabase studio  → browse data')
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
