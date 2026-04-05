import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/src/lib/supabase/server'
import { callAI } from '@/src/lib/ai/bridge'
import { checkRateLimit } from '@/src/lib/utils/rateLimit'
import { z } from 'zod'

const AIRequestSchema = z.object({
  prompt: z.string().min(1).max(2000),
  feature: z.enum(['itinerary', 'review_summary', 'listing_description', 'general']),
  systemPrompt: z.string().max(500).optional(),
})

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: true, code: 'ERR_AUTH_SESSION_EXPIRED' }, { status: 401 })
  }

  const { allowed } = await checkRateLimit(user.id, 'ai/query')
  if (!allowed) {
    return NextResponse.json({ error: true, code: 'ERR_RATE_LIMIT' }, { status: 429 })
  }

  const body = await request.json()
  const parsed = AIRequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: true, message: 'Invalid request' }, { status: 400 })
  }

  try {
    const result = await callAI({ userId: user.id, ...parsed.data })
    return NextResponse.json({ success: true, data: { text: result.text, provider: result.provider } })
  } catch (error) {
    const code = error instanceof Error ? error.message : 'ERR_AI_UNAVAILABLE'
    return NextResponse.json({ error: true, code }, { status: 503 })
  }
}
