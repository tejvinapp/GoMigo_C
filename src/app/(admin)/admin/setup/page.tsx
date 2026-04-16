'use client'

import { useState, useEffect } from 'react'
import {
  Database,
  CreditCard,
  MessageCircle,
  Mail,
  UserCog,
  CheckCircle,
  Eye,
  EyeOff,
  Loader2,
  ChevronRight,
  AlertCircle,
  ArrowRight,
  SkipForward,
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

interface StepStatus {
  saved: boolean
  error: string | null
}

type Steps = 'database' | 'payments' | 'whatsapp' | 'email' | 'admin'

const STEP_ORDER: Steps[] = ['database', 'payments', 'whatsapp', 'email', 'admin']

const STEP_META: Record<Steps, { label: string; icon: React.ElementType; description: string }> = {
  database: { label: 'Database', icon: Database, description: 'Supabase connection' },
  payments: { label: 'Payments', icon: CreditCard, description: 'Razorpay configuration' },
  whatsapp: { label: 'WhatsApp', icon: MessageCircle, description: 'Notification gateway' },
  email: { label: 'Email', icon: Mail, description: 'SMTP settings' },
  admin: { label: 'Admin Account', icon: UserCog, description: 'Your profile' },
}

// ─── Secret Input ─────────────────────────────────────────────────────────────

function SecretInput({
  label,
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  required?: boolean
}) {
  const [show, setShow] = useState(false)
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">{label}{required && ' *'}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  )
}

function TextInput({
  label,
  value,
  onChange,
  placeholder,
  required,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  required?: boolean
  type?: string
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">{label}{required && ' *'}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
      />
    </div>
  )
}

// ─── Step 1: Database ─────────────────────────────────────────────────────────

function DatabaseStep({ onSaved }: { onSaved: () => void }) {
  const [status, setStatus] = useState<'idle' | 'checking' | 'ok' | 'error'>('idle')
  const [msg, setMsg] = useState<string | null>(null)

  const checkConnection = async () => {
    setStatus('checking')
    setMsg(null)
    try {
      const res = await fetch('/api/health/db')
      if (res.ok) {
        setStatus('ok')
        setMsg('Database connected successfully')
        onSaved()
      } else {
        const body = await res.json().catch(() => ({}))
        setStatus('error')
        setMsg(body?.error ?? 'Connection failed')
      }
    } catch (e: unknown) {
      setStatus('error')
      setMsg(e instanceof Error ? e.message : 'Connection failed')
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        GoMiGo uses Supabase as its primary database. Your connection is configured via the{' '}
        <code className="bg-gray-100 px-1 rounded text-xs">NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
        <code className="bg-gray-100 px-1 rounded text-xs">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>{' '}
        environment variables.
      </p>

      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${
          status === 'ok'
            ? 'bg-green-50 border-green-200'
            : status === 'error'
            ? 'bg-red-50 border-red-200'
            : 'bg-gray-50 border-gray-200'
        }`}
      >
        {status === 'checking' ? (
          <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
        ) : status === 'ok' ? (
          <CheckCircle className="h-5 w-5 text-green-500" />
        ) : status === 'error' ? (
          <AlertCircle className="h-5 w-5 text-red-500" />
        ) : (
          <Database className="h-5 w-5 text-gray-400" />
        )}
        <span className="text-sm text-gray-700">
          {status === 'idle' && 'Click to test database connection'}
          {status === 'checking' && 'Checking connection…'}
          {msg}
        </span>
      </div>

      <button
        onClick={checkConnection}
        disabled={status === 'checking' || status === 'ok'}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-60"
      >
        {status === 'checking' && <Loader2 className="h-4 w-4 animate-spin" />}
        {status === 'ok' ? 'Connected' : 'Test Connection'}
      </button>
    </div>
  )
}

// ─── Step 2: Payments ─────────────────────────────────────────────────────────

function PaymentsStep({ onSaved }: { onSaved: () => void }) {
  const [keyId, setKeyId] = useState('')
  const [keySecret, setKeySecret] = useState('')
  const [mode, setMode] = useState<'test' | 'live'>('test')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: 'payments',
          settings: { razorpay_key_id: keyId, razorpay_key_secret: keySecret, mode },
        }),
      })
      if (res.ok) {
        setSaved(true)
        onSaved()
      } else {
        const body = await res.json().catch(() => ({}))
        setError(body?.error ?? 'Save failed')
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        {(['test', 'live'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-colors capitalize ${
              mode === m
                ? 'bg-green-600 text-white border-green-600'
                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {m} Mode
          </button>
        ))}
      </div>

      <TextInput
        label="Razorpay Key ID"
        value={keyId}
        onChange={setKeyId}
        placeholder={mode === 'test' ? 'rzp_test_...' : 'rzp_live_...'}
        required
      />
      <SecretInput
        label="Razorpay Key Secret"
        value={keySecret}
        onChange={setKeySecret}
        placeholder="Your Razorpay secret key"
        required
      />

      <button
        type="submit"
        disabled={saving || saved}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-60"
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <CheckCircle className="h-4 w-4" /> : null}
        {saved ? 'Saved' : 'Test & Save'}
      </button>
    </form>
  )
}

// ─── Step 3: WhatsApp ─────────────────────────────────────────────────────────

function WhatsAppStep({ onSaved }: { onSaved: () => void }) {
  const [provider, setProvider] = useState<'wati' | 'meta'>('wati')
  // Wati
  const [watiEndpoint, setWatiEndpoint] = useState('')
  const [watiToken, setWatiToken] = useState('')
  // Meta
  const [metaToken, setMetaToken] = useState('')
  const [metaPhoneId, setMetaPhoneId] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const settings =
      provider === 'wati'
        ? { provider: 'wati', wati_endpoint: watiEndpoint, wati_token: watiToken }
        : { provider: 'meta', meta_token: metaToken, meta_phone_id: metaPhoneId }
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: 'whatsapp', settings }),
      })
      if (res.ok) {
        setSaved(true)
        onSaved()
      } else {
        const body = await res.json().catch(() => ({}))
        setError(body?.error ?? 'Save failed')
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        {(['wati', 'meta'] as const).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setProvider(p)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-colors ${
              provider === p
                ? 'bg-green-600 text-white border-green-600'
                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {p === 'wati' ? 'Wati.io' : 'Meta Cloud API'}
          </button>
        ))}
      </div>

      {provider === 'wati' ? (
        <>
          <TextInput
            label="Wati API Endpoint"
            value={watiEndpoint}
            onChange={setWatiEndpoint}
            placeholder="https://live-mt-server.wati.io/your-id"
            required
          />
          <SecretInput
            label="Wati API Token"
            value={watiToken}
            onChange={setWatiToken}
            placeholder="Bearer token from Wati dashboard"
            required
          />
        </>
      ) : (
        <>
          <SecretInput
            label="Meta Cloud API Token"
            value={metaToken}
            onChange={setMetaToken}
            placeholder="EAAxxxx..."
            required
          />
          <TextInput
            label="Phone Number ID"
            value={metaPhoneId}
            onChange={setMetaPhoneId}
            placeholder="1234567890123456"
            required
          />
        </>
      )}

      <button
        type="submit"
        disabled={saving || saved}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-60"
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <CheckCircle className="h-4 w-4" /> : null}
        {saved ? 'Saved' : 'Test & Save'}
      </button>
    </form>
  )
}

// ─── Step 4: Email ────────────────────────────────────────────────────────────

function EmailStep({ onSaved }: { onSaved: () => void }) {
  const [host, setHost] = useState('')
  const [port, setPort] = useState('587')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [fromAddress, setFromAddress] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<string | null>(null)

  const handleSendTest = async () => {
    setTesting(true)
    setTestResult(null)
    try {
      const res = await fetch('/api/admin/settings/email-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ host, port: Number(port), username, password, from_address: fromAddress }),
      })
      if (res.ok) {
        setTestResult('Test email sent successfully!')
      } else {
        const body = await res.json().catch(() => ({}))
        setTestResult(body?.error ?? 'Test email failed')
      }
    } catch {
      setTestResult('Failed to send test email')
    } finally {
      setTesting(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: 'email',
          settings: { smtp_host: host, smtp_port: port, smtp_username: username, smtp_password: password, from_address: fromAddress },
        }),
      })
      if (res.ok) {
        setSaved(true)
        onSaved()
      } else {
        const body = await res.json().catch(() => ({}))
        setError(body?.error ?? 'Save failed')
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <TextInput label="SMTP Host" value={host} onChange={setHost} placeholder="smtp.gmail.com" required />
        <TextInput label="Port" value={port} onChange={setPort} placeholder="587" type="number" required />
      </div>
      <TextInput label="Username" value={username} onChange={setUsername} placeholder="noreply@yourdomain.com" required />
      <SecretInput label="Password / App Password" value={password} onChange={setPassword} required />
      <TextInput label="From Address" value={fromAddress} onChange={setFromAddress} placeholder="GoMiGo <noreply@yourdomain.com>" required />

      {testResult && (
        <div
          className={`text-sm px-3 py-2 rounded-lg ${
            testResult.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}
        >
          {testResult}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleSendTest}
          disabled={testing || !host || !username}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-60"
        >
          {testing && <Loader2 className="h-4 w-4 animate-spin" />}
          Send Test Email
        </button>
        <button
          type="submit"
          disabled={saving || saved}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <CheckCircle className="h-4 w-4" /> : null}
          {saved ? 'Saved' : 'Test & Save'}
        </button>
      </div>
    </form>
  )
}

