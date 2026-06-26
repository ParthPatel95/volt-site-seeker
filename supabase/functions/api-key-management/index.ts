import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

import { corsHeaders } from "../_shared/cors.ts";
interface APIKeyRequest {
  action: 'store' | 'retrieve' | 'delete';
  serviceName: string;
  apiKey?: string;
}

// Secure encryption/decryption using the Web Crypto API.
//
// (Audit-2026-06-26:) the original scheme used the user's UUID directly as
// the AES key (padded to 32 bytes). A UUID is server-knowable and not a
// secret, so anyone who could read the ciphertext + knew the user_id could
// decrypt. We now derive the AES-GCM key with HKDF from a server-only master
// secret (`API_KEY_ENCRYPTION_MASTER`), salted by the user id — so the
// user_id alone is no longer enough.
//
// Backward compatibility is built in via a version tag:
//   * "v2:" prefix  -> HKDF(master, salt=user_id) key  (strong, current).
//   * no prefix     -> legacy padded-UUID key          (old rows).
// decrypt understands both; retrieve lazily re-encrypts legacy rows to v2
// once a master secret is configured, so no backfill migration is required.
// If `API_KEY_ENCRYPTION_MASTER` is unset, the function transparently keeps
// using the legacy scheme so nothing breaks before the secret is provisioned.

const ENCRYPTION_MASTER = Deno.env.get('API_KEY_ENCRYPTION_MASTER');
const V2_PREFIX = 'v2:';

async function importLegacyKey(userSecret: string, usages: KeyUsage[]): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(userSecret.padEnd(32, '0')),
    { name: 'AES-GCM' },
    false,
    usages,
  );
}

async function deriveV2Key(userId: string, usages: KeyUsage[]): Promise<CryptoKey> {
  const base = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(ENCRYPTION_MASTER as string),
    'HKDF',
    false,
    ['deriveKey'],
  );
  return crypto.subtle.deriveKey(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: new TextEncoder().encode(userId),
      info: new TextEncoder().encode('user_api_keys:v2'),
    },
    base,
    { name: 'AES-GCM', length: 256 },
    false,
    usages,
  );
}

/** True when a value was stored under the strong (HKDF) scheme. */
export function isV2Blob(stored: string): boolean {
  return stored.startsWith(V2_PREFIX);
}

async function encryptApiKey(apiKey: string, userId: string): Promise<string> {
  const useV2 = !!ENCRYPTION_MASTER;
  const key = useV2
    ? await deriveV2Key(userId, ['encrypt'])
    : await importLegacyKey(userId, ['encrypt']);

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = new TextEncoder().encode(apiKey);
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data);

  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);

  const b64 = btoa(String.fromCharCode(...combined));
  return useV2 ? V2_PREFIX + b64 : b64;
}

async function decryptApiKey(stored: string, userId: string): Promise<string> {
  // (Audit-2026-06-25 P0:) the previous catch block returned
  // `atob(encryptedData)` — i.e. the base64-decoded *ciphertext* — when
  // AES-GCM decryption failed. That silently leaked ciphertext bytes to
  // the caller and disguised every error as success. We throw instead so the
  // handler surfaces a proper 500 and the stored row stays opaque.
  const isV2 = isV2Blob(stored);
  if (isV2 && !ENCRYPTION_MASTER) {
    throw new Error('master key unavailable for v2-encrypted value');
  }
  const b64 = isV2 ? stored.slice(V2_PREFIX.length) : stored;

  const combined = new Uint8Array(
    atob(b64).split('').map(char => char.charCodeAt(0)),
  );
  if (combined.length < 13) throw new Error('encrypted blob too short');

  const iv = combined.slice(0, 12);
  const encrypted = combined.slice(12);

  const key = isV2
    ? await deriveV2Key(userId, ['decrypt'])
    : await importLegacyKey(userId, ['decrypt']);

  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, encrypted);
  return new TextDecoder().decode(decrypted);
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

        // Lazy migration: once a master secret is configured, transparently
        // re-encrypt any legacy (UUID-keyed) row to the strong v2 scheme on
        // first read, so stored secrets upgrade without a backfill job.
        if (ENCRYPTION_MASTER && !isV2Blob(data.encrypted_key)) {
          try {
            const upgraded = await encryptApiKey(decryptedKey, user.id);
            await supabase
              .from('user_api_keys')
              .update({ encrypted_key: upgraded, updated_at: new Date().toISOString() })
              .eq('user_id', user.id)
              .eq('service_name', serviceName);
          } catch (e) {
            console.error('api-key-management: lazy v2 re-encryption failed:', e);
          }
        }

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
        error: "Internal server error"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);