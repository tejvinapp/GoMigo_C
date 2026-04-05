// Referral system utilities for GoMiGo
import { customAlphabet } from 'nanoid'

const REFERRAL_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // No 0/O/1/I to avoid confusion
const generateCode = customAlphabet(REFERRAL_ALPHABET, 8)

/**
 * Generate a unique 8-character referral code
 */
export function generateReferralCode(): string {
  return generateCode()
}

/**
 * Calculate provider referral reward (1 free month)
 * Returns the number of days to add to subscription
 */
export function calculateProviderReferralReward(): {
  type: 'free_month'
  daysToAdd: number
  amountPaise: number
} {
  return {
    type: 'free_month',
    daysToAdd: 30,
    amountPaise: 0, // Free month, not cash
  }
}

/**
 * Calculate tourist referral reward (₹100 booking credit)
 */
export function calculateTouristReferralReward(): {
  type: 'booking_credit'
  amountPaise: number
  expiryDays: number
} {
  return {
    type: 'booking_credit',
    amountPaise: 10000, // ₹100 in paise
    expiryDays: 90,
  }
}

/**
 * Validate a referral code format (8 chars, alphanumeric from our alphabet)
 */
export function isValidReferralCode(code: string): boolean {
  return /^[A-HJ-NP-Z2-9]{8}$/.test(code.toUpperCase())
}

/**
 * Apply referral credit to booking total
 * Returns new total after applying credit
 */
export function applyReferralCredit(
  totalPaise: number,
  creditPaise: number
): {
  discountApplied: number
  newTotalPaise: number
  remainingCredit: number
} {
  const discountApplied = Math.min(creditPaise, totalPaise)
  return {
    discountApplied,
    newTotalPaise: totalPaise - discountApplied,
    remainingCredit: creditPaise - discountApplied,
  }
}
