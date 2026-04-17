import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Download, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function DownloadDataPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()

  // Gather all user data
  const [profile, bookings, reviews] = await Promise.all([
    admin.from('users').select('*').eq('id', user.id).single(),
    admin.from('bookings').select('booking_reference, booking_type, status, total_paise, created_at, tour_date, checkin_date').eq('tourist_id', user.id).order('created_at', { ascending: false }),
    admin.from('reviews').select('rating, review_text_en, created_at').eq('reviewer_id', user.id).order('created_at', { ascending: false }),
  ])

  const dataExport = {
    exported_at: new Date().toISOString(),
    profile: profile.data ? {
      id: profile.data.id,
      phone: profile.data.phone,
      email: profile.data.email,
      full_name: profile.data.full_name,
      preferred_language: profile.data.preferred_language,
      referral_code: profile.data.referral_code,
      created_at: profile.data.created_at,
    } : null,
    bookings: bookings.data || [],
    reviews: reviews.data || [],
  }

  const dataStr = JSON.stringify(dataExport, null, 2)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6 flex items-center gap-3">
          <Link href="/profile" className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Download My Data</h1>
            <p className="text-gray-500 text-sm mt-0.5">DPDP Act 2023 — Right to Access</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl space-y-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-800 mb-3">Your Data Summary</h2>
          <div className="grid grid-cols-3 gap-4 text-center mb-6">
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="text-2xl font-bold text-gray-900">{(bookings.data || []).length}</div>
              <div className="text-xs text-gray-500 mt-1">Bookings</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="text-2xl font-bold text-gray-900">{(reviews.data || []).length}</div>
              <div className="text-xs text-gray-500 mt-1">Reviews</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="text-2xl font-bold text-green-600">✓</div>
              <div className="text-xs text-gray-500 mt-1">Profile</div>
            </div>
          </div>

          <p className="text-sm text-gray-500 mb-4">
            Your data export includes your profile, all booking history, and reviews you&apos;ve written.
            This data is provided in JSON format in compliance with India&apos;s Digital Personal Data Protection Act 2023.
          </p>

          <a
            href={`data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`}
            download={`gomigo-data-${user.id.slice(0, 8)}.json`}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            <Download className="w-4 h-4" />
            Download My Data (JSON)
          </a>

          <p className="text-xs text-gray-400 mt-3">
            Data export generated on {new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
          </p>
        </div>
      </div>
    </div>
  )
}
