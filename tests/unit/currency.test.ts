// Unit tests for src/lib/utils/currency.ts
// All monetary values in GoMiGo are stored as paise (₹1 = 100 paise).

import { describe, it, expect } from 'vitest'
import {
  formatINR,
  paiseToRupees,
  rupeesToPaise,
  calculatePlatformFee,
  applyGST,
  applyDemandMultiplier,
  calculateBookingAmounts,
  calculateRefundAmount,
} from '@/src/lib/utils/currency'

// ---------------------------------------------------------------------------
// formatINR — formats paise as Indian Rupee string
// ---------------------------------------------------------------------------
describe('formatINR', () => {
  it('formats 10000 paise as ₹100', () => {
    // Intl.NumberFormat with en-IN rounds to 0 decimal places by default
    expect(formatINR(10000)).toMatch(/₹\s?100/)
  })

  it('formats 0 paise as ₹0', () => {
    expect(formatINR(0)).toMatch(/₹\s?0/)
  })

  it('formats 150000 paise as ₹1,500 using Indian number formatting', () => {
    const result = formatINR(150000)
    expect(result).toMatch(/₹\s?1,500/)
  })

  it('formats 10000000 paise (₹1,00,000) with Indian lakh separator', () => {
    // Indian formatting: 1,00,000 (not 100,000)
    const result = formatINR(10000000)
    expect(result).toMatch(/1,00,000/)
  })

  it('handles fractional rupee rounding', () => {
    // 10001 paise = ₹100.01 → displayed as ₹100.01 (maximumFractionDigits: 2)
    const result = formatINR(10001)
    expect(result).toMatch(/100/)
  })
})

// ---------------------------------------------------------------------------
// paiseToRupees — converts paise integer to rupee decimal
// ---------------------------------------------------------------------------
describe('paiseToRupees', () => {
  it('converts 10000 paise to 100 rupees', () => {
    expect(paiseToRupees(10000)).toBe(100)
  })

  it('converts 0 paise to 0 rupees', () => {
    expect(paiseToRupees(0)).toBe(0)
  })

  it('converts 150000 paise to 1500 rupees', () => {
    expect(paiseToRupees(150000)).toBe(1500)
  })

  it('converts 50 paise to 0.5 rupees', () => {
    expect(paiseToRupees(50)).toBe(0.5)
  })

  it('converts 1 paise to 0.01 rupees', () => {
    expect(paiseToRupees(1)).toBeCloseTo(0.01)
  })
})

// ---------------------------------------------------------------------------
// rupeesToPaise — converts rupee amount to paise integer (safe integer math)
// ---------------------------------------------------------------------------
describe('rupeesToPaise', () => {
  it('converts 100 rupees to 10000 paise', () => {
    expect(rupeesToPaise(100)).toBe(10000)
  })

  it('converts 0 rupees to 0 paise', () => {
    expect(rupeesToPaise(0)).toBe(0)
  })

  it('converts 1500 rupees to 150000 paise', () => {
    expect(rupeesToPaise(1500)).toBe(150000)
  })

  it('converts 0.5 rupees to 50 paise', () => {
    expect(rupeesToPaise(0.5)).toBe(50)
  })

  it('rounds fractional paise correctly (avoids floating point drift)', () => {
    // 1.005 rupees = 100.5 paise → rounds to 101
    expect(rupeesToPaise(1.005)).toBe(101)
  })

  it('is the inverse of paiseToRupees for whole rupee amounts', () => {
    const rupees = 999
    expect(paiseToRupees(rupeesToPaise(rupees))).toBe(rupees)
  })
})

// ---------------------------------------------------------------------------
// calculatePlatformFee — platform commission on booking base amount
// ---------------------------------------------------------------------------
describe('calculatePlatformFee', () => {
  it('calculates 10% of 10000 paise as 1000 paise', () => {
    expect(calculatePlatformFee(10000, 10)).toBe(1000)
  })

  it('calculates 0% commission as 0 paise', () => {
    expect(calculatePlatformFee(10000, 0)).toBe(0)
  })

  it('calculates 15% of 20000 paise as 3000 paise', () => {
    expect(calculatePlatformFee(20000, 15)).toBe(3000)
  })

  it('rounds fractional paise to nearest integer', () => {
    // 10% of 333 paise = 33.3 → rounds to 33
    expect(calculatePlatformFee(333, 10)).toBe(33)
  })
})

