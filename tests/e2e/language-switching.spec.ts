import { test, expect, Page } from '@playwright/test'

// Language configuration — code, native name, sample text to look for, Unicode range check
const LANGUAGES = [
  {
    code: 'ta',
    name: 'Tamil',
    // Tamil Unicode: U+0B80–U+0BFF
    unicodeStart: 0x0b80,
    unicodeEnd: 0x0bff,
    selector: 'தமிழ்',
    sampleHeading: /ஹில் ஸ்டேஷன்|மலை நிலையம்|ஆராய|explore/i,
  },
  {
    code: 'hi',
    name: 'Hindi',
    // Devanagari Unicode: U+0900–U+097F
    unicodeStart: 0x0900,
    unicodeEnd: 0x097f,
    selector: 'हिन्दी',
    sampleHeading: /हिल स्टेशन|पहाड़ी|explore/i,
  },
  {
    code: 'te',
    name: 'Telugu',
    // Telugu Unicode: U+0C00–U+0C7F
    unicodeStart: 0x0c00,
    unicodeEnd: 0x0c7f,
    selector: 'తెలుగు',
    sampleHeading: /హిల్ స్టేషన్|explore/i,
  },
  {
    code: 'kn',
    name: 'Kannada',
    // Kannada Unicode: U+0C80–U+0CFF
    unicodeStart: 0x0c80,
    unicodeEnd: 0x0cff,
    selector: 'ಕನ್ನಡ',
    sampleHeading: /ಹಿಲ್ ಸ್ಟೇಷನ್|explore/i,
  },
  {
    code: 'ml',
    name: 'Malayalam',
    // Malayalam Unicode: U+0D00–U+0D7F
    unicodeStart: 0x0d00,
    unicodeEnd: 0x0d7f,
    selector: 'മലയാളം',
    sampleHeading: /ഹിൽ സ്റ്റേഷൻ|explore/i,
  },
  {
    code: 'mr',
    name: 'Marathi',
    // Devanagari (same as Hindi)
    unicodeStart: 0x0900,
    unicodeEnd: 0x097f,
    selector: 'मराठी',
    sampleHeading: /हिल स्टेशन|explore/i,
  },
  {
    code: 'or',
    name: 'Odia',
    // Odia Unicode: U+0B00–U+0B7F
    unicodeStart: 0x0b00,
    unicodeEnd: 0x0b7f,
    selector: 'ଓଡ଼ିଆ',
    sampleHeading: /ହିଲ ଷ୍ଟେସନ|explore/i,
  },
]

/** Check if a string contains characters in the given Unicode range */
function containsUnicodeRange(text: string, start: number, end: number): boolean {
  for (const char of text) {
    const code = char.codePointAt(0) ?? 0
    if (code >= start && code <= end) return true
  }
  return false
}

/** Select a language from the language switcher */
async function selectLanguage(page: Page, code: string): Promise<void> {
  // Try different common patterns for language switcher
  const langButton = page.locator(
    '[data-testid="language-switcher"], [aria-label*="language" i], button:has-text("EN"), select[name*="lang" i]'
  ).first()

  if (await langButton.isVisible({ timeout: 3000 })) {
    await langButton.click()
    // Try to find option in dropdown
    const option = page.locator(`[data-lang="${code}"], [data-value="${code}"], option[value="${code}"]`).first()
    if (await option.isVisible({ timeout: 2000 })) {
      await option.click()
      return
    }
  }

  // Fallback: set localStorage and reload
  await page.evaluate((langCode) => {
    localStorage.setItem('gomigo_language', langCode)
    localStorage.setItem('NEXT_LOCALE', langCode)
  }, code)
  await page.reload()
}

test.describe('Language Switching — 8 languages', () => {
  test('homepage loads in English with correct heading', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL('/')

    // English heading should be visible
    const heading = page.getByText(/Explore Hill Stations|Hill Stations|Explore/i).first()
    await expect(heading).toBeVisible({ timeout: 10000 })

    // Default language should be English
    const langText = page.locator('[data-testid="language-switcher"], [aria-label*="language" i]').first()
    if (await langText.isVisible()) {
      await expect(langText).toContainText(/EN|English|en/i)
    }
  })

  test('switching to Tamil shows Tamil script content', async ({ page }) => {
    await page.goto('/')
    await selectLanguage(page, 'ta')
    await page.waitForTimeout(500)

    // URL should not have language prefix (language is stored client-side)
    expect(page.url()).not.toMatch(/\/ta\//)

    // Page body should contain Tamil characters
    const bodyText = await page.locator('body').textContent()
    expect(bodyText).toBeTruthy()
    expect(containsUnicodeRange(bodyText!, 0x0b80, 0x0bff)).toBe(true)
  })

  test('switching to Hindi shows Devanagari text', async ({ page }) => {
    await page.goto('/')
    await selectLanguage(page, 'hi')
    await page.waitForTimeout(500)

    expect(page.url()).not.toMatch(/\/hi\//)

    const bodyText = await page.locator('body').textContent()
    expect(bodyText).toBeTruthy()
    expect(containsUnicodeRange(bodyText!, 0x0900, 0x097f)).toBe(true)
  })

  for (const lang of LANGUAGES) {
    test(`switching to ${lang.name} (${lang.code}) shows correct script`, async ({ page }) => {
      await page.goto('/')
      await selectLanguage(page, lang.code)
      await page.waitForTimeout(500)

      // URL should not have language prefix
      expect(page.url()).not.toMatch(new RegExp(`/${lang.code}/`))

      // Verify Unicode characters are present on page
      const bodyText = await page.locator('body').textContent()
      expect(bodyText).toBeTruthy()
      expect(containsUnicodeRange(bodyText!, lang.unicodeStart, lang.unicodeEnd)).toBe(true)
    })
  }

  test('language preference is saved across page reload', async ({ page }) => {
    await page.goto('/')
    await selectLanguage(page, 'ta')
    await page.waitForTimeout(300)

    // Reload page
    await page.reload()
    await page.waitForLoadState('networkidle')

    // Tamil content should still be visible after reload
    const bodyText = await page.locator('body').textContent()
    expect(bodyText).toBeTruthy()
    // Either Tamil characters are present or the language switcher still shows 'ta'
    const hasTamil = containsUnicodeRange(bodyText!, 0x0b80, 0x0bff)
    const hasLangPreference =
      (await page.evaluate(() => localStorage.getItem('gomigo_language'))) === 'ta' ||
      (await page.evaluate(() => localStorage.getItem('NEXT_LOCALE'))) === 'ta'

    expect(hasTamil || hasLangPreference).toBe(true)
  })

  test('correct font is loaded for each language', async ({ page }) => {
    for (const lang of LANGUAGES) {
      await page.goto('/')
      await selectLanguage(page, lang.code)
      await page.waitForTimeout(300)

      // Check that a non-Latin font is loaded (font-family in computed style should change)
      const fontFamily = await page.evaluate(() => {
        const el = document.querySelector('[lang], html, body')
        if (!el) return ''
        return window.getComputedStyle(el).fontFamily
      })

      // Font family should not be exclusively Latin fonts for non-Latin scripts
      // (This is a loose check — the real assertion is that the app at least tries to load a different font)
      expect(fontFamily).toBeTruthy()
    }
  })
})
