// GoMiGo — Next.js Middleware
// Responsibilities:
//   1. Refresh Supabase auth session on every request
//   2. i18n routing via next-intl
//   3. Protect /provider/* and /admin/* routes
//   4. Rate limiting via PostgreSQL-backed checkRateLimit()
//   5. Inject X-Request-ID header

import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'
import { nanoid } from 'nanoid'

import { locales, defaultLocale } from '@/i18n'

// ---------------------------------------------------------------------------
// next-intl middleware — handles locale detection + /[locale] prefix routing
// ---------------------------------------------------------------------------
const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
})

// ---------------------------------------------------------------------------
// Routes that require an authenticated session
// ---------------------------------------------------------------------------
const PROTECTED_PATH_PREFIXES = ['/provider', '/admin']

// ---------------------------------------------------------------------------
// Simple in-memory rate limit for middleware (per-IP, 300 req/min)
// Falls back gracefully — never blocks on error.
// The heavy per-route rate limiting lives in API route handlers via checkRateLimit().
// ---------------------------------------------------------------------------
const MIDDLEWARE_RATE_LIMIT = 300 // requests per window
const MIDDLEWARE_WINDOW_MS = 60_000 // 1 minute

// We can't use Node APIs in Edge middleware, so we keep a lightweight map.
// This resets on each cold-start which is acceptable for edge rate limiting.
const rateLimitMap = new Map<string, { count: number; windowStart: number }>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  if (!entry || now - entry.windowStart > MIDDLEWARE_WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, windowStart: now })
    return false
  }

  entry.count += 1

  if (entry.count > MIDDLEWARE_RATE_LIMIT) {
    return true
  }

  return false
}

// ---------------------------------------------------------------------------
// Main middleware
// ---------------------------------------------------------------------------
export async function middleware(request: NextRequest) {
  const requestId = nanoid()
  const { pathname } = request.nextUrl

  // ------------------------------------------------------------------
  // 1. Rate limiting — check before doing anything expensive
  // ------------------------------------------------------------------
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'

  if (isRateLimited(ip)) {
    return new NextResponse('Too Many Requests', {
      status: 429,
      headers: {
        'Retry-After': '60',
        'X-Request-ID': requestId,
        'Content-Type': 'text/plain',
      },
    })
  }

  // ------------------------------------------------------------------
  // 2. Run next-intl middleware to handle locale prefix routing.
  //    It returns a redirect/rewrite response when needed.
  // ------------------------------------------------------------------
  const intlResponse = intlMiddleware(request)

  // ------------------------------------------------------------------
  // 3. Supabase session refresh
  //    We must forward cookies from the incoming request and capture
  //    any Set-Cookie headers emitted by the Supabase client so the
  //    session stays alive without a round-trip to the server.
  // ------------------------------------------------------------------
  const response = intlResponse ?? NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            // Update cookies on the outgoing response
            response.cookies.set({ name, value, ...options })
          })
        },
      },
    }
  )

  // Calling getUser() — not getSession() — is the recommended pattern
  // for server-side session validation (avoids stale JWT issues).
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // ------------------------------------------------------------------
  // 4. Protected route guard
  //    Strip locale prefix to check the actual path segment.
  //    e.g. /en/admin/dashboard → /admin/dashboard
  // ------------------------------------------------------------------
  const pathnameWithoutLocale = pathname.replace(
    new RegExp(`^\\/(${locales.join('|')})(?=\\/|$)`),
    ''
  )

  const isProtected = PROTECTED_PATH_PREFIXES.some((prefix) =>
    pathnameWithoutLocale.startsWith(prefix)
  )

  if (isProtected && !user) {
    const loginUrl = new URL(
      `/${defaultLocale}/login`,
      request.url
    )
    // Preserve the original destination so we can redirect back after login
    loginUrl.searchParams.set('redirect', pathname)
    const redirectResponse = NextResponse.redirect(loginUrl)
    redirectResponse.headers.set('X-Request-ID', requestId)
    return redirectResponse
  }

  // ------------------------------------------------------------------
  // 5. Attach tracing header to every outbound response
  // ------------------------------------------------------------------
  response.headers.set('X-Request-ID', requestId)

  return response
}

// ---------------------------------------------------------------------------
// Matcher — exclude static assets and Next.js internals
// ---------------------------------------------------------------------------
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
