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

    const { symbol } = await req.json();
    
    if (!symbol) {
      throw new Error('Cryptocurrency symbol is required');
    }

    // Fetch comprehensive data for the cryptocurrency
    const [metadataResponse, quotesResponse, performanceResponse] = await Promise.all([
      // Get metadata (logo, description, website, etc.)
      fetch(`https://pro-api.coinmarketcap.com/v2/cryptocurrency/info?symbol=${symbol}`, {
        headers: {
          'X-CMC_PRO_API_KEY': apiKey,
          'Accept': 'application/json'
        }
      }),
      
      // Get detailed quotes
      fetch(`https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest?symbol=${symbol}`, {
        headers: {
          'X-CMC_PRO_API_KEY': apiKey,
          'Accept': 'application/json'
        }
      }),

      // Get price performance stats
      fetch(`https://pro-api.coinmarketcap.com/v2/cryptocurrency/price-performance-stats/latest?symbol=${symbol}`, {
        headers: {
          'X-CMC_PRO_API_KEY': apiKey,
          'Accept': 'application/json'
        }
      })
    ]);

    if (!metadataResponse.ok || !quotesResponse.ok) {
      throw new Error(`API request failed: ${metadataResponse.status} ${quotesResponse.status}`);
    }

    const [metadataData, quotesData, performanceData] = await Promise.all([
      metadataResponse.json(),
      quotesResponse.json(),
      performanceResponse.ok ? performanceResponse.json() : null
    ]);

    // Extract the cryptocurrency data
    const cryptoId = Object.keys(quotesData.data)[0];
    const cryptoQuotes = quotesData.data[cryptoId];
    const cryptoMetadata = metadataData.data[cryptoId];
    const cryptoPerformance = performanceData?.data?.[cryptoId] || null;

    if (!cryptoQuotes || !cryptoMetadata) {
      throw new Error('Cryptocurrency data not found');
    }

    // Format comprehensive response
    const result = {
      symbol: symbol,
      name: cryptoMetadata.name,
      logo: cryptoMetadata.logo,
      description: cryptoMetadata.description,
      category: cryptoMetadata.category,
      tags: cryptoMetadata.tags || [],
      
      // URLs
      website: cryptoMetadata.urls?.website?.[0] || null,
      technicalDoc: cryptoMetadata.urls?.technical_doc?.[0] || null,
      twitter: cryptoMetadata.urls?.twitter?.[0] || null,
      reddit: cryptoMetadata.urls?.reddit?.[0] || null,
      sourceCode: cryptoMetadata.urls?.source_code?.[0] || null,
      
      // Market data
      price: cryptoQuotes.quote.USD.price,
      marketCap: cryptoQuotes.quote.USD.market_cap,
      marketCapRank: cryptoQuotes.cmc_rank,
      volume24h: cryptoQuotes.quote.USD.volume_24h,
      volumeChange24h: cryptoQuotes.quote.USD.volume_change_24h,
      percentChange1h: cryptoQuotes.quote.USD.percent_change_1h,
      percentChange24h: cryptoQuotes.quote.USD.percent_change_24h,
      percentChange7d: cryptoQuotes.quote.USD.percent_change_7d,
      percentChange30d: cryptoQuotes.quote.USD.percent_change_30d,
      percentChange60d: cryptoQuotes.quote.USD.percent_change_60d,
      percentChange90d: cryptoQuotes.quote.USD.percent_change_90d,
      
      // Supply data
      circulatingSupply: cryptoQuotes.circulating_supply,
      totalSupply: cryptoQuotes.total_supply,
      maxSupply: cryptoQuotes.max_supply,
      
      // Technical data
      platform: cryptoMetadata.platform,
      contractAddress: cryptoMetadata.contract_address,
      
      // Performance stats (if available)
      performance: cryptoPerformance ? {
        roi: cryptoPerformance.roi || {},
        periods: cryptoPerformance.periods || {}
      } : null,
      
      // Additional info
      dateAdded: cryptoQuotes.date_added,
      lastUpdated: cryptoQuotes.last_updated,
      
      // Mining info (for applicable coins)
      isMineable: cryptoMetadata.tags?.includes('mineable') || false,
      algorithm: null, // This would need additional API calls or data sources
      
      // Market metrics
      fullyDilutedMarketCap: cryptoQuotes.quote.USD.fully_diluted_market_cap,
      dominance: cryptoQuotes.quote.USD.market_cap_dominance
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