import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Cancellation Policy | GoMiGo' }

export default function CancellationPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Cancellation Policy</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: January 2026</p>
        <div className="space-y-8 text-gray-700 text-sm">

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">Flexible Policy</h2>
            <div className="bg-green-50 rounded-lg p-4 space-y-2">
              <p>✅ <strong>Free cancellation</strong> up to 24 hours before service start</p>
              <p>⚠️ <strong>50% refund</strong> for cancellation 6–24 hours before</p>
              <p>❌ <strong>No refund</strong> for cancellation less than 6 hours before</p>
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">Moderate Policy</h2>
            <div className="bg-amber-50 rounded-lg p-4 space-y-2">
              <p>✅ <strong>Free cancellation</strong> up to 48 hours before service start</p>
              <p>⚠️ <strong>50% refund</strong> for cancellation 24–48 hours before</p>
              <p>❌ <strong>No refund</strong> for cancellation less than 24 hours before</p>
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">Strict Policy</h2>
            <div className="bg-red-50 rounded-lg p-4 space-y-2">
              <p>✅ <strong>Free cancellation</strong> up to 72 hours before service start</p>
              <p>⚠️ <strong>25% refund</strong> for cancellation 48–72 hours before</p>
              <p>❌ <strong>No refund</strong> for cancellation less than 48 hours before</p>
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">Provider Cancellations</h2>
            <p>If a provider cancels your booking:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>You receive a <strong>full refund</strong> within 5–7 business days</li>
              <li>GoMiGo will help you find an alternative provider</li>
              <li>Repeated provider cancellations lead to account suspension</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">Refund Processing</h2>
            <p>Refunds are processed to the original payment method within 5–7 business days. For cash bookings, no refund processing is required.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">How to Cancel</h2>
            <p>Cancel directly from your <Link href="/my-trips" className="text-green-700 underline">My Trips</Link> page or contact support at <a href="mailto:support@gomigo.in" className="text-green-700 underline">support@gomigo.in</a>.</p>
          </section>
        </div>
        <div className="mt-10">
          <Link href="/" className="text-green-700 hover:underline">← Back to Home</Link>
        </div>
      </div>
    </div>
  )
}
