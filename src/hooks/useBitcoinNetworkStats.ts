 /**
  * Hook to fetch live Bitcoin network statistics from mempool.space
  * Used across Academy modules to ensure accurate, real-time data
  * 
  * Sources:
  * - mempool.space API for hashrate, difficulty, block data
  * - Coinbase API for BTC price
  * 
  * LAST VERIFIED: February 2026
  */
 
 import { useState, useEffect, useCallback } from 'react';
 
export interface BitcoinNetworkStats {
  hashrate: number; // in EH/s
  hashrateFormatted: string; // e.g., "850 EH/s"
  difficulty: number;
  blockHeight: number;
  blockReward: number; // BTC
  price: number; // USD
  nextHalvingDays: number;
  hashPrice: number; // USD per TH/s per day
  hashPriceFormatted: string; // e.g., "$0.052/TH/day"
  dailyBtcPerPH: number; // daily BTC earned per PH/s
  timestamp: Date;
  dataSource: 'live' | 'cached' | 'fallback';
  isLive: boolean;
}
 
 // Fallback values for when API is unavailable (updated Feb 2026)
// Helper to compute hash price from network stats
function computeHashPrice(hashrate: number, blockReward: number, price: number) {
  const blocksPerDay = 144;
  // hashrate in EH/s = 1e6 TH/s per EH/s
  const dailyBtcPerTH = (blocksPerDay * blockReward) / (hashrate * 1e6);
  const hashPrice = dailyBtcPerTH * price;
  const dailyBtcPerPH = dailyBtcPerTH * 1e3; // 1 PH = 1000 TH
  return { hashPrice, dailyBtcPerPH };
}

const FALLBACK_STATS: BitcoinNetworkStats = {
  hashrate: 850,
  hashrateFormatted: '~850 EH/s',
  difficulty: 115e12,
  blockHeight: 885000,
  blockReward: 3.125,
  price: 100000,
  nextHalvingDays: 800,
  hashPrice: computeHashPrice(850, 3.125, 100000).hashPrice,
  hashPriceFormatted: `~$${computeHashPrice(850, 3.125, 100000).hashPrice.toFixed(4)}/TH/day`,
  dailyBtcPerPH: computeHashPrice(850, 3.125, 100000).dailyBtcPerPH,
  timestamp: new Date(),
  dataSource: 'fallback',
  isLive: false,
};
 
 // Cache key and duration
 const CACHE_KEY = 'bitcoin_network_stats';
 const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes
 
 interface CachedStats {
   stats: BitcoinNetworkStats;
   cachedAt: number;
 }
 
 export const useBitcoinNetworkStats = () => {
   const [stats, setStats] = useState<BitcoinNetworkStats>(FALLBACK_STATS);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
 
   const fetchStats = useCallback(async () => {
     setLoading(true);
     setError(null);
 
     // Check cache first
     try {
       const cached = localStorage.getItem(CACHE_KEY);
       if (cached) {
         const { stats: cachedStats, cachedAt }: CachedStats = JSON.parse(cached);
         if (Date.now() - cachedAt < CACHE_DURATION_MS) {
           setStats({
             ...cachedStats,
             timestamp: new Date(cachedStats.timestamp),
             dataSource: 'cached',
           });
           setLoading(false);
           return;
         }
       }
     } catch (e) {
       console.warn('Cache read failed:', e);
     }
 
     let hashrate = 0;
     let difficulty = 0;
     let blockHeight = 0;
     let price = 0;
 
     // Fetch from mempool.space
     try {
       const [hashrateRes, heightRes] = await Promise.all([
         fetch('https://mempool.space/api/v1/mining/hashrate/3d'),
         fetch('https://mempool.space/api/blocks/tip/height'),
       ]);
 
       if (hashrateRes.ok) {
         const hrData = await hashrateRes.json();
         // mempool returns hashrate in H/s, convert to EH/s
         hashrate = (hrData.currentHashrate || 0) / 1e18;
         difficulty = hrData.currentDifficulty || 0;
       }
 
       if (heightRes.ok) {
         blockHeight = parseInt(await heightRes.text()) || 0;
       }
     } catch (e) {
       console.warn('mempool.space API failed:', e);
     }
 
     // Fetch BTC price from Coinbase
     try {
       const priceRes = await fetch('https://api.coinbase.com/v2/prices/BTC-USD/spot');
       if (priceRes.ok) {
         const priceData = await priceRes.json();
         price = parseFloat(priceData.data?.amount) || 0;
       }
     } catch (e) {
       console.warn('Coinbase API failed:', e);
     }
 
     // Calculate derived values
     const halvings = blockHeight > 0 ? Math.floor(blockHeight / 210000) : 4;
     const blockReward = 50 / Math.pow(2, halvings);
     const nextHalvingBlock = (halvings + 1) * 210000;
     const blocksUntilHalving = nextHalvingBlock - blockHeight;
     const nextHalvingDays = blockHeight > 0 
       ? Math.floor((blocksUntilHalving * 10) / (60 * 24)) 
       : FALLBACK_STATS.nextHalvingDays;
 
     const isLive = hashrate > 0;
     const finalHashrate = isLive ? hashrate : FALLBACK_STATS.hashrate;
 
    const finalPrice = price || FALLBACK_STATS.price;
    const finalBlockReward = blockReward || FALLBACK_STATS.blockReward;
    const { hashPrice: hp, dailyBtcPerPH } = computeHashPrice(finalHashrate, finalBlockReward, finalPrice);

    const newStats: BitcoinNetworkStats = {
      hashrate: finalHashrate,
      hashrateFormatted: isLive 
        ? `${Math.round(finalHashrate)} EH/s` 
        : `~${Math.round(finalHashrate)} EH/s`,
      difficulty: difficulty || FALLBACK_STATS.difficulty,
      blockHeight: blockHeight || FALLBACK_STATS.blockHeight,
      blockReward: finalBlockReward,
      price: finalPrice,
      nextHalvingDays,
      hashPrice: hp,
      hashPriceFormatted: isLive
        ? `$${hp.toFixed(4)}/TH/day`
        : `~$${hp.toFixed(4)}/TH/day`,
      dailyBtcPerPH,
      timestamp: new Date(),
      dataSource: isLive ? 'live' : 'fallback',
      isLive,
    };
 
     setStats(newStats);
     setLoading(false);
 
     // Cache the result
     if (isLive) {
       try {
         localStorage.setItem(CACHE_KEY, JSON.stringify({
           stats: newStats,
           cachedAt: Date.now(),
         }));
       } catch (e) {
         console.warn('Cache write failed:', e);
       }
     }
   }, []);
 
   useEffect(() => {
     fetchStats();
   }, [fetchStats]);
 
   return {
     stats,
     loading,
     error,
     refetch: fetchStats,
   };
 };
 
 export default useBitcoinNetworkStats;