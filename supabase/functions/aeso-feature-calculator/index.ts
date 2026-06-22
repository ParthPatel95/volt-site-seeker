import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import { corsHeaders } from "../_shared/cors.ts";

// The original implementation pulled all of aeso_training_data (3000+ rows ×
// 141 columns) plus every natural-gas price into memory and recomputed every
// lag / rolling feature in JS. That blew Deno's per-worker memory limit
// ("Memory limit exceeded" -> 546 WORKER_RESOURCE_LIMIT). The same features
// are now computed entirely in Postgres via calculate_enhanced_features_batch().
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("Running calculate_lag_features_fast() in Postgres…");
    const start = Date.now();
    const { data, error } = await supabase.rpc(
      "calculate_lag_features_fast",
      { p_hours_back: 240 },
    );
    if (error) {
      console.error("RPC calculate_enhanced_features_batch failed:", error);
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    const durationMs = Date.now() - start;
    console.log(`✅ Feature calculation complete in ${durationMs}ms`, data);

    return new Response(
      JSON.stringify({ success: true, durationMs, result: data }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Error calculating enhanced features:", error);
    return new Response(
      JSON.stringify({ success: false, error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
