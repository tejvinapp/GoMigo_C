'use client'

import { useState, useTransition } from 'react'
import { Globe, Check, Loader2 } from 'lucide-react'

interface Language {
  code: string
  label: string
  nativeLabel: string
}

interface ProfileClientProps {
  preferredLanguage: string
  languages: Language[]
}

export default function ProfileClient({ preferredLanguage, languages }: ProfileClientProps) {
  const [selected, setSelected] = useState(preferredLanguage)
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)

  const handleChange = async (code: string) => {
    setSelected(code)
    startTransition(async () => {
      try {
        await fetch('/api/profile/language', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ language: code }),
        })
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      } catch {
        // silent fail
      }
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-3">
        <Globe className="w-4 h-4 text-green-600" />
        <span className="text-sm text-gray-600">Choose your preferred language for the app</span>
        {isPending && <Loader2 className="w-4 h-4 animate-spin text-green-600 ml-auto" />}
        {saved && !isPending && (
          <span className="ml-auto flex items-center gap-1 text-xs text-green-600">
            <Check className="w-3.5 h-3.5" /> Saved
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleChange(lang.code)}
            disabled={isPending}
            className={`px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
              selected === lang.code
                ? 'bg-green-50 border-green-500 text-green-700'
                : 'bg-white border-gray-200 text-gray-700 hover:border-green-300 hover:bg-green-50/50'
            } disabled:opacity-50`}
          >
            <span className="block text-xs text-gray-500">{lang.label}</span>
            <span>{lang.nativeLabel}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
