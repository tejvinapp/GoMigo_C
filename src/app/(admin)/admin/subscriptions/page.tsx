'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  CreditCard,
  Gift,
  Download,
  Loader2,
  TrendingUp,
  AlertCircle,
  CheckCircle,
} from 'lucide-react'
import { format } from 'date-fns'

// ─── Types ───────────────────────────────────────────────────────────────────

interface SubscriptionRow {
  id: string
  provider_id: string
  plan: string
  status: string
  current_period_end: string | null
  amount_paise: number
  failure_count: number
  provider_profiles: {
    display_name: string
    total_completed: number
  } | null
}

interface TierCounts {
  free: number
  basic: number
  pro: number
  expired: number
}

const PLAN_COLORS: Record<string, string> = {
  free: 'bg-gray-100 text-gray-600',
  trial: 'bg-blue-100 text-blue-700',
  basic: 'bg-green-100 text-green-700',
  pro: 'bg-purple-100 text-purple-700',
}

const STATUS_ICONS: Record<string, React.ReactNode> = {
  active: <CheckCircle className="h-4 w-4 text-green-500" />,
  trial: <TrendingUp className="h-4 w-4 text-blue-500" />,
  expired: <AlertCircle className="h-4 w-4 text-red-500" />,
  cancelled: <AlertCircle className="h-4 w-4 text-gray-400" />,
}

function SummaryCard({
  title,
  count,
  color,
  icon: Icon,
}: {
  title: string
  count: number
  color: string
  icon: React.ElementType
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex items-center gap-4">
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{count}</p>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SubscriptionsPage() {
  const [subs, setSubs] = useState<SubscriptionRow[]>([])
  const [loading, setLoading] = useState(true)
  const [grantingId, setGrantingId] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3500)
  }

  const load = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('subscriptions')
      .select(
        'id, provider_id, plan, status, current_period_end, amount_paise, failure_count, provider_profiles(display_name, total_completed)'
      )
      .order('current_period_end', { ascending: true, nullsFirst: false })

    setSubs((data as unknown as SubscriptionRow[]) ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleGrantMonth = async (providerId: string, providerName: string) => {
    setGrantingId(providerId)
    try {
      const res = await fetch(`/api/admin/subscriptions/${providerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'grant_free_month' }),
      })
      if (res.ok) {
        showToast(`Free month granted to ${providerName}`)
        await load()
      } else {
        showToast('Failed to grant free month')
      }
    } finally {
      setGrantingId(null)
    }
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      const res = await fetch('/api/admin/subscriptions/export')
      if (res.ok) {
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `subscriptions-${format(new Date(), 'yyyy-MM-dd')}.csv`
        a.click()
        URL.revokeObjectURL(url)
      }
    } finally {
      setExporting(false)
    }
  }

  const tierCounts: TierCounts = {
    free: subs.filter((s) => s.plan === 'free' || s.status === 'trial').length,
    basic: subs.filter((s) => s.plan === 'basic').length,
    pro: subs.filter((s) => s.plan === 'pro').length,
    expired: subs.filter((s) => s.status === 'expired' || s.status === 'cancelled').length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg text-sm">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subscriptions</h1>
          <p className="text-sm text-gray-500 mt-1">Manage provider subscription tiers</p>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-60"
        >
          {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Export CSV
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard title="Free / Trial" count={tierCounts.free} color="bg-gray-400" icon={CreditCard} />
        <SummaryCard title="Basic" count={tierCounts.basic} color="bg-green-500" icon={CreditCard} />
        <SummaryCard title="Pro" count={tierCounts.pro} color="bg-purple-500" icon={TrendingUp} />
        <SummaryCard title="Expired" count={tierCounts.expired} color="bg-red-400" icon={AlertCircle} />
      </div>

      {/* Providers Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Provider</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Plan</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Expires</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Bookings</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Failures</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {subs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                    No subscriptions found
                  </td>
                </tr>
              ) : (
                subs.map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">
                        {sub.provider_profiles?.display_name ?? 'Unknown'}
                      </p>
                      <p className="text-xs text-gray-400 font-mono">{sub.provider_id.slice(0, 8)}…</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${PLAN_COLORS[sub.plan] ?? 'bg-gray-100 text-gray-600'}`}>
                        {sub.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        {STATUS_ICONS[sub.status] ?? <AlertCircle className="h-4 w-4 text-gray-400" />}
                        <span className="text-xs text-gray-600 capitalize">{sub.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500 whitespace-nowrap">
                      {sub.current_period_end
                        ? format(new Date(sub.current_period_end), 'dd MMM yyyy')
                        : '—'}
                    </td>
                    <td className="px-6 py-4 text-gray-700 text-center">
                      {sub.provider_profiles?.total_completed ?? 0}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      ₹{(sub.amount_paise / 100).toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {sub.failure_count > 0 ? (
                        <span className="text-red-600 font-semibold">{sub.failure_count}</span>
                      ) : (
                        <span className="text-gray-400">0</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() =>
                          handleGrantMonth(
                            sub.provider_id,
                            sub.provider_profiles?.display_name ?? 'Provider'
                          )
                        }
                        disabled={grantingId === sub.provider_id}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-60 whitespace-nowrap"
                      >
                        {grantingId === sub.provider_id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Gift className="h-3.5 w-3.5" />
                        )}
                        Free Month
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
