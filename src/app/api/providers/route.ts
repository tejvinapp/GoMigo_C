import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { AppError } from '@/lib/errors/AppError'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const CreateProviderSchema = z.object({
  display_name: z.string().min(2).max(100),
  bio_en: z.string().max(500).optional(),
  destination_id: z.string().uuid(),
  provider_type: z.enum(['cab', 'auto', 'hotel', 'guide']),
  phone: z.string().regex(/^\+?[0-9]{10,15}$/).optional(),
  languages_spoken: z.array(z.string()).optional(),
})

// GET /api/providers?destination_id=xxx&type=cab
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const destinationId = searchParams.get('destination_id')
  const providerType = searchParams.get('type')
  const countOnly = searchParams.get('count') === 'true'
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const limit = Math.min(50, parseInt(searchParams.get('limit') || '20'))
  const offset = (page - 1) * limit

  const admin = createAdminClient()

  if (countOnly) {
    // Return count only (for landing page stats)
    let countQuery = admin
      .from('provider_profiles')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true)
      .eq('is_verified', true)

    if (destinationId) countQuery = countQuery.eq('destination_id', destinationId)
    if (providerType) countQuery = countQuery.eq('provider_type', providerType)

    const { count, error } = await countQuery
    if (error) {
      return NextResponse.json({ error: true, message: 'Failed to fetch count' }, { status: 500 })
    }
    return NextResponse.json({ success: true, count: count ?? 0 })
  }

  // Full provider list for search
  let query = admin
    .from('provider_profiles')
    .select(
      `
        id, display_name, provider_type, profile_photo_url,
        reputation_score, total_reviews, sort_boost,
        destination_id, is_verified, is_active,
        destinations (id, name, slug)
      `,
      { count: 'exact' }
    )
    .eq('is_active', true)
    .eq('is_verified', true)
    .order('sort_boost', { ascending: false })
    .order('reputation_score', { ascending: false })
    .range(offset, offset + limit - 1)

  if (destinationId) query = query.eq('destination_id', destinationId)
  if (providerType) query = query.eq('provider_type', providerType)

  const { data, count, error } = await query

  if (error) {
    return NextResponse.json(
      { error: true, message: 'Failed to fetch providers' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    data: data || [],
    total: count ?? 0,
    page,
    limit,
  })
}

// POST /api/providers — create provider profile for authenticated user
export async function POST(request: NextRequest) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      new AppError('ERR_AUTH_SESSION_EXPIRED').toUserResponse(),
      { status: 401 }
    )
  }

  const admin = createAdminClient()

  // Check user doesn't already have a profile
  const { data: existingProfile } = await admin
    .from('provider_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (existingProfile) {
    return NextResponse.json(
      { error: true, message: 'You already have a provider profile' },
      { status: 409 }
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: true, message: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = CreateProviderSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: true, message: 'Invalid request', issues: parsed.error.issues },
      { status: 400 }
    )
  }

  const {
    display_name,
    bio_en,
    destination_id,
    provider_type,
    phone,
    languages_spoken,
  } = parsed.data

  // Verify destination exists and is active
  const { data: destination } = await admin
    .from('destinations')
    .select('id, is_active')
    .eq('id', destination_id)
    .single()

  if (!destination) {
    return NextResponse.json(
      { error: true, message: 'Destination not found' },
      { status: 404 }
    )
  }

  // Create provider profile
  const { data: profile, error: insertError } = await admin
    .from('provider_profiles')
    .insert({
      user_id: user.id,
      display_name,
      bio_en: bio_en ?? null,
      destination_id,
      provider_type,
      phone: phone ?? null,
      languages_spoken: languages_spoken ?? ['en'],
      is_active: true,
      is_verified: false,
      reputation_score: 0,
      total_reviews: 0,
      sort_boost: 0,
      subscription_tier: 'free',
      created_at: new Date().toISOString(),
    })
    .select('id, display_name, provider_type, destination_id, is_verified, subscription_tier')
    .single()

  if (insertError) {
    return NextResponse.json(
      { error: true, message: insertError.message },
      { status: 500 }
    )
  }

  // Update user role to provider
  await admin
    .from('users')
    .update({ role: 'provider' })
    .eq('id', user.id)

  return NextResponse.json({ success: true, data: profile }, { status: 201 })
}