// ─── Step 5: Admin Account ────────────────────────────────────────────────────

function AdminAccountStep({ onSaved }: { onSaved: () => void }) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [designation, setDesignation] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Pre-fill email from Supabase client session
    import('@/lib/supabase/client').then(({ createClient }) => {
      createClient()
        .auth.getSession()
        .then(({ data: { session } }) => {
          if (session?.user?.email) setEmail(session.user.email)
        })
    })
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: 'admin',
          settings: { full_name: fullName, email, designation },
        }),
      })
      if (res.ok) {
        setSaved(true)
        onSaved()
      } else {
        const body = await res.json().catch(() => ({}))
        setError(body?.error ?? 'Save failed')
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      <TextInput label="Full Name" value={fullName} onChange={setFullName} placeholder="Your full name" required />
      <TextInput label="Email" value={email} onChange={setEmail} type="email" placeholder="admin@yourdomain.com" required />
      <TextInput label="Designation" value={designation} onChange={setDesignation} placeholder="Platform Administrator" />

      <button
        type="submit"
        disabled={saving || saved}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-60"
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <CheckCircle className="h-4 w-4" /> : null}
        {saved ? 'Saved' : 'Test & Save'}
      </button>
    </form>
  )
}

// ─── Progress Stepper ─────────────────────────────────────────────────────────

