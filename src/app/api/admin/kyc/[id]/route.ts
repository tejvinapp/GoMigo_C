import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { AppError } from '@/lib/errors/AppError'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const UpdateKycSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  rejection_reason: z.string().max(500).optional(),
})

// PATCH /api/admin/kyc/[id] — approve or reject a KYC document
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
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

  // Verify admin role
  const admin = createAdminClient()
  const { data: role } = await admin
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .eq('role', 'admin')
    .single()

  if (!role) {
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

  const parsed = UpdateKycSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: true, message: 'Invalid request', issues: parsed.error.issues },
      { status: 400 }
    )
  }

  const { status, rejection_reason } = parsed.data

  const { error } = await admin
    .from('kyc_documents')
    .update({
      status,
      rejection_reason: status === 'rejected' ? (rejection_reason ?? null) : null,
      verified_by: 'admin',
      verified_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', params.id)

  if (error) {
    console.error('KYC update error:', error)
    return NextResponse.json(
      { error: true, message: 'Failed to update KYC document' },
      { status: 500 }
    )
  }

  // Log admin activity
  await admin.from('admin_activity_log').insert({
    admin_id: user.id,
    action: `kyc_${status}`,
    entity_type: 'kyc_documents',
    entity_id: params.id,
    new_value: { status, rejection_reason },
    created_at: new Date().toISOString(),
  })

  return NextResponse.json({ success: true })
}
