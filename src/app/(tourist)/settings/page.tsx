import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Shield, Key, Bell, ChevronRight } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('full_name, phone, preferred_language')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your GoMiGo account</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl space-y-4">
        {/* Profile */}
        <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100">
          <Link href="/profile" className="flex items-center gap-3 px-6 py-4 hover:bg-gray-50 transition-colors">
            <Shield className="w-5 h-5 text-gray-400" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">Personal Information</p>
              <p className="text-xs text-gray-500">{profile?.full_name || user.email || 'Update your profile'}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300" />
          </Link>
          <Link href="/profile/edit" className="flex items-center gap-3 px-6 py-4 hover:bg-gray-50 transition-colors">
            <Shield className="w-5 h-5 text-gray-400" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">Edit Profile</p>
              <p className="text-xs text-gray-500">Change your name and language preferences</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300" />
          </Link>
        </div>

        {/* AI Key */}
        <div className="bg-white rounded-2xl border border-gray-200">
          <Link href="/settings/ai" className="flex items-center gap-3 px-6 py-4 hover:bg-gray-50 transition-colors">
            <Key className="w-5 h-5 text-purple-400" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">AI Itinerary Key</p>
              <p className="text-xs text-gray-500">Connect your Gemini or Groq API key for personalised itineraries</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300" />
          </Link>
        </div>

        {/* Privacy */}
        <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100">
          <Link href="/privacy/download-data" className="flex items-center gap-3 px-6 py-4 hover:bg-gray-50 transition-colors">
            <Bell className="w-5 h-5 text-blue-400" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">Download My Data</p>
              <p className="text-xs text-gray-500">DPDP 2023 compliant — get a copy of all your data</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300" />
          </Link>
          <Link href="/privacy/delete-account" className="flex items-center gap-3 px-6 py-4 hover:bg-gray-50 transition-colors">
            <Shield className="w-5 h-5 text-red-400" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">Delete Account</p>
              <p className="text-xs text-gray-500">Permanently remove your account and data</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300" />
          </Link>
        </div>

        {/* Sign out */}
        <div className="bg-white rounded-2xl border border-gray-200">
          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-6 py-4 hover:bg-gray-50 transition-colors text-red-600"
            >
              <Shield className="w-5 h-5" />
              <span className="text-sm font-medium">Sign Out</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
