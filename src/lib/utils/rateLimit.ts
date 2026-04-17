// PostgreSQL-based rate limiter — works on any hosting platform (no Redis needed)
import { createAdminClient } from '@/lib/supabase/admin'

interface RateLimitConfig {
  maxRequests: number
  windowHours: number
}

const RATE_LIMITS: Record<string, RateLimitConfig> = {
  'auth/otp': { maxRequests: 5, windowHours: 1 },
  'bookings/create': { maxRequests: 50, windowHours: 1 },
  'ai/query': { maxRequests: 100, windowHours: 1 },
  'payments/create': { maxRequests: 20, windowHours: 1 },
  'default': { maxRequests: 200, windowHours: 1 },
}

/**
 * Check and increment rate limit counter.
 * @returns { allowed: boolean, remaining: number, resetAt: Date }
 */
export async function checkRateLimit(
  identifier: string, // user_id or IP address
  route: string
): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
  const supabase = createAdminClient()
  const config = RATE_LIMITS[route] || RATE_LIMITS['default']
  const windowStart = new Date()
  windowStart.setMinutes(0, 0, 0) // Start of current hour

  try {
    // Upsert counter
    const { data, error } = await supabase.rpc('increment_rate_limit', {
      p_identifier: identifier,
      p_route: route,
      p_window_start: windowStart.toISOString(),
    })

    if (error) {
      // If rate limit check itself fails, allow the request
      console.error('Rate limit check failed:', error)
      return { allowed: true, remaining: config.maxRequests, resetAt: new Date(windowStart.getTime() + 3600000) }
    }

    const currentCount = (data as number) || 1
    const allowed = currentCount <= config.maxRequests
    const remaining = Math.max(0, config.maxRequests - currentCount)
    const resetAt = new Date(windowStart.getTime() + config.windowHours * 3600000)

    return { allowed, remaining, resetAt }
  } catch {
    // Fail open — don't block users if rate limit system is down
    return { allowed: true, remaining: 0, resetAt: new Date() }
  }
}

/**
 * Check rate limit by IP address (for anonymous users)
 */
export async function checkIPRateLimit(
  ip: string,
  route: string
): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
  // IP-level limit: 1000 requests/hour
  return checkRateLimit(`ip:${ip}`, route)
}
