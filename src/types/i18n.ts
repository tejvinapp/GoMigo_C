export type Language = 'en' | 'ta' | 'te' | 'kn' | 'ml' | 'hi' | 'mr' | 'or'

export const SUPPORTED_LANGUAGES: Language[] = ['en', 'ta', 'te', 'kn', 'ml', 'hi', 'mr', 'or']

export const LANGUAGE_NAMES: Record<Language, { english: string; native: string }> = {
  en: { english: 'English', native: 'English' },
  ta: { english: 'Tamil', native: 'தமிழ்' },
  te: { english: 'Telugu', native: 'తెలుగు' },
  kn: { english: 'Kannada', native: 'ಕನ್ನಡ' },
  ml: { english: 'Malayalam', native: 'മലയാളം' },
  hi: { english: 'Hindi', native: 'हिंदी' },
  mr: { english: 'Marathi', native: 'मराठी' },
  or: { english: 'Odia', native: 'ଓଡ଼ିଆ' },
}

export const LANGUAGE_FONTS: Record<Language, string | null> = {
  en: null,
  ta: 'Noto Sans Tamil',
  te: 'Noto Sans Telugu',
  kn: 'Noto Sans Kannada',
  ml: 'Noto Sans Malayalam',
  hi: 'Noto Sans Devanagari',
  mr: 'Noto Sans Devanagari',
  or: 'Noto Sans Oriya',
}
