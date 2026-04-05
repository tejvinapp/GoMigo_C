// GoMiGo — next-intl configuration
// Used by next-intl/server for loading locale message bundles.

import { getRequestConfig } from 'next-intl/server'

// Supported locales — matches the 8 Indian languages GoMiGo targets
export const locales = ['en', 'ta', 'te', 'kn', 'ml', 'hi', 'mr', 'or'] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'en'

// next-intl request config — called on every server render to load messages
export default getRequestConfig(async ({ locale }) => {
  // Validate locale to prevent path traversal or unknown locales
  const safeLocale: Locale = (locales as readonly string[]).includes(locale as string)
    ? (locale as Locale)
    : defaultLocale

  return {
    locale: safeLocale,
    messages: (await import(`../messages/${safeLocale}.json`)).default,
  }
})
