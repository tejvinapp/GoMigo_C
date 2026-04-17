import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// GET /api/ai/status — check if authenticated user has an AI key configured
export async function GET() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ hasKey: false })
  }

  const { data } = await supabase
    .from('users')
    .select('ai_provider, ai_key_vault_id, ai_key_verified_at')
    .eq('id', user.id)
    .single()

  const hasKey = !!(
    data?.ai_key_vault_id &&
    data?.ai_key_verified_at
  )

  return NextResponse.json({
    hasKey,
    provider: data?.ai_provider || null,
  })
}
