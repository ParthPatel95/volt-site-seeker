import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface APIKeyRequest {
  action: 'store' | 'retrieve' | 'delete';
  serviceName: string;
  apiKey?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Authentication failed');
    }

    const requestData: APIKeyRequest = await req.json();
    const { action, serviceName, apiKey } = requestData;

    switch (action) {
      case 'store': {
        if (!apiKey) {
          throw new Error('API key is required for store action');
        }

        // Simple encryption - in production, use proper encryption
        const encryptedKey = btoa(apiKey);

        const { error } = await supabase
          .from('user_api_keys')
          .upsert({
            user_id: user.id,
            service_name: serviceName,
            encrypted_key: encryptedKey,
            updated_at: new Date().toISOString()
          });

        if (error) throw error;

        return new Response(JSON.stringify({ 
          success: true, 
          message: 'API key stored securely' 
        }), {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      case 'retrieve': {
        const { data, error } = await supabase
          .from('user_api_keys')
          .select('encrypted_key')
          .eq('user_id', user.id)
          .eq('service_name', serviceName)
          .maybeSingle();

        if (error) throw error;

        if (!data) {
          return new Response(JSON.stringify({ 
            success: false, 
            message: 'API key not found' 
          }), {
            status: 404,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          });
        }

        // Decrypt the key
        const decryptedKey = atob(data.encrypted_key);

        return new Response(JSON.stringify({ 
          success: true, 
          apiKey: decryptedKey 
        }), {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      case 'delete': {
        const { error } = await supabase
          .from('user_api_keys')
          .delete()
          .eq('user_id', user.id)
          .eq('service_name', serviceName);

        if (error) throw error;

        return new Response(JSON.stringify({ 
          success: true, 
          message: 'API key deleted' 
        }), {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      default:
        throw new Error('Invalid action');
    }
  } catch (error: any) {
    console.error("Error in api-key-management function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Internal server error"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);