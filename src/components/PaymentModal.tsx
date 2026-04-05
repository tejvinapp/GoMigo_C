'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Razorpay type augmentation (minimal — not in @types/razorpay)
// ---------------------------------------------------------------------------

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance
    _gomigo_rzp_key?: string
  }
}

interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  order_id: string
  handler: (response: RazorpayResponse) => void
  modal?: {
    ondismiss?: () => void
  }
  prefill?: {
    name?: string
    email?: string
    contact?: string
  }
  theme?: {
    color?: string
  }
}

interface RazorpayResponse {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

interface RazorpayInstance {
  open(): void
  close(): void
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface PaymentModalProps {
  orderId: string
  amount: number       // in paise
  onSuccess: () => void
  onClose: () => void
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatINR(paise: number): string {
  return `₹${(paise / 100).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      resolve(true)
      return
    }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.head.appendChild(script)
  })
}

function getRazorpayKey(): string {
  // Priority: meta tag → data attribute on body → env global → fallback
  if (typeof document !== 'undefined') {
    const meta = document.querySelector<HTMLMetaElement>('meta[name="razorpay-key"]')
    if (meta?.content) return meta.content

    const bodyKey = document.body?.dataset?.rzpKey
    if (bodyKey) return bodyKey
  }
  if (typeof window !== 'undefined' && window._gomigo_rzp_key) {
    return window._gomigo_rzp_key
  }
  // fallback — will surface a Razorpay error in their modal
  return ''
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

type Status = 'idle' | 'loading' | 'ready' | 'processing' | 'success' | 'error'

export default function PaymentModal({
  orderId,
  amount,
  onSuccess,
  onClose,
}: PaymentModalProps) {
  const [status, setStatus] = useState<Status>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const rzpRef = useRef<RazorpayInstance | null>(null)

  // Load Razorpay script on mount
  useEffect(() => {
    setStatus('loading')
    loadRazorpayScript().then((ok) => {
      if (ok) {
        setStatus('ready')
      } else {
        setStatus('error')
        setErrorMessage(
          'Could not load the payment gateway. Please check your internet connection and try again.'
        )
      }
    })
  }, [])

  const handlePayment = useCallback(async () => {
    if (status !== 'ready') return
    setStatus('processing')
    setErrorMessage(null)

    const key = getRazorpayKey()
    if (!key) {
      setStatus('error')
      setErrorMessage('Payment configuration error. Please contact support.')
      return
    }

    const options: RazorpayOptions = {
      key,
      amount,
      currency: 'INR',
      name: 'GoMiGo',
      description: 'Travel booking payment',
      order_id: orderId,
      theme: { color: '#0d9488' },
      handler: async (response: RazorpayResponse) => {
        try {
          // Extract booking id from order_id convention (order_<bookingId>_...)
          // Fall back to the raw orderId if pattern doesn't match
          const bookingId = orderId.startsWith('order_')
            ? orderId.replace(/^order_/, '').split('_')[0]
            : orderId

          const res = await fetch(`/api/bookings/${bookingId}/payment-confirm`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            }),
          })

          if (!res.ok) {
            const err = await res.json().catch(() => ({}))
            throw new Error(err.message ?? 'Payment verification failed')
          }

          setStatus('success')
          onSuccess()
        } catch (err) {
          setStatus('error')
          setErrorMessage(
            err instanceof Error
              ? err.message
              : 'Payment was received but confirmation failed. Please contact support with your payment ID.'
          )
        }
      },
      modal: {
        ondismiss: () => {
          // User closed Razorpay modal without paying
          setStatus('ready')
        },
      },
    }

    const rzp = new window.Razorpay(options)
    rzpRef.current = rzp
    rzp.open()
  }, [status, amount, orderId, onSuccess])

  return (
    <Dialog.Root open onOpenChange={(open) => { if (!open) onClose() }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-fade-in" />
        <Dialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2',
            'rounded-2xl bg-white p-6 shadow-xl focus:outline-none',
            'data-[state=open]:animate-fade-in'
          )}
          aria-describedby="payment-description"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <Dialog.Title className="text-lg font-semibold text-gray-900">
              Complete Payment
            </Dialog.Title>
            <Dialog.Close
              onClick={onClose}
              className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
              aria-label="Close"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Dialog.Close>
          </div>

          <p id="payment-description" className="sr-only">
            Secure payment via Razorpay
          </p>

          {/* Amount */}
          <div className="mt-6 flex flex-col items-center rounded-xl bg-teal-50 py-6">
            <p className="text-sm text-gray-500">Amount to pay</p>
            <p className="mt-1 text-4xl font-bold text-teal-800">
              {formatINR(amount)}
            </p>
            <p className="mt-1 text-xs text-gray-400">Secured by Razorpay</p>
          </div>

          {/* Status messages */}
          {status === 'loading' && (
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
              <LoadingSpinner size="sm" />
              Loading payment gateway…
            </div>
          )}

          {status === 'error' && errorMessage && (
            <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              <p className="font-medium">Payment error</p>
              <p className="mt-1">{errorMessage}</p>
            </div>
          )}

          {status === 'success' && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700">
              <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Payment confirmed! Your booking is being processed.
            </div>
          )}

          {/* Order reference */}
          <p className="mt-3 text-center text-xs text-gray-400">
            Order ref: <span className="font-mono">{orderId}</span>
          </p>

          {/* Actions */}
          <div className="mt-5 flex flex-col gap-2">
            {(status === 'ready' || status === 'error') && (
              <button
                onClick={handlePayment}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gomigo-teal px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
              >
                {status === 'error' ? 'Retry Payment' : 'Pay Now'}
              </button>
            )}

            {status === 'processing' && (
              <button
                disabled
                className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-teal-300 px-6 py-3 text-sm font-semibold text-white"
              >
                <LoadingSpinner size="sm" className="text-white" />
                Processing…
              </button>
            )}

            {status !== 'success' && (
              <button
                onClick={onClose}
                className="w-full rounded-xl border border-gray-200 px-6 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2"
              >
                Cancel
              </button>
            )}

            {status === 'success' && (
              <button
                onClick={onClose}
                className="w-full rounded-xl border border-teal-200 bg-teal-50 px-6 py-2.5 text-sm font-medium text-teal-700 transition-colors hover:bg-teal-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
              >
                Close
              </button>
            )}
          </div>

          {/* Trust note */}
          <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-gray-400">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            256-bit SSL encrypted · PCI DSS compliant
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function LoadingSpinner({
  size = 'md',
  className,
}: {
  size?: 'sm' | 'md'
  className?: string
}) {
  return (
    <svg
      className={cn(
        'animate-spin',
        size === 'sm' ? 'h-4 w-4' : 'h-5 w-5',
        className ?? 'text-teal-600'
      )}
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  )
}
