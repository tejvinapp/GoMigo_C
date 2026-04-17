import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { AppError } from '@/lib/errors/AppError'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const PatchFlagSchema = z.object({
  is_enabled: z.boolean(),
  rollout_percent: z.number().int().min(0).max(100).optional(),
  description: z.string().max(500).optional(),
})

// PATCH /api/admin/feature-flags/[name] — toggle feature flag
export async function PATCH(
  req: NextRequest,
  { params }: { params: { name: string } }
) {
  // Verify admin
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

  const flagName = params.name
  if (!flagName) {
    return NextResponse.json(
      { error: true, message: 'Flag name is required' },
      { status: 400 }
    )
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: true, message: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = PatchFlagSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: true, message: 'Invalid request', issues: parsed.error.issues },
      { status: 400 }
    )
  }

  const { is_enabled, rollout_percent, description } = parsed.data

  // Check flag exists
  const { data: existing } = await admin
    .from('feature_flags')
    .select('flag_name, is_enabled, rollout_percent, description')
    .eq('flag_name', flagName)
    .single()

  if (!existing) {
    return NextResponse.json(
      { error: true, message: `Feature flag '${flagName}' not found` },
      { status: 404 }
    )
  }

  // Build update payload
  const updatePayload: Record<string, unknown> = {
    is_enabled,
    updated_at: new Date().toISOString(),
    updated_by: user.id,
  }
  if (rollout_percent !== undefined) updatePayload.rollout_percent = rollout_percent
  if (description !== undefined) updatePayload.description = description

  const { data: updated, error: updateError } = await admin
    .from('feature_flags')
    .update(updatePayload)
    .eq('flag_name', flagName)
    .select('flag_name, is_enabled, rollout_percent, description, updated_at')
    .single()

  if (updateError) {
    return NextResponse.json(
      { error: true, message: updateError.message },
      { status: 500 }
    )
  }

  // Log admin activity
  await admin.from('admin_activity_log').insert({
    admin_id: user.id,
    action: is_enabled ? 'feature_flag_enabled' : 'feature_flag_disabled',
    entity_type: 'feature_flags',
    entity_id: flagName,
    old_value: { is_enabled: existing.is_enabled },
    new_value: { is_enabled, rollout_percent },
    created_at: new Date().toISOString(),
  })

  return NextResponse.json({ success: true, data: updated })
}

// GET /api/admin/feature-flags/[name] — get a single feature flag
export async function GET(
  req: NextRequest,
  { params }: { params: { name: string } }
) {
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

  const { data, error } = await admin
    .from('feature_flags')
    .select('flag_name, is_enabled, rollout_percent, description, updated_at, updated_by')
    .eq('flag_name', params.name)
    .single()

  if (error || !data) {
    return NextResponse.json(
      { error: true, message: `Feature flag '${params.name}' not found` },
      { status: 404 }
    )
  }

  return NextResponse.json({ success: true, data })
}
