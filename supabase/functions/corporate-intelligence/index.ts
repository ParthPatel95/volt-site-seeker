
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
          .upsert(analysis)
          .select()
          .single();

        if (error) throw error;

        return new Response(JSON.stringify({
          success: true,
          company: data,
          analysis_complete: true
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
