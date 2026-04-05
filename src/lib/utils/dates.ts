// Date utilities for GoMiGo
// All dates stored in UTC, displayed as IST (Asia/Kolkata)

export const IST_TIMEZONE = 'Asia/Kolkata'

/**
 * Get current time in IST
 */
export function nowIST(): Date {
  return new Date(new Date().toLocaleString('en-US', { timeZone: IST_TIMEZONE }))
}

/**
 * Format a UTC date for display in IST
 */
export function formatDateIST(
  date: Date | string | null,
  options: Intl.DateTimeFormatOptions = {}
): string {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date

  const defaultOptions: Intl.DateTimeFormatOptions = {
    timeZone: IST_TIMEZONE,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }

  return d.toLocaleDateString('en-IN', { ...defaultOptions, ...options })
}

/**
 * Format a UTC date as time in IST
 */
export function formatTimeIST(date: Date | string | null): string {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleTimeString('en-IN', {
    timeZone: IST_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

/**
 * Format date + time for booking confirmations
 */
export function formatDateTimeIST(date: Date | string | null): string {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleString('en-IN', {
    timeZone: IST_TIMEZONE,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

/**
 * Calculate hours between now and a future date
 */
export function hoursUntil(futureDate: Date | string): number {
  const future = typeof futureDate === 'string' ? new Date(futureDate) : futureDate
  const now = new Date()
  return (future.getTime() - now.getTime()) / (1000 * 60 * 60)
}

/**
 * Calculate days until a future date
 */
export function daysUntil(futureDate: Date | string): number {
  return Math.floor(hoursUntil(futureDate) / 24)
}

/**
 * Check if a date is in the past
 */
export function isPast(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.getTime() < Date.now()
}

/**
 * Add days to a date
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

/**
 * Get current IST month number (1-12)
 */
export function currentMonthIST(): number {
  return nowIST().getMonth() + 1
}

/**
 * Format for WhatsApp messages — short and clear
 */
export function formatForWhatsApp(date: Date | string | null): string {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleString('en-IN', {
    timeZone: IST_TIMEZONE,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

/**
 * Get a human-readable relative time string
 */
export function relativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const diffMs = Date.now() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins} min ago`
  if (diffHours < 24) return `${diffHours} hr ago`
  if (diffDays < 7) return `${diffDays} days ago`
  return formatDateIST(date)
}
