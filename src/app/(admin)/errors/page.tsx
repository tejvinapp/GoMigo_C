'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { RefreshCw, CheckCircle, Wrench, Loader2, Bug, AlertTriangle } from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'

// ─── Types ───────────────────────────────────────────────────────────────────

type Severity = 'low' | 'medium' | 'high' | 'critical'

interface ErrorLog {
  id: string
  error_code: string
  error_title: string
  error_message: string | null
  severity: Severity
  route: string | null
  http_method: string | null
  http_status: number | null
  user_id: string | null
  user_role: string | null
  auto_fix_attempted: boolean
  auto_fix_succeeded: boolean | null
  resolved_at: string | null
  created_at: string
}

const SEVERITY_STYLES: Record<Severity, string> = {
  low: 'bg-blue-100 text-blue-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
}

// ─── Severity Badge ───────────────────────────────────────────────────────────

function SeverityBadge({ severity }: { severity: string }) {
  const style = SEVERITY_STYLES[severity as Severity] ?? 'bg-gray-100 text-gray-600'
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold uppercase ${style}`}>
      {severity}
    </span>
  )
}

// ─── Filters Bar ──────────────────────────────────────────────────────────────

interface Filters {
  severity: string
  dateFrom: string
  dateTo: string
  codeSearch: string
  showResolved: boolean
}

function FiltersBar({
  filters,
  onChange,
}: {
  filters: Filters
  onChange: (f: Filters) => void
}) {
  const set = (key: keyof Filters, value: string | boolean) =>
    onChange({ ...filters, [key]: value })

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4 flex flex-wrap gap-3 items-center">
      <select
        value={filters.severity}
        onChange={(e) => set('severity', e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
      >
        <option value="">All Severities</option>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
        <option value="critical">Critical</option>
      </select>

      <input
        type="date"
        value={filters.dateFrom}
        onChange={(e) => set('dateFrom', e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
      />
      <span className="text-gray-400 text-sm">to</span>
      <input
        type="date"
        value={filters.dateTo}
        onChange={(e) => set('dateTo', e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
      />

      <input
        type="text"
        value={filters.codeSearch}
        onChange={(e) => set('codeSearch', e.target.value)}
        placeholder="Search error code…"
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 min-w-[160px]"
      />

      <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={filters.showResolved}
          onChange={(e) => set('showResolved', e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
        />
        Show resolved
      </label>

      <button
        onClick={() =>
          onChange({ severity: '', dateFrom: '', dateTo: '', codeSearch: '', showResolved: false })
        }
        className="ml-auto text-xs text-gray-400 hover:text-gray-600 transition-colors"
      >
        Clear filters
      </button>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ErrorLogsPage() {
  const [allLogs, setAllLogs] = useState<ErrorLog[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [filters, setFilters] = useState<Filters>({
    severity: '',
    dateFrom: '',
    dateTo: '',
    codeSearch: '',
    showResolved: false,
  })
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 4000)
  }

  const load = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('error_logs')
      .select(
        'id, error_code, error_title, error_message, severity, route, http_method, http_status, user_id, user_role, auto_fix_attempted, auto_fix_succeeded, resolved_at, created_at'
      )
      .order('created_at', { ascending: false })
      .limit(200)

    setAllLogs((data as ErrorLog[]) ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
    intervalRef.current = setInterval(load, 30_000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [load])

  const handleAutoFix = async (id: string) => {
    setActionLoadingId(id)
    try {
      const res = await fetch(`/api/admin/errors/${id}/autofix`, { method: 'POST' })
      if (res.ok) {
        showToast('Auto-fix triggered')
        await load()
      } else {
        showToast('Auto-fix failed')
      }
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleAcknowledge = async (id: string) => {
    setActionLoadingId(id)
    try {
      const res = await fetch(`/api/admin/errors/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resolved_at: new Date().toISOString() }),
      })
      if (res.ok) {
        setAllLogs((prev) =>
          prev.map((l) => (l.id === id ? { ...l, resolved_at: new Date().toISOString() } : l))
        )
        showToast('Error acknowledged')
      }
    } finally {
      setActionLoadingId(null)
    }
  }

  // Apply filters
  const filtered = allLogs.filter((log) => {
    if (filters.severity && log.severity !== filters.severity) return false
    if (!filters.showResolved && log.resolved_at) return false
    if (filters.codeSearch && !log.error_code.toLowerCase().includes(filters.codeSearch.toLowerCase())) return false
    if (filters.dateFrom && new Date(log.created_at) < new Date(filters.dateFrom)) return false
    if (filters.dateTo && new Date(log.created_at) > new Date(filters.dateTo + 'T23:59:59')) return false
    return true
  })

  const unresolvedCritical = allLogs.filter(
    (l) => (l.severity === 'critical' || l.severity === 'high') && !l.resolved_at
  ).length

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg text-sm">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Error Logs</h1>
          <p className="text-sm text-gray-500 mt-1">
            Auto-refreshes every 30s · {filtered.length} entries shown
          </p>
        </div>
        <div className="flex items-center gap-3">
          {unresolvedCritical > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="text-sm font-semibold text-red-700">
                {unresolvedCritical} unresolved high/critical
              </span>
            </div>
          )}
          <button
            onClick={load}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <FiltersBar filters={filters} onChange={setFilters} />

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Bug className="h-10 w-10 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-400 text-sm">No errors matching your filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Timestamp</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Code</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Severity</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Message</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Route</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Auto-Fixed</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((log) => (
                  <tr
                    key={log.id}
                    className={`hover:bg-gray-50 transition-colors ${
                      log.resolved_at ? 'opacity-50' : ''
                    }`}
                  >
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                      <div>{format(new Date(log.created_at), 'dd MMM, HH:mm:ss')}</div>
                      <div className="text-gray-400">
                        {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">{log.error_code}</td>
                    <td className="px-4 py-3">
                      <SeverityBadge severity={log.severity} />
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <p className="font-medium text-gray-800 truncate">{log.error_title}</p>
                      {log.error_message && (
                        <p className="text-xs text-gray-500 truncate mt-0.5">{log.error_message}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 font-mono">
                      {log.http_method && (
                        <span className="font-semibold text-gray-700">{log.http_method} </span>
                      )}
                      {log.route ?? '—'}
                      {log.http_status && (
                        <span className={`ml-1 ${log.http_status >= 500 ? 'text-red-500' : 'text-yellow-500'}`}>
                          ({log.http_status})
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-center">
                      {!log.auto_fix_attempted ? (
                        <span className="text-gray-400">—</span>
                      ) : log.auto_fix_succeeded ? (
                        <span className="text-green-600 font-medium">Yes</span>
                      ) : (
                        <span className="text-red-500 font-medium">Failed</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {!log.resolved_at && (
                          <>
                            <button
                              onClick={() => handleAutoFix(log.id)}
                              disabled={actionLoadingId === log.id}
                              title="Retry Auto-Fix"
                              className="p-1.5 text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition-colors disabled:opacity-60"
                            >
                              {actionLoadingId === log.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Wrench className="h-3.5 w-3.5" />
                              )}
                            </button>
                            <button
                              onClick={() => handleAcknowledge(log.id)}
                              disabled={actionLoadingId === log.id}
                              title="Acknowledge"
                              className="p-1.5 text-green-600 bg-green-50 rounded hover:bg-green-100 transition-colors disabled:opacity-60"
                            >
                              <CheckCircle className="h-3.5 w-3.5" />
                            </button>
                          </>
                        )}
                        {log.resolved_at && (
                          <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                            <CheckCircle className="h-3.5 w-3.5" />
                            Resolved
                          </span>
                        )}
                      </div>
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
