import { test, expect, Page } from '@playwright/test'

// Helper: inject a mock authenticated tourist session into localStorage/cookie
async function mockTouristAuth(page: Page) {
  await page.addInitScript(() => {
    // Inject a fake Supabase session so the app treats user as logged-in
    const fakeSession = {
      access_token: 'fake-access-token-tourist',
      refresh_token: 'fake-refresh-token',
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      user: {
        id: 'test-tourist-id-001',
        email: 'tourist@test.com',
        phone: '+919876543210',
        role: 'authenticated',
        app_metadata: { role: 'tourist' },
        user_metadata: { display_name: 'Test Tourist', preferred_language: 'en' },
      },
    }
    localStorage.setItem(
      'sb-localhost-auth-token',
      JSON.stringify({ currentSession: fakeSession, expiresAt: fakeSession.expires_at })
    )
  })
}

// Helper: mock Razorpay global so the modal "appears" synchronously
async function mockRazorpay(page: Page) {
  await page.addInitScript(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).Razorpay = function (options: any) {
      return {
        open() {
          // Simulate the modal appearing by dispatching a custom event
          const event = new CustomEvent('razorpay:opened', { detail: options })
          document.dispatchEvent(event)
          // After 500ms auto-trigger success callback to simulate payment
          setTimeout(() => {
            if (options.handler) {
              options.handler({
                razorpay_payment_id: 'pay_mock_12345',
                razorpay_order_id: options.order_id || 'order_mock_12345',
                razorpay_signature: 'mock_signature_hash',
              })
            }
          }, 500)
        },
        on() {},
      }
    }
    ;(window as any).__razorpayMocked = true
  })
}

test.describe('Tourist Booking Flow', () => {
  test('unauthenticated user is redirected to login when clicking Book Now', async ({ page }) => {
    await page.goto('/')

    // Search for cabs in Ooty
    const searchInput = page.getByPlaceholder(/search|destination|where/i).first()
    if (await searchInput.isVisible()) {
      await searchInput.fill('Ooty')
      await searchInput.press('Enter')
    } else {
      // Navigate directly to Ooty listing page
      await page.goto('/listings?destination=ooty&type=cab')
    }

    await page.waitForURL(/listings|ooty/i, { timeout: 10000 })

    // Click first listing
    const firstListing = page.locator('[data-testid="listing-card"], .listing-card, [href*="/listings/"]').first()
    await expect(firstListing).toBeVisible({ timeout: 10000 })
    await firstListing.click()

    // Verify listing detail page
    await page.waitForURL(/\/listings\/[a-z0-9-]+/, { timeout: 10000 })

    // Check essential elements are visible
    const priceElement = page.getByText(/₹|paise|per km|per day/i).first()
    await expect(priceElement).toBeVisible({ timeout: 5000 })

    // Look for provider name and rating
    const ratingEl = page.getByText(/[1-5](\.\d)?\s*★|rating|stars/i).first()
    await expect(ratingEl).toBeVisible({ timeout: 5000 })

    // Click Book Now
    const bookNowBtn = page.getByRole('button', { name: /book now|book/i }).first()
    await expect(bookNowBtn).toBeVisible()
    await bookNowBtn.click()

    // Expect redirect to login since not authenticated
    await expect(page).toHaveURL(/login|auth|sign-in/i, { timeout: 10000 })
  })

  test('authenticated tourist completes full booking with Razorpay payment', async ({ page }) => {
    await mockTouristAuth(page)
    await mockRazorpay(page)

    await page.goto('/listings?destination=ooty&type=cab')
    await page.waitForURL(/listings/, { timeout: 10000 })

    // Click first available listing
    const firstListing = page.locator('[data-testid="listing-card"], .listing-card, [href*="/listings/"]').first()
    await expect(firstListing).toBeVisible({ timeout: 10000 })
    await firstListing.click()
    await page.waitForURL(/\/listings\/[a-z0-9-]+/, { timeout: 10000 })

    // Click Book Now
    const bookNowBtn = page.getByRole('button', { name: /book now/i }).first()
    await expect(bookNowBtn).toBeVisible({ timeout: 5000 })
    await bookNowBtn.click()

    // Fill booking form
    const dateInput = page.locator('input[type="date"], input[name*="date"], input[placeholder*="date" i]').first()
    if (await dateInput.isVisible()) {
      // Set date to 7 days from now
      const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      const dateStr = futureDate.toISOString().split('T')[0]
      await dateInput.fill(dateStr)
    }

    const pickupInput = page.locator('input[name*="pickup" i], input[placeholder*="pickup" i]').first()
    if (await pickupInput.isVisible()) {
      await pickupInput.fill('Ooty Bus Stand')
    }

    const dropoffInput = page.locator('input[name*="drop" i], input[name*="destination" i], input[placeholder*="drop" i]').first()
    if (await dropoffInput.isVisible()) {
      await dropoffInput.fill('Ooty Lake')
    }

    // Verify price calculation updates (some amount visible)
    const priceDisplay = page.getByText(/₹\s*\d+|total.*₹|amount/i).first()
    await expect(priceDisplay).toBeVisible({ timeout: 5000 })

    // Proceed to Pay
    const proceedBtn = page.getByRole('button', { name: /proceed to pay|pay now|confirm booking/i }).first()
    await expect(proceedBtn).toBeVisible({ timeout: 5000 })

    // Listen for Razorpay opened event
    const razorpayOpenedPromise = page.evaluate(() => {
      return new Promise<boolean>((resolve) => {
        document.addEventListener('razorpay:opened', () => resolve(true), { once: true })
        setTimeout(() => resolve(false), 3000) // timeout
      })
    })

    await proceedBtn.click()

    const razorpayOpened = await razorpayOpenedPromise
    expect(razorpayOpened).toBe(true)

    // After mock payment success, expect redirect to my-trips
    await expect(page).toHaveURL(/my-trips|bookings|confirmation/i, { timeout: 15000 })

    // Check confirmation message
    const confirmationMsg = page.getByText(/booking confirmed|booking successful|confirmed|thank you/i).first()
    await expect(confirmationMsg).toBeVisible({ timeout: 10000 })
  })

  test('listing detail page shows price, rating and provider name', async ({ page }) => {
    await page.goto('/listings?destination=ooty&type=cab')
    await page.waitForURL(/listings/, { timeout: 10000 })

    const firstListing = page.locator('[data-testid="listing-card"], .listing-card, [href*="/listings/"]').first()
    await expect(firstListing).toBeVisible({ timeout: 10000 })
    await firstListing.click()

    await page.waitForURL(/\/listings\/[a-z0-9-]+/, { timeout: 10000 })

    // Price should be visible
    await expect(page.getByText(/₹\s*\d+/)).toBeVisible({ timeout: 5000 })

    // Rating should be visible
    await expect(page.getByText(/[1-5](\.\d)?\s*(★|stars?|rating)/i).first()).toBeVisible({ timeout: 5000 })

    // Provider name visible (not empty)
    const providerName = page.locator('[data-testid="provider-name"], .provider-name, [class*="provider"]').first()
    if (await providerName.isVisible()) {
      const text = await providerName.textContent()
      expect(text?.trim().length).toBeGreaterThan(0)
    }
  })
})
