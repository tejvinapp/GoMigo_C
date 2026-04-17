import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { AppError } from '@/lib/errors/AppError'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const UpdateProfileSchema = z.object({
  display_name: z.string().min(2).max(100).optional(),
  bio: z.string().max(500).optional(),
  profile_photo_url: z.string().url().nullable().optional(),
})

// PATCH /api/provider/profile — update provider profile
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

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: true, message: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = UpdateProfileSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: true, message: 'Invalid request', issues: parsed.error.issues },
      { status: 400 }
    )
  }

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (parsed.data.display_name !== undefined) updates.display_name = parsed.data.display_name
  if (parsed.data.bio !== undefined) updates.bio_en = parsed.data.bio
  if (parsed.data.profile_photo_url !== undefined) updates.profile_photo_url = parsed.data.profile_photo_url

  const { error } = await supabase
    .from('provider_profiles')
    .update(updates)
    .eq('user_id', user.id)

  if (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ error: true, message: 'Failed to update profile' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
