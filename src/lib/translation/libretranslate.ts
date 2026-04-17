// LibreTranslate client — self-hosted, free, batch translation for listings
import { getSetting } from '@/lib/settings'

export type SupportedLanguage = 'en' | 'ta' | 'te' | 'kn' | 'ml' | 'hi' | 'mr' | 'or'

// LibreTranslate language codes (some differ from our internal codes)
const LIBRE_LANG_MAP: Record<SupportedLanguage, string> = {
  en: 'en',
  ta: 'ta',
  te: 'te',
  kn: 'kn',
  ml: 'ml',
  hi: 'hi',
  mr: 'mr',
  or: 'or',
}

/**
 * Translate a single text from source language to target language
 */
export async function translate(
  text: string,
  from: SupportedLanguage,
  to: SupportedLanguage
): Promise<string | null> {
  if (from === to) return text
  if (!text.trim()) return text

  const url = await getSetting('libretranslate_url')
  if (!url) return null

  const apiKey = await getSetting('libretranslate_key')

  try {
    const response = await fetch(`${url}/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: text,
        source: LIBRE_LANG_MAP[from],
        target: LIBRE_LANG_MAP[to],
        format: 'text',
        ...(apiKey && { api_key: apiKey }),
      }),
      signal: AbortSignal.timeout(15000),
    })

    if (!response.ok) return null
    const data = await response.json()
    return data.translatedText || null
  } catch {
    return null
  }
}

/**
 * Translate a listing title/description from detected language to all 8 languages.
 * Returns a map of language code → translated text.
 */
export async function translateToAll(
  text: string,
  sourceLang: SupportedLanguage = 'en'
): Promise<Partial<Record<SupportedLanguage, string>>> {
  const targets: SupportedLanguage[] = ['en', 'ta', 'te', 'kn', 'ml', 'hi', 'mr', 'or']
  const results: Partial<Record<SupportedLanguage, string>> = {}

  // Keep source language as-is
  results[sourceLang] = text

  // Translate to all others in parallel (max 3 concurrent to avoid rate limits)
  const othersToTranslate = targets.filter((t) => t !== sourceLang)

  for (let i = 0; i < othersToTranslate.length; i += 3) {
    const batch = othersToTranslate.slice(i, i + 3)
    const translations = await Promise.allSettled(
      batch.map((target) => translate(text, sourceLang, target))
    )
    batch.forEach((lang, idx) => {
      const result = translations[idx]
      if (result.status === 'fulfilled' && result.value) {
        results[lang] = result.value
      }
    })
    // Small delay between batches to be respectful to the server
    if (i + 3 < othersToTranslate.length) {
      await new Promise((r) => setTimeout(r, 500))
    }
  }

  return results
}

/**
 * Detect the language of a given text
 */
export async function detectLanguage(text: string): Promise<SupportedLanguage | null> {
  const url = await getSetting('libretranslate_url')
  if (!url) return null

  const apiKey = await getSetting('libretranslate_key')

  try {
    const response = await fetch(`${url}/detect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: text,
        ...(apiKey && { api_key: apiKey }),
      }),
      signal: AbortSignal.timeout(10000),
    })

    if (!response.ok) return null
    const data = await response.json()
    const detected = data[0]?.language as string
    if (detected && detected in LIBRE_LANG_MAP) {
      return detected as SupportedLanguage
    }
    return 'en'
  } catch {
    return null
  }
}
