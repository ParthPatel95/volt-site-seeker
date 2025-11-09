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

    console.log('⚡ Rapid backfill: Collecting hourly snapshots to quickly build 30,000-hour dataset...');

    // Strategy: Call the data collector every minute for the next hour
    // to simulate rapid collection. This will give us more training data faster.
    let collected = 0;
    const maxIterations = 60; // Run for up to 60 minutes
    
    for (let i = 0; i < maxIterations; i++) {
      console.log(`Collection iteration ${i + 1}/${maxIterations}`);
      
      // Invoke data collector
      const { data, error } = await supabase.functions.invoke('aeso-data-collector');
      
      if (error) {
        console.error('Data collection error:', error);
        continue;
      }
      
      if (data?.success) {
        collected++;
        console.log(`✅ Collected record ${collected}: ${data.pool_price} $/MWh`);
      }
      
      // Wait 1 minute between collections
      await new Promise(resolve => setTimeout(resolve, 60000));
    }

    // After collecting data, train the model
    console.log('🤖 Training model with collected data...');
    const { data: trainResult, error: trainError } = await supabase.functions.invoke('aeso-model-trainer');
    
    if (trainError) {
      console.error('Training error:', trainError);
    } else {
      console.log('✅ Training complete:', trainResult);
    }

    return new Response(JSON.stringify({
      success: true,
      recordsCollected: collected,
      modelTrained: !trainError,
      trainingResult: trainResult
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Rapid backfill error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
