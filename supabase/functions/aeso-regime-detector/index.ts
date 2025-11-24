import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Detecting market regimes from historical data...');

    // Fetch recent training data (last 90 days for regime detection)
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
    const { data: trainingData, error: fetchError } = await supabase
      .from('aeso_training_data')
      .select('*')
      .gte('timestamp', ninetyDaysAgo)
      .order('timestamp', { ascending: true });

    if (fetchError) throw fetchError;
    if (!trainingData || trainingData.length === 0) {
      throw new Error('No training data available for regime detection');
    }

    console.log(`Analyzing ${trainingData.length} records for regime detection...`);

    // Detect regimes based on multiple factors
    const regimes = [];
    
    for (let i = 23; i < trainingData.length; i++) { // Need 24 hours of lookback
      const current = trainingData[i];
      const last24h = trainingData.slice(i - 23, i + 1);
      
      // Calculate regime indicators
      const avgPrice = last24h.reduce((sum, r) => sum + r.pool_price, 0) / last24h.length;
      const priceVolatility = calculateStdDev(last24h.map(r => r.pool_price));
      const avgLoad = last24h.reduce((sum, r) => sum + (r.ail_mw || 0), 0) / last24h.length;
      const renewablePercentage = calculateRenewablePercentage(current);
      
      // Determine regime based on market conditions
      let regime = 'normal';
      let confidence = 0.5;
      
      // High price regime (price spike conditions)
      if (avgPrice > 100 || priceVolatility > 50) {
        regime = 'high_price';
        confidence = Math.min(0.95, 0.5 + (avgPrice - 100) / 200 + priceVolatility / 200);
      }
      // Low price regime (oversupply, high renewables)
      else if (avgPrice < 30 && renewablePercentage > 50) {
        regime = 'low_price';
        confidence = Math.min(0.95, 0.5 + (50 - avgPrice) / 100 + renewablePercentage / 200);
      }
      // High demand regime
      else if (avgLoad > 11000) {
        regime = 'high_demand';
        confidence = Math.min(0.95, 0.5 + (avgLoad - 11000) / 2000);
      }
      // Volatile regime (rapid price changes)
      else if (priceVolatility > 30) {
        regime = 'volatile';
        confidence = Math.min(0.95, 0.5 + priceVolatility / 100);
      }
      // Renewable surge regime
      else if (renewablePercentage > 60) {
        regime = 'renewable_surge';
        confidence = Math.min(0.95, 0.5 + (renewablePercentage - 60) / 80);
      }
      
      regimes.push({
        timestamp: current.timestamp,
        regime,
        confidence,
        avg_price_24h: avgPrice,
        price_volatility_24h: priceVolatility,
        avg_load_24h: avgLoad,
        renewable_percentage: renewablePercentage
      });
    }

    console.log(`Detected ${regimes.length} regime classifications`);

    // Insert regimes in batches
    for (let i = 0; i < regimes.length; i += 1000) {
      const batch = regimes.slice(i, i + 1000);
      const { error: insertError } = await supabase
        .from('aeso_market_regimes')
        .upsert(batch, {
          onConflict: 'timestamp',
          ignoreDuplicates: false
        });
      
      if (insertError) {
        console.error('Error inserting regimes:', insertError);
        throw insertError;
      }
    }

    // Calculate regime statistics
    const regimeStats = regimes.reduce((acc, r) => {
      acc[r.regime] = (acc[r.regime] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('Regime distribution:', regimeStats);

    return new Response(
      JSON.stringify({ 
        success: true, 
        regimesDetected: regimes.length,
        regimeDistribution: regimeStats
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in regime detector:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function calculateStdDev(values: number[]): number {
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  return Math.sqrt(variance);
}

function calculateRenewablePercentage(record: any): number {
  const wind = record.generation_wind || 0;
  const solar = record.generation_solar || 0;
  const hydro = record.generation_hydro || 0;
  const total = record.tng_mw || 1;
  
  return ((wind + solar + hydro) / total) * 100;
}
