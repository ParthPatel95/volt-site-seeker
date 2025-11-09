import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Calculating enhanced features from training data...');

    // Fetch all training data ordered by timestamp
    const { data: trainingData, error: fetchError } = await supabase
      .from('aeso_training_data')
      .select('*')
      .order('timestamp', { ascending: true });

    if (fetchError) throw fetchError;
    if (!trainingData || trainingData.length === 0) {
      throw new Error('No training data available');
    }

    console.log(`Processing ${trainingData.length} records...`);

    const enhancedFeatures = [];

    for (let i = 0; i < trainingData.length; i++) {
      const current = trainingData[i];
      const currentTime = new Date(current.timestamp);

      // Calculate price volatility (standard deviation over rolling windows)
      const priceVolatility1h = calculateVolatility(trainingData, i, 1);
      const priceVolatility24h = calculateVolatility(trainingData, i, 24);

      // Calculate price momentum (rate of change)
      const priceMomentum3h = calculateMomentum(trainingData, i, 3);

      // Get natural gas price for this timestamp
      const { data: gasPrice } = await supabase
        .from('aeso_natural_gas_prices')
        .select('price')
        .lte('timestamp', current.timestamp)
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();

      // Calculate renewable curtailment (difference between potential and actual)
      const renewableCurtailment = calculateRenewableCurtailment(current);

      // Calculate net imports
      const netImports = current.interchange_net || 0;

      enhancedFeatures.push({
        timestamp: current.timestamp,
        price_volatility_1h: priceVolatility1h,
        price_volatility_24h: priceVolatility24h,
        price_momentum_3h: priceMomentum3h,
        natural_gas_price: gasPrice?.price || null,
        renewable_curtailment: renewableCurtailment,
        net_imports: netImports
      });

      // Insert in batches of 1000
      if (enhancedFeatures.length === 1000 || i === trainingData.length - 1) {
        const { error: insertError } = await supabase
          .from('aeso_enhanced_features')
          .upsert(enhancedFeatures, {
            onConflict: 'timestamp',
            ignoreDuplicates: false
          });

        if (insertError) {
          console.error('Error inserting enhanced features:', insertError);
          throw insertError;
        }

        console.log(`Inserted ${enhancedFeatures.length} enhanced feature records`);
        enhancedFeatures.length = 0;
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        featuresCalculated: trainingData.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error calculating enhanced features:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function calculateVolatility(data: any[], currentIndex: number, hoursBack: number): number {
  const startIndex = Math.max(0, currentIndex - hoursBack);
  const prices = data.slice(startIndex, currentIndex + 1).map(d => d.pool_price);
  
  if (prices.length < 2) return 0;
  
  const mean = prices.reduce((sum, p) => sum + p, 0) / prices.length;
  const variance = prices.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / prices.length;
  
  return Math.sqrt(variance);
}

function calculateMomentum(data: any[], currentIndex: number, hoursBack: number): number {
  const pastIndex = Math.max(0, currentIndex - hoursBack);
  
  if (pastIndex === currentIndex) return 0;
  
  const currentPrice = data[currentIndex].pool_price;
  const pastPrice = data[pastIndex].pool_price;
  
  return ((currentPrice - pastPrice) / pastPrice) * 100;
}

function calculateRenewableCurtailment(record: any): number {
  // Estimate potential renewable generation based on conditions
  const windGeneration = record.generation_wind || 0;
  const solarGeneration = record.generation_solar || 0;
  
  // During high wind speed periods with low demand, curtailment is likely
  const windSpeed = record.wind_speed || 0;
  const demand = record.ail_mw || 0;
  
  // Simple heuristic: if wind speed is high but generation is low relative to capacity
  // and demand is low, estimate curtailment
  const potentialWind = windSpeed > 30 ? windSpeed * 50 : windGeneration; // Rough estimate
  const estimatedCurtailment = Math.max(0, potentialWind - windGeneration);
  
  return estimatedCurtailment;
}