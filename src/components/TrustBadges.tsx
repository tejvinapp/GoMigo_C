// Server Component — no 'use client' needed
import { cn } from '@/lib/utils'

interface TrustBadgesProps {
  className?: string
}

interface Badge {
  icon: string
  label: string
  colorClass: string
  bgClass: string
}

const BADGES: Badge[] = [
  {
    icon: '✓',
    label: 'Verified Drivers',
    colorClass: 'text-green-700',
    bgClass: 'bg-green-50 border-green-200',
  },
  {
    icon: '🔒',
    label: 'Safe Payments',
    colorClass: 'text-blue-700',
    bgClass: 'bg-blue-50 border-blue-200',
  },
  {
    icon: '⭐',
    label: 'Rated & Reviewed',
    colorClass: 'text-amber-700',
    bgClass: 'bg-amber-50 border-amber-200',
  },
  {
    icon: '📱',
    label: 'WhatsApp Support',
    colorClass: 'text-emerald-700',
    bgClass: 'bg-emerald-50 border-emerald-200',
  },
  {
    icon: '🇮🇳',
    label: 'Made for India',
    colorClass: 'text-orange-700',
    bgClass: 'bg-orange-50 border-orange-200',
  },
]

export default function TrustBadges({ className }: TrustBadgesProps) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-center gap-2 sm:gap-3',
        className
      )}
      role="list"
      aria-label="Trust badges"
    >
      {BADGES.map((badge) => (
        <div
          key={badge.label}
          role="listitem"
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium',
            badge.bgClass,
            badge.colorClass
          )}
        >
          <span aria-hidden="true">{badge.icon}</span>
          <span>{badge.label}</span>
        </div>
      ))}
    </div>
  )
}
