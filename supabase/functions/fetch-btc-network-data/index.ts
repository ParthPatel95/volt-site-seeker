import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Bitcoin halving schedule - block rewards halve every 210,000 blocks
const HALVING_INTERVAL = 210000;
const INITIAL_REWARD = 50;
const GENESIS_DATE = new Date('2009-01-03');

// Calculate block reward based on block height
function getBlockReward(blockHeight: number): number {
  const halvings = Math.floor(blockHeight / HALVING_INTERVAL);
  if (halvings >= 64) return 0; // After 64 halvings, reward is effectively 0
  return INITIAL_REWARD / Math.pow(2, halvings);
}

// Calculate next halving info
function getHalvingInfo(blockHeight: number) {
  const currentHalvingEra = Math.floor(blockHeight / HALVING_INTERVAL);
  const nextHalvingBlock = (currentHalvingEra + 1) * HALVING_INTERVAL;
  const blocksUntilHalving = nextHalvingBlock - blockHeight;
  
  // Approximate 10 minutes per block
  const minutesUntilHalving = blocksUntilHalving * 10;
  const daysUntilHalving = Math.floor(minutesUntilHalving / (60 * 24));
  
  return {
    nextHalvingBlock,
    blocksUntilHalving,
    daysUntilHalving
  };
}

// Fetch BTC price from Coinbase (free, no API key)
async function fetchBTCPrice(): Promise<number> {
  try {
    const response = await fetch('https://api.coinbase.com/v2/prices/BTC-USD/spot', {
      headers: { 'Accept': 'application/json' }
    });
    
    if (response.ok) {
      const data = await response.json();
      return parseFloat(data.data?.amount) || 0;
    }
  } catch (e) {
    console.warn('Coinbase price fetch failed:', e);
  }
  
  // Fallback to CoinGecko
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
    if (response.ok) {
      const data = await response.json();
      return data.bitcoin?.usd || 0;
    }
  } catch (e) {
    console.warn('CoinGecko price fetch failed:', e);
  }
  
  return 0;
}

// Fetch network data from mempool.space (free, no API key)
async function fetchMempoolData() {
  const results = {
    blockHeight: 0,
    difficulty: 0,
    hashrate: 0,
    avgBlockTime: 10,
    difficultyAdjustment: null as any
  };
  
  try {
    // Fetch block height
    const heightRes = await fetch('https://mempool.space/api/blocks/tip/height');
    if (heightRes.ok) {
      results.blockHeight = parseInt(await heightRes.text()) || 0;
    }
  } catch (e) {
    console.warn('mempool block height fetch failed:', e);
  }
  
  try {
    // Fetch difficulty adjustment info
    const diffRes = await fetch('https://mempool.space/api/v1/difficulty-adjustment');
    if (diffRes.ok) {
      results.difficultyAdjustment = await diffRes.json();
    }
  } catch (e) {
    console.warn('mempool difficulty adjustment fetch failed:', e);
  }
  
  try {
    // Fetch hashrate data (last 3 days)
    const hashrateRes = await fetch('https://mempool.space/api/v1/mining/hashrate/3d');
    if (hashrateRes.ok) {
      const hashrateData = await hashrateRes.json();
      // Get the most recent hashrate (already in H/s)
      if (hashrateData.currentHashrate) {
        results.hashrate = hashrateData.currentHashrate;
      } else if (hashrateData.hashrates && hashrateData.hashrates.length > 0) {
        const latest = hashrateData.hashrates[hashrateData.hashrates.length - 1];
        results.hashrate = latest.avgHashrate || 0;
      }
      
      // Get current difficulty from hashrate endpoint
      if (hashrateData.currentDifficulty) {
        results.difficulty = hashrateData.currentDifficulty;
      }
    }
  } catch (e) {
    console.warn('mempool hashrate fetch failed:', e);
  }
  
  return results;
}

