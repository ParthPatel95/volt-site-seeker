
import { useState, useEffect } from 'react';
import { BTCNetworkData, BTCROIFormData, BTCROIResults, HostingROIResults } from '../types/btc_roi_types';
import { HostingCalculatorService } from '../services/hostingCalculatorService';
import { useStoredCalculationsDB } from './useStoredCalculationsDB';

// Calculate days until next halving (April 2028, block 1,050,000)
const calculateDaysToHalving = (): number => {
  const nextHalvingDate = new Date('2028-04-15'); // Approximate next halving
  const now = new Date();
  const diffTime = nextHalvingDate.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
};

// Fetch real network data with multiple API fallbacks
const fetchNetworkData = async (): Promise<BTCNetworkData> => {
  let price = 97000; // Current fallback price (Dec 2024)
  
  // Try to fetch BTC price from Coinbase
  try {
    const btcPriceResponse = await fetch('https://api.coinbase.com/v2/prices/BTC-USD/spot');
    const priceData = await btcPriceResponse.json();
    price = parseFloat(priceData.data.amount) || price;
  } catch (error) {
    console.warn('Coinbase API failed, using fallback price:', error);
  }

  // Current network data (December 2024 - post-halving April 2024)
  return {
    price,
    difficulty: 103.92e12, // ~104T difficulty (Dec 2024)
    hashrate: 750e18, // ~750 EH/s (Dec 2024)
    blockReward: 3.125, // Post-halving reward (April 2024)
    avgBlockTime: 10,
    nextHalvingDays: calculateDaysToHalving(),
    lastUpdate: new Date()
  };
};

export const useBTCROICalculator = () => {
  const [networkData, setNetworkData] = useState<BTCNetworkData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [roiResults, setRoiResults] = useState<BTCROIResults | null>(null);
  const [hostingResults, setHostingResults] = useState<HostingROIResults | null>(null);
  
  const { saveCalculation: saveToDatabase } = useStoredCalculationsDB();

  const [formData, setFormData] = useState<BTCROIFormData>({
    asicModel: 'Antminer S19 Pro',
    hashrate: 110, // TH/s
    powerDraw: 3250, // Watts
    units: 100,
    hardwareCost: 2500, // USD per unit
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

  // Load network data on mount
  useEffect(() => {
    const loadNetworkData = async () => {
      setIsLoading(true);
      try {
        const data = await fetchNetworkData();
        setNetworkData(data);
      } catch (error) {
        console.error('Error loading network data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadNetworkData();
    
    // Update network data every 5 minutes
    const interval = setInterval(loadNetworkData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

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
    isLoading
  };
};
