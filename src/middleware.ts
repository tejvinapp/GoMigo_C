// GoMiGo — Next.js Middleware
// Responsibilities:
//   1. Refresh Supabase auth session on every request
//   2. Protect /provider/* and /admin/* routes
//   3. Rate limiting (in-memory, per-IP)
//   4. Inject X-Request-ID header
//
// NOTE: next-intl locale-prefix routing is intentionally disabled.
// Language preference is stored per-user in the DB (preferred_language column)
// and applied at render time — not via URL segments.

import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { nanoid } from 'nanoid'

// ---------------------------------------------------------------------------
// Routes that require an authenticated session
// ---------------------------------------------------------------------------
const PROTECTED_PATH_PREFIXES = ['/provider', '/admin']
// Public paths that start with a protected prefix but should be allowed without auth
const PROTECTED_PATH_EXCEPTIONS = ['/provider/register', '/provider/how-it-works']

// ---------------------------------------------------------------------------
// Simple in-memory rate limit (per-IP, 300 req/min)
// ---------------------------------------------------------------------------
const MIDDLEWARE_RATE_LIMIT = 300
const MIDDLEWARE_WINDOW_MS = 60_000

const rateLimitMap = new Map<string, { count: number; windowStart: number }>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  if (!entry || now - entry.windowStart > MIDDLEWARE_WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, windowStart: now })
    return false
  }

  entry.count += 1
  return entry.count > MIDDLEWARE_RATE_LIMIT
}

// ---------------------------------------------------------------------------
// Main middleware
// ---------------------------------------------------------------------------
export async function middleware(request: NextRequest) {
  const requestId = nanoid()
  const { pathname } = request.nextUrl

  // 1. Rate limiting
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

  // 2. Build base response & refresh Supabase session
  const response = NextResponse.next()

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
            response.cookies.set({ name, value, ...options })
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 3. Protected route guard
  const isProtected =
    PROTECTED_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix)) &&
    !PROTECTED_PATH_EXCEPTIONS.some((exc) => pathname.startsWith(exc))

  if (isProtected && !user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    const redirectResponse = NextResponse.redirect(loginUrl)
    redirectResponse.headers.set('X-Request-ID', requestId)
    return redirectResponse
  }

  // 4. Attach tracing header
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
