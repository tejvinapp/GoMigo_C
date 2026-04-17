import type { Metadata } from 'next'
import Link from 'next/link'
import { Mail, MessageCircle, Phone } from 'lucide-react'

export const metadata: Metadata = { title: 'Contact Support | GoMiGo' }

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Contact Support</h1>
        <p className="text-gray-500 mb-10">We typically respond within 2 hours during business hours (9am–9pm IST).</p>

        <div className="space-y-4">
          <a
            href="https://wa.me/919999999999"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 bg-white border rounded-xl p-5 hover:border-green-400 transition-colors group"
          >
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center shrink-0">
              <MessageCircle className="w-6 h-6 text-green-700" />
            </div>
            <div>
              <div className="font-semibold text-gray-900 group-hover:text-green-700">WhatsApp (Fastest)</div>
              <div className="text-sm text-gray-500">+91 99999 99999 · Usually replies within 15 minutes</div>
            </div>
          </a>

          <a
            href="mailto:support@gomigo.in"
            className="flex items-center gap-4 bg-white border rounded-xl p-5 hover:border-green-400 transition-colors group"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
              <Mail className="w-6 h-6 text-blue-700" />
            </div>
            <div>
              <div className="font-semibold text-gray-900 group-hover:text-green-700">Email</div>
              <div className="text-sm text-gray-500">support@gomigo.in · Response within 2 hours</div>
            </div>
          </a>
        </div>

        <div className="mt-10 bg-white rounded-xl border p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Frequently Asked</h2>
          <div className="space-y-4 text-sm">
            {[
              {
                q: 'How do I cancel my booking?',
                a: 'Go to My Trips → select booking → Cancel. Refund is automatic per our cancellation policy.',
              },
              {
                q: 'My provider didn\'t show up. What do I do?',
                a: 'Contact us immediately on WhatsApp. We\'ll help find an alternative and process a full refund.',
              },
              {
                q: 'How long do refunds take?',
                a: '5–7 business days to the original payment method.',
              },
              {
                q: 'How do I become a provider?',
                a: <Link href="/provider/register" className="text-green-700 underline">Register here</Link>,
              },
            ].map((item) => (
              <div key={item.q} className="border-b pb-4 last:border-0 last:pb-0">
                <div className="font-medium text-gray-900">{item.q}</div>
                <div className="text-gray-600 mt-1">{item.a}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10">
          <Link href="/" className="text-green-700 hover:underline">← Back to Home</Link>
        </div>
      </div>
    </div>
  )
}
