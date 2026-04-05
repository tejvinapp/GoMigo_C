import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  // Validate JWT
  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Missing authorization' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const token = authHeader.slice(7)
  const userSupabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  )

  const { data: { user }, error: authError } = await userSupabase.auth.getUser()
  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  if (req.method === 'POST') {
    // POST: update driver location
    let body: { booking_id: string; lat: number; lng: number }
    try {
      body = await req.json()
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { booking_id, lat, lng } = body
    if (!booking_id || lat === undefined || lng === undefined) {
      return new Response(
        JSON.stringify({ error: 'booking_id, lat, and lng are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return new Response(
        JSON.stringify({ error: 'lat and lng must be numbers' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return new Response(
        JSON.stringify({ error: 'Invalid coordinates' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate that the authenticated user is the provider for this booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('id, provider_id, status')
      .eq('id', booking_id)
      .single()

    if (bookingError || !booking) {
      return new Response(JSON.stringify({ error: 'Booking not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Check that user owns the provider profile for this booking
    const { data: provider } = await supabase
      .from('provider_profiles')
      .select('id')
      .eq('id', booking.provider_id)
      .eq('user_id', user.id)
      .single()

    if (!provider) {
      return new Response(
        JSON.stringify({ error: 'Forbidden: you are not the provider for this booking' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!['confirmed', 'in_progress'].includes(booking.status)) {
      return new Response(
        JSON.stringify({ error: 'Location updates only allowed for confirmed or in-progress bookings' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const now = new Date().toISOString()

    // Upsert to driver_locations table
    const { error: upsertError } = await supabase
      .from('driver_locations')
      .upsert(
        {
          booking_id,
          provider_id: booking.provider_id,
          lat,
          lng,
          updated_at: now,
        },
        { onConflict: 'booking_id' }
      )

    if (upsertError) {
      console.error('driver_locations upsert error:', upsertError)
    }

    // Broadcast to Realtime channel driver:{booking_id}
    const channel = supabase.channel(`driver:${booking_id}`)
    await channel.send({
      type: 'broadcast',
      event: 'location_update',
      payload: { booking_id, lat, lng, updated_at: now },
    })

    return new Response(
      JSON.stringify({ success: true, booking_id, lat, lng, updated_at: now }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } else if (req.method === 'GET') {
    // GET: return current location for a booking
    const url = new URL(req.url)
    const bookingId = url.searchParams.get('booking_id')

    if (!bookingId) {
      return new Response(JSON.stringify({ error: 'booking_id query parameter required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Verify user has access to this booking (either tourist or provider)
    const { data: booking } = await supabase
      .from('bookings')
      .select('id, tourist_id, provider_id')
      .eq('id', bookingId)
      .single()

    if (!booking) {
      return new Response(JSON.stringify({ error: 'Booking not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Check if user is tourist for this booking
    const isTourist = booking.tourist_id === user.id

    // Check if user is provider for this booking
    const { data: provider } = await supabase
      .from('provider_profiles')
      .select('id')
      .eq('id', booking.provider_id)
      .eq('user_id', user.id)
      .single()

    if (!isTourist && !provider) {
      return new Response(
        JSON.stringify({ error: 'Forbidden: no access to this booking' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: location, error: locationError } = await supabase
      .from('driver_locations')
      .select('lat, lng, updated_at')
      .eq('booking_id', bookingId)
      .single()

    if (locationError || !location) {
      return new Response(
        JSON.stringify({ success: true, location: null, message: 'No location data yet' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ success: true, location }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } else {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
