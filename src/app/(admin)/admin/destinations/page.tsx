'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Pencil, MapPin, Check, X, Loader2 } from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Destination {
  id: string
  region_name: string
  slug: string
  is_active: boolean
  description_en: string | null
  seasonal_rules: Record<string, unknown>
  sub_destinations: string[]
  providerCount?: number
  bookingCount?: number
}

interface DestinationForm {
  id?: string
  region_name: string
  slug: string
  description_en: string
  seasonal_rules: string
  sub_destinations: string
  is_active: boolean
  location_lat: string
  location_lng: string
}

const emptyForm: DestinationForm = {
  region_name: '',
  slug: '',
  description_en: '',
  seasonal_rules: '{}',
  sub_destinations: '',
  is_active: true,
  location_lat: '',
  location_lng: '',
}

// ─── Modal ───────────────────────────────────────────────────────────────────

function DestinationModal({
  open,
  initial,
  onClose,
  onSaved,
}: {
  open: boolean
  initial: DestinationForm
  onClose: () => void
  onSaved: () => void
}) {
  const [form, setForm] = useState<DestinationForm>(initial)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setForm(initial)
    setError(null)
  }, [initial, open])

  if (!open) return null

  const set = (key: keyof DestinationForm, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    let parsedRules: unknown = {}
    try {
      parsedRules = JSON.parse(form.seasonal_rules || '{}')
    } catch {
      setError('seasonal_rules must be valid JSON')
      return
    }

    const payload = {
      region_name: form.region_name.trim(),
      slug: form.slug.trim(),
      description_en: form.description_en.trim() || null,
      seasonal_rules: parsedRules,
      sub_destinations: form.sub_destinations
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      is_active: form.is_active,
    }

    setSaving(true)
    try {
      const url = form.id ? `/api/destinations/${form.id}` : '/api/destinations'
      const method = form.id ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setError(body?.error ?? `Failed (${res.status})`)
        return
      }
      onSaved()
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            {form.id ? 'Edit Destination' : 'Add Destination'}
          </h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Region Name *</label>
              <input
                required
                value={form.region_name}
                onChange={(e) => set('region_name', e.target.value)}
                placeholder="e.g. Kodaikanal"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Slug *</label>
              <input
                required
                value={form.slug}
                onChange={(e) => set('slug', e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                placeholder="e.g. kodaikanal"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Description (English)</label>
            <textarea
              value={form.description_en}
              onChange={(e) => set('description_en', e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Latitude</label>
              <input
                type="number"
                step="any"
                value={form.location_lat}
                onChange={(e) => set('location_lat', e.target.value)}
                placeholder="10.2381"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Longitude</label>
              <input
                type="number"
                step="any"
                value={form.location_lng}
                onChange={(e) => set('location_lng', e.target.value)}
                placeholder="77.4892"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Sub-Destinations (comma-separated)
            </label>
            <input
              value={form.sub_destinations}
              onChange={(e) => set('sub_destinations', e.target.value)}
              placeholder="Kodaikanal Lake, Coaker's Walk, Dolphin's Nose"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Seasonal Rules (JSON)
            </label>
            <textarea
              value={form.seasonal_rules}
              onChange={(e) => set('seasonal_rules', e.target.value)}
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none font-mono text-xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={form.is_active}
              onChange={(e) => set('is_active', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            <label htmlFor="is_active" className="text-sm text-gray-700">
              Active (visible to users)
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-60 flex items-center gap-2"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {form.id ? 'Save Changes' : 'Add Destination'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DestinationsPage() {
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalForm, setModalForm] = useState<DestinationForm>(emptyForm)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const load = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('destinations')
      .select('id, region_name, slug, is_active, description_en, seasonal_rules, sub_destinations')
      .order('region_name')

    setDestinations(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const openAdd = () => {
    setModalForm(emptyForm)
    setModalOpen(true)
  }

  const openEdit = (dest: Destination) => {
    setModalForm({
      id: dest.id,
      region_name: dest.region_name,
      slug: dest.slug,
      description_en: dest.description_en ?? '',
      seasonal_rules: JSON.stringify(dest.seasonal_rules ?? {}, null, 2),
      sub_destinations: (dest.sub_destinations ?? []).join(', '),
      is_active: dest.is_active,
      location_lat: '',
      location_lng: '',
    })
    setModalOpen(true)
  }

  const toggleActive = async (dest: Destination) => {
    setTogglingId(dest.id)
    try {
      const res = await fetch(`/api/destinations/${dest.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !dest.is_active }),
      })
      if (res.ok) {
        setDestinations((prev) =>
          prev.map((d) => (d.id === dest.id ? { ...d, is_active: !d.is_active } : d))
        )
        showToast(`${dest.region_name} is now ${!dest.is_active ? 'active' : 'inactive'}`)
      }
    } finally {
      setTogglingId(null)
    }
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
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg text-sm flex items-center gap-2">
          <Check className="h-4 w-4" />
          {toast}
        </div>
      )}

      <DestinationModal
        open={modalOpen}
        initial={modalForm}
        onClose={() => setModalOpen(false)}
        onSaved={() => {
          load()
          showToast('Destination saved successfully')
        }}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Destinations</h1>
          <p className="text-sm text-gray-500 mt-1">{destinations.length} destinations configured</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Destination
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Slug</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Sub-Destinations</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {destinations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    <MapPin className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    No destinations yet. Add one to get started.
                  </td>
                </tr>
              ) : (
                destinations.map((dest) => (
                  <tr key={dest.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{dest.region_name}</td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-500">{dest.slug}</td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {(dest.sub_destinations ?? []).length > 0
                        ? dest.sub_destinations.slice(0, 3).join(', ') +
                          (dest.sub_destinations.length > 3
                            ? ` +${dest.sub_destinations.length - 3} more`
                            : '')
                        : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          dest.is_active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {dest.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(dest)}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          <Pencil className="h-3 w-3" />
                          Edit
                        </button>
                        <button
                          onClick={() => toggleActive(dest)}
                          disabled={togglingId === dest.id}
                          className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors disabled:opacity-60 ${
                            dest.is_active
                              ? 'text-red-700 bg-red-50 hover:bg-red-100'
                              : 'text-green-700 bg-green-50 hover:bg-green-100'
                          }`}
                        >
                          {togglingId === dest.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : dest.is_active ? (
                            <X className="h-3 w-3" />
                          ) : (
                            <Check className="h-3 w-3" />
                          )}
                          {dest.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
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
