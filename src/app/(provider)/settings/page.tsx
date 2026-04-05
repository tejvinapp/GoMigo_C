'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/src/lib/supabase/client'
import {
  Upload,
  CheckCircle2,
  Clock,
  XCircle,
  ExternalLink,
  Save,
  AlertTriangle,
  Bell,
  User,
  Shield,
  Cpu,
} from 'lucide-react'

interface ProfileData {
  display_name: string
  bio: string
  phone: string
  profile_photo_url: string | null
  provider_id: string
}

interface KYCData {
  status: 'pending' | 'verified' | 'rejected' | null
  rejection_reason: string | null
  aadhaar_doc_url: string | null
  vehicle_rc_url: string | null
}

interface NotifPrefs {
  whatsapp_new_booking: boolean
  whatsapp_booking_update: boolean
  whatsapp_payment: boolean
  email_new_booking: boolean
  email_booking_update: boolean
  email_payment: boolean
}

const KYC_STATUS_UI = {
  pending: {
    label: 'Verification Pending',
    icon: <Clock className="w-4 h-4 text-yellow-500" />,
    cls: 'bg-yellow-50 border-yellow-200 text-yellow-700',
  },
  verified: {
    label: 'KYC Verified',
    icon: <CheckCircle2 className="w-4 h-4 text-green-500" />,
    cls: 'bg-green-50 border-green-200 text-green-700',
  },
  rejected: {
    label: 'KYC Rejected',
    icon: <XCircle className="w-4 h-4 text-red-500" />,
    cls: 'bg-red-50 border-red-200 text-red-700',
  },
}

const NOTIF_EVENTS = [
  { key: 'new_booking', label: 'New booking request' },
  { key: 'booking_update', label: 'Booking status change' },
  { key: 'payment', label: 'Payment received' },
]

function AIKeySetup() {
  const [key, setKey] = useState('')
  const [provider, setProvider] = useState('gemini')
  const [testing, setTesting] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null)

  async function handleTest() {
    setTesting(true)
    setResult(null)
    const res = await fetch('/api/ai/validate-key', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider, key }),
    })
    const json = await res.json()
    setResult({ ok: res.ok, message: json.message || (res.ok ? 'Key is valid!' : 'Invalid key') })
    setTesting(false)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center gap-2 mb-3">
        <Cpu className="w-4 h-4 text-gray-500" />
        <h2 className="font-semibold text-gray-800">AI Key Setup</h2>
      </div>
      <p className="text-sm text-gray-500 mb-4">
        Add your own AI API key to power description generation and smart suggestions.
      </p>
      <div className="flex gap-3 mb-3">
        <select
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
        >
          <option value="gemini">Google Gemini</option>
          <option value="groq">Groq</option>
          <option value="openai">OpenAI</option>
        </select>
        <input
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="Enter API key…"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 font-mono"
        />
        <button
          onClick={handleTest}
          disabled={!key || testing}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          {testing ? 'Testing…' : 'Test & Save'}
        </button>
      </div>
      {result && (
        <p className={`text-sm ${result.ok ? 'text-green-600' : 'text-red-600'}`}>
          {result.ok ? '✓' : '✗'} {result.message}
        </p>
      )}
    </div>
  )
}

