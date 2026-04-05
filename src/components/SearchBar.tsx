'use client'

import { useEffect, useState } from 'react'

interface Destination {
  id: string
  region_name: string
  slug: string
}

interface Props {
  onSearch: (params: { destination: string; serviceType: string; date: string }) => void
  className?: string
}

const SERVICE_TYPES = [
  { value: 'cab', label: 'Cab', icon: '🚕' },
  { value: 'auto', label: 'Auto', icon: '🛺' },
  { value: 'hotel', label: 'Hotel', icon: '🏨' },
  { value: 'guide', label: 'Guide', icon: '🧭' },
] as const

type ServiceType = typeof SERVICE_TYPES[number]['value']

function SkeletonBar({ width }: { width: string }) {
  return (
    <div
      className={`h-10 animate-pulse rounded-lg bg-gray-200 ${width}`}
      aria-hidden="true"
    />
  )
}

export function SearchBar({ onSearch, className = '' }: Props) {
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [loadingDests, setLoadingDests] = useState(true)
  const [destination, setDestination] = useState('')
  const [serviceType, setServiceType] = useState<ServiceType>('cab')
  const [date, setDate] = useState(() => {
    // Default to tomorrow's date in YYYY-MM-DD
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  })

  // Minimum selectable date (today)
  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    let cancelled = false
    setLoadingDests(true)
    fetch('/api/destinations')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((data: Destination[] | { destinations: Destination[] }) => {
        if (cancelled) return
        const list = Array.isArray(data) ? data : data.destinations ?? []
        setDestinations(list)
        if (list.length > 0 && !destination) {
          setDestination(list[0].slug)
        }
      })
      .catch(() => {
        // Silently degrade — user can still type/select
      })
      .finally(() => {
        if (!cancelled) setLoadingDests(false)
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleSearch() {
    if (!destination || !date) return
    onSearch({ destination, serviceType, date })
  }

  if (loadingDests) {
    return (
      <div
        className={`rounded-2xl bg-white p-4 shadow-md ${className}`}
        aria-label="Loading search options"
      >
        {/* Mobile skeleton */}
        <div className="flex flex-col gap-3 md:hidden">
          <SkeletonBar width="w-full" />
          <div className="flex gap-2">
            {SERVICE_TYPES.map((s) => (
              <div
                key={s.value}
                className="h-10 flex-1 animate-pulse rounded-lg bg-gray-200"
                aria-hidden="true"
              />
            ))}
          </div>
          <SkeletonBar width="w-full" />
          <SkeletonBar width="w-full" />
        </div>
        {/* Desktop skeleton */}
        <div className="hidden items-center gap-3 md:flex">
          <SkeletonBar width="w-56" />
          <div className="flex gap-1">
            {SERVICE_TYPES.map((s) => (
              <div
                key={s.value}
                className="h-10 w-20 animate-pulse rounded-lg bg-gray-200"
                aria-hidden="true"
              />
            ))}
          </div>
          <SkeletonBar width="w-40" />
          <SkeletonBar width="w-28" />
        </div>
      </div>
    )
  }

  return (
    <div className={`rounded-2xl bg-white p-4 shadow-md ${className}`}>
      {/* ── Mobile layout: stacked ── */}
      <div className="flex flex-col gap-3 md:hidden">
        {/* Destination dropdown */}
        <div>
          <label htmlFor="sb-destination-mobile" className="mb-1 block text-xs font-medium text-gray-500">
            Destination
          </label>
          <select
            id="sb-destination-mobile"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
          >
            {destinations.length === 0 && (
              <option value="">No destinations available</option>
            )}
            {destinations.map((d) => (
              <option key={d.id} value={d.slug}>
                {d.region_name}
              </option>
            ))}
          </select>
        </div>

        {/* Service type segmented control */}
        <div>
          <span className="mb-1 block text-xs font-medium text-gray-500">Service type</span>
          <div className="flex rounded-lg border border-gray-200 bg-gray-50 p-0.5">
            {SERVICE_TYPES.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setServiceType(s.value)}
                aria-pressed={serviceType === s.value}
                className={`flex flex-1 items-center justify-center gap-1 rounded-md py-2 text-xs font-medium transition-colors ${
                  serviceType === s.value
                    ? 'bg-white text-green-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span aria-hidden="true">{s.icon}</span>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Date picker */}
        <div>
          <label htmlFor="sb-date-mobile" className="mb-1 block text-xs font-medium text-gray-500">
            Date
          </label>
          <input
            id="sb-date-mobile"
            type="date"
            value={date}
            min={today}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
          />
        </div>

        {/* Search button */}
        <button
          type="button"
          onClick={handleSearch}
          disabled={!destination || !date}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <SearchIcon />
          Search
        </button>
      </div>

      {/* ── Desktop layout: horizontal card ── */}
      <div className="hidden items-end gap-3 md:flex">
        {/* Destination dropdown */}
        <div className="flex-1">
          <label htmlFor="sb-destination" className="mb-1 block text-xs font-medium text-gray-500">
            Destination
          </label>
          <select
            id="sb-destination"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
          >
            {destinations.length === 0 && (
              <option value="">No destinations available</option>
            )}
            {destinations.map((d) => (
              <option key={d.id} value={d.slug}>
                {d.region_name}
              </option>
            ))}
          </select>
        </div>

        {/* Service type segmented control */}
        <div>
          <span className="mb-1 block text-xs font-medium text-gray-500">Service</span>
          <div className="flex rounded-xl border border-gray-200 bg-gray-50 p-0.5">
            {SERVICE_TYPES.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setServiceType(s.value)}
                aria-pressed={serviceType === s.value}
                className={`flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  serviceType === s.value
                    ? 'bg-white text-green-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span aria-hidden="true">{s.icon}</span>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Date picker */}
        <div>
          <label htmlFor="sb-date" className="mb-1 block text-xs font-medium text-gray-500">
            Date
          </label>
          <input
            id="sb-date"
            type="date"
            value={date}
            min={today}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
          />
        </div>

        {/* Search button */}
        <button
          type="button"
          onClick={handleSearch}
          disabled={!destination || !date}
          className="flex items-center gap-2 rounded-xl bg-green-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <SearchIcon />
          Search
        </button>
      </div>
    </div>
  )
}

function SearchIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
      />
    </svg>
  )
}
