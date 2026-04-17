import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Terms of Service | GoMiGo' }

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: January 2026</p>
        <div className="space-y-6 text-gray-700 text-sm">
          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">1. Platform Role</h2>
            <p>GoMiGo is a marketplace that connects tourists with independent local service providers. We are not a transport or hospitality company. Providers are independent contractors, not employees of GoMiGo.</p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">2. User Eligibility</h2>
            <p>You must be 18+ and have a valid Indian mobile number to use GoMiGo. By using the platform, you confirm this.</p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">3. Bookings</h2>
            <p>All bookings are between the tourist and the provider. GoMiGo facilitates the transaction. Once a booking is confirmed, both parties are bound by the agreed terms. See our <Link href="/cancellation" className="text-green-700 underline">Cancellation Policy</Link>.</p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">4. Payments</h2>
            <p>Online payments are processed by Razorpay. GoMiGo collects a platform commission (default 10%) + 18% GST on the commission only. Providers receive the remaining amount within 7 working days of trip completion.</p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">5. Prohibited Use</h2>
            <p>Users may not: create fake reviews, impersonate providers, use the platform for illegal activities, or attempt to bypass the payment system.</p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">6. Dispute Resolution</h2>
            <p>Disputes should be raised within 48 hours of trip completion via support@gomigo.in. GoMiGo&apos;s decision is final in all disputes.</p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">7. Governing Law</h2>
            <p>These terms are governed by the laws of India. Jurisdiction: Tamil Nadu courts.</p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">8. Contact</h2>
            <p>For questions: <a href="mailto:support@gomigo.in" className="text-green-700 underline">support@gomigo.in</a></p>
          </section>
        </div>
        <div className="mt-10">
          <Link href="/" className="text-green-700 hover:underline">← Back to Home</Link>
        </div>
      </div>
    </div>
  )
}
