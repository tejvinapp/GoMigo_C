'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Trash2, AlertTriangle, ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function DeleteAccountPage() {
  const router = useRouter()
  const supabase = createClient()
  const [confirm, setConfirm] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  async function handleDelete() {
    if (confirm !== 'DELETE') return
    setDeleting(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.replace('/login'); return }

    // Mark account for deletion
    const { error: updateError } = await supabase
      .from('users')
      .update({ data_deletion_requested_at: new Date().toISOString() })
      .eq('id', user.id)

    if (updateError) {
      setError('Failed to submit deletion request. Please contact support.')
      setDeleting(false)
      return
    }

    // Sign out
    await supabase.auth.signOut()
    router.push('/?deleted=1')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6 flex items-center gap-3">
          <Link href="/profile" className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-red-700">Delete Account</h1>
            <p className="text-gray-500 text-sm mt-0.5">This action cannot be undone</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-lg space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h2 className="font-semibold text-red-800 mb-2">Before you delete your account</h2>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• All your booking history will be permanently deleted</li>
                <li>• Your reviews will be removed</li>
                <li>• Any pending refunds will still be processed</li>
                <li>• You will be signed out immediately</li>
                <li>• This complies with DPDP Act 2023 (processed within 72 hours)</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <p className="text-sm text-gray-700 mb-4">
            Type <strong>DELETE</strong> to confirm account deletion:
          </p>
          <input
            type="text"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value.toUpperCase())}
            placeholder="Type DELETE to confirm"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 font-mono mb-4"
          />

          {error && (
            <p className="text-sm text-red-600 mb-3">{error}</p>
          )}

          <button
            onClick={handleDelete}
            disabled={confirm !== 'DELETE' || deleting}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            {deleting ? 'Deleting Account…' : 'Permanently Delete My Account'}
          </button>

          <p className="text-xs text-gray-400 mt-3 text-center">
            Account data will be purged within 72 hours · DPDP Act 2023 compliant
          </p>
        </div>
      </div>
    </div>
  )
}
