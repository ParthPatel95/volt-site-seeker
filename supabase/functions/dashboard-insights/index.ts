import { serve } from "../_shared/imports.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { dashboardId, market, timeRange } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch dashboard data
    const { data: dashboard } = await supabase
      .from("aeso_custom_dashboards")
      .select("*, aeso_dashboard_widgets(*)")
      .eq("id", dashboardId)
      .single();

    if (!dashboard) {
      throw new Error("Dashboard not found");
    }

    // Fetch recent market data based on market type
    let marketData = null;
    
    if (market === "aeso") {
      const { data: aesoData } = await supabase
        .from("aeso_training_data")
        .select("pool_price, ail_mw, generation_wind, generation_solar, timestamp")
        .order("timestamp", { ascending: false })
        .limit(24);
      marketData = aesoData;
    }

    // Build comprehensive context for AI
    const contextPrompt = `Analyze this energy market dashboard and provide executive insights.

Dashboard: ${dashboard.dashboard_name}
Market: ${market.toUpperCase()}
Time Range: ${timeRange}

Recent Market Data Summary:
${marketData ? `
- Average Price: ${(marketData.reduce((sum: number, d: any) => sum + (d.pool_price || 0), 0) / marketData.length).toFixed(2)} $/MWh
- Current Demand: ${marketData[0]?.ail_mw || 'N/A'} MW
- Renewable Generation: ${((marketData[0]?.generation_wind || 0) + (marketData[0]?.generation_solar || 0)).toFixed(0)} MW
` : 'Limited data available'}

Widgets on Dashboard:
${dashboard.aeso_dashboard_widgets.map((w: any, i: number) => 
  `${i + 1}. ${w.widget_config?.title || w.widget_type}: ${w.data_source}`
).join('\n')}

Provide:
1. **Executive Summary** (2-3 sentences): Key market condition and what it means
2. **Key Insights** (3-4 bullet points): Important trends and patterns
3. **Trading Opportunities** (2-3 items): Actionable recommendations with timeframes
4. **Risk Alerts** (1-2 items): Potential concerns to watch

Be specific with numbers and focus on actionable intelligence.`;

    console.log("Generating automated insights for dashboard:", dashboardId);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { 
            role: "system", 
            content: "You are an expert energy market analyst providing executive-level insights." 
          },
          { role: "user", content: contextPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Lovable AI error:", response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const insights = data.choices[0]?.message?.content;

    if (!insights) {
      throw new Error("No insights generated");
    }

    console.log("Insights generated successfully");

    return new Response(
      JSON.stringify({ insights }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in dashboard-insights:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
