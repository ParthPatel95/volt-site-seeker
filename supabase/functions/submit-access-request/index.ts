
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

import { corsHeaders } from "../_shared/cors.ts";
import { enforceRateLimit } from "../_shared/rateLimit.ts";
interface AccessRequestData {
  fullName: string;
  email: string;
  phone: string;
  company: string;
  role: string;
  platformUse: string;
  additionalInfo?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Abuse guard: cap access-request submissions per IP.
  const limited = await enforceRateLimit(req, { name: "submit-access-request", max: 5, windowSeconds: 60, corsHeaders });
  if (limited) return limited;

  try {
    const requestData: AccessRequestData = await req.json();

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Insert access request into database
    const { data, error: dbError } = await supabase
      .from('access_requests')
      .insert({
        full_name: requestData.fullName,
        email: requestData.email,
        phone: requestData.phone,
        company: requestData.company,
        role: requestData.role,
        platform_use: requestData.platformUse,
        additional_info: requestData.additionalInfo || null
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Failed to submit access request');
    }

    console.log("Access request submitted successfully:", data.id);

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Access request submitted successfully",
      requestId: data.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in submit-access-request function:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Failed to submit access request"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
