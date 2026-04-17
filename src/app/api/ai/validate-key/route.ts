import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { saveUserAIKey } from '@/lib/ai/bridge'
import { z } from 'zod'

const ValidateKeySchema = z.object({
  provider: z.enum(['gemini', 'groq', 'deepseek', 'cohere', 'huggingface']),
  apiKey: z.string().min(10).max(200),
})

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: true }, { status: 401 })
  }

  const body = await request.json()
  const parsed = ValidateKeySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: true, message: 'Invalid request' }, { status: 400 })
  }

  const { provider, apiKey } = parsed.data

  // Validate the key by making a test call
  let valid = false
  try {
    if (provider === 'gemini') {
      const { validateGeminiKey } = await import('@/lib/ai/providers/gemini')
      valid = await validateGeminiKey(apiKey)
    } else if (provider === 'groq') {
      const { validateGroqKey } = await import('@/lib/ai/providers/groq')
      valid = await validateGroqKey(apiKey)
    } else {
      // For other providers, do a basic format check
      valid = apiKey.length > 15
    }
  } catch {
    valid = false
  }

  if (!valid) {
    return NextResponse.json({ error: true, code: 'ERR_AI_KEY_INVALID', valid: false }, { status: 400 })
  }

  // Save the key securely (encrypted)
  await saveUserAIKey(user.id, provider, apiKey)

  return NextResponse.json({ success: true, valid: true, provider })
}
