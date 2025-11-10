import { serve, createClient } from "../_shared/imports.ts";

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
    let allTrainingData = [];
    let trainingPage = 0;
    const pageSize = 1000;
    
    while (true) {
      const { data, error } = await supabase
        .from('aeso_training_data')
        .select('*')
        .order('timestamp', { ascending: true })
        .range(trainingPage * pageSize, (trainingPage + 1) * pageSize - 1);
      
      if (error) throw error;
      if (!data || data.length === 0) break;
      
      allTrainingData = allTrainingData.concat(data);
      if (data.length < pageSize) break;
      trainingPage++;
    }
    
    const trainingData = allTrainingData;
    if (trainingData.length === 0) throw new Error('No training data available');

    console.log(`Processing ${trainingData.length} training records...`);

    // Fetch ALL natural gas prices (paginated)
    let allGasPrices = [];
    let gasPage = 0;
    
    while (true) {
      const { data, error } = await supabase
        .from('aeso_natural_gas_prices')
        .select('timestamp, price')
        .order('timestamp', { ascending: true })
        .range(gasPage * pageSize, (gasPage + 1) * pageSize - 1);
      
      if (error) throw error;
      if (!data || data.length === 0) break;
      
      allGasPrices = allGasPrices.concat(data);
      if (data.length < pageSize) break;
      gasPage++;
    }
    
    const gasPrices = allGasPrices;
    
    console.log(`Building hourly gas price map from ${gasPrices.length} records...`);
    
    // Build hourly gas price map (data has timestamps at XX:12:36, round to hour)
    const hourlyGasPrices = new Map<number, number>();
    (gasPrices || []).forEach((gp: any) => {
      const timestamp = new Date(gp.timestamp);
      // Round to nearest hour (needed because gas prices are at XX:12:36)
      timestamp.setUTCMinutes(0, 0, 0);
      const timeKey = timestamp.getTime();
      hourlyGasPrices.set(timeKey, gp.price);
    });
    
    console.log(`Gas price map built with ${hourlyGasPrices.size} hourly entries`);
    
    const enhancedFeatures = [];

    for (let i = 0; i < trainingData.length; i++) {
      const current = trainingData[i];
      const currentTime = new Date(current.timestamp);

      // Calculate price volatility (standard deviation over rolling windows)
      const priceVolatility1h = calculateVolatility(trainingData, i, 1);
      const priceVolatility24h = calculateVolatility(trainingData, i, 24);

      // Calculate price momentum (rate of change)
      const priceMomentum3h = calculateMomentum(trainingData, i, 3);

      // Get hourly natural gas price
      const roundedTime = new Date(currentTime);
      roundedTime.setUTCMinutes(0, 0, 0);
      const timeKey = roundedTime.getTime();
      const gasPrice = hourlyGasPrices.get(timeKey) || null;
      
      // Debug first record
      if (i === 0) {
        console.log(`Debug first record - original timestamp: ${currentTime.toISOString()}`);
        console.log(`Debug first record - rounded timestamp: ${roundedTime.toISOString()}`);
        console.log(`Debug first record - timeKey: ${timeKey}`);
        console.log(`Debug first record - gasPrice: ${gasPrice}`);
        console.log(`Debug first record - map has ${hourlyGasPrices.size} entries`);
        // Show first few map entries
        let count = 0;
        for (const [key, value] of hourlyGasPrices.entries()) {
          if (count < 3) {
            const date = new Date(key);
            console.log(`  Map entry ${count}: key=${key}, date=${date.toISOString()}, price=${value}`);
          }
          count++;
        }
      }
      
      // Calculate lagged gas prices
      const time1d = new Date(currentTime.getTime() - 24 * 60 * 60 * 1000);
      time1d.setUTCMinutes(0, 0, 0);
      const gasPrice1DayAgo = hourlyGasPrices.get(time1d.getTime()) || null;
      
      const time7d = new Date(currentTime.getTime() - 7 * 24 * 60 * 60 * 1000);
      time7d.setUTCMinutes(0, 0, 0);
      const gasPrice7DaysAgo = hourlyGasPrices.get(time7d.getTime()) || null;
      
      const time30d = new Date(currentTime.getTime() - 30 * 24 * 60 * 60 * 1000);
      time30d.setUTCMinutes(0, 0, 0);
      const gasPrice30DaysAgo = hourlyGasPrices.get(time30d.getTime()) || null;

      // Calculate renewable curtailment (difference between potential and actual)
      const renewableCurtailment = calculateRenewableCurtailment(current);

      // Calculate net imports
      const netImports = current.interchange_net || 0;

      enhancedFeatures.push({
        timestamp: current.timestamp,
        price_volatility_1h: priceVolatility1h,
        price_volatility_24h: priceVolatility24h,
        price_momentum_3h: priceMomentum3h,
        natural_gas_price: gasPrice,
        natural_gas_price_lag_1d: gasPrice1DayAgo,
        natural_gas_price_lag_7d: gasPrice7DaysAgo,
        natural_gas_price_lag_30d: gasPrice30DaysAgo,
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

function getInterpolatedGasPrice(hourlyPrices: Map<number, number>, timestamp: Date): number | null {
  // Round timestamp to start of the hour
  const roundedTime = new Date(timestamp);
  roundedTime.setUTCMinutes(0, 0, 0);
  const timeKey = roundedTime.getTime();
  
  const price = hourlyPrices.get(timeKey);
  return price !== undefined ? price : null;
}