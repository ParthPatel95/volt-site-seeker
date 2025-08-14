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

    const { action, jurisdiction, agency, updateType, impactLevel } = await req.json();

    console.log('Regulatory intelligence request:', { action, jurisdiction, agency });

    switch (action) {
      case 'scan_updates': {
        // Simulate regulatory monitoring and create sample updates
        const updates = await generateRegulatoryUpdates(supabase, jurisdiction);
        
        return new Response(JSON.stringify({
          success: true,
          updates
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'get_updates': {
        let query = supabase.from('regulatory_updates').select('*');
        
        if (jurisdiction) query = query.eq('jurisdiction', jurisdiction);
        if (agency) query = query.eq('agency', agency);
        if (updateType) query = query.eq('update_type', updateType);
        if (impactLevel) query = query.eq('impact_level', impactLevel);
        
        const { data: updates } = await query
          .order('created_at', { ascending: false })
          .limit(50);

        return new Response(JSON.stringify({
          success: true,
          updates: updates || []
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'analyze_impact': {
        const impactAnalysis = await analyzeRegulatoryImpact(supabase, jurisdiction);
        
        return new Response(JSON.stringify({
          success: true,
          analysis: impactAnalysis
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
    console.error('Error in regulatory intelligence:', error);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function generateRegulatoryUpdates(supabase: any, jurisdiction?: string) {
  const sampleUpdates = [
    {
      jurisdiction: jurisdiction || 'Texas',
      agency: 'PUCT',
      update_type: 'tariff',
      title: 'Updated transmission tariff rates for 2024',
      description: 'New transmission access charges effective Q2 2024',
      impact_level: 'medium',
      affected_sectors: ['transmission', 'generation'],
      effective_date: '2024-04-01'
    },
    {
      jurisdiction: jurisdiction || 'Alberta',
      agency: 'AUC',
      update_type: 'policy',
      title: 'Renewable energy integration standards',
      description: 'New requirements for grid-scale renewable connections',
      impact_level: 'high',
      affected_sectors: ['renewable', 'grid'],
      effective_date: '2024-06-01'
    }
  ];

  const insertedUpdates = [];
  
  for (const update of sampleUpdates) {
    const { data } = await supabase
      .from('regulatory_updates')
      .insert(update)
      .select()
      .single();
    
    if (data) insertedUpdates.push(data);
  }

  return insertedUpdates;
}

async function analyzeRegulatoryImpact(supabase: any, jurisdiction?: string) {
  const { data: updates } = await supabase
    .from('regulatory_updates')
    .select('*')
    .eq('jurisdiction', jurisdiction || 'Texas')
    .order('created_at', { ascending: false })
    .limit(20);

  const analysis = {
    totalUpdates: updates?.length || 0,
    impactBreakdown: {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0
    },
    sectorsAffected: new Set(),
    upcomingChanges: [],
    riskAssessment: 'Low regulatory risk environment'
  };

  updates?.forEach(update => {
    analysis.impactBreakdown[update.impact_level as keyof typeof analysis.impactBreakdown]++;
    update.affected_sectors?.forEach((sector: string) => analysis.sectorsAffected.add(sector));
    
    if (new Date(update.effective_date) > new Date()) {
      analysis.upcomingChanges.push({
        title: update.title,
        effectiveDate: update.effective_date,
        impact: update.impact_level
      });
    }
  });

  return {
    ...analysis,
    sectorsAffected: Array.from(analysis.sectorsAffected)
  };
}