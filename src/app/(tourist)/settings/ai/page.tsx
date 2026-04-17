'use client'

import { useState, useEffect } from 'react'
import { Key, CheckCircle2, XCircle, Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function AIKeySettingsPage() {
  const [provider, setProvider] = useState('gemini')
  const [key, setKey] = useState('')
  const [testing, setTesting] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null)
  const [hasKey, setHasKey] = useState(false)

  useEffect(() => {
    fetch('/api/ai/status')
      .then((r) => r.json())
      .then((data) => {
        setHasKey(data.hasKey || false)
        if (data.provider) setProvider(data.provider)
      })
      .catch(() => {})
  }, [])

  async function handleTest() {
    if (!key.trim()) return
    setTesting(true)
    setResult(null)
    try {
      const res = await fetch('/api/ai/validate-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, key }),
      })
      const json = await res.json()
      setResult({ ok: res.ok, message: json.message || (res.ok ? 'Key validated and saved!' : 'Invalid key') })
      if (res.ok) setHasKey(true)
    } catch {
      setResult({ ok: false, message: 'Network error. Please try again.' })
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6 flex items-center gap-3">
          <Link href="/settings" className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Itinerary Key</h1>
            <p className="text-gray-500 text-sm mt-0.5">Bring Your Own AI (BYOAI)</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl space-y-6">
        {/* Status */}
        <div className={`rounded-2xl border p-4 flex items-center gap-3 ${hasKey ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
          {hasKey ? (
            <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
          ) : (
            <Key className="w-5 h-5 text-gray-400 shrink-0" />
          )}
          <div>
            <p className="text-sm font-medium text-gray-800">
              {hasKey ? 'AI Key Connected' : 'No AI Key Set'}
            </p>
            <p className="text-xs text-gray-500">
              {hasKey
                ? 'Your itineraries are generated privately using your own API key.'
                : 'Connect your Gemini or Groq key to generate personalised itineraries.'}
            </p>
          </div>
        </div>

        {/* Setup form */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Configure Your AI Key</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">AI Provider</label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="gemini">Google Gemini (Recommended — free tier available)</option>
                <option value="groq">Groq (Ultra-fast inference)</option>
                <option value="openai">OpenAI GPT-4</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
              <input
                type="password"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder={
                  provider === 'gemini'
                    ? 'AIza...'
                    : provider === 'groq'
                    ? 'gsk_...'
                    : 'sk-...'
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 font-mono"
              />
            </div>

            <button
              onClick={handleTest}
              disabled={!key.trim() || testing}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
              {testing ? 'Validating…' : 'Validate & Save Key'}
            </button>

            {result && (
              <div className={`flex items-center gap-2 text-sm ${result.ok ? 'text-green-600' : 'text-red-600'}`}>
                {result.ok ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                {result.message}
              </div>
            )}
          </div>
        </div>

        {/* Privacy notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-blue-800 mb-2">🔒 Your Privacy is Protected</h3>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Your API key is stored encrypted in our secure vault</li>
            <li>• AI requests go directly from our server to the AI provider — GoMiGo never stores your prompts or itinerary content</li>
            <li>• Compliant with India's DPDP Act 2023</li>
            <li>• You can delete your key at any time</li>
          </ul>
        </div>

        <div className="text-center">
          <Link href="/settings" className="text-sm text-gray-500 hover:text-green-600 transition-colors">
            ← Back to Settings
          </Link>
        </div>
      </div>
    </div>
  )
}
