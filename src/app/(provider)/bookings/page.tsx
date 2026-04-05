'use client'

import { useEffect, useState, useCallback } from 'react'
import { formatINR } from '@/src/lib/utils/currency'
import { format } from 'date-fns'
import { CheckCircle2, XCircle, Check, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'

type BookingStatus = 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'

interface Booking {
  id: string
  booking_reference: string
  booking_type: string
  status: string
  total_paise: number
  created_at: string
  tour_date: string | null
  checkin_date: string | null
  pickup_name: string | null
  tourist_name: string
  tourist_phone_last4: string
}

const STATUS_TABS: { value: BookingStatus; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
  confirmed: 'bg-blue-100 text-blue-700 border border-blue-200',
  completed: 'bg-green-100 text-green-700 border border-green-200',
  cancelled: 'bg-red-100 text-red-600 border border-red-200',
}

const PER_PAGE = 10

export default function ProviderBookingsPage() {
  const [activeTab, setActiveTab] = useState<BookingStatus>('all')
  const [bookings, setBookings] = useState<Booking[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchBookings = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({
      role: 'provider',
      page: String(page),
      limit: String(PER_PAGE),
    })
    if (activeTab !== 'all') params.set('status', activeTab)

    const res = await fetch(`/api/provider/bookings?${params}`)
    if (res.ok) {
      const json = await res.json()
      setBookings(json.data || [])
      setTotal(json.total || 0)
    }
    setLoading(false)
  }, [activeTab, page])

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  useEffect(() => {
    setPage(1)
  }, [activeTab])

  async function updateStatus(id: string, status: 'confirmed' | 'declined' | 'completed') {
    setActionLoading(id + status)
    const res = await fetch(`/api/bookings/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setActionLoading(null)
    if (res.ok) {
      fetchBookings()
    }
  }

  const totalPages = Math.ceil(total / PER_PAGE)

  function maskName(name: string, lastDigits?: string): string {
    if (!name) return 'Tourist'
    const parts = name.trim().split(' ')
    const masked = parts[0] + (parts[1] ? ' ' + parts[1].charAt(0) + '.' : '')
    return masked
  }

  function getBookingDate(b: Booking): string {
    const d = b.tour_date || b.checkin_date || b.created_at
    if (!d) return '—'
    return format(new Date(d), 'dd MMM yyyy')
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
        <p className="text-gray-500 text-sm mt-0.5">Manage incoming booking requests</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit mb-6">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.value
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          Loading bookings…
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-2">📋</p>
          <p className="font-medium">No {activeTab === 'all' ? '' : activeTab} bookings</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col sm:flex-row sm:items-center gap-4"
            >
              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                    {b.booking_reference}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                      STATUS_COLORS[b.status] || 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {b.status}
                  </span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full capitalize">
                    {b.booking_type}
                  </span>
                </div>
                <div className="mt-1.5 flex items-center gap-4 text-sm text-gray-800">
                  <span className="font-semibold">{maskName(b.tourist_name)}</span>
                  {b.tourist_phone_last4 && (
                    <span className="text-gray-400 text-xs">***{b.tourist_phone_last4}</span>
                  )}
                </div>
                <div className="mt-0.5 text-xs text-gray-400 flex items-center gap-3">
                  <span>{getBookingDate(b)}</span>
                  {b.pickup_name && (
                    <span className="truncate max-w-[180px]">{b.pickup_name}</span>
                  )}
                </div>
              </div>

              {/* Amount */}
              <div className="text-right shrink-0">
                <p className="font-bold text-gray-900 text-lg">{formatINR(b.total_paise)}</p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 shrink-0">
                {b.status === 'pending' && (
                  <>
                    <button
                      onClick={() => updateStatus(b.id, 'confirmed')}
                      disabled={actionLoading !== null}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-semibold transition-colors disabled:opacity-60"
                    >
                      {actionLoading === b.id + 'confirmed' ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      )}
                      Accept
                    </button>
                    <button
                      onClick={() => updateStatus(b.id, 'declined')}
                      disabled={actionLoading !== null}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-semibold transition-colors disabled:opacity-60"
                    >
                      {actionLoading === b.id + 'declined' ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5" />
                      )}
                      Decline
                    </button>
                  </>
                )}
                {b.status === 'confirmed' && (
                  <button
                    onClick={() => updateStatus(b.id, 'completed')}
                    disabled={actionLoading !== null}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors disabled:opacity-60"
                  >
                    {actionLoading === b.id + 'completed' ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    )}
                    Mark Complete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-gray-500">
            Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, total)} of {total}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => Math.abs(p - page) <= 2)
              .map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                    p === page
                      ? 'bg-green-600 text-white'
                      : 'border border-gray-200 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  {p}
                </button>
              ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
