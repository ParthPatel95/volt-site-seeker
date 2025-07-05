import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Calculator, 
  Zap, 
  DollarSign, 
  TrendingUp, 
  Server, 
  Home,
  Building2,
  Sparkles 
} from 'lucide-react';

interface HostingCalculation {
  monthlyRevenue: number;
  monthlyCost: number;
  monthlyProfit: number;
  yearlyROI: number;
  breakevenMonths: number;
}

export const VoltMarketHostingCalculator = () => {
  const [calculationMode, setCalculationMode] = useState<'hosting' | 'self-mining'>('hosting');
  const [hashrate, setHashrate] = useState<string>('100');
  const [powerDraw, setPowerDraw] = useState<string>('3000');
  const [hostingRate, setHostingRate] = useState<string>('0.085');
  const [energyRate, setEnergyRate] = useState<string>('0.06');
  const [initialInvestment, setInitialInvestment] = useState<string>('8500');
  const [btcPrice, setBtcPrice] = useState<number>(108000);
  const [results, setResults] = useState<HostingCalculation | null>(null);

  // Fetch live BTC price
  useEffect(() => {
    const fetchBTCPrice = async () => {
      try {
        const response = await fetch('https://api.coinbase.com/v2/prices/spot?currency=USD');
        const data = await response.json();
        setBtcPrice(parseFloat(data.data.amount));
      } catch (error) {
        console.error('Failed to fetch BTC price:', error);
        setBtcPrice(108000); // Fallback
      }
    };

    fetchBTCPrice();
    const interval = setInterval(fetchBTCPrice, 60000);
    return () => clearInterval(interval);
  }, []);

  const calculateProfitability = () => {
    const hashrateValue = parseFloat(hashrate);
    const powerDrawValue = parseFloat(powerDraw);
    const hostingRateValue = parseFloat(hostingRate);
    const energyRateValue = parseFloat(energyRate);
    const investmentValue = parseFloat(initialInvestment);

    if (!hashrateValue || !powerDrawValue || !investmentValue) return;

    // Mining constants
    const networkHashrate = 450e18; // ~450 EH/s
    const blockReward = 6.25; // BTC
    const blocksPerDay = 144; // 10 min average
    
    // Calculate daily BTC earnings
    const hashrateInHs = hashrateValue * 1e12;
    const dailyBTC = (hashrateInHs / networkHashrate) * blocksPerDay * blockReward;
    const monthlyRevenue = dailyBTC * btcPrice * 30;
    
    // Calculate monthly costs
    let monthlyCost: number;
    if (calculationMode === 'hosting') {
      monthlyCost = (powerDrawValue / 1000) * 24 * 30 * hostingRateValue;
    } else {
      monthlyCost = (powerDrawValue / 1000) * 24 * 30 * energyRateValue;
    }
    
    const monthlyProfit = monthlyRevenue - monthlyCost;
    const yearlyProfit = monthlyProfit * 12;
    const yearlyROI = (yearlyProfit / investmentValue) * 100;
    const breakevenMonths = monthlyProfit > 0 ? investmentValue / monthlyProfit : 0;

    setResults({
      monthlyRevenue,
      monthlyCost,
      monthlyProfit,
      yearlyROI,
      breakevenMonths
    });
  };

  useEffect(() => {
    if (btcPrice > 0) {
      calculateProfitability();
    }
  }, [btcPrice, calculationMode, hashrate, powerDraw, hostingRate, energyRate, initialInvestment]);

  return (
    <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 cursor-pointer bg-gradient-to-br from-white to-blue-50/50 border-0 shadow-lg">
      <div className="absolute inset-0 bg-gradient-to-br from-watt-primary/5 to-watt-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></div>
      
      <CardHeader className="relative pb-4">
        <div className="flex justify-between items-start mb-4">
          <Badge className="bg-watt-primary/10 text-watt-primary border-watt-primary/20">
            <Sparkles className="w-3 h-3 mr-1.5" />
            Live Calculator
          </Badge>
          <div className="text-right">
            <div className="text-2xl font-bold text-watt-primary">${btcPrice.toLocaleString()}</div>
            <div className="text-xs text-gray-500">BTC Price</div>
          </div>
        </div>
        <CardTitle className="text-xl group-hover:text-watt-primary transition-colors leading-tight">
          Mining Profitability Calculator
        </CardTitle>
        <p className="text-sm text-gray-600">Compare hosting vs self-mining economics</p>
      </CardHeader>

      <CardContent className="relative space-y-6">
        {/* Mode Selection */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-900">Mining Model</h4>
          <Select value={calculationMode} onValueChange={(value: 'hosting' | 'self-mining') => setCalculationMode(value)}>
            <SelectTrigger className="bg-white/70 border-watt-primary/20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hosting">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Hosting Model
                </div>
              </SelectItem>
              <SelectItem value="self-mining">
                <div className="flex items-center gap-2">
                  <Home className="w-4 h-4" />
                  Self-Mining
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Input Parameters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Hashrate (TH/s)</label>
            <Input
              type="number"
              value={hashrate}
              onChange={(e) => setHashrate(e.target.value)}
              className="bg-white/70 border-watt-primary/20"
              placeholder="100"
            />
          </div>
          
          <div>
            <label className="block text-xs text-gray-600 mb-1">Power Draw (W)</label>
            <Input
              type="number"
              value={powerDraw}
              onChange={(e) => setPowerDraw(e.target.value)}
              className="bg-white/70 border-watt-primary/20"
              placeholder="3000"
            />
          </div>
          
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              {calculationMode === 'hosting' ? 'Hosting Rate ($/kWh)' : 'Energy Rate ($/kWh)'}
            </label>
            <Input
              type="number"
              step="0.001"
              value={calculationMode === 'hosting' ? hostingRate : energyRate}
              onChange={(e) => calculationMode === 'hosting' ? setHostingRate(e.target.value) : setEnergyRate(e.target.value)}
              className="bg-white/70 border-watt-primary/20"
              placeholder={calculationMode === 'hosting' ? '0.085' : '0.06'}
            />
          </div>
          
          <div>
            <label className="block text-xs text-gray-600 mb-1">Initial Investment ($)</label>
            <Input
              type="number"
              value={initialInvestment}
              onChange={(e) => setInitialInvestment(e.target.value)}
              className="bg-white/70 border-watt-primary/20"
              placeholder="8500"
            />
          </div>
        </div>

        {/* Results Grid */}
        {results && (
          <div className="space-y-4 pt-4 border-t border-watt-primary/20">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Profitability Analysis</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-watt-success/5 to-watt-success/10 rounded-lg p-4 border border-watt-success/20">
                <div className="flex items-center space-x-2 mb-2">
                  <DollarSign className="w-4 h-4 text-watt-success flex-shrink-0" />
                  <span className="text-xs text-gray-600">Monthly Revenue</span>
                </div>
                <div className="text-lg font-bold text-watt-success">
                  ${results.monthlyRevenue.toFixed(0)}
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-red-50 to-red-100/50 rounded-lg p-4 border border-red-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Zap className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <span className="text-xs text-gray-600">Monthly Cost</span>
                </div>
                <div className="text-lg font-bold text-red-600">
                  ${results.monthlyCost.toFixed(0)}
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-watt-primary/5 to-watt-primary/10 rounded-lg p-4 border border-watt-primary/20">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-watt-primary flex-shrink-0" />
                  <span className="text-xs text-gray-600">Monthly Profit</span>
                </div>
                <div className={`text-lg font-bold ${results.monthlyProfit > 0 ? 'text-watt-primary' : 'text-red-600'}`}>
                  ${results.monthlyProfit.toFixed(0)}
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-watt-accent/5 to-watt-accent/10 rounded-lg p-4 border border-watt-accent/20">
                <div className="flex items-center space-x-2 mb-2">
                  <Server className="w-4 h-4 text-watt-accent flex-shrink-0" />
                  <span className="text-xs text-gray-600">Yearly ROI</span>
                </div>
                <div className={`text-lg font-bold ${results.yearlyROI > 0 ? 'text-watt-accent' : 'text-red-600'}`}>
                  {results.yearlyROI.toFixed(1)}%
                </div>
              </div>
            </div>

            {results.breakevenMonths > 0 && (
              <div className="bg-gradient-to-br from-watt-secondary/5 to-watt-secondary/10 rounded-lg p-4 border border-watt-secondary/20">
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-1">Breakeven Period</div>
                  <div className="text-xl font-bold text-watt-secondary">
                    {results.breakevenMonths.toFixed(1)} months
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <Button 
          onClick={calculateProfitability}
          className="w-full bg-gradient-to-r from-watt-primary to-watt-secondary hover:opacity-90 text-white"
        >
          <Calculator className="w-4 h-4 mr-2" />
          Recalculate
        </Button>

        <div className="text-xs text-gray-500 pt-3 border-t border-watt-primary/20">
          * Calculations based on current BTC price and network difficulty. Results may vary.
        </div>
      </CardContent>
    </Card>
  );
};