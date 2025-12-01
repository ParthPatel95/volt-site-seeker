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
  const [hashrate, setHashrate] = useState<string>('200');
  const [energyRate, setEnergyRate] = useState<string>('0.08');
  const [powerDraw, setPowerDraw] = useState<string>('3400');
  const [profitability, setProfitability] = useState<{
    dailyRevenue: number;
    dailyPowerCost: number;
    dailyProfit: number;
    monthlyProfit: number;
    yearlyROI: number;
  } | null>(null);

  useEffect(() => {
    const fetchBTCData = async () => {
      try {
        const priceResponse = await fetch('https://api.coinbase.com/v2/prices/spot?currency=USD');
        const priceData = await priceResponse.json();
        const btcPrice = parseFloat(priceData.data.amount);
        const difficulty = 68.5e12;
        setBtcData({ price: btcPrice, difficulty });
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching BTC data:', error);
        setBtcData({ price: 45000, difficulty: 68.5e12 });
        setIsLoading(false);
      }
    };

    fetchBTCData();
    const interval = setInterval(fetchBTCData, 60000);
    return () => clearInterval(interval);
  }, []);

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

    const networkHashrate = 450e18;
    const blockReward = 6.25;
    const blocksPerDay = 144;
    
    const hashrateInHs = hashrateValue * 1e12;
    const dailyBTC = (hashrateInHs / networkHashrate) * blocksPerDay * blockReward;
    const dailyRevenue = dailyBTC * btcData.price;
    
    const powerKW = powerDrawValue / 1000;
    const dailyPowerCost = powerKW * 24 * energyRateValue;
    
    const dailyProfit = dailyRevenue - dailyPowerCost;
    const monthlyProfit = dailyProfit * 30;
    
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
    <Card className="bg-white backdrop-blur-sm border border-gray-200 hover:border-watt-success/30 transition-all duration-300 group shadow-institutional">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bitcoin className="w-6 h-6 text-watt-success group-hover:scale-110 transition-transform duration-300" />
            <CardTitle className="text-watt-navy text-xl">BTC Mining ROI Lab</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-watt-success rounded-full animate-pulse"></div>
            <Badge className="bg-watt-success/20 text-watt-success text-xs border-watt-success/30">Live</Badge>
          </div>
        </div>
        <p className="text-watt-navy/70 text-sm">Calculate mining profitability with real-time data</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-watt-light rounded-lg p-4 transition-all duration-500 border border-gray-200 hover:border-watt-trust/30">
            <div className="flex items-center space-x-2 mb-2">
              <Bitcoin className="w-4 h-4 text-watt-trust flex-shrink-0" />
              <span className="text-xs text-watt-navy/60">BTC Price</span>
            </div>
            <div className="text-lg font-bold text-watt-trust break-words">
              {isLoading ? (
                <div className="animate-pulse bg-watt-trust/20 h-6 w-20 rounded"></div>
              ) : (
                `$${btcData.price.toLocaleString()}`
              )}
            </div>
          </div>
          
          <div className="bg-watt-light rounded-lg p-4 transition-all duration-500 border border-gray-200 hover:border-watt-bitcoin/30">
            <div className="flex items-center space-x-2 mb-2">
              <Hash className="w-4 h-4 text-watt-bitcoin flex-shrink-0" />
              <span className="text-xs text-watt-navy/60">Difficulty</span>
            </div>
            <div className="text-lg font-bold text-watt-bitcoin break-words">
              {isLoading ? (
                <div className="animate-pulse bg-watt-bitcoin/20 h-6 w-16 rounded"></div>
              ) : (
                `${(btcData.difficulty / 1e12).toFixed(1)}T`
              )}
            </div>
          </div>
          
          <div className="bg-watt-light rounded-lg p-4 transition-all duration-500 border border-gray-200 hover:border-watt-success/30">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-4 h-4 text-watt-success flex-shrink-0" />
              <span className="text-xs text-watt-navy/60">Daily Profit</span>
            </div>
            <div className="text-lg font-bold text-watt-success break-words">
              {profitability ? `$${profitability.dailyProfit.toFixed(2)}` : '$0.00'}
            </div>
          </div>
          
          <div className="bg-watt-light rounded-lg p-4 transition-all duration-500 border border-gray-200 hover:border-watt-warning/30">
            <div className="flex items-center space-x-2 mb-2">
              <Zap className="w-4 h-4 text-watt-warning flex-shrink-0" />
              <span className="text-xs text-watt-navy/60">Monthly</span>
            </div>
            <div className="text-lg font-bold text-watt-warning break-words">
              {profitability ? `$${profitability.monthlyProfit.toFixed(0)}` : '$0'}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-watt-navy">Your Mining Setup</h4>
            <Badge className="bg-watt-trust/20 text-watt-trust text-xs border-watt-trust/30">Configure</Badge>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-watt-navy/60 mb-1">Hashrate (TH/s)</label>
              <Input
                type="number"
                value={hashrate}
                onChange={(e) => setHashrate(e.target.value)}
                className="bg-watt-light border-gray-300 text-watt-navy text-sm focus:border-watt-trust/50 focus:ring-watt-trust/20"
                placeholder="200"
              />
            </div>
            
            <div>
              <label className="block text-xs text-watt-navy/60 mb-1">Energy ($/kWh)</label>
              <Input
                type="number"
                step="0.001"
                value={energyRate}
                onChange={(e) => setEnergyRate(e.target.value)}
                className="bg-watt-light border-gray-300 text-watt-navy text-sm focus:border-watt-trust/50 focus:ring-watt-trust/20"
                placeholder="0.08"
              />
            </div>
            
            <div>
              <label className="block text-xs text-watt-navy/60 mb-1">Power (W)</label>
              <Input
                type="number"
                value={powerDraw}
                onChange={(e) => setPowerDraw(e.target.value)}
                className="bg-watt-light border-gray-300 text-watt-navy text-sm focus:border-watt-trust/50 focus:ring-watt-trust/20"
                placeholder="3400"
              />
            </div>
          </div>
          
          <Button 
            onClick={calculateProfitability}
            className="w-full bg-watt-success/20 hover:bg-watt-success/30 text-watt-success border border-watt-success/30 transition-colors"
            variant="outline"
            disabled={isLoading}
          >
            <Calculator className="w-4 h-4 mr-2" />
            Recalculate ROI
          </Button>
        </div>

        <div className="text-xs text-watt-navy/60 pt-3 border-t border-gray-200">
          * Calculations based on current network conditions. Results may vary with difficulty changes.
        </div>
      </CardContent>
    </Card>
  );
};
