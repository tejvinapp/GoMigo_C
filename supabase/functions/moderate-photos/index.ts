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

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024 // 5MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']

interface ModeratePhotosPayload {
  file_path: string
  provider_id: string
  listing_id: string
}

async function sendWhatsApp(params: {
  phone: string
  templateName: string
  variables: string[]
  language: string
}): Promise<boolean> {
  const { data: watiEndpoint } = await supabase
    .from('platform_settings')
    .select('value')
    .eq('key', 'wati_endpoint')
    .single()
  const { data: watiToken } = await supabase
    .from('platform_settings')
    .select('value')
    .eq('key', 'wati_token')
    .single()

  if (!watiEndpoint?.value || !watiToken?.value) return false

  const phone = params.phone.replace('+', '')
  const response = await fetch(
    `${watiEndpoint.value}/api/v1/sendTemplateMessage?whatsappNumber=${phone}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${watiToken.value}`,
      },
      body: JSON.stringify({
        template_name: params.templateName,
        broadcast_name: `gomigo_photo_${Date.now()}`,
        parameters: params.variables.map((v, i) => ({
          name: `parameter${i + 1}`,
          value: v,
        })),
      }),
    }
  )
  return response.ok
}

async function checkGeminiVision(
  imageBlob: Blob,
  geminiKey: string
): Promise<{ safe: boolean; reason?: string }> {
  // Convert blob to base64
  const arrayBuffer = await imageBlob.arrayBuffer()
  const bytes = new Uint8Array(arrayBuffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  const base64Image = btoa(binary)
  const mimeType = imageBlob.type || 'image/jpeg'

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: 'Analyze this image for a travel booking platform. Is this image appropriate for a family-friendly travel app? Check for: adult content, violence, hate speech, or illegal content. Reply in JSON: {"safe": true/false, "reason": "explanation if unsafe"}',
              },
              {
                inlineData: {
                  mimeType,
                  data: base64Image,
                },
              },
            ],
          },
        ],
        generationConfig: { responseMimeType: 'application/json' },
      }),
    }
  )

  if (!response.ok) {
    console.error('Gemini API error:', response.status)
    // Default to safe if Gemini is unavailable
    return { safe: true }
  }

  const data = await response.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}'

  try {
    const result = JSON.parse(text)
    return { safe: !!result.safe, reason: result.reason }
  } catch {
    return { safe: true }
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  let body: ModeratePhotosPayload
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const { file_path, provider_id, listing_id } = body
  if (!file_path || !provider_id || !listing_id) {
    return new Response(
      JSON.stringify({ error: 'file_path, provider_id, and listing_id are required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    // Download image from Supabase storage
    const { data: fileBlob, error: downloadError } = await supabase.storage
      .from('listings')
      .download(file_path)

    if (downloadError || !fileBlob) {
      return new Response(JSON.stringify({ error: 'File not found in storage' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Simple checks: file size < 5MB
    if (fileBlob.size > MAX_FILE_SIZE_BYTES) {
      await supabase.storage.from('listings').remove([file_path])
      await logAndNotifyRejection(provider_id, listing_id, file_path, 'File too large (max 5MB)')
      return new Response(
        JSON.stringify({ success: false, rejected: true, reason: 'File too large' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // MIME type check
    const mimeType = fileBlob.type
    if (!ALLOWED_MIME_TYPES.some((t) => mimeType.startsWith('image/'))) {
      await supabase.storage.from('listings').remove([file_path])
      await logAndNotifyRejection(provider_id, listing_id, file_path, `Invalid file type: ${mimeType}`)
      return new Response(
        JSON.stringify({ success: false, rejected: true, reason: 'Invalid file type' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if provider has a BYOAI Gemini key
    const { data: geminiKeyRow } = await supabase
      .from('platform_settings')
      .select('value, is_configured')
      .eq('key', `byoai_gemini_${provider_id}`)
      .single()

    const geminiKey = geminiKeyRow?.is_configured ? geminiKeyRow.value : null

    // If Gemini key available, run vision moderation
    if (geminiKey) {
      const { safe, reason } = await checkGeminiVision(fileBlob, geminiKey)

      if (!safe) {
        await supabase.storage.from('listings').remove([file_path])
        await logAndNotifyRejection(provider_id, listing_id, file_path, reason || 'Image flagged as inappropriate')
        return new Response(
          JSON.stringify({ success: false, rejected: true, reason }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Image is OK — get public URL and update listing
    const { data: publicUrlData } = supabase.storage
      .from('listings')
      .getPublicUrl(file_path)

    const fileUrl = publicUrlData.publicUrl

    // Append to listing's images array
    const { data: listing } = await supabase
      .from('listings')
      .select('images')
      .eq('id', listing_id)
      .single()

    const existingImages = (listing?.images as string[]) || []
    const updatedImages = [...existingImages, fileUrl]

    await supabase
      .from('listings')
      .update({ images: updatedImages, cover_photo_url: existingImages.length === 0 ? fileUrl : undefined })
      .eq('id', listing_id)

    return new Response(
      JSON.stringify({ success: true, file_url: fileUrl, total_images: updatedImages.length }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('moderate-photos error:', err)
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

async function logAndNotifyRejection(
  providerId: string,
  listingId: string,
  filePath: string,
  reason: string
): Promise<void> {
  // Log error
  await supabase.from('error_logs').insert({
    error_code: 'ERR_PHOTO_REJECTED',
    severity: 'medium',
    message: `Photo rejected: ${reason}`,
    metadata: { provider_id: providerId, listing_id: listingId, file_path: filePath, reason },
    auto_fixed: false,
    created_at: new Date().toISOString(),
  })

  // Get provider's user for WhatsApp notification
  const { data: provider } = await supabase
    .from('provider_profiles')
    .select('user_id, display_name')
    .eq('id', providerId)
    .single()

  if (!provider) return

  const { data: user } = await supabase
    .from('users')
    .select('phone, preferred_language')
    .eq('id', provider.user_id)
    .single()

  if (!user?.phone) return

  const language = user.preferred_language || 'en'
  const { data: watiEndpoint } = await supabase
    .from('platform_settings')
    .select('value')
    .eq('key', 'wati_endpoint')
    .single()
  const { data: watiToken } = await supabase
    .from('platform_settings')
    .select('value')
    .eq('key', 'wati_token')
    .single()

  if (!watiEndpoint?.value || !watiToken?.value) return

  const phone = user.phone.replace('+', '')
  await fetch(
    `${watiEndpoint.value}/api/v1/sendTemplateMessage?whatsappNumber=${phone}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${watiToken.value}`,
      },
      body: JSON.stringify({
        template_name: `gomigo_photo_rejected_${language}`,
        broadcast_name: `gomigo_photo_rej_${Date.now()}`,
        parameters: [
          { name: 'parameter1', value: provider.display_name || 'Provider' },
          { name: 'parameter2', value: reason },
        ],
      }),
    }
  )
}
