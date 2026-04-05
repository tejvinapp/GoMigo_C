'use client'

import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { cn } from '@/lib/utils'
import type { CreateBookingRequest } from '@/types/api'

// ---------------------------------------------------------------------------
// Prop types
// ---------------------------------------------------------------------------

export interface BookingFormProps {
  listingId: string
  listingType: 'cab' | 'auto' | 'hotel' | 'guide'
  basePricePaise: number
  onSuccess: (bookingId: string) => void
}

// ---------------------------------------------------------------------------
// Zod schemas per listing type
// ---------------------------------------------------------------------------

const hotelSchema = z
  .object({
    checkin: z.string().min(1, 'Check-in date required'),
    checkout: z.string().min(1, 'Check-out date required'),
    guests: z.number().int().min(1).max(10),
    specialRequests: z.string().max(200).optional(),
  })
  .refine((d) => !d.checkin || !d.checkout || d.checkout > d.checkin, {
    message: 'Check-out must be after check-in',
    path: ['checkout'],
  })

const cabSchema = z.object({
  tripDate: z.string().min(1, 'Trip date required'),
  pickupAddress: z.string().min(3, 'Pickup address required'),
  dropoffAddress: z.string().min(3, 'Drop-off address required'),
  estimatedKm: z.number().positive('Enter a valid distance'),
  specialRequests: z.string().max(200).optional(),
})

const guideSchema = z.object({
  tourDate: z.string().min(1, 'Tour date required'),
  duration: z.enum(['half_day', 'full_day']),
  specialRequests: z.string().max(200).optional(),
})

type HotelValues = z.infer<typeof hotelSchema>
type CabValues = z.infer<typeof cabSchema>
type GuideValues = z.infer<typeof guideSchema>
type FormValues = HotelValues | CabValues | GuideValues

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatINR(paise: number) {
  return `₹${Math.round(paise / 100).toLocaleString('en-IN')}`
}

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

function nightsBetween(from: string, to: string) {
  if (!from || !to) return 0
  const diff = new Date(to).getTime() - new Date(from).getTime()
  return Math.max(0, Math.floor(diff / 86_400_000))
}

// ---------------------------------------------------------------------------
// Sub-forms
// ---------------------------------------------------------------------------

function HotelForm({
  basePricePaise,
  onSuccess,
  listingId,
}: {
  basePricePaise: number
  onSuccess: (id: string) => void
  listingId: string
}) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<HotelValues>({
    resolver: zodResolver(hotelSchema),
    defaultValues: { guests: 1, specialRequests: '' },
  })

  const checkin = watch('checkin')
  const checkout = watch('checkout')
  const nights = nightsBetween(checkin, checkout)
  const total = nights * basePricePaise

  async function onSubmit(values: HotelValues) {
    const body: CreateBookingRequest = {
      listingId,
      bookingType: 'hotel',
      checkinDate: values.checkin,
      checkoutDate: values.checkout,
      numPassengers: values.guests,
      paymentMethod: 'upi',
    }
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...body, specialRequests: values.specialRequests }),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.message ?? 'Booking failed')
    }
    const data = await res.json()
    onSuccess(data.data?.bookingId ?? data.bookingId)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">
            Check-in
          </label>
          <input
            type="date"
            min={todayStr()}
            className={cn('form-input w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500', errors.checkin && 'border-red-400')}
            {...register('checkin')}
          />
          {errors.checkin && (
            <p className="mt-1 text-xs text-red-500">{errors.checkin.message}</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">
            Check-out
          </label>
          <input
            type="date"
            min={checkin || todayStr()}
            className={cn('form-input w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500', errors.checkout && 'border-red-400')}
            {...register('checkout')}
          />
          {errors.checkout && (
            <p className="mt-1 text-xs text-red-500">{errors.checkout.message}</p>
          )}
        </div>
      </div>

      {/* Guests stepper */}
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          Guests
        </label>
        <GuestStepper register={register} />
        {errors.guests && (
          <p className="mt-1 text-xs text-red-500">{errors.guests.message}</p>
        )}
      </div>

      <SpecialRequestsField register={register} error={errors.specialRequests?.message} />

      <TotalDisplay label={`${nights} night${nights !== 1 ? 's' : ''} × ${formatINR(basePricePaise)}`} total={total} visible={nights > 0} />

      <SubmitButton isSubmitting={isSubmitting} disabled={nights === 0} />
    </form>
  )
}

