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

    // Fetch real network data from mempool.space
    let networkStats = {
      difficulty: 110e12,  // ~110T difficulty
      hashrate: 800e18,    // ~800 EH/s
      blockReward: 3.125,  // Post-April 2024 halving
      avgBlockTime: 10,
      nextHalvingDays: 800,
      blockHeight: 878000
    };
    
    try {
      const [heightRes, hashrateRes] = await Promise.all([
        fetch('https://mempool.space/api/blocks/tip/height'),
        fetch('https://mempool.space/api/v1/mining/hashrate/3d')
      ]);
      
      if (heightRes.ok) {
        networkStats.blockHeight = parseInt(await heightRes.text()) || networkStats.blockHeight;
      }
      
      if (hashrateRes.ok) {
        const hrData = await hashrateRes.json();
        if (hrData.currentHashrate) networkStats.hashrate = hrData.currentHashrate;
        if (hrData.currentDifficulty) networkStats.difficulty = hrData.currentDifficulty;
      }
      
      // Calculate block reward from height
      const halvings = Math.floor(networkStats.blockHeight / 210000);
      networkStats.blockReward = 50 / Math.pow(2, halvings);
      
      // Calculate days to halving
      const nextHalvingBlock = (halvings + 1) * 210000;
      const blocksUntilHalving = nextHalvingBlock - networkStats.blockHeight;
      networkStats.nextHalvingDays = Math.floor((blocksUntilHalving * 10) / (60 * 24));
    } catch (e) {
      console.warn('mempool.space fetch failed, using defaults:', e);
    }

    // Return structured data for the frontend
    const result = {
      cryptos,
      // Legacy BTC-specific fields for backward compatibility
      price: data.data.BTC?.quote.USD.price || 100000,
      marketCap: data.data.BTC?.quote.USD.market_cap || 2000000000000,
      volume24h: data.data.BTC?.quote.USD.volume_24h || 25000000000,
      percentChange24h: data.data.BTC?.quote.USD.percent_change_24h || 0,
      lastUpdated: data.data.BTC?.quote.USD.last_updated || new Date().toISOString(),
      // Real network data from mempool.space
      difficulty: networkStats.difficulty,
      hashrate: `${(networkStats.hashrate / 1e18).toFixed(0)} EH/s`,
      blockReward: networkStats.blockReward,
      avgBlockTime: networkStats.avgBlockTime,
      nextHalvingDays: networkStats.nextHalvingDays,
      blockHeight: networkStats.blockHeight,
      dataSource: 'mempool.space'
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
    
    // Return fallback data in case of error (January 2026 estimates)
    const fallbackData = {
      cryptos: {
        BTC: { symbol: 'BTC', name: 'Bitcoin', price: 100000, marketCap: 2000000000000, volume24h: 25000000000, percentChange24h: 0, lastUpdated: new Date().toISOString() },
        ETH: { symbol: 'ETH', name: 'Ethereum', price: 3500, marketCap: 420000000000, volume24h: 15000000000, percentChange24h: 0, lastUpdated: new Date().toISOString() },
        LTC: { symbol: 'LTC', name: 'Litecoin', price: 120, marketCap: 9000000000, volume24h: 800000000, percentChange24h: 0, lastUpdated: new Date().toISOString() },
        BCH: { symbol: 'BCH', name: 'Bitcoin Cash', price: 450, marketCap: 9000000000, volume24h: 500000000, percentChange24h: 0, lastUpdated: new Date().toISOString() },
        DOGE: { symbol: 'DOGE', name: 'Dogecoin', price: 0.35, marketCap: 50000000000, volume24h: 2000000000, percentChange24h: 0, lastUpdated: new Date().toISOString() },
        XMR: { symbol: 'XMR', name: 'Monero', price: 180, marketCap: 3300000000, volume24h: 150000000, percentChange24h: 0, lastUpdated: new Date().toISOString() }
      },
      price: 100000,
      marketCap: 2000000000000,
      volume24h: 25000000000,
      percentChange24h: 0,
      lastUpdated: new Date().toISOString(),
      difficulty: 110e12,    // ~110T
      hashrate: '800 EH/s',
      blockReward: 3.125,    // Post-April 2024 halving
      avgBlockTime: 10,
      nextHalvingDays: 800,
      blockHeight: 878000,
      dataSource: 'fallback'
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