// ---------------------------------------------------------------------------
// applyGST — GST calculation on a given amount
// ---------------------------------------------------------------------------
describe('applyGST', () => {
  it('calculates 18% GST on 1000 paise as 180 paise', () => {
    expect(applyGST(1000, 18)).toBe(180)
  })

  it('defaults to 18% GST when percent not provided', () => {
    expect(applyGST(1000)).toBe(180)
  })

  it('calculates 5% GST (hotel accommodation rate)', () => {
    expect(applyGST(10000, 5)).toBe(500)
  })

  it('returns 0 GST on 0 amount', () => {
    expect(applyGST(0)).toBe(0)
  })
})

// ---------------------------------------------------------------------------
// applyDemandMultiplier — peak/surge pricing clamped to 1.0 – 2.0
// ---------------------------------------------------------------------------
describe('applyDemandMultiplier', () => {
  it('applies 1.5x multiplier to 10000 paise yielding 15000', () => {
    expect(applyDemandMultiplier(10000, 1.5)).toBe(15000)
  })

  it('clamps multiplier below 1.0 to 1.0 (no discount)', () => {
    expect(applyDemandMultiplier(10000, 0.5)).toBe(10000)
  })

  it('clamps multiplier above 2.0 to 2.0', () => {
    expect(applyDemandMultiplier(10000, 3.0)).toBe(20000)
  })

  it('applies exactly 1.0 multiplier (off-peak, no change)', () => {
    expect(applyDemandMultiplier(10000, 1.0)).toBe(10000)
  })

  it('applies exactly 2.0 multiplier (max peak)', () => {
    expect(applyDemandMultiplier(10000, 2.0)).toBe(20000)
  })
})

// ---------------------------------------------------------------------------
// calculateBookingAmounts — full breakdown with commission + GST
// ---------------------------------------------------------------------------
describe('calculateBookingAmounts', () => {
  it('computes correct breakdown for standard booking', () => {
    // base: ₹1000, 10% platform fee, 18% GST on fee
    const result = calculateBookingAmounts(100000, 10, 18, false)
    expect(result.basePaise).toBe(100000)
    expect(result.platformFeePaise).toBe(10000)          // 10% of 100000
    expect(result.gstOnFeePaise).toBe(1800)              // 18% of 10000
    expect(result.totalPaise).toBe(101800)               // base + gst
    expect(result.providerPayoutPaise).toBe(90000)       // base - platform fee
  })

  it('applies 2% instant-book discount to commission', () => {
    // 10% - 2% = 8% effective commission
    const result = calculateBookingAmounts(100000, 10, 18, true)
    expect(result.platformFeePaise).toBe(8000)           // 8% of 100000
    expect(result.providerPayoutPaise).toBe(92000)       // 100000 - 8000
  })
})

// ---------------------------------------------------------------------------
// calculateRefundAmount — cancellation policy enforcement
// ---------------------------------------------------------------------------
describe('calculateRefundAmount', () => {
  it('refunds 100% for flexible policy cancelled 24h before', () => {
    expect(calculateRefundAmount(10000, 'flexible', 24)).toBe(10000)
  })

  it('refunds 50% for flexible policy cancelled 2-23h before', () => {
    expect(calculateRefundAmount(10000, 'flexible', 12)).toBe(5000)
  })

  it('refunds 0% for flexible policy cancelled < 2h before', () => {
    expect(calculateRefundAmount(10000, 'flexible', 1)).toBe(0)
  })

  it('refunds 100% for strict policy cancelled 48h+ before', () => {
    expect(calculateRefundAmount(10000, 'strict', 48)).toBe(10000)
  })

  it('refunds 50% for strict policy cancelled 24-47h before', () => {
    expect(calculateRefundAmount(10000, 'strict', 36)).toBe(5000)
  })

  it('refunds 0% for strict policy cancelled < 24h before', () => {
    expect(calculateRefundAmount(10000, 'strict', 12)).toBe(0)
  })
})
