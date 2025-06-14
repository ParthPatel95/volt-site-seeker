
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VoltScoreRequest {
  property_id: string;
  property_data?: any;
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const calculateVoltScore = (property: any) => {
  // Location Score (0-100)
  const locationScore = Math.min(100, Math.max(0, 
    50 + 
    (property.transmission_access ? 25 : 0) +
    (property.substation_distance_miles ? Math.max(0, 25 - (property.substation_distance_miles * 5)) : 0)
  ));

  // Power Score (0-100)
  const powerScore = Math.min(100, Math.max(0,
    (property.power_capacity_mw ? Math.min(80, property.power_capacity_mw * 2) : 20) +
    (property.transmission_access ? 20 : 0)
  ));

  // Infrastructure Score (0-100)
  const infrastructureScore = Math.min(100, Math.max(0,
    40 +
    (property.year_built && property.year_built > 2010 ? 30 : 15) +
    (property.square_footage ? Math.min(30, property.square_footage / 10000) : 10)
  ));

  // Financial Score (0-100)
  const pricePerSqft = property.asking_price && property.square_footage ? 
    property.asking_price / property.square_footage : 50;
  const financialScore = Math.min(100, Math.max(0,
    100 - Math.min(50, pricePerSqft / 2) +
    (property.lot_size_acres ? Math.min(20, property.lot_size_acres) : 0)
  ));

  // Risk Score (0-100, lower is better but we'll invert for display)
  const riskScore = Math.min(100, Math.max(0,
    70 +
    (property.transmission_access ? 15 : -15) +
    (property.year_built && property.year_built > 2015 ? 15 : -10)
  ));

  // Overall Score (weighted average)
  const overallScore = Math.round(
    (locationScore * 0.25) +
    (powerScore * 0.30) +
    (infrastructureScore * 0.20) +
    (financialScore * 0.15) +
    (riskScore * 0.10)
  );

  return {
    overall_score: overallScore,
    location_score: Math.round(locationScore),
    power_score: Math.round(powerScore),
    infrastructure_score: Math.round(infrastructureScore),
    financial_score: Math.round(financialScore),
    risk_score: Math.round(riskScore),
    calculation_details: {
      factors_analyzed: [
        'transmission_access',
        'substation_distance',
        'power_capacity',
        'property_age',
        'price_analysis',
        'location_quality'
      ],
      methodology: 'VoltScout Proprietary Algorithm v2.1'
    }
  };
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { property_id, property_data }: VoltScoreRequest = await req.json();

    console.log(`Calculating VoltScore for property: ${property_id}`);

    let property = property_data;

    // If no property data provided, fetch from database
    if (!property && property_id) {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', property_id)
        .single();

      if (error) {
        throw new Error(`Property not found: ${error.message}`);
      }

      property = data;
    }

    if (!property) {
      throw new Error('Property data is required');
    }

    // Calculate VoltScore
    const scores = calculateVoltScore(property);

    // Save scores to database if property_id is provided
    if (property_id) {
      const { error: insertError } = await supabase
        .from('volt_scores')
        .upsert({
          property_id: property_id,
          ...scores,
          calculated_at: new Date().toISOString()
        });

      if (insertError) {
        console.error('Error saving VoltScore:', insertError);
        // Don't throw here, still return the calculated scores
      }
    }

    console.log(`VoltScore calculated successfully: ${scores.overall_score}/100`);

    return new Response(JSON.stringify({
      success: true,
      property_id: property_id,
      volt_score: scores,
      calculated_at: new Date().toISOString()
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Error calculating VoltScore:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message || 'Failed to calculate VoltScore'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};

serve(handler);
