import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabaseClient = createClient(supabaseUrl, serviceRoleKey);

    const { user_id, email, full_name, company } = await req.json();

    if (!user_id || !email) {
      return new Response(
        JSON.stringify({ error: 'user_id and email are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log('Creating academy profile for user:', user_id);

    // Check if profile already exists
    const { data: existing } = await supabaseClient
      .from('academy_users')
      .select('id')
      .eq('user_id', user_id)
      .single();

    if (existing) {
      console.log('Profile already exists for user:', user_id);
      return new Response(
        JSON.stringify({ message: 'Profile already exists', data: existing }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Create the profile using service role (bypasses RLS)
    const { data, error } = await supabaseClient
      .from('academy_users')
      .insert({
        user_id,
        email,
        full_name: full_name || null,
        company: company || null,
        is_email_verified: false
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating academy profile:', error);
      throw error;
    }

    console.log('Successfully created academy profile:', data.id);

    return new Response(
      JSON.stringify({ success: true, data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error in create-academy-profile:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
