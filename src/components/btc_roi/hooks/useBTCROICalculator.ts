
import { useState, useEffect } from 'react';
import { BTCNetworkData, BTCROIFormData, BTCROIResults } from '../types/btc_roi_types';

export const useBTCROICalculator = () => {
  const [networkData, setNetworkData] = useState<BTCNetworkData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [roiResults, setROIResults] = useState<BTCROIResults | null>(null);
  
  const [formData, setFormData] = useState<BTCROIFormData>({
    asicModel: '',
    hashrate: 200, // TH/s
    powerDraw: 3400, // Watts
    units: 1,
    hardwareCost: 3500,
    hostingRate: 0.08, // $0.08 per kWh
    powerRate: 0.12, // $0.12 per kWh for self-mining
    hostingFee: 50, // $50 per month per unit
    poolFee: 1.5, // 1.5%
    coolingOverhead: 10, // 10%
    efficiencyOverride: 100, // 100%
    resaleValue: 20, // 20%
    maintenancePercent: 2 // 2%
  });

  // Fetch live Bitcoin network data
  const fetchNetworkData = async () => {
    try {
      // Coinbase API for BTC price
      const priceResponse = await fetch('https://api.coinbase.com/v2/prices/spot?currency=USD');
      const priceData = await priceResponse.json();
      const btcPrice = parseFloat(priceData.data.amount);

      // Mock API calls for other data (in production, use real APIs)
      const mockNetworkData: BTCNetworkData = {
        price: btcPrice,
        difficulty: 62.46e12, // Current approximate difficulty
        hashrate: 450e18, // ~450 EH/s
        blockReward: 6.25, // Current block reward
        avgBlockTime: 10, // 10 minutes
        nextHalvingDays: 1200, // Approximate days to next halving
        lastUpdate: new Date()
      };

      setNetworkData(mockNetworkData);
    } catch (error) {
      console.error('Error fetching network data:', error);
      // Fallback data
      setNetworkData({
        price: 45000,
        difficulty: 62.46e12,
        hashrate: 450e18,
        blockReward: 6.25,
        avgBlockTime: 10,
        nextHalvingDays: 1200,
        lastUpdate: new Date()
      });
    }
  };

  // Calculate ROI based on form data and network data
  const calculateROI = () => {
    if (!networkData) return;
    
    setIsLoading(true);
    
    try {
      // Basic calculations
      const hashrateInHs = formData.hashrate * 1e12; // Convert TH/s to H/s
      const networkHashrate = networkData.hashrate;
      const dailyBlocks = 24 * 60 / networkData.avgBlockTime; // blocks per day
      
      // Daily BTC mined per unit
      const dailyBTCMined = (hashrateInHs / networkHashrate) * dailyBlocks * networkData.blockReward * formData.units;
      
      // Daily revenue
      const dailyRevenue = dailyBTCMined * networkData.price;
      
      // Daily power cost
      const powerKW = (formData.powerDraw * formData.units) / 1000; // Convert to kW
      const coolingMultiplier = 1 + (formData.coolingOverhead / 100);
      const totalPowerKW = powerKW * coolingMultiplier;
      const powerRate = formData.hostingRate || formData.powerRate;
      const dailyPowerCost = totalPowerKW * 24 * powerRate;
      
      // Pool fees
      const dailyPoolFees = dailyRevenue * (formData.poolFee / 100);
      
      // Net profit
      const dailyNetProfit = dailyRevenue - dailyPowerCost - dailyPoolFees;
      
      // Monthly and yearly calculations
      const monthlyRevenue = dailyRevenue * 30;
      const monthlyPowerCost = dailyPowerCost * 30;
      const monthlyPoolFees = dailyPoolFees * 30;
      const monthlyNetProfit = dailyNetProfit * 30;
      
      const yearlyRevenue = dailyRevenue * 365;
      const yearlyPowerCost = dailyPowerCost * 365;
      const yearlyPoolFees = dailyPoolFees * 365;
      const yearlyNetProfit = dailyNetProfit * 365;
      
      // Total investment and break-even
      const totalInvestment = formData.hardwareCost * formData.units;
      const breakEvenDays = totalInvestment / (dailyNetProfit > 0 ? dailyNetProfit : 1);
      
      // 12-month ROI
      const roi12Month = ((yearlyNetProfit / totalInvestment) * 100);
      
      const results: BTCROIResults = {
        dailyBTCMined,
        dailyRevenue,
        dailyPowerCost,
        dailyPoolFees,
        dailyNetProfit,
        monthlyRevenue,
        monthlyPowerCost,
        monthlyPoolFees,
        monthlyNetProfit,
        yearlyRevenue,
        yearlyPowerCost,
        yearlyPoolFees,
        yearlyNetProfit,
        breakEvenDays,
        roi12Month,
        totalInvestment
      };
      
      setROIResults(results);
    } catch (error) {
      console.error('Error calculating ROI:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch network data on component mount and every 60 seconds
  useEffect(() => {
    fetchNetworkData();
    const interval = setInterval(fetchNetworkData, 60000);
    return () => clearInterval(interval);
  }, []);

  return {
    networkData,
    formData,
    setFormData,
    roiResults,
    calculateROI,
    isLoading
  };
};
