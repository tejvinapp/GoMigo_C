import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { formatINR } from '@/lib/utils/currency'
import { format } from 'date-fns'

export const dynamic = 'force-dynamic'

export async function GET(_request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const { data: profile } = await supabase
    .from('provider_profiles')
    .select('id, display_name')
    .eq('user_id', user.id)
    .single()

  if (!profile) {
    return new NextResponse('Provider profile not found', { status: 404 })
  }

  const { data: bookings } = await supabase
    .from('bookings')
    .select('booking_reference, status, total_paise, provider_payout_paise, platform_fee_paise, created_at')
    .eq('provider_id', profile.id)
    .in('status', ['completed', 'confirmed'])
    .order('created_at', { ascending: false })

  const transactions = bookings || []
  const totalGross = transactions.reduce((s, b) => s + (b.total_paise || 0), 0)
  const totalNet = transactions.reduce((s, b) => s + (b.provider_payout_paise || 0), 0)
  const totalCommission = transactions.reduce((s, b) => s + (b.platform_fee_paise || 0), 0)

  const providerName = (profile as unknown as { display_name: string | null }).display_name || 'Provider'
  const generatedAt = format(new Date(), 'dd MMM yyyy, hh:mm a')

  // Generate a simple HTML-based "PDF" (printable page)
  const rows = transactions
    .map((b) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${b.booking_reference || b.created_at?.slice(0, 10)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${format(new Date(b.created_at), 'dd MMM yyyy')}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right;">${formatINR(b.total_paise || 0)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right;color:#ea580c;">${formatINR(b.platform_fee_paise || 0)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right;color:#16a34a;">${formatINR(b.provider_payout_paise || 0)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-transform:capitalize;">${b.status}</td>
      </tr>
    `)
    .join('')

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>GoMiGo Earnings Report — ${providerName}</title>
<style>
  body { font-family: -apple-system, sans-serif; color: #111; margin: 40px; }
  h1 { font-size: 24px; color: #166534; }
  .meta { color: #6b7280; font-size: 13px; margin-bottom: 24px; }
  .summary { display: flex; gap: 24px; margin-bottom: 32px; flex-wrap: wrap; }
  .card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px 20px; min-width: 140px; }
  .card-label { font-size: 12px; color: #6b7280; margin-bottom: 4px; }
  .card-value { font-size: 20px; font-weight: 700; }
  table { width: 100%; border-collapse: collapse; font-size: 14px; }
  th { padding: 10px 12px; background: #f3f4f6; text-align: left; font-weight: 600; color: #374151; }
  tr:last-child td { border-bottom: none; }
  .footer { margin-top: 32px; font-size: 12px; color: #9ca3af; text-align: center; }
  @media print { body { margin: 20px; } }
</style>
</head>
<body>
<h1>GoMiGo Earnings Report</h1>
<div class="meta">Provider: ${providerName} &nbsp;|&nbsp; Generated: ${generatedAt} IST</div>

<div class="summary">
  <div class="card">
    <div class="card-label">Total Earnings (Gross)</div>
    <div class="card-value">${formatINR(totalGross)}</div>
  </div>
  <div class="card">
    <div class="card-label">Platform Commission (5%)</div>
    <div class="card-value" style="color:#ea580c;">${formatINR(totalCommission)}</div>
  </div>
  <div class="card">
    <div class="card-label">Your Net Payout</div>
    <div class="card-value" style="color:#16a34a;">${formatINR(totalNet)}</div>
  </div>
  <div class="card">
    <div class="card-label">Total Transactions</div>
    <div class="card-value">${transactions.length}</div>
  </div>
</div>

<table>
  <thead>
    <tr>
      <th>Reference</th>
      <th>Date</th>
      <th style="text-align:right;">Gross</th>
      <th style="text-align:right;">Commission</th>
      <th style="text-align:right;">Net Payout</th>
      <th>Status</th>
    </tr>
  </thead>
  <tbody>
    ${rows || '<tr><td colspan="6" style="padding:16px;text-align:center;color:#9ca3af;">No transactions yet</td></tr>'}
  </tbody>
</table>

<div class="footer">
  GoMiGo · India's Local Travel Super-App · DPDP Act 2023 Compliant<br>
  This report is auto-generated. For disputes, contact support@gomigo.in
</div>
</body>
</html>`

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Disposition': `attachment; filename="gomigo-earnings-${format(new Date(), 'yyyy-MM')}.html"`,
    },
  })
}
