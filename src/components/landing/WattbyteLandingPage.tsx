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
  Building2,
  LineChart
} from 'lucide-react';

export const WattbyteLandingPage: React.FC = () => {
  const [liveData, setLiveData] = useState({
    activeSites: 247,
    totalMW: 1845,
    avgVoltScore: 84,
    pricePerMWh: 43.32,
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

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="fixed top-0 w-full bg-slate-900/95 backdrop-blur-sm border-b border-slate-700 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-watt-gradient rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold flex items-center">
                  <span className="text-white">Watt</span>
                  <span className="text-watt-accent">B</span>
                  <span className="text-white">yte</span>
                </h1>
                <p className="text-xs text-watt-success -mt-1">Infrastructure Fund</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Link to="/voltmarket">
                <Button className="bg-watt-secondary hover:bg-watt-secondary/90 text-white font-medium px-6">
                  Launch VoltMarket
                </Button>
              </Link>
              <Link to="/app">
                <Button className="bg-watt-accent hover:bg-watt-accent/90 text-black font-medium px-6">
                  Launch VoltScout
                </Button>
              </Link>
            </div>
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
            <span className="text-watt-primary">Power</span>
            <br />
            <span className="text-white">into </span>
            <span className="text-watt-success">Profit</span>
          </h1>

          <p className="text-xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
            Next-generation infrastructure fund acquiring power-rich land across North America for{' '}
            <span className="text-watt-primary">AI</span>, <span className="text-watt-accent">HPC</span>, and{' '}
            <span className="text-watt-success">crypto data centers</span>, backed by{' '}
            <span className="text-watt-primary">675MW+</span> of deal experience.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button className="bg-watt-primary hover:bg-watt-primary/90 text-white px-8 py-3 text-lg font-medium">
              Request Platform Access
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button variant="outline" className="border-gray-400 text-gray-200 hover:bg-gray-700 hover:text-white px-8 py-3 text-lg font-medium">
              View Available Sites
            </Button>
          </div>
        </div>
      </section>

      {/* Fund Overview Section */}
      <section className="py-16 bg-slate-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Fund I */}
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Building2 className="w-6 h-6 text-watt-primary mr-3" />
                  <div>
                    <h3 className="text-xl font-bold text-white">Fund I</h3>
                    <p className="text-watt-primary font-semibold">$25M USD</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-300 mb-1">Target Investments:</h4>
                    <p className="text-white font-semibold">12-15 strategic investments</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-semibold text-gray-300 mb-1">Strategy:</h4>
                    <p className="text-watt-primary">Flip Model</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-semibold text-gray-300 mb-1">Focus:</h4>
                    <p className="text-gray-300">Natural gas and hydroelectric opportunities</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Fund II */}
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Zap className="w-6 h-6 text-watt-secondary mr-3" />
                  <div>
                    <h3 className="text-xl font-bold text-white">Fund II</h3>
                    <p className="text-watt-secondary font-semibold">$125M USD</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-300 mb-1">Target Investments:</h4>
                    <p className="text-white font-semibold">20-25 strategic investments</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-semibold text-gray-300 mb-1">Strategy:</h4>
                    <p className="text-watt-secondary">Flip & Build Model</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-semibold text-gray-300 mb-1">Focus:</h4>
                    <p className="text-gray-300">Energy storage and smart grid technologies</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Fund III */}
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <LineChart className="w-6 h-6 text-watt-success mr-3" />
                  <div>
                    <h3 className="text-xl font-bold text-white">Fund III</h3>
                    <p className="text-watt-success font-semibold">$250M USD</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-300 mb-1">Target Investments:</h4>
                    <p className="text-white font-semibold">10-15 strategic investments</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-semibold text-gray-300 mb-1">Strategy:</h4>
                    <p className="text-watt-success">Build & Hold Model</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-semibold text-gray-300 mb-1">Focus:</h4>
                    <p className="text-gray-300">Large-scale renewable energy projects</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* BTC Mining ROI & Live Market Data */}
      <section className="py-16 bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* BTC Mining ROI Lab */}
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white">Profitability Analysis</h3>
                  <Badge className="bg-watt-success/20 text-watt-success border-watt-success/30">Live</Badge>
                </div>
                
                <div className="space-y-4 mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-300">💰 Daily Profit</span>
                      <div className="text-2xl font-bold text-watt-success">
                        ${dailyProfit.toFixed(2)}
                      </div>
                      <span className="text-xs text-gray-400">Revenue: ${(parseFloat(hashrate) * 0.00000005 * liveData.btcPrice).toFixed(2)} | Power: ${((parseFloat(powerDraw) / 1000) * 24 * parseFloat(energyRate)).toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-gray-300">📈 Monthly Profit</span>
                      <div className="text-2xl font-bold text-watt-success">
                        ${monthlyProfit.toFixed(0)}
                      </div>
                      <span className="text-xs text-gray-400">12-Month ROI: 133.5%</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
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

                <p className="text-xs text-gray-500">
                  * Calculations assume current network conditions and do not account for difficulty changes
                </p>
              </CardContent>
            </Card>

            {/* Live Market Data */}
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-semibold text-white flex items-center">
                      <Activity className="w-5 h-5 mr-2" />
                      Live Market Data
                    </h3>
                    <p className="text-gray-400">Real-time intelligence from VoltScout platform</p>
                  </div>
                  <Badge className="bg-watt-success/20 text-watt-success border-watt-success/30">Live</Badge>
                </div>

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
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};