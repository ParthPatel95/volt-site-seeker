
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Zap, MapPin, TrendingUp, Eye } from 'lucide-react';

export const LiveDataPreview = () => {
  const [liveData, setLiveData] = useState({
    activeSites: 247,
    totalMW: 1843,
    avgVoltScore: 87,
    recentOpportunities: 12,
    pricePerMWh: 45.30
  });

  const [isAnimating, setIsAnimating] = useState(false);

  // Simulate live data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setLiveData(prev => ({
        activeSites: prev.activeSites + Math.floor(Math.random() * 3) - 1,
        totalMW: prev.totalMW + Math.floor(Math.random() * 20) - 10,
        avgVoltScore: Math.max(75, Math.min(95, prev.avgVoltScore + Math.floor(Math.random() * 6) - 3)),
        recentOpportunities: prev.recentOpportunities + Math.floor(Math.random() * 3),
        pricePerMWh: Math.max(35, Math.min(65, prev.pricePerMWh + (Math.random() * 4) - 2))
      }));
      
      setTimeout(() => setIsAnimating(false), 500);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const recentSites = [
    { name: "Alberta Industrial Complex", mw: 125, score: 94, status: "active" },
    { name: "Ontario Manufacturing Hub", mw: 89, score: 87, status: "monitoring" },
    { name: "Texas Data Center Site", mw: 156, score: 91, status: "active" },
    { name: "Quebec Mining Facility", mw: 203, score: 89, status: "active" },
    { name: "British Columbia Smelter", mw: 178, score: 92, status: "active" },
    { name: "Saskatchewan Power Plant", mw: 245, score: 88, status: "monitoring" },
    { name: "Manitoba Steel Mill", mw: 134, score: 85, status: "active" },
    { name: "New Brunswick Paper Mill", mw: 67, score: 83, status: "monitoring" },
    { name: "Nova Scotia Energy Complex", mw: 198, score: 90, status: "active" },
    { name: "Alberta Petrochemical Site", mw: 156, score: 86, status: "active" }
  ];

  return (
    <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 hover:border-neon-green/30 transition-all duration-300 group">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="w-6 h-6 text-neon-green group-hover:scale-110 transition-transform duration-300" />
            <CardTitle className="text-white text-xl">Live Market Data</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse"></div>
            <Badge className="bg-neon-green/20 text-neon-green text-xs border-neon-green/30">Live</Badge>
          </div>
        </div>
        <p className="text-slate-300 text-sm">Real-time intelligence from VoltScout platform</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Live Metrics Grid - Changed to 2x2 layout */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`bg-slate-800/30 rounded-lg p-4 transition-all duration-500 border border-slate-700/30 hover:border-electric-blue/30 ${isAnimating ? 'scale-105 bg-slate-800/50 border-electric-blue/50' : ''}`}>
            <div className="flex items-center space-x-2 mb-2">
              <Eye className="w-4 h-4 text-electric-blue flex-shrink-0" />
              <span className="text-xs text-slate-400">Active Sites</span>
            </div>
            <div className="text-lg font-bold text-electric-blue break-words">{liveData.activeSites}</div>
          </div>
          
          <div className={`bg-slate-800/30 rounded-lg p-4 transition-all duration-500 border border-slate-700/30 hover:border-electric-yellow/30 ${isAnimating ? 'scale-105 bg-slate-800/50 border-electric-yellow/50' : ''}`}>
            <div className="flex items-center space-x-2 mb-2">
              <Zap className="w-4 h-4 text-electric-yellow flex-shrink-0" />
              <span className="text-xs text-slate-400">Total MW</span>
            </div>
            <div className="text-lg font-bold text-electric-yellow break-words">{liveData.totalMW.toLocaleString()}</div>
          </div>
          
          <div className={`bg-slate-800/30 rounded-lg p-4 transition-all duration-500 border border-slate-700/30 hover:border-neon-green/30 ${isAnimating ? 'scale-105 bg-slate-800/50 border-neon-green/50' : ''}`}>
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-4 h-4 text-neon-green flex-shrink-0" />
              <span className="text-xs text-slate-400">Avg VoltScore</span>
            </div>
            <div className="text-lg font-bold text-neon-green break-words">{liveData.avgVoltScore}</div>
          </div>
          
          <div className={`bg-slate-800/30 rounded-lg p-4 transition-all duration-500 border border-slate-700/30 hover:border-warm-orange/30 ${isAnimating ? 'scale-105 bg-slate-800/50 border-warm-orange/50' : ''}`}>
            <div className="flex items-center space-x-2 mb-2">
              <MapPin className="w-4 h-4 text-warm-orange flex-shrink-0" />
              <span className="text-xs text-slate-400">$/MWh</span>
            </div>
            <div className="text-lg font-bold text-warm-orange break-words">${liveData.pricePerMWh.toFixed(2)}</div>
          </div>
        </div>

        {/* Recent Opportunities - Expanded */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-200">Recent Opportunities</h4>
            <Badge className="bg-electric-blue/20 text-electric-blue text-xs border-electric-blue/30">+{liveData.recentOpportunities} this week</Badge>
          </div>
          
          <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
            {recentSites.map((site, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-800/20 rounded-lg hover:bg-slate-800/40 transition-colors duration-200 group/item border border-slate-700/20 hover:border-slate-600/30">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white group-hover/item:text-electric-blue transition-colors truncate">
                    {site.name}
                  </div>
                  <div className="text-xs text-slate-400">
                    {site.mw}MW • VoltScore {site.score}
                  </div>
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <Badge 
                    className={`text-xs border ${
                      site.status === 'active' 
                        ? 'bg-neon-green/20 text-neon-green border-neon-green/30' 
                        : 'bg-electric-yellow/20 text-electric-yellow border-electric-yellow/30'
                    }`}
                  >
                    {site.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-xs text-slate-500 pt-3 border-t border-slate-700/30">
          * Data refreshes every 8 seconds. Platform access required for detailed analytics.
        </div>
      </CardContent>
    </Card>
  );
};
