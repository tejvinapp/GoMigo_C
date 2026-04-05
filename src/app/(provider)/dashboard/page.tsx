import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/src/lib/supabase/server'
import { formatINR } from '@/src/lib/utils/currency'
import { format } from 'date-fns'
import {
  CalendarDays,
  IndianRupee,
  Star,
  ListChecks,
  PlusCircle,
  BarChart2,
  CalendarClock,
  Bell,
  ArrowRight,
  CreditCard,
} from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-600',
}

function maskName(name: string): string {
  if (!name) return 'Tourist'
  const parts = name.trim().split(' ')
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase() + '***'
  return parts[0] + ' ' + parts[1].charAt(0).toUpperCase() + '.'
}

export const dynamic = 'force-dynamic'

export default async function ProviderDashboardPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Get provider profile
  const { data: profile } = await supabase
    .from('provider_profiles')
    .select('id, display_name, reputation_score, total_reviews')
    .eq('user_id', user.id)
    .single()

  if (!profile) redirect('/')

  const providerId = profile.id
  const today = new Date().toISOString().slice(0, 10)
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()

  // Parallel fetches
  const [
    { count: todayBookings },
    { data: monthBookings },
    { count: activeListings },
    { data: recentBookings },
    { data: subscription },
    { data: notifications },
  ] = await Promise.all([
    supabase
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .eq('provider_id', providerId)
      .gte('created_at', today),

    supabase
      .from('bookings')
      .select('provider_payout_paise, status')
      .eq('provider_id', providerId)
      .gte('created_at', monthStart)
      .in('status', ['completed', 'confirmed']),

    supabase
      .from('listings')
      .select('id', { count: 'exact', head: true })
      .eq('provider_id', providerId)
      .eq('listing_visible', true)
      .is('deleted_at', null),

    supabase
      .from('bookings')
      .select(
        `booking_reference, status, total_paise, created_at,
         booking_type,
         users!tourist_id (full_name, phone)`
      )
      .eq('provider_id', providerId)
      .order('created_at', { ascending: false })
      .limit(5),

    supabase
      .from('subscriptions')
      .select('tier, expires_at, status')
      .eq('provider_id', providerId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),

    supabase
      .from('notifications')
      .select('id, title, body, is_read, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const monthEarnings = (monthBookings || []).reduce(
    (sum, b) => sum + (b.provider_payout_paise || 0),
    0
  )

  const tierLabel = subscription?.tier || 'free'
  const expiryDate = subscription?.expires_at
    ? format(new Date(subscription.expires_at), 'dd MMM yyyy')
    : 'No expiry'

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {profile.display_name}
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">{format(new Date(), 'EEEE, dd MMMM yyyy')}</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
            <CalendarDays className="w-4 h-4 text-blue-500" />
            Today&apos;s Bookings
          </div>
          <p className="text-3xl font-bold text-gray-900">{todayBookings ?? 0}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
            <IndianRupee className="w-4 h-4 text-green-500" />
            This Month
          </div>
          <p className="text-3xl font-bold text-gray-900">{formatINR(monthEarnings)}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
            <Star className="w-4 h-4 text-yellow-500" />
            Rating
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {profile.reputation_score ? profile.reputation_score.toFixed(1) : '—'}
          </p>
          <p className="text-xs text-gray-400">{profile.total_reviews ?? 0} reviews</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
            <ListChecks className="w-4 h-4 text-purple-500" />
            Active Listings
          </div>
          <p className="text-3xl font-bold text-gray-900">{activeListings ?? 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Bookings */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-800">Recent Bookings</h2>
              <Link
                href="/provider/bookings"
                className="text-xs text-green-600 hover:underline flex items-center gap-1"
              >
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {recentBookings && recentBookings.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-xs text-gray-400 uppercase">
                      <th className="px-5 py-3 text-left font-medium">Ref</th>
                      <th className="px-5 py-3 text-left font-medium">Tourist</th>
                      <th className="px-5 py-3 text-left font-medium">Service</th>
                      <th className="px-5 py-3 text-left font-medium">Date</th>
                      <th className="px-5 py-3 text-right font-medium">Amount</th>
                      <th className="px-5 py-3 text-center font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBookings.map((b) => {
                      const tourist = b.users as { full_name?: string; phone?: string } | null
                      return (
                        <tr key={b.booking_reference} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="px-5 py-3 font-mono text-xs text-gray-600">
                            {b.booking_reference}
                          </td>
                          <td className="px-5 py-3 text-gray-700">
                            {maskName(tourist?.full_name || '')}
                          </td>
                          <td className="px-5 py-3 capitalize text-gray-600">{b.booking_type}</td>
                          <td className="px-5 py-3 text-gray-500 text-xs">
                            {format(new Date(b.created_at), 'dd MMM, HH:mm')}
                          </td>
                          <td className="px-5 py-3 text-right font-medium text-gray-800">
                            {formatINR(b.total_paise)}
                          </td>
                          <td className="px-5 py-3 text-center">
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                STATUS_COLORS[b.status] || 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {b.status}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center text-gray-400 text-sm">No bookings yet</div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-800 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-3 gap-3">
              <Link
                href="/provider/listings/new"
                className="flex flex-col items-center gap-2 p-4 rounded-xl border border-dashed border-green-300 hover:bg-green-50 transition-colors text-center"
              >
                <PlusCircle className="w-6 h-6 text-green-600" />
                <span className="text-sm font-medium text-green-700">Add Listing</span>
              </Link>
              <Link
                href="/provider/earnings"
                className="flex flex-col items-center gap-2 p-4 rounded-xl border border-dashed border-blue-300 hover:bg-blue-50 transition-colors text-center"
              >
                <BarChart2 className="w-6 h-6 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">View Earnings</span>
              </Link>
              <Link
                href="/provider/availability"
                className="flex flex-col items-center gap-2 p-4 rounded-xl border border-dashed border-purple-300 hover:bg-purple-50 transition-colors text-center"
              >
                <CalendarClock className="w-6 h-6 text-purple-600" />
                <span className="text-sm font-medium text-purple-700">Update Availability</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Subscription Status */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="w-4 h-4 text-gray-500" />
              <h2 className="font-semibold text-gray-800">Subscription</h2>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`text-xs font-bold uppercase px-2 py-1 rounded-full ${
                  tierLabel === 'pro'
                    ? 'bg-yellow-100 text-yellow-700'
                    : tierLabel === 'basic'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {tierLabel}
              </span>
              {subscription?.status === 'active' && (
                <span className="text-xs text-green-600 font-medium">Active</span>
              )}
            </div>
            <p className="text-xs text-gray-400 mb-4">
              {tierLabel === 'free' ? 'Free plan — limited listings' : `Expires: ${expiryDate}`}
            </p>
            {tierLabel !== 'pro' && (
              <Link
                href="/provider/settings#subscription"
                className="block w-full text-center text-sm font-semibold bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition-colors"
              >
                Upgrade Plan
              </Link>
            )}
          </div>

          {/* Notifications Feed */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
              <Bell className="w-4 h-4 text-gray-500" />
              <h2 className="font-semibold text-gray-800">Notifications</h2>
            </div>
            {notifications && notifications.length > 0 ? (
              <ul className="divide-y divide-gray-50">
                {notifications.map((n) => (
                  <li key={n.id} className="px-5 py-3 hover:bg-gray-50">
                    <div className="flex items-start gap-2">
                      {!n.is_read && (
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                      )}
                      <div className={n.is_read ? 'ml-3.5' : ''}>
                        <p className="text-sm font-medium text-gray-800">{n.title}</p>
                        <p className="text-xs text-gray-500 line-clamp-2">{n.body}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {format(new Date(n.created_at), 'dd MMM, HH:mm')}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="py-8 text-center text-gray-400 text-sm">No notifications</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
