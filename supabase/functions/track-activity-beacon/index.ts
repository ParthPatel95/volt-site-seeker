import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Parse beacon data - can be form data or JSON
    let data;
    const contentType = req.headers.get("content-type") || "";
    
    if (contentType.includes("application/json")) {
      data = await req.json();
    } else if (contentType.includes("text/plain")) {
      const text = await req.text();
      data = JSON.parse(text);
    } else {
      // Handle form data from sendBeacon
      const formData = await req.formData();
      const jsonData = formData.get("data");
      if (jsonData) {
        data = JSON.parse(jsonData.toString());
      }
    }

    if (!data?.activityId) {
      return new Response(
        JSON.stringify({ error: "Missing activityId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { activityId, totalTimeSeconds, engagementScore, pagesViewed, lastActivity } = data;

    // Update the viewer activity record
    const { error } = await supabaseClient
      .from("viewer_activity")
      .update({
        total_time_seconds: totalTimeSeconds,
        engagement_score: engagementScore,
        pages_viewed: pagesViewed,
        last_activity_at: lastActivity || new Date().toISOString(),
        closed_at: new Date().toISOString(),
      })
      .eq("id", activityId);

    if (error) {
      console.error("Error updating activity:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Beacon handler error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
