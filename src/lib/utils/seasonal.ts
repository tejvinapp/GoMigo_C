// Seasonal pricing utilities for GoMiGo
import { currentMonthIST } from './dates'

export interface SeasonalRules {
  peak_months: number[]           // e.g., [4, 5, 10, 11, 12, 1]
  peak_multiplier: number         // e.g., 1.5
  off_peak_multiplier: number     // e.g., 1.0
  shoulder_months?: number[]      // e.g., [2, 3, 6, 7]
  shoulder_multiplier?: number    // e.g., 1.2
}

/**
 * Get the current pricing multiplier based on seasonal rules
 */
export function getCurrentMultiplier(rules: SeasonalRules | null): number {
  if (!rules || !rules.peak_months?.length) return 1.0

  const month = currentMonthIST()

  if (rules.peak_months.includes(month)) {
    return rules.peak_multiplier || 1.0
  }

  if (rules.shoulder_months?.includes(month)) {
    return rules.shoulder_multiplier || 1.0
  }

  return rules.off_peak_multiplier || 1.0
}

/**
 * Apply seasonal pricing to a base price in paise
 */
export function applySeasonalPricing(
  basePaise: number,
  rules: SeasonalRules | null
): {
  originalPaise: number
  multiplier: number
  finalPaise: number
  seasonLabel: 'peak' | 'shoulder' | 'off-peak'
} {
  if (!rules) {
    return { originalPaise: basePaise, multiplier: 1.0, finalPaise: basePaise, seasonLabel: 'off-peak' }
  }

  const month = currentMonthIST()
  let multiplier = rules.off_peak_multiplier || 1.0
  let seasonLabel: 'peak' | 'shoulder' | 'off-peak' = 'off-peak'

  if (rules.peak_months?.includes(month)) {
    multiplier = rules.peak_multiplier || 1.0
    seasonLabel = 'peak'
  } else if (rules.shoulder_months?.includes(month)) {
    multiplier = rules.shoulder_multiplier || 1.0
    seasonLabel = 'shoulder'
  }

  const finalPaise = Math.round(basePaise * multiplier)

  return { originalPaise: basePaise, multiplier, finalPaise, seasonLabel }
}

/**
 * Get month name for season display
 */
export function getMonthName(month: number): string {
  return new Date(2024, month - 1, 1).toLocaleString('en-IN', { month: 'long' })
}

/**
 * Get all peak months as readable string
 */
export function getPeakMonthsLabel(rules: SeasonalRules): string {
  return rules.peak_months.map(getMonthName).join(', ')
}
