// Currency utilities for GoMiGo
// All money is stored in paise (₹1 = 100 paise) to avoid decimal errors

/**
 * Format paise as Indian Rupee string with Indian number formatting
 * e.g., 100000 paise → "₹1,000"
 */
export function formatINR(paise: number): string {
  const rupees = Math.round(paise) / 100
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(rupees)
}

/**
 * Convert rupees to paise (safe integer math)
 */
export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100)
}

/**
 * Convert paise to rupees (for display calculations only)
 */
export function paiseToRupees(paise: number): number {
  return paise / 100
}

/**
 * Calculate platform commission in paise
 * @param basePaise - base booking amount in paise
 * @param commissionPercent - e.g., 10 for 10%
 */
export function calculatePlatformFee(basePaise: number, commissionPercent: number): number {
  return Math.round(basePaise * (commissionPercent / 100))
}

/**
 * Calculate GST in paise on a given amount
 * @param amountPaise - amount to calculate GST on
 * @param gstPercent - e.g., 18 for 18%
 */
export function applyGST(amountPaise: number, gstPercent: number = 18): number {
  return Math.round(amountPaise * (gstPercent / 100))
}

/**
 * Calculate complete booking breakdown
 */
export function calculateBookingAmounts(
  basePaise: number,
  commissionPercent: number = 10,
  gstPercent: number = 18,
  instantBookDiscount: boolean = false
): {
  basePaise: number
  platformFeePaise: number
  gstOnFeePaise: number
  totalPaise: number
  providerPayoutPaise: number
} {
  const effectiveCommission = instantBookDiscount
    ? commissionPercent - 2
    : commissionPercent

  const platformFeePaise = calculatePlatformFee(basePaise, effectiveCommission)
  const gstOnFeePaise = applyGST(platformFeePaise, gstPercent)
  const totalPaise = basePaise + gstOnFeePaise
  const providerPayoutPaise = basePaise - platformFeePaise

  return {
    basePaise,
    platformFeePaise,
    gstOnFeePaise,
    totalPaise,
    providerPayoutPaise,
  }
}

/**
 * Calculate refund amount based on cancellation policy and timing
 */
export function calculateRefundAmount(
  totalPaisePaid: number,
  cancellationPolicy: 'flexible' | 'moderate' | 'strict',
  hoursBeforePickup: number
): number {
  if (cancellationPolicy === 'flexible') {
    if (hoursBeforePickup >= 24) return totalPaisePaid
    if (hoursBeforePickup >= 2) return Math.round(totalPaisePaid * 0.5)
    return 0
  }

  if (cancellationPolicy === 'moderate') {
    if (hoursBeforePickup >= 24) return totalPaisePaid
    if (hoursBeforePickup >= 2) return Math.round(totalPaisePaid * 0.5)
    return 0
  }

  if (cancellationPolicy === 'strict') {
    if (hoursBeforePickup >= 48) return totalPaisePaid
    if (hoursBeforePickup >= 24) return Math.round(totalPaisePaid * 0.5)
    return 0
  }

  return 0
}

/**
 * Apply seasonal demand multiplier to base price
 */
export function applyDemandMultiplier(basePaise: number, multiplier: number): number {
  // Clamp to 1.00 - 2.00 range
  const clamped = Math.max(1.0, Math.min(2.0, multiplier))
  return Math.round(basePaise * clamped)
}

/**
 * Format a number in Indian number system (lakhs, crores)
 */
export function formatIndianNumber(num: number): string {
  return new Intl.NumberFormat('en-IN').format(num)
}

/**
 * Parse Indian number string back to number
 */
export function parseIndianNumber(str: string): number {
  return Number(str.replace(/[₹,\s]/g, ''))
}
