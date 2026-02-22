import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function buildPowerModelPrompt(data: any): string {
  const { params, tariffOverrides, annual, monthly, breakeven } = data;
  
  // Compute avg pool price across months for context
  const avgPoolPrice = monthly.length > 0
    ? (monthly.reduce((s: number, m: any) => s + (m.avgPoolPriceRunning || 0), 0) / monthly.length).toFixed(2)
    : 'N/A';
  
  // Identify highest/lowest cost months
  const sortedByRate = [...monthly].sort((a: any, b: any) => b.perKwhCAD - a.perKwhCAD);
  const highCostMonth = sortedByRate[0]?.month || 'N/A';
  const lowCostMonth = sortedByRate[sortedByRate.length - 1]?.month || 'N/A';

  // Summer vs winter split
  const summerMonths = monthly.filter((m: any) => ['June','July','August','September'].includes(m.month));
  const winterMonths = monthly.filter((m: any) => ['December','January','February','March'].includes(m.month));
  const avgSummerRate = summerMonths.length > 0 ? (summerMonths.reduce((s: number, m: any) => s + m.perKwhCAD, 0) / summerMonths.length * 100).toFixed(2) : 'N/A';
  const avgWinterRate = winterMonths.length > 0 ? (winterMonths.reduce((s: number, m: any) => s + m.perKwhCAD, 0) / winterMonths.length * 100).toFixed(2) : 'N/A';

  return `You are an expert Alberta energy market analyst specializing in AESO Rate DTS tariff optimization. Analyze this Power Model cost breakdown for a ${params.contractedCapacityMW} MW facility connected at ${params.podName || 'an Alberta POD'} via ${params.dfo || 'FortisAlberta'}.

## Model Parameters
- Contracted Capacity: ${params.contractedCapacityMW} MW
- Substation Fraction: ${params.substationFraction}
- 12CP Avoidance Window: ${params.twelveCP_AvoidanceHours} hrs/month
- Hosting Rate: US$${params.hostingRateUSD}/kWh (CA$${(params.hostingRateUSD / params.cadUsdRate).toFixed(4)}/kWh)
- CAD/USD Rate: ${params.cadUsdRate}
- Breakeven Pool Price: CA$${breakeven.toFixed(2)}/MWh
- Target Uptime: ${params.targetUptimePercent || 95}%

${tariffOverrides && Object.keys(tariffOverrides).some(k => (tariffOverrides as any)[k] !== undefined) ? `## Custom Tariff Overrides Applied\n${JSON.stringify(tariffOverrides, null, 2)}` : '## Using Default Tariff Rates (AUC Decision 30427-D01-2025, effective Jan 2026)'}

## Annual Summary
- Total Hours: ${annual.totalHours} | Running Hours: ${annual.totalRunningHours} (${annual.avgUptimePercent.toFixed(1)}% uptime)
- Total MWh: ${annual.totalMWh.toLocaleString()}
- DTS Charges: CA$${annual.totalDTSCharges.toLocaleString(undefined, {maximumFractionDigits: 0})} (${(annual.totalDTSCharges / annual.totalAmountDue * 100).toFixed(1)}% of total)
- Energy Charges: CA$${annual.totalEnergyCharges.toLocaleString(undefined, {maximumFractionDigits: 0})} (${(annual.totalEnergyCharges / annual.totalAmountDue * 100).toFixed(1)}% of total)
- Fortis Charges: CA$${annual.totalFortisCharges.toLocaleString(undefined, {maximumFractionDigits: 0})} (${(annual.totalFortisCharges / annual.totalAmountDue * 100).toFixed(1)}% of total)
- GST: CA$${annual.totalGST?.toLocaleString(undefined, {maximumFractionDigits: 0}) || 'N/A'}
- Total (incl GST): CA$${annual.totalAmountDue.toLocaleString(undefined, {maximumFractionDigits: 0})}
- All-in Rate: CA$${(annual.avgPerKwhCAD * 100).toFixed(3)}¢/kWh (US$${(annual.avgPerKwhUSD * 100).toFixed(3)}¢/kWh)
- Avg Pool Price (running hours): CA$${annual.avgPoolPriceRunning.toFixed(2)}/MWh
- 12CP Curtailment Savings: CA$${annual.curtailmentSavings?.toLocaleString(undefined, {maximumFractionDigits: 0}) || '0'}
- Price Curtailment Savings: CA$${annual.totalPriceCurtailmentSavings?.toLocaleString(undefined, {maximumFractionDigits: 0}) || '0'}
${params.fixedPriceCAD > 0 ? `- Fixed Contract Price: CA$${params.fixedPriceCAD}/MWh` : '- Pricing Mode: Floating Pool'}
${params.fixedPriceCAD > 0 && annual.totalOverContractCredits > 0 ? `- Over-Contract Credits: CA$${annual.totalOverContractCredits.toLocaleString(undefined, {maximumFractionDigits: 0})}
- Effective Rate (after credits): CA$${(annual.effectivePerKwhCAD * 100).toFixed(3)}¢/kWh (US$${(annual.effectivePerKwhUSD * 100).toFixed(3)}¢/kWh)` : ''}

## Key DTS Tariff Line Items (annual)
- Bulk System 12CP Demand: CA$${annual.totalBulkCoincidentDemandFull?.toLocaleString(undefined, {maximumFractionDigits: 0}) || 'N/A'} (full charge before avoidance)
- Bulk Metered Energy: CA$${annual.totalBulkMeteredEnergy?.toLocaleString(undefined, {maximumFractionDigits: 0}) || 'N/A'}
- Regional Billing Capacity: CA$${annual.totalRegionalBillingCapacity?.toLocaleString(undefined, {maximumFractionDigits: 0}) || 'N/A'}
- POD Charges: CA$${annual.totalPodCharges?.toLocaleString(undefined, {maximumFractionDigits: 0}) || 'N/A'}
- Operating Reserve (12.5%): CA$${annual.totalOperatingReserve?.toLocaleString(undefined, {maximumFractionDigits: 0}) || 'N/A'}
- Rider F: CA$${annual.totalRiderF?.toLocaleString(undefined, {maximumFractionDigits: 0}) || 'N/A'}

## Seasonal Context
- Avg Pool Price across months: CA$${avgPoolPrice}/MWh
- Highest cost month: ${highCostMonth} | Lowest cost month: ${lowCostMonth}
- Avg summer rate (Jun-Sep): ${avgSummerRate}¢/kWh | Avg winter rate (Dec-Mar): ${avgWinterRate}¢/kWh

## Monthly Breakdown
${monthly.map((m: any) => `${m.month}: ${m.runningHours}h running (${m.uptimePercent.toFixed(1)}%), CA$${m.totalAmountDue.toLocaleString(undefined, {maximumFractionDigits: 0})}, ${(m.perKwhCAD * 100).toFixed(2)}¢/kWh, Pool $${m.avgPoolPriceRunning.toFixed(2)}/MWh, Curtailed ${m.curtailedHours || 0}h${params.fixedPriceCAD > 0 && m.overContractCredits > 0 ? `, OC Credits CA$${m.overContractCredits.toLocaleString(undefined, {maximumFractionDigits: 0})}` : ''}`).join('\n')}

Provide a structured analysis with these EXACT section headings:

## Executive Summary
2-3 sentences summarizing overall cost position, profitability, and the single most impactful finding. Reference specific numbers.

## Cost Drivers & Tariff Analysis
- Break down exactly which AESO Rate DTS line items are the largest cost contributors
- Quantify the Bulk 12CP demand charge impact and how 12CP avoidance is performing
- Explain the Operating Reserve (12.5% of pool price) impact on total cost
- Note the seasonal cost pattern between summer and winter with specific rate differences
${params.fixedPriceCAD > 0 && annual.totalOverContractCredits > 0 ? `- Analyze over-contract credits: quantify how much the effective rate drops from the all-in rate due to credits earned when pool price exceeds the fixed contract price` : ''}

## Top 3 Optimization Opportunities
For each, provide: (1) what to do, (2) estimated annual dollar savings, (3) implementation complexity.
Consider: 12CP avoidance window tuning, capacity factor optimization, curtailment threshold adjustment, Rider F impact, exchange rate hedging.
${params.fixedPriceCAD > 0 ? `Also consider: strategies to maximize over-contract credit earnings by optimizing which hours to run vs. curtail relative to the fixed contract price.` : ''}

## Risk Factors
Quantify each risk where possible: pool price volatility impact on margin, exchange rate sensitivity (1¢ CAD/USD = $X impact), demand charge exposure if 12CP avoidance fails.

## Benchmark Comparison
Compare the all-in rate against these Alberta industrial benchmarks:
- **FortisAlberta Rate 11** (residential): ~6.0¢/kWh all-in — not directly comparable but useful floor reference
- **FortisAlberta Rate 63** (distribution-connected industrial): ~8.0¢/kWh all-in including demand charges
- **FortisAlberta Rate 65** (transmission-connected): ~9.0¢/kWh all-in with full DTS pass-through
- State whether this facility's rate is above or below each benchmark and explain why (e.g., pool price conditions, 12CP optimization effectiveness)

Keep the response concise, data-driven, and grounded in the actual numbers. Do not fabricate figures. Reference specific tariff line items by their AESO names.`;
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
            { role: "user", content: "Analyze the power model cost breakdown and provide optimization recommendations. Be specific about tariff line items and seasonal patterns." },
          ],
          temperature: 0.5,
          max_tokens: 2500,
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
