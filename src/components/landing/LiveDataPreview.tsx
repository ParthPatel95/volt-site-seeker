
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
    { name: "Saskatchewan Power Plant", mw: 175, score: 92, status: "active" },
    { name: "British Columbia Hydro Site", mw: 98, score: 85, status: "monitoring" },
    { name: "Manitoba Industrial Zone", mw: 142, score: 88, status: "active" },
    { name: "Nova Scotia Wind Farm", mw: 67, score: 83, status: "monitoring" },
    { name: "New Brunswick Grid Connection", mw: 134, score: 90, status: "active" },
    { name: "Oklahoma Energy Hub", mw: 189, score: 93, status: "active" },
    { name: "North Dakota Transmission", mw: 78, score: 86, status: "monitoring" },
    { name: "Wyoming Power Corridor", mw: 212, score: 91, status: "active" }
  ];

  return (
    <Card className="bg-watt-light border-gray-200 hover:border-watt-trust/40 transition-all duration-300 group shadow-institutional">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="w-6 h-6 text-watt-success group-hover:scale-110 transition-transform duration-300" />
            <CardTitle className="text-watt-navy text-xl">Live Market Data</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-watt-success rounded-full animate-pulse"></div>
            <Badge className="bg-watt-success/10 text-watt-success text-xs border-watt-success/30">Live</Badge>
          </div>
        </div>
        <p className="text-watt-navy/70 text-sm">Real-time intelligence from VoltScout platform</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Live Metrics Grid - 2x2 layout */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`bg-white rounded-lg p-4 transition-all duration-500 border border-gray-200 hover:border-watt-trust/40 ${isAnimating ? 'scale-105 bg-watt-trust/5 border-watt-trust/50' : ''}`}>
            <div className="flex items-center space-x-2 mb-2">
              <Eye className="w-4 h-4 text-watt-trust flex-shrink-0" />
              <span className="text-xs text-watt-navy/60">Active Sites</span>
            </div>
            <div className="text-lg font-bold text-watt-trust break-words">{liveData.activeSites}</div>
          </div>
          
          <div className={`bg-white rounded-lg p-4 transition-all duration-500 border border-gray-200 hover:border-watt-bitcoin/40 ${isAnimating ? 'scale-105 bg-watt-bitcoin/5 border-watt-bitcoin/50' : ''}`}>
            <div className="flex items-center space-x-2 mb-2">
              <Zap className="w-4 h-4 text-watt-bitcoin flex-shrink-0" />
              <span className="text-xs text-watt-navy/60">Total MW</span>
            </div>
            <div className="text-lg font-bold text-watt-bitcoin break-words">{liveData.totalMW.toLocaleString()}</div>
          </div>
          
          <div className={`bg-white rounded-lg p-4 transition-all duration-500 border border-gray-200 hover:border-watt-success/40 ${isAnimating ? 'scale-105 bg-watt-success/5 border-watt-success/50' : ''}`}>
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-4 h-4 text-watt-success flex-shrink-0" />
              <span className="text-xs text-watt-navy/60">Avg VoltScore</span>
            </div>
            <div className="text-lg font-bold text-watt-success break-words">{liveData.avgVoltScore}</div>
          </div>
          
          <div className={`bg-white rounded-lg p-4 transition-all duration-500 border border-gray-200 hover:border-watt-warning/40 ${isAnimating ? 'scale-105 bg-watt-warning/5 border-watt-warning/50' : ''}`}>
            <div className="flex items-center space-x-2 mb-2">
              <MapPin className="w-4 h-4 text-watt-warning flex-shrink-0" />
              <span className="text-xs text-watt-navy/60">$/MWh</span>
            </div>
            <div className="text-lg font-bold text-watt-warning break-words">${liveData.pricePerMWh.toFixed(2)}</div>
          </div>
        </div>

        {/* Recent Opportunities */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-watt-navy">Recent Opportunities</h4>
            <Badge className="bg-watt-trust/10 text-watt-trust text-xs border-watt-trust/30">+{liveData.recentOpportunities} this week</Badge>
          </div>
          
          <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
            {recentSites.map((site, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-watt-light rounded-lg hover:bg-watt-surface transition-colors duration-200 group/item border border-gray-200 hover:border-watt-trust/40">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-watt-navy group-hover/item:text-watt-trust transition-colors truncate">
                    {site.name}
                  </div>
                  <div className="text-xs text-watt-navy/60">
                    {site.mw}MW • VoltScore {site.score}
                  </div>
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <Badge 
                    className={`text-xs border ${
                      site.status === 'active' 
                        ? 'bg-watt-success/10 text-watt-success border-watt-success/30' 
                        : 'bg-watt-warning/10 text-watt-warning border-watt-warning/30'
                    }`}
                  >
                    {site.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-xs text-watt-navy/60 pt-3 border-t border-gray-200">
          * Data refreshes every 8 seconds. Platform access required for detailed analytics.
        </div>
      </CardContent>
    </Card>
  );
};