export default function ProviderSettingsPage() {
  const supabase = createClient()
  const photoRef = useRef<HTMLInputElement>(null)

  const [profile, setProfile] = useState<ProfileData>({
    display_name: '',
    bio: '',
    phone: '',
    profile_photo_url: null,
    provider_id: '',
  })
  const [kyc, setKyc] = useState<KYCData>({
    status: null,
    rejection_reason: null,
    aadhaar_doc_url: null,
    vehicle_rc_url: null,
  })
  const [notifPrefs, setNotifPrefs] = useState<NotifPrefs>({
    whatsapp_new_booking: true,
    whatsapp_booking_update: true,
    whatsapp_payment: true,
    email_new_booking: false,
    email_booking_update: false,
    email_payment: true,
  })
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [deactivateConfirm, setDeactivateConfirm] = useState(false)

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data: p } = await supabase
        .from('provider_profiles')
        .select('id, display_name, bio, profile_photo_url')
        .eq('user_id', user.id)
        .single()

      const { data: u } = await supabase
        .from('users')
        .select('phone')
        .eq('id', user.id)
        .single()

      if (p) {
        setProfile({
          display_name: p.display_name || '',
          bio: p.bio || '',
          phone: u?.phone || '',
          profile_photo_url: p.profile_photo_url,
          provider_id: p.id,
        })

        const { data: k } = await supabase
          .from('kyc_documents')
          .select('status, rejection_reason, aadhaar_doc_url, vehicle_rc_url')
          .eq('provider_id', p.id)
          .maybeSingle()

        if (k) {
          setKyc({
            status: k.status as KYCData['status'],
            rejection_reason: k.rejection_reason,
            aadhaar_doc_url: k.aadhaar_doc_url,
            vehicle_rc_url: k.vehicle_rc_url,
          })
        }

        const { data: np } = await supabase
          .from('notification_preferences')
          .select('*')
          .eq('provider_id', p.id)
          .maybeSingle()

        if (np) {
          setNotifPrefs({
            whatsapp_new_booking: np.whatsapp_new_booking ?? true,
            whatsapp_booking_update: np.whatsapp_booking_update ?? true,
            whatsapp_payment: np.whatsapp_payment ?? true,
            email_new_booking: np.email_new_booking ?? false,
            email_booking_update: np.email_booking_update ?? false,
            email_payment: np.email_payment ?? true,
          })
        }
      }
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingPhoto(true)
    const form = new FormData()
    form.append('file', file)
    form.append('bucket', 'profiles')
    const res = await fetch('/api/upload', { method: 'POST', body: form })
    if (res.ok) {
      const json = await res.json()
      setProfile((p) => ({ ...p, profile_photo_url: json.url }))
    }
    setUploadingPhoto(false)
  }

  async function handleSaveProfile() {
    setSaving(true)
    setSaveMsg('')
    const res = await fetch(`/api/provider/profile`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        display_name: profile.display_name,
        bio: profile.bio,
        profile_photo_url: profile.profile_photo_url,
      }),
    })
    setSaving(false)
    setSaveMsg(res.ok ? 'Profile saved!' : 'Failed to save.')
    setTimeout(() => setSaveMsg(''), 3000)
  }

  async function handleSaveNotifs() {
    setSaving(true)
    await fetch('/api/provider/notification-preferences', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider_id: profile.provider_id, ...notifPrefs }),
    })
    setSaving(false)
    setSaveMsg('Preferences saved!')
    setTimeout(() => setSaveMsg(''), 3000)
  }

  function toggleNotif(key: keyof NotifPrefs) {
    setNotifPrefs((p) => ({ ...p, [key]: !p[key] }))
  }

  const kycStatus = kyc.status || 'pending'
  const kycUI = KYC_STATUS_UI[kycStatus] || KYC_STATUS_UI.pending

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-0.5">Manage your provider account</p>
      </div>

      {saveMsg && (
        <div className="flex items-center gap-2 bg-green-50 text-green-700 border border-green-200 rounded-xl px-4 py-2.5 text-sm font-medium">
          <CheckCircle2 className="w-4 h-4" /> {saveMsg}
        </div>
      )}

      {/* Profile */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-4 h-4 text-gray-500" />
          <h2 className="font-semibold text-gray-800">Profile</h2>
        </div>

        {/* Photo */}
        <div className="flex items-center gap-4 mb-4">
          <div className="relative">
            {profile.profile_photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.profile_photo_url}
                alt="Profile"
                className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-2xl border-2 border-gray-200">
                {profile.display_name.charAt(0).toUpperCase() || 'P'}
              </div>
            )}
          </div>
          <div>
            <button
              type="button"
              onClick={() => photoRef.current?.click()}
              disabled={uploadingPhoto}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              {uploadingPhoto ? 'Uploading…' : 'Change Photo'}
            </button>
            <input
              ref={photoRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoUpload}
            />
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
            <input
              type="text"
              value={profile.display_name}
              onChange={(e) => setProfile((p) => ({ ...p, display_name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea
              value={profile.bio}
              onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
              rows={3}
              maxLength={300}
              placeholder="Tell tourists about yourself…"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="tel"
              value={profile.phone}
              disabled
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
            />
            <p className="text-xs text-gray-400 mt-1">
              Phone number cannot be changed. Contact support if needed.
            </p>
          </div>
        </div>

        <button
          onClick={handleSaveProfile}
          disabled={saving}
          className="mt-4 flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving…' : 'Save Profile'}
        </button>
      </div>

      {/* KYC Status */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-4 h-4 text-gray-500" />
          <h2 className="font-semibold text-gray-800">KYC Verification</h2>
        </div>

        <div className={`flex items-center gap-2 px-4 py-3 rounded-lg border mb-4 ${kycUI.cls}`}>
          {kycUI.icon}
          <span className="text-sm font-medium">{kycUI.label}</span>
        </div>

        {kyc.status === 'rejected' && kyc.rejection_reason && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            Rejection reason: {kyc.rejection_reason}
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-700">Aadhaar Card</p>
              <p className="text-xs text-gray-400">
                {kyc.aadhaar_doc_url ? 'Document uploaded' : 'Not uploaded'}
              </p>
            </div>
            {kyc.aadhaar_doc_url ? (
              <a
                href={kyc.aadhaar_doc_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
              >
                View <ExternalLink className="w-3 h-3" />
              </a>
            ) : (
              <a
                href="https://uidai.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-green-600 hover:underline"
              >
                Upload via UIDAI <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-700">Vehicle RC (Parivahan)</p>
              <p className="text-xs text-gray-400">
                {kyc.vehicle_rc_url ? 'Document uploaded' : 'Not uploaded'}
              </p>
            </div>
            {kyc.vehicle_rc_url ? (
              <a
                href={kyc.vehicle_rc_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
              >
                View <ExternalLink className="w-3 h-3" />
              </a>
            ) : (
              <a
                href="https://vahan.parivahan.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-green-600 hover:underline"
              >
                Upload via Parivahan <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* AI Key Setup */}
      <AIKeySetup />

      {/* Notification Preferences */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-4 h-4 text-gray-500" />
          <h2 className="font-semibold text-gray-800">Notification Preferences</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 font-medium text-gray-600">Event</th>
                <th className="text-center py-2 font-medium text-gray-600 w-24">WhatsApp</th>
                <th className="text-center py-2 font-medium text-gray-600 w-24">Email</th>
              </tr>
            </thead>
            <tbody>
              {NOTIF_EVENTS.map(({ key, label }) => {
                const waKey = `whatsapp_${key}` as keyof NotifPrefs
                const emailKey = `email_${key}` as keyof NotifPrefs
                return (
                  <tr key={key} className="border-b border-gray-50">
                    <td className="py-3 text-gray-700">{label}</td>
                    <td className="py-3 text-center">
                      <button
                        type="button"
                        onClick={() => toggleNotif(waKey)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          notifPrefs[waKey] ? 'bg-green-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                            notifPrefs[waKey] ? 'translate-x-4' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </td>
                    <td className="py-3 text-center">
                      <button
                        type="button"
                        onClick={() => toggleNotif(emailKey)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          notifPrefs[emailKey] ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                            notifPrefs[emailKey] ? 'translate-x-4' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <button
          onClick={handleSaveNotifs}
          disabled={saving}
          className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving…' : 'Save Preferences'}
        </button>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-xl border border-red-200 p-5">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-4 h-4 text-red-500" />
          <h2 className="font-semibold text-red-700">Danger Zone</h2>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Deactivating your account will hide all your listings and you won&apos;t receive new
          bookings. Existing confirmed bookings will not be affected.
        </p>
        {!deactivateConfirm ? (
          <button
            onClick={() => setDeactivateConfirm(true)}
            className="px-4 py-2 border border-red-300 text-red-600 text-sm font-semibold rounded-lg hover:bg-red-50 transition-colors"
          >
            Deactivate Account
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={async () => {
                await fetch('/api/provider/deactivate', { method: 'POST' })
                window.location.href = '/login'
              }}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Yes, Deactivate
            </button>
            <button
              onClick={() => setDeactivateConfirm(false)}
              className="px-4 py-2 border border-gray-300 text-gray-600 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
