'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

export interface ListingMapProps {
  lat: number
  lng: number
  title: string
  className?: string
}

// We lazy-import leaflet only in the browser to avoid SSR issues.
// All map setup is done imperatively in a useEffect.

export default function ListingMap({ lat, lng, title, className }: ListingMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<import('leaflet').Map | null>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    // Dynamically import Leaflet and react-leaflet internals
    // We drive the map directly via the Leaflet API so we avoid the
    // MapContainer/SSR complications that need dynamic imports with ssr:false.
    import('leaflet').then((L) => {
      if (!containerRef.current || mapRef.current) return

      // Fix default icon paths broken by webpack/Next.js asset pipeline
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconUrl: '/leaflet/marker-icon.png',
        iconRetinaUrl: '/leaflet/marker-icon-2x.png',
        shadowUrl: '/leaflet/marker-shadow.png',
      })

      const map = L.map(containerRef.current!, {
        center: [lat, lng],
        zoom: 14,
        scrollWheelZoom: false,
        attributionControl: true,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map)

      L.marker([lat, lng])
        .addTo(map)
        .bindPopup(
          `<div class="text-sm font-medium">${title}</div>`,
          { maxWidth: 200 }
        )
        .openPopup()

      mapRef.current = map
    })

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Re-center if coordinates change after mount
  useEffect(() => {
    if (!mapRef.current) return
    mapRef.current.setView([lat, lng], 14)
  }, [lat, lng])

  return (
    <>
      {/* Leaflet CSS — injected once at runtime */}
      <style>{`@import url('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');`}</style>
      <div
        ref={containerRef}
        className={cn('relative z-0 h-[300px] w-full overflow-hidden rounded-xl', className)}
        aria-label={`Map showing location of ${title}`}
        role="img"
      />
    </>
  )
}
