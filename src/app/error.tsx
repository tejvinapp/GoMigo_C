'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import { RefreshCw, Home, Phone } from 'lucide-react'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Log error — in production this goes to monitoring service
    console.error('Global error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="text-8xl mb-6">⚠️</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Something Went Wrong</h1>
        <p className="text-gray-500 mb-2">
          Our team has been notified and is working on a fix.
        </p>
        <p className="text-gray-400 text-sm mb-8">Try again in 2 minutes. Your data is safe.</p>
        <div className="space-y-3">
          <button
            onClick={reset}
            className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Try Again
          </button>
          <Link href="/" className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 font-medium px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors">
            <Home className="w-4 h-4" /> Go to Homepage
          </Link>
          <a href="https://wa.me/919999999999" className="w-full flex items-center justify-center gap-2 bg-green-50 border border-green-200 text-green-700 font-medium px-6 py-3 rounded-xl hover:bg-green-100 transition-colors">
            <Phone className="w-4 h-4" /> Contact Support on WhatsApp
          </a>
        </div>
        {error.digest && (
          <p className="mt-6 text-xs text-gray-400">Error ID: {error.digest}</p>
        )}
      </div>
    </div>
  )
}
