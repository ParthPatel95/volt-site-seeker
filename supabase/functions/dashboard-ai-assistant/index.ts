import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function buildPowerModelPrompt(data: any): string {
  const { params, tariffOverrides, annual, monthly, breakeven } = data;
  
  return `You are an expert Alberta energy market analyst. Analyze this Power Model cost breakdown for a ${params.contractedCapacityMW} MW facility.

## Model Parameters
- Contracted Capacity: ${params.contractedCapacityMW} MW
- Substation Fraction: ${params.substationFraction}
- 12CP Avoidance Window: ${params.twelveCP_AvoidanceHours} hrs/month
- Hosting Rate: US$${params.hostingRateUSD}/kWh (CA$${(params.hostingRateUSD / params.cadUsdRate).toFixed(4)}/kWh)
- CAD/USD Rate: ${params.cadUsdRate}
- Breakeven Pool Price: CA$${breakeven.toFixed(2)}/MWh

${tariffOverrides && Object.keys(tariffOverrides).some(k => (tariffOverrides as any)[k] !== undefined) ? `## Custom Tariff Overrides Applied\n${JSON.stringify(tariffOverrides, null, 2)}` : '## Using Default Tariff Rates (AUC Decision 29606-D01-2024)'}

## Annual Summary
- Total Hours: ${annual.totalHours} | Running Hours: ${annual.totalRunningHours} (${annual.avgUptimePercent.toFixed(1)}% uptime)
- Total MWh: ${annual.totalMWh.toLocaleString()}
- DTS Charges: CA$${annual.totalDTSCharges.toLocaleString(undefined, {maximumFractionDigits: 0})}
- Energy Charges: CA$${annual.totalEnergyCharges.toLocaleString(undefined, {maximumFractionDigits: 0})}
- Fortis Charges: CA$${annual.totalFortisCharges.toLocaleString(undefined, {maximumFractionDigits: 0})}
- Total (incl GST): CA$${annual.totalAmountDue.toLocaleString(undefined, {maximumFractionDigits: 0})}
- All-in Rate: CA$${(annual.avgPerKwhCAD * 100).toFixed(3)}¢/kWh (US$${(annual.avgPerKwhUSD * 100).toFixed(3)}¢/kWh)
- Avg Pool Price (running hours): CA$${annual.avgPoolPriceRunning.toFixed(2)}/MWh

## Monthly Breakdown
${monthly.map((m: any) => `${m.month}: ${m.runningHours}h running (${m.uptimePercent.toFixed(1)}%), CA$${m.totalAmountDue.toLocaleString(undefined, {maximumFractionDigits: 0})}, ${(m.perKwhCAD * 100).toFixed(2)}¢/kWh, Pool $${m.avgPoolPriceRunning.toFixed(2)}/MWh`).join('\n')}

Please provide a structured analysis with these sections:

## Cost Summary
Plain-language explanation of where the money is going — DTS vs Energy vs Distribution charges.

## Top 3 Optimization Opportunities
Specific, actionable recommendations with estimated dollar impact based on the numbers above. Consider: 12CP avoidance window changes, capacity adjustments, exchange rate hedging, pool price timing.

## Risk Factors
Key risks: pool price volatility, exchange rate movements, demand pattern shifts, tariff changes.

## Rate Comparison
How this all-in rate compares to typical Alberta industrial electricity rates (Rate 11, Rate 63, Rate 65 benchmarks).

Keep the response concise, data-driven, and grounded in the actual numbers provided. Do not fabricate any figures.`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    // Power Model Analysis branch
    if (body.action === 'power-model-analysis') {
      const { powerModelData } = body;
      if (!powerModelData?.annual) {
        return new Response(
          JSON.stringify({ error: "No annual data provided" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const systemPrompt = buildPowerModelPrompt(powerModelData);

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: "Analyze the power model cost breakdown and provide optimization recommendations." },
          ],
          temperature: 0.5,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("AI error:", response.status, errorText);
        if (response.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        if (response.status === 402) {
          return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
            { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        throw new Error(`AI API error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0]?.message?.content;
      if (!aiResponse) throw new Error("No response from AI");

      return new Response(JSON.stringify({ response: aiResponse }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Original dashboard assistant logic
    const { query, dashboardContext, conversationHistory = [] } = body;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

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
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content;
    if (!aiResponse) throw new Error("No response from AI");

    return new Response(JSON.stringify({ response: aiResponse }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error) {
    console.error("Error in dashboard-ai-assistant:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
