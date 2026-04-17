import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle, Phone, Shield, Star, TrendingUp, Zap } from 'lucide-react'

export const metadata: Metadata = {
  title: 'How It Works for Providers | GoMiGo',
  description: 'Learn how to list your service on GoMiGo and start receiving bookings from tourists.',
}

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-green-800 text-white py-14 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">How GoMiGo Works for Providers</h1>
          <p className="text-green-100 text-lg">Everything you need to know before listing your service.</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10 space-y-10">

        {/* Steps */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-6">Getting Started</h2>
          <div className="space-y-4">
            {[
              {
                step: '1',
                title: 'Register with your phone number',
                desc: 'Sign up takes 30 seconds. Just your Indian mobile number — we verify via OTP. No email or password needed.',
                icon: <Phone className="w-5 h-5 text-green-700" />,
              },
              {
                step: '2',
                title: 'Complete KYC verification',
                desc: 'Upload your Aadhaar card + relevant documents (vehicle permit for drivers, property docs for hotels). Auto-verified via government APIs within 24 hours.',
                icon: <Shield className="w-5 h-5 text-green-700" />,
              },
              {
                step: '3',
                title: 'Create your listing',
                desc: 'Add your service details — photos, description in your language, pricing, and available dates. We help you set competitive prices based on local demand.',
                icon: <Star className="w-5 h-5 text-green-700" />,
              },
              {
                step: '4',
                title: 'Start receiving bookings',
                desc: 'Once approved, tourists can find and book you. You receive instant WhatsApp notifications for every new booking.',
                icon: <Zap className="w-5 h-5 text-green-700" />,
              },
            ].map((item) => (
              <div key={item.step} className="bg-white rounded-xl border p-5 flex gap-4">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center font-bold text-green-800 shrink-0">
                  {item.step}
                </div>
                <div>
                  <div className="font-semibold text-gray-900 mb-1">{item.title}</div>
                  <div className="text-sm text-gray-600">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section className="bg-white rounded-xl border p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Pricing</h2>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-700 mb-1">Free</div>
              <div className="font-medium text-gray-900">60-day trial</div>
              <div className="text-gray-500 mt-1">No credit card required. Full access to all features.</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="text-2xl font-bold text-green-700 mb-1">₹299/mo</div>
              <div className="font-medium text-gray-900">After trial</div>
              <div className="text-gray-500 mt-1">Pay monthly. Cancel anytime. No long-term lock-in.</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-700 mb-1">10%</div>
              <div className="font-medium text-gray-900">Commission</div>
              <div className="text-gray-500 mt-1">Only on completed online-paid bookings. Cash = 0% commission.</div>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Why List on GoMiGo?</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              'Tourists specifically searching for local, verified providers',
              'WhatsApp-first — no app installation needed for notifications',
              'Multilingual listings — attract tourists in their own language',
              'Transparent pricing with seasonal demand multipliers',
              'Admin support on every first booking',
              'Build your reputation with verified post-trip reviews',
            ].map((benefit) => (
              <div key={benefit} className="flex items-start gap-2 bg-white rounded-lg border p-3 text-sm">
                <CheckCircle className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                <span className="text-gray-700">{benefit}</span>
              </div>
            ))}
          </div>
        </section>

        <div className="text-center pt-4">
          <Link
            href="/provider/register"
            className="inline-block bg-green-700 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-green-800 transition-colors"
          >
            Register Now — It&apos;s Free →
          </Link>
        </div>
      </div>
    </div>
  )
}
