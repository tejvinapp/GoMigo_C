import Link from 'next/link'
import { MapPin, Phone, Mail, Shield, Star, Car } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl text-white mb-4">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-sm font-black">G</div>
              GoMiGo
            </Link>
            <p className="text-sm leading-relaxed mb-4">
              India's local travel super-app for hill stations. Connecting tourists with verified local providers.
            </p>
            <div className="flex gap-3">
              <a href="https://wa.me/919999999999" className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                <Phone className="w-4 h-4" /> WhatsApp Us
              </a>
            </div>
          </div>

          {/* Destinations */}
          <div>
            <h4 className="text-white font-semibold mb-4 flex items-center gap-2"><MapPin className="w-4 h-4 text-green-500" /> Destinations</h4>
            <ul className="space-y-2 text-sm">
              {[
                { label: 'Ooty', href: '/places/ooty' },
                { label: 'Coonoor', href: '/places/coonoor' },
                { label: 'Kotagiri', href: '/places/kotagiri' },
                { label: 'All Nilgiris', href: '/places/nilgiris' },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-white hover:text-green-400 transition-colors">{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-semibold mb-4 flex items-center gap-2"><Car className="w-4 h-4 text-green-500" /> Services</h4>
            <ul className="space-y-2 text-sm">
              {[
                { label: 'Book a Cab', href: '/cabs/nilgiris' },
                { label: 'Find Hotels', href: '/hotels/nilgiris' },
                { label: 'Tour Guides', href: '/tours/nilgiris' },
                { label: 'Auto Rickshaw', href: '/auto/nilgiris' },
                { label: 'List Your Service', href: '/provider/register' },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-green-400 transition-colors">{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold mb-4 flex items-center gap-2"><Shield className="w-4 h-4 text-green-500" /> Company</h4>
            <ul className="space-y-2 text-sm">
              {[
                { label: 'About GoMiGo', href: '/about' },
                { label: 'Privacy Policy', href: '/privacy' },
                { label: 'Terms of Service', href: '/terms' },
                { label: 'Cancellation Policy', href: '/cancellation' },
                { label: 'Contact Support', href: '/contact' },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-green-400 transition-colors">{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Trust badges */}
        <div className="border-t border-gray-800 pt-8 mb-6">
          <div className="flex flex-wrap gap-4 justify-center text-sm">
            <div className="flex items-center gap-2 text-green-400">
              <Shield className="w-4 h-4" />
              <span>Aadhaar Verified via Digilocker</span>
            </div>
            <div className="flex items-center gap-2 text-green-400">
              <Car className="w-4 h-4" />
              <span>Vehicle Permits via Parivahan</span>
            </div>
            <div className="flex items-center gap-2 text-green-400">
              <Star className="w-4 h-4" />
              <span>Only Real Post-Trip Reviews</span>
            </div>
            <div className="flex items-center gap-2 text-green-400">
              <Shield className="w-4 h-4" />
              <span>DPDP 2023 Compliant</span>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
          <p>© {new Date().getFullYear()} GoMiGo. All rights reserved. Data stored in India (Supabase Mumbai).</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> support@gomigo.in</span>
            <span>GST: Applied on platform fees only</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
