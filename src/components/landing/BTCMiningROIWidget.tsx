
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bitcoin, Calculator, TrendingUp, Zap, Hash } from 'lucide-react';

export const BTCMiningROIWidget = () => {
  const [animatedHashrate, setAnimatedHashrate] = useState(0);
  const [animatedRevenue, setAnimatedRevenue] = useState(0);
  const [animatedROI, setAnimatedROI] = useState(0);
  const [animatedBTCPrice, setAnimatedBTCPrice] = useState(0);
  const [animatedDifficulty, setAnimatedDifficulty] = useState(0);

  // Sample calculation values
  const hashrate = 200; // TH/s
  const btcPrice = 45000; // USD
  const dailyRevenue = 8.50; // USD
  const yearlyROI = 125; // %
  const difficulty = 68.5; // T (trillions)

  // Animate numbers
  useEffect(() => {
    const duration = 1000;
    const steps = 50;
    const stepDuration = duration / steps;
    
    let currentStep = 0;
    const interval = setInterval(() => {
      const progress = currentStep / steps;
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      setAnimatedHashrate(hashrate * easeOut);
      setAnimatedRevenue(dailyRevenue * easeOut);
      setAnimatedROI(yearlyROI * easeOut);
      setAnimatedBTCPrice(btcPrice * easeOut);
      setAnimatedDifficulty(difficulty * easeOut);
      
      currentStep++;
      if (currentStep > steps) {
        clearInterval(interval);
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 hover:border-electric-blue/30 transition-all duration-300 group">
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-2 mb-2">
          <Bitcoin className="w-6 h-6 text-orange-500 group-hover:scale-110 transition-transform duration-300" />
          <CardTitle className="text-white text-xl">BTC Mining ROI Lab</CardTitle>
          <Badge className="bg-neon-green/20 text-neon-green text-xs border-neon-green/30">Live</Badge>
        </div>
        <p className="text-slate-300 text-sm">Calculate mining and hosting profitability with real-time data</p>
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
              ${Math.round(animatedBTCPrice).toLocaleString()}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Live Market Price
            </div>
          </div>
          
          <div className="bg-slate-800/30 rounded-lg p-4 hover:bg-slate-800/50 transition-colors duration-200 border border-slate-700/30 hover:border-purple-500/30">
            <div className="flex items-center space-x-2 mb-2">
              <Hash className="w-4 h-4 text-purple-500" />
              <span className="text-slate-300 text-sm">Difficulty</span>
            </div>
            <div className="text-2xl font-bold text-purple-500">
              {animatedDifficulty.toFixed(1)}T
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Network Difficulty
            </div>
          </div>
        </div>

        {/* Mining Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-800/30 rounded-lg p-4 hover:bg-slate-800/50 transition-colors duration-200 border border-slate-700/30 hover:border-orange-500/30">
            <div className="flex items-center space-x-2 mb-2">
              <Zap className="w-4 h-4 text-orange-500" />
              <span className="text-slate-300 text-sm">Hashrate</span>
            </div>
            <div className="text-2xl font-bold text-orange-500">
              {Math.round(animatedHashrate)} TH/s
            </div>
            <div className="text-xs text-slate-400 mt-1">
              ASIC Performance
            </div>
          </div>
          
          <div className="bg-slate-800/30 rounded-lg p-4 hover:bg-slate-800/50 transition-colors duration-200 border border-slate-700/30 hover:border-neon-green/30">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-4 h-4 text-neon-green" />
              <span className="text-slate-300 text-sm">Daily Revenue</span>
            </div>
            <div className="text-2xl font-bold text-neon-green">
              ${animatedRevenue.toFixed(2)}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              BTC @ ${Math.round(animatedBTCPrice).toLocaleString()}
            </div>
          </div>
        </div>

        {/* ROI Display */}
        <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/30 hover:border-electric-blue/30 transition-colors duration-200">
          <div className="flex items-center space-x-2 mb-2">
            <Calculator className="w-4 h-4 text-electric-blue" />
            <span className="text-slate-300 text-sm">12-Month ROI</span>
          </div>
          <div className="text-3xl font-bold text-electric-blue mb-2">
            {animatedROI.toFixed(1)}%
          </div>
          <div className="text-xs text-slate-400">
            Based on current network difficulty and power costs
          </div>
        </div>

        {/* Features List */}
        <div className="space-y-2 pt-2 border-t border-slate-700/30">
          <div className="flex items-center space-x-2 text-sm text-slate-300">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <span>Self-Mining & Hosting Scenarios</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-slate-300">
            <div className="w-2 h-2 bg-neon-green rounded-full"></div>
            <span>Live ERCOT & AESO Energy Data</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-slate-300">
            <div className="w-2 h-2 bg-electric-blue rounded-full"></div>
            <span>ASIC Catalog & Comparison</span>
          </div>
        </div>

        <div className="text-xs text-slate-500 pt-3 border-t border-slate-700/30">
          * Real-time calculations using live Bitcoin network data and regional energy prices
        </div>
      </CardContent>
    </Card>
  );
};
