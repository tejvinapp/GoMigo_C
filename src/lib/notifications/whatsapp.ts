// WhatsApp notification — Wati.io primary, Meta Cloud API fallback
import { getSetting } from '@/src/lib/settings'
import { createAdminClient } from '@/src/lib/supabase/admin'

export interface WhatsAppMessage {
  to: string           // E.164 format: +919876543210
  templateName: string // gomigo_{type}_{lang_code}
  variables: string[]
  language?: string
}

/**
 * Send a WhatsApp message via Wati.io
 */
async function sendViaWati(message: WhatsAppMessage): Promise<{ success: boolean; messageId?: string }> {
  const endpoint = await getSetting('wati_endpoint')
  const token = await getSetting('wati_token')

  if (!endpoint || !token) return { success: false }

  const phone = message.to.replace('+', '')

  const response = await fetch(
    `${endpoint}/api/v1/sendTemplateMessage?whatsappNumber=${phone}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        template_name: message.templateName,
        broadcast_name: `gomigo_${Date.now()}`,
        parameters: message.variables.map((v, i) => ({
          name: `parameter${i + 1}`,
          value: v,
        })),
      }),
    }
  )

  if (!response.ok) return { success: false }
  const data = await response.json()
  return { success: true, messageId: data.id }
}

/**
 * Send via Meta Cloud API (fallback)
 */
async function sendViaMetaCloudAPI(message: WhatsAppMessage): Promise<{ success: boolean; messageId?: string }> {
  const phoneNumberId = await getSetting('meta_phone_number_id')
  const accessToken = await getSetting('meta_access_token')

  if (!phoneNumberId || !accessToken) return { success: false }

  const response = await fetch(
    `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: message.to,
        type: 'template',
        template: {
          name: message.templateName,
          language: { code: message.language || 'en' },
          components: message.variables.length > 0
            ? [{ type: 'body', parameters: message.variables.map(v => ({ type: 'text', text: v })) }]
            : [],
        },
      }),
    }
  )

  if (!response.ok) return { success: false }
  const data = await response.json()
  return { success: true, messageId: data.messages?.[0]?.id }
}

/**
 * Send a WhatsApp notification with automatic fallback
 * Wati → Meta Cloud API → Log failure
 */
export async function sendWhatsApp(
  message: WhatsAppMessage,
  bookingId?: string,
  recipientId?: string
): Promise<{ success: boolean; channel: string; messageId?: string }> {
  const supabase = createAdminClient()
  const templateName = message.templateName

  // Try Wati first
  let result = await sendViaWati(message)
  let channel = 'wati'

  // Fall back to Meta Cloud API if Wati fails
  if (!result.success) {
    result = await sendViaMetaCloudAPI(message)
    channel = 'meta_cloud_api'
  }

  // Log notification attempt
  if (recipientId) {
    await supabase.from('notifications').insert({
      recipient_id: recipientId,
      booking_id: bookingId,
      channel: 'whatsapp',
      template_name: templateName,
      language_code: message.language || 'en',
      variables_used: { variables: message.variables },
      status: result.success ? 'sent' : 'failed',
      external_message_id: result.messageId,
      failed_reason: result.success ? null : 'Both Wati and Meta Cloud API failed',
      sent_at: result.success ? new Date().toISOString() : null,
    })
  }

  return { ...result, channel }
}

/**
 * Send booking confirmation WhatsApp to tourist
 */
export async function sendBookingConfirmation(params: {
  touristPhone: string
  touristId: string
  bookingId: string
  bookingReference: string
  providerName: string
  providerPhone: string
  date: string
  pickupLocation: string
  language: string
}): Promise<void> {
  await sendWhatsApp(
    {
      to: params.touristPhone,
      templateName: `gomigo_booking_confirmed_${params.language}`,
      variables: [
        params.bookingReference,
        params.providerName,
        params.providerPhone,
        params.date,
        params.pickupLocation,
      ],
      language: params.language,
    },
    params.bookingId,
    params.touristId
  )
}

/**
 * Send driver assignment notification to provider
 */
export async function sendDriverAssigned(params: {
  providerPhone: string
  providerId: string
  bookingId: string
  bookingReference: string
  touristName: string
  touristPhone: string
  date: string
  pickupLocation: string
  language: string
}): Promise<void> {
  await sendWhatsApp(
    {
      to: params.providerPhone,
      templateName: `gomigo_driver_assigned_${params.language}`,
      variables: [
        params.bookingReference,
        params.touristName,
        params.touristPhone,
        params.date,
        params.pickupLocation,
      ],
      language: params.language,
    },
    params.bookingId,
    params.providerId
  )
}

/**
 * Send OTP via WhatsApp
 */
export async function sendOTP(params: {
  phone: string
  otp: string
  language?: string
}): Promise<{ success: boolean }> {
  const result = await sendWhatsApp({
    to: params.phone,
    templateName: `gomigo_otp_verification_${params.language || 'en'}`,
    variables: [params.otp, '10'],
    language: params.language || 'en',
  })

  return { success: result.success }
}
