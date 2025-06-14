
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

    console.log(`Energy Rate Intelligence action: ${action}`);

    switch (action) {
      case 'fetch_current_rates': {
        const { market_code } = params;
        
        // Mock current rates data
        const ratesData = {
          current_rate: 45.50 + Math.random() * 10, // $45.50-55.50/MWh
          market_code,
          timestamp: new Date().toISOString(),
          forecast: [
            46.20 + Math.random() * 5,
            44.80 + Math.random() * 5,
            43.90 + Math.random() * 5
          ],
          market_conditions: 'normal',
          peak_demand_rate: 65.30 + Math.random() * 15
        };

        // Insert sample rate data
        const { error } = await supabase
          .from('energy_rates')
          .insert({
            market_id: 'ercot-demo',
            rate_type: 'real_time',
            price_per_mwh: ratesData.current_rate,
            timestamp: new Date().toISOString(),
            node_name: `${market_code}_NODE_001`,
            node_id: 'DEMO_001'
          });

        if (error) {
          console.error('Error inserting rate data:', error);
        }

        return new Response(JSON.stringify({
          success: true,
          rates: ratesData
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      case 'calculate_energy_costs': {
        const { monthly_consumption_mwh, peak_demand_mw, location } = params;
        
        // Mock cost calculation
        const baseRate = 45.0; // $/MWh
        const demandCharge = 15.0; // $/kW
        
        const energyCost = monthly_consumption_mwh * baseRate;
        const demandCost = peak_demand_mw * 1000 * demandCharge; // Convert MW to kW
        const totalCost = energyCost + demandCost;

        const calculation = {
          monthly_cost: totalCost,
          breakdown: {
            energy_cost: energyCost,
            demand_charge: demandCost,
            transmission_fees: totalCost * 0.1,
            taxes_and_fees: totalCost * 0.08
          },
          rate_schedule: 'Commercial Industrial',
          location: location,
          calculation_date: new Date().toISOString()
        };

        return new Response(JSON.stringify({
          success: true,
          cost_calculation: calculation
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      case 'get_market_data': {
        // Mock market data
        const markets = [
          {
            id: 'ercot-001',
            market_name: 'ERCOT',
            market_code: 'ERCOT',
            region: 'Texas',
            timezone: 'America/Chicago'
          },
          {
            id: 'pjm-001',
            market_name: 'PJM',
            market_code: 'PJM',
            region: 'Mid-Atlantic',
            timezone: 'America/New_York'
          },
          {
            id: 'caiso-001',
            market_name: 'CAISO',
            market_code: 'CAISO',
            region: 'California',
            timezone: 'America/Los_Angeles'
          }
        ];

        return new Response(JSON.stringify({
          success: true,
          markets
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
    console.error('Error in energy rate intelligence:', error);
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
