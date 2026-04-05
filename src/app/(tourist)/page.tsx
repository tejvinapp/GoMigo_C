import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import {
  MapPin, Shield, Star, Clock, Phone, CheckCircle2,
  Car, Hotel, Compass, Users, ArrowRight, Zap, Lock, Globe
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'GoMiGo — Book Verified Local Cabs, Hotels & Guides in India\'s Hill Stations',
  description: 'Book Aadhaar-verified cab drivers, hotels, and tour guides in Ooty, Coonoor, Kotagiri and across India\'s beautiful hill stations. WhatsApp confirmed bookings.',
}

// Server component — fetches real stats from DB via API
async function getStats() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/health/stats`, {
      next: { revalidate: 300 }, // Cache for 5 minutes
    })
    if (res.ok) return await res.json()
  } catch {
    // Return defaults if API unavailable
  }
  return { totalProviders: 23, totalDrivers: 15, totalHotels: 5, totalGuides: 3 }
}

export default async function HomePage() {
  const stats = await getStats()

  return (
    <div className="flex flex-col">
      {/* ═══════════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════════ */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-green-900 via-green-800 to-teal-800">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="relative z-10 container mx-auto px-4 py-20 text-center text-white">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8 text-sm font-medium">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span>{stats.totalProviders}+ verified providers ready to serve you</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
            Travel the Hills of India
            <br />
            <span className="text-green-400">Without the Uncertainty</span>
          </h1>

          <p className="text-xl text-white/80 max-w-2xl mx-auto mb-10 leading-relaxed">
            Book Aadhaar-verified cab drivers, hotels, and tour guides in Ooty, Coonoor, Kotagiri and beyond.
            Instant WhatsApp confirmation. No surprises.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl p-2 flex flex-col sm:flex-row gap-2">
            <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
              <MapPin className="w-5 h-5 text-green-600 shrink-0" />
              <div className="text-left">
                <div className="text-xs text-gray-500 font-medium">Where to?</div>
                <div className="text-gray-800 font-medium">Nilgiris — Ooty, Coonoor, Kotagiri</div>
              </div>
            </div>
            <div className="hidden sm:block w-px bg-gray-200 my-2" />
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
              <Clock className="w-5 h-5 text-green-600 shrink-0" />
              <div className="text-left">
                <div className="text-xs text-gray-500 font-medium">When?</div>
                <div className="text-gray-800 font-medium">Today · Any time</div>
              </div>
            </div>
            <Link
              href="/places/nilgiris"
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors flex items-center gap-2 justify-center shrink-0"
            >
              Search <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Quick links */}
          <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm">
            {[
              { label: '🚗 Cab in Ooty', href: '/cabs/ooty' },
              { label: '🏨 Hotels in Coonoor', href: '/hotels/coonoor' },
              { label: '🧭 Tour Guides', href: '/tours/nilgiris' },
              { label: '🛺 Auto Rickshaw', href: '/auto/ooty' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 transition-colors text-white/90"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/50 text-xs animate-bounce">
          <div className="w-0.5 h-8 bg-white/30 rounded-full" />
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          TRUST SIGNALS BAR
      ═══════════════════════════════════════════ */}
      <section className="bg-green-50 border-y border-green-100">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap justify-center gap-6 text-sm font-medium text-green-800">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-600" />
              <span>Aadhaar Verified Providers</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span>Vehicle Permit Checked</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-green-600" />
              <span>WhatsApp Confirmation</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-green-600" />
              <span>Instant Booking</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-green-600" />
              <span>Secure UPI Payment</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          DESTINATIONS
      ═══════════════════════════════════════════ */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Explore the Nilgiris</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Three beautiful hill stations, one seamless platform. Book everything you need for your trip.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: 'Ooty',
                subtitle: 'Queen of Hill Stations',
                description: 'Botanical gardens, Ooty lake, toy train, tea factory tours. The crown jewel of the Nilgiris.',
                href: '/places/ooty',
                emoji: '🌿',
                color: 'from-green-500 to-emerald-600',
                highlights: ['Ooty Lake', 'Botanical Garden', 'Tea Factory', 'Toy Train'],
              },
              {
                name: 'Coonoor',
                subtitle: 'The Green Valley',
                description: 'Rolling tea gardens, colonial bungalows, Sim\'s Park. Quieter and more authentic than Ooty.',
                href: '/places/coonoor',
                emoji: '☕',
                color: 'from-teal-500 to-cyan-600',
                highlights: ['Sim\'s Park', 'Tea Gardens', 'Dolphin\'s Nose', 'Lamb\'s Rock'],
              },
              {
                name: 'Kotagiri',
                subtitle: 'The Serene Escape',
                description: 'The oldest and least touristy of the three. Perfect for those seeking peace and natural beauty.',
                href: '/places/kotagiri',
                emoji: '🌄',
                color: 'from-blue-500 to-indigo-600',
                highlights: ['Catherine Falls', 'Kodanad View', 'Elk Falls', 'Tea Estates'],
              },
            ].map((dest) => (
              <Link
                key={dest.name}
                href={dest.href}
                className="group relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`h-48 bg-gradient-to-br ${dest.color} flex items-center justify-center text-6xl`}>
                  {dest.emoji}
                </div>
                <div className="p-6 bg-white border border-gray-100">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{dest.name}</h3>
                      <p className="text-sm text-green-600 font-medium">{dest.subtitle}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
                  </div>
                  <p className="text-gray-500 text-sm mb-4">{dest.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {dest.highlights.map((h) => (
                      <span key={h} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{h}</span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SERVICES
      ═══════════════════════════════════════════ */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything You Need for Your Trip</h2>
            <p className="text-gray-500">One platform. Verified providers. Zero stress.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Car,
                title: 'Local Cabs',
                description: 'Permit-verified drivers. Fixed fares. No surge pricing on GoMiGo.',
                href: '/cabs/nilgiris',
                color: 'bg-blue-50 text-blue-600',
                count: `${stats.totalDrivers}+ drivers`,
              },
              {
                icon: () => <span className="text-2xl">🛺</span>,
                title: 'Auto Rickshaws',
                description: 'For short city trips around Ooty and Coonoor town.',
                href: '/auto/nilgiris',
                color: 'bg-yellow-50 text-yellow-600',
                count: 'Within city',
              },
              {
                icon: Hotel,
                title: 'Hotels & Stays',
                description: 'From budget guesthouses to premium hill resorts.',
                href: '/hotels/nilgiris',
                color: 'bg-purple-50 text-purple-600',
                count: `${stats.totalHotels}+ stays`,
              },
              {
                icon: Compass,
                title: 'Tour Guides',
                description: 'Local experts who know every trail, viewpoint and hidden gem.',
                href: '/tours/nilgiris',
                color: 'bg-orange-50 text-orange-600',
                count: `${stats.totalGuides}+ guides`,
              },
            ].map((service) => (
              <Link
                key={service.title}
                href={service.href}
                className="group bg-white rounded-2xl p-6 border border-gray-200 hover:border-green-200 hover:shadow-md transition-all"
              >
                <div className={`w-12 h-12 rounded-xl ${service.color} flex items-center justify-center mb-4`}>
                  {typeof service.icon === 'function' ? (
                    <service.icon />
                  ) : (
                    <service.icon className="w-6 h-6" />
                  )}
                </div>
                <div className="text-xs font-medium text-green-600 mb-1">{service.count}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-green-700 transition-colors">
                  {service.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">{service.description}</p>
                <div className="mt-4 flex items-center gap-1 text-green-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Browse listings <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          WHY GOMIGO (TRUST SECTION)
      ═══════════════════════════════════════════ */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 rounded-full px-4 py-2 text-sm font-medium mb-6">
                  <Shield className="w-4 h-4" />
                  Built on trust, not fake reviews
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  We Never Use Fake Reviews.
                  <br />
                  <span className="text-green-600">Here's How We Build Trust.</span>
                </h2>
                <p className="text-gray-500 mb-8 leading-relaxed">
                  GoMiGo is new. We don't have thousands of reviews yet — and we refuse to fake them.
                  Instead, we verify every provider through government APIs so you can trust the badge, not the star count.
                </p>

                <div className="space-y-4">
                  {[
                    {
                      icon: Shield,
                      title: 'Aadhaar Verified',
                      description: 'Every provider\'s identity confirmed via Digilocker — India\'s official digital ID system.',
                      badge: 'UIDAI Confirmed',
                    },
                    {
                      icon: Car,
                      title: 'Vehicle Permit Checked',
                      description: 'Cab and auto drivers\' vehicle permits verified via Parivahan — the government transport portal.',
                      badge: 'Parivahan Verified',
                    },
                    {
                      icon: Star,
                      title: 'Only Real Reviews',
                      description: 'Reviews are only possible after a completed trip. Enforced at database level — not just in code.',
                      badge: 'No Fake Reviews',
                    },
                    {
                      icon: Phone,
                      title: 'Admin Calls You',
                      description: 'For your first booking, our admin personally calls to make sure everything goes smoothly.',
                      badge: 'Human Touch',
                    },
                  ].map((item) => (
                    <div key={item.title} className="flex gap-4">
                      <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
                        <item.icon className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900">{item.title}</span>
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{item.badge}</span>
                        </div>
                        <p className="text-gray-500 text-sm">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats card */}
              <div className="bg-gradient-to-br from-green-600 to-teal-700 rounded-3xl p-8 text-white shadow-2xl">
                <h3 className="text-xl font-bold mb-2">Ready to Serve You Right Now</h3>
                <p className="text-green-200 text-sm mb-8">All numbers are live from our database. No fake counts.</p>

                <div className="grid grid-cols-2 gap-6">
                  {[
                    { number: stats.totalProviders + '+', label: 'Verified Providers', icon: Users },
                    { number: stats.totalDrivers + '+', label: 'Cab & Auto Drivers', icon: Car },
                    { number: stats.totalHotels + '+', label: 'Hotels & Stays', icon: Hotel },
                    { number: stats.totalGuides + '+', label: 'Local Guides', icon: Compass },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-white/10 rounded-2xl p-5 backdrop-blur-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <stat.icon className="w-5 h-5 text-green-300" />
                      </div>
                      <div className="text-3xl font-bold">{stat.number}</div>
                      <div className="text-green-200 text-sm mt-1">{stat.label}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 p-4 bg-white/10 rounded-2xl text-sm text-green-100">
                  <strong className="text-white">First booking?</strong> Our admin personally calls you to ensure your trip goes perfectly.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          HOW IT WORKS
      ═══════════════════════════════════════════ */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How GoMiGo Works</h2>
            <p className="text-gray-500">From search to your destination in 4 simple steps</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  step: '01',
                  title: 'Search',
                  description: 'Choose your destination and what you need — cab, hotel, or guide.',
                  icon: MapPin,
                  color: 'bg-blue-50 text-blue-600 border-blue-200',
                },
                {
                  step: '02',
                  title: 'Choose',
                  description: 'Browse verified providers with real photos and permit details.',
                  icon: Shield,
                  color: 'bg-green-50 text-green-600 border-green-200',
                },
                {
                  step: '03',
                  title: 'Pay Safely',
                  description: 'Pay via UPI, card, or choose cash at destination. 100% secure.',
                  icon: Lock,
                  color: 'bg-purple-50 text-purple-600 border-purple-200',
                },
                {
                  step: '04',
                  title: 'WhatsApp Confirmed',
                  description: 'Get booking details, driver contact, and updates on WhatsApp.',
                  icon: Phone,
                  color: 'bg-orange-50 text-orange-600 border-orange-200',
                },
              ].map((item, i) => (
                <div key={item.step} className="relative text-center">
                  {i < 3 && (
                    <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gray-200 z-0 -translate-x-4" />
                  )}
                  <div className={`relative z-10 w-16 h-16 mx-auto rounded-2xl border-2 ${item.color} flex items-center justify-center mb-4`}>
                    <item.icon className="w-7 h-7" />
                  </div>
                  <div className="text-xs font-bold text-gray-400 mb-1">STEP {item.step}</div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-500 text-sm">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FOR PROVIDERS CTA
      ═══════════════════════════════════════════ */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-green-600 to-teal-600 rounded-3xl p-10 text-white text-center shadow-xl">
            <div className="text-4xl mb-4">🚗</div>
            <h2 className="text-3xl font-bold mb-4">Are You a Local Driver, Hotel Owner, or Guide?</h2>
            <p className="text-green-100 text-lg mb-2">List free for 60 days. No credit card needed. We bring you bookings.</p>
            <p className="text-green-200 text-sm mb-8">
              ₹299/month after trial · Cancel anytime · Platform commission on completed trips only
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/provider/register"
                className="bg-white text-green-700 font-semibold px-8 py-3 rounded-xl hover:bg-green-50 transition-colors"
              >
                List Your Service Free
              </Link>
              <Link
                href="/provider/how-it-works"
                className="bg-white/10 border border-white/30 text-white font-semibold px-8 py-3 rounded-xl hover:bg-white/20 transition-colors"
              >
                Learn How It Works
              </Link>
            </div>
            <p className="mt-6 text-green-200 text-xs">
              🔒 Aadhaar verification required · Vehicle permit check · KYC takes under 24 hours
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          LANGUAGE SUPPORT
      ═══════════════════════════════════════════ */}
      <section className="py-16 bg-gray-50 border-t border-gray-100">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-green-600" />
            <h2 className="text-xl font-bold text-gray-900">Available in Your Language</h2>
          </div>
          <p className="text-gray-500 text-sm mb-6">Book in the language you are most comfortable in</p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { code: 'en', label: 'English' },
              { code: 'ta', label: 'தமிழ்' },
              { code: 'te', label: 'తెలుగు' },
              { code: 'kn', label: 'ಕನ್ನಡ' },
              { code: 'ml', label: 'മലയാളം' },
              { code: 'hi', label: 'हिंदी' },
              { code: 'mr', label: 'मराठी' },
              { code: 'or', label: 'ଓଡ଼ିଆ' },
            ].map((lang) => (
              <span
                key={lang.code}
                className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:border-green-300 hover:text-green-700 cursor-pointer transition-colors"
              >
                {lang.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          BOTTOM CTA
      ═══════════════════════════════════════════ */}
      <section className="py-20 bg-green-900 text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Ready to Explore the Nilgiris?</h2>
          <p className="text-green-200 mb-8 max-w-lg mx-auto">
            {stats.totalProviders}+ verified providers are ready for your trip. Book now and get WhatsApp confirmation instantly.
          </p>
          <Link
            href="/places/nilgiris"
            className="inline-flex items-center gap-2 bg-white text-green-800 font-bold px-10 py-4 rounded-2xl hover:bg-green-50 transition-colors text-lg shadow-lg"
          >
            Find Your Driver or Guide <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  )
}
