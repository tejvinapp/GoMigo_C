'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, Globe, ChevronDown, Car, Hotel, Compass, MapPin, User, LogIn } from 'lucide-react'

const LANGUAGES = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'ta', label: 'Tamil', nativeLabel: 'தமிழ்' },
  { code: 'te', label: 'Telugu', nativeLabel: 'తెలుగు' },
  { code: 'kn', label: 'Kannada', nativeLabel: 'ಕನ್ನಡ' },
  { code: 'ml', label: 'Malayalam', nativeLabel: 'മലയാളം' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिंदी' },
  { code: 'mr', label: 'Marathi', nativeLabel: 'मराठी' },
  { code: 'or', label: 'Odia', nativeLabel: 'ଓଡ଼ିଆ' },
]

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const [currentLang, setCurrentLang] = useState('en')

  const currentLangLabel = LANGUAGES.find(l => l.code === currentLang)?.nativeLabel || 'English'

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-green-700">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white text-sm font-black">G</div>
            GoMiGo
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            <Link href="/places/nilgiris" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-green-700 transition-colors">
              <MapPin className="w-4 h-4" /> Nilgiris
            </Link>
            <Link href="/cabs/nilgiris" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-green-700 transition-colors">
              <Car className="w-4 h-4" /> Cabs
            </Link>
            <Link href="/hotels/nilgiris" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-green-700 transition-colors">
              <Hotel className="w-4 h-4" /> Hotels
            </Link>
            <Link href="/tours/nilgiris" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-green-700 transition-colors">
              <Compass className="w-4 h-4" /> Guides
            </Link>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Language switcher */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                aria-label="Change language"
              >
                <Globe className="w-4 h-4" />
                <span className="hidden sm:block">{currentLangLabel}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${langOpen ? 'rotate-180' : ''}`} />
              </button>

              {langOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl border border-gray-200 shadow-lg z-50 py-1 overflow-hidden">
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => { setCurrentLang(lang.code); setLangOpen(false) }}
                        className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between hover:bg-gray-50 transition-colors ${currentLang === lang.code ? 'text-green-700 bg-green-50' : 'text-gray-700'}`}
                      >
                        <span>{lang.nativeLabel}</span>
                        {lang.code !== 'en' && <span className="text-xs text-gray-400">{lang.label}</span>}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Auth buttons */}
            <Link href="/login" className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
              <LogIn className="w-4 h-4" />
              Log in
            </Link>
            <Link href="/provider/register" className="hidden sm:flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
              List Free
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="Open menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 py-4 space-y-1">
            {[
              { href: '/places/nilgiris', label: 'Nilgiris', icon: MapPin },
              { href: '/cabs/nilgiris', label: 'Book a Cab', icon: Car },
              { href: '/hotels/nilgiris', label: 'Find Hotels', icon: Hotel },
              { href: '/tours/nilgiris', label: 'Tour Guides', icon: Compass },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors font-medium"
              >
                <item.icon className="w-5 h-5 text-green-600" />
                {item.label}
              </Link>
            ))}
            <div className="border-t border-gray-100 pt-3 mt-3 space-y-2">
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100 font-medium"
              >
                <LogIn className="w-5 h-5" /> Log in
              </Link>
              <Link
                href="/provider/register"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700"
              >
                <User className="w-5 h-5" /> List My Service Free
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
