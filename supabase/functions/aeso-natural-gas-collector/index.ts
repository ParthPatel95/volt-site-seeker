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
      throw new Error('EIA_API_KEY is required to fetch real Henry Hub natural gas prices');
    }

    // Fetch real Henry Hub natural gas prices from EIA API as proxy for AECO
    // Using futures market data as spot prices are not available in v2 API
    // Henry Hub natural gas futures (daily prices in USD/MMBTU)
    console.log('Fetching Henry Hub natural gas futures prices from EIA API (proxy for AECO)...');
    
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 365 * 24 * 60 * 60 * 1000 * 4); // 4 years back
    
    const allRecords = [];
    let currentStart = new Date(startDate);
    
    // Fetch in 1-year chunks to avoid API limits
    while (currentStart < endDate) {
      const currentEnd = new Date(currentStart);
      currentEnd.setFullYear(currentEnd.getFullYear() + 1);
      
      if (currentEnd > endDate) {
        currentEnd.setTime(endDate.getTime());
      }
      
      const startStr = currentStart.toISOString().split('T')[0];
      const endStr = currentEnd.toISOString().split('T')[0];
      
      // Try futures market data for Henry Hub (front-month contract)
      const eiaUrl = `https://api.eia.gov/v2/natural-gas/pri/fut/data/?api_key=${eiaApiKey}&frequency=daily&data[0]=value&facets[duoarea][]=RGC&start=${startStr}&end=${endStr}&sort[0][column]=period&sort[0][direction]=desc&length=5000`;
      
      console.log(`Fetching Henry Hub prices from ${startStr} to ${endStr}...`);
      
      const eiaResponse = await fetch(eiaUrl);
      
      if (!eiaResponse.ok) {
        const errorText = await eiaResponse.text();
        console.error(`EIA API error for ${startStr} to ${endStr}: ${eiaResponse.status} - ${errorText}`);
        throw new Error(`EIA API failed: ${eiaResponse.status}. Henry Hub natural gas data is required.`);
      }
      
      const eiaData = await eiaResponse.json();
      const prices = eiaData.response?.data || [];
      
      console.log(`Received ${prices.length} Henry Hub price records for this period`);
      
      // Transform to database format
      // Note: Storing as AECO market with Henry Hub as source for ML model compatibility
      const records = prices.map((record: any) => ({
        timestamp: new Date(record.period + 'T12:00:00Z').toISOString(), // Noon UTC for daily prices
        price: parseFloat(record.value),
        source: 'EIA_HENRY_HUB_PROXY',
        market: 'AECO'
      }));
      
      allRecords.push(...records);
      
      // Move to next chunk
      currentStart = new Date(currentEnd);
      currentStart.setDate(currentStart.getDate() + 1);
      
      // Small delay to respect API rate limits
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    console.log(`Total AECO records fetched: ${allRecords.length}`);
    
    // Insert in batches of 1000
    let inserted = 0;
    for (let i = 0; i < allRecords.length; i += 1000) {
      const batch = allRecords.slice(i, i + 1000);
      const { error } = await supabase
        .from('aeso_natural_gas_prices')
        .upsert(batch, {
          onConflict: 'timestamp,market',
          ignoreDuplicates: true
        });
      
      if (error) {
        console.error('Error inserting AECO natural gas prices:', error);
        throw error;
      }
      inserted += batch.length;
      console.log(`Inserted ${inserted}/${allRecords.length} records`);
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        recordsInserted: allRecords.length,
        source: 'EIA_HENRY_HUB_PROXY',
        market: 'AECO',
        note: 'Using Henry Hub prices as proxy for AECO (real data from EIA)',
        dateRange: {
          start: startDate.toISOString().split('T')[0],
          end: endDate.toISOString().split('T')[0]
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in AECO natural gas collector:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        note: 'Real Henry Hub natural gas price data (proxy for AECO) is required from EIA API'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});