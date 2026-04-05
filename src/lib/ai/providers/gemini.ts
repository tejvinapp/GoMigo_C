// Google Gemini AI provider
import type { AIRequest, AIResponse } from '../bridge'

export async function callGemini(request: AIRequest, apiKey: string): Promise<AIResponse> {
  const model = 'gemini-1.5-flash' // Free tier: 1M tokens/day

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          ...(request.systemPrompt ? [{ role: 'user', parts: [{ text: request.systemPrompt }] }] : []),
          { role: 'user', parts: [{ text: request.prompt }] },
        ],
        generationConfig: {
          maxOutputTokens: request.maxTokens || 1000,
          temperature: 0.7,
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        ],
      }),
      signal: AbortSignal.timeout(30000),
    }
  )

  if (!response.ok) {
    const err = await response.json()
    if (response.status === 429) throw new Error('ERR_AI_QUOTA_EXCEEDED')
    if (response.status === 401 || response.status === 403) throw new Error('ERR_AI_KEY_INVALID')
    throw new Error(`Gemini API error: ${err.error?.message || response.statusText}`)
  }

  const data = await response.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
  const tokensUsed = (data.usageMetadata?.promptTokenCount || 0) + (data.usageMetadata?.candidatesTokenCount || 0)

  return { text, provider: 'gemini', tokensUsed }
}

/**
 * Validate a Gemini API key by making a minimal test call
 */
export async function validateGeminiKey(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
      { signal: AbortSignal.timeout(10000) }
    )
    return response.ok
  } catch {
    return false
  }
}
