import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Expose-Headers": "Content-Length, Content-Type, Content-Disposition",
  "Cache-Control": "no-cache, no-store, must-revalidate",
  "Pragma": "no-cache",
  "Expires": "0"
};

interface BatchPathRequest {
  storagePath: string;
  isVideo?: boolean;
  expiresIn?: number;
}

interface BatchUrlResult {
  storagePath: string;
  signedUrl: string | null;
  expiresIn: number;
  isVideo: boolean;
  error?: string;
}

Deno.serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    
    // Check if this is a batch request
    if (body.paths && Array.isArray(body.paths)) {
      return handleBatchRequest(body.paths, body.bucket);
    }
    
    // Handle single URL request (backward compatible)
    return handleSingleRequest(body);
  } catch (error: any) {
    console.error("Error in get-signed-url function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});

/**
 * Handle batch request for multiple signed URLs in one call
 */
async function handleBatchRequest(paths: BatchPathRequest[], bucket?: string): Promise<Response> {
  const bucketName = bucket || 'secure-documents';
  const startTime = Date.now();
  
  console.log(`[get-signed-url] Batch request for ${paths.length} files`);
  
  // Create Supabase client with service role key
  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  // Process all paths in parallel for maximum speed
  const results: BatchUrlResult[] = await Promise.all(
    paths.map(async (item): Promise<BatchUrlResult> => {
      const { storagePath, isVideo = false, expiresIn } = item;
      
      if (!storagePath) {
        return {
          storagePath: storagePath || '',
          signedUrl: null,
          expiresIn: 0,
          isVideo,
          error: 'Storage path is required'
        };
      }

      // Video-optimized expiry time (6 hours default for videos, 1 hour for others)
      const defaultExpiry = isVideo ? 21600 : 3600;
      const expirySeconds = expiresIn || defaultExpiry;

      try {
        const { data, error } = await supabaseAdmin.storage
          .from(bucketName)
          .createSignedUrl(storagePath, expirySeconds);

        if (error) {
          console.error(`[get-signed-url] Error for ${storagePath}:`, error.message);
          return {
            storagePath,
            signedUrl: null,
            expiresIn: expirySeconds,
            isVideo,
            error: error.message
          };
        }

        return {
          storagePath,
          signedUrl: data.signedUrl,
          expiresIn: expirySeconds,
          isVideo
        };
      } catch (err: any) {
        console.error(`[get-signed-url] Exception for ${storagePath}:`, err.message);
        return {
          storagePath,
          signedUrl: null,
          expiresIn: 0,
          isVideo,
          error: err.message
        };
      }
    })
  );

  const successCount = results.filter(r => r.signedUrl).length;
  const duration = Date.now() - startTime;
  console.log(`[get-signed-url] Batch complete: ${successCount}/${paths.length} URLs in ${duration}ms`);

  return new Response(
    JSON.stringify({ 
      signedUrls: results,
      totalRequested: paths.length,
      totalSuccess: successCount,
      processingTimeMs: duration
    }),
    {
      status: 200,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, range",
        "Access-Control-Expose-Headers": "Content-Length, Content-Type, Content-Disposition, Accept-Ranges, Content-Range",
        "Cache-Control": "public, max-age=300"
      },
    }
  );
}

/**
 * Handle single URL request (backward compatible)
 */
async function handleSingleRequest(body: any): Promise<Response> {
  const { bucket, path, storagePath, expiresIn, isVideo } = body;

  // Support both 'path' and 'storagePath' for backwards compatibility
  const filePath = path || storagePath;
  const bucketName = bucket || 'secure-documents';

  if (!filePath) {
    return new Response(
      JSON.stringify({ error: "Storage path is required" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }

  // Create Supabase client with service role key for privileged access
  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  // Video-optimized expiry time (6 hours default for videos, 1 hour for others)
  const defaultExpiry = isVideo ? 21600 : 3600;
  const expirySeconds = expiresIn || defaultExpiry;

  console.log(`[get-signed-url] Creating signed URL: ${filePath}, isVideo: ${isVideo}, expiry: ${expirySeconds}s`);

  // Create signed URL with service role permissions
  const { data, error } = await supabaseAdmin.storage
    .from(bucketName)
    .createSignedUrl(filePath, expirySeconds);

  if (error) {
    console.error("Signed URL error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }

  // Return signed URL with enhanced CORS and caching headers
  return new Response(
    JSON.stringify({ 
      signedUrl: data.signedUrl,
      expiresIn: expirySeconds,
      isVideo: isVideo || false
    }),
    {
      status: 200,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, range",
        "Access-Control-Expose-Headers": "Content-Length, Content-Type, Content-Disposition, Accept-Ranges, Content-Range",
        "Cache-Control": "public, max-age=300"
      },
    }
  );
}
