'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  MapPin, Calendar, Users, Sliders, Sparkles, Car, Compass,
  Loader2, ChevronDown, Sun, Sunset, Moon, ArrowRight, Key,
  AlertTriangle, RefreshCw,
} from 'lucide-react'

interface Destination {
  id: string
  region_name: string
  slug: string
}

interface Activity {
  time: 'morning' | 'afternoon' | 'evening'
  title: string
  description: string
  type: 'cab' | 'guide' | 'explore' | 'food' | 'rest'
  durationMinutes?: number
  locationHint?: string
}

interface DayPlan {
  day: number
  title: string
  activities: Activity[]
}

type Interest = 'Nature' | 'History' | 'Food' | 'Adventure' | 'Shopping' | 'Wellness'
type GroupType = 'Solo' | 'Couple' | 'Family' | 'Friends'

const INTERESTS: Interest[] = ['Nature', 'History', 'Food', 'Adventure', 'Shopping', 'Wellness']
const GROUP_TYPES: GroupType[] = ['Solo', 'Couple', 'Family', 'Friends']

const INTEREST_EMOJI: Record<Interest, string> = {
  Nature: '🌿',
  History: '🏛️',
  Food: '🍽️',
  Adventure: '🏔️',
  Shopping: '🛍️',
  Wellness: '🧘',
}

const TIME_ICON: Record<Activity['time'], React.ReactNode> = {
  morning:   <Sun className="w-4 h-4 text-amber-500" />,
  afternoon: <Sunset className="w-4 h-4 text-orange-400" />,
  evening:   <Moon className="w-4 h-4 text-indigo-400" />,
}

const TIME_LABEL: Record<Activity['time'], string> = {
  morning:   'Morning',
  afternoon: 'Afternoon',
  evening:   'Evening',
}

function parseItineraryFromText(text: string, days: number): DayPlan[] {
  // Parse the AI response into structured day plans.
  // The AI is instructed to return JSON, but we defensively fall back to a simple parse.
  try {
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) ||
                      text.match(/\[[\s\S]*\]/)
    const raw = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : text
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed) && parsed.length > 0 && 'activities' in parsed[0]) {
      return parsed as DayPlan[]
    }
  } catch {
    // fall through to text-based fallback
  }

  // Fallback: generate placeholder structure
  return Array.from({ length: days }, (_, i) => ({
    day: i + 1,
    title: `Day ${i + 1}`,
    activities: [
      {
        time: 'morning' as const,
        title: 'Morning Exploration',
        description: 'Start your day with a refreshing walk and local breakfast.',
        type: 'explore' as const,
      },
      {
        time: 'afternoon' as const,
        title: 'Sightseeing',
        description: 'Visit the main attractions with a local guide.',
        type: 'guide' as const,
      },
      {
        time: 'evening' as const,
        title: 'Leisure & Dinner',
        description: 'Relax and enjoy local cuisine as the sun sets over the hills.',
        type: 'food' as const,
      },
    ],
  }))
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-gray-200 rounded-lg" />
        <div className="h-5 bg-gray-200 rounded w-24" />
      </div>
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex gap-3">
            <div className="w-16 h-4 bg-gray-100 rounded" />
            <div className="flex-1 space-y-1.5">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-100 rounded w-full" />
              <div className="h-3 bg-gray-100 rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ActivityCard({ activity, destination }: { activity: Activity; destination: string }) {
  const needsCab = activity.type === 'cab'
  const needsGuide = activity.type === 'guide'

  return (
    <div className="flex gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className="flex flex-col items-center gap-1 shrink-0 pt-0.5">
        {TIME_ICON[activity.time]}
        <span className="text-xs text-gray-400 whitespace-nowrap">{TIME_LABEL[activity.time]}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 mb-0.5">{activity.title}</p>
        <p className="text-xs text-gray-500 leading-relaxed">{activity.description}</p>
        {activity.locationHint && (
          <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
            <MapPin className="w-3 h-3" /> {activity.locationHint}
          </div>
        )}
        {(needsCab || needsGuide) && (
          <div className="flex flex-wrap gap-2 mt-2">
            {needsCab && (
              <Link
                href={`/cabs/${destination}`}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Car className="w-3 h-3" /> Book a Cab
              </Link>
            )}
            {needsGuide && (
              <Link
                href={`/tours/${destination}`}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-orange-700 bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-lg hover:bg-orange-100 transition-colors"
              >
                <Compass className="w-3 h-3" /> Book a Guide
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function DayCard({ plan, destination }: { plan: DayPlan; destination: string }) {
  const [open, setOpen] = useState(plan.day === 1)

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center text-sm font-bold text-green-700">
            {plan.day}
          </div>
          <span className="font-semibold text-gray-900">{plan.title || `Day ${plan.day}`}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-5 pb-4">
          {plan.activities.map((activity, i) => (
            <ActivityCard key={i} activity={activity} destination={destination} />
          ))}
        </div>
      )}
    </div>
  )
}

function NoAIKeyNotice() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col items-center text-center gap-3">
      <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center">
        <Key className="w-6 h-6 text-purple-600" />
      </div>
      <div>
        <h3 className="font-bold text-gray-900 mb-1">Set Up Your AI Key</h3>
        <p className="text-sm text-gray-500 max-w-sm">
          GoMiGo uses your personal Gemini or Groq API key to generate itineraries. Your data never
          passes through GoMiGo servers — 100% private under DPDP 2023.
        </p>
      </div>
      <Link
        href="/settings/ai"
        className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
      >
        <Key className="w-4 h-4" /> Connect Your AI Key
      </Link>
      <p className="text-xs text-gray-400">Free Gemini Flash key works · Takes 2 minutes to set up</p>
    </div>
  )
}

