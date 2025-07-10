import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('=== CRYPTO DETAILS FUNCTION CALLED ===');
  console.log('Request method:', req.method);
  console.log('Request URL:', req.url);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== CRYPTO DETAILS FUNCTION START ===');
    const apiKey = Deno.env.get('COINMARKETCAP_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    console.log('Environment check:', {
      hasApiKey: !!apiKey,
      hasSupabaseUrl: !!supabaseUrl,
      hasSupabaseKey: !!supabaseKey,
      apiKeyLength: apiKey ? apiKey.length : 0
    });
    
    if (!apiKey) {
      console.error('CoinMarketCap API key not configured');
      throw new Error('CoinMarketCap API key not configured');
    }

    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase configuration missing');
      throw new Error('Supabase configuration missing');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { symbol } = await req.json();
    console.log('Request symbol:', symbol);
    
    if (!symbol) {
      console.error('No symbol provided');
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

    // Fetch fresh data from CoinMarketCap using v1 endpoint
    const apiUrl = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${symbol}`;
    console.log('API URL:', apiUrl);
    console.log('API Key first 8 chars:', apiKey ? apiKey.substring(0, 8) + '...' : 'NOT SET');

    const quotesResponse = await fetch(apiUrl, {
      headers: {
        'X-CMC_PRO_API_KEY': apiKey,
        'Accept': 'application/json'
      }
    });

    console.log(`Quotes response status: ${quotesResponse.status}`);
    console.log(`Quotes response headers:`, Object.fromEntries(quotesResponse.headers.entries()));

    if (!quotesResponse.ok) {
      const errorText = await quotesResponse.text();
      console.error(`Quotes API error: ${errorText}`);
      throw new Error(`CoinMarketCap quotes API error: ${quotesResponse.status} - ${errorText}`);
    }

    const quotesData = await quotesResponse.json();
    console.log(`API Response structure:`, JSON.stringify(quotesData, null, 2));

    // Check API status first
    if (!quotesData.status || quotesData.status.error_code !== 0) {
      console.error('API returned error:', quotesData.status?.error_message || 'Unknown error');
      throw new Error(quotesData.status?.error_message || 'CoinMarketCap API error');
    }

    // Check if we have data
    if (!quotesData.data || Object.keys(quotesData.data).length === 0) {
      console.error('No quotes data returned from API');
      throw new Error('No cryptocurrency data found');
    }

    // Get the first cryptocurrency from the response (CoinMarketCap returns data keyed by symbol)
    const cryptoData = quotesData.data[symbol.toUpperCase()];
    
    if (!cryptoData) {
      console.error(`No data found for crypto symbol: ${symbol}`);
      throw new Error(`Cryptocurrency ${symbol} not found`);
    }

    console.log(`Found crypto data for ${symbol}:`, JSON.stringify(cryptoData, null, 2));

    // Format response with the data from quotes endpoint
    const result = {
      symbol: symbol.toUpperCase(),
      name: cryptoData.name || 'Unknown',
      logo: null, // Not available in quotes endpoint
      description: null, // Not available in quotes endpoint
      category: null, // Not available in quotes endpoint
      tags: cryptoData.tags || [],
      
      // URLs - not available in quotes endpoint
      website: null,
      technicalDoc: null,
      twitter: null,
      reddit: null,
      sourceCode: null,
      
      // Market data from quotes endpoint
      price: cryptoData.quote?.USD?.price || 0,
      marketCap: cryptoData.quote?.USD?.market_cap || 0,
      marketCapRank: cryptoData.cmc_rank || 0,
      volume24h: cryptoData.quote?.USD?.volume_24h || 0,
      volumeChange24h: cryptoData.quote?.USD?.volume_change_24h || 0,
      percentChange1h: cryptoData.quote?.USD?.percent_change_1h || 0,
      percentChange24h: cryptoData.quote?.USD?.percent_change_24h || 0,
      percentChange7d: cryptoData.quote?.USD?.percent_change_7d || 0,
      percentChange30d: cryptoData.quote?.USD?.percent_change_30d || 0,
      percentChange60d: cryptoData.quote?.USD?.percent_change_60d || 0,
      percentChange90d: cryptoData.quote?.USD?.percent_change_90d || 0,
      
      // Supply data
      circulatingSupply: cryptoData.circulating_supply || 0,
      totalSupply: cryptoData.total_supply || 0,
      maxSupply: cryptoData.max_supply || null,
      
      // Technical data - not available in quotes endpoint
      platform: cryptoData.platform || null,
      contractAddress: null,
      
      // Additional info
      dateAdded: cryptoData.date_added,
      lastUpdated: cryptoData.last_updated,
      
      // Mining info
      isMineable: cryptoData.is_fiat === 0, // Approximation
      
      // Market metrics
      fullyDilutedMarketCap: cryptoData.quote?.USD?.fully_diluted_market_cap || 0,
      dominance: cryptoData.quote?.USD?.market_cap_dominance || 0
    };

    console.log(`Formatted result for ${symbol}:`, JSON.stringify(result, null, 2));

    // Cache the result
    await supabase
      .from('crypto_details_cache')
      .upsert({
        symbol: symbol.toUpperCase(),
        data: result,
        last_updated: new Date().toISOString()
      });

    console.log(`Successfully cached data for ${symbol}`);

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
    console.error('=== CRYPTO DETAILS FUNCTION ERROR ===');
    console.error('Error details:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Return fallback data with error indication
    const fallbackResult = {
      symbol: 'ERROR',
      name: 'Error loading data',
      logo: null,
      description: null,
      category: null,
      tags: [],
      website: null,
      technicalDoc: null,
      twitter: null,
      reddit: null,
      sourceCode: null,
      price: 0,
      marketCap: 0,
      marketCapRank: 0,
      volume24h: 0,
      volumeChange24h: 0,
      percentChange1h: 0,
      percentChange24h: 0,
      percentChange7d: 0,
      percentChange30d: 0,
      percentChange60d: 0,
      percentChange90d: 0,
      circulatingSupply: 0,
      totalSupply: 0,
      maxSupply: null,
      platform: null,
      contractAddress: null,
      dateAdded: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      isMineable: false,
      fullyDilutedMarketCap: 0,
      dominance: 0,
      error: true,
      errorMessage: error.message
    };
    
    return new Response(
      JSON.stringify(fallbackResult),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
})