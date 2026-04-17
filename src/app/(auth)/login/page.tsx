'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Phone, ArrowRight, Shield, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [phone, setPhone] = useState('')
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const supabase = createClient()

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '')
    if (digits.length <= 10) return digits
    return digits.slice(-10)
  }

  async function handleSendOTP(e: React.FormEvent) {
    e.preventDefault()
    if (phone.length !== 10) {
      setError('Please enter a valid 10-digit phone number')
      return
    }
    setError('')
    setLoading(true)

    const fullPhone = `+91${phone}`
    const { error: signInError } = await supabase.auth.signInWithOtp({
      phone: fullPhone,
      options: { channel: 'whatsapp' },
    })

    setLoading(false)
    if (signInError) {
      setError(signInError.message.includes('rate') ? 'Too many attempts. Wait 30 minutes.' : 'Failed to send OTP. Try again.')
    } else {
      setStep('otp')
    }
  }

  async function handleVerifyOTP(e: React.FormEvent) {
    e.preventDefault()
    if (otp.length !== 6) {
      setError('Please enter the 6-digit OTP')
      return
    }
    setError('')
    setLoading(true)

    const { error: verifyError } = await supabase.auth.verifyOtp({
      phone: `+91${phone}`,
      token: otp,
      type: 'sms',
    })

    setLoading(false)
    if (verifyError) {
      setError(verifyError.message.includes('expired') ? 'OTP expired. Request a new one.' : 'Wrong OTP. Check WhatsApp.')
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-2xl text-green-700">
            <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center text-white font-black">G</div>
            GoMiGo
          </Link>
          <p className="text-gray-500 mt-2 text-sm">India's Local Travel Super-App</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          {step === 'phone' ? (
            <>
              <h1 className="text-xl font-bold text-gray-900 mb-1">Log in or Sign up</h1>
              <p className="text-gray-500 text-sm mb-6">We'll send an OTP to your WhatsApp</p>
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <div className="flex">
                    <div className="flex items-center px-3 border border-r-0 border-gray-300 rounded-l-xl bg-gray-50 text-gray-600 text-sm font-medium">
                      +91
                    </div>
                    <input
                      id="phone"
                      type="tel"
                      inputMode="numeric"
                      value={phone}
                      onChange={(e) => setPhone(formatPhone(e.target.value))}
                      placeholder="9876543210"
                      maxLength={10}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-r-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg tracking-widest"
                      required
                    />
                  </div>
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button
                  type="submit"
                  disabled={loading || phone.length !== 10}
                  className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Phone className="w-5 h-5" /> Send OTP on WhatsApp</>}
                </button>
              </form>
            </>
          ) : (
            <>
              <h1 className="text-xl font-bold text-gray-900 mb-1">Enter OTP</h1>
              <p className="text-gray-500 text-sm mb-6">
                We sent a 6-digit OTP to WhatsApp on +91 {phone}
              </p>
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">6-digit OTP</label>
                  <input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456"
                    maxLength={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-2xl tracking-[0.5em] text-center font-mono"
                    autoFocus
                  />
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Verify OTP <ArrowRight className="w-5 h-5" /></>}
                </button>
                <button type="button" onClick={() => { setStep('phone'); setOtp(''); setError('') }} className="w-full text-sm text-gray-500 hover:text-green-600 transition-colors py-2">
                  ← Change phone number
                </button>
                <button type="button" onClick={handleSendOTP} className="w-full text-sm text-green-600 hover:text-green-700 font-medium transition-colors py-2">
                  Resend OTP
                </button>
              </form>
            </>
          )}

          <div className="mt-6 pt-4 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-400">
            <Shield className="w-3 h-3" />
            <span>Your data is safe. We only ask for your phone number.</span>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          By logging in, you agree to our{' '}
          <Link href="/terms" className="underline hover:text-gray-600">Terms</Link> and{' '}
          <Link href="/privacy" className="underline hover:text-gray-600">Privacy Policy</Link>
        </p>
      </div>
    </div>
  )
}
