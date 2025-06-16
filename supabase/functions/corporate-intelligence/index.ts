
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

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, ...params } = await req.json();

    console.log(`Corporate Intelligence action: ${action}`);

    switch (action) {
      case 'analyze_company': {
        const { company_name, ticker } = params;
        
        // Mock company analysis
        const analysisResult = {
          name: company_name,
          ticker: ticker || 'N/A',
          industry: 'Technology',
          sector: 'Information Technology',
          market_cap: Math.floor(Math.random() * 10000000000) + 1000000000,
          financial_health_score: Math.floor(Math.random() * 30) + 70,
          revenue_growth: (Math.random() * 20) + 5,
          profit_margin: (Math.random() * 15) + 5,
          debt_to_equity: Math.random() * 2,
          current_ratio: Math.random() * 3 + 1,
          power_usage_estimate: Math.floor(Math.random() * 100) + 10,
          analyzed_at: new Date().toISOString(),
          locations: [
            { city: 'Austin', state: 'TX', type: 'headquarters' },
            { city: 'Dallas', state: 'TX', type: 'operations' }
          ],
          distress_signals: []
        };

        // Save to database
        const { data, error } = await supabase
          .from('companies')
          .upsert(analysisResult, { onConflict: 'name,ticker' })
          .select()
          .single();

        if (error) {
          console.error('Error saving company:', error);
          return new Response(JSON.stringify({
            success: false,
            error: error.message
          }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }

        return new Response(JSON.stringify({
          success: true,
          company: data
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      case 'ai_analyze_company': {
        const { company_name } = params;
        
        const mockAnalysis = {
          financial_outlook: 'Positive growth trajectory with strong fundamentals',
          risk_assessment: 'Low to moderate risk profile',
          investment_recommendation: 'BUY',
          power_consumption_analysis: 'High energy intensity operations suitable for data center conversion',
          key_insights: [
            'Strong cash flow generation',
            'Expanding market presence',
            'Energy-intensive operations'
          ],
          distress_probability: Math.random() * 0.3,
          acquisition_readiness: Math.random() * 0.8 + 0.2
        };

        return new Response(JSON.stringify({
          success: true,
          analysis: mockAnalysis
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      case 'generate_due_diligence': {
        const { company_id } = params;
        
        const mockReport = {
          company_id,
          report_type: 'comprehensive',
          executive_summary: 'Strong acquisition candidate with excellent power infrastructure potential',
          financial_analysis: {
            revenue_trend: 'Growing',
            profitability: 'High',
            debt_levels: 'Manageable'
          },
          risk_assessment: {
            market_risk: 'Low',
            operational_risk: 'Medium',
            financial_risk: 'Low'
          },
          power_infrastructure_assessment: {
            current_consumption: '45 MW',
            expansion_potential: '200 MW',
            grid_connectivity: 'Excellent'
          },
          recommendations: [
            'Proceed with acquisition',
            'Negotiate power infrastructure rights',
            'Plan for data center conversion'
          ]
        };

        const { data, error } = await supabase
          .from('due_diligence_reports')
          .insert(mockReport)
          .select()
          .single();

        if (error) {
          console.error('Error saving due diligence report:', error);
        }

        return new Response(JSON.stringify({
          success: true,
          report: mockReport
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      case 'get_market_timing': {
        const { company_id } = params;
        
        const mockTiming = {
          company_id,
          market_cycle_phase: 'Mid-Cycle',
          fire_sale_probability: Math.random() * 0.4,
          market_conditions_score: Math.floor(Math.random() * 30) + 70,
          timing_recommendation: 'Optimal acquisition window',
          institutional_activity_level: 'Normal',
          optimal_acquisition_window: {
            start: '2024-Q1',
            end: '2024-Q3'
          }
        };

        return new Response(JSON.stringify({
          success: true,
          timing: mockTiming
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      case 'analyze_supply_chain': {
        const { company_id } = params;
        
        const mockSupplyChain = {
          company_id,
          critical_components: ['Semiconductors', 'Raw materials'],
          supplier_dependencies: ['Asia-Pacific suppliers', 'Single-source suppliers'],
          disruption_risks: {
            geographic_concentration: 'High',
            single_points_of_failure: 'Medium'
          },
          geographic_exposure: {
            'Asia-Pacific': 0.78,
            'Europe': 0.15,
            'North America': 0.07
          }
        };

        return new Response(JSON.stringify({
          success: true,
          analysis: mockSupplyChain
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      case 'get_news_intelligence': {
        const mockNews = [
          {
            title: 'Company Expands Data Center Operations',
            content: 'Major expansion announced for Q4 operations',
            source: 'TechNews',
            published_at: new Date().toISOString(),
            keywords: ['expansion', 'data center', 'growth']
          },
          {
            title: 'Energy Efficiency Initiative Launched',
            content: 'New sustainability program focuses on power optimization',
            source: 'EnergyReport',
            published_at: new Date().toISOString(),
            keywords: ['energy', 'efficiency', 'sustainability']
          }
        ];

        return new Response(JSON.stringify({
          success: true,
          news: mockNews
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      case 'get_competitor_analysis': {
        const mockCompetitors = [
          {
            name: 'TechCorp Inc',
            market_share: 0.15,
            power_usage: 85,
            competitive_position: 'Strong'
          },
          {
            name: 'DataSystems LLC',
            market_share: 0.12,
            power_usage: 65,
            competitive_position: 'Moderate'
          }
        ];

        return new Response(JSON.stringify({
          success: true,
          competitors: mockCompetitors
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      case 'get_social_sentiment': {
        const mockSentiment = {
          overall_score: Math.floor(Math.random() * 40) + 60,
          sentiment_trend: 'Positive',
          key_topics: ['innovation', 'growth', 'sustainability'],
          platform_breakdown: {
            twitter: 0.72,
            linkedin: 0.85,
            reddit: 0.58
          }
        };

        return new Response(JSON.stringify({
          success: true,
          sentiment: mockSentiment
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      case 'calculate_investment_score': {
        const mockScore = {
          overall_score: Math.floor(Math.random() * 30) + 70,
          risk_score: Math.floor(Math.random() * 20) + 60,
          opportunity_score: Math.floor(Math.random() * 25) + 75,
          timing_score: Math.floor(Math.random() * 20) + 70,
          confidence_level: Math.floor(Math.random() * 20) + 80,
          recommendation: 'BUY',
          key_factors: ['Strong financials', 'Power infrastructure potential', 'Market position'],
          risk_factors: ['Market volatility', 'Regulatory changes']
        };

        return new Response(JSON.stringify({
          success: true,
          score: mockScore
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      case 'forecast_power_demand': {
        const mockForecast = {
          current_consumption: Math.floor(Math.random() * 100) + 50,
          projected_6_months: Math.floor(Math.random() * 120) + 60,
          projected_12_months: Math.floor(Math.random() * 150) + 80,
          growth_drivers: ['Expansion plans', 'New facilities', 'Technology upgrades'],
          confidence_score: Math.floor(Math.random() * 20) + 80
        };

        return new Response(JSON.stringify({
          success: true,
          forecast: mockForecast
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      case 'analyze_esg': {
        const mockESG = {
          environmental_score: Math.floor(Math.random() * 30) + 70,
          social_score: Math.floor(Math.random() * 25) + 65,
          governance_score: Math.floor(Math.random() * 20) + 75,
          overall_esg_score: Math.floor(Math.random() * 25) + 70,
          carbon_footprint_mt: Math.floor(Math.random() * 10000) + 5000,
          renewable_energy_percent: Math.random() * 60 + 20
        };

        return new Response(JSON.stringify({
          success: true,
          esg: mockESG
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      case 'optimize_portfolio': {
        const mockOptimization = {
          recommended_allocation: {
            'Technology': 0.4,
            'Manufacturing': 0.3,
            'Energy': 0.2,
            'Other': 0.1
          },
          diversification_score: Math.floor(Math.random() * 20) + 80,
          risk_adjusted_return: Math.random() * 0.15 + 0.08,
          recommendations: [
            'Increase technology sector allocation',
            'Diversify geographic exposure',
            'Focus on power-intensive industries'
          ]
        };

        return new Response(JSON.stringify({
          success: true,
          optimization: mockOptimization
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      case 'natural_language_query': {
        const { query } = params;
        
        const mockResponse = {
          query,
          answer: `Based on our analysis, here are the key insights: The market shows strong potential for power-intensive acquisitions with favorable timing conditions. Current energy rates support profitable operations.`,
          confidence: Math.random() * 0.3 + 0.7,
          sources: ['Market analysis', 'Energy rate data', 'Company financials']
        };

        return new Response(JSON.stringify({
          success: true,
          response: mockResponse
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
