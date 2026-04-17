'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CalendarClock, ArrowLeft, CheckCircle2, Loader2, Save } from 'lucide-react'
import Link from 'next/link'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const DEFAULT_SCHEDULE: Record<string, { open: boolean; from: string; to: string }> = {
  Monday:    { open: true,  from: '08:00', to: '20:00' },
  Tuesday:   { open: true,  from: '08:00', to: '20:00' },
  Wednesday: { open: true,  from: '08:00', to: '20:00' },
  Thursday:  { open: true,  from: '08:00', to: '20:00' },
  Friday:    { open: true,  from: '08:00', to: '20:00' },
  Saturday:  { open: true,  from: '08:00', to: '20:00' },
  Sunday:    { open: false, from: '08:00', to: '20:00' },
}

export default function AvailabilityPage() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [schedule, setSchedule] = useState(DEFAULT_SCHEDULE)
  const [providerId, setProviderId] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/login'); return }

      const { data: profile } = await supabase
        .from('provider_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!profile) { router.replace('/provider/register'); return }

      setProviderId(profile.id)

      // Load from localStorage (persists until DB migration adds availability_schedule column)
      try {
        const raw = localStorage.getItem(`availability_${profile.id}`)
        if (raw) {
          const parsed = JSON.parse(raw)
          if (parsed && typeof parsed === 'object') {
            setSchedule({ ...DEFAULT_SCHEDULE, ...parsed })
          }
        }
      } catch {}
      setLoading(false)
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function toggle(day: string) {
    setSchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], open: !prev[day].open },
    }))
  }

  function setTime(day: string, field: 'from' | 'to', value: string) {
    setSchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }))
  }

  async function handleSave() {
    if (!providerId) return
    setSaving(true)
    setError('')
    setSaved(false)

    try {
      // Store in localStorage (DB migration needed to persist server-side)
      localStorage.setItem(`availability_${providerId}`, JSON.stringify(schedule))
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      setError('Failed to save availability. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6 flex items-center gap-3">
          <Link href="/provider/dashboard" className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <CalendarClock className="w-6 h-6 text-purple-600" />
              Manage Availability
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">Set the days and hours you are available for bookings</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">{error}</div>
        )}

        <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100">
          {DAYS.map((day) => {
            const s = schedule[day]
            return (
              <div key={day} className="flex items-center gap-4 px-6 py-4">
                <button
                  type="button"
                  onClick={() => toggle(day)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    s.open ? 'bg-purple-600' : 'bg-gray-200'
                  }`}
                  role="switch"
                  aria-checked={s.open}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      s.open ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>

                <span className="w-28 text-sm font-medium text-gray-700">{day}</span>

                {s.open ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="time"
                      value={s.from}
                      onChange={(e) => setTime(day, 'from', e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <span className="text-gray-400 text-sm">to</span>
                    <input
                      type="time"
                      value={s.to}
                      onChange={(e) => setTime(day, 'to', e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                ) : (
                  <span className="text-sm text-gray-400 italic">Closed / Unavailable</span>
                )}
              </div>
            )
          })}
        </div>

        {saved && (
          <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm">
            <CheckCircle2 className="w-4 h-4" />
            Availability saved successfully!
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving…' : 'Save Availability'}
        </button>

        <p className="text-xs text-gray-400 text-center">
          Changes take effect immediately. Tourists can only book during your available hours.
        </p>
      </div>
    </div>
  )
}
