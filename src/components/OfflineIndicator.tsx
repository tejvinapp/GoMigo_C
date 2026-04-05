'use client'

import { useEffect, useRef, useState } from 'react'

type BannerState = 'offline' | 'back-online' | 'sw-update' | 'hidden'

/**
 * OfflineIndicator
 *
 * Renders two possible fixed banners at the bottom of the screen:
 *  1. "You're offline" — shown when navigator.onLine is false
 *  2. "Back online" — shown briefly when connectivity is restored (then auto-hides)
 *  3. "Update available" — shown when the service worker has a waiting update
 *
 * All transitions use a CSS slide-up / slide-down animation defined inline.
 */
export function OfflineIndicator() {
  const [banner, setBanner] = useState<BannerState>('hidden')
  // Tracks whether a SW registration with a waiting worker was found
  const swRegRef = useRef<ServiceWorkerRegistration | null>(null)
  // Timer ref for auto-hiding the "back online" message
  const backOnlineTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Determine initial online state ──────────────────────────────────────────
  useEffect(() => {
    if (!navigator.onLine) {
      setBanner('offline')
    }
  }, [])

  // ── Listen for online / offline events ──────────────────────────────────────
  useEffect(() => {
    function handleOffline() {
      if (backOnlineTimerRef.current) {
        clearTimeout(backOnlineTimerRef.current)
        backOnlineTimerRef.current = null
      }
      setBanner('offline')
    }

    function handleOnline() {
      // Show "back online" briefly, then hide
      setBanner('back-online')
      backOnlineTimerRef.current = setTimeout(() => {
        setBanner((prev) => (prev === 'back-online' ? 'hidden' : prev))
      }, 3000)
    }

    window.addEventListener('offline', handleOffline)
    window.addEventListener('online', handleOnline)

    return () => {
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online', handleOnline)
      if (backOnlineTimerRef.current) clearTimeout(backOnlineTimerRef.current)
    }
  }, [])

  // ── Service worker update detection ─────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return

    async function detectUpdate(reg: ServiceWorkerRegistration) {
      // A waiting worker means an update is ready
      if (reg.waiting) {
        swRegRef.current = reg
        setBanner('sw-update')
        return
      }

      // Listen for a new worker entering the waiting state
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing
        if (!newWorker) return
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            swRegRef.current = reg
            setBanner((prev) => (prev === 'offline' ? prev : 'sw-update'))
          }
        })
      })
    }

    navigator.serviceWorker.ready.then(detectUpdate).catch(() => {
      // SW not available — silently ignore
    })
  }, [])

  // ── Service worker skip-waiting handler ─────────────────────────────────────
  function handleUpdate() {
    const reg = swRegRef.current
    if (!reg?.waiting) return
    reg.waiting.postMessage({ type: 'SKIP_WAITING' })
    reg.waiting.addEventListener('statechange', (e) => {
      if ((e.target as ServiceWorker).state === 'activated') {
        window.location.reload()
      }
    })
    setBanner('hidden')
  }

  // ── Nothing to show ─────────────────────────────────────────────────────────
  if (banner === 'hidden') return null

  // ── Shared animation classes ─────────────────────────────────────────────────
  // We use inline keyframes injected via a <style> tag once.
  const isVisible = banner !== 'hidden'

  return (
    <>
      <style>{`
        @keyframes gomigo-slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes gomigo-slide-down {
          from { transform: translateY(0);    opacity: 1; }
          to   { transform: translateY(100%); opacity: 0; }
        }
        .gomigo-banner-enter {
          animation: gomigo-slide-up 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>

      {banner === 'offline' && (
        <OfflineBanner />
      )}
      {banner === 'back-online' && (
        <BackOnlineBanner />
      )}
      {banner === 'sw-update' && (
        <UpdateBanner onUpdate={handleUpdate} onDismiss={() => setBanner('hidden')} />
      )}
    </>
  )
}

// ── Sub-components ──────────────────────────────────────────────────────────

function OfflineBanner() {
  return (
    <div
      role="status"
      aria-live="assertive"
      aria-atomic="true"
      className="gomigo-banner-enter fixed bottom-0 left-0 right-0 z-[9999] flex items-center gap-3 bg-gray-900 px-4 py-3 text-white shadow-2xl"
    >
      {/* Wifi-off icon */}
      <svg
        className="h-5 w-5 shrink-0 text-gray-300"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
      >
        <line x1="1" y1="1" x2="23" y2="23" />
        <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
        <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
        <path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
        <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
        <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
        <line x1="12" y1="20" x2="12.01" y2="20" />
      </svg>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold leading-tight">You're offline</p>
        <p className="text-xs text-gray-400 leading-tight">
          Some features may be unavailable until you reconnect.
        </p>
      </div>

      {/* Pulsing dot indicator */}
      <span className="flex h-2 w-2 shrink-0">
        <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-red-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
      </span>
    </div>
  )
}

function BackOnlineBanner() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="gomigo-banner-enter fixed bottom-0 left-0 right-0 z-[9999] flex items-center gap-3 bg-green-700 px-4 py-3 text-white shadow-2xl"
    >
      {/* Check-circle icon */}
      <svg
        className="h-5 w-5 shrink-0 text-green-200"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p className="flex-1 text-sm font-semibold">Back online</p>
    </div>
  )
}

interface UpdateBannerProps {
  onUpdate: () => void
  onDismiss: () => void
}

function UpdateBanner({ onUpdate, onDismiss }: UpdateBannerProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="gomigo-banner-enter fixed bottom-0 left-0 right-0 z-[9999] flex items-center gap-3 bg-green-800 px-4 py-3 text-white shadow-2xl"
    >
      {/* Refresh icon */}
      <svg
        className="h-5 w-5 shrink-0 text-green-200"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>

      <p className="flex-1 text-sm">
        <span className="font-semibold">GoMiGo update ready.</span>{' '}
        <span className="text-green-200">Reload to get the latest version.</span>
      </p>

      <div className="flex items-center gap-2">
        <button
          onClick={onUpdate}
          className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-green-800 hover:bg-green-50 transition-colors"
        >
          Update now
        </button>
        <button
          onClick={onDismiss}
          aria-label="Dismiss update notification"
          className="rounded p-1 text-green-200 hover:text-white transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}
