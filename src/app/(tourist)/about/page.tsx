import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About GoMiGo | India\'s Local Travel Super-App',
  description: 'GoMiGo connects tourists with verified local cab drivers, hotels, and tour guides in India\'s hill stations.',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">About GoMiGo</h1>
        <p className="text-green-700 font-medium mb-8">India&apos;s local travel super-app for hill stations</p>

        <div className="prose prose-gray max-w-none space-y-6 text-gray-700">
          <p>
            GoMiGo was built to solve a problem every tourist faces when visiting India&apos;s
            beautiful hill stations: finding trustworthy local services. Fake reviews, unverified
            drivers, and no-show guides are rampant.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8">Our Mission</h2>
          <p>
            We connect tourists with Aadhaar-verified local cab drivers, hotels, and tour guides
            in Ooty, Coonoor, Kotagiri, and beyond. Every provider on GoMiGo has been verified
            through India&apos;s official government systems — Digilocker for identity, Parivahan
            for vehicle permits.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8">Why We&apos;re Different</h2>
          <ul className="list-none space-y-3">
            {[
              '🔐 Aadhaar-verified providers only — confirmed via Digilocker',
              '🚗 Vehicle permits checked via Parivahan (government transport portal)',
              '⭐ Reviews only after completed trips — enforced at database level',
              '📱 WhatsApp-first confirmation — no app download needed',
              '💰 Transparent pricing — no hidden fees, no surge pricing',
              '🇮🇳 Data stored in India (Supabase Mumbai) — DPDP 2023 compliant',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <h2 className="text-xl font-semibold text-gray-900 mt-8">Our Story</h2>
          <p>
            GoMiGo started in the Nilgiris — the Blue Mountains of Tamil Nadu — where the gap
            between tourist expectations and local provider quality was most visible. We&apos;re
            expanding to hill stations across India, one verified provider at a time.
          </p>

          <div className="bg-green-50 rounded-xl p-6 mt-8">
            <h3 className="font-semibold text-gray-900 mb-2">Get in touch</h3>
            <p className="text-sm text-gray-600">
              For support: <a href="mailto:support@gomigo.in" className="text-green-700 underline">support@gomigo.in</a><br />
              For partnerships: <a href="mailto:hello@gomigo.in" className="text-green-700 underline">hello@gomigo.in</a><br />
              WhatsApp: <a href="https://wa.me/919999999999" className="text-green-700 underline">+91 99999 99999</a>
            </p>
          </div>
        </div>

        <div className="mt-10">
          <Link href="/" className="text-green-700 hover:underline">← Back to Home</Link>
        </div>
      </div>
    </div>
  )
}
