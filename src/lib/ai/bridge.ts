// BYOAI Bridge — retrieve user's AI key from Vault and route to correct provider
// The AI key NEVER leaves this server-side module
import { createAdminClient } from '@/src/lib/supabase/admin'
import { createAdminClient as getAdmin } from '@/src/lib/supabase/admin'

export type AIProvider = 'gemini' | 'groq' | 'deepseek' | 'cohere' | 'huggingface'

export interface AIRequest {
  userId: string
  prompt: string
  systemPrompt?: string
  maxTokens?: number
  feature: 'itinerary' | 'review_summary' | 'listing_description' | 'general'
}

export interface AIResponse {
  text: string
  provider: AIProvider | 'fallback'
  tokensUsed?: number
}

/**
 * Get the user's connected AI provider and key from Supabase Vault.
 * Key is NEVER returned — only used inside this function.
 */
async function getUserAIKey(userId: string): Promise<{ provider: AIProvider; key: string } | null> {
  const supabase = createAdminClient()

  const { data } = await supabase
    .from('users')
    .select('ai_provider, ai_key_vault_id')
    .eq('id', userId)
    .single()

  if (!data?.ai_provider || !data?.ai_key_vault_id) return null

  // Decrypt the key — stored encrypted in Supabase Vault
  const { decrypt } = await import('@/src/lib/utils/crypto')
  try {
    const key = await decrypt(data.ai_key_vault_id)
    return { provider: data.ai_provider as AIProvider, key }
  } catch {
    return null
  }
}

/**
 * Log AI usage (tokens only, never log prompts or responses — privacy)
 */
async function logUsage(params: {
  userId: string
  provider: string
  feature: string
  tokensUsed?: number
  responseTimeMs: number
  success: boolean
}): Promise<void> {
  const supabase = getAdmin()
  await supabase.from('ai_usage_logs').insert({
    user_id: params.userId,
    ai_provider: params.provider,
    feature_used: params.feature,
    tokens_used: params.tokensUsed,
    response_time_ms: params.responseTimeMs,
    success: params.success,
  })
}

/**
 * Main AI bridge — tries user key, then HuggingFace free tier, then Ollama
 */
export async function callAI(request: AIRequest): Promise<AIResponse> {
  const start = Date.now()

  // 1. Try user's own connected key
  const userKey = await getUserAIKey(request.userId)
  if (userKey) {
    try {
      let result: AIResponse | null = null

      if (userKey.provider === 'gemini') {
        const { callGemini } = await import('./providers/gemini')
        result = await callGemini(request, userKey.key)
      } else if (userKey.provider === 'groq') {
        const { callGroq } = await import('./providers/groq')
        result = await callGroq(request, userKey.key)
      }

      if (result) {
        await logUsage({ userId: request.userId, provider: userKey.provider, feature: request.feature, tokensUsed: result.tokensUsed, responseTimeMs: Date.now() - start, success: true })
        return result
      }
    } catch (err) {
      console.error(`User AI key (${userKey.provider}) failed:`, err)
    }
  }

  // 2. HuggingFace free public inference (no key needed for basic models)
  try {
    const response = await fetch(
      'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputs: request.prompt, parameters: { max_new_tokens: request.maxTokens || 500 } }),
        signal: AbortSignal.timeout(15000),
      }
    )

    if (response.ok) {
      const data = await response.json()
      const text = Array.isArray(data) ? data[0]?.generated_text || '' : data?.generated_text || ''
      if (text) {
        await logUsage({ userId: request.userId, provider: 'huggingface', feature: request.feature, responseTimeMs: Date.now() - start, success: true })
        return { text, provider: 'fallback' }
      }
    }
  } catch {
    // HuggingFace unavailable — continue
  }

  // 3. Graceful degradation
  await logUsage({ userId: request.userId, provider: 'none', feature: request.feature, responseTimeMs: Date.now() - start, success: false })
  throw new Error('ERR_AI_UNAVAILABLE')
}

/**
 * Save a user's AI key securely (encrypted, stored in DB)
 */
export async function saveUserAIKey(userId: string, provider: AIProvider, plainKey: string): Promise<void> {
  const { encrypt } = await import('@/src/lib/utils/crypto')
  const encryptedKey = await encrypt(plainKey)

  const supabase = getAdmin()
  await supabase
    .from('users')
    .update({
      ai_provider: provider,
      ai_key_vault_id: encryptedKey,
      ai_key_verified_at: new Date().toISOString(),
    })
    .eq('id', userId)
}

/**
 * Delete a user's AI key
 */
export async function deleteUserAIKey(userId: string): Promise<void> {
  const supabase = getAdmin()
  await supabase
    .from('users')
    .update({ ai_provider: null, ai_key_vault_id: null, ai_key_verified_at: null })
    .eq('id', userId)
}
