'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Star, Loader2, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

function ReviewForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const bookingId = searchParams.get('bookingId')
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState<{
    id: string
    listing_id: string
    listing_title: string
    listing_type: string
    status: string
  } | null>(null)
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!bookingId) {
      router.replace('/my-trips')
      return
    }
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/login'); return }

      // Fetch booking details
      const res = await fetch(`/api/bookings/${bookingId}`)
      if (!res.ok) {
        setError('Booking not found or you do not have permission to review it.')
        setLoading(false)
        return
      }
      const json = await res.json()
      const b = json.data || json

      if (b.status !== 'completed') {
        setError('Reviews can only be submitted for completed bookings.')
        setLoading(false)
        return
      }

      setBooking({
        id: b.id,
        listing_id: b.listing_id,
        listing_title: b.listing_title || b.listings?.title_en || 'Your Experience',
        listing_type: b.listing_type || b.listings?.listing_type || '',
        status: b.status,
      })
      setLoading(false)
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId])

  async function handleSubmit() {
    if (!booking || rating === 0) return
    setSubmitting(true)
    setError('')

    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        booking_id: booking.id,
        listing_id: booking.listing_id,
        rating,
        comment: comment.trim() || undefined,
        language: 'en',
      }),
    })

    const json = await res.json()
    if (res.ok) {
      setSubmitted(true)
      setTimeout(() => router.push('/my-trips'), 2500)
    } else if (res.status === 409) {
      setError('You have already submitted a review for this booking.')
    } else {
      setError(json.message || 'Failed to submit review. Please try again.')
    }
    setSubmitting(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-4">
        <CheckCircle2 className="w-16 h-16 text-green-500" />
        <h2 className="text-xl font-bold text-gray-900">Review Submitted!</h2>
        <p className="text-gray-500 text-sm text-center">Thank you for sharing your experience. Redirecting to your trips…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6 flex items-center gap-3">
          <Link href="/my-trips" className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Leave a Review</h1>
            <p className="text-gray-500 text-sm mt-0.5">Share your experience with other travellers</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-lg space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {booking && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Reviewing</p>
              <p className="font-semibold text-gray-900">{booking.listing_title}</p>
            </div>

            {/* Star rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Your Rating</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHovered(star)}
                    onMouseLeave={() => setHovered(0)}
                    className="focus:outline-none"
                    aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
                  >
                    <Star
                      className={`w-9 h-9 transition-colors ${
                        star <= (hovered || rating)
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
                {rating > 0 && (
                  <span className="text-sm text-gray-500 ml-2">
                    {rating === 1 ? 'Poor' : rating === 2 ? 'Fair' : rating === 3 ? 'Good' : rating === 4 ? 'Very Good' : 'Excellent'}
                  </span>
                )}
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Review <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell others about your experience…"
                rows={4}
                maxLength={1000}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
              />
              <p className="text-xs text-gray-400 mt-1 text-right">{comment.length}/1000</p>
            </div>

            <button
              onClick={handleSubmit}
              disabled={rating === 0 || submitting}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Star className="w-4 h-4" />}
              {submitting ? 'Submitting…' : 'Submit Review'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ReviewsNewPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    }>
      <ReviewForm />
    </Suspense>
  )
}
