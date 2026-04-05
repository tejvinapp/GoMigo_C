// Unit tests for src/lib/utils/seasonal.ts
// Tests seasonal pricing multiplier logic for GoMiGo hill station destinations.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  getCurrentMultiplier,
  applySeasonalPricing,
  type SeasonalRules,
} from '@/src/lib/utils/seasonal'

// ---------------------------------------------------------------------------
// Shared test fixture — typical Ooty/Kodaikanal seasonal rules
// ---------------------------------------------------------------------------
const typicalRules: SeasonalRules = {
  peak_months: [4, 5, 10, 11, 12, 1],   // Apr, May, Oct–Jan
  peak_multiplier: 1.5,
  shoulder_months: [2, 3, 6, 7],         // Feb, Mar, Jun, Jul
  shoulder_multiplier: 1.2,
  off_peak_multiplier: 1.0,              // Aug, Sep
}

// ---------------------------------------------------------------------------
// Helper — mock currentMonthIST() to return a specific month
// ---------------------------------------------------------------------------
function mockMonth(month: number) {
  vi.mock('@/src/lib/utils/dates', () => ({
    currentMonthIST: () => month,
    nowIST: () => new Date(2024, month - 1, 15),
    IST_TIMEZONE: 'Asia/Kolkata',
  }))
}

// ---------------------------------------------------------------------------
// getCurrentMultiplier
// ---------------------------------------------------------------------------
describe('getCurrentMultiplier', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns peak multiplier when current month is in peak_months', async () => {
    // Mock May (month 5) — a peak month
    vi.doMock('@/src/lib/utils/dates', () => ({ currentMonthIST: () => 5 }))
    const { getCurrentMultiplier: fn } = await import('@/src/lib/utils/seasonal')
    expect(fn(typicalRules)).toBe(1.5)
    vi.resetModules()
  })

  it('returns off-peak multiplier for month in neither peak nor shoulder', async () => {
    // Mock August (month 8) — off-peak
    vi.doMock('@/src/lib/utils/dates', () => ({ currentMonthIST: () => 8 }))
    const { getCurrentMultiplier: fn } = await import('@/src/lib/utils/seasonal')
    expect(fn(typicalRules)).toBe(1.0)
    vi.resetModules()
  })

  it('returns shoulder multiplier for shoulder month', async () => {
    // Mock March (month 3) — shoulder
    vi.doMock('@/src/lib/utils/dates', () => ({ currentMonthIST: () => 3 }))
    const { getCurrentMultiplier: fn } = await import('@/src/lib/utils/seasonal')
    expect(fn(typicalRules)).toBe(1.2)
    vi.resetModules()
  })

  it('returns 1.0 when rules is null', () => {
    // Null rules should never crash — default to 1.0
    expect(getCurrentMultiplier(null)).toBe(1.0)
  })

  it('returns 1.0 when peak_months array is empty', () => {
    const emptyRules: SeasonalRules = {
      peak_months: [],
      peak_multiplier: 2.0,
      off_peak_multiplier: 1.0,
    }
    expect(getCurrentMultiplier(emptyRules)).toBe(1.0)
  })

  it('handles January (month 1) as peak correctly — boundary condition', async () => {
    vi.doMock('@/src/lib/utils/dates', () => ({ currentMonthIST: () => 1 }))
    const { getCurrentMultiplier: fn } = await import('@/src/lib/utils/seasonal')
    expect(fn(typicalRules)).toBe(1.5)
    vi.resetModules()
  })

  it('handles December (month 12) — year boundary peak', async () => {
    vi.doMock('@/src/lib/utils/dates', () => ({ currentMonthIST: () => 12 }))
    const { getCurrentMultiplier: fn } = await import('@/src/lib/utils/seasonal')
    expect(fn(typicalRules)).toBe(1.5)
    vi.resetModules()
  })
})

