'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

export interface DriverMapProps {
  driverLat: number
  driverLng: number
  pickupLat: number
  pickupLng: number
  className?: string
}

// ---------------------------------------------------------------------------
// ETA helpers
// ---------------------------------------------------------------------------

/** Haversine distance in kilometres */
function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

/** Rough ETA assuming ~30 km/h urban speed */
function etaMinutes(km: number): number {
  return Math.max(1, Math.round((km / 30) * 60))
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function DriverMap({
  driverLat,
  driverLng,
  pickupLat,
  pickupLng,
  className,
}: DriverMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<import('leaflet').Map | null>(null)
  const driverMarkerRef = useRef<import('leaflet').Marker | null>(null)
  const polylineRef = useRef<import('leaflet').Polyline | null>(null)
  const leafletRef = useRef<typeof import('leaflet') | null>(null)

  // Live driver position (updated via Supabase Realtime)
  const [driverPos, setDriverPos] = useState<[number, number]>([driverLat, driverLng])

  // Keep driver pos in sync with incoming prop changes (initial/hard resets)
  useEffect(() => {
    setDriverPos([driverLat, driverLng])
  }, [driverLat, driverLng])

  // ETA
  const km = haversineKm(driverPos[0], driverPos[1], pickupLat, pickupLng)
  const eta = etaMinutes(km)

  // ---------------------------------------------------------------------------
  // Map initialisation
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    import('leaflet').then((L) => {
      if (!containerRef.current || mapRef.current) return

      leafletRef.current = L

      // Fix default icon
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconUrl: '/leaflet/marker-icon.png',
        iconRetinaUrl: '/leaflet/marker-icon-2x.png',
        shadowUrl: '/leaflet/marker-shadow.png',
      })

      const map = L.map(containerRef.current!, {
        scrollWheelZoom: false,
        attributionControl: true,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map)

      // Driver marker — car emoji DivIcon
      const driverIcon = L.divIcon({
        html: '<div style="font-size:1.5rem;line-height:1;filter:drop-shadow(0 1px 2px rgba(0,0,0,.4))">🚗</div>',
        className: '',
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      })

      const driverMarker = L.marker([driverLat, driverLng], { icon: driverIcon })
        .addTo(map)
        .bindPopup('Your driver')

      // Pickup marker — pin emoji DivIcon
      const pickupIcon = L.divIcon({
        html: '<div style="font-size:1.5rem;line-height:1;filter:drop-shadow(0 1px 2px rgba(0,0,0,.4))">📍</div>',
        className: '',
        iconSize: [28, 28],
        iconAnchor: [14, 28],
      })

      L.marker([pickupLat, pickupLng], { icon: pickupIcon })
        .addTo(map)
        .bindPopup('Your pickup point')

      // Dashed polyline
      const poly = L.polyline(
        [
          [driverLat, driverLng],
          [pickupLat, pickupLng],
        ],
        {
          color: '#0d9488',
          weight: 2,
          dashArray: '6 6',
          opacity: 0.8,
        }
      ).addTo(map)

      // Fit bounds to show both markers
      const bounds = L.latLngBounds(
        [driverLat, driverLng],
        [pickupLat, pickupLng]
      )
      map.fitBounds(bounds, { padding: [40, 40] })

      mapRef.current = map
      driverMarkerRef.current = driverMarker
      polylineRef.current = poly
    })

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
        driverMarkerRef.current = null
        polylineRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ---------------------------------------------------------------------------
  // Update driver marker when position changes
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const L = leafletRef.current
    if (!L || !mapRef.current || !driverMarkerRef.current || !polylineRef.current) return

    const [dlat, dlng] = driverPos
    driverMarkerRef.current.setLatLng([dlat, dlng])
    polylineRef.current.setLatLngs([
      [dlat, dlng],
      [pickupLat, pickupLng],
    ])

    // Re-fit bounds
    const bounds = L.latLngBounds([dlat, dlng], [pickupLat, pickupLng])
    mapRef.current.fitBounds(bounds, { padding: [40, 40] })
  }, [driverPos, pickupLat, pickupLng])

  // ---------------------------------------------------------------------------
  // Supabase Realtime subscription
  // ---------------------------------------------------------------------------

  useEffect(() => {
    let channel: ReturnType<ReturnType<typeof createClient>['channel']> | null = null

    try {
      const supabase = createClient()

      channel = supabase
        .channel('driver_locations')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'driver_locations',
          },
          (payload: { new: { lat?: number; lng?: number; latitude?: number; longitude?: number } }) => {
            const row = payload.new
            const newLat = row.lat ?? row.latitude
            const newLng = row.lng ?? row.longitude
            if (typeof newLat === 'number' && typeof newLng === 'number') {
              setDriverPos([newLat, newLng])
            }
          }
        )
        .subscribe()
    } catch {
      // Supabase not configured in this environment — silently skip realtime
    }

    return () => {
      if (channel) {
        channel.unsubscribe()
      }
    }
  }, [])

  return (
    <>
      <style>{`@import url('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');`}</style>
      <div className={cn('relative z-0', className)}>
        <div
          ref={containerRef}
          className="h-[300px] w-full overflow-hidden rounded-xl"
          aria-label="Driver location map"
          role="img"
        />

        {/* ETA overlay */}
        <div className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2">
          <div className="flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 shadow-md backdrop-blur-sm">
            <span className="text-sm" aria-hidden="true">🚗</span>
            <span className="text-sm font-semibold text-gray-800">
              ~{eta} min away
            </span>
            <span className="text-xs text-gray-400">
              ({km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`})
            </span>
          </div>
        </div>
      </div>
    </>
  )
}
