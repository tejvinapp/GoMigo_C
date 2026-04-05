#!/usr/bin/env tsx
/**
 * GoMiGo Translation Checker
 * Finds missing translation keys across all language files
 * Run: npm run check-translations
 */

import fs from 'fs'
import path from 'path'

const MESSAGES_DIR = path.join(process.cwd(), 'messages')
const SUPPORTED_LANGS = ['en', 'ta', 'te', 'kn', 'ml', 'hi', 'mr', 'or'] as const
const BASE_LANG = 'en'

type LangCode = (typeof SUPPORTED_LANGS)[number]

function flattenKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([key, value]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      return flattenKeys(value as Record<string, unknown>, fullKey)
    }
    return [fullKey]
  })
}

function loadJson(lang: LangCode): Record<string, unknown> | null {
  const filePath = path.join(MESSAGES_DIR, `${lang}.json`)
  if (!fs.existsSync(filePath)) return null
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
  } catch {
    console.error(`❌ Failed to parse ${lang}.json`)
    return null
  }
}

function checkTranslations() {
  console.log('🔍 GoMiGo Translation Checker\n')

  const baseJson = loadJson(BASE_LANG)
  if (!baseJson) {
    console.error(`❌ Base language file (${BASE_LANG}.json) not found`)
    process.exit(1)
  }

  const baseKeys = flattenKeys(baseJson)
  console.log(`📖 Base (${BASE_LANG}): ${baseKeys.length} keys\n`)

  const gaps: Array<{ lang: LangCode; key: string }> = []
  let totalMissing = 0
  let hasError = false

  for (const lang of SUPPORTED_LANGS) {
    if (lang === BASE_LANG) continue

    const langJson = loadJson(lang)
    if (!langJson) {
      console.log(`⚠️  ${lang}.json — NOT FOUND (${baseKeys.length} keys missing)`)
      gaps.push(...baseKeys.map((key) => ({ lang, key })))
      totalMissing += baseKeys.length
      hasError = true
      continue
    }

    const langKeys = flattenKeys(langJson)
    const missing = baseKeys.filter((k) => !langKeys.includes(k))
    const extra = langKeys.filter((k) => !baseKeys.includes(k))

    if (missing.length === 0) {
      console.log(`✅ ${lang}.json — complete (${langKeys.length} keys)`)
    } else {
      console.log(`⚠️  ${lang}.json — ${missing.length} missing, ${extra.length} extra`)
      if (missing.length > 0 && missing.length <= 10) {
        missing.forEach((k) => console.log(`     missing: ${k}`))
      } else if (missing.length > 10) {
        missing.slice(0, 5).forEach((k) => console.log(`     missing: ${k}`))
        console.log(`     ... and ${missing.length - 5} more`)
      }
      gaps.push(...missing.map((key) => ({ lang, key })))
      totalMissing += missing.length
      hasError = hasError || missing.length > 0
    }
  }

  console.log(`\n📊 Summary: ${totalMissing} missing translations across ${SUPPORTED_LANGS.length - 1} languages`)

  // Write gaps to DB-ready JSON for auto-translation
  if (gaps.length > 0) {
    const gapsFile = path.join(process.cwd(), 'translation-gaps.json')
    fs.writeFileSync(gapsFile, JSON.stringify(gaps, null, 2))
    console.log(`\n📝 Gaps written to translation-gaps.json`)
    console.log('   Run: supabase functions invoke generate-translations to auto-translate')
  }

  if (hasError && process.env.CI) {
    console.error('\n❌ Translation check failed in CI mode')
    process.exit(1)
  }

  console.log('\n✅ Translation check complete')
}

checkTranslations()
