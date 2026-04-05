'use client'

import { useState } from 'react'
import * as Tabs from '@radix-ui/react-tabs'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AIKeySetupProps {
  userId: string
}

type Provider = 'gemini' | 'groq'
type SaveStatus = 'idle' | 'validating' | 'saving' | 'saved' | 'error'

// ---------------------------------------------------------------------------
// Provider metadata
// ---------------------------------------------------------------------------

const PROVIDERS: Record<
  Provider,
  {
    label: string
    placeholder: string
    docsUrl: string
    steps: string[]
    keyPrefix: string
  }
> = {
  gemini: {
    label: 'Gemini',
    placeholder: 'AIza...',
    docsUrl: 'https://aistudio.google.com/app/apikey',
    steps: [
      'Go to Google AI Studio (aistudio.google.com)',
      'Sign in with your Google account',
      'Click "Get API key" → "Create API key in new project"',
      'Copy the key that starts with "AIza"',
      'Paste it in the field below and click Validate & Save',
    ],
    keyPrefix: 'AIza',
  },
  groq: {
    label: 'Groq',
    placeholder: 'gsk_...',
    docsUrl: 'https://console.groq.com/keys',
    steps: [
      'Go to console.groq.com and create a free account',
      'Navigate to API Keys in the left sidebar',
      'Click "Create API Key" and give it a name',
      'Copy the key that starts with "gsk_"',
      'Paste it in the field below and click Validate & Save',
    ],
    keyPrefix: 'gsk_',
  },
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AIKeySetup({ userId }: AIKeySetupProps) {
  const [activeTab, setActiveTab] = useState<Provider>('gemini')
  const [keys, setKeys] = useState<Record<Provider, string>>({
    gemini: '',
    groq: '',
  })
  const [showKey, setShowKey] = useState<Record<Provider, boolean>>({
    gemini: false,
    groq: false,
  })
  const [status, setStatus] = useState<Record<Provider, SaveStatus>>({
    gemini: 'idle',
    groq: 'idle',
  })
  const [errorMsg, setErrorMsg] = useState<Record<Provider, string>>({
    gemini: '',
    groq: '',
  })
  const [savedProviders, setSavedProviders] = useState<Set<Provider>>(new Set())

  function setKeyForProvider(provider: Provider, value: string) {
    setKeys((prev) => ({ ...prev, [provider]: value }))
    // Reset status when key changes
    setStatus((prev) => ({ ...prev, [provider]: 'idle' }))
    setErrorMsg((prev) => ({ ...prev, [provider]: '' }))
  }

  async function handleValidateAndSave(provider: Provider) {
    const key = keys[provider].trim()
    if (!key) {
      setErrorMsg((prev) => ({ ...prev, [provider]: 'Please paste your API key first.' }))
      return
    }

    setStatus((prev) => ({ ...prev, [provider]: 'validating' }))
    setErrorMsg((prev) => ({ ...prev, [provider]: '' }))

    try {
      // Step 1: Validate the key
      const validateRes = await fetch('/api/ai/validate-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, apiKey: key, userId }),
      })

      if (!validateRes.ok) {
        const err = await validateRes.json().catch(() => ({}))
        throw new Error(err.message ?? 'Key validation failed. Please check the key and try again.')
      }

      setStatus((prev) => ({ ...prev, [provider]: 'saving' }))

      // Step 2: Save the (encrypted) key
      const saveRes = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, apiKey: key, userId }),
      })

      if (!saveRes.ok) {
        const err = await saveRes.json().catch(() => ({}))
        throw new Error(err.message ?? 'Failed to save key. Please try again.')
      }

      setStatus((prev) => ({ ...prev, [provider]: 'saved' }))
      setSavedProviders((prev) => new Set(prev).add(provider))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unexpected error. Please try again.'
      setStatus((prev) => ({ ...prev, [provider]: 'error' }))
      setErrorMsg((prev) => ({ ...prev, [provider]: message }))
    }
  }

  async function handleRemove(provider: Provider) {
    try {
      await fetch('/api/ai', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, userId }),
      })
      setKeys((prev) => ({ ...prev, [provider]: '' }))
      setStatus((prev) => ({ ...prev, [provider]: 'idle' }))
      setSavedProviders((prev) => {
        const next = new Set(prev)
        next.delete(provider)
        return next
      })
    } catch {
      setErrorMsg((prev) => ({ ...prev, [provider]: 'Could not remove key. Please try again.' }))
    }
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-xl">
          🤖
        </div>
        <div>
          <h2 className="text-base font-semibold text-gray-900">
            Use Your Own AI Key (BYOAI)
          </h2>
          <p className="mt-0.5 text-sm text-gray-500">
            Unlock AI features — travel suggestions, itinerary planner, smart
            search — using your <strong>free</strong> Gemini or Groq API key.
            Your key is encrypted and never shared.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs.Root
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as Provider)}
        className="mt-5"
      >
        <Tabs.List
          className="flex rounded-xl bg-gray-100 p-1"
          aria-label="Select AI provider"
        >
          {(Object.keys(PROVIDERS) as Provider[]).map((provider) => (
            <Tabs.Trigger
              key={provider}
              value={provider}
              className={cn(
                'flex flex-1 items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                'data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm',
                'data-[state=inactive]:text-gray-500 data-[state=inactive]:hover:text-gray-700'
              )}
            >
              {provider === 'gemini' ? '✨' : '⚡'}
              {PROVIDERS[provider].label}
              {savedProviders.has(provider) && (
                <span className="ml-1 text-green-500" aria-label="Saved">✓</span>
              )}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        {(Object.entries(PROVIDERS) as [Provider, typeof PROVIDERS[Provider]][]).map(
          ([provider, config]) => (
            <Tabs.Content key={provider} value={provider} className="mt-4 space-y-4">
              {/* Steps */}
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  How to get your free {config.label} key
                </p>
                <ol className="space-y-1.5">
                  {config.steps.map((step, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-100 text-xs font-semibold text-purple-700">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
                <a
                  href={config.docsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-purple-600 hover:text-purple-700 hover:underline"
                >
                  Open {config.label} console
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>

              {/* Key input */}
              <div>
                <label
                  htmlFor={`key-input-${provider}`}
                  className="mb-1.5 block text-xs font-medium text-gray-700"
                >
                  Paste your {config.label} API key
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      id={`key-input-${provider}`}
                      type={showKey[provider] ? 'text' : 'password'}
                      placeholder={config.placeholder}
                      value={keys[provider]}
                      onChange={(e) => setKeyForProvider(provider, e.target.value)}
                      className={cn(
                        'w-full rounded-lg border py-2 pl-3 pr-10 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-500',
                        errorMsg[provider] ? 'border-red-400' : 'border-gray-300'
                      )}
                      autoComplete="off"
                      spellCheck={false}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowKey((prev) => ({ ...prev, [provider]: !prev[provider] }))
                      }
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                      aria-label={showKey[provider] ? 'Hide key' : 'Show key'}
                    >
                      {showKey[provider] ? (
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {errorMsg[provider] && (
                  <p className="mt-1.5 text-xs text-red-600">{errorMsg[provider]}</p>
                )}

                {status[provider] === 'saved' && (
                  <p className="mt-1.5 flex items-center gap-1 text-xs text-green-600">
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Key saved &amp; verified
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleValidateAndSave(provider)}
                  disabled={
                    status[provider] === 'validating' ||
                    status[provider] === 'saving' ||
                    !keys[provider].trim()
                  }
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
                >
                  {status[provider] === 'validating' || status[provider] === 'saving' ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      {status[provider] === 'validating' ? 'Validating…' : 'Saving…'}
                    </>
                  ) : (
                    'Validate & Save'
                  )}
                </button>

                {savedProviders.has(provider) && (
                  <button
                    onClick={() => handleRemove(provider)}
                    className="rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2"
                  >
                    Remove Key
                  </button>
                )}
              </div>
            </Tabs.Content>
          )
        )}
      </Tabs.Root>

      {/* Privacy note */}
      <p className="mt-4 text-xs text-gray-400">
        🔒 Keys are AES-256 encrypted before storage and are never logged or shared.
        You can remove your key at any time.
      </p>
    </div>
  )
}
