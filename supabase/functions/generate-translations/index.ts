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

interface TranslationGap {
  id: string
  source_text: string
  source_language: string
  target_language: string
  namespace: string
  key: string
  status: string
}

const LANGUAGE_MAP: Record<string, string> = {
  ta: 'ta',
  te: 'te',
  kn: 'kn',
  ml: 'ml',
  hi: 'hi',
  mr: 'mr',
  or: 'or',
  en: 'en',
}

async function getLibreTranslateConfig(): Promise<{ url: string; key: string } | null> {
  const { data: urlRow } = await supabase
    .from('platform_settings')
    .select('value')
    .eq('key', 'libretranslate_url')
    .single()
  const { data: keyRow } = await supabase
    .from('platform_settings')
    .select('value')
    .eq('key', 'libretranslate_api_key')
    .single()

  if (!urlRow?.value) return null
  return { url: urlRow.value, key: keyRow?.value || '' }
}

async function translate(
  text: string,
  sourceLang: string,
  targetLang: string,
  libreConfig: { url: string; key: string }
): Promise<string | null> {
  try {
    const response = await fetch(`${libreConfig.url}/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: text,
        source: sourceLang,
        target: targetLang,
        api_key: libreConfig.key,
      }),
    })

    if (!response.ok) {
      console.error(`LibreTranslate error: ${response.status} ${await response.text()}`)
      return null
    }

    const data = await response.json()
    return data.translatedText as string
  } catch (err) {
    console.error('Translation request failed:', err)
    return null
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    // Fetch LibreTranslate config
    const libreConfig = await getLibreTranslateConfig()
    if (!libreConfig) {
      return new Response(
        JSON.stringify({ error: 'LibreTranslate not configured' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Query pending translation gaps (limit 50)
    const { data: gaps, error: queryError } = await supabase
      .from('translation_gaps')
      .select('id, source_text, source_language, target_language, namespace, key, status')
      .eq('status', 'pending')
      .limit(50)

    if (queryError) {
      throw new Error(`Failed to query translation_gaps: ${queryError.message}`)
    }

    if (!gaps || gaps.length === 0) {
      return new Response(
        JSON.stringify({ success: true, count: 0, message: 'No pending translations' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const patchFiles: Record<string, Record<string, Record<string, string>>> = {}
    let generatedCount = 0
    const processedIds: string[] = []

    for (const gap of gaps as TranslationGap[]) {
      const sourceLang = LANGUAGE_MAP[gap.source_language] || 'en'
      const targetLang = LANGUAGE_MAP[gap.target_language]

      if (!targetLang) {
        console.warn(`Unknown target language: ${gap.target_language}`)
        continue
      }

      const translated = await translate(gap.source_text, sourceLang, targetLang, libreConfig)
      if (!translated) continue

      // Build patch file structure: { namespace: { key: translatedValue } }
      const nsKey = `${gap.namespace}/${gap.target_language}`
      if (!patchFiles[nsKey]) patchFiles[nsKey] = {}
      if (!patchFiles[nsKey][gap.namespace]) patchFiles[nsKey][gap.namespace] = {}
      patchFiles[nsKey][gap.namespace][gap.key] = translated

      processedIds.push(gap.id)
      generatedCount++
    }

    // Write patch files to Supabase storage
    const storageBucket = 'translations'
    for (const [fileKey, content] of Object.entries(patchFiles)) {
      const filePath = `patches/${fileKey}.json`
      const jsonContent = JSON.stringify(content, null, 2)

      // Try to read existing patch and merge
      const { data: existing } = await supabase.storage
        .from(storageBucket)
        .download(filePath)

      let merged = content
      if (existing) {
        try {
          const existingText = await existing.text()
          const existingData = JSON.parse(existingText)
          merged = deepMerge(existingData, content)
        } catch {
          // Start fresh if existing file is invalid
        }
      }

      await supabase.storage
        .from(storageBucket)
        .upload(filePath, JSON.stringify(merged, null, 2), {
          contentType: 'application/json',
          upsert: true,
        })
    }

    // Update translation_gaps status to auto_translated
    if (processedIds.length > 0) {
      await supabase
        .from('translation_gaps')
        .update({
          status: 'auto_translated',
          translated_at: new Date().toISOString(),
        })
        .in('id', processedIds)
    }

    return new Response(
      JSON.stringify({ success: true, count: generatedCount, processed_ids: processedIds }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('generate-translations error:', err)
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

function deepMerge(
  target: Record<string, unknown>,
  source: Record<string, unknown>
): Record<string, unknown> {
  const output = { ...target }
  for (const key of Object.keys(source)) {
    if (
      typeof source[key] === 'object' &&
      source[key] !== null &&
      !Array.isArray(source[key]) &&
      typeof target[key] === 'object' &&
      target[key] !== null
    ) {
      output[key] = deepMerge(
        target[key] as Record<string, unknown>,
        source[key] as Record<string, unknown>
      )
    } else {
      output[key] = source[key]
    }
  }
  return output
}
