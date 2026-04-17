'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Car, Hotel, Compass, Calendar, MapPin, Clock, ChevronRight,
  Star, AlertTriangle, CheckCircle2, XCircle, Loader2, Package,
  ArrowRight, RefreshCw,
} from 'lucide-react'
import { formatINR } from '@/lib/utils/currency'
import { format, parseISO, differenceInHours } from 'date-fns'

type TabKey = 'upcoming' | 'past' | 'cancelled'

interface Booking {
  id: string
  booking_reference: string
  booking_type: 'cab' | 'auto' | 'hotel' | 'tour'
  status: string
  payment_status: string
  total_paise: number
  created_at: string
  checkin_date: string | null
  tour_date: string | null
  pickup_name: string | null
  destination_name: string | null
  provider_name?: string
  has_review?: boolean
}

function tripDate(booking: Booking): string | null {
  return booking.checkin_date || booking.tour_date || null
}

function classifyTab(booking: Booking): TabKey {
  if (booking.status === 'cancelled') return 'cancelled'
  const date = tripDate(booking)
  if (!date) return 'past'
  const now = new Date()
  const tripDateObj = parseISO(date)
  return tripDateObj >= now ? 'upcoming' : 'past'
}

function canCancel(booking: Booking): boolean {
  const date = tripDate(booking)
  if (!date) return false
  const hoursUntilTrip = differenceInHours(parseISO(date), new Date())
  return hoursUntilTrip > 24
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending:   { label: 'Pending',   color: 'bg-yellow-50 text-yellow-700 border-yellow-200', icon: <Clock className="w-3.5 h-3.5" /> },
  confirmed: { label: 'Confirmed', color: 'bg-green-50 text-green-700 border-green-200',   icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  active:    { label: 'Active',    color: 'bg-blue-50 text-blue-700 border-blue-200',      icon: <ArrowRight className="w-3.5 h-3.5" /> },
  completed: { label: 'Completed', color: 'bg-gray-50 text-gray-700 border-gray-200',     icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  cancelled: { label: 'Cancelled', color: 'bg-red-50 text-red-700 border-red-200',        icon: <XCircle className="w-3.5 h-3.5" /> },
}

const TYPE_ICON: Record<string, React.ReactNode> = {
  cab:   <Car className="w-4 h-4 text-blue-500" />,
  auto:  <Car className="w-4 h-4 text-yellow-500" />,
  hotel: <Hotel className="w-4 h-4 text-purple-500" />,
  tour:  <Compass className="w-4 h-4 text-orange-500" />,
}

const TYPE_LABEL: Record<string, string> = {
  cab:   'Cab',
  auto:  'Auto Rickshaw',
  hotel: 'Hotel Stay',
  tour:  'Tour Guide',
}

function EmptyState({ tab }: { tab: TabKey }) {
  const configs: Record<TabKey, { emoji: string; title: string; body: string; cta?: string; ctaHref?: string }> = {
    upcoming: {
      emoji: '🗺️',
      title: 'No upcoming trips',
      body: 'You have no trips booked yet. Explore hill stations and book a cab, hotel, or guide!',
      cta: 'Browse Destinations',
      ctaHref: '/places/nilgiris',
    },
    past: {
      emoji: '🎒',
      title: 'No past trips',
      body: 'Your completed trips will appear here. Ready to explore the Nilgiris?',
      cta: 'Plan a Trip',
      ctaHref: '/itinerary',
    },
    cancelled: {
      emoji: '✅',
      title: 'No cancelled trips',
      body: "Great news — you haven't cancelled any trips!",
    },
  }
  const c = configs[tab]
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <span className="text-6xl mb-4">{c.emoji}</span>
      <h3 className="text-lg font-bold text-gray-900 mb-2">{c.title}</h3>
      <p className="text-gray-500 text-sm max-w-sm mb-6">{c.body}</p>
      {c.cta && c.ctaHref && (
        <Link
          href={c.ctaHref}
          className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors"
        >
          {c.cta} <ArrowRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  )
}

function TripCard({
  booking,
  onCancel,
  cancelling,
}: {
  booking: Booking
  onCancel: (id: string) => void
  cancelling: boolean
}) {
  const date = tripDate(booking)
  const status = STATUS_CONFIG[booking.status] || STATUS_CONFIG['pending']
  const tab = classifyTab(booking)
  const showCancel = tab === 'upcoming' && canCancel(booking) && booking.status !== 'cancelled'
  const showLeaveReview = tab === 'past' && booking.status === 'completed' && !booking.has_review

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-green-200 hover:shadow-sm transition-all">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Reference + status */}
          <div className="flex items-center flex-wrap gap-2 mb-3">
            <span className="font-mono text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
              {booking.booking_reference}
            </span>
            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${status.color}`}>
              {status.icon}
              {status.label}
            </span>
          </div>

          {/* Type + provider */}
          <div className="flex items-center gap-2 mb-1">
            <span>{TYPE_ICON[booking.booking_type]}</span>
            <span className="text-sm font-semibold text-gray-800">
              {TYPE_LABEL[booking.booking_type] || booking.booking_type}
            </span>
            {booking.provider_name && (
              <>
                <span className="text-gray-300">·</span>
                <span className="text-sm text-gray-600">{booking.provider_name}</span>
              </>
            )}
          </div>

          {/* Date */}
          {date && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
              <Calendar className="w-3.5 h-3.5" />
              {format(parseISO(date), 'EEE, d MMM yyyy')}
            </div>
          )}

          {/* Route / location */}
          {(booking.pickup_name || booking.destination_name) && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">
                {booking.pickup_name}
                {booking.pickup_name && booking.destination_name && ' → '}
                {booking.destination_name}
              </span>
            </div>
          )}
        </div>

        {/* Amount */}
        <div className="text-right shrink-0">
          <div className="font-bold text-gray-900">{formatINR(booking.total_paise)}</div>
          <div className="text-xs text-gray-400 mt-0.5">
            {format(parseISO(booking.created_at), 'd MMM')}
          </div>
        </div>
      </div>

      {/* Actions */}
      {(showCancel || showLeaveReview) && (
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
          {showLeaveReview && (
            <Link
              href={`/reviews/new?bookingId=${booking.id}`}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition-colors"
            >
              <Star className="w-3.5 h-3.5" />
              Leave Review
            </Link>
          )}
          {showCancel && (
            <button
              onClick={() => onCancel(booking.id)}
              disabled={cancelling}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-red-700 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
            >
              {cancelling ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
              Cancel
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default function MyTripsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabKey>('upcoming')
  const [allBookings, setAllBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  const fetchBookings = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/bookings', { credentials: 'include' })
      if (res.status === 401) {
        router.replace('/login')
        return
      }
      if (!res.ok) throw new Error('Failed to fetch bookings')
      const json = await res.json()
      setAllBookings((json.data as Booking[]) || [])
    } catch {
      setError('Could not load your trips. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  const handleCancel = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking? Cancellation fees may apply.')) return
    setCancellingId(bookingId)
    try {
      const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'POST',
        credentials: 'include',
      })
      if (res.ok) {
        setAllBookings((prev) =>
          prev.map((b) => (b.id === bookingId ? { ...b, status: 'cancelled' } : b))
        )
      } else {
        alert('Unable to cancel at this time. Please contact support.')
      }
    } catch {
      alert('Network error. Please try again.')
    } finally {
      setCancellingId(null)
    }
  }

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'past',     label: 'Past' },
    { key: 'cancelled', label: 'Cancelled' },
  ]

  const filteredBookings = allBookings.filter((b) => classifyTab(b) === activeTab)

  const tabCounts = {
    upcoming:  allBookings.filter((b) => classifyTab(b) === 'upcoming').length,
    past:      allBookings.filter((b) => classifyTab(b) === 'past').length,
    cancelled: allBookings.filter((b) => classifyTab(b) === 'cancelled').length,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Trips</h1>
              <p className="text-sm text-gray-500 mt-0.5">All your GoMiGo bookings in one place</p>
            </div>
            <button
              onClick={fetchBookings}
              disabled={loading}
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-green-600 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-5 border-b border-gray-200 -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-green-600 text-green-700'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                {tab.label}
                {tabCounts[tab.key] > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                    activeTab === tab.key
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {tabCounts[tab.key]}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-green-600 animate-spin mb-3" />
            <p className="text-gray-500 text-sm">Loading your trips…</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">{error}</p>
              <button
                onClick={fetchBookings}
                className="text-xs text-red-600 hover:underline mt-1"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {/* Bookings list */}
        {!loading && !error && filteredBookings.length === 0 && (
          <EmptyState tab={activeTab} />
        )}

        {!loading && !error && filteredBookings.length > 0 && (
          <div className="space-y-3">
            {filteredBookings.map((booking) => (
              <TripCard
                key={booking.id}
                booking={booking}
                onCancel={handleCancel}
                cancelling={cancellingId === booking.id}
              />
            ))}
          </div>
        )}

        {/* Promo: plan your next trip */}
        {!loading && !error && (
          <div className="mt-8 bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl p-6 text-white flex items-center justify-between gap-4">
            <div>
              <div className="text-lg font-bold mb-1">Plan Your Next Trip</div>
              <p className="text-green-100 text-sm">Use our AI itinerary planner to explore the Nilgiris</p>
            </div>
            <Link
              href="/itinerary"
              className="shrink-0 bg-white text-green-700 font-semibold px-4 py-2 rounded-xl text-sm hover:bg-green-50 transition-colors flex items-center gap-1.5"
            >
              Plan Now <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
