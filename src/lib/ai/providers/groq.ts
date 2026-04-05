// Groq AI provider (very fast inference, free tier: 30 req/min)
import type { AIRequest, AIResponse } from '../bridge'

export async function callGroq(request: AIRequest, apiKey: string): Promise<AIResponse> {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama3-8b-8192', // Free tier model
      messages: [
        ...(request.systemPrompt ? [{ role: 'system', content: request.systemPrompt }] : []),
        { role: 'user', content: request.prompt },
      ],
      max_tokens: request.maxTokens || 1000,
      temperature: 0.7,
    }),
    signal: AbortSignal.timeout(20000),
  })

  if (!response.ok) {
    if (response.status === 429) throw new Error('ERR_AI_QUOTA_EXCEEDED')
    if (response.status === 401) throw new Error('ERR_AI_KEY_INVALID')
    throw new Error(`Groq API error: ${response.statusText}`)
  }

  const data = await response.json()
  const text = data.choices?.[0]?.message?.content || ''
  const tokensUsed = data.usage?.total_tokens

  return { text, provider: 'groq', tokensUsed }
}

export async function validateGroqKey(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch('https://api.groq.com/openai/v1/models', {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(10000),
    })
    return response.ok
  } catch {
    return false
  }
}
