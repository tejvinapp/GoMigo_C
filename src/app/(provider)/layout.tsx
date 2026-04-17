import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import {
  LayoutDashboard,
  ListChecks,
  CalendarCheck,
  IndianRupee,
  Settings,
  LogOut,
} from 'lucide-react'

const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/listings', label: 'My Listings', icon: ListChecks },
  { href: '/bookings', label: 'Bookings', icon: CalendarCheck },
  { href: '/earnings', label: 'Earnings', icon: IndianRupee },
  { href: '/settings', label: 'Settings', icon: Settings },
]

const PLAN_COLORS: Record<string, string> = {
  trial: 'bg-gray-100 text-gray-600',
  active: 'bg-blue-100 text-blue-700',
  driver_featured: 'bg-yellow-100 text-yellow-700',
  hotel_large: 'bg-yellow-100 text-yellow-700',
  guide_agency: 'bg-yellow-100 text-yellow-700',
}

export default async function ProviderLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check that this user has a provider profile
  const { data: profile } = await supabase
    .from('provider_profiles')
    .select('id, display_name, profile_photo_url')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!profile) {
    redirect('/')
  }

  // Fetch active subscription separately
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('plan, status, trial_ends_at')
    .eq('provider_id', (profile as unknown as { id: string }).id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const displayName = (profile as unknown as { display_name: string }).display_name || 'Provider'
  const plan = (sub as unknown as { plan?: string } | null)?.plan || 'trial'
  const planLabel = plan.split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-green-700">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white font-black text-sm">
              G
            </div>
            GoMiGo
          </Link>
          <p className="text-xs text-gray-400 mt-0.5 ml-10">Provider Portal</p>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={`/provider${href}`}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-green-50 hover:text-green-700 transition-colors group"
            >
              <Icon className="w-4 h-4 shrink-0 group-hover:text-green-600" />
              {label}
            </Link>
          ))}
        </nav>

        {/* User info at bottom */}
        <div className="px-4 py-4 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-sm shrink-0">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{displayName}</p>
              <span
                className={`inline-block text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full mt-0.5 ${
                  PLAN_COLORS[plan] || PLAN_COLORS.trial
                }`}
              >
                {planLabel}
              </span>
            </div>
          </div>
          <form action="/api/auth/signout" method="POST" className="mt-3">
            <button
              type="submit"
              className="w-full flex items-center gap-2 text-xs text-gray-400 hover:text-red-500 transition-colors py-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