// ---------------------------------------------------------------------------
// applySeasonalPricing — returns full pricing breakdown
// ---------------------------------------------------------------------------
describe('applySeasonalPricing', () => {
  afterEach(() => {
    vi.resetModules()
  })

  it('returns original price with multiplier 1.0 for off-peak', async () => {
    // Month 8 = August = off-peak
    vi.doMock('@/src/lib/utils/dates', () => ({ currentMonthIST: () => 8 }))
    const { applySeasonalPricing: fn } = await import('@/src/lib/utils/seasonal')

    const result = fn(10000, typicalRules)

    expect(result.originalPaise).toBe(10000)
    expect(result.multiplier).toBe(1.0)
    expect(result.finalPaise).toBe(10000)
    expect(result.seasonLabel).toBe('off-peak')
    vi.resetModules()
  })

  it('applies peak multiplier of 1.5 in peak season', async () => {
    // Month 5 = May = peak
    vi.doMock('@/src/lib/utils/dates', () => ({ currentMonthIST: () => 5 }))
    const { applySeasonalPricing: fn } = await import('@/src/lib/utils/seasonal')

    const result = fn(10000, typicalRules)

    expect(result.multiplier).toBe(1.5)
    expect(result.finalPaise).toBe(15000)
    expect(result.seasonLabel).toBe('peak')
    vi.resetModules()
  })

  it('applies shoulder multiplier of 1.2 in shoulder season', async () => {
    // Month 3 = March = shoulder
    vi.doMock('@/src/lib/utils/dates', () => ({ currentMonthIST: () => 3 }))
    const { applySeasonalPricing: fn } = await import('@/src/lib/utils/seasonal')

    const result = fn(10000, typicalRules)

    expect(result.multiplier).toBe(1.2)
    expect(result.finalPaise).toBe(12000)
    expect(result.seasonLabel).toBe('shoulder')
    vi.resetModules()
  })

  it('returns off-peak breakdown when rules is null', () => {
    const result = applySeasonalPricing(10000, null)

    expect(result.originalPaise).toBe(10000)
    expect(result.multiplier).toBe(1.0)
    expect(result.finalPaise).toBe(10000)
    expect(result.seasonLabel).toBe('off-peak')
  })

  it('rounds final price correctly (no fractional paise)', async () => {
    // 10001 paise * 1.5 = 15001.5 → rounds to 15002
    vi.doMock('@/src/lib/utils/dates', () => ({ currentMonthIST: () => 5 }))
    const { applySeasonalPricing: fn } = await import('@/src/lib/utils/seasonal')

    const result = fn(10001, typicalRules)
    expect(Number.isInteger(result.finalPaise)).toBe(true)
    vi.resetModules()
  })

  it('handles destination with no shoulder months defined', async () => {
    // Month 3 — would be shoulder, but no shoulder defined → off-peak
    vi.doMock('@/src/lib/utils/dates', () => ({ currentMonthIST: () => 3 }))
    const { applySeasonalPricing: fn } = await import('@/src/lib/utils/seasonal')

    const rulesNoShoulder: SeasonalRules = {
      peak_months: [4, 5, 10, 11, 12, 1],
      peak_multiplier: 1.5,
      off_peak_multiplier: 1.0,
      // no shoulder_months or shoulder_multiplier
    }

    const result = fn(10000, rulesNoShoulder)
    expect(result.seasonLabel).toBe('off-peak')
    expect(result.finalPaise).toBe(10000)
    vi.resetModules()
  })
})

// ---------------------------------------------------------------------------
// Date boundary conditions
// ---------------------------------------------------------------------------
describe('seasonal date boundary conditions', () => {
  it('month 1 (January) is classified as peak', async () => {
    vi.doMock('@/src/lib/utils/dates', () => ({ currentMonthIST: () => 1 }))
    const { applySeasonalPricing: fn } = await import('@/src/lib/utils/seasonal')
    expect(fn(10000, typicalRules).seasonLabel).toBe('peak')
    vi.resetModules()
  })

  it('month 12 (December) is classified as peak', async () => {
    vi.doMock('@/src/lib/utils/dates', () => ({ currentMonthIST: () => 12 }))
    const { applySeasonalPricing: fn } = await import('@/src/lib/utils/seasonal')
    expect(fn(10000, typicalRules).seasonLabel).toBe('peak')
    vi.resetModules()
  })

  it('month 9 (September) is classified as off-peak', async () => {
    vi.doMock('@/src/lib/utils/dates', () => ({ currentMonthIST: () => 9 }))
    const { applySeasonalPricing: fn } = await import('@/src/lib/utils/seasonal')
    expect(fn(10000, typicalRules).seasonLabel).toBe('off-peak')
    vi.resetModules()
  })

  it('month 6 (June — monsoon shoulder) is classified as shoulder', async () => {
    vi.doMock('@/src/lib/utils/dates', () => ({ currentMonthIST: () => 6 }))
    const { applySeasonalPricing: fn } = await import('@/src/lib/utils/seasonal')
    expect(fn(10000, typicalRules).seasonLabel).toBe('shoulder')
    vi.resetModules()
  })
})
