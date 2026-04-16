'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Users,
  Briefcase,
  CalendarCheck,
  IndianRupee,
  Bug,
  TrendingUp,
  AlertCircle,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

// ─── Types ───────────────────────────────────────────────────────────────────

interface KpiData {
  totalUsers: number
  activeProviders: number
  todayBookings: number
  todayRevenuePaise: number
  recentErrors: number
}

interface FeatureFlag {
  id: string
  flag_name: string
  is_enabled: boolean
  description: string | null
}

interface ErrorLog {
  id: string
  error_code: string
  error_title: string
  severity: string
  created_at: string
  route: string | null
}

// ─── Feature Flag Toggle (Client Component) ──────────────────────────────────

function FeatureFlagToggle({ name, enabled }: { name: string; enabled: boolean }) {
  const [isEnabled, setIsEnabled] = useState(enabled)
  const [loading, setLoading] = useState(false)

  const toggle = async () => {
    setLoading(true)
    try {
      await fetch(`/api/admin/feature-flags/${name}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_enabled: !isEnabled }),
      })
      setIsEnabled(!isEnabled)
    } catch {
      // revert on error silently
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 ${
        isEnabled ? 'bg-green-500' : 'bg-gray-300'
      }`}
      aria-label={`Toggle ${name}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          isEnabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )
}

// ─── KPI Card ────────────────────────────────────────────────────────────────

function KpiCard({
  title,
  value,
  icon: Icon,
  color,
  subtitle,
}: {
  title: string
  value: string | number
  icon: React.ElementType
  color: string
  subtitle?: string
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-start gap-4">
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      </div>
    </div>
  )
}

// ─── Severity Badge ───────────────────────────────────────────────────────────

function SeverityBadge({ severity }: { severity: string }) {
  const map: Record<string, string> = {
    low: 'bg-blue-100 text-blue-700',
    medium: 'bg-yellow-100 text-yellow-700',
    high: 'bg-orange-100 text-orange-700',
    critical: 'bg-red-100 text-red-700',
  }
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold uppercase ${map[severity] ?? 'bg-gray-100 text-gray-600'}`}>
      {severity}
    </span>
  )
}

// ─── Main Dashboard Page ──────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const [kpi, setKpi] = useState<KpiData | null>(null)
  const [flags, setFlags] = useState<FeatureFlag[]>([])
  const [errors, setErrors] = useState<ErrorLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    async function load() {
      // IST midnight
      const now = new Date()
      const istOffset = 5.5 * 60 * 60 * 1000
      const istNow = new Date(now.getTime() + istOffset)
      const todayIST = new Date(
        Date.UTC(istNow.getUTCFullYear(), istNow.getUTCMonth(), istNow.getUTCDate())
      )
      const todayISTStr = new Date(todayIST.getTime() - istOffset).toISOString()

      const [
        { count: usersCount },
        { count: providersCount },
        { count: bookingsCount },
        { data: revenueData },
        { count: errorsCount },
        { data: flagsData },
        { data: criticalErrors },
      ] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase
          .from('provider_profiles')
          .select('*', { count: 'exact', head: true })
          .eq('listing_visible', true),
        supabase
          .from('bookings')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', todayISTStr),
        supabase
          .from('bookings')
          .select('total_paise')
          .gte('created_at', todayISTStr)
          .eq('status', 'confirmed'),
        supabase
          .from('error_logs')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
        supabase.from('feature_flags').select('id, flag_name, is_enabled, description').order('flag_name'),
        supabase
          .from('error_logs')
          .select('id, error_code, error_title, severity, created_at, route')
          .in('severity', ['high', 'critical'])
          .is('resolved_at', null)
          .order('created_at', { ascending: false })
          .limit(10),
      ])

      const totalRevenue = (revenueData ?? []).reduce(
        (sum: number, b: { total_paise: number }) => sum + (b.total_paise ?? 0),
        0
      )

      setKpi({
        totalUsers: usersCount ?? 0,
        activeProviders: providersCount ?? 0,
        todayBookings: bookingsCount ?? 0,
        todayRevenuePaise: totalRevenue,
        recentErrors: errorsCount ?? 0,
      })
      setFlags(flagsData ?? [])
      setErrors(criticalErrors ?? [])
      setLoading(false)
    }

    load()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600" />
      </div>
    )
  }

  const rupeesFormatted = kpi
    ? `₹${(kpi.todayRevenuePaise / 100).toLocaleString('en-IN')}`
    : '₹0'

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          {new Date().toLocaleDateString('en-IN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timeZone: 'Asia/Kolkata',
          })}{' '}
          IST
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <KpiCard
          title="Total Users"
          value={kpi?.totalUsers.toLocaleString('en-IN') ?? '0'}
          icon={Users}
          color="bg-blue-500"
        />
        <KpiCard
          title="Active Providers"
          value={kpi?.activeProviders.toLocaleString('en-IN') ?? '0'}
          icon={Briefcase}
          color="bg-purple-500"
        />
        <KpiCard
          title="Today's Bookings"
          value={kpi?.todayBookings.toLocaleString('en-IN') ?? '0'}
          icon={CalendarCheck}
          color="bg-green-500"
          subtitle="IST midnight onwards"
        />
        <KpiCard
          title="Today's Revenue"
          value={rupeesFormatted}
          icon={IndianRupee}
          color="bg-yellow-500"
          subtitle="Confirmed bookings"
        />
        <KpiCard
          title="Errors (24h)"
          value={kpi?.recentErrors.toLocaleString('en-IN') ?? '0'}
          icon={Bug}
          color={kpi && kpi.recentErrors > 0 ? 'bg-red-500' : 'bg-gray-400'}
        />
      </div>

      {/* Feature Flags */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-600" />
          <h2 className="text-lg font-semibold text-gray-900">Feature Flags</h2>
        </div>
        {flags.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-400 text-sm">No feature flags configured yet.</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {flags.map((flag) => (
              <div key={flag.id} className="px-6 py-4 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 font-mono">{flag.flag_name}</p>
                  {flag.description && (
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{flag.description}</p>
                  )}
                </div>
                <FeatureFlagToggle name={flag.flag_name} enabled={flag.is_enabled} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Critical Errors */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <h2 className="text-lg font-semibold text-gray-900">Recent Critical Errors</h2>
          <span className="ml-auto text-xs text-gray-400">Last 10 unresolved high/critical</span>
        </div>
        {errors.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-400 text-sm">No critical errors. All clear!</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Code</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Severity</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Route</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {errors.map((err) => (
                  <tr key={err.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3 font-mono text-xs text-gray-700">{err.error_code}</td>
                    <td className="px-6 py-3 text-gray-800">{err.error_title}</td>
                    <td className="px-6 py-3">
                      <SeverityBadge severity={err.severity} />
                    </td>
                    <td className="px-6 py-3 text-gray-500 font-mono text-xs">{err.route ?? '—'}</td>
                    <td className="px-6 py-3 text-gray-400 text-xs whitespace-nowrap">
                      {formatDistanceToNow(new Date(err.created_at), { addSuffix: true })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
