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
        
        let ratesData;
        
        if (market_code === 'AESO') {
          // Call the AESO data integration function
          try {
            const { data: aesoData, error: aesoError } = await supabase.functions.invoke('aeso-data-integration');
            
            if (aesoError) {
              console.error('AESO function error:', aesoError);
              throw aesoError;
            }

            if (aesoData?.success && aesoData.pricing) {
              ratesData = {
                current_rate: aesoData.pricing.current_price,
                market_code: 'AESO',
                timestamp: new Date().toISOString(),
                forecast: [
                  aesoData.pricing.current_price * 1.02,
                  aesoData.pricing.current_price * 0.98,
                  aesoData.pricing.current_price * 0.95
                ],
                market_conditions: aesoData.pricing.market_conditions || 'normal',
                peak_demand_rate: aesoData.pricing.peak_price || aesoData.pricing.current_price * 1.5,
                load_data: aesoData.loadData,
                generation_mix: aesoData.generationMix
              };
            } else {
              console.warn('AESO API returned no data, using fallback');
              ratesData = {
                current_rate: 78.50,
                market_code: 'AESO',
                timestamp: new Date().toISOString(),
                forecast: [80.15, 77.20, 76.30],
                market_conditions: 'normal',
                peak_demand_rate: 145.20
              };
            }
          } catch (error) {
            console.error('Error calling AESO function:', error);
            // Fallback AESO data
            ratesData = {
              current_rate: 78.50,
              market_code: 'AESO',
              timestamp: new Date().toISOString(),
              forecast: [80.15, 77.20, 76.30],
              market_conditions: 'normal',
              peak_demand_rate: 145.20
            };
          }
        } else {
          // Mock current rates data for other markets
          ratesData = {
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
        }

        // Get the actual market ID from the database instead of using a string
        const { data: marketData } = await supabase
          .from('energy_markets')
          .select('id')
          .eq('market_code', market_code)
          .single();

        if (marketData) {
          // Insert sample rate data with proper UUID
          const { error } = await supabase
            .from('energy_rates')
            .insert({
              market_id: marketData.id,
              rate_type: 'real_time',
              price_per_mwh: ratesData.current_rate,
              timestamp: new Date().toISOString(),
              node_name: `${market_code}_NODE_001`,
              node_id: 'NODE_001'
            });

          if (error) {
            console.error('Error inserting rate data:', error);
          }
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
            id: 'aeso-001',
            market_name: 'AESO',
            market_code: 'AESO',
            region: 'Alberta, Canada',
            timezone: 'America/Edmonton'
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
