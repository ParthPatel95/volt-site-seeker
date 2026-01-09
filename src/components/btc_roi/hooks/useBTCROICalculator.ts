import { useState, useEffect, useCallback } from 'react';
import { BTCNetworkData, BTCROIFormData, BTCROIResults, HostingROIResults } from '../types/btc_roi_types';
import { HostingCalculatorService } from '../services/hostingCalculatorService';
import { useStoredCalculationsDB } from './useStoredCalculationsDB';
import { supabase } from '@/integrations/supabase/client';

interface NetworkDataResponse {
  price: number;
  difficulty: number;
  hashrate: number;
  blockHeight: number;
  blockReward: number;
  avgBlockTime: number;
  nextHalvingDays: number;
  nextHalvingBlock: number;
  blocksUntilHalving: number;
  difficultyChange?: number;
  estimatedRetargetDate?: string;
  lastUpdated: string;
  dataSource: string;
  isLive: boolean;
}

// Fetch real network data from edge function
const fetchNetworkData = async (): Promise<BTCNetworkData & { dataSource: string; isLive: boolean }> => {
  console.log('Fetching live Bitcoin network data from edge function...');
  
  try {
    const { data, error } = await supabase.functions.invoke<NetworkDataResponse>('fetch-btc-network-data');
    
    if (error) {
      console.error('Edge function error:', error);
      throw new Error('Failed to fetch network data');
    }
    
    if (!data) {
      throw new Error('No data returned from edge function');
    }
    
    console.log('Live network data received:', {
      price: data.price,
      difficulty: `${(data.difficulty / 1e12).toFixed(2)}T`,
      hashrate: `${(data.hashrate / 1e18).toFixed(2)} EH/s`,
      blockReward: data.blockReward,
      dataSource: data.dataSource,
      isLive: data.isLive
    });
    
    return {
      price: data.price,
      difficulty: data.difficulty,
      hashrate: data.hashrate,
      blockReward: data.blockReward,
      avgBlockTime: data.avgBlockTime,
      nextHalvingDays: data.nextHalvingDays,
      lastUpdate: new Date(data.lastUpdated),
      dataSource: data.dataSource,
      isLive: data.isLive
    };
  } catch (error) {
    console.error('Failed to fetch from edge function, trying direct API calls:', error);
    
    // Fallback: Try direct API calls
    let price = 0;
    let difficulty = 0;
    let hashrate = 0;
    let blockHeight = 0;
    
    // Try Coinbase for price
    try {
      const priceRes = await fetch('https://api.coinbase.com/v2/prices/BTC-USD/spot');
      if (priceRes.ok) {
        const priceData = await priceRes.json();
        price = parseFloat(priceData.data?.amount) || 0;
      }
    } catch (e) {
      console.warn('Coinbase API failed:', e);
    }
    
    // Try mempool.space for network data
    try {
      const [heightRes, hashrateRes] = await Promise.all([
        fetch('https://mempool.space/api/blocks/tip/height'),
        fetch('https://mempool.space/api/v1/mining/hashrate/3d')
      ]);
      
      if (heightRes.ok) {
        blockHeight = parseInt(await heightRes.text()) || 0;
      }
      
      if (hashrateRes.ok) {
        const hrData = await hashrateRes.json();
        hashrate = hrData.currentHashrate || 0;
        difficulty = hrData.currentDifficulty || 0;
      }
    } catch (e) {
      console.warn('mempool.space API failed:', e);
    }
    
    // Calculate block reward from height
    const halvings = Math.floor(blockHeight / 210000);
    const blockReward = 50 / Math.pow(2, halvings);
    
    // Calculate days to halving
    const nextHalvingBlock = (halvings + 1) * 210000;
    const blocksUntilHalving = nextHalvingBlock - blockHeight;
    const nextHalvingDays = Math.floor((blocksUntilHalving * 10) / (60 * 24));
    
    return {
      price,
      difficulty: difficulty || 110e12,
      hashrate: hashrate || 800e18,
      blockReward: blockReward || 3.125,
      avgBlockTime: 10,
      nextHalvingDays: nextHalvingDays || 800,
      lastUpdate: new Date(),
      dataSource: price > 0 ? 'direct_api' : 'fallback',
      isLive: price > 0 && (difficulty > 0 || hashrate > 0)
    };
  }
};

