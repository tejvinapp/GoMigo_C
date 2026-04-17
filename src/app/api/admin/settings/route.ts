import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getSetting, setSetting } from '@/lib/settings'
import { AppError } from '@/lib/errors/AppError'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

async function verifyAdmin(userId: string): Promise<boolean> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('users')
    .select('role')
    .eq('id', userId)
    .single()
  return data?.role === 'admin'
}

const MASKED_VALUE = '****'

// GET /api/admin/settings — fetch all settings (mask sensitive values)
export async function GET(request: NextRequest) {
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

  if (!(await verifyAdmin(user.id))) {
    return NextResponse.json(
      { error: true, message: 'Forbidden: admin access required' },
      { status: 403 }
    )
  }

  const admin = createAdminClient()
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')

  let query = admin
    .from('platform_settings')
    .select('key, value, category, is_sensitive, is_configured, label, last_updated_at, updated_by')
    .order('category')
    .order('key')

  if (category) {
    query = query.eq('category', category)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json(
      { error: true, message: 'Failed to fetch settings' },
      { status: 500 }
    )
  }

  // Mask sensitive values
  const settings = (data || []).map((s) => ({
    ...s,
    value: s.is_sensitive && s.value ? MASKED_VALUE : s.value,
  }))

  return NextResponse.json({ success: true, data: settings })
}

const UpsertSettingSchema = z.object({
  key: z.string().min(1).max(100),
  value: z.string(),
  category: z.string().min(1).max(50),
  is_sensitive: z.boolean().optional().default(false),
  label: z.string().optional(),
})

// POST /api/admin/settings — upsert a setting
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

  if (!(await verifyAdmin(user.id))) {
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

  const parsed = UpsertSettingSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: true, message: 'Invalid request', issues: parsed.error.issues },
      { status: 400 }
    )
  }

  const { key, value, category, is_sensitive, label } = parsed.data

  try {
    // Use setSetting which handles encryption
    await setSetting(key, value, user.id)

    // Also update category, label, is_sensitive if provided
    const admin = createAdminClient()
    await admin
      .from('platform_settings')
      .update({
        category,
        is_sensitive,
        label: label ?? key,
        is_configured: true,
      })
      .eq('key', key)

    // For payments category: test Razorpay connection after save
    if (category === 'payments' && key.startsWith('razorpay')) {
      const razorpayTest = await testRazorpayConnection()
      if (!razorpayTest.success) {
        return NextResponse.json(
          {
            success: false,
            warning: 'Setting saved but Razorpay connection test failed',
            razorpay_error: razorpayTest.error,
          },
          { status: 200 }
        )
      }
    }

    return NextResponse.json({ success: true, key, category })
  } catch (err) {
    return NextResponse.json(
      { error: true, message: String(err) },
      { status: 500 }
    )
  }
}

async function testRazorpayConnection(): Promise<{ success: boolean; error?: string }> {
  try {
    const keyId = await getSetting('razorpay_key_id')
    const keySecret = await getSetting('razorpay_key_secret')

    if (!keyId || !keySecret) {
      return { success: false, error: 'Razorpay credentials not fully configured' }
    }

    // Test with a simple API call — fetch payment methods
    const response = await fetch('https://api.razorpay.com/v1/payments?count=1', {
      headers: {
        Authorization: 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64'),
      },
    })

    if (response.status === 401) {
      return { success: false, error: 'Invalid Razorpay credentials' }
    }

    // 200 or any non-401 response means credentials are valid
    return { success: true }
  } catch (err) {
    return { success: false, error: String(err) }
  }
}
