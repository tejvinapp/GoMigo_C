import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/src/lib/supabase/server'
import { createAdminClient } from '@/src/lib/supabase/admin'
import { AppError } from '@/src/lib/errors/AppError'

export const dynamic = 'force-dynamic'

export async function GET() {
  const admin = createAdminClient()

  const { data, error } = await admin
    .from('destinations')
    .select(`
      id, name, slug, state, coordinates, is_active,
      listings:listings(count)
    `)
    .eq('is_active', true)
    .order('name')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data: data || [] })
}

export async function POST(request: NextRequest) {
  // Admin only — create new destination
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

  // Verify admin role
  const admin = createAdminClient()
  const { data: userRow } = await admin
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (userRow?.role !== 'admin') {
    return NextResponse.json(
      { error: true, message: 'Forbidden: admin access required' },
      { status: 403 }
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: true, message: 'Invalid JSON' }, { status: 400 })
  }

  const {
    name,
    slug,
    state,
    coordinates,
    description_en,
    description_ta,
    description_te,
    description_kn,
    description_ml,
    description_hi,
    cover_image_url,
  } = body as Record<string, unknown>

  if (!name || !slug || !state) {
    return NextResponse.json(
      { error: true, message: 'name, slug, and state are required' },
      { status: 400 }
    )
  }

  // Check slug uniqueness
  const { data: existing } = await admin
    .from('destinations')
    .select('id')
    .eq('slug', slug)
    .single()

  if (existing) {
    return NextResponse.json(
      { error: true, message: 'A destination with this slug already exists' },
      { status: 409 }
    )
  }

  const { data: newDest, error: insertError } = await admin
    .from('destinations')
    .insert({
      name,
      slug,
      state,
      coordinates: coordinates ?? null,
      description_en: description_en ?? null,
      description_ta: description_ta ?? null,
      description_te: description_te ?? null,
      description_kn: description_kn ?? null,
      description_ml: description_ml ?? null,
      description_hi: description_hi ?? null,
      cover_image_url: cover_image_url ?? null,
      is_active: false, // starts inactive until admin activates
      created_at: new Date().toISOString(),
    })
    .select('id, name, slug, state, is_active')
    .single()

  if (insertError) {
    return NextResponse.json(
      { error: true, message: insertError.message },
      { status: 500 }
    )
  }

  // Log admin activity
  await admin.from('admin_activity_log').insert({
    admin_id: user.id,
    action: 'destination_created',
    entity_type: 'destinations',
    entity_id: newDest.id,
    new_value: { name, slug, state },
  })

  return NextResponse.json({ success: true, data: newDest }, { status: 201 })
}
