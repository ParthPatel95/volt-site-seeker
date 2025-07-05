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
    <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 cursor-pointer bg-gradient-to-br from-white to-gray-50/50 border-0 shadow-lg">
      <div className="absolute inset-0 bg-watt-gradient opacity-0 group-hover:opacity-5 transition-opacity rounded-lg"></div>
      <CardHeader className="relative pb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-watt-primary/10 rounded-2xl group-hover:scale-110 transition-transform duration-300">
              <Bitcoin className="w-6 h-6 text-watt-primary" />
            </div>
            <div>
              <CardTitle className="text-gray-900 text-xl group-hover:text-watt-primary transition-colors">BTC Mining ROI Lab</CardTitle>
              <p className="text-gray-600 text-sm">Calculate mining profitability with real-time data</p>
            </div>
          </div>
          <Badge className="bg-watt-success/10 text-watt-success text-xs border-watt-success/20">
            <div className="w-2 h-2 bg-watt-success rounded-full mr-2 animate-pulse"></div>
            Live
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Live Bitcoin Data */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-watt-primary/5 to-watt-primary/10 rounded-lg p-4 hover:from-watt-primary/10 hover:to-watt-primary/15 transition-colors duration-200 border border-watt-primary/20">
            <div className="flex items-center space-x-2 mb-2">
              <Bitcoin className="w-4 h-4 text-watt-primary" />
              <span className="text-gray-600 text-sm">BTC Price</span>
            </div>
            <div className="text-2xl font-bold text-watt-primary">
              {isLoading ? (
                <div className="animate-pulse bg-watt-primary/20 h-8 w-24 rounded"></div>
              ) : (
                `$${btcData.price.toLocaleString()}`
              )}
            </div>
            <div className="text-xs text-gray-500 mt-1">Live Market Price</div>
          </div>
          
          <div className="bg-gradient-to-br from-watt-secondary/5 to-watt-secondary/10 rounded-lg p-4 hover:from-watt-secondary/10 hover:to-watt-secondary/15 transition-colors duration-200 border border-watt-secondary/20">
            <div className="flex items-center space-x-2 mb-2">
              <Hash className="w-4 h-4 text-watt-secondary" />
              <span className="text-gray-600 text-sm">Difficulty</span>
            </div>
            <div className="text-2xl font-bold text-watt-secondary">
              {isLoading ? (
                <div className="animate-pulse bg-watt-secondary/20 h-8 w-20 rounded"></div>
              ) : (
                `${(btcData.difficulty / 1e12).toFixed(1)}T`
              )}
            </div>
            <div className="text-xs text-gray-500 mt-1">Network Difficulty</div>
          </div>
        </div>

        {/* User Inputs */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Your Mining Setup</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-2">Hashrate (TH/s)</label>
              <Input
                type="number"
                value={hashrate}
                onChange={(e) => setHashrate(e.target.value)}
                className="bg-white/70 border-watt-primary/20 text-gray-900 focus:border-watt-primary"
                placeholder="200"
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-600 mb-2">Energy Rate ($/kWh)</label>
              <Input
                type="number"
                step="0.001"
                value={energyRate}
                onChange={(e) => setEnergyRate(e.target.value)}
                className="bg-white/70 border-watt-primary/20 text-gray-900 focus:border-watt-primary"
                placeholder="0.08"
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-600 mb-2">Power Draw (W)</label>
              <Input
                type="number"
                value={powerDraw}
                onChange={(e) => setPowerDraw(e.target.value)}
                className="bg-white/70 border-watt-primary/20 text-gray-900 focus:border-watt-primary"
                placeholder="3400"
              />
            </div>
          </div>
          
          <Button 
            onClick={calculateProfitability}
            className="w-full bg-watt-gradient hover:opacity-90 text-white"
            disabled={isLoading}
          >
            <Calculator className="w-4 h-4 mr-2" />
            Recalculate Profitability
          </Button>
        </div>

        {/* Profitability Results */}
        {profitability && (
          <div className="space-y-4 pt-4 border-t border-watt-primary/20">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Profitability Analysis</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-watt-success/5 to-watt-success/10 rounded-lg p-4 border border-watt-success/20">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-watt-success" />
                  <span className="text-gray-600 text-sm">Daily Profit</span>
                </div>
                <div className={`text-2xl font-bold ${profitability.dailyProfit > 0 ? 'text-watt-success' : 'text-red-500'}`}>
                  ${profitability.dailyProfit.toFixed(2)}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Revenue: ${profitability.dailyRevenue.toFixed(2)} | 
                  Power: ${profitability.dailyPowerCost.toFixed(2)}
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-watt-accent/5 to-watt-accent/10 rounded-lg p-4 border border-watt-accent/20">
                <div className="flex items-center space-x-2 mb-2">
                  <Zap className="w-4 h-4 text-watt-accent" />
                  <span className="text-gray-600 text-sm">Monthly Profit</span>
                </div>
                <div className={`text-2xl font-bold ${profitability.monthlyProfit > 0 ? 'text-watt-accent' : 'text-red-500'}`}>
                  ${profitability.monthlyProfit.toFixed(0)}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  12-Month ROI: {profitability.yearlyROI.toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="text-xs text-gray-500 pt-3 border-t border-watt-primary/20">
          * Calculations assume current network conditions and do not account for difficulty changes
        </div>
      </CardContent>
    </Card>
  );
};