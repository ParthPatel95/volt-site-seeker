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

    // Fetch data for top 6 mined cryptocurrencies from CoinMarketCap
    const response = await fetch('https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=BTC,ETH,LTC,BCH,DOGE,XMR', {
      headers: {
        'X-CMC_PRO_API_KEY': apiKey,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`CoinMarketCap API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.data) {
      throw new Error('Invalid response format from CoinMarketCap');
    }

    // Helper function to format crypto data
    const formatCryptoData = (cryptoData: any, symbol: string) => ({
      symbol,
      name: cryptoData.name,
      price: cryptoData.quote.USD.price,
      marketCap: cryptoData.quote.USD.market_cap,
      volume24h: cryptoData.quote.USD.volume_24h,
      percentChange24h: cryptoData.quote.USD.percent_change_24h,
      lastUpdated: cryptoData.quote.USD.last_updated
    });

    // Format data for all cryptocurrencies
    const cryptos = {
      BTC: data.data.BTC ? formatCryptoData(data.data.BTC, 'BTC') : null,
      ETH: data.data.ETH ? formatCryptoData(data.data.ETH, 'ETH') : null,
      LTC: data.data.LTC ? formatCryptoData(data.data.LTC, 'LTC') : null,
      BCH: data.data.BCH ? formatCryptoData(data.data.BCH, 'BCH') : null,
      DOGE: data.data.DOGE ? formatCryptoData(data.data.DOGE, 'DOGE') : null,
      XMR: data.data.XMR ? formatCryptoData(data.data.XMR, 'XMR') : null
    };

    // Return structured data for the frontend
    const result = {
      cryptos,
      // Legacy BTC-specific fields for backward compatibility
      price: data.data.BTC?.quote.USD.price || 107800,
      marketCap: data.data.BTC?.quote.USD.market_cap || 2100000000000,
      volume24h: data.data.BTC?.quote.USD.volume_24h || 25000000000,
      percentChange24h: data.data.BTC?.quote.USD.percent_change_24h || 2.5,
      lastUpdated: data.data.BTC?.quote.USD.last_updated || new Date().toISOString(),
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
    console.error('Error fetching crypto data:', error);
    
    // Return fallback data in case of error
    const fallbackData = {
      cryptos: {
        BTC: { symbol: 'BTC', name: 'Bitcoin', price: 107800, marketCap: 2100000000000, volume24h: 25000000000, percentChange24h: 2.5, lastUpdated: new Date().toISOString() },
        ETH: { symbol: 'ETH', name: 'Ethereum', price: 3500, marketCap: 420000000000, volume24h: 15000000000, percentChange24h: 1.8, lastUpdated: new Date().toISOString() },
        LTC: { symbol: 'LTC', name: 'Litecoin', price: 120, marketCap: 9000000000, volume24h: 800000000, percentChange24h: 3.2, lastUpdated: new Date().toISOString() },
        BCH: { symbol: 'BCH', name: 'Bitcoin Cash', price: 450, marketCap: 9000000000, volume24h: 500000000, percentChange24h: -0.5, lastUpdated: new Date().toISOString() },
        DOGE: { symbol: 'DOGE', name: 'Dogecoin', price: 0.35, marketCap: 50000000000, volume24h: 2000000000, percentChange24h: 5.1, lastUpdated: new Date().toISOString() },
        XMR: { symbol: 'XMR', name: 'Monero', price: 180, marketCap: 3300000000, volume24h: 150000000, percentChange24h: 1.2, lastUpdated: new Date().toISOString() }
      },
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