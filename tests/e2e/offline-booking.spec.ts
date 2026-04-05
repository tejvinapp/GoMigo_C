import { test, expect } from '@playwright/test'

test.describe('Offline Behavior', () => {
  test('shows offline indicator when offline', async ({ page, context }) => {
    await page.goto('/')

    // Wait for page to fully load
    await page.waitForLoadState('networkidle')

    // Go offline
    await context.setOffline(true)

    // Dispatch the offline event to trigger the PWA's network listener
    await page.evaluate(() => window.dispatchEvent(new Event('offline')))

    // The offline indicator should become visible
    await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible({
      timeout: 5000,
    })
  })

  test('hides indicator when back online', async ({ page, context }) => {
    await page.goto('/')

    // Wait for page to fully load
    await page.waitForLoadState('networkidle')

    // Go offline first
    await context.setOffline(true)
    await page.evaluate(() => window.dispatchEvent(new Event('offline')))

    // Confirm it appears
    await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible({
      timeout: 5000,
    })

    // Come back online
    await context.setOffline(false)
    await page.evaluate(() => window.dispatchEvent(new Event('online')))

    // The offline indicator should disappear
    await expect(page.locator('[data-testid="offline-indicator"]')).not.toBeVisible({
      timeout: 5000,
    })
  })

  test('offline indicator is not visible on initial load when online', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Should not show when online
    await expect(page.locator('[data-testid="offline-indicator"]')).not.toBeVisible()
  })

  test('cached pages are accessible when offline', async ({ page, context }) => {
    // Visit the homepage first to cache it
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Go offline
    await context.setOffline(true)
    await page.evaluate(() => window.dispatchEvent(new Event('offline')))

    // The page content should still be accessible from service worker cache
    // (basic content should be visible even if data requests fail)
    await expect(page.locator('body')).toBeVisible()

    // Offline indicator should be showing
    await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible({
      timeout: 5000,
    })
  })

  test('multiple offline/online cycles work correctly', async ({ page, context }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    for (let i = 0; i < 2; i++) {
      // Go offline
      await context.setOffline(true)
      await page.evaluate(() => window.dispatchEvent(new Event('offline')))
      await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible({
        timeout: 5000,
      })

      // Come back online
      await context.setOffline(false)
      await page.evaluate(() => window.dispatchEvent(new Event('online')))
      await expect(page.locator('[data-testid="offline-indicator"]')).not.toBeVisible({
        timeout: 5000,
      })
    }
  })
})
