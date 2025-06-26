
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Bitcoin, Calculator, TrendingUp, Zap, Hash } from 'lucide-react';

interface BTCData {
  price: number;
  difficulty: number;
}

export const BTCMiningROIWidget = () => {
  const [btcData, setBtcData] = useState<BTCData>({ price: 0, difficulty: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [hashrate, setHashrate] = useState<string>('200'); // TH/s
  const [energyRate, setEnergyRate] = useState<string>('0.08'); // USD per kWh
  const [powerDraw, setPowerDraw] = useState<string>('3400'); // Watts
  const [profitability, setProfitability] = useState<{
    dailyRevenue: number;
    dailyPowerCost: number;
    dailyProfit: number;
    monthlyProfit: number;
    yearlyROI: number;
  } | null>(null);

  // Fetch live BTC data
  useEffect(() => {
    const fetchBTCData = async () => {
      try {
        // Fetch BTC price from Coinbase
        const priceResponse = await fetch('https://api.coinbase.com/v2/prices/spot?currency=USD');
        const priceData = await priceResponse.json();
        const btcPrice = parseFloat(priceData.data.amount);

        // Mock difficulty data (in production, use real API)
        const difficulty = 68.5e12; // Current approximate difficulty

        setBtcData({ price: btcPrice, difficulty });
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching BTC data:', error);
        // Fallback data
        setBtcData({ price: 45000, difficulty: 68.5e12 });
        setIsLoading(false);
      }
    };

    fetchBTCData();
    const interval = setInterval(fetchBTCData, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  // Calculate profitability automatically when BTC data loads or inputs change
  useEffect(() => {
    if (!isLoading && btcData.price > 0) {
      calculateProfitability();
    }
  }, [btcData, hashrate, energyRate, powerDraw, isLoading]);

  const calculateProfitability = () => {
    const hashrateValue = parseFloat(hashrate);
    const energyRateValue = parseFloat(energyRate);
    const powerDrawValue = parseFloat(powerDraw);

    if (!hashrateValue || !energyRateValue || !powerDrawValue || !btcData.price) return;

    // Constants
    const networkHashrate = 450e18; // ~450 EH/s
    const blockReward = 6.25; // BTC
    const blocksPerDay = 144; // 10 min average
    
    // Calculations
    const hashrateInHs = hashrateValue * 1e12; // Convert TH/s to H/s
    const dailyBTC = (hashrateInHs / networkHashrate) * blocksPerDay * blockReward;
    const dailyRevenue = dailyBTC * btcData.price;
    
    const powerKW = powerDrawValue / 1000;
    const dailyPowerCost = powerKW * 24 * energyRateValue;
    
    const dailyProfit = dailyRevenue - dailyPowerCost;
    const monthlyProfit = dailyProfit * 30;
    
    // Assuming $10k hardware cost for ROI calculation
    const hardwareCost = 10000;
    const yearlyProfit = dailyProfit * 365;
    const yearlyROI = (yearlyProfit / hardwareCost) * 100;

    setProfitability({
      dailyRevenue,
      dailyPowerCost,
      dailyProfit,
      monthlyProfit,
      yearlyROI
    });
  };

  return (
    <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 hover:border-electric-blue/30 transition-all duration-300 group">
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-2 mb-2">
          <Bitcoin className="w-6 h-6 text-orange-500 group-hover:scale-110 transition-transform duration-300" />
          <CardTitle className="text-white text-xl">BTC Mining ROI Lab</CardTitle>
          <Badge className="bg-neon-green/20 text-neon-green text-xs border-neon-green/30">Live</Badge>
        </div>
        <p className="text-slate-300 text-sm">Calculate mining profitability with real-time data</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Live Bitcoin Data */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-800/30 rounded-lg p-4 hover:bg-slate-800/50 transition-colors duration-200 border border-slate-700/30 hover:border-orange-500/30">
            <div className="flex items-center space-x-2 mb-2">
              <Bitcoin className="w-4 h-4 text-orange-500" />
              <span className="text-slate-300 text-sm">BTC Price</span>
            </div>
            <div className="text-2xl font-bold text-orange-500">
              {isLoading ? (
                <div className="animate-pulse bg-slate-700 h-8 w-24 rounded"></div>
              ) : (
                `$${btcData.price.toLocaleString()}`
              )}
            </div>
            <div className="text-xs text-slate-400 mt-1">Live Market Price</div>
          </div>
          
          <div className="bg-slate-800/30 rounded-lg p-4 hover:bg-slate-800/50 transition-colors duration-200 border border-slate-700/30 hover:border-purple-500/30">
            <div className="flex items-center space-x-2 mb-2">
              <Hash className="w-4 h-4 text-purple-500" />
              <span className="text-slate-300 text-sm">Difficulty</span>
            </div>
            <div className="text-2xl font-bold text-purple-500">
              {isLoading ? (
                <div className="animate-pulse bg-slate-700 h-8 w-20 rounded"></div>
              ) : (
                `${(btcData.difficulty / 1e12).toFixed(1)}T`
              )}
            </div>
            <div className="text-xs text-slate-400 mt-1">Network Difficulty</div>
          </div>
        </div>

        {/* User Inputs */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white mb-3">Your Mining Setup</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-slate-300 mb-2">Hashrate (TH/s)</label>
              <Input
                type="number"
                value={hashrate}
                onChange={(e) => setHashrate(e.target.value)}
                className="bg-slate-700/50 border-slate-600 text-white"
                placeholder="200"
              />
            </div>
            
            <div>
              <label className="block text-sm text-slate-300 mb-2">Energy Rate ($/kWh)</label>
              <Input
                type="number"
                step="0.001"
                value={energyRate}
                onChange={(e) => setEnergyRate(e.target.value)}
                className="bg-slate-700/50 border-slate-600 text-white"
                placeholder="0.08"
              />
            </div>
            
            <div>
              <label className="block text-sm text-slate-300 mb-2">Power Draw (W)</label>
              <Input
                type="number"
                value={powerDraw}
                onChange={(e) => setPowerDraw(e.target.value)}
                className="bg-slate-700/50 border-slate-600 text-white"
                placeholder="3400"
              />
            </div>
          </div>
          
          <Button 
            onClick={calculateProfitability}
            className="w-full bg-electric-blue hover:bg-electric-blue/80 text-white"
            disabled={isLoading}
          >
            <Calculator className="w-4 h-4 mr-2" />
            Recalculate Profitability
          </Button>
        </div>

        {/* Profitability Results */}
        {profitability && (
          <div className="space-y-4 pt-4 border-t border-slate-700/30">
            <h3 className="text-lg font-semibold text-white mb-3">Profitability Analysis</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/30">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-neon-green" />
                  <span className="text-slate-300 text-sm">Daily Profit</span>
                </div>
                <div className={`text-2xl font-bold ${profitability.dailyProfit > 0 ? 'text-neon-green' : 'text-red-400'}`}>
                  ${profitability.dailyProfit.toFixed(2)}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Revenue: ${profitability.dailyRevenue.toFixed(2)} | 
                  Power: ${profitability.dailyPowerCost.toFixed(2)}
                </div>
              </div>
              
              <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/30">
                <div className="flex items-center space-x-2 mb-2">
                  <Zap className="w-4 h-4 text-electric-blue" />
                  <span className="text-slate-300 text-sm">Monthly Profit</span>
                </div>
                <div className={`text-2xl font-bold ${profitability.monthlyProfit > 0 ? 'text-electric-blue' : 'text-red-400'}`}>
                  ${profitability.monthlyProfit.toFixed(0)}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  12-Month ROI: {profitability.yearlyROI.toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="text-xs text-slate-500 pt-3 border-t border-slate-700/30">
          * Calculations assume current network conditions and do not account for difficulty changes
        </div>
      </CardContent>
    </Card>
  );
};
