import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { AppError } from '@/lib/errors/AppError'

export const dynamic = 'force-dynamic'

// POST /api/provider/deactivate — deactivate provider account (hide listings, block new bookings)
export async function POST() {
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

  // Get provider profile
  const { data: provider } = await admin
    .from('provider_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!provider) {
    return NextResponse.json(
      { error: true, message: 'Provider profile not found' },
      { status: 404 }
    )
  }

  // Hide all listings
  await admin
    .from('listings')
    .update({ listing_visible: false, updated_at: new Date().toISOString() })
    .eq('provider_id', provider.id)

  // Mark provider as deleted
  await admin
    .from('provider_profiles')
    .update({
      listing_visible: false,
      deleted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', provider.id)

  // Sign out
  await supabase.auth.signOut()

  return NextResponse.json({ success: true })
}
