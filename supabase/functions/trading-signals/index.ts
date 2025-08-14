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

    const { action, userId, market, asset, signalType, riskTolerance = 'medium' } = await req.json();

    console.log('Trading signals request:', { action, market, asset, signalType });

    switch (action) {
      case 'generate_signals': {
        const signals = await generateTradingSignals(supabase, market, asset, riskTolerance);
        
        // Save signals for the user
        for (const signal of signals) {
          await supabase
            .from('trading_signals')
            .insert({
              user_id: userId,
              signal_type: signal.signal_type,
              market: signal.market,
              asset: signal.asset,
              confidence: signal.confidence,
              price_target: signal.price_target,
              risk_level: signal.risk_level,
              metadata: signal.metadata
            });
        }

        return new Response(JSON.stringify({
          success: true,
          signals
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'get_signals': {
        const { data: signals } = await supabase
          .from('trading_signals')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(50);

        return new Response(JSON.stringify({
          success: true,
          signals: signals || []
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'analyze_market': {
        const marketAnalysis = await analyzeMarketConditions(supabase, market);
        
        return new Response(JSON.stringify({
          success: true,
          analysis: marketAnalysis
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'detect_arbitrage': {
        const arbitrageOpportunities = await detectArbitrageOpportunities(supabase);
        
        return new Response(JSON.stringify({
          success: true,
          opportunities: arbitrageOpportunities
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'portfolio_signals': {
        const portfolioSignals = await generatePortfolioSignals(supabase, userId, riskTolerance);
        
        return new Response(JSON.stringify({
          success: true,
          portfolioSignals
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
    console.error('Error in trading signals:', error);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function generateTradingSignals(supabase: any, market: string, asset: string, riskTolerance: string) {
  const signals = [];

  // Get recent energy rate data
  const { data: recentRates } = await supabase
    .from('energy_rates')
    .select('*, energy_markets(*)')
    .order('timestamp', { ascending: false })
    .limit(50);

  if (!recentRates || recentRates.length === 0) {
    return [];
  }

  // Analyze price trends
  const priceAnalysis = analyzePriceTrends(recentRates);
  
  // Generate signals based on analysis
  if (priceAnalysis.trend === 'bullish') {
    signals.push({
      signal_type: 'buy',
      market: market || 'ERCOT',
      asset: asset || 'ENERGY',
      confidence: priceAnalysis.confidence,
      price_target: priceAnalysis.currentPrice * 1.1,
      risk_level: calculateRiskLevel(priceAnalysis, riskTolerance),
      metadata: {
        trend: priceAnalysis.trend,
        indicators: priceAnalysis.indicators,
        timeframe: '24h',
        reasoning: 'Upward price momentum detected with strong volume'
      }
    });
  } else if (priceAnalysis.trend === 'bearish') {
    signals.push({
      signal_type: 'sell',
      market: market || 'ERCOT',
      asset: asset || 'ENERGY',
      confidence: priceAnalysis.confidence,
      price_target: priceAnalysis.currentPrice * 0.9,
      risk_level: calculateRiskLevel(priceAnalysis, riskTolerance),
      metadata: {
        trend: priceAnalysis.trend,
        indicators: priceAnalysis.indicators,
        timeframe: '24h',
        reasoning: 'Downward price pressure with increasing supply'
      }
    });
  } else {
    signals.push({
      signal_type: 'hold',
      market: market || 'ERCOT',
      asset: asset || 'ENERGY',
      confidence: 0.6,
      price_target: priceAnalysis.currentPrice,
      risk_level: 'low',
      metadata: {
        trend: 'sideways',
        indicators: priceAnalysis.indicators,
        timeframe: '24h',
        reasoning: 'Market consolidation, waiting for clear direction'
      }
    });
  }

  // Check for volatility opportunities
  if (priceAnalysis.volatility > 0.15) {
    signals.push({
      signal_type: 'arbitrage',
      market: market || 'ERCOT',
      asset: 'VOLATILITY',
      confidence: 0.7,
      price_target: null,
      risk_level: 'high',
      metadata: {
        volatility: priceAnalysis.volatility,
        strategy: 'volatility_play',
        timeframe: '4h',
        reasoning: 'High volatility presents short-term trading opportunities'
      }
    });
  }

  return signals;
}

function analyzePriceTrends(priceData: any[]) {
  const prices = priceData.map(d => d.price_per_mwh).slice(0, 20);
  const currentPrice = prices[0];
  
  // Calculate moving averages
  const shortMA = prices.slice(0, 5).reduce((a, b) => a + b, 0) / 5;
  const longMA = prices.slice(0, 15).reduce((a, b) => a + b, 0) / 15;
  
  // Calculate price change
  const priceChange = (currentPrice - prices[prices.length - 1]) / prices[prices.length - 1];
  
  // Calculate volatility
  const returns = prices.slice(1).map((price, i) => (price - prices[i]) / prices[i]);
  const volatility = Math.sqrt(returns.reduce((sum, r) => sum + r * r, 0) / returns.length);
  
  // Determine trend
  let trend = 'sideways';
  let confidence = 0.5;
  
  if (shortMA > longMA && priceChange > 0.05) {
    trend = 'bullish';
    confidence = Math.min(0.9, 0.6 + Math.abs(priceChange) * 2);
  } else if (shortMA < longMA && priceChange < -0.05) {
    trend = 'bearish';
    confidence = Math.min(0.9, 0.6 + Math.abs(priceChange) * 2);
  }
  
  return {
    trend,
    confidence,
    currentPrice,
    shortMA,
    longMA,
    priceChange,
    volatility,
    indicators: {
      moving_average_signal: shortMA > longMA ? 'bullish' : 'bearish',
      momentum: priceChange > 0 ? 'positive' : 'negative',
      volatility_level: volatility > 0.15 ? 'high' : volatility > 0.08 ? 'medium' : 'low'
    }
  };
}

function calculateRiskLevel(analysis: any, riskTolerance: string): string {
  let baseRisk = 'medium';
  
  if (analysis.volatility > 0.2) {
    baseRisk = 'high';
  } else if (analysis.volatility < 0.05) {
    baseRisk = 'low';
  }
  
  // Adjust based on user risk tolerance
  if (riskTolerance === 'conservative' && baseRisk === 'high') {
    return 'medium';
  } else if (riskTolerance === 'aggressive' && baseRisk === 'low') {
    return 'medium';
  }
  
  return baseRisk;
}

async function analyzeMarketConditions(supabase: any, market: string) {
  // Get market data
  const { data: marketData } = await supabase
    .from('energy_rates')
    .select('*, energy_markets(*)')
    .order('timestamp', { ascending: false })
    .limit(100);

  if (!marketData || marketData.length === 0) {
    return {
      market: market,
      status: 'No data available',
      conditions: 'unknown'
    };
  }

  const prices = marketData.map(d => d.price_per_mwh);
  const currentPrice = prices[0];
  const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
  const maxPrice = Math.max(...prices);
  const minPrice = Math.min(...prices);
  
  return {
    market: market,
    currentPrice,
    averagePrice: avgPrice,
    priceRange: { min: minPrice, max: maxPrice },
    marketCondition: currentPrice > avgPrice * 1.1 ? 'overbought' : 
                    currentPrice < avgPrice * 0.9 ? 'oversold' : 'neutral',
    volatility: calculateVolatility(prices),
    trend: prices[0] > prices[prices.length - 1] ? 'upward' : 'downward',
    lastUpdated: marketData[0].timestamp
  };
}

async function detectArbitrageOpportunities(supabase: any) {
  // Get latest prices from different markets
  const { data: allRates } = await supabase
    .from('energy_rates')
    .select('*, energy_markets(*)')
    .order('timestamp', { ascending: false })
    .limit(100);

  if (!allRates || allRates.length === 0) {
    return [];
  }

  const opportunities = [];
  const marketPrices: { [key: string]: number } = {};
  
  // Group by market and get latest price
  allRates.forEach(rate => {
    const marketName = rate.energy_markets?.market_name || rate.market_id;
    if (!marketPrices[marketName] || rate.timestamp > marketPrices[marketName].timestamp) {
      marketPrices[marketName] = rate.price_per_mwh;
    }
  });

  // Find arbitrage opportunities
  const markets = Object.keys(marketPrices);
  for (let i = 0; i < markets.length; i++) {
    for (let j = i + 1; j < markets.length; j++) {
      const market1 = markets[i];
      const market2 = markets[j];
      const price1 = marketPrices[market1];
      const price2 = marketPrices[market2];
      const spread = Math.abs(price1 - price2);
      
      if (spread > 10) { // Minimum profitable spread
        opportunities.push({
          market_from: price1 > price2 ? market2 : market1,
          market_to: price1 > price2 ? market1 : market2,
          price_spread: spread,
          profit_potential: spread * 0.7, // After costs
          risk_adjusted_return: spread * 0.5,
          execution_window_start: new Date().toISOString(),
          execution_window_end: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
          confidence: 0.8
        });
      }
    }
  }

  return opportunities;
}

async function generatePortfolioSignals(supabase: any, userId: string, riskTolerance: string) {
  // Get user's existing signals and performance
  const { data: existingSignals } = await supabase
    .from('trading_signals')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

  // Analyze portfolio balance
  const signalTypes = existingSignals?.reduce((acc: any, signal: any) => {
    acc[signal.signal_type] = (acc[signal.signal_type] || 0) + 1;
    return acc;
  }, {}) || {};

  const portfolioSignals = {
    diversificationScore: calculateDiversificationScore(signalTypes),
    riskBalance: analyzeRiskBalance(existingSignals || [], riskTolerance),
    recommendations: generatePortfolioRecommendations(signalTypes, riskTolerance),
    performance: calculatePortfolioPerformance(existingSignals || []),
    rebalancingSuggestions: generateRebalancingSuggestions(signalTypes, riskTolerance)
  };

  return portfolioSignals;
}

function calculateVolatility(prices: number[]): number {
  const returns = prices.slice(1).map((price, i) => (price - prices[i]) / prices[i]);
  const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
  return Math.sqrt(variance);
}

function calculateDiversificationScore(signalTypes: any): number {
  const totalSignals = Object.values(signalTypes).reduce((a: any, b: any) => a + b, 0);
  if (totalSignals === 0) return 0;
  
  const uniqueTypes = Object.keys(signalTypes).length;
  return Math.min(1, uniqueTypes / 4); // Max 4 signal types for full diversification
}

function analyzeRiskBalance(signals: any[], riskTolerance: string): any {
  const riskLevels = signals.reduce((acc: any, signal: any) => {
    acc[signal.risk_level] = (acc[signal.risk_level] || 0) + 1;
    return acc;
  }, {});

  const totalSignals = signals.length;
  const riskDistribution = {
    low: (riskLevels.low || 0) / totalSignals,
    medium: (riskLevels.medium || 0) / totalSignals,
    high: (riskLevels.high || 0) / totalSignals
  };

  return {
    distribution: riskDistribution,
    alignment: calculateRiskAlignment(riskDistribution, riskTolerance),
    recommendation: getRiskRecommendation(riskDistribution, riskTolerance)
  };
}

function calculateRiskAlignment(distribution: any, riskTolerance: string): number {
  const targetDistribution = {
    conservative: { low: 0.7, medium: 0.25, high: 0.05 },
    moderate: { low: 0.4, medium: 0.5, high: 0.1 },
    aggressive: { low: 0.2, medium: 0.4, high: 0.4 }
  };

  const target = targetDistribution[riskTolerance as keyof typeof targetDistribution] || targetDistribution.moderate;
  
  const alignment = 1 - (
    Math.abs(distribution.low - target.low) +
    Math.abs(distribution.medium - target.medium) +
    Math.abs(distribution.high - target.high)
  ) / 2;

  return Math.max(0, alignment);
}

function getRiskRecommendation(distribution: any, riskTolerance: string): string {
  if (riskTolerance === 'conservative' && distribution.high > 0.1) {
    return 'Reduce high-risk positions to align with conservative strategy';
  } else if (riskTolerance === 'aggressive' && distribution.low > 0.4) {
    return 'Consider adding more high-risk opportunities for aggressive growth';
  } else {
    return 'Risk distribution is well-aligned with your tolerance';
  }
}

function generatePortfolioRecommendations(signalTypes: any, riskTolerance: string): string[] {
  const recommendations = [];
  
  if (!signalTypes.buy && !signalTypes.sell) {
    recommendations.push('Consider diversifying with both buy and sell signals');
  }
  
  if (!signalTypes.arbitrage && riskTolerance === 'aggressive') {
    recommendations.push('Look for arbitrage opportunities to maximize returns');
  }
  
  if (signalTypes.hold && Object.keys(signalTypes).length === 1) {
    recommendations.push('Consider more active trading strategies');
  }
  
  return recommendations;
}

function calculatePortfolioPerformance(signals: any[]): any {
  // Simplified performance calculation
  const totalSignals = signals.length;
  const avgConfidence = totalSignals > 0 ? 
    signals.reduce((sum, signal) => sum + (signal.confidence || 0), 0) / totalSignals : 0;
  
  return {
    totalSignals,
    averageConfidence: avgConfidence,
    performanceScore: avgConfidence * 100,
    status: avgConfidence > 0.7 ? 'Strong' : avgConfidence > 0.5 ? 'Moderate' : 'Weak'
  };
}

function generateRebalancingSuggestions(signalTypes: any, riskTolerance: string): string[] {
  const suggestions = [];
  
  const buyPercent = (signalTypes.buy || 0) / Object.values(signalTypes).reduce((a: any, b: any) => a + b, 0);
  const sellPercent = (signalTypes.sell || 0) / Object.values(signalTypes).reduce((a: any, b: any) => a + b, 0);
  
  if (buyPercent > 0.7) {
    suggestions.push('Consider taking some profits - portfolio heavily weighted toward buy signals');
  } else if (sellPercent > 0.7) {
    suggestions.push('Look for buying opportunities - portfolio may be overly defensive');
  }
  
  return suggestions;
}