function CabAutoForm({
  basePricePaise,
  onSuccess,
  listingId,
  listingType,
}: {
  basePricePaise: number
  onSuccess: (id: string) => void
  listingId: string
  listingType: 'cab' | 'auto'
}) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CabValues>({
    resolver: zodResolver(cabSchema),
    defaultValues: { estimatedKm: 0, specialRequests: '' },
  })

  const km = watch('estimatedKm') || 0
  const total = km * basePricePaise

  async function onSubmit(values: CabValues) {
    const body: CreateBookingRequest = {
      listingId,
      bookingType: listingType,
      pickupName: values.pickupAddress,
      destinationName: values.dropoffAddress,
      paymentMethod: 'upi',
    }
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...body,
        tripDate: values.tripDate,
        estimatedKm: values.estimatedKm,
        specialRequests: values.specialRequests,
      }),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.message ?? 'Booking failed')
    }
    const data = await res.json()
    onSuccess(data.data?.bookingId ?? data.bookingId)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          Trip Date
        </label>
        <input
          type="date"
          min={todayStr()}
          className={cn('form-input w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500', errors.tripDate && 'border-red-400')}
          {...register('tripDate')}
        />
        {errors.tripDate && (
          <p className="mt-1 text-xs text-red-500">{errors.tripDate.message}</p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          Pickup Address
        </label>
        <input
          type="text"
          placeholder="e.g. Connaught Place, New Delhi"
          className={cn('form-input w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500', errors.pickupAddress && 'border-red-400')}
          {...register('pickupAddress')}
        />
        {errors.pickupAddress && (
          <p className="mt-1 text-xs text-red-500">{errors.pickupAddress.message}</p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          Drop-off Address
        </label>
        <input
          type="text"
          placeholder="e.g. Indira Gandhi Airport, T3"
          className={cn('form-input w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500', errors.dropoffAddress && 'border-red-400')}
          {...register('dropoffAddress')}
        />
        {errors.dropoffAddress && (
          <p className="mt-1 text-xs text-red-500">{errors.dropoffAddress.message}</p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          Estimated Distance (km)
        </label>
        <input
          type="number"
          min={1}
          step={1}
          placeholder="e.g. 25"
          className={cn('form-input w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500', errors.estimatedKm && 'border-red-400')}
          {...register('estimatedKm', { valueAsNumber: true })}
        />
        {errors.estimatedKm && (
          <p className="mt-1 text-xs text-red-500">{errors.estimatedKm.message}</p>
        )}
      </div>

      <SpecialRequestsField register={register} error={errors.specialRequests?.message} />

      <TotalDisplay label={`${km} km × ${formatINR(basePricePaise)}/km`} total={total} visible={km > 0} />

      <SubmitButton isSubmitting={isSubmitting} disabled={km <= 0} />
    </form>
  )
}

function GuideForm({
  basePricePaise,
  onSuccess,
  listingId,
}: {
  basePricePaise: number
  onSuccess: (id: string) => void
  listingId: string
}) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<GuideValues>({
    resolver: zodResolver(guideSchema),
    defaultValues: { duration: 'half_day', specialRequests: '' },
  })

  const duration = watch('duration')
  const total = duration === 'full_day' ? basePricePaise * 2 : basePricePaise

  async function onSubmit(values: GuideValues) {
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        listingId,
        bookingType: 'tour',
        tourDate: values.tourDate,
        duration: values.duration,
        specialRequests: values.specialRequests,
        paymentMethod: 'upi',
      }),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.message ?? 'Booking failed')
    }
    const data = await res.json()
    onSuccess(data.data?.bookingId ?? data.bookingId)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          Tour Date
        </label>
        <input
          type="date"
          min={todayStr()}
          className={cn('form-input w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500', errors.tourDate && 'border-red-400')}
          {...register('tourDate')}
        />
        {errors.tourDate && (
          <p className="mt-1 text-xs text-red-500">{errors.tourDate.message}</p>
        )}
      </div>

      <div>
        <label className="mb-2 block text-xs font-medium text-gray-700">
          Duration
        </label>
        <div className="flex gap-3">
          {(
            [
              { value: 'half_day', label: `Half Day — ${formatINR(basePricePaise)}` },
              { value: 'full_day', label: `Full Day — ${formatINR(basePricePaise * 2)}` },
            ] as const
          ).map(({ value, label }) => (
            <label
              key={value}
              className={cn(
                'flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2.5 text-sm transition-colors',
                duration === value
                  ? 'border-teal-500 bg-teal-50 font-medium text-teal-800'
                  : 'border-gray-200 text-gray-700 hover:border-gray-300'
              )}
            >
              <input
                type="radio"
                value={value}
                className="sr-only"
                {...register('duration')}
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      <SpecialRequestsField register={register} error={errors.specialRequests?.message} />

      <TotalDisplay label={`${duration === 'full_day' ? 'Full day' : 'Half day'} tour`} total={total} visible />

      <SubmitButton isSubmitting={isSubmitting} />
    </form>
  )
}

// ---------------------------------------------------------------------------
// Shared micro-components
// ---------------------------------------------------------------------------

function GuestStepper({ register }: { register: ReturnType<typeof useForm<HotelValues>>['register'] }) {
  // We use a plain number input because react-hook-form owns the value
  return (
    <input
      type="number"
      min={1}
      max={10}
      className="form-input w-24 rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
      {...register('guests', { valueAsNumber: true })}
    />
  )
}

function SpecialRequestsField({
  register,
  error,
}: {
  register: ReturnType<typeof useForm<any>>['register']
  error?: string
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-gray-700">
        Special Requests{' '}
        <span className="font-normal text-gray-400">(optional)</span>
      </label>
      <textarea
        rows={3}
        maxLength={200}
        placeholder="Any specific requirements..."
        className={cn(
          'form-textarea w-full resize-none rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500',
          error && 'border-red-400'
        )}
        {...register('specialRequests')}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

function TotalDisplay({
  label,
  total,
  visible,
}: {
  label: string
  total: number
  visible: boolean
}) {
  if (!visible || total <= 0) return null
  return (
    <div className="flex items-center justify-between rounded-xl bg-teal-50 px-4 py-3">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="text-lg font-bold text-teal-800">{formatINR(total)}</span>
    </div>
  )
}

function SubmitButton({
  isSubmitting,
  disabled = false,
}: {
  isSubmitting: boolean
  disabled?: boolean
}) {
  return (
    <button
      type="submit"
      disabled={isSubmitting || disabled}
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-gomigo-teal px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
    >
      {isSubmitting ? (
        <>
          <svg
            className="h-4 w-4 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
          Processing…
        </>
      ) : (
        'Confirm Booking'
      )}
    </button>
  )
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export default function BookingForm({
  listingId,
  listingType,
  basePricePaise,
  onSuccess,
}: BookingFormProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-base font-semibold text-gray-900">
        {listingType === 'hotel'
          ? 'Book your stay'
          : listingType === 'guide'
          ? 'Book a guided tour'
          : 'Book your ride'}
      </h2>

      {listingType === 'hotel' && (
        <HotelForm
          basePricePaise={basePricePaise}
          onSuccess={onSuccess}
          listingId={listingId}
        />
      )}

      {(listingType === 'cab' || listingType === 'auto') && (
        <CabAutoForm
          basePricePaise={basePricePaise}
          onSuccess={onSuccess}
          listingId={listingId}
          listingType={listingType}
        />
      )}

      {listingType === 'guide' && (
        <GuideForm
          basePricePaise={basePricePaise}
          onSuccess={onSuccess}
          listingId={listingId}
        />
      )}
    </div>
  )
}
