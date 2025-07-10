import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

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
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!apiKey) {
      throw new Error('CoinMarketCap API key not configured');
    }

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration missing');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { symbol } = await req.json();
    
    if (!symbol) {
      throw new Error('Cryptocurrency symbol is required');
    }

    // Check cache first - only fetch new data if older than 4 hours
    const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString();
    
    const { data: cachedData, error: cacheError } = await supabase
      .from('crypto_details_cache')
      .select('data, last_updated')
      .eq('symbol', symbol.toUpperCase())
      .gte('last_updated', fourHoursAgo)
      .maybeSingle();

    if (cachedData && !cacheError) {
      console.log(`Returning cached data for ${symbol}`);
      return new Response(
        JSON.stringify(cachedData.data),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    console.log(`Fetching fresh data for ${symbol} from CoinMarketCap`);

    // Fetch fresh data from CoinMarketCap - using v1 endpoint for better reliability
    const quotesResponse = await fetch(`https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${symbol}`, {
      headers: {
        'X-CMC_PRO_API_KEY': apiKey,
        'Accept': 'application/json'
      }
    });

    console.log(`Quotes response status: ${quotesResponse.status}`);

    if (!quotesResponse.ok) {
      const errorText = await quotesResponse.text();
      console.error(`Quotes API error: ${errorText}`);
      throw new Error(`CoinMarketCap quotes API error: ${quotesResponse.status}`);
    }

    const quotesData = await quotesResponse.json();
    console.log(`Quotes data structure:`, JSON.stringify(quotesData, null, 2));

    // Check if we have data
    if (!quotesData.data || Object.keys(quotesData.data).length === 0) {
      console.error('No quotes data returned from API');
      throw new Error('No cryptocurrency data found');
    }

    // Get the first cryptocurrency from the response
    const cryptoId = Object.keys(quotesData.data)[0];
    const cryptoQuotes = quotesData.data[cryptoId];

    console.log(`Found crypto ID: ${cryptoId}`);
    console.log(`Has quotes: ${!!cryptoQuotes}`);

    if (!cryptoQuotes) {
      console.error(`No data found for crypto: ${symbol}`);
      throw new Error('Cryptocurrency data not found');
    }

    // Format response with just the essential data we can get from quotes endpoint
    const result = {
      symbol: symbol.toUpperCase(),
      name: cryptoQuotes.name || 'Unknown',
      logo: null, // Not available in v1 quotes endpoint
      description: null, // Not available in v1 quotes endpoint
      category: null, // Not available in v1 quotes endpoint
      tags: [],
      
      // URLs - not available in quotes endpoint
      website: null,
      technicalDoc: null,
      twitter: null,
      reddit: null,
      sourceCode: null,
      
      // Market data - this is what we can get from quotes endpoint
      price: cryptoQuotes.quote?.USD?.price || 0,
      marketCap: cryptoQuotes.quote?.USD?.market_cap || 0,
      marketCapRank: cryptoQuotes.cmc_rank || 0,
      volume24h: cryptoQuotes.quote?.USD?.volume_24h || 0,
      volumeChange24h: cryptoQuotes.quote?.USD?.volume_change_24h || 0,
      percentChange1h: cryptoQuotes.quote?.USD?.percent_change_1h || 0,
      percentChange24h: cryptoQuotes.quote?.USD?.percent_change_24h || 0,
      percentChange7d: cryptoQuotes.quote?.USD?.percent_change_7d || 0,
      percentChange30d: cryptoQuotes.quote?.USD?.percent_change_30d || 0,
      percentChange60d: cryptoQuotes.quote?.USD?.percent_change_60d || 0,
      percentChange90d: cryptoQuotes.quote?.USD?.percent_change_90d || 0,
      
      // Supply data
      circulatingSupply: cryptoQuotes.circulating_supply || 0,
      totalSupply: cryptoQuotes.total_supply || 0,
      maxSupply: cryptoQuotes.max_supply || null,
      
      // Technical data - not available in quotes endpoint
      platform: null,
      contractAddress: null,
      
      // Additional info
      dateAdded: cryptoQuotes.date_added,
      lastUpdated: cryptoQuotes.last_updated,
      
      // Mining info
      isMineable: false, // Not available in quotes endpoint
      
      // Market metrics
      fullyDilutedMarketCap: cryptoQuotes.quote?.USD?.fully_diluted_market_cap || 0,
      dominance: cryptoQuotes.quote?.USD?.market_cap_dominance || 0
    };

    console.log(`Formatted result:`, JSON.stringify(result, null, 2));

    // Cache the result
    await supabase
      .from('crypto_details_cache')
      .upsert({
        symbol: symbol.toUpperCase(),
        data: result,
        last_updated: new Date().toISOString()
      });

    console.log(`Cached fresh data for ${symbol}`);

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
    console.error('Error fetching detailed crypto data:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        fallback: true 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
})