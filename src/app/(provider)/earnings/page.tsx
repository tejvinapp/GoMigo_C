import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { formatINR } from '@/lib/utils/currency'
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns'
import { Download, Building2 } from 'lucide-react'

export const dynamic = 'force-dynamic'

const COMMISSION_PERCENT = 5

interface MonthData {
  label: string
  grossPaise: number
  commissionPaise: number
  netPaise: number
}

export default async function ProviderEarningsPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('provider_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()
  if (!profile) redirect('/')

  const providerId = profile.id

  // All-time totals
  const { data: allBookings } = await supabase
    .from('bookings')
    .select('total_paise, provider_payout_paise, platform_fee_paise, created_at, booking_reference, status')
    .eq('provider_id', providerId)
    .in('status', ['completed', 'confirmed'])
    .order('created_at', { ascending: false })

  const transactions = allBookings || []

  const totalGross = transactions.reduce((s, b) => s + (b.total_paise || 0), 0)
  const totalNet = transactions.reduce((s, b) => s + (b.provider_payout_paise || 0), 0)
  const totalCommission = transactions.reduce((s, b) => s + (b.platform_fee_paise || 0), 0)

  // This month
  const now = new Date()
  const monthStart = startOfMonth(now).toISOString()
  const monthBookings = transactions.filter((b) => b.created_at >= monthStart)
  const thisMonthNet = monthBookings.reduce((s, b) => s + (b.provider_payout_paise || 0), 0)

  // Monthly bar chart data — last 6 months
  const monthlyData: MonthData[] = Array.from({ length: 6 }, (_, i) => {
    const d = subMonths(now, 5 - i)
    const start = startOfMonth(d).toISOString()
    const end = endOfMonth(d).toISOString()
    const monthTx = transactions.filter((b) => b.created_at >= start && b.created_at <= end)
    const gross = monthTx.reduce((s, b) => s + (b.total_paise || 0), 0)
    const commission = Math.round(gross * (COMMISSION_PERCENT / 100))
    return {
      label: format(d, 'MMM'),
      grossPaise: gross,
      commissionPaise: commission,
      netPaise: gross - commission,
    }
  })

  const maxBarValue = Math.max(...monthlyData.map((m) => m.grossPaise), 1)

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Earnings</h1>
          <p className="text-gray-500 text-sm mt-0.5">Your payouts and transaction history</p>
        </div>
        <a
          href="/api/providers/earnings-pdf"
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          Download PDF
        </a>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Total Earned (All Time)</p>
          <p className="text-2xl font-bold text-gray-900">{formatINR(totalGross)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">This Month</p>
          <p className="text-2xl font-bold text-green-600">{formatINR(thisMonthNet)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Platform Commission (5%)</p>
          <p className="text-2xl font-bold text-orange-600">{formatINR(totalCommission)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Net Payout</p>
          <p className="text-2xl font-bold text-blue-600">{formatINR(totalNet)}</p>
        </div>
      </div>

      {/* Bar chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <h2 className="font-semibold text-gray-800 mb-4">Monthly Earnings (Last 6 Months)</h2>
        <div className="flex items-end gap-3 h-40">
          {monthlyData.map((m) => {
            const heightPct = maxBarValue > 0 ? (m.grossPaise / maxBarValue) * 100 : 0
            return (
              <div key={m.label} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] text-gray-500 font-medium">
                  {m.grossPaise > 0 ? formatINR(m.netPaise) : '—'}
                </span>
                <div className="w-full flex items-end" style={{ height: '100px' }}>
                  <div
                    className="w-full rounded-t-md bg-green-500 hover:bg-green-600 transition-colors relative group"
                    style={{ height: `${Math.max(heightPct, 2)}%` }}
                  >
                    {/* Tooltip */}
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      Gross: {formatINR(m.grossPaise)}
                      <br />
                      Net: {formatINR(m.netPaise)}
                    </div>
                  </div>
                </div>
                <span className="text-xs text-gray-500">{m.label}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Transactions table */}
      <div className="bg-white rounded-xl border border-gray-200 mb-6">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Transactions</h2>
        </div>
        {transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-xs text-gray-400 uppercase">
                  <th className="px-5 py-3 text-left font-medium">Date</th>
                  <th className="px-5 py-3 text-left font-medium">Booking Ref</th>
                  <th className="px-5 py-3 text-right font-medium">Gross</th>
                  <th className="px-5 py-3 text-right font-medium">Commission (5%)</th>
                  <th className="px-5 py-3 text-right font-medium">Net Payout</th>
                </tr>
              </thead>
              <tbody>
                {transactions.slice(0, 50).map((b) => {
                  const gross = b.total_paise || 0
                  const commission = Math.round(gross * (COMMISSION_PERCENT / 100))
                  const net = gross - commission
                  return (
                    <tr key={b.booking_reference} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-5 py-3 text-gray-500 text-xs">
                        {format(new Date(b.created_at), 'dd MMM yyyy')}
                      </td>
                      <td className="px-5 py-3 font-mono text-xs text-gray-700">
                        {b.booking_reference}
                      </td>
                      <td className="px-5 py-3 text-right text-gray-800 font-medium">
                        {formatINR(gross)}
                      </td>
                      <td className="px-5 py-3 text-right text-orange-600">
                        -{formatINR(commission)}
                      </td>
                      <td className="px-5 py-3 text-right text-green-700 font-semibold">
                        {formatINR(net)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-200 bg-gray-50">
                  <td className="px-5 py-3 font-bold text-gray-800 text-xs" colSpan={2}>
                    Total ({transactions.length} transactions)
                  </td>
                  <td className="px-5 py-3 text-right font-bold text-gray-800">
                    {formatINR(totalGross)}
                  </td>
                  <td className="px-5 py-3 text-right font-bold text-orange-600">
                    -{formatINR(totalCommission)}
                  </td>
                  <td className="px-5 py-3 text-right font-bold text-green-700">
                    {formatINR(totalNet)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-gray-400 text-sm">
            No completed transactions yet
          </div>
        )}
      </div>

      {/* Bank account setup */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center gap-2 mb-3">
          <Building2 className="w-4 h-4 text-gray-500" />
          <h2 className="font-semibold text-gray-800">Bank Account for Payouts</h2>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Set up your bank account to receive automatic payouts. This feature will be available soon.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Account Holder Name
            </label>
            <input
              type="text"
              placeholder="As per bank records"
              disabled
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Account Number</label>
            <input
              type="text"
              placeholder="XXXX XXXX XXXX"
              disabled
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">IFSC Code</label>
            <input
              type="text"
              placeholder="SBIN0001234"
              disabled
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Bank Name</label>
            <input
              type="text"
              placeholder="State Bank of India"
              disabled
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
            />
          </div>
        </div>
        <p className="text-xs text-amber-600 mt-3 flex items-center gap-1">
          <span>⚠</span> Payout setup coming soon — you will be notified via WhatsApp.
        </p>
      </div>
    </div>
  )
}
