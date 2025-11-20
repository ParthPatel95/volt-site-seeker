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
    const { query, dashboardContext, conversationHistory = [] } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Build context from dashboard data
    let contextPrompt = `You are an expert energy market analyst assistant. You have access to real-time energy market data.`;
    
    if (dashboardContext) {
      contextPrompt += `\n\nCurrent Dashboard Context:\n`;
      contextPrompt += `- Dashboard: ${dashboardContext.dashboardName}\n`;
      contextPrompt += `- Market: ${dashboardContext.market?.toUpperCase()}\n`;
      contextPrompt += `- Time Range: ${dashboardContext.timeRange}\n`;
      
      if (dashboardContext.widgets && dashboardContext.widgets.length > 0) {
        contextPrompt += `\nAvailable Data Widgets:\n`;
        dashboardContext.widgets.forEach((widget: any, idx: number) => {
          contextPrompt += `${idx + 1}. ${widget.title || widget.widget_type}: ${widget.data_source}\n`;
        });
      }
    }

    contextPrompt += `\n\nYour role:
- Analyze energy market trends and patterns
- Provide actionable insights for trading decisions
- Explain price movements and market conditions
- Identify opportunities and risks
- Answer questions about the data in a clear, concise way
- Use specific numbers and percentages when available`;

    const messages = [
      { role: "system", content: contextPrompt },
      ...conversationHistory,
      { role: "user", content: query }
    ];

    console.log("Sending request to Lovable AI with context:", { 
      dashboardName: dashboardContext?.dashboardName,
      market: dashboardContext?.market,
      widgetCount: dashboardContext?.widgets?.length 
    });

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Lovable AI error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ 
            error: "Rate limit exceeded. Please try again in a moment." 
          }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ 
            error: "AI credits exhausted. Please add credits to continue." 
          }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content;

    if (!aiResponse) {
      throw new Error("No response from AI");
    }

    console.log("AI response generated successfully");

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in dashboard-ai-assistant:", error);
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