// Fallback: Fetch from blockchain.info
async function fetchBlockchainInfoData() {
  const results = {
    difficulty: 0,
    hashrate: 0,
    blockHeight: 0
  };
  
  try {
    const diffRes = await fetch('https://blockchain.info/q/getdifficulty');
    if (diffRes.ok) {
      results.difficulty = parseFloat(await diffRes.text()) || 0;
    }
  } catch (e) {
    console.warn('blockchain.info difficulty fetch failed:', e);
  }
  
  try {
    const hashrateRes = await fetch('https://blockchain.info/q/hashrate');
    if (hashrateRes.ok) {
      // blockchain.info returns hashrate in GH/s, convert to H/s
      const ghps = parseFloat(await hashrateRes.text()) || 0;
      results.hashrate = ghps * 1e9;
    }
  } catch (e) {
    console.warn('blockchain.info hashrate fetch failed:', e);
  }
  
  try {
    const heightRes = await fetch('https://blockchain.info/q/getblockcount');
    if (heightRes.ok) {
      results.blockHeight = parseInt(await heightRes.text()) || 0;
    }
  } catch (e) {
    console.warn('blockchain.info block height fetch failed:', e);
  }
  
  return results;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Fetching live Bitcoin network data...');
    
    // Fetch price and network data in parallel
    const [price, mempoolData, blockchainData] = await Promise.all([
      fetchBTCPrice(),
      fetchMempoolData(),
      fetchBlockchainInfoData()
    ]);
    
    // Use mempool.space data as primary, blockchain.info as fallback
    const blockHeight = mempoolData.blockHeight || blockchainData.blockHeight || 878000;
    const difficulty = mempoolData.difficulty || blockchainData.difficulty || 110e12;
    const hashrate = mempoolData.hashrate || blockchainData.hashrate || 800e18;
    
    // Calculate block reward from block height
    const blockReward = getBlockReward(blockHeight);
    const halvingInfo = getHalvingInfo(blockHeight);
    
    // Get average block time from difficulty adjustment data
    let avgBlockTime = 10;
    if (mempoolData.difficultyAdjustment?.timeAvg) {
      avgBlockTime = Math.round(mempoolData.difficultyAdjustment.timeAvg / 60 * 10) / 10;
    }
    
    // Determine data source for transparency
    const dataSources = [];
    if (price > 0) dataSources.push('coinbase');
    if (mempoolData.blockHeight > 0) dataSources.push('mempool.space');
    if (blockchainData.blockHeight > 0 && !mempoolData.blockHeight) dataSources.push('blockchain.info');
    
    const result = {
      price,
      difficulty,
      hashrate,
      blockHeight,
      blockReward,
      avgBlockTime,
      nextHalvingDays: halvingInfo.daysUntilHalving,
      nextHalvingBlock: halvingInfo.nextHalvingBlock,
      blocksUntilHalving: halvingInfo.blocksUntilHalving,
      difficultyChange: mempoolData.difficultyAdjustment?.difficultyChange || 0,
      estimatedRetargetDate: mempoolData.difficultyAdjustment?.estimatedRetargetDate || null,
      lastUpdated: new Date().toISOString(),
      dataSource: dataSources.join(', ') || 'fallback',
      isLive: price > 0 && (mempoolData.blockHeight > 0 || blockchainData.blockHeight > 0)
    };
    
    console.log('BTC Network Data:', {
      price: result.price,
      difficulty: `${(result.difficulty / 1e12).toFixed(2)}T`,
      hashrate: `${(result.hashrate / 1e18).toFixed(2)} EH/s`,
      blockHeight: result.blockHeight,
      blockReward: result.blockReward,
      dataSource: result.dataSource,
      isLive: result.isLive
    });

    return new Response(
      JSON.stringify(result),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Cache-Control': 'max-age=60' // Cache for 1 minute
        } 
      }
    );

  } catch (error) {
    console.error('Error fetching Bitcoin network data:', error);
    
    // Return error response with fallback flag
    return new Response(
      JSON.stringify({
        error: 'Failed to fetch live data',
        message: error.message,
        isLive: false,
        // Provide reasonable fallback values (January 2026 estimates)
        price: 0,
        difficulty: 110e12,
        hashrate: 800e18,
        blockHeight: 878000,
        blockReward: 3.125,
        avgBlockTime: 10,
        nextHalvingDays: 800,
        lastUpdated: new Date().toISOString(),
        dataSource: 'error_fallback'
      }),
      { 
        status: 200, // Return 200 so frontend can use fallback values
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
})
