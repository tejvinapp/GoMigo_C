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

interface KYCUpdatePayload {
  kyc_document_id: string
  new_status: 'approved' | 'rejected'
  reason?: string
}

async function sendWhatsApp(params: {
  phone: string
  templateName: string
  variables: string[]
  language: string
}) {
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

  if (!watiEndpoint?.value || !watiToken?.value) return false

  const phone = params.phone.replace('+', '')
  const response = await fetch(
    `${watiEndpoint.value}/api/v1/sendTemplateMessage?whatsappNumber=${phone}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${watiToken.value}`,
      },
      body: JSON.stringify({
        template_name: params.templateName,
        broadcast_name: `gomigo_kyc_${Date.now()}`,
        parameters: params.variables.map((v, i) => ({
          name: `parameter${i + 1}`,
          value: v,
        })),
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

  let body: KYCUpdatePayload
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const { kyc_document_id, new_status, reason } = body

  if (!kyc_document_id || !new_status) {
    return new Response(
      JSON.stringify({ error: 'kyc_document_id and new_status are required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  if (!['approved', 'rejected'].includes(new_status)) {
    return new Response(
      JSON.stringify({ error: 'new_status must be approved or rejected' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    // Fetch the KYC document
    const { data: kycDoc, error: kycError } = await supabase
      .from('kyc_documents')
      .select('id, provider_id, document_type, status')
      .eq('id', kyc_document_id)
      .single()

    if (kycError || !kycDoc) {
      return new Response(JSON.stringify({ error: 'KYC document not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Update KYC document status
    const { error: updateError } = await supabase
      .from('kyc_documents')
      .update({
        status: new_status,
        reviewed_at: new Date().toISOString(),
        rejection_reason: new_status === 'rejected' ? (reason ?? null) : null,
      })
      .eq('id', kyc_document_id)

    if (updateError) {
      throw new Error(`Failed to update KYC document: ${updateError.message}`)
    }

    // Fetch provider with user info
    const { data: provider, error: providerError } = await supabase
      .from('provider_profiles')
      .select('id, user_id, display_name, is_verified')
      .eq('id', kycDoc.provider_id)
      .single()

    if (providerError || !provider) {
      throw new Error(`Provider not found: ${kycDoc.provider_id}`)
    }

    // Fetch user for phone and language
    const { data: user } = await supabase
      .from('users')
      .select('phone, preferred_language')
      .eq('id', provider.user_id)
      .single()

    const language = user?.preferred_language || 'en'

    // On approval: check if all required docs are approved, then verify provider
    if (new_status === 'approved') {
      const { data: allDocs } = await supabase
        .from('kyc_documents')
        .select('document_type, status')
        .eq('provider_id', kycDoc.provider_id)

      const requiredDocTypes = ['aadhaar', 'pan', 'driving_license']
      const approvedTypes = (allDocs || [])
        .filter((d) => d.status === 'approved')
        .map((d) => d.document_type)

      const allRequiredApproved = requiredDocTypes.every((t) =>
        approvedTypes.includes(t)
      )

      if (allRequiredApproved && !provider.is_verified) {
        await supabase
          .from('provider_profiles')
          .update({ is_verified: true, verified_at: new Date().toISOString() })
          .eq('id', provider.id)

        // Send fully verified notification
        if (user?.phone) {
          await sendWhatsApp({
            phone: user.phone,
            templateName: `gomigo_kyc_fully_verified_${language}`,
            variables: [provider.display_name || 'Provider'],
            language,
          })
        }
      } else if (user?.phone) {
        // Send document approved notification
        await sendWhatsApp({
          phone: user.phone,
          templateName: `gomigo_kyc_document_approved_${language}`,
          variables: [
            provider.display_name || 'Provider',
            kycDoc.document_type,
          ],
          language,
        })
      }
    } else {
      // Rejected — notify provider with reason
      if (user?.phone) {
        await sendWhatsApp({
          phone: user.phone,
          templateName: `gomigo_kyc_rejected_${language}`,
          variables: [
            provider.display_name || 'Provider',
            kycDoc.document_type,
            reason || 'Document not clear or invalid',
          ],
          language,
        })
      }
    }

    // Log to admin_activity_log
    await supabase.from('admin_activity_log').insert({
      action: `kyc_${new_status}`,
      entity_type: 'kyc_documents',
      entity_id: kyc_document_id,
      new_value: { status: new_status, document_type: kycDoc.document_type },
      metadata: {
        provider_id: kycDoc.provider_id,
        reason: reason ?? null,
      },
      created_at: new Date().toISOString(),
    })

    return new Response(
      JSON.stringify({ success: true, status: new_status }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('handle-kyc error:', err)
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
