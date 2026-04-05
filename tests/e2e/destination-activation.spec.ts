import { test, expect } from '@playwright/test'

test.describe('Destination Activation (Admin)', () => {
  test('redirects unauthenticated user from admin to login', async ({ page }) => {
    await page.goto('/admin/destinations')
    // Should redirect to login since not authenticated
    await expect(page).toHaveURL(/login/)
  })

  test('redirects unauthenticated user from admin dashboard to login', async ({ page }) => {
    await page.goto('/admin')
    await expect(page).toHaveURL(/login/)
  })

  test('destinations API returns array of active destinations', async ({ request }) => {
    const response = await request.get('/api/destinations')
    expect(response.status()).toBe(200)
    const body = await response.json()
    expect(body).toHaveProperty('data')
    expect(Array.isArray(body.data)).toBe(true)
  })

  test('destinations API destination objects have required fields', async ({ request }) => {
    const response = await request.get('/api/destinations')
    const body = await response.json()
    if (body.data.length > 0) {
      const dest = body.data[0]
      expect(dest).toHaveProperty('id')
      expect(dest).toHaveProperty('name')
      expect(dest).toHaveProperty('slug')
      expect(dest).toHaveProperty('is_active')
    }
  })

  test('health endpoint returns 200', async ({ request }) => {
    const response = await request.get('/api/health')
    expect(response.status()).toBe(200)
  })

  test('health stats endpoint returns valid data', async ({ request }) => {
    const response = await request.get('/api/health/stats')
    expect(response.status()).toBe(200)
    const body = await response.json()
    expect(body).toBeTruthy()
  })
})
