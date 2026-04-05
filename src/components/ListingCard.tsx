'use client'

import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export interface ListingCardProps {
  listing: {
    id: string
    title: string
    type: string
    price_paise: number
    currency_unit: string
    rating: number
    review_count: number
    images: string[]
    provider_name: string
    destination_name: string
    demand_multiplier: number
    is_verified: boolean
  }
  className?: string
}

function formatPaise(paise: number): string {
  return Math.round(paise / 100).toLocaleString('en-IN')
}

type ServiceType = 'cab' | 'auto' | 'hotel' | 'guide' | string

const SERVICE_CONFIG: Record<
  string,
  { label: string; textClass: string; bgClass: string }
> = {
  cab: { label: 'Cab', textClass: 'text-blue-700', bgClass: 'bg-blue-100' },
  auto: {
    label: 'Auto',
    textClass: 'text-yellow-800',
    bgClass: 'bg-yellow-100',
  },
  hotel: {
    label: 'Hotel',
    textClass: 'text-purple-700',
    bgClass: 'bg-purple-100',
  },
  hotel_room: {
    label: 'Hotel',
    textClass: 'text-purple-700',
    bgClass: 'bg-purple-100',
  },
  guide: {
    label: 'Guide',
    textClass: 'text-green-700',
    bgClass: 'bg-green-100',
  },
  tour: {
    label: 'Guide',
    textClass: 'text-green-700',
    bgClass: 'bg-green-100',
  },
}

function getPriceLabel(type: ServiceType, unit: string): string {
  const normalised = (unit || type).toLowerCase()
  if (normalised.includes('km')) return '/km'
  if (normalised.includes('night') || normalised.includes('hotel')) return '/night'
  if (normalised.includes('day') || normalised.includes('tour')) return '/day'
  if (normalised.includes('trip') || normalised.includes('cab') || normalised.includes('auto')) return '/trip'
  return `/${unit}`
}

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating)
  const half = rating % 1 >= 0.5
  return (
    <span className="flex items-center gap-0.5" aria-label={`${rating} stars`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < full
        const isHalf = !filled && i === full && half
        return (
          <svg
            key={i}
            className={cn(
              'h-3.5 w-3.5',
              filled || isHalf ? 'text-amber-400' : 'text-gray-200'
            )}
            fill={filled ? 'currentColor' : isHalf ? 'url(#half)' : 'none'}
            stroke="currentColor"
            strokeWidth={filled || isHalf ? 0 : 1.5}
            viewBox="0 0 24 24"
          >
            {isHalf && (
              <defs>
                <linearGradient id="half">
                  <stop offset="50%" stopColor="currentColor" />
                  <stop offset="50%" stopColor="transparent" />
                </linearGradient>
              </defs>
            )}
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
            />
          </svg>
        )
      })}
    </span>
  )
}

export default function ListingCard({ listing, className }: ListingCardProps) {
  const {
    id,
    title,
    type,
    price_paise,
    currency_unit,
    rating,
    review_count,
    images,
    provider_name,
    destination_name,
    demand_multiplier,
    is_verified,
  } = listing

  const imageSrc = images && images.length > 0 ? images[0] : null
  const serviceConf =
    SERVICE_CONFIG[type.toLowerCase()] ?? {
      label: type,
      textClass: 'text-gray-700',
      bgClass: 'bg-gray-100',
    }
  const priceLabel = getPriceLabel(type, currency_unit)
  const hasSurcharge = demand_multiplier > 1

  return (
    <article
      className={cn(
        'group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition-shadow duration-200 hover:shadow-lg',
        className
      )}
    >
      {/* Image */}
      <div className="relative h-48 w-full shrink-0 overflow-hidden bg-gray-100">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 400px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <svg
              className="h-16 w-16 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 20.25h18a.75.75 0 00.75-.75V6.75a.75.75 0 00-.75-.75H3a.75.75 0 00-.75.75v12.75c0 .414.336.75.75.75z"
              />
            </svg>
          </div>
        )}

        {/* Service badge */}
        <span
          className={cn(
            'absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-xs font-semibold',
            serviceConf.bgClass,
            serviceConf.textClass
          )}
        >
          {serviceConf.label}
        </span>

        {/* Verified tick */}
        {is_verified && (
          <span
            className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-xs text-white"
            title="Verified provider"
            aria-label="Verified provider"
          >
            ✓
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-sm font-semibold text-gray-900 leading-snug">
            {title}
          </h3>
        </div>

        <p className="text-xs text-gray-500">{destination_name}</p>

        {/* Rating */}
        <div className="flex items-center gap-1.5">
          <StarRating rating={rating} />
          <span className="text-xs font-medium text-gray-700">
            {rating.toFixed(1)}
          </span>
          <span className="text-xs text-gray-400">({review_count})</span>
        </div>

        <p className="text-xs text-gray-500">by {provider_name}</p>

        {/* Price */}
        <div className="mt-auto flex flex-col gap-1">
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-gray-900">
              ₹{formatPaise(price_paise)}
            </span>
            <span className="text-xs text-gray-500">{priceLabel}</span>
          </div>
          {hasSurcharge && (
            <p className="flex items-center gap-1 text-xs text-amber-600">
              <svg
                className="h-3 w-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
              Seasonal surcharge applies ({Math.round((demand_multiplier - 1) * 100)}% extra)
            </p>
          )}
        </div>

        {/* CTA */}
        <Link
          href={`/listings/${id}`}
          className="mt-2 block w-full rounded-lg bg-gomigo-teal px-4 py-2 text-center text-sm font-semibold text-white transition-colors hover:bg-teal-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
        >
          View Details
        </Link>
      </div>
    </article>
  )
}
