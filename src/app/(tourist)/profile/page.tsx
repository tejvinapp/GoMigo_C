import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  Shield, Key, Copy, Share2, Download, Trash2, ChevronRight,
  MapPin, CreditCard, Globe, Phone, Mail, User,
  ExternalLink,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { formatINR } from '@/lib/utils/currency'
import ProfileClient from '@/components/ProfileClient'

export const metadata: Metadata = {
  title: 'My Profile | GoMiGo',
}

const LANGUAGES = [
  { code: 'en', label: 'English',    nativeLabel: 'English' },
  { code: 'ta', label: 'Tamil',      nativeLabel: 'தமிழ்' },
  { code: 'te', label: 'Telugu',     nativeLabel: 'తెలుగు' },
  { code: 'kn', label: 'Kannada',    nativeLabel: 'ಕನ್ನಡ' },
  { code: 'ml', label: 'Malayalam',  nativeLabel: 'മലയാളം' },
  { code: 'hi', label: 'Hindi',      nativeLabel: 'हिंदी' },
  { code: 'mr', label: 'Marathi',    nativeLabel: 'मराठी' },
  { code: 'or', label: 'Odia',       nativeLabel: 'ଓଡ଼ିଆ' },
]

function maskPhone(phone: string): string {
  // +91 XXXXX XX890 — show last 3 digits, mask 7
  const digits = phone.replace(/\D/g, '')
  if (digits.length < 10) return phone
  const last3 = digits.slice(-3)
  const firstTwo = digits.slice(0, 2)
  return `+${firstTwo} XXXXX XX${last3}`
}

async function getProfileData(userId: string) {
  const supabase = createClient()
  const { data: profile } = await supabase
    .from('users')
    .select(`
      id,
      full_name,
      phone,
      preferred_language,
      referral_code,
      referral_count,
      avatar_url,
      has_ai_key
    `)
    .eq('id', userId)
    .single()

  return profile
}

async function getUserStats(userId: string) {
  const supabase = createClient()
  const { data } = await supabase
    .from('bookings')
    .select('total_paise, checkin_date, tour_date, destination_id, status')
    .eq('tourist_id', userId)
    .eq('status', 'completed')

  const bookings = data || []
  const totalTrips = bookings.length
  const totalSpentPaise = bookings.reduce((sum, b) => sum + (b.total_paise || 0), 0)
  const uniqueDestinations = new Set(bookings.map((b) => b.destination_id).filter(Boolean)).size

  return { totalTrips, totalSpentPaise, uniqueDestinations }
}

