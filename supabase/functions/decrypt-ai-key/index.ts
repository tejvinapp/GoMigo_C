import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

const RATE_LIMIT_MAX = 100
const RATE_LIMIT_WINDOW_HOURS = 1

async function checkAndIncrementRateLimit(userId: string): Promise<{ allowed: boolean; remaining: number }> {
  const windowStart = new Date()
  windowStart.setMinutes(0, 0, 0)

  const { data, error } = await supabase.rpc('increment_rate_limit', {
    p_identifier: userId,
    p_route: 'decrypt-ai-key',
    p_window_start: windowStart.toISOString(),
  })

  if (error) {
    // Allow if rate limit check fails
    return { allowed: true, remaining: RATE_LIMIT_MAX }
  }

  const count = data as number
  const allowed = count <= RATE_LIMIT_MAX
  return { allowed, remaining: Math.max(0, RATE_LIMIT_MAX - count) }
}

// Decode a base64 string safely in Deno
function base64Decode(b64: string): Uint8Array {
  const binary = atob(b64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

// Decrypt an AES-GCM encrypted value (format: base64(iv):base64(ciphertext))
async function decryptValue(encrypted: string, encryptionKey: string): Promise<string> {
  const parts = encrypted.split(':')
  if (parts.length !== 2) throw new Error('Invalid encrypted format')

  const iv = base64Decode(parts[0])
  const ciphertext = base64Decode(parts[1])

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(encryptionKey.padEnd(32, '0').slice(0, 32)),
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  )

  const plaintext = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    keyMaterial,
    ciphertext
  )

  return new TextDecoder().decode(plaintext)
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // 1. Validate JWT and extract user_id
  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Missing authorization' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const token = authHeader.slice(7)
  const userSupabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  )

  const { data: { user }, error: authError } = await userSupabase.auth.getUser()
  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const userId = user.id

  // 2. Rate limit: 100 calls/user/hour
  const { allowed, remaining } = await checkAndIncrementRateLimit(userId)
  if (!allowed) {
    return new Response(
      JSON.stringify({ error: 'Rate limit exceeded', retry_after: '1 hour' }),
      {
        status: 429,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'X-RateLimit-Remaining': '0',
        },
      }
    )
  }

  try {
    // 3. Parse request for key type (e.g., gemini, openai)
    let keyType = 'gemini'
    try {
      const body = await req.json()
      keyType = body.key_type || 'gemini'
    } catch {
      // default to gemini
    }

    // 4. Fetch encrypted key from platform_settings for this user's BYOAI
    const settingKey = `byoai_${keyType}_${userId}`
    const { data: setting } = await supabase
      .from('platform_settings')
      .select('value, is_sensitive, is_configured')
      .eq('key', settingKey)
      .single()

    // If not found, try the global AI key
    let encryptedValue: string | null = setting?.value ?? null
    if (!encryptedValue || !setting?.is_configured) {
      const { data: globalSetting } = await supabase
        .from('platform_settings')
        .select('value, is_sensitive, is_configured')
        .eq('key', `${keyType}_api_key`)
        .single()
      encryptedValue = globalSetting?.value ?? null
    }

    if (!encryptedValue) {
      return new Response(
        JSON.stringify({ error: 'AI key not configured' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 5. Decrypt the key
    let decryptedKey: string
    if (encryptedValue.startsWith('enc:')) {
      const encryptionSecret = Deno.env.get('ENCRYPTION_SECRET') || 'gomigo-default-encryption-key-32ch'
      decryptedKey = await decryptValue(encryptedValue.slice(4), encryptionSecret)
    } else {
      // Not encrypted (legacy plaintext)
      decryptedKey = encryptedValue
    }

    // 6. Log access to ai_usage_logs (no key content)
    await supabase.from('ai_usage_logs').insert({
      user_id: userId,
      key_type: keyType,
      action: 'key_decrypted',
      created_at: new Date().toISOString(),
    })

    return new Response(
      JSON.stringify({ success: true, key: decryptedKey, key_type: keyType }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'X-RateLimit-Remaining': String(remaining),
        },
      }
    )
  } catch (err) {
    console.error('decrypt-ai-key error:', err)
    return new Response(JSON.stringify({ error: 'Failed to decrypt key' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