export const useBTCROICalculator = () => {
  const [networkData, setNetworkData] = useState<(BTCNetworkData & { dataSource?: string; isLive?: boolean }) | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roiResults, setRoiResults] = useState<BTCROIResults | null>(null);
  const [hostingResults, setHostingResults] = useState<HostingROIResults | null>(null);
  
  const { saveCalculation: saveToDatabase } = useStoredCalculationsDB();

  const [formData, setFormData] = useState<BTCROIFormData>({
    asicModel: 'Antminer S21 Pro',
    hashrate: 234, // TH/s - S21 Pro default
    powerDraw: 3531, // Watts
    units: 1,
    hardwareCost: 5000, // USD per unit
    hostingRate: 0.06, // USD per kWh
    powerRate: 0.05, // USD per kWh
    hostingFee: 50, // USD per month per unit
    poolFee: 1.5, // percentage
    coolingOverhead: 15, // percentage
    efficiencyOverride: 100, // percentage
    resaleValue: 20, // percentage
    maintenancePercent: 2, // percentage
    
    // Hosting-specific fields
    hostingFeeRate: 0.08, // USD per kWh charged to clients
    region: 'AESO',
    customElectricityCost: 0.05,
    totalLoadKW: 325, // 100 units * 3.25kW each
    infrastructureCost: 500000,
    monthlyOverhead: 15000,
    powerOverheadPercent: 10,
    expectedUptimePercent: 98,
    
    // Manual energy cost overrides
    useManualEnergyCosts: false,
    manualEnergyRate: 0.04,
    manualTransmissionRate: 0.01,
    manualDistributionRate: 0.005,
    manualAncillaryRate: 0.003,
    manualRegulatoryRate: 0.002
  });

  // Load network data function
  const loadNetworkData = useCallback(async (showRefreshState = false) => {
    if (showRefreshState) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);
    
    try {
      const data = await fetchNetworkData();
      setNetworkData(data);
      
      if (!data.isLive) {
        setError('Using estimated data - live feeds unavailable');
      }
    } catch (err) {
      console.error('Error loading network data:', err);
      setError('Failed to fetch network data. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Refresh network data (for user-triggered refresh)
  const refreshNetworkData = useCallback(async () => {
    await loadNetworkData(true);
  }, [loadNetworkData]);

  // Load network data on mount
  useEffect(() => {
    loadNetworkData();
    
    // Update network data every 5 minutes
    const interval = setInterval(() => loadNetworkData(false), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadNetworkData]);

  const calculateMiningROI = () => {
    if (!networkData) return;

    setIsLoading(true);
    try {
      // Basic mining calculations
      const totalHashrate = formData.hashrate * formData.units * 1e12; // Convert TH/s to H/s
      const dailyBTC = (totalHashrate / networkData.hashrate) * 144 * networkData.blockReward;
      const dailyRevenue = dailyBTC * networkData.price;
      
      const totalPowerKW = (formData.powerDraw * formData.units) / 1000;
      const dailyPowerCost = totalPowerKW * 24 * formData.powerRate;
      const dailyPoolFees = dailyRevenue * (formData.poolFee / 100);
      
      const dailyNetProfit = dailyRevenue - dailyPowerCost - dailyPoolFees;
      const monthlyNetProfit = dailyNetProfit * 30;
      const yearlyNetProfit = dailyNetProfit * 365;
      
      const totalInvestment = formData.hardwareCost * formData.units;
      const breakEvenDays = totalInvestment / Math.max(dailyNetProfit, 0.01);
      const roi12Month = (yearlyNetProfit / totalInvestment) * 100;

      const results: BTCROIResults = {
        dailyBTCMined: dailyBTC,
        dailyRevenue,
        dailyPowerCost,
        dailyPoolFees,
        dailyNetProfit,
        monthlyRevenue: dailyRevenue * 30,
        monthlyPowerCost: dailyPowerCost * 30,
        monthlyPoolFees: dailyPoolFees * 30,
        monthlyNetProfit,
        yearlyRevenue: dailyRevenue * 365,
        yearlyPowerCost: dailyPowerCost * 365,
        yearlyPoolFees: dailyPoolFees * 365,
        yearlyNetProfit,
        breakEvenDays,
        roi12Month,
        totalInvestment
      };

      setRoiResults(results);
      setHostingResults(null);
    } catch (error) {
      console.error('Error calculating mining ROI:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateHostingROI = async () => {
    if (!networkData) return;

    setIsLoading(true);
    try {
      const results = await HostingCalculatorService.calculateHostingROI(formData);
      setHostingResults(results);
      setRoiResults(null);
    } catch (error) {
      console.error('Error calculating hosting ROI:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveCurrentCalculation = async (miningMode: 'hosting' | 'self', siteName?: string) => {
    if (!networkData) {
      console.error('No network data available');
      return;
    }

    const results = miningMode === 'hosting' ? hostingResults : roiResults;
    if (!results) {
      console.error('No calculation results available');
      return;
    }

    try {
      await saveToDatabase(miningMode, formData, networkData, results, siteName);
    } catch (error) {
      console.error('Error saving calculation:', error);
    }
  };

  return {
    networkData,
    formData,
    setFormData,
    roiResults,
    hostingResults,
    calculateMiningROI,
    calculateHostingROI,
    saveCurrentCalculation,
    refreshNetworkData,
    isLoading,
    isRefreshing,
    error
  };
};
