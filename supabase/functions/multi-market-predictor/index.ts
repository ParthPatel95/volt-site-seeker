import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Phase 9: Market-specific configurations
const MARKET_CONFIGS = {
  aeso: {
    name: 'Alberta (AESO)',
    currency: 'CAD',
    unit: 'MWh',
    predictor_function: 'aeso-optimized-predictor',
    features: ['demand', 'wind', 'solar', 'gas_price', 'temperature', 'imports'],
    typical_range: { min: 0, max: 200 },
    spike_threshold: 150
  },
  ercot: {
    name: 'Texas (ERCOT)',
    currency: 'USD',
    unit: 'MWh',
    predictor_function: null, // To be implemented
    features: ['demand', 'wind', 'solar', 'gas_price', 'temperature', 'reserves'],
    typical_range: { min: 0, max: 300 },
    spike_threshold: 250
  },
  miso: {
    name: 'Midwest (MISO)',
    currency: 'USD',
    unit: 'MWh',
    predictor_function: null,
    features: ['demand', 'wind', 'coal', 'gas_price', 'nuclear', 'temperature'],
    typical_range: { min: 0, max: 150 },
    spike_threshold: 100
  },
  caiso: {
    name: 'California (CAISO)',
    currency: 'USD',
    unit: 'MWh',
    predictor_function: null,
    features: ['demand', 'solar', 'wind', 'gas_price', 'imports', 'temperature'],
    typical_range: { min: 0, max: 200 },
    spike_threshold: 150
  },
  pjm: {
    name: 'Mid-Atlantic (PJM)',
    currency: 'USD',
    unit: 'MWh',
    predictor_function: null,
    features: ['demand', 'nuclear', 'gas_price', 'coal', 'temperature'],
    typical_range: { min: 0, max: 180 },
    spike_threshold: 120
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { market = 'aeso', horizon = '24h', compareMarkets = false } = await req.json();
    
    console.log(`🌐 Phase 9: Multi-Market Predictor (market: ${market}, horizon: ${horizon})`);

    const marketConfig = MARKET_CONFIGS[market as keyof typeof MARKET_CONFIGS];
    if (!marketConfig) {
      throw new Error(`Unsupported market: ${market}. Supported: ${Object.keys(MARKET_CONFIGS).join(', ')}`);
    }

    console.log(`Selected market: ${marketConfig.name}`);

    // Check if market-specific predictor is available
    if (!marketConfig.predictor_function) {
      // Use generic prediction model adapted for this market
      console.log(`No dedicated predictor for ${market}, using generic market model`);
      
      const predictions = await generateGenericMarketPredictions(
        supabase,
        market,
        marketConfig,
        horizon
      );

      return new Response(JSON.stringify({
        success: true,
        market: market,
        market_name: marketConfig.name,
        predictions: predictions,
        note: `Generic predictions based on historical patterns. Dedicated ${market.toUpperCase()} predictor coming soon.`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Use market-specific predictor (currently only AESO)
    const { data: predictionData, error: predError } = await supabase.functions.invoke(
      marketConfig.predictor_function,
      { body: { horizon, forceRefresh: false } }
    );

    if (predError) throw predError;

    let result: any = {
      success: true,
      market: market,
      market_name: marketConfig.name,
      predictions: predictionData.predictions,
      performance: predictionData.performance,
      market_info: {
        currency: marketConfig.currency,
        unit: marketConfig.unit,
        typical_range: marketConfig.typical_range,
        spike_threshold: marketConfig.spike_threshold,
        features_used: marketConfig.features
      }
    };

    // Multi-market comparison if requested
    if (compareMarkets) {
      console.log('Generating multi-market comparison...');
      
      const comparisons = await generateMarketComparisons(
        supabase,
        market,
        predictionData.predictions
      );
      
      result.market_comparison = comparisons;
    }

    // Log multi-market request
    await supabase
      .from('multi_market_requests')
      .insert({
        primary_market: market,
        horizon_hours: parseInt(horizon.replace('h', '')),
        comparison_enabled: compareMarkets,
        predictions_count: predictionData.predictions.length
      });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Multi-market predictor error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

// Generate predictions for markets without dedicated predictors
async function generateGenericMarketPredictions(
  supabase: any,
  market: string,
  config: any,
  horizon: string
): Promise<any[]> {
  const horizonHours = parseInt(horizon.replace('h', ''));
  const now = new Date();
  
  // Fetch recent historical data for the market
  const { data: historicalData } = await supabase
    .from(`${market}_historical_prices`)
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(168); // Last 7 days

  if (!historicalData || historicalData.length === 0) {
    // Generate placeholder predictions based on market typical range
    return generatePlaceholderPredictions(now, horizonHours, config);
  }

  // Calculate simple statistical predictions
  const predictions: any[] = [];
  const avgPrice = historicalData.reduce((sum: number, d: any) => sum + d.price, 0) / historicalData.length;
  const stdDev = Math.sqrt(
    historicalData.reduce((sum: number, d: any) => sum + Math.pow(d.price - avgPrice, 2), 0) / historicalData.length
  );

  for (let i = 1; i <= horizonHours; i++) {
    const targetTime = new Date(now.getTime() + i * 60 * 60 * 1000);
    const hour = targetTime.getHours();
    
    // Apply hour-of-day adjustment
    const peakMultiplier = (hour >= 7 && hour <= 22) ? 1.15 : 0.85;
    const predictedPrice = avgPrice * peakMultiplier;
    
    predictions.push({
      timestamp: targetTime.toISOString(),
      horizonHours: i,
      price: parseFloat(predictedPrice.toFixed(2)),
      confidenceLower: parseFloat((predictedPrice - 1.96 * stdDev).toFixed(2)),
      confidenceUpper: parseFloat((predictedPrice + 1.96 * stdDev).toFixed(2)),
      confidenceScore: 0.6, // Moderate confidence for generic predictions
      features: {
        avgPrice: avgPrice,
        hour: hour,
        isPeak: hour >= 7 && hour <= 22
      },
      method: 'generic_statistical'
    });
  }

  return predictions;
}

function generatePlaceholderPredictions(startTime: Date, hours: number, config: any): any[] {
  const predictions: any[] = [];
  const midPrice = (config.typical_range.min + config.typical_range.max) / 2;
  const priceRange = config.typical_range.max - config.typical_range.min;

  for (let i = 1; i <= hours; i++) {
    const targetTime = new Date(startTime.getTime() + i * 60 * 60 * 1000);
    const hour = targetTime.getHours();
    const peakMultiplier = (hour >= 7 && hour <= 22) ? 1.2 : 0.8;
    
    predictions.push({
      timestamp: targetTime.toISOString(),
      horizonHours: i,
      price: parseFloat((midPrice * peakMultiplier).toFixed(2)),
      confidenceLower: parseFloat((midPrice * peakMultiplier - priceRange * 0.2).toFixed(2)),
      confidenceUpper: parseFloat((midPrice * peakMultiplier + priceRange * 0.2).toFixed(2)),
      confidenceScore: 0.4, // Low confidence for placeholder
      features: { hour, isPeak: hour >= 7 && hour <= 22 },
      method: 'placeholder'
    });
  }

  return predictions;
}

async function generateMarketComparisons(
  supabase: any,
  primaryMarket: string,
  primaryPredictions: any[]
): Promise<any> {
  const comparisons: any = {
    markets_analyzed: [primaryMarket],
    relative_pricing: {},
    market_spread: {},
    arbitrage_opportunities: []
  };

  // Get latest prices from other markets
  for (const [marketKey, config] of Object.entries(MARKET_CONFIGS)) {
    if (marketKey === primaryMarket) continue;

    try {
      const { data: latestPrice } = await supabase
        .from(`${marketKey}_pricing`)
        .select('current_price')
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();

      if (latestPrice) {
        comparisons.markets_analyzed.push(marketKey);
        
        const primaryAvgPrice = primaryPredictions.reduce((sum, p) => sum + p.price, 0) / primaryPredictions.length;
        const priceDiff = primaryAvgPrice - latestPrice.current_price;
        
        comparisons.relative_pricing[marketKey] = {
          current_price: latestPrice.current_price,
          vs_primary: priceDiff,
          percent_diff: ((priceDiff / latestPrice.current_price) * 100).toFixed(2)
        };

        // Identify potential arbitrage (>20% price differential)
        if (Math.abs(priceDiff / latestPrice.current_price) > 0.20) {
          comparisons.arbitrage_opportunities.push({
            from_market: priceDiff > 0 ? marketKey : primaryMarket,
            to_market: priceDiff > 0 ? primaryMarket : marketKey,
            price_differential: Math.abs(priceDiff),
            percent: Math.abs((priceDiff / latestPrice.current_price) * 100).toFixed(2)
          });
        }
      }
    } catch (err) {
      console.log(`Could not fetch comparison data for ${marketKey}:`, err);
    }
  }

  return comparisons;
}
