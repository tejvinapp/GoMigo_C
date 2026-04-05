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

interface ActivateDestinationPayload {
  destination_id: string
  activate: boolean
}

async function verifyAdminJWT(token: string): Promise<{ userId: string } | null> {
  const userSupabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  )

  const { data: { user }, error } = await userSupabase.auth.getUser()
  if (error || !user) return null

  // Check admin role in users table
  const { data: userRow } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (userRow?.role !== 'admin') return null
  return { userId: user.id }
}

async function clearCloudflareCache(zoneId: string, cfToken: string, destinationSlug: string): Promise<boolean> {
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cfToken}`,
      },
      body: JSON.stringify({
        files: [
          `${Deno.env.get('NEXT_PUBLIC_APP_URL') || 'https://gomigo.app'}/destinations/${destinationSlug}`,
          `${Deno.env.get('NEXT_PUBLIC_APP_URL') || 'https://gomigo.app'}/api/destinations`,
        ],
      }),
    }
  )
  return response.ok
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // 1. Verify admin JWT
  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Missing authorization' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const admin = await verifyAdminJWT(authHeader.slice(7))
  if (!admin) {
    return new Response(JSON.stringify({ error: 'Forbidden: admin access required' }), {
      status: 403,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  let body: ActivateDestinationPayload
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const { destination_id, activate } = body
  if (!destination_id || typeof activate !== 'boolean') {
    return new Response(
      JSON.stringify({ error: 'destination_id and activate (boolean) are required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    // Fetch destination
    const { data: destination, error: destError } = await supabase
      .from('destinations')
      .select('id, name, slug, is_active')
      .eq('id', destination_id)
      .single()

    if (destError || !destination) {
      return new Response(JSON.stringify({ error: 'Destination not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 2. If activating: check at least 1 active listing exists
    if (activate) {
      const { count, error: listingError } = await supabase
        .from('listings')
        .select('id', { count: 'exact', head: true })
        .eq('destination_id', destination_id)
        .eq('listing_visible', true)
        .is('deleted_at', null)

      if (listingError) {
        throw new Error(`Failed to check listings: ${listingError.message}`)
      }

      if (!count || count === 0) {
        return new Response(
          JSON.stringify({
            error: 'Cannot activate destination: no active listings exist. Add at least one listing first.',
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // 3. Update destinations.is_active
    const { error: updateError } = await supabase
      .from('destinations')
      .update({ is_active: activate, updated_at: new Date().toISOString() })
      .eq('id', destination_id)

    if (updateError) {
      throw new Error(`Failed to update destination: ${updateError.message}`)
    }

    // 4. If activating: send WhatsApp to all providers in destination
    if (activate) {
      const { data: providers } = await supabase
        .from('provider_profiles')
        .select('id, user_id, display_name')
        .eq('destination_id', destination_id)
        .eq('is_active', true)

      const { data: watiEndpoint } = await supabase
        .from('platform_settings')
        .select('value')
        .eq('key', 'wati_endpoint')
        .single()
      const { data: watiToken } = await supabase
        .from('platform_settings')
        .select('value')
        .eq('key', 'wati_token')
        .single()

      let notifiedCount = 0
      if (providers && watiEndpoint?.value && watiToken?.value) {
        for (const provider of providers) {
          const { data: user } = await supabase
            .from('users')
            .select('phone, preferred_language')
            .eq('id', provider.user_id)
            .single()

          if (!user?.phone) continue

          const language = user.preferred_language || 'en'
          const phone = user.phone.replace('+', '')

          const res = await fetch(
            `${watiEndpoint.value}/api/v1/sendTemplateMessage?whatsappNumber=${phone}`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${watiToken.value}`,
              },
              body: JSON.stringify({
                template_name: `gomigo_destination_activated_${language}`,
                broadcast_name: `gomigo_dest_active_${Date.now()}`,
                parameters: [
                  { name: 'parameter1', value: provider.display_name || 'Provider' },
                  { name: 'parameter2', value: destination.name },
                ],
              }),
            }
          )
          if (res.ok) notifiedCount++
        }
      }

      // Log activation
      await supabase.from('admin_activity_log').insert({
        admin_id: admin.userId,
        action: 'destination_activated',
        entity_type: 'destinations',
        entity_id: destination_id,
        new_value: { is_active: true, providers_notified: notifiedCount },
        created_at: new Date().toISOString(),
      })
    } else {
      await supabase.from('admin_activity_log').insert({
        admin_id: admin.userId,
        action: 'destination_deactivated',
        entity_type: 'destinations',
        entity_id: destination_id,
        new_value: { is_active: false },
        created_at: new Date().toISOString(),
      })
    }

    // 5. Optionally clear Cloudflare cache
    const { data: cfZoneRow } = await supabase
      .from('platform_settings')
      .select('value')
      .eq('key', 'CF_ZONE_ID')
      .single()
    const { data: cfTokenRow } = await supabase
      .from('platform_settings')
      .select('value')
      .eq('key', 'CF_API_TOKEN')
      .single()

    let cacheCleared = false
    if (cfZoneRow?.value && cfTokenRow?.value) {
      cacheCleared = await clearCloudflareCache(
        cfZoneRow.value,
        cfTokenRow.value,
        destination.slug
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        destination_id,
        is_active: activate,
        cache_cleared: cacheCleared,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('activate-destination error:', err)
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
