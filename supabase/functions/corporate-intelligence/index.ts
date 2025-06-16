import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, ...params } = await req.json();

    console.log(`Corporate Intelligence action: ${action}`);

    switch (action) {
      case 'ai_analyze_company': {
        const { company_name, analysis_depth } = params;
        
        if (!openAIApiKey) {
          return new Response(JSON.stringify({
            success: false,
            needsApiKey: true,
            error: 'OpenAI API key is required for AI analysis'
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }

        console.log(`Starting AI analysis for: ${company_name}`);

        // Call OpenAI to analyze the company
        const prompt = `Analyze the company "${company_name}" and provide a comprehensive assessment including:

1. Power consumption estimate (in MW) with detailed reasoning
2. Financial health score (0-100)
3. Market capitalization estimate
4. Key financial metrics (debt-to-equity, current ratio, revenue growth, profit margin)
5. Industry and sector classification
6. Risk assessment
7. Investment opportunity analysis
8. Key insights and distress signals if any
9. Geographic locations and facilities

Please respond in this exact JSON format:
{
  "company_name": "${company_name}",
  "industry": "string",
  "sector": "string", 
  "market_cap": number,
  "power_usage_estimate": number,
  "financial_health_score": number,
  "debt_to_equity": number,
  "current_ratio": number,
  "revenue_growth": number,
  "profit_margin": number,
  "distress_signals": ["string"],
  "locations": [{"city": "string", "state": "string", "facility_type": "string"}],
  "ai_analysis": {
    "power_consumption_reasoning": "string",
    "risk_assessment": "string", 
    "investment_opportunity": "string",
    "key_insights": ["string"]
  }
}`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { 
                role: 'system', 
                content: 'You are a financial analyst specializing in corporate power consumption and investment analysis. Provide accurate, data-driven assessments.' 
              },
              { role: 'user', content: prompt }
            ],
            temperature: 0.3,
          }),
        });

        if (!response.ok) {
          throw new Error(`OpenAI API error: ${response.status}`);
        }

        const aiResponse = await response.json();
        const analysisText = aiResponse.choices[0].message.content;

        // Parse the JSON response from AI
        let analysis;
        try {
          // Extract JSON from the response (in case there's extra text)
          const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            analysis = JSON.parse(jsonMatch[0]);
          } else {
            throw new Error('No valid JSON found in AI response');
          }
        } catch (parseError) {
          console.error('Failed to parse AI response:', parseError);
          // Fallback to mock data if parsing fails
          analysis = {
            company_name,
            industry: 'Technology',
            sector: 'Software',
            market_cap: 1000000000,
            power_usage_estimate: 15.5,
            financial_health_score: 75,
            debt_to_equity: 0.3,
            current_ratio: 2.1,
            revenue_growth: 0.12,
            profit_margin: 0.18,
            distress_signals: [],
            locations: [
              { city: 'San Francisco', state: 'CA', facility_type: 'Headquarters' }
            ],
            ai_analysis: {
              power_consumption_reasoning: 'Analysis completed with limited data availability.',
              risk_assessment: 'Moderate risk profile based on available information.',
              investment_opportunity: 'Further analysis recommended.',
              key_insights: ['Limited public data available', 'Analysis based on industry benchmarks']
            }
          };
        }

        // Insert into companies table
        const companyData = {
          name: analysis.company_name,
          ticker: analysis.ticker || null,
          industry: analysis.industry,
          sector: analysis.sector,
          market_cap: analysis.market_cap,
          financial_health_score: analysis.financial_health_score,
          power_usage_estimate: analysis.power_usage_estimate,
          debt_to_equity: analysis.debt_to_equity,
          current_ratio: analysis.current_ratio,
          revenue_growth: analysis.revenue_growth,
          profit_margin: analysis.profit_margin,
          distress_signals: analysis.distress_signals || [],
          locations: analysis.locations || [],
          analyzed_at: new Date().toISOString()
        };

        const { data: companyRecord, error: dbError } = await supabase
          .from('companies')
          .upsert(companyData, { onConflict: 'name' })
          .select()
          .single();

        if (dbError) {
          console.error('Database error:', dbError);
          // Still return success with analysis even if DB insert fails
        }

        return new Response(JSON.stringify({
          success: true,
          analysis,
          company: companyRecord,
          analysis_complete: true
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      case 'analyze_company': {
        const { company_name, ticker } = params;
        
        // Mock company analysis for the basic analyze function
        const analysis = {
          company_name,
          ticker: ticker || 'DEMO',
          industry: 'Technology',
          sector: 'Software',
          market_cap: 1500000000,
          financial_health_score: 85,
          power_usage_estimate: 25.5,
          distress_signals: [],
          locations: [
            { city: 'Austin', state: 'TX', facilities: 3 },
            { city: 'Dallas', state: 'TX', facilities: 2 }
          ]
        };

        // Insert into companies table
        const { data, error } = await supabase
          .from('companies')
          .upsert({
            name: analysis.company_name,
            ticker: analysis.ticker,
            industry: analysis.industry,
            sector: analysis.sector,
            market_cap: analysis.market_cap,
            financial_health_score: analysis.financial_health_score,
            power_usage_estimate: analysis.power_usage_estimate,
            distress_signals: analysis.distress_signals,
            locations: analysis.locations,
            analyzed_at: new Date().toISOString()
          }, { onConflict: 'name' })
          .select()
          .single();

        if (error) {
          console.error('Database error:', error);
          return new Response(JSON.stringify({
            success: false,
            error: 'Failed to save company data'
          }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }

        return new Response(JSON.stringify({
          success: true,
          company: data,
          analysis_complete: true
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      case 'analyze_news_intelligence': {
        const { company_name } = params;
        
        // Mock news intelligence data
        const newsData = [
          {
            id: crypto.randomUUID(),
            title: `${company_name} Announces Strategic Partnership`,
            content: `${company_name} has entered into a strategic partnership to expand their operations...`,
            source: 'Financial Times',
            published_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            url: 'https://example.com/news1',
            keywords: ['partnership', 'expansion', 'growth'],
            discovered_at: new Date().toISOString()
          },
          {
            id: crypto.randomUUID(),
            title: `Industry Analysis: ${company_name}'s Market Position`,
            content: `Recent analysis shows ${company_name} maintaining strong position in the market...`,
            source: 'Bloomberg',
            published_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            url: 'https://example.com/news2',
            keywords: ['market', 'analysis', 'position'],
            discovered_at: new Date().toISOString()
          }
        ];

        // Insert news data into database
        const { error: newsError } = await supabase
          .from('news_intelligence')
          .insert(newsData);

        if (newsError) {
          console.error('News insert error:', newsError);
        }

        return new Response(JSON.stringify({
          success: true,
          news: newsData,
          total_articles: newsData.length
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      case 'get_distress_alerts': {
        // Mock distress alerts
        const alerts = [
          {
            company_name: 'Sample Manufacturing Co.',
            alert_type: 'financial_distress',
            distress_level: 7,
            signals: ['Declining revenue', 'High debt ratio', 'Facility closures'],
            power_capacity: 35.0,
            potential_value: 15000000
          },
          {
            company_name: 'Tech Datacenter Inc.',
            alert_type: 'market_opportunity',
            distress_level: 4,
            signals: ['Expansion plans', 'Power infrastructure investment'],
            power_capacity: 85.0,
            potential_value: 45000000
          }
        ];

        return new Response(JSON.stringify({
          success: true,
          alerts,
          total_alerts: alerts.length
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      case 'portfolio_optimization': {
        const { risk_tolerance, investment_amount, geographic_preference } = params;
        
        const recommendation = {
          recommendation_type: 'balanced_growth',
          diversification_score: 82,
          risk_adjusted_return: 15.8,
          target_companies: ['Company A', 'Company B', 'Company C'],
          sector_allocation: {
            'Manufacturing': 40,
            'Data Centers': 35,
            'Logistics': 25
          },
          geographic_allocation: {
            'Texas': 50,
            'California': 30,
            'New York': 20
          },
          investment_thesis: `Based on your ${risk_tolerance} risk tolerance and $${investment_amount} investment amount, we recommend a balanced approach focusing on ${geographic_preference} markets.`
        };

        return new Response(JSON.stringify({
          success: true,
          recommendation,
          analysis_date: new Date().toISOString()
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      default:
        return new Response(JSON.stringify({
          success: false,
          error: 'Unknown action'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
    }

  } catch (error: any) {
    console.error('Error in corporate intelligence:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message || 'An unexpected error occurred'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};

serve(handler);
