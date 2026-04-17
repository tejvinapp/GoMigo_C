'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ShieldCheck, ShieldX, ExternalLink, Loader2, FileText } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

// ─── Types ───────────────────────────────────────────────────────────────────

type KycStatus = 'pending' | 'approved' | 'rejected'

interface KycDocument {
  id: string
  doc_type: string
  file_url: string
  status: string
  rejection_reason: string | null
  created_at: string
  provider_id: string
  provider_profiles: {
    display_name: string
    user_id: string
  } | null
}

const DOC_TYPE_LABELS: Record<string, string> = {
  aadhaar_front: 'Aadhaar Front',
  aadhaar_back: 'Aadhaar Back',
  pan: 'PAN Card',
  driving_license: 'Driving License',
  vehicle_rc: 'Vehicle RC',
  vehicle_permit: 'Vehicle Permit',
  tourism_cert: 'Tourism Certificate',
  gst_cert: 'GST Certificate',
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ message, type }: { message: string; type: 'success' | 'error' }) {
  return (
    <div
      className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium flex items-center gap-2 ${
        type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
      }`}
    >
      {type === 'success' ? <ShieldCheck className="h-4 w-4" /> : <ShieldX className="h-4 w-4" />}
      {message}
    </div>
  )
}

// ─── KYC Card ─────────────────────────────────────────────────────────────────

function KycCard({
  doc,
  onAction,
}: {
  doc: KycDocument
  onAction: (id: string, action: 'approved' | 'rejected', reason?: string) => Promise<void>
}) {
  const [rejecting, setRejecting] = useState(false)
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)

  const handleApprove = async () => {
    setLoading(true)
    await onAction(doc.id, 'approved')
    setLoading(false)
  }

  const handleReject = async () => {
    if (!reason.trim()) return
    setLoading(true)
    await onAction(doc.id, 'rejected', reason.trim())
    setLoading(false)
    setRejecting(false)
    setReason('')
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
            <FileText className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">
              {doc.provider_profiles?.display_name ?? 'Unknown Provider'}
            </p>
            <p className="text-xs text-gray-500">
              {DOC_TYPE_LABELS[doc.doc_type] ?? doc.doc_type}
            </p>
          </div>
        </div>
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${
            doc.status === 'approved'
              ? 'bg-green-100 text-green-700'
              : doc.status === 'rejected'
              ? 'bg-red-100 text-red-700'
              : 'bg-yellow-100 text-yellow-700'
          }`}
        >
          {doc.status}
        </span>
      </div>

      <div className="text-xs text-gray-500 space-y-1">
        <p>Uploaded {formatDistanceToNow(new Date(doc.created_at), { addSuffix: true })}</p>
        {doc.rejection_reason && (
          <p className="text-red-600">Reason: {doc.rejection_reason}</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <a
          href={doc.file_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <ExternalLink className="h-3 w-3" />
          View Document
        </a>

        {doc.status === 'pending' && (
          <>
            <button
              onClick={handleApprove}
              disabled={loading}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <ShieldCheck className="h-3 w-3" />
              )}
              Approve
            </button>
            <button
              onClick={() => setRejecting(!rejecting)}
              disabled={loading}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-60"
            >
              <ShieldX className="h-3 w-3" />
              Reject
            </button>
          </>
        )}
      </div>

      {rejecting && (
        <div className="space-y-2 pt-2 border-t border-gray-100">
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Rejection reason (required)"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
          />
          <div className="flex gap-2">
            <button
              onClick={handleReject}
              disabled={!reason.trim() || loading}
              className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-60 flex items-center gap-1"
            >
              {loading && <Loader2 className="h-3 w-3 animate-spin" />}
              Confirm Rejection
            </button>
            <button
              onClick={() => {
                setRejecting(false)
                setReason('')
              }}
              className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function KycPage() {
  const [docs, setDocs] = useState<KycDocument[]>([])
  const [activeTab, setActiveTab] = useState<KycStatus>('pending')
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  const load = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('kyc_documents')
      .select(
        'id, doc_type, file_url, status, rejection_reason, created_at, provider_id, provider_profiles(display_name, user_id)'
      )
      .order('created_at', { ascending: false })

    setDocs((data as unknown as KycDocument[]) ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleAction = async (id: string, status: 'approved' | 'rejected', reason?: string) => {
    try {
      const body: Record<string, unknown> = { status }
      if (reason) body.rejection_reason = reason

      const res = await fetch(`/api/admin/kyc/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) throw new Error('Request failed')

      setDocs((prev) =>
        prev.map((d) =>
          d.id === id ? { ...d, status, rejection_reason: reason ?? null } : d
        )
      )
      showToast(
        status === 'approved' ? 'Document approved successfully' : 'Document rejected',
        status === 'approved' ? 'success' : 'error'
      )
    } catch {
      showToast('Failed to update document status', 'error')
    }
  }

  const counts: Record<KycStatus, number> = {
    pending: docs.filter((d) => d.status === 'pending').length,
    approved: docs.filter((d) => d.status === 'approved').length,
    rejected: docs.filter((d) => d.status === 'rejected').length,
  }

  const filtered = docs.filter((d) => d.status === activeTab)

  const tabs: { key: KycStatus; label: string; color: string }[] = [
    { key: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
    { key: 'approved', label: 'Approved', color: 'bg-green-100 text-green-700' },
    { key: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-700' },
  ]

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} />}

      <div>
        <h1 className="text-2xl font-bold text-gray-900">KYC Approvals</h1>
        <p className="text-sm text-gray-500 mt-1">Review and approve provider identity documents</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {tabs.map(({ key, label, color }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === key
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {label}
            <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${activeTab === key ? 'bg-white/20 text-white' : color}`}>
              {counts[key]}
            </span>
          </button>
        ))}
      </div>

      {/* Cards grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm py-16 text-center">
          <ShieldCheck className="h-10 w-10 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-400 text-sm">No {activeTab} documents</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((doc) => (
            <KycCard key={doc.id} doc={doc} onAction={handleAction} />
          ))}
        </div>
      )}
    </div>
  )
}
