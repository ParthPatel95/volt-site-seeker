import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, market, modelType, forecastHorizon = 24 } = await req.json();

    console.log('Predictive analytics request:', { action, market, modelType });

    switch (action) {
      case 'energy_price_forecast': {
        // Get recent energy rate data to build predictions
        const { data: recentRates } = await supabase
          .from('energy_rates')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(100);

        // Generate ML-inspired predictions (simplified for demo)
        const predictions = generateEnergyPriceForecast(recentRates || [], forecastHorizon);
        
        // Store predictions in database
        const { data: savedModel } = await supabase
          .from('predictive_models')
          .insert({
            model_type: 'energy_price',
            market: market || 'ERCOT',
            predictions: predictions,
            confidence_score: 0.85,
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          })
          .select()
          .single();

        return new Response(JSON.stringify({
          success: true,
          predictions,
          modelId: savedModel?.id,
          confidence: 0.85
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'demand_forecast': {
        // Generate demand forecasting predictions
        const predictions = generateDemandForecast(market, forecastHorizon);
        
        const { data: savedModel } = await supabase
          .from('predictive_models')
          .insert({
            model_type: 'demand_forecast',
            market: market || 'ERCOT',
            predictions: predictions,
            confidence_score: 0.78,
            expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
          })
          .select()
          .single();

        return new Response(JSON.stringify({
          success: true,
          predictions,
          modelId: savedModel?.id,
          confidence: 0.78
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'arbitrage_detection': {
        // Detect arbitrage opportunities between markets
        const opportunities = await detectArbitrageOpportunities(supabase);
        
        return new Response(JSON.stringify({
          success: true,
          opportunities
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'get_models': {
        // Retrieve stored predictive models
        const { data: models } = await supabase
          .from('predictive_models')
          .select('*')
          .gte('expires_at', new Date().toISOString())
          .order('created_at', { ascending: false });

        return new Response(JSON.stringify({
          success: true,
          models: models || []
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      default:
        return new Response(JSON.stringify({
          error: 'Invalid action'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
  } catch (error) {
    console.error('Error in predictive analytics:', error);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

function generateEnergyPriceForecast(historicalData: any[], hours: number) {
  const predictions = [];
  const basePrice = historicalData[0]?.price_per_mwh || 50;
  
  for (let i = 0; i < hours; i++) {
    const hourOfDay = (new Date().getHours() + i) % 24;
    const dayOfWeek = Math.floor(i / 24) % 7;
    
    // Peak hour multiplier (simplified pattern)
    const peakMultiplier = (hourOfDay >= 16 && hourOfDay <= 20) ? 1.4 : 
                          (hourOfDay >= 8 && hourOfDay <= 16) ? 1.2 : 0.8;
    
    // Weekend discount
    const weekendMultiplier = (dayOfWeek === 0 || dayOfWeek === 6) ? 0.85 : 1.0;
    
    // Random volatility
    const volatility = 0.15 * (Math.random() - 0.5);
    
    const predictedPrice = basePrice * peakMultiplier * weekendMultiplier * (1 + volatility);
    
    predictions.push({
      timestamp: new Date(Date.now() + i * 60 * 60 * 1000).toISOString(),
      predicted_price: Math.round(predictedPrice * 100) / 100,
      confidence: 0.85 - (i * 0.01), // Confidence decreases over time
      factors: {
        peak_hour: hourOfDay >= 16 && hourOfDay <= 20,
        weekend: dayOfWeek === 0 || dayOfWeek === 6,
        base_price: basePrice
      }
    });
  }
  
  return predictions;
}

function generateDemandForecast(market: string, hours: number) {
  const predictions = [];
  const baseDemand = market === 'ERCOT' ? 45000 : 12000; // MW
  
  for (let i = 0; i < hours; i++) {
    const hourOfDay = (new Date().getHours() + i) % 24;
    const dayOfWeek = Math.floor(i / 24) % 7;
    
    // Daily demand pattern
    const hourlyMultiplier = getDemandMultiplierByHour(hourOfDay);
    
    // Weekend pattern
    const weekendMultiplier = (dayOfWeek === 0 || dayOfWeek === 6) ? 0.9 : 1.0;
    
    // Seasonal factors (simplified)
    const seasonalMultiplier = 1.0 + 0.1 * Math.sin((Date.now() + i * 60 * 60 * 1000) / (365 * 24 * 60 * 60 * 1000) * 2 * Math.PI);
    
    const predictedDemand = baseDemand * hourlyMultiplier * weekendMultiplier * seasonalMultiplier;
    
    predictions.push({
      timestamp: new Date(Date.now() + i * 60 * 60 * 1000).toISOString(),
      predicted_demand_mw: Math.round(predictedDemand),
      confidence: 0.78 - (i * 0.008),
      factors: {
        hour_of_day: hourOfDay,
        weekend: dayOfWeek === 0 || dayOfWeek === 6,
        seasonal_factor: seasonalMultiplier
      }
    });
  }
  
  return predictions;
}

function getDemandMultiplierByHour(hour: number): number {
  // Typical daily demand curve
  const demandCurve = [
    0.7, 0.65, 0.6, 0.6, 0.65, 0.75, 0.85, 0.95, // 00-07
    1.0, 1.05, 1.1, 1.15, 1.2, 1.2, 1.15, 1.1,   // 08-15
    1.25, 1.3, 1.35, 1.25, 1.15, 1.0, 0.9, 0.8    // 16-23
  ];
  return demandCurve[hour] || 1.0;
}

async function detectArbitrageOpportunities(supabase: any) {
  // Get latest energy rates from different markets
  const { data: ercotRates } = await supabase
    .from('energy_rates')
    .select('*')
    .eq('market_id', 'ERCOT')
    .order('timestamp', { ascending: false })
    .limit(10);

  const { data: aesoRates } = await supabase
    .from('energy_rates')
    .select('*')
    .eq('market_id', 'AESO')
    .order('timestamp', { ascending: false })
    .limit(10);

  const opportunities = [];

  if (ercotRates && aesoRates && ercotRates.length > 0 && aesoRates.length > 0) {
    const ercotPrice = ercotRates[0].price_per_mwh;
    const aesoPrice = aesoRates[0].price_per_mwh;
    const spread = Math.abs(ercotPrice - aesoPrice);
    
    if (spread > 15) { // Threshold for profitable arbitrage
      const opportunity = {
        market_from: ercotPrice > aesoPrice ? 'AESO' : 'ERCOT',
        market_to: ercotPrice > aesoPrice ? 'ERCOT' : 'AESO',
        price_spread: spread,
        profit_potential: spread * 0.8, // After transaction costs
        risk_adjusted_return: spread * 0.6,
        execution_window_start: new Date().toISOString(),
        execution_window_end: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString()
      };

      // Save opportunity to database
      await supabase
        .from('arbitrage_opportunities')
        .insert(opportunity);

      opportunities.push(opportunity);
    }
  }

  return opportunities;
}