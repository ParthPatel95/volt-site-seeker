import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import { corsHeaders } from "../_shared/cors.ts";
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

    // Verify the activity row exists and is still "open" (closed_at IS NULL).
    // The beacon must be from a viewer still on the page; we don't allow
    // backfill into already-closed rows or arbitrary id strings (which would
    // otherwise let anyone overwrite any viewer_activity row with their own
    // engagement metrics). (Audit-2026-06-25 P0.)
    const { data: existing, error: lookupErr } = await supabaseClient
      .from("viewer_activity")
      .select("id, closed_at, opened_at")
      .eq("id", activityId)
      .maybeSingle();
    if (lookupErr || !existing || existing.closed_at) {
      // Silent OK so we don't help an attacker probe valid ids.
      return new Response(JSON.stringify({ success: true }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    // Sanity-cap on numeric inputs so a malicious beacon can't poison the
    // dashboard with absurd values.
    const clamp = (n: unknown, max: number): number => {
      const v = Number(n);
      if (!Number.isFinite(v) || v < 0) return 0;
      return Math.min(v, max);
    };
    const safeTime = clamp(totalTimeSeconds, 24 * 60 * 60);  // 24 h cap
    const safeEngagement = clamp(engagementScore, 100);
    const safePages = Math.floor(clamp(pagesViewed, 10_000));

    // Update the viewer activity record
    const { error } = await supabaseClient
      .from("viewer_activity")
      .update({
        total_time_seconds: safeTime,
        engagement_score: safeEngagement,
        pages_viewed: safePages,
        last_activity_at: new Date().toISOString(),
        closed_at: new Date().toISOString(),
      })
      .eq("id", activityId);

    if (error) {
      console.error("Error updating activity");
      return new Response(
        JSON.stringify({ error: "internal" }),
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
