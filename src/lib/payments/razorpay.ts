// Razorpay integration — orders, subscriptions, refunds, webhook verification
import { getSetting } from '@/src/lib/settings'
import { AppError } from '@/src/lib/errors/AppError'
import crypto from 'crypto'

interface RazorpayOrder {
  id: string
  amount: number
  currency: string
  receipt: string
  status: string
}

interface RazorpayRefund {
  id: string
  amount: number
  status: string
}

async function getRazorpayCredentials() {
  const keyId = await getSetting('razorpay_key_id')
  const keySecret = await getSetting('razorpay_key_secret')

  if (!keyId || !keySecret) {
    throw new AppError('ERR_PAYMENT_TIMEOUT', { reason: 'Razorpay not configured' })
  }

  return { keyId, keySecret }
}

function getAuthHeader(keyId: string, keySecret: string): string {
  return 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64')
}

/**
 * Create a Razorpay order for a booking payment
 */
export async function createOrder(params: {
  amountPaise: number
  bookingId: string
  bookingReference: string
  notes?: Record<string, string>
}): Promise<RazorpayOrder> {
  const { keyId, keySecret } = await getRazorpayCredentials()

  const response = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: getAuthHeader(keyId, keySecret),
    },
    body: JSON.stringify({
      amount: params.amountPaise,
      currency: 'INR',
      receipt: params.bookingReference,
      notes: {
        booking_id: params.bookingId,
        booking_reference: params.bookingReference,
        platform: 'gomigo',
        ...params.notes,
      },
    }),
  })

  if (!response.ok) {
    const err = await response.json()
    throw new AppError('ERR_PAYMENT_TIMEOUT', { razorpayError: err })
  }

  return response.json()
}

/**
 * Process a refund via Razorpay
 */
export async function createRefund(params: {
  paymentId: string
  amountPaise: number
  reason?: string
}): Promise<RazorpayRefund> {
  const { keyId, keySecret } = await getRazorpayCredentials()

  const response = await fetch(
    `https://api.razorpay.com/v1/payments/${params.paymentId}/refund`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: getAuthHeader(keyId, keySecret),
      },
      body: JSON.stringify({
        amount: params.amountPaise,
        notes: { reason: params.reason || 'Customer cancellation', platform: 'gomigo' },
      }),
    }
  )

  if (!response.ok) {
    const err = await response.json()
    throw new AppError('ERR_PAYMENT_REFUND_PENDING', { razorpayError: err })
  }

  return response.json()
}

/**
 * Verify Razorpay webhook signature
 * MUST be called before processing any webhook event
 */
export async function verifyWebhookSignature(
  body: string,
  signature: string
): Promise<boolean> {
  const webhookSecret = await getSetting('razorpay_webhook_secret')
  if (!webhookSecret) return false

  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(body)
    .digest('hex')

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  )
}

/**
 * Verify payment signature after successful payment (client-side callback)
 */
export async function verifyPaymentSignature(params: {
  orderId: string
  paymentId: string
  signature: string
}): Promise<boolean> {
  const { keySecret } = await getRazorpayCredentials()

  const expectedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(`${params.orderId}|${params.paymentId}`)
    .digest('hex')

  return crypto.timingSafeEqual(
    Buffer.from(params.signature),
    Buffer.from(expectedSignature)
  )
}

/**
 * Create a recurring subscription
 */
export async function createSubscription(params: {
  planId: string
  totalCount: number
  customerName: string
  customerEmail?: string
  customerPhone: string
  notes?: Record<string, string>
}) {
  const { keyId, keySecret } = await getRazorpayCredentials()

  const response = await fetch('https://api.razorpay.com/v1/subscriptions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: getAuthHeader(keyId, keySecret),
    },
    body: JSON.stringify({
      plan_id: params.planId,
      total_count: params.totalCount,
      customer_notify: 1,
      notes: { platform: 'gomigo', ...params.notes },
    }),
  })

  if (!response.ok) {
    const err = await response.json()
    throw new AppError('ERR_PAYMENT_SUBSCRIPTION_LAPSED', { razorpayError: err })
  }

  return response.json()
}
