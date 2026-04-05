import Link from 'next/link'
import { MapPin, Home, Search, Phone } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="text-8xl mb-6">🏔️</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
        <p className="text-gray-500 mb-8">
          This page doesn't exist. Maybe you were looking for one of these?
        </p>
        <div className="space-y-3 mb-8">
          {[
            { href: '/', label: 'GoMiGo Homepage', icon: Home },
            { href: '/places/nilgiris', label: 'Browse Nilgiris', icon: MapPin },
            { href: '/cabs/nilgiris', label: 'Search for Cabs', icon: Search },
            { href: '/contact', label: 'Contact Support', icon: Phone },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors text-gray-700 hover:text-green-700 font-medium"
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
        </div>
        <p className="text-xs text-gray-400">Error 404 — This page works fully offline too</p>
      </div>
    </div>
  )
}
