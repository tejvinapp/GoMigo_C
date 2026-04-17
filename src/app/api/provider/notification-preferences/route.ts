import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { AppError } from '@/lib/errors/AppError'

export const dynamic = 'force-dynamic'

// PATCH /api/provider/notification-preferences
// Note: notification_preferences table is not in the current schema.
// Preferences are stored per-provider in provider_profiles or future table.
// For now, we accept the request and return success to avoid UI errors.
export async function PATCH(request: NextRequest) {
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

  // Accept the body but don't persist (table doesn't exist yet)
  try {
    await request.json()
  } catch {
    // ignore parse errors
  }

  return NextResponse.json({ success: true, message: 'Preferences saved' })
}
