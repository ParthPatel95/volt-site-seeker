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
    <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 hover:border-neon-green/30 transition-all duration-300 group">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bitcoin className="w-6 h-6 text-neon-green group-hover:scale-110 transition-transform duration-300" />
            <CardTitle className="text-white text-xl">BTC Mining ROI Lab</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse"></div>
            <Badge className="bg-neon-green/20 text-neon-green text-xs border-neon-green/30">Live</Badge>
          </div>
        </div>
        <p className="text-slate-300 text-sm">Calculate mining profitability with real-time data</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Live Bitcoin Data - 2x2 Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-800/30 rounded-lg p-4 transition-all duration-500 border border-slate-700/30 hover:border-electric-blue/30">
            <div className="flex items-center space-x-2 mb-2">
              <Bitcoin className="w-4 h-4 text-electric-blue flex-shrink-0" />
              <span className="text-xs text-slate-400">BTC Price</span>
            </div>
            <div className="text-lg font-bold text-electric-blue break-words">
              {isLoading ? (
                <div className="animate-pulse bg-electric-blue/20 h-6 w-20 rounded"></div>
              ) : (
                `$${btcData.price.toLocaleString()}`
              )}
            </div>
          </div>
          
          <div className="bg-slate-800/30 rounded-lg p-4 transition-all duration-500 border border-slate-700/30 hover:border-electric-yellow/30">
            <div className="flex items-center space-x-2 mb-2">
              <Hash className="w-4 h-4 text-electric-yellow flex-shrink-0" />
              <span className="text-xs text-slate-400">Difficulty</span>
            </div>
            <div className="text-lg font-bold text-electric-yellow break-words">
              {isLoading ? (
                <div className="animate-pulse bg-electric-yellow/20 h-6 w-16 rounded"></div>
              ) : (
                `${(btcData.difficulty / 1e12).toFixed(1)}T`
              )}
            </div>
          </div>
          
          <div className="bg-slate-800/30 rounded-lg p-4 transition-all duration-500 border border-slate-700/30 hover:border-neon-green/30">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-4 h-4 text-neon-green flex-shrink-0" />
              <span className="text-xs text-slate-400">Daily Profit</span>
            </div>
            <div className="text-lg font-bold text-neon-green break-words">
              {profitability ? `$${profitability.dailyProfit.toFixed(2)}` : '$0.00'}
            </div>
          </div>
          
          <div className="bg-slate-800/30 rounded-lg p-4 transition-all duration-500 border border-slate-700/30 hover:border-warm-orange/30">
            <div className="flex items-center space-x-2 mb-2">
              <Zap className="w-4 h-4 text-warm-orange flex-shrink-0" />
              <span className="text-xs text-slate-400">Monthly</span>
            </div>
            <div className="text-lg font-bold text-warm-orange break-words">
              {profitability ? `$${profitability.monthlyProfit.toFixed(0)}` : '$0'}
            </div>
          </div>
        </div>

        {/* Mining Setup Configuration */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-200">Your Mining Setup</h4>
            <Badge className="bg-electric-blue/20 text-electric-blue text-xs border-electric-blue/30">Configure</Badge>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Hashrate (TH/s)</label>
              <Input
                type="number"
                value={hashrate}
                onChange={(e) => setHashrate(e.target.value)}
                className="bg-slate-800/20 border-slate-700/30 text-white text-sm focus:border-electric-blue/50 focus:ring-electric-blue/20"
                placeholder="200"
              />
            </div>
            
            <div>
              <label className="block text-xs text-slate-400 mb-1">Energy ($/kWh)</label>
              <Input
                type="number"
                step="0.001"
                value={energyRate}
                onChange={(e) => setEnergyRate(e.target.value)}
                className="bg-slate-800/20 border-slate-700/30 text-white text-sm focus:border-electric-blue/50 focus:ring-electric-blue/20"
                placeholder="0.08"
              />
            </div>
            
            <div>
              <label className="block text-xs text-slate-400 mb-1">Power (W)</label>
              <Input
                type="number"
                value={powerDraw}
                onChange={(e) => setPowerDraw(e.target.value)}
                className="bg-slate-800/20 border-slate-700/30 text-white text-sm focus:border-electric-blue/50 focus:ring-electric-blue/20"
                placeholder="3400"
              />
            </div>
          </div>
          
          <Button 
            onClick={calculateProfitability}
            className="w-full bg-neon-green/20 hover:bg-neon-green/30 text-neon-green border border-neon-green/30 transition-colors"
            variant="outline"
            disabled={isLoading}
          >
            <Calculator className="w-4 h-4 mr-2" />
            Recalculate ROI
          </Button>
        </div>

        <div className="text-xs text-slate-300 pt-3 border-t border-slate-700/30">
          * Calculations based on current network conditions. Results may vary with difficulty changes.
        </div>
      </CardContent>
    </Card>
  );
};