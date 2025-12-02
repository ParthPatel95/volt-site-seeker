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

Deno.serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { bucket, path, storagePath, expiresIn, isVideo } = await req.json();

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
          "Cache-Control": "public, max-age=300" // 5 min cache for repeated requests
        },
      }
    );
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
