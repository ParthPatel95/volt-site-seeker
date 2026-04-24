import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { buildCorsHeaders } from "../_shared/cors.ts"

const VALID_ROLES = new Set(['buyer', 'seller', 'broker', 'investor']);
const VALID_SELLER_TYPES = new Set([null, undefined, '', 'individual', 'company', 'broker']);

serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req)

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    if (!supabaseUrl || !anonKey || !serviceKey) {
      return new Response(
        JSON.stringify({ error: 'Server not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Require the caller to be authenticated, and derive the user_id from the
    // JWT — never trust a user_id supplied in the request body. Previously
    // any authenticated user could create a profile on behalf of any other
    // user by passing their id.
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: { user }, error: authError } = await callerClient.auth.getUser()
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const body = await req.json().catch(() => ({}))
    const { role, seller_type, company_name, phone_number } = body ?? {}

    if (!role || typeof role !== 'string' || !VALID_ROLES.has(role)) {
      return new Response(
        JSON.stringify({ error: 'Invalid or missing role' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    if (seller_type !== undefined && seller_type !== null && !VALID_SELLER_TYPES.has(seller_type)) {
      return new Response(
        JSON.stringify({ error: 'Invalid seller_type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceKey)
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('voltmarket_profiles')
      .insert({
        user_id: user.id,
        role,
        seller_type: seller_type || null,
        company_name: company_name ?? null,
        phone_number: phone_number ?? null,
        is_id_verified: false,
        is_email_verified: false,
      })
      .select()
      .single()

    if (profileError || !profile) {
      console.error('Profile creation error:', profileError?.message)
      return new Response(
        JSON.stringify({ error: 'Failed to create profile' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify(profile),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Unexpected error:', error instanceof Error ? error.message : 'unknown')
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
