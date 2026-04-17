'use client'

import { useState } from 'react'
import { AppError } from '@/lib/errors/AppError'

interface Props {
  errorCode?: string
  lang?: string
  onRetry?: () => void
}

const SEVERITY_STYLES = {
  low: {
    container: 'border-blue-200 bg-blue-50',
    icon: 'text-blue-500',
    title: 'text-blue-900',
    badge: 'bg-blue-100 text-blue-700',
    button: 'bg-blue-600 hover:bg-blue-700 text-white',
    stepNum: 'bg-blue-200 text-blue-800',
  },
  medium: {
    container: 'border-yellow-200 bg-yellow-50',
    icon: 'text-yellow-500',
    title: 'text-yellow-900',
    badge: 'bg-yellow-100 text-yellow-700',
    button: 'bg-yellow-600 hover:bg-yellow-700 text-white',
    stepNum: 'bg-yellow-200 text-yellow-800',
  },
  high: {
    container: 'border-orange-200 bg-orange-50',
    icon: 'text-orange-500',
    title: 'text-orange-900',
    badge: 'bg-orange-100 text-orange-700',
    button: 'bg-orange-600 hover:bg-orange-700 text-white',
    stepNum: 'bg-orange-200 text-orange-800',
  },
  critical: {
    container: 'border-red-200 bg-red-50',
    icon: 'text-red-500',
    title: 'text-red-900',
    badge: 'bg-red-100 text-red-700',
    button: 'bg-red-600 hover:bg-red-700 text-white',
    stepNum: 'bg-red-200 text-red-800',
  },
} as const

const SEVERITY_SVG_PATHS = {
  low: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  medium: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
  high: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
  critical: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
} as const

const isProduction = process.env.NODE_ENV === 'production'

export function ErrorDisplay({ errorCode = 'ERR_UNKNOWN', lang = 'en', onRetry }: Props) {
  const [techOpen, setTechOpen] = useState(false)

  // Instantiate AppError — its constructor resolves unknown codes to ERR_UNKNOWN automatically
  const err = new AppError(errorCode)

  // Safely resolve language key with fallback to 'en'
  type Lang = 'en' | 'ta' | 'te' | 'kn' | 'ml' | 'hi' | 'mr' | 'or'
  const VALID_LANGS: Lang[] = ['en', 'ta', 'te', 'kn', 'ml', 'hi', 'mr', 'or']
  const safeLang: Lang = VALID_LANGS.includes(lang as Lang) ? (lang as Lang) : 'en'

  const severity = err.severity
  const styles = SEVERITY_STYLES[severity] ?? SEVERITY_STYLES.medium
  const iconPath = SEVERITY_SVG_PATHS[severity] ?? SEVERITY_SVG_PATHS.medium

  const title = err.getTitleForLang(safeLang)
  const message = err.getMessageForLang(safeLang)
  const fixSteps: string[] = err.getFixStepsForLang(safeLang)

  const showRetry = err.autoFixable && typeof onRetry === 'function'

  return (
    <div className={`rounded-xl border ${styles.container} p-5 shadow-sm`} role="alert">
      {/* Header */}
      <div className="flex items-start gap-3">
        <svg
          className={`mt-0.5 h-6 w-6 shrink-0 ${styles.icon}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
        </svg>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className={`text-base font-semibold ${styles.title}`}>{title}</h3>
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium uppercase tracking-wide ${styles.badge}`}>
              {severity}
            </span>
          </div>
          <p className="mt-1 text-sm leading-relaxed text-gray-700">{message}</p>
        </div>
      </div>

      {/* Fix steps */}
      {fixSteps.length > 0 && (
        <ol className="mt-4 space-y-2 pl-1">
          {fixSteps.map((step, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-sm text-gray-700">
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${styles.stepNum}`}
              >
                {idx + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      )}

      {/* Retry button */}
      {showRetry && (
        <button
          onClick={onRetry}
          className={`mt-5 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${styles.button}`}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Retry
        </button>
      )}

      {/* Technical details — hidden in production */}
      {!isProduction && (
        <div className="mt-4 border-t border-black/5 pt-3">
          <button
            onClick={() => setTechOpen((v) => !v)}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
            aria-expanded={techOpen}
          >
            <svg
              className={`h-3.5 w-3.5 transition-transform ${techOpen ? 'rotate-90' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            Technical details
          </button>
          {techOpen && (
            <div className="mt-2 rounded-md bg-black/5 p-3">
              <p className="font-mono text-xs text-gray-600">
                Error code: <span className="font-bold">{err.code}</span>
              </p>
              {err.adminMessage && (
                <p className="mt-1 text-xs text-gray-500">{err.adminMessage}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                HTTP status: {err.httpStatus}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
