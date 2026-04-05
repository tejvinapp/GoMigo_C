// Email notification with template rendering
import { sendEmail } from '@/src/lib/email/index'
import { formatINR } from '@/src/lib/utils/currency'
import { formatDateTimeIST } from '@/src/lib/utils/dates'

export async function sendBookingConfirmationEmail(params: {
  touristEmail: string
  touristName: string
  bookingReference: string
  providerName: string
  providerPhone: string
  serviceType: string
  date: string
  pickupLocation: string
  totalPaise: number
  paymentMethod: string
}): Promise<void> {
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: Arial, sans-serif; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #16a34a; padding: 24px; border-radius: 12px 12px 0 0; text-align: center; color: white;">
    <div style="font-size: 32px; margin-bottom: 8px;">✅</div>
    <h1 style="margin: 0; font-size: 24px;">Booking Confirmed!</h1>
    <div style="opacity: 0.9; margin-top: 8px;">Reference: ${params.bookingReference}</div>
  </div>
  <div style="background: #f9fafb; padding: 24px; border: 1px solid #e5e7eb; border-top: 0; border-radius: 0 0 12px 12px;">
    <table style="width: 100%; border-collapse: collapse;">
      <tr><td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Service</td><td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">${params.serviceType}</td></tr>
      <tr><td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Provider</td><td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">${params.providerName}</td></tr>
      <tr><td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Provider Phone</td><td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">${params.providerPhone}</td></tr>
      <tr><td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Date & Time</td><td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">${params.date}</td></tr>
      <tr><td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Pickup</td><td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">${params.pickupLocation}</td></tr>
      <tr><td style="padding: 10px 0; font-weight: bold;">Amount Paid</td><td style="padding: 10px 0;">${formatINR(params.totalPaise)} (${params.paymentMethod.toUpperCase()})</td></tr>
    </table>
    <div style="background: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 12px; margin-top: 16px; font-size: 14px;">
      <strong>First booking?</strong> Our admin will personally call you to ensure your trip goes perfectly.
    </div>
    <p style="color: #6b7280; font-size: 12px; margin-top: 20px; text-align: center;">GoMiGo — India's Local Travel Super-App | support@gomigo.in</p>
  </div>
</body>
</html>`

  await sendEmail({
    to: params.touristEmail,
    subject: `Booking Confirmed — ${params.bookingReference} | GoMiGo`,
    html,
  })
}

export async function sendProviderNotificationEmail(params: {
  providerEmail: string
  providerName: string
  bookingReference: string
  touristName: string
  touristPhone: string
  date: string
  pickupLocation: string
  amount: number
}): Promise<void> {
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: Arial, sans-serif; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #0d9488; padding: 24px; border-radius: 12px 12px 0 0; text-align: center; color: white;">
    <div style="font-size: 32px; margin-bottom: 8px;">🔔</div>
    <h1 style="margin: 0; font-size: 24px;">New Booking!</h1>
    <div style="opacity: 0.9;">${params.bookingReference}</div>
  </div>
  <div style="background: #f9fafb; padding: 24px; border: 1px solid #e5e7eb; border-top: 0; border-radius: 0 0 12px 12px;">
    <p>Hello ${params.providerName},</p>
    <p>You have a new booking on GoMiGo!</p>
    <table style="width: 100%; border-collapse: collapse;">
      <tr><td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Tourist</td><td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">${params.touristName}</td></tr>
      <tr><td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Tourist Phone</td><td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">${params.touristPhone}</td></tr>
      <tr><td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Date</td><td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">${params.date}</td></tr>
      <tr><td style="padding: 8px 0; font-weight: bold;">Pickup</td><td style="padding: 8px 0;">${params.pickupLocation}</td></tr>
    </table>
    <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">GoMiGo — Log in to your dashboard to manage this booking.</p>
  </div>
</body>
</html>`

  await sendEmail({ to: params.providerEmail, subject: `New Booking — ${params.bookingReference} | GoMiGo`, html })
}
