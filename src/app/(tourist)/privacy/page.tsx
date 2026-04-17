import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy | GoMiGo',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: January 2026 · Compliant with DPDP Act 2023</p>

        <div className="space-y-8 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Data We Collect</h2>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Phone number (required for OTP login)</li>
              <li>Name and language preference (optional, for personalisation)</li>
              <li>Booking history (for your records and dispute resolution)</li>
              <li>For providers: Aadhaar, PAN, vehicle documents (for KYC verification only)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. How We Use Your Data</h2>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Authenticate you via OTP — we never store OTP codes</li>
              <li>Send booking confirmations and updates via WhatsApp</li>
              <li>Verify provider identity and credentials</li>
              <li>Process payments via Razorpay (we never store card details)</li>
              <li>Improve platform safety and service quality</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Data Storage</h2>
            <p className="text-sm">
              All data is stored in India on Supabase&apos;s Mumbai region servers, compliant with
              the Digital Personal Data Protection Act 2023 (DPDP Act). We do not transfer personal
              data outside India.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Your Rights (DPDP 2023)</h2>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Right to access your personal data</li>
              <li>Right to correct inaccurate data</li>
              <li>Right to erasure (deletion of your account and data)</li>
              <li>Right to nominate a person to act on your behalf</li>
            </ul>
            <p className="text-sm mt-3">
              To exercise any right, email <a href="mailto:privacy@gomigo.in" className="text-green-700 underline">privacy@gomigo.in</a>.
              We respond within 72 hours.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Third Parties</h2>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li><strong>Razorpay</strong> — payment processing (PCI-DSS compliant)</li>
              <li><strong>Wati.io / Meta</strong> — WhatsApp notifications</li>
              <li><strong>Digilocker / UIDAI</strong> — Aadhaar verification</li>
              <li><strong>Parivahan</strong> — vehicle permit verification</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Cookies</h2>
            <p className="text-sm">
              We use only essential cookies for authentication (session management). We do not use
              advertising cookies or tracking pixels.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Contact</h2>
            <p className="text-sm">
              Data Protection Officer: <a href="mailto:privacy@gomigo.in" className="text-green-700 underline">privacy@gomigo.in</a><br />
              GoMiGo, India
            </p>
          </section>
        </div>

        <div className="mt-10">
          <Link href="/" className="text-green-700 hover:underline">← Back to Home</Link>
        </div>
      </div>
    </div>
  )
}
