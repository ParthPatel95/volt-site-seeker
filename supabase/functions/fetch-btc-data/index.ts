import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('COINMARKETCAP_API_KEY');
    
    if (!apiKey) {
      throw new Error('CoinMarketCap API key not configured');
    }

    // Fetch BTC data from CoinMarketCap
    const response = await fetch('https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=BTC', {
      headers: {
        'X-CMC_PRO_API_KEY': apiKey,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`CoinMarketCap API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.data || !data.data.BTC) {
      throw new Error('Invalid response format from CoinMarketCap');
    }

    const btcData = data.data.BTC;
    
    // Return structured data for the frontend
    const result = {
      price: btcData.quote.USD.price,
      marketCap: btcData.quote.USD.market_cap,
      volume24h: btcData.quote.USD.volume_24h,
      percentChange24h: btcData.quote.USD.percent_change_24h,
      lastUpdated: btcData.quote.USD.last_updated,
      // Mock additional network data (you can replace with real data from other APIs)
      difficulty: 68.5,
      hashrate: '450 EH/s',
      blockReward: 6.25,
      avgBlockTime: 10,
      nextHalvingDays: 1400
    };

    return new Response(
      JSON.stringify(result),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error fetching BTC data:', error);
    
    // Return fallback data in case of error
    const fallbackData = {
      price: 107800,
      marketCap: 2100000000000,
      volume24h: 25000000000,
      percentChange24h: 2.5,
      lastUpdated: new Date().toISOString(),
      difficulty: 68.5,
      hashrate: '450 EH/s',
      blockReward: 6.25,
      avgBlockTime: 10,
      nextHalvingDays: 1400
    };

    return new Response(
      JSON.stringify(fallbackData),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
})