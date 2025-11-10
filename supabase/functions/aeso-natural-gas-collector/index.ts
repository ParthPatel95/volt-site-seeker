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
    const eiaApiKey = Deno.env.get('EIA_API_KEY');
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (!eiaApiKey) {
      console.log('No EIA API key found, using synthetic data for natural gas prices');
      
      // Generate synthetic natural gas price data
      const now = new Date();
      const records = [];
      
      for (let i = 0; i < 24 * 365 * 4; i++) { // 4 years of hourly data
        const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
        
        // AECO natural gas price typically ranges $1-5 CAD/GJ, with seasonal patterns
        const basePrice = 2.5;
        const seasonalFactor = Math.sin((timestamp.getMonth() / 12) * 2 * Math.PI) * 0.8; // Higher in winter
        const hourlyVariation = Math.sin((timestamp.getHours() / 24) * 2 * Math.PI) * 0.3;
        const randomNoise = (Math.random() - 0.5) * 0.5;
        
        const price = Math.max(0.5, basePrice + seasonalFactor + hourlyVariation + randomNoise);
        
        records.push({
          timestamp: timestamp.toISOString(),
          price: parseFloat(price.toFixed(4)),
          source: 'SYNTHETIC',
          market: 'AECO'
        });
        
        // Insert in batches of 1000
        if (records.length === 1000) {
          await supabase.from('aeso_natural_gas_prices').upsert(records, {
            onConflict: 'timestamp,market',
            ignoreDuplicates: true
          });
          records.length = 0;
        }
      }
      
      // Insert remaining records
      if (records.length > 0) {
        await supabase.from('aeso_natural_gas_prices').upsert(records, {
          onConflict: 'timestamp,market',
          ignoreDuplicates: true
        });
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Synthetic natural gas price data generated',
          recordsGenerated: 24 * 365 * 4
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch real natural gas prices from EIA API
    // EIA API for natural gas spot prices at AECO (Alberta)
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 365 * 24 * 60 * 60 * 1000 * 4); // 4 years
    
    const eiaUrl = `https://api.eia.gov/v2/natural-gas/pri/spt/data/?api_key=${eiaApiKey}&frequency=daily&data[0]=value&facets[series][]=RNGC1&start=${startDate.toISOString().split('T')[0]}&end=${endDate.toISOString().split('T')[0]}&sort[0][column]=period&sort[0][direction]=desc`;
    
    console.log('Fetching natural gas prices from EIA...');
    const eiaResponse = await fetch(eiaUrl);
    
    if (!eiaResponse.ok) {
      throw new Error(`EIA API error: ${eiaResponse.status}`);
    }
    
    const eiaData = await eiaResponse.json();
    const prices = eiaData.response?.data || [];
    
    console.log(`Received ${prices.length} natural gas price records`);
    
    // Transform and insert into database
    const records = prices.map((record: any) => ({
      timestamp: new Date(record.period + 'T00:00:00Z').toISOString(),
      price: parseFloat(record.value),
      source: 'EIA',
      market: 'AECO'
    }));
    
    // Insert in batches of 1000
    for (let i = 0; i < records.length; i += 1000) {
      const batch = records.slice(i, i + 1000);
      const { error } = await supabase
        .from('aeso_natural_gas_prices')
        .upsert(batch, {
          onConflict: 'timestamp,market',
          ignoreDuplicates: true
        });
      
      if (error) {
        console.error('Error inserting natural gas prices:', error);
        throw error;
      }
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        recordsInserted: records.length,
        source: 'EIA'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in natural gas collector:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});