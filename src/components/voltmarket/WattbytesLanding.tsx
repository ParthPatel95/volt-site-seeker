import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Zap, 
  ArrowRight,
  TrendingUp,
  Eye,
  MapPin,
  Activity,
  Bitcoin,
  Calculator
} from 'lucide-react';

export const WattbytesLanding: React.FC = () => {
  const [liveData, setLiveData] = useState({
    activeSites: 248,
    totalMW: 1850,
    avgVoltScore: 84,
    pricePerMWh: 43.97,
    btcPrice: 107826.02
  });

  const [hashrate, setHashrate] = useState('100');
  const [energyRate, setEnergyRate] = useState('0.05');
  const [powerDraw, setPowerDraw] = useState('3250');

  // Simulate live data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveData(prev => ({
        ...prev,
        btcPrice: prev.btcPrice + (Math.random() - 0.5) * 1000,
        pricePerMWh: prev.pricePerMWh + (Math.random() - 0.5) * 2,
        avgVoltScore: Math.max(80, Math.min(95, prev.avgVoltScore + (Math.random() - 0.5) * 2))
      }));
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const opportunities = [
    { name: "Alberta Industrial Complex", mw: 125, score: 94, status: "active" },
    { name: "Ontario Manufacturing Hub", mw: 89, score: 87, status: "monitoring" },
    { name: "Texas Data Center Site", mw: 156, score: 91, status: "active" },
    { name: "Quebec Mining Facility", mw: 203, score: 89, status: "active" },
    { name: "Saskatchewan Power Plant", mw: 175, score: 92, status: "active" },
    { name: "British Columbia Hydro Site", mw: 98, score: 85, status: "monitoring" },
    { name: "Manitoba Industrial Zone", mw: 142, score: 88, status: "active" },
    { name: "Nova Scotia Wind Farm", mw: 67, score: 83, status: "monitoring" }
  ];

  const calculateDailyProfit = () => {
    const hash = parseFloat(hashrate);
    const rate = parseFloat(energyRate);
    const power = parseFloat(powerDraw);
    
    const dailyRevenue = (hash * 0.00000005 * liveData.btcPrice);
    const dailyPowerCost = (power / 1000) * 24 * rate;
    return dailyRevenue - dailyPowerCost;
  };

  const dailyProfit = calculateDailyProfit();
  const monthlyProfit = dailyProfit * 30;

  console.log('WattByte colors should be loaded');
  
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* WattByte Landing Page */}
      {/* Header */}
      <header className="fixed top-0 w-full bg-slate-900/95 backdrop-blur-sm border-b border-slate-700 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
             <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, hsl(var(--watt-accent)), hsl(var(--watt-secondary)))' }}>
               <Zap className="w-6 h-6 text-white" />
             </div>
             <div>
               <h1 className="text-xl font-bold flex items-center">
                 <span className="text-white">Watt</span>
                 <span style={{ color: 'hsl(var(--watt-accent))' }}>B</span>
                 <span className="text-white">yte</span>
               </h1>
               <p className="text-xs -mt-1" style={{ color: 'hsl(var(--watt-success))' }}>Infrastructure Fund</p>
               </div>
            </div>
            
            <Link to="/app">
           <Button className="font-medium px-6 text-white" style={{ background: 'hsl(var(--watt-accent))' }}>
             Launch VoltScout
           </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Fund Stats Badges */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <Badge variant="outline" className="border-watt-primary/30 text-watt-primary bg-watt-primary/10 px-4 py-2">
              <Zap className="w-4 h-4 mr-2" />
              Fund I • $25M Target
            </Badge>
            <Badge variant="outline" className="border-watt-success/30 text-watt-success bg-watt-success/10 px-4 py-2">
              <TrendingUp className="w-4 h-4 mr-2" />
              2.0-2.5x MOIC
            </Badge>
            <Badge variant="outline" className="border-watt-accent/30 text-watt-accent bg-watt-accent/10 px-4 py-2">
              <Activity className="w-4 h-4 mr-2" />
              675MW+ Experience
            </Badge>
          </div>

          {/* Main Headline */}
          <h1 className="text-6xl md:text-7xl font-bold mb-8 leading-tight">
            <span className="text-white">Turning </span>
            <span style={{ color: 'hsl(var(--watt-primary))' }}>Power</span>
            <br />
            <span className="text-white">into </span>
            <span style={{ color: 'hsl(var(--watt-success))' }}>Profit</span>
          </h1>

          <p className="text-xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
            Next-generation infrastructure fund acquiring power-rich land across North America for{' '}
            <span style={{ color: 'hsl(var(--watt-primary))' }}>AI</span>, <span style={{ color: 'hsl(var(--watt-accent))' }}>HPC</span>, and{' '}
            <span style={{ color: 'hsl(var(--watt-success))' }}>crypto data centers</span>, backed by{' '}
            <span style={{ color: 'hsl(var(--watt-primary))' }}>675MW+</span> of deal experience.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button className="text-white px-8 py-3 text-lg font-medium" style={{ background: 'hsl(var(--watt-primary))' }}>
              Request Platform Access
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button variant="outline" className="border-gray-400 text-gray-200 hover:bg-gray-700 hover:text-white px-8 py-3 text-lg font-medium">
              View Available Sites
            </Button>
          </div>
        </div>
      </section>

      {/* Live Market Intelligence */}
      <section className="py-16 bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Live Market Intelligence</h2>
            <p className="text-xl text-gray-300">Real-time data and analytics powering our investment decisions</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* BTC Mining ROI Lab */}
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-watt-accent flex items-center">
                    <Bitcoin className="w-5 h-5 mr-2" />
                    BTC Mining ROI Lab
                  </h3>
                  <Badge className="bg-watt-success/20 text-watt-success border-watt-success/30">Live</Badge>
                </div>
                
                <p className="text-gray-400 mb-6">Calculate mining profitability with real-time data</p>
                
                <div className="space-y-4 mb-6">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-300">BTC Price</span>
                      <div className="text-2xl font-bold text-watt-accent">
                        ${liveData.btcPrice.toLocaleString()}
                      </div>
                      <span className="text-xs text-gray-400">Live Market Price</span>
                    </div>
                    <div>
                      <span className="text-gray-300">Difficulty</span>
                      <div className="text-2xl font-bold text-white">68.5T</div>
                      <span className="text-xs text-gray-400">Network Difficulty</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <h4 className="font-semibold text-white">Your Mining Setup</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs text-gray-300">Hashrate (TH/s)</label>
                      <Input 
                        value={hashrate}
                        onChange={(e) => setHashrate(e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-300">Energy Rate ($/kWh)</label>
                      <Input 
                        value={energyRate}
                        onChange={(e) => setEnergyRate(e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-300">Power Draw (W)</label>
                      <Input 
                        value={powerDraw}
                        onChange={(e) => setPowerDraw(e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-slate-700/50 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-3">Profitability Analysis</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-300">Daily Profit</span>
                      <div className="text-xl font-bold text-watt-success">
                        ${dailyProfit.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-300">Monthly Profit</span>
                      <div className="text-xl font-bold text-watt-success">
                        ${monthlyProfit.toFixed(0)}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    * Calculations assume current network conditions and do not account for difficulty changes
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Live Market Data */}
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-watt-success flex items-center">
                    <Activity className="w-5 h-5 mr-2" />
                    Live Market Data
                  </h3>
                  <Badge className="bg-watt-success/20 text-watt-success border-watt-success/30">Live</Badge>
                </div>
                
                <p className="text-gray-400 mb-6">Real-time intelligence from VoltScout platform</p>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <div className="flex items-center text-watt-primary mb-2">
                      <Eye className="w-4 h-4 mr-2" />
                      <span className="text-sm text-gray-300">Active Sites</span>
                    </div>
                    <div className="text-2xl font-bold text-watt-primary">{liveData.activeSites}</div>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <div className="flex items-center text-watt-accent mb-2">
                      <Zap className="w-4 h-4 mr-2" />
                      <span className="text-sm text-gray-300">Total MW</span>
                    </div>
                    <div className="text-2xl font-bold text-watt-accent">{liveData.totalMW.toLocaleString()}</div>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <div className="flex items-center text-watt-success mb-2">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      <span className="text-sm text-gray-300">Avg VoltScore</span>
                    </div>
                    <div className="text-2xl font-bold text-watt-success">{Math.round(liveData.avgVoltScore)}</div>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <div className="flex items-center text-watt-accent mb-2">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span className="text-sm text-gray-300">$/MWh</span>
                    </div>
                    <div className="text-2xl font-bold text-watt-accent">${liveData.pricePerMWh.toFixed(2)}</div>
                  </div>
                </div>

                {/* Recent Opportunities */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-white">Recent Opportunities</h4>
                    <Badge variant="outline" className="border-watt-primary/30 text-watt-primary text-xs">
                      +15 this week
                    </Badge>
                  </div>
                  
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {opportunities.map((opp, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                        <div>
                          <div className="font-medium text-white text-sm">{opp.name}</div>
                          <div className="text-xs text-gray-400">{opp.mw}MW • VoltScore {opp.score}</div>
                        </div>
                        <Badge 
                          className={
                            opp.status === 'active' 
                              ? 'bg-watt-success/20 text-watt-success border-watt-success/30' 
                              : 'bg-watt-accent/20 text-watt-accent border-watt-accent/30'
                          }
                        >
                          {opp.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};