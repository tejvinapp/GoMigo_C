import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { booking_id } = await req.json()

    if (!booking_id) {
      return new Response(
        JSON.stringify({ error: 'booking_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Fetch booking with related data
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        *,
        listings(
          id,
          title,
          provider_id,
          demand_multiplier,
          provider_profiles(
            id,
            user_id,
            full_name,
            whatsapp_number
          )
        ),
        tourist:users!bookings_tourist_id_fkey(
          id,
          full_name,
          whatsapp_number,
          email
        )
      `)
      .eq('id', booking_id)
      .single()

    if (bookingError || !booking) {
      console.error('Error fetching booking:', bookingError)
      return new Response(
        JSON.stringify({ error: 'Booking not found', details: bookingError }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const updates: Record<string, unknown> = {}

    // Generate booking reference if not set
    if (!booking.booking_reference) {
      const year = new Date().getFullYear()
      const { count } = await supabase
        .from('bookings')
        .select('id', { count: 'exact', head: true })
        .like('booking_reference', `GM-${year}-%`)

      const sequence = String((count ?? 0) + 1).padStart(5, '0')
      updates.booking_reference = `GM-${year}-${sequence}`
    }

    // Calculate platform fee (5% of total_paise)
    const totalPaise = booking.total_paise ?? 0
    const platformFeePaise = Math.round(totalPaise * 0.05)
    updates.platform_fee_paise = platformFeePaise

    // Apply demand_multiplier if > 1
    const demandMultiplier = booking.listings?.demand_multiplier ?? 1
    if (demandMultiplier > 1) {
      const adjustedTotal = Math.round(totalPaise * demandMultiplier)
      updates.final_paise = adjustedTotal
      updates.platform_fee_paise = Math.round(adjustedTotal * 0.05)
    } else {
      updates.final_paise = totalPaise
    }

    // Persist updates
    const { error: updateError } = await supabase
      .from('bookings')
      .update(updates)
      .eq('id', booking_id)

    if (updateError) {
      console.error('Error updating booking:', updateError)
    }

    const bookingRef = updates.booking_reference ?? booking.booking_reference
    const tourist = booking.tourist
    const provider = booking.listings?.provider_profiles

    // Send WhatsApp confirmation to tourist
    if (tourist?.whatsapp_number) {
      const { error: touristNotifError } = await supabase.functions.invoke('send-notification', {
        body: {
          user_id: tourist.id,
          type: 'booking_confirmation',
          channel: 'whatsapp',
          language: booking.language ?? 'en',
          variables: {
            tourist_name: tourist.full_name ?? 'Traveller',
            booking_reference: String(bookingRef),
            listing_title: booking.listings?.title ?? 'Your booking',
            total_amount: String(Math.round((updates.final_paise as number) / 100)),
            travel_date: booking.travel_date ?? '',
          },
          recipient_phone: tourist.whatsapp_number,
        },
      })
      if (touristNotifError) console.error('Tourist WhatsApp error:', touristNotifError)
    }

    // Send WhatsApp alert to provider
    if (provider?.user_id && provider?.whatsapp_number) {
      const { error: providerNotifError } = await supabase.functions.invoke('send-notification', {
        body: {
          user_id: provider.user_id,
          type: 'provider_new_booking',
          channel: 'whatsapp',
          language: 'en',
          variables: {
            provider_name: provider.full_name ?? 'Provider',
            booking_reference: String(bookingRef),
            tourist_name: tourist?.full_name ?? 'A tourist',
            listing_title: booking.listings?.title ?? 'Your listing',
            travel_date: booking.travel_date ?? '',
            total_amount: String(Math.round((updates.final_paise as number) / 100)),
          },
          recipient_phone: provider.whatsapp_number,
        },
      })
      if (providerNotifError) console.error('Provider WhatsApp error:', providerNotifError)
    }

    // Create notification DB records
    const notifications = []

    if (tourist?.id) {
      notifications.push({
        user_id: tourist.id,
        type: 'booking_confirmation',
        title: 'Booking Confirmed',
        body: `Your booking ${bookingRef} has been confirmed.`,
        data: { booking_id, booking_reference: bookingRef },
        is_read: false,
      })
    }

    if (provider?.user_id) {
      notifications.push({
        user_id: provider.user_id,
        type: 'new_booking_alert',
        title: 'New Booking Received',
        body: `You have a new booking ${bookingRef} from ${tourist?.full_name ?? 'a tourist'}.`,
        data: { booking_id, booking_reference: bookingRef },
        is_read: false,
      })
    }

    if (notifications.length > 0) {
      const { error: notifInsertError } = await supabase
        .from('notifications')
        .insert(notifications)

      if (notifInsertError) console.error('Error inserting notifications:', notifInsertError)
    }

    return new Response(
      JSON.stringify({
        success: true,
        booking_reference: bookingRef,
        platform_fee_paise: updates.platform_fee_paise,
        final_paise: updates.final_paise,
        demand_multiplier_applied: demandMultiplier > 1 ? demandMultiplier : null,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('Unhandled error in handle-booking:', err)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
