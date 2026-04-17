'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Shield, CheckCircle, Phone, ChevronRight, Star, Zap, Clock } from 'lucide-react'

const SERVICE_TYPES = [
  { id: 'driver', label: 'Cab Driver', icon: '🚗', desc: 'Tourist cab with permit' },
  { id: 'auto_driver', label: 'Auto Driver', icon: '🛺', desc: 'Auto rickshaw within city' },
  { id: 'hotel_owner', label: 'Hotel / Homestay', icon: '🏨', desc: 'Rooms or full property' },
  { id: 'tour_guide', label: 'Tour Guide', icon: '🧭', desc: 'Local sightseeing guide' },
]

export default function ProviderRegisterPage() {
  const [selected, setSelected] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-green-800 text-white py-14 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-green-700 rounded-full px-4 py-1.5 text-sm mb-4">
            <Zap className="w-4 h-4" /> Free for 60 days — no credit card needed
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            List Your Service on GoMiGo
          </h1>
          <p className="text-green-100 text-lg">
            Reach thousands of tourists visiting Nilgiris. Get bookings directly on WhatsApp.
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { value: '60 days', label: 'Free trial' },
            { value: '₹299/mo', label: 'After trial' },
            { value: '0%', label: 'Commission on cash' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border p-4 text-center">
              <div className="text-2xl font-bold text-green-700">{s.value}</div>
              <div className="text-sm text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Service type selection */}
        <div className="bg-white rounded-xl border p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-1">What service do you provide?</h2>
          <p className="text-sm text-gray-500 mb-4">Select the type that best fits your service</p>
          <div className="grid grid-cols-2 gap-3">
            {SERVICE_TYPES.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelected(s.id)}
                className={`border rounded-xl p-4 text-left transition-all ${
                  selected === s.id
                    ? 'border-green-600 bg-green-50 ring-1 ring-green-600'
                    : 'border-gray-200 hover:border-green-300'
                }`}
              >
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className="font-medium text-gray-900 text-sm">{s.label}</div>
                <div className="text-xs text-gray-500">{s.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Requirements */}
        <div className="bg-white rounded-xl border p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-700" />
            What you&apos;ll need
          </h2>
          <ul className="space-y-3">
            {[
              'Aadhaar card (mandatory for all)',
              selected === 'driver' || selected === 'auto_driver'
                ? 'Vehicle RC book + Tourist permit'
                : selected === 'hotel_owner'
                ? 'Property documents / GST certificate'
                : 'Government ID + relevant certification',
              'Active Indian mobile number',
              'WhatsApp account on same number',
            ].map((req) => (
              <li key={req} className="flex items-start gap-2 text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                {req}
              </li>
            ))}
          </ul>
        </div>

        {/* How it works */}
        <div className="bg-white rounded-xl border p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">How it works</h2>
          <div className="space-y-4">
            {[
              { step: '01', title: 'Sign up with your phone', desc: 'OTP verification — takes 30 seconds' },
              { step: '02', title: 'Upload KYC documents', desc: 'Aadhaar + relevant permits. Auto-verified within 24h' },
              { step: '03', title: 'Create your listing', desc: 'Photos, description, price — we help you set it right' },
              { step: '04', title: 'Start getting bookings', desc: 'Tourists book you, you get WhatsApp notification instantly' },
            ].map((item) => (
              <div key={item.step} className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 font-bold text-sm flex items-center justify-center shrink-0">
                  {item.step}
                </div>
                <div>
                  <div className="font-medium text-gray-900 text-sm">{item.title}</div>
                  <div className="text-xs text-gray-500">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/login?role=provider"
            className="inline-flex items-center gap-2 bg-green-700 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-green-800 transition-colors w-full justify-center"
          >
            <Phone className="w-5 h-5" />
            Register with Phone Number
          </Link>
          <p className="text-sm text-gray-500 mt-3">
            Already registered?{' '}
            <Link href="/login" className="text-green-700 hover:underline">
              Sign in →
            </Link>
          </p>
          <p className="text-xs text-gray-400 mt-2">
            By registering, you agree to our{' '}
            <Link href="/terms" className="underline">Terms</Link> and{' '}
            <Link href="/privacy" className="underline">Privacy Policy</Link>.
            KYC verification required before going live.
          </p>
        </div>
      </div>
    </div>
  )
}
