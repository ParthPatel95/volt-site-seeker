import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

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

    const { predictionId, timestamp } = await req.json();
    
    console.log('🔍 Phase 8: Prediction Explainer');
    console.log('Analyzing prediction:', { predictionId, timestamp });

    // Fetch the specific prediction
    let prediction: any;
    if (predictionId) {
      const { data, error } = await supabase
        .from('aeso_price_predictions')
        .select('*')
        .eq('id', predictionId)
        .single();
      
      if (error) throw error;
      prediction = data;
    } else if (timestamp) {
      const { data, error } = await supabase
        .from('aeso_price_predictions')
        .select('*')
        .eq('target_timestamp', timestamp)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error) throw error;
      prediction = data;
    } else {
      throw new Error('Either predictionId or timestamp must be provided');
    }

    console.log('Found prediction:', {
      id: prediction.id,
      price: prediction.predicted_price,
      timestamp: prediction.target_timestamp
    });

    // Fetch model parameters for feature importance
    const { data: modelParams, error: paramsError } = await supabase
      .from('aeso_model_parameters')
      .select('*')
      .eq('model_version', prediction.model_version)
      .eq('parameter_type', 'learned_coefficients')
      .single();

    if (paramsError) {
      console.warn('Could not fetch model parameters:', paramsError);
    }

    const featureCorrelations = modelParams?.feature_correlations || {};
    const featuresUsed = prediction.features_used || {};

    // Calculate feature contributions (SHAP-like attribution)
    const featureContributions = calculateFeatureContributions(
      featuresUsed,
      featureCorrelations,
      prediction.predicted_price
    );

    // Generate natural language explanation
    const explanation = generateExplanation(
      prediction.predicted_price,
      featureContributions,
      featuresUsed
    );

    // Perform sensitivity analysis
    const sensitivityAnalysis = performSensitivityAnalysis(
      featuresUsed,
      featureCorrelations,
      prediction.predicted_price
    );

    // Identify key drivers
    const keyDrivers = identifyKeyDrivers(featureContributions);

    // Calculate confidence breakdown
    const confidenceBreakdown = analyzeConfidence(
      prediction.confidence_score,
      prediction.confidence_lower,
      prediction.confidence_upper,
      prediction.predicted_price
    );

    // Store explanation for future reference
    await supabase
      .from('aeso_prediction_explanations')
      .insert({
        prediction_id: prediction.id,
        target_timestamp: prediction.target_timestamp,
        predicted_price: prediction.predicted_price,
        feature_contributions: featureContributions,
        key_drivers: keyDrivers,
        sensitivity_analysis: sensitivityAnalysis,
        explanation_text: explanation,
        confidence_breakdown: confidenceBreakdown,
        model_version: prediction.model_version
      });

    return new Response(JSON.stringify({
      success: true,
      prediction: {
        id: prediction.id,
        timestamp: prediction.target_timestamp,
        price: prediction.predicted_price,
        confidence_lower: prediction.confidence_lower,
        confidence_upper: prediction.confidence_upper,
        confidence_score: prediction.confidence_score
      },
      explanation: {
        text: explanation,
        feature_contributions: featureContributions,
        key_drivers: keyDrivers,
        sensitivity_analysis: sensitivityAnalysis,
        confidence_breakdown: confidenceBreakdown
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Prediction explainer error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

// Calculate how much each feature contributed to the prediction
function calculateFeatureContributions(
  features: any,
  correlations: any,
  predictedPrice: number
): any[] {
  const contributions: any[] = [];
  const basePrice = 50; // Average baseline price

  // Key features to analyze
  const featureAnalysis = [
    { key: 'ail_mw', name: 'Demand', correlation: correlations.ail_mw || 0.3 },
    { key: 'generation_wind', name: 'Wind Generation', correlation: correlations.generation_wind || -0.2 },
    { key: 'generation_solar', name: 'Solar Generation', correlation: correlations.generation_solar || -0.15 },
    { key: 'natural_gas_price', name: 'Natural Gas Price', correlation: correlations.natural_gas_price || 0.4 },
    { key: 'temperature_calgary', name: 'Temperature (Calgary)', correlation: correlations.temperature_calgary || 0.15 },
    { key: 'temperature_edmonton', name: 'Temperature (Edmonton)', correlation: correlations.temperature_edmonton || 0.15 },
    { key: 'wind_speed_avg', name: 'Wind Speed', correlation: correlations.wind_speed_avg || -0.1 },
    { key: 'cloud_cover_avg', name: 'Cloud Cover', correlation: correlations.cloud_cover_avg || 0.05 }
  ];

  for (const { key, name, correlation } of featureAnalysis) {
    const value = features[key];
    if (value !== undefined && value !== null) {
      // Simplified attribution: contribution = correlation * normalized_value
      const normalizedValue = normalizeFeatureValue(key, value);
      const contribution = correlation * normalizedValue * (predictedPrice - basePrice);
      
      contributions.push({
        feature: name,
        key: key,
        value: value,
        correlation: correlation,
        contribution: contribution,
        impact: Math.abs(contribution),
        direction: contribution > 0 ? 'increases' : 'decreases'
      });
    }
  }

  // Sort by impact (absolute contribution)
  return contributions.sort((a, b) => b.impact - a.impact);
}

function normalizeFeatureValue(key: string, value: number): number {
  // Normalize to roughly [-1, 1] range based on typical ranges
  const ranges: any = {
    'ail_mw': { min: 8000, max: 12000 },
    'generation_wind': { min: 0, max: 3000 },
    'generation_solar': { min: 0, max: 1000 },
    'natural_gas_price': { min: 1.5, max: 5.0 },
    'temperature_calgary': { min: -30, max: 35 },
    'temperature_edmonton': { min: -35, max: 35 },
    'wind_speed_avg': { min: 0, max: 30 },
    'cloud_cover_avg': { min: 0, max: 100 }
  };

  const range = ranges[key];
  if (!range) return 0;

  const normalized = (value - range.min) / (range.max - range.min);
  return Math.max(-1, Math.min(1, normalized * 2 - 1));
}

function generateExplanation(
  price: number,
  contributions: any[],
  features: any
): string {
  const topFactors = contributions.slice(0, 3);
  
  let explanation = `The predicted price of $${price.toFixed(2)}/MWh is primarily influenced by:\n\n`;
  
  topFactors.forEach((factor, idx) => {
    const impactPct = (Math.abs(factor.contribution) / price * 100).toFixed(1);
    explanation += `${idx + 1}. **${factor.feature}**: ${factor.value.toFixed(1)} ${getUnit(factor.key)} `;
    explanation += `(${factor.direction} price by ~$${Math.abs(factor.contribution).toFixed(2)}, ${impactPct}% impact)\n`;
  });

  // Add context
  const hour = new Date(features.timestamp || Date.now()).getHours();
  const isWeekend = features.isWeekend;
  const isPeak = hour >= 7 && hour <= 22;

  explanation += `\n**Context**: `;
  explanation += isPeak ? 'Peak hours (7 AM - 10 PM)' : 'Off-peak hours';
  explanation += isWeekend ? ', Weekend' : ', Weekday';
  
  return explanation;
}

function getUnit(key: string): string {
  const units: any = {
    'ail_mw': 'MW',
    'generation_wind': 'MW',
    'generation_solar': 'MW',
    'natural_gas_price': '$/GJ',
    'temperature_calgary': '°C',
    'temperature_edmonton': '°C',
    'wind_speed_avg': 'km/h',
    'cloud_cover_avg': '%'
  };
  return units[key] || '';
}

function performSensitivityAnalysis(
  features: any,
  correlations: any,
  basePrice: number
): any[] {
  const scenarios = [
    { name: 'High Demand (+10%)', feature: 'ail_mw', change: 0.10 },
    { name: 'Low Wind Generation (-50%)', feature: 'generation_wind', change: -0.50 },
    { name: 'High Gas Price (+20%)', feature: 'natural_gas_price', change: 0.20 },
    { name: 'Extreme Cold (-15°C)', feature: 'temperature_calgary', change: -15 },
    { name: 'Peak Solar (+30%)', feature: 'generation_solar', change: 0.30 }
  ];

  return scenarios.map(scenario => {
    const currentValue = features[scenario.feature] || 0;
    const newValue = scenario.feature.includes('temperature') 
      ? currentValue + scenario.change
      : currentValue * (1 + scenario.change);
    
    const correlation = correlations[scenario.feature] || 0;
    const normalizedChange = normalizeFeatureValue(scenario.feature, newValue) - 
                            normalizeFeatureValue(scenario.feature, currentValue);
    
    const priceImpact = correlation * normalizedChange * basePrice;
    const newPrice = basePrice + priceImpact;

    return {
      scenario: scenario.name,
      feature: scenario.feature,
      current_value: currentValue,
      scenario_value: newValue,
      price_impact: priceImpact,
      new_price: newPrice,
      change_percent: (priceImpact / basePrice * 100).toFixed(1)
    };
  });
}

function identifyKeyDrivers(contributions: any[]): any {
  const top3 = contributions.slice(0, 3);
  const increasing = contributions.filter(c => c.contribution > 0).slice(0, 2);
  const decreasing = contributions.filter(c => c.contribution < 0).slice(0, 2);

  return {
    top_factors: top3.map(c => ({
      feature: c.feature,
      impact: c.impact,
      direction: c.direction
    })),
    price_increasing_factors: increasing.map(c => c.feature),
    price_decreasing_factors: decreasing.map(c => c.feature)
  };
}

function analyzeConfidence(
  score: number,
  lower: number,
  upper: number,
  predicted: number
): any {
  const range = upper - lower;
  const rangePercent = (range / predicted * 100).toFixed(1);
  
  let confidenceLevel = 'High';
  if (score < 0.7 || range / predicted > 0.3) {
    confidenceLevel = 'Moderate';
  }
  if (score < 0.5 || range / predicted > 0.5) {
    confidenceLevel = 'Low';
  }

  return {
    confidence_score: score,
    confidence_level: confidenceLevel,
    prediction_range: {
      lower: lower,
      upper: upper,
      width: range,
      width_percent: parseFloat(rangePercent)
    },
    interpretation: `${confidenceLevel} confidence with ±$${(range / 2).toFixed(2)} range (${rangePercent}% of predicted value)`
  };
}