export default async function ProfilePage() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const [profile, stats] = await Promise.all([
    getProfileData(session.user.id),
    getUserStats(session.user.id),
  ])

  const email = session.user.email || ''
  const displayName = profile?.full_name || email.split('@')[0] || 'Traveller'
  const phone = profile?.phone || ''
  const preferredLanguage = profile?.preferred_language || 'en'
  const referralCode = profile?.referral_code || ''
  const referralCount = profile?.referral_count || 0
  const hasAIKey = profile?.has_ai_key || false
  const avatarUrl = profile?.avatar_url || null

  const currentLangLabel =
    LANGUAGES.find((l) => l.code === preferredLanguage)?.nativeLabel || 'English'

  const initials = displayName
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-700 to-teal-700 text-white">
        <div className="container mx-auto px-4 py-10">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            {/* Avatar */}
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-20 h-20 rounded-full object-cover border-4 border-white/30 shrink-0"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-white/20 border-4 border-white/30 flex items-center justify-center text-3xl font-bold shrink-0">
                {initials}
              </div>
            )}

            <div className="text-center sm:text-left">
              <h1 className="text-2xl font-bold">{displayName}</h1>
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 mt-1 text-green-200 text-sm">
                {email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" /> {email}
                  </span>
                )}
                {phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" /> {maskPhone(phone)}
                  </span>
                )}
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-green-200 text-xs">
                <Globe className="w-3.5 h-3.5" />
                Preferred language: {currentLangLabel}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-3xl space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Trips', value: stats.totalTrips.toString(), icon: <MapPin className="w-5 h-5 text-green-600" /> },
            { label: 'Total Spent', value: formatINR(stats.totalSpentPaise), icon: <CreditCard className="w-5 h-5 text-purple-600" /> },
            { label: 'Destinations', value: stats.uniqueDestinations.toString(), icon: <Globe className="w-5 h-5 text-blue-600" /> },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl border border-gray-200 p-4 text-center">
              <div className="flex justify-center mb-2">{stat.icon}</div>
              <div className="text-xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Personal info */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-gray-900">Personal Information</h2>
            <Link
              href="/profile/edit"
              className="text-xs text-green-600 hover:underline font-medium"
            >
              Edit
            </Link>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Name</p>
                <p className="text-sm font-medium text-gray-900">{displayName}</p>
              </div>
            </div>
            {email && (
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm font-medium text-gray-900">{email}</p>
                </div>
              </div>
            )}
            {phone && (
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Phone (masked for privacy)</p>
                  <p className="text-sm font-medium text-gray-900">{maskPhone(phone)}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Language preference */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-base font-bold text-gray-900 mb-4">Preferred Language</h2>
          <ProfileClient
            preferredLanguage={preferredLanguage}
            languages={LANGUAGES}
          />
        </div>

        {/* AI Key section */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center shrink-0">
              <Key className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-gray-900">AI Itinerary Key</h2>
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${hasAIKey ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {hasAIKey ? 'Active' : 'Not Set'}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">
                GoMiGo supports Bring Your Own AI (BYOAI). Connect your Gemini or Groq API key
                to get personalised itineraries without sharing your data with GoMiGo's servers.
              </p>
              <Link
                href="/settings/ai"
                className="inline-flex items-center gap-1.5 mt-3 text-sm font-medium text-purple-700 hover:text-purple-800 transition-colors"
              >
                {hasAIKey ? 'Manage AI Key' : 'Set Up AI Key'}
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Referral */}
        {referralCode && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
                <Share2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">Refer & Earn</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Share your code with friends. You both get a discount on the next booking!
                </p>
              </div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-xs text-green-700 font-medium mb-2">Your Referral Code</p>
              <div className="flex items-center gap-3">
                <span className="font-mono text-2xl font-bold tracking-widest text-green-800 flex-1">
                  {referralCode}
                </span>
                <ProfileCopyButton code={referralCode} />
              </div>
            </div>
            {referralCount > 0 && (
              <p className="text-xs text-gray-500 mt-2">
                {referralCount} friend{referralCount !== 1 ? 's' : ''} joined using your code
              </p>
            )}
          </div>
        )}

        {/* Privacy & DPDP */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-gray-400" />
            <h2 className="text-base font-bold text-gray-900">Privacy & Data</h2>
          </div>
          <p className="text-sm text-gray-500 mb-4 leading-relaxed">
            Under India's Digital Personal Data Protection Act 2023 (DPDP 2023), you have the right
            to access, correct, and erase your personal data held by GoMiGo.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/privacy/download-data"
              className="inline-flex items-center gap-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Download className="w-4 h-4" /> Download My Data
            </Link>
            <Link
              href="/privacy/delete-account"
              className="inline-flex items-center gap-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors"
            >
              <Trash2 className="w-4 h-4" /> Delete My Account
            </Link>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            Compliant with DPDP Act 2023 · Processed within 72 hours
          </p>
        </div>

        {/* Quick links */}
        <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100">
          {[
            { href: '/my-trips',     label: 'My Trips',          icon: <MapPin className="w-4 h-4 text-green-500" /> },
            { href: '/settings',     label: 'Account Settings',  icon: <Shield className="w-4 h-4 text-gray-400" /> },
            { href: '/settings/ai',  label: 'AI Key Settings',   icon: <Key className="w-4 h-4 text-purple-400" /> },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-6 py-4 hover:bg-gray-50 transition-colors"
            >
              {item.icon}
              <span className="text-sm font-medium text-gray-800 flex-1">{item.label}</span>
              <ChevronRight className="w-4 h-4 text-gray-300" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

// Tiny inline server-safe copy button placeholder — actual copy logic in ProfileClient
function ProfileCopyButton({ code }: { code: string }) {
  return (
    <Link
      href={`/profile?copy=${code}`}
      className="flex items-center gap-1.5 text-xs font-medium text-green-700 bg-white border border-green-200 px-3 py-1.5 rounded-lg hover:bg-green-50 transition-colors"
    >
      <Copy className="w-3.5 h-3.5" />
      Copy
    </Link>
  )
}
