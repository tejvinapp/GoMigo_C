// Route calculation using OpenRouteService (free) or OSRM
import { getSetting } from '@/src/lib/settings'

export interface RouteResult {
  distanceKm: number
  durationMinutes: number
  polyline?: number[][] // Array of [lat, lng] points for map display
}

/**
 * Calculate a driving route between two coordinates.
 * Uses OpenRouteService free tier, falls back to straight-line estimate.
 */
export async function calculateRoute(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number }
): Promise<RouteResult> {
  const apiKey = await getSetting('openrouteservice_key')

  if (apiKey) {
    try {
      const result = await callOpenRouteService(from, to, apiKey)
      if (result) return result
    } catch {
      // Fall through to straight-line estimate
    }
  }

  // Fallback: straight-line estimate with hill factor
  return estimateStraightLine(from, to)
}

async function callOpenRouteService(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number },
  apiKey: string
): Promise<RouteResult | null> {
  const response = await fetch(
    'https://api.openrouteservice.org/v2/directions/driving-car',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: apiKey,
      },
      body: JSON.stringify({
        coordinates: [
          [from.lng, from.lat],
          [to.lng, to.lat],
        ],
        instructions: false,
      }),
      signal: AbortSignal.timeout(10000),
    }
  )

  if (!response.ok) return null

  const data = await response.json()
  const route = data.routes?.[0]?.summary
  if (!route) return null

  return {
    distanceKm: route.distance / 1000,
    durationMinutes: Math.ceil(route.duration / 60),
  }
}

function estimateStraightLine(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number }
): RouteResult {
  // Haversine formula
  const R = 6371
  const dLat = ((to.lat - from.lat) * Math.PI) / 180
  const dLon = ((to.lng - from.lng) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((from.lat * Math.PI) / 180) *
      Math.cos((to.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const straightLine = R * c

  // Hill station factor: actual road distance is ~1.4x straight line
  const distanceKm = straightLine * 1.4
  // Average hill road speed: 25 km/h
  const durationMinutes = Math.ceil((distanceKm / 25) * 60)

  return { distanceKm: Math.round(distanceKm * 10) / 10, durationMinutes }
}