export default function ItineraryPage() {
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [selectedDestId, setSelectedDestId] = useState('')
  const [selectedDestSlug, setSelectedDestSlug] = useState('')
  const [duration, setDuration] = useState(3)
  const [interests, setInterests] = useState<Interest[]>(['Nature', 'Food'])
  const [budget, setBudget] = useState(3000)
  const [groupType, setGroupType] = useState<GroupType>('Couple')
  const [generating, setGenerating] = useState(false)
  const [itinerary, setItinerary] = useState<DayPlan[] | null>(null)
  const [aiError, setAiError] = useState<string | null>(null)
  const [hasAIKey, setHasAIKey] = useState<boolean | null>(null)
  const [loadingDests, setLoadingDests] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/destinations').then((r) => r.json()).catch(() => ({ data: [] })),
      fetch('/api/ai/status').then((r) => r.json()).catch(() => ({ hasKey: false })),
    ]).then(([destData, aiStatus]) => {
      const dests: Destination[] = destData.data || []
      setDestinations(dests)
      if (dests.length > 0) {
        setSelectedDestId(dests[0].id)
        setSelectedDestSlug(dests[0].slug)
      }
      setHasAIKey(aiStatus.hasKey ?? false)
      setLoadingDests(false)
    })
  }, [])

  const toggleInterest = (interest: Interest) => {
    setInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    )
  }

  const handleDestChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const dest = destinations.find((d) => d.id === e.target.value)
    setSelectedDestId(e.target.value)
    setSelectedDestSlug(dest?.slug || '')
  }

  const buildPrompt = () => {
    const destName = destinations.find((d) => d.id === selectedDestId)?.region_name || 'a hill station'
    return `Generate a detailed ${duration}-day travel itinerary for ${destName}, India.
Group type: ${groupType}
Interests: ${interests.join(', ')}
Budget: ₹${budget.toLocaleString('en-IN')} per day per person

Return a JSON array of day objects with this exact TypeScript shape:
[{
  day: number,
  title: string,
  activities: [{
    time: "morning" | "afternoon" | "evening",
    title: string,
    description: string,
    type: "cab" | "guide" | "explore" | "food" | "rest",
    durationMinutes?: number,
    locationHint?: string
  }]
}]

For cab transfers between towns, set type: "cab". For guided tours or treks, set type: "guide".
Return only the JSON array, no markdown wrapping.`
  }

  const handleGenerate = async () => {
    if (!selectedDestId) return
    setGenerating(true)
    setAiError(null)
    setItinerary(null)

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: buildPrompt(),
          feature: 'itinerary',
          systemPrompt: 'You are a local travel expert for India\'s Nilgiri hill stations.',
        }),
      })

      const data = await res.json()

      if (!res.ok || data.error) {
        if (data.code === 'ERR_AUTH_SESSION_EXPIRED') {
          window.location.href = '/login'
          return
        }
        if (data.code === 'ERR_NO_AI_KEY') {
          setHasAIKey(false)
          return
        }
        setAiError(data.message || 'AI generation failed. Please try again.')
        return
      }

      const plans = parseItineraryFromText(data.data.text as string, duration)
      setItinerary(plans)
    } catch {
      setAiError('Network error. Please check your connection and try again.')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-green-700 to-teal-700 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm mb-4">
            <Sparkles className="w-4 h-4 text-green-300" />
            AI-Powered Itinerary Planner
          </div>
          <h1 className="text-3xl font-bold mb-2">Plan Your Perfect Hill Station Trip</h1>
          <p className="text-green-100 max-w-xl mx-auto text-sm">
            Tell us your preferences and our AI creates a personalised day-by-day itinerary
            with booking CTAs for cabs and guides.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* ── Form panel ── */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5 sticky top-24">
              <h2 className="text-base font-bold text-gray-900">Plan Your Trip</h2>

              {/* Destination */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-green-500" /> Destination
                </label>
                {loadingDests ? (
                  <div className="h-10 bg-gray-100 rounded-lg animate-pulse" />
                ) : (
                  <select
                    value={selectedDestId}
                    onChange={handleDestChange}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    {destinations.map((d) => (
                      <option key={d.id} value={d.id}>{d.region_name}</option>
                    ))}
                    {destinations.length === 0 && (
                      <option value="">Nilgiris — Ooty / Coonoor / Kotagiri</option>
                    )}
                  </select>
                )}
              </div>

              {/* Duration */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-green-500" /> Duration: {duration} day{duration !== 1 ? 's' : ''}
                </label>
                <div className="flex gap-2 flex-wrap">
                  {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                    <button
                      key={d}
                      onClick={() => setDuration(d)}
                      className={`w-9 h-9 rounded-lg text-sm font-semibold transition-colors ${
                        duration === d
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Interests */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Interests
                </label>
                <div className="flex flex-wrap gap-2">
                  {INTERESTS.map((interest) => (
                    <button
                      key={interest}
                      onClick={() => toggleInterest(interest)}
                      className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg border transition-colors ${
                        interests.includes(interest)
                          ? 'bg-green-600 text-white border-green-600'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-green-300'
                      }`}
                    >
                      {INTEREST_EMOJI[interest]} {interest}
                    </button>
                  ))}
                </div>
              </div>

              {/* Budget */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
                  <Sliders className="w-3.5 h-3.5 text-green-500" />
                  Budget: ₹{budget.toLocaleString('en-IN')}/day per person
                </label>
                <input
                  type="range"
                  min={500}
                  max={10000}
                  step={500}
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full accent-green-600"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>₹500</span>
                  <span>₹10,000</span>
                </div>
              </div>

              {/* Group type */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-green-500" /> Group Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {GROUP_TYPES.map((g) => (
                    <button
                      key={g}
                      onClick={() => setGroupType(g)}
                      className={`text-sm font-medium py-2 rounded-lg border transition-colors ${
                        groupType === g
                          ? 'bg-green-600 text-white border-green-600'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-green-300'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate button */}
              <button
                onClick={handleGenerate}
                disabled={generating || !selectedDestId || interests.length === 0}
                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating…
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Itinerary
                  </>
                )}
              </button>
            </div>
          </div>

          {/* ── Output panel ── */}
          <div className="lg:col-span-3 space-y-4">
            {/* No AI key */}
            {hasAIKey === false && !generating && !itinerary && (
              <NoAIKeyNotice />
            )}

            {/* Error */}
            {aiError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">{aiError}</p>
                  <button
                    onClick={handleGenerate}
                    className="text-xs text-red-600 hover:underline mt-1 flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" /> Try again
                  </button>
                </div>
              </div>
            )}

            {/* Loading skeletons */}
            {generating && (
              <>
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                  <Loader2 className="w-5 h-5 text-green-600 animate-spin shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-green-800">Creating your itinerary…</p>
                    <p className="text-xs text-green-600 mt-0.5">
                      Our AI is crafting a personalised {duration}-day plan for {groupType.toLowerCase()} travellers.
                    </p>
                  </div>
                </div>
                {Array.from({ length: Math.min(duration, 3) }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </>
            )}

            {/* Generated itinerary */}
            {!generating && itinerary && itinerary.length > 0 && (
              <>
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-lg font-bold text-gray-900">
                    Your {duration}-Day Itinerary
                  </h2>
                  <button
                    onClick={handleGenerate}
                    className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-green-600 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" /> Regenerate
                  </button>
                </div>

                {itinerary.map((plan) => (
                  <DayCard key={plan.day} plan={plan} destination={selectedDestSlug || 'nilgiris'} />
                ))}

                {/* Book section */}
                <div className="bg-gradient-to-r from-green-50 to-teal-50 border border-green-200 rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-4">
                  <div className="flex-1 text-center sm:text-left">
                    <p className="text-sm font-bold text-gray-900 mb-1">Ready to book?</p>
                    <p className="text-xs text-gray-500">Browse verified cabs and guides for your itinerary</p>
                  </div>
                  <div className="flex flex-wrap gap-2 shrink-0">
                    <Link
                      href={`/cabs/${selectedDestSlug || 'nilgiris'}`}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 bg-white border border-blue-200 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      <Car className="w-4 h-4" /> Find Cabs
                    </Link>
                    <Link
                      href={`/tours/${selectedDestSlug || 'nilgiris'}`}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-orange-700 bg-white border border-orange-200 px-4 py-2 rounded-lg hover:bg-orange-50 transition-colors"
                    >
                      <Compass className="w-4 h-4" /> Find Guides
                    </Link>
                  </div>
                </div>
              </>
            )}

            {/* Idle state */}
            {!generating && !itinerary && !aiError && hasAIKey !== false && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <span className="text-7xl mb-4">🗺️</span>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Fill in the form to get started</h3>
                <p className="text-gray-500 text-sm max-w-sm">
                  Select your destination, interests, and budget, then hit{' '}
                  <strong>Generate Itinerary</strong> to get a personalised day-by-day plan.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
