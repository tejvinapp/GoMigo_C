// MSG91 SMS — fallback when WhatsApp fails
import { getSetting } from '@/src/lib/settings'

export async function sendSMS(params: {
  to: string      // E.164: +919876543210
  message: string
}): Promise<{ success: boolean }> {
  const authKey = await getSetting('msg91_auth_key')
  const senderId = await getSetting('msg91_sender_id') || 'GOMIGO'

  if (!authKey) {
    console.warn('MSG91 not configured — SMS not sent')
    return { success: false }
  }

  // Strip +91 for MSG91 API
  const mobile = params.to.replace(/^\+91/, '').replace(/\D/g, '')

  try {
    const response = await fetch('https://api.msg91.com/api/v5/flow/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authkey: authKey,
      },
      body: JSON.stringify({
        sender: senderId,
        route: '4', // Transactional route
        country: '91',
        sms: [{ message: params.message, to: [mobile] }],
      }),
      signal: AbortSignal.timeout(10000),
    })

    return { success: response.ok }
  } catch {
    return { success: false }
  }
}

export async function sendOTPSMS(phone: string, otp: string): Promise<{ success: boolean }> {
  return sendSMS({
    to: phone,
    message: `${otp} is your GoMiGo OTP. Valid for 10 minutes. Do not share with anyone.`,
  })
}
