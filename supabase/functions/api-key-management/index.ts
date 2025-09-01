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

// Secure encryption/decryption using Web Crypto API
async function encryptApiKey(apiKey: string, userSecret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(userSecret.padEnd(32, '0')),
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  );
  
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = new TextEncoder().encode(apiKey);
  
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  );
  
  // Combine iv and encrypted data
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);
  
  return btoa(String.fromCharCode(...combined));
}

async function decryptApiKey(encryptedData: string, userSecret: string): Promise<string> {
  try {
    const combined = new Uint8Array(
      atob(encryptedData).split('').map(char => char.charCodeAt(0))
    );
    
    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);
    
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(userSecret.padEnd(32, '0')),
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );
    
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encrypted
    );
    
    return new TextDecoder().decode(decrypted);
  } catch (error) {
    // Fallback for old base64 encrypted keys
    return atob(encryptedData);
  }
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

        // Use proper AES encryption with user ID as secret
        const encryptedKey = await encryptApiKey(apiKey, user.id);

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

        // Decrypt the key using proper AES decryption
        const decryptedKey = await decryptApiKey(data.encrypted_key, user.id);

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