
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CalculateRequest {
  property_ids?: string[];
  recalculate_all?: boolean;
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const calculateVoltScore = (property: any) => {
  let locationScore = 50;
  let powerScore = 50;
  let infrastructureScore = 50;
  let financialScore = 50;
  let riskScore = 50;

  // Location scoring
  const majorDataCenterCities = ['dallas', 'austin', 'houston', 'atlanta', 'phoenix', 'denver'];
  const majorDataCenterStates = ['texas', 'virginia', 'california', 'georgia', 'arizona'];
  
  if (majorDataCenterCities.includes(property.city?.toLowerCase())) {
    locationScore += 25;
  }
  if (majorDataCenterStates.includes(property.state?.toLowerCase())) {
    locationScore += 15;
  }

  // Power scoring
  if (property.power_capacity_mw) {
    if (property.power_capacity_mw >= 100) powerScore += 40;
    else if (property.power_capacity_mw >= 50) powerScore += 30;
    else if (property.power_capacity_mw >= 25) powerScore += 20;
    else if (property.power_capacity_mw >= 10) powerScore += 10;
  }

  if (property.transmission_access) {
    powerScore += 20;
  }

  // Infrastructure scoring
  if (property.substation_distance_miles !== null) {
    if (property.substation_distance_miles <= 0.5) infrastructureScore += 30;
    else if (property.substation_distance_miles <= 1) infrastructureScore += 25;
    else if (property.substation_distance_miles <= 3) infrastructureScore += 15;
    else if (property.substation_distance_miles <= 5) infrastructureScore += 5;
  }

  if (property.square_footage) {
    if (property.square_footage >= 200000) infrastructureScore += 20;
    else if (property.square_footage >= 100000) infrastructureScore += 15;
    else if (property.square_footage >= 50000) infrastructureScore += 10;
  }

  // Financial scoring
  if (property.asking_price && property.square_footage) {
    const pricePerSqft = property.asking_price / property.square_footage;
    if (pricePerSqft <= 30) financialScore += 25;
    else if (pricePerSqft <= 50) financialScore += 20;
    else if (pricePerSqft <= 75) financialScore += 15;
    else if (pricePerSqft <= 100) financialScore += 10;
  }

  // Risk scoring (lower risk = higher score)
  if (property.year_built) {
    if (property.year_built >= 2015) riskScore += 20;
    else if (property.year_built >= 2000) riskScore += 15;
    else if (property.year_built >= 1990) riskScore += 10;
  }

  if (property.zoning?.toLowerCase().includes('industrial')) {
    riskScore += 15;
  }

  // Ensure scores are within bounds
  locationScore = Math.min(100, Math.max(0, locationScore));
  powerScore = Math.min(100, Math.max(0, powerScore));
  infrastructureScore = Math.min(100, Math.max(0, infrastructureScore));
  financialScore = Math.min(100, Math.max(0, financialScore));
  riskScore = Math.min(100, Math.max(0, riskScore));

  // Overall score (weighted average)
  const overallScore = Math.round(
    (powerScore * 0.35 + infrastructureScore * 0.25 + locationScore * 0.2 + financialScore * 0.15 + riskScore * 0.05)
  );

  return {
    overall_score: overallScore,
    location_score: locationScore,
    power_score: powerScore,
    infrastructure_score: infrastructureScore,
    financial_score: financialScore,
    risk_score: riskScore,
    calculation_details: {
      algorithm_version: '2.0',
      weights: {
        power: 0.35,
        infrastructure: 0.25,
        location: 0.2,
        financial: 0.15,
        risk: 0.05
      },
      factors: {
        location: { score: locationScore, factors: ['city_tier', 'state_market'] },
        power: { score: powerScore, factors: ['capacity_mw', 'transmission_access'] },
        infrastructure: { score: infrastructureScore, factors: ['substation_distance', 'square_footage'] },
        financial: { score: financialScore, factors: ['price_per_sqft'] },
        risk: { score: riskScore, factors: ['year_built', 'zoning'] }
      }
    }
  };
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { property_ids, recalculate_all = false }: CalculateRequest = await req.json();

    console.log('Starting VoltScore calculation...');

    let query = supabase.from('properties').select('*');
    
    if (!recalculate_all && property_ids && property_ids.length > 0) {
      query = query.in('id', property_ids);
    }

    const { data: properties, error: fetchError } = await query;

    if (fetchError) throw fetchError;

    if (!properties || properties.length === 0) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No properties found to calculate scores for' 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const results = [];

    for (const property of properties) {
      try {
        const voltScore = calculateVoltScore(property);

        // Insert new VoltScore
        const { data: scoreData, error: scoreError } = await supabase
          .from('volt_scores')
          .insert([{
            property_id: property.id,
            ...voltScore
          }])
          .select();

        if (scoreError) {
          console.error(`Error calculating score for property ${property.id}:`, scoreError);
          continue;
        }

        results.push({
          property_id: property.id,
          address: property.address,
          overall_score: voltScore.overall_score
        });

        // Create alert for high-scoring properties (80+)
        if (voltScore.overall_score >= 80) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id')
            .eq('role', 'admin')
            .limit(1);

          if (profiles && profiles.length > 0) {
            await supabase
              .from('alerts')
              .insert([{
                user_id: profiles[0].id,
                property_id: property.id,
                alert_type: 'high_voltscore',
                title: 'High VoltScore Property',
                message: `Property scored ${voltScore.overall_score}/100: ${property.address}`,
                metadata: { volt_score: voltScore.overall_score }
              }]);
          }
        }

        console.log(`Calculated VoltScore for ${property.address}: ${voltScore.overall_score}/100`);
      } catch (propertyError) {
        console.error(`Error processing property ${property.id}:`, propertyError);
      }
    }

    console.log(`VoltScore calculation completed. Processed ${results.length} properties.`);

    return new Response(JSON.stringify({
      success: true,
      properties_processed: results.length,
      results: results
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Error in VoltScore calculator:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};

serve(handler);
