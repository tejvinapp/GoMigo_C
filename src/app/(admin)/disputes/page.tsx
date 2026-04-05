'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AlertTriangle, RefreshCw, Loader2, Gavel } from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'

// ─── Types ───────────────────────────────────────────────────────────────────

interface DisputedBooking {
  id: string
  booking_reference: string
  status: string
  total_paise: number
  cancellation_reason: string | null
  created_at: string
  tourist_id: string
  tourist: {
    full_name: string | null
    phone: string
  } | null
  provider: {
    display_name: string
  } | null
}

type ResolveAction = 'refund_tourist' | 'pay_provider' | 'split'

const ACTION_LABELS: Record<ResolveAction, string> = {
  refund_tourist: 'Refund Tourist',
  pay_provider: 'Pay Provider',
  split: 'Split 50/50',
}

const ACTION_STYLES: Record<ResolveAction, string> = {
  refund_tourist: 'text-blue-700 bg-blue-50 hover:bg-blue-100',
  pay_provider: 'text-green-700 bg-green-50 hover:bg-green-100',
  split: 'text-purple-700 bg-purple-50 hover:bg-purple-100',
}

// ─── Dispute Row ──────────────────────────────────────────────────────────────

function DisputeRow({
  booking,
  onResolve,
}: {
  booking: DisputedBooking
  onResolve: (id: string, action: ResolveAction) => Promise<void>
}) {
  const [loadingAction, setLoadingAction] = useState<ResolveAction | null>(null)

  const handle = async (action: ResolveAction) => {
    setLoadingAction(action)
    await onResolve(booking.id, action)
    setLoadingAction(null)
  }

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-5 py-4">
        <p className="font-mono text-xs font-semibold text-gray-800">{booking.booking_reference}</p>
        <p className="text-xs text-gray-400 mt-0.5">
          {format(new Date(booking.created_at), 'dd MMM yyyy')}
        </p>
      </td>
      <td className="px-5 py-4">
        <p className="text-sm font-medium text-gray-800">
          {booking.tourist?.full_name ?? 'Unknown'}
        </p>
        <p className="text-xs text-gray-400">{booking.tourist?.phone}</p>
      </td>
      <td className="px-5 py-4">
        <p className="text-sm font-medium text-gray-800">
          {booking.provider?.display_name ?? 'Unknown'}
        </p>
      </td>
      <td className="px-5 py-4 text-sm font-semibold text-gray-900">
        ₹{(booking.total_paise / 100).toLocaleString('en-IN')}
      </td>
      <td className="px-5 py-4 max-w-xs">
        <p className="text-xs text-gray-600 line-clamp-2">
          {booking.cancellation_reason ?? 'No reason provided'}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          {formatDistanceToNow(new Date(booking.created_at), { addSuffix: true })}
        </p>
      </td>
      <td className="px-5 py-4">
        <div className="flex flex-wrap gap-1.5">
          {(['refund_tourist', 'pay_provider', 'split'] as ResolveAction[]).map((action) => (
            <button
              key={action}
              onClick={() => handle(action)}
              disabled={loadingAction !== null}
              className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors disabled:opacity-50 ${ACTION_STYLES[action]}`}
            >
              {loadingAction === action ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Gavel className="h-3 w-3" />
              )}
              {ACTION_LABELS[action]}
            </button>
          ))}
        </div>
      </td>
    </tr>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DisputesPage() {
  const [disputes, setDisputes] = useState<DisputedBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 4000)
  }

  const load = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()

    // Fetch disputed bookings with tourist and provider info
    const { data: bookings } = await supabase
      .from('bookings')
      .select(
        'id, booking_reference, status, total_paise, cancellation_reason, created_at, tourist_id'
      )
      .eq('status', 'disputed')
      .order('created_at', { ascending: false })

    if (!bookings || bookings.length === 0) {
      setDisputes([])
      setLoading(false)
      return
    }

    // Fetch tourists
    const touristIds = [...new Set(bookings.map((b) => b.tourist_id))]
    const { data: users } = await supabase
      .from('users')
      .select('id, full_name, phone')
      .in('id', touristIds)

    // Fetch provider profiles by booking provider_id
    const { data: bookingsWithProvider } = await supabase
      .from('bookings')
      .select('id, provider_id')
      .in(
        'id',
        bookings.map((b) => b.id)
      )

    const providerIds = [
      ...new Set((bookingsWithProvider ?? []).map((b) => b.provider_id)),
    ]
    const { data: providers } = await supabase
      .from('provider_profiles')
      .select('id, display_name')
      .in('id', providerIds)

    const userMap = Object.fromEntries((users ?? []).map((u) => [u.id, u]))
    const providerMap = Object.fromEntries((providers ?? []).map((p) => [p.id, p]))
    const bookingProviderMap = Object.fromEntries(
      (bookingsWithProvider ?? []).map((b) => [b.id, b.provider_id])
    )

    const enriched: DisputedBooking[] = bookings.map((b) => ({
      ...b,
      tourist: userMap[b.tourist_id] ?? null,
      provider: providerMap[bookingProviderMap[b.id]] ?? null,
    }))

    setDisputes(enriched)
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleResolve = async (bookingId: string, action: ResolveAction) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}/resolve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resolution: action }),
      })
      if (res.ok) {
        setDisputes((prev) => prev.filter((d) => d.id !== bookingId))
        showToast(`Dispute resolved: ${ACTION_LABELS[action]}`)
      } else {
        showToast('Failed to resolve dispute', false)
      }
    } catch {
      showToast('Error resolving dispute', false)
    }
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${
            toast.ok ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Disputes</h1>
          <p className="text-sm text-gray-500 mt-1">
            {disputes.length} open dispute{disputes.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Info Banner */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-5 py-4 flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-yellow-800">
          <p className="font-semibold">Dispute Resolution</p>
          <p className="mt-1 text-yellow-700">
            Full dispute flow (evidence upload, chat history, arbitration) will be built in a later
            sprint. For now, use the quick-resolve buttons to settle disputes manually.
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600" />
          </div>
        ) : disputes.length === 0 ? (
          <div className="py-16 text-center">
            <Gavel className="h-10 w-10 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-400 text-sm">No open disputes. Great news!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Booking Ref</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tourist</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Provider</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Issue</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {disputes.map((d) => (
                  <DisputeRow key={d.id} booking={d} onResolve={handleResolve} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