function Stepper({
  current,
  statuses,
  onGo,
}: {
  current: Steps
  statuses: Record<Steps, StepStatus>
  onGo: (s: Steps) => void
}) {
  return (
    <div className="flex items-center gap-1">
      {STEP_ORDER.map((step, idx) => {
        const { label, icon: Icon } = STEP_META[step]
        const isCurrent = step === current
        const isDone = statuses[step].saved
        const isPast = STEP_ORDER.indexOf(step) < STEP_ORDER.indexOf(current)

        return (
          <div key={step} className="flex items-center">
            <button
              onClick={() => onGo(step)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isCurrent
                  ? 'bg-green-600 text-white'
                  : isDone
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : isPast
                  ? 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
              }`}
            >
              {isDone ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <Icon className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">{label}</span>
              <span className="sm:hidden text-xs">{idx + 1}</span>
            </button>
            {idx < STEP_ORDER.length - 1 && (
              <ChevronRight className="h-4 w-4 text-gray-300 mx-1 flex-shrink-0" />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Main Setup Page ──────────────────────────────────────────────────────────

export default function SetupPage() {
  const [currentStep, setCurrentStep] = useState<Steps>('database')
  const [statuses, setStatuses] = useState<Record<Steps, StepStatus>>(
    Object.fromEntries(STEP_ORDER.map((s) => [s, { saved: false, error: null }])) as Record<
      Steps,
      StepStatus
    >
  )

  const markSaved = (step: Steps) => {
    setStatuses((prev) => ({ ...prev, [step]: { saved: true, error: null } }))
  }

  const goNext = () => {
    const idx = STEP_ORDER.indexOf(currentStep)
    if (idx < STEP_ORDER.length - 1) setCurrentStep(STEP_ORDER[idx + 1])
  }

  const allDone = STEP_ORDER.every((s) => statuses[s].saved)
  const currentMeta = STEP_META[currentStep]
  const Icon = currentMeta.icon

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Platform Setup</h1>
        <p className="text-sm text-gray-500 mt-1">
          Configure GoMiGo for production. Complete each step to get started.
        </p>
      </div>

      {/* Stepper */}
      <Stepper current={currentStep} statuses={statuses} onGo={setCurrentStep} />

      {/* All Done Banner */}
      {allDone && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-4 flex items-center gap-3">
          <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
          <div>
            <p className="font-semibold text-green-800">Setup Complete!</p>
            <p className="text-sm text-green-700 mt-0.5">
              All platform settings are configured. GoMiGo is ready for production.
            </p>
          </div>
        </div>
      )}

      {/* Step Card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-5 border-b bg-gray-50">
          <div className="p-2 bg-green-100 rounded-lg">
            <Icon className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Step {STEP_ORDER.indexOf(currentStep) + 1}: {currentMeta.label}
            </h2>
            <p className="text-xs text-gray-500">{currentMeta.description}</p>
          </div>
          {statuses[currentStep].saved && (
            <div className="ml-auto flex items-center gap-1 text-green-600 text-sm font-medium">
              <CheckCircle className="h-4 w-4" />
              Saved
            </div>
          )}
        </div>

        <div className="px-6 py-6">
          {currentStep === 'database' && (
            <DatabaseStep onSaved={() => markSaved('database')} />
          )}
          {currentStep === 'payments' && (
            <PaymentsStep onSaved={() => markSaved('payments')} />
          )}
          {currentStep === 'whatsapp' && (
            <WhatsAppStep onSaved={() => markSaved('whatsapp')} />
          )}
          {currentStep === 'email' && (
            <EmailStep onSaved={() => markSaved('email')} />
          )}
          {currentStep === 'admin' && (
            <AdminAccountStep onSaved={() => markSaved('admin')} />
          )}
        </div>

        {/* Next Step Button */}
        {statuses[currentStep].saved && currentStep !== 'admin' && (
          <div className="px-6 pb-5">
            <button
              onClick={goNext}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
            >
              Next Step
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Skip Link */}
      <div className="text-center">
        <a
          href="/admin"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          <SkipForward className="h-4 w-4" />
          Skip Setup (use ENV vars)
        </a>
      </div>
    </div>
  )
}
