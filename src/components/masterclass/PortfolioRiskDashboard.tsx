import { useState } from "react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";
import { Building2, MapPin, AlertTriangle, Shield, TrendingUp, DollarSign, Zap, Thermometer, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface Site {
  id: string;
  name: string;
  location: string;
  region: string;
  capacityMW: number;
  operationalStatus: "operational" | "development" | "planned";
  riskScores: {
    market: number;
    operational: number;
    regulatory: number;
    financial: number;
    climate: number;
  };
}

const defaultSites: Site[] = [
  {
    id: "1",
    name: "Alberta Site Alpha",
    location: "Drumheller, AB",
    region: "Western Canada",
    capacityMW: 25,
    operationalStatus: "operational",
    riskScores: { market: 35, operational: 25, regulatory: 20, financial: 40, climate: 15 }
  },
  {
    id: "2",
    name: "Texas Site Beta",
    location: "Midland, TX",
    region: "US Southwest",
    capacityMW: 50,
    operationalStatus: "operational",
    riskScores: { market: 45, operational: 30, regulatory: 25, financial: 35, climate: 55 }
  },
  {
    id: "3",
    name: "Quebec Hydro Site",
    location: "Sept-Îles, QC",
    region: "Eastern Canada",
    capacityMW: 30,
    operationalStatus: "development",
    riskScores: { market: 20, operational: 35, regulatory: 30, financial: 25, climate: 10 }
  }
];

export const PortfolioRiskDashboard = () => {
  const [sites, setSites] = useState<Site[]>(defaultSites);
  const [selectedSite, setSelectedSite] = useState<string | null>(null);
  const [showAddSite, setShowAddSite] = useState(false);
  const [newSite, setNewSite] = useState({
    name: "",
    location: "",
    region: "Western Canada",
    capacityMW: 10,
    operationalStatus: "planned" as const
  });

  // Calculate portfolio-level metrics
  const portfolioMetrics = {
    totalCapacity: sites.reduce((acc, site) => acc + site.capacityMW, 0),
    operationalCapacity: sites.filter(s => s.operationalStatus === "operational").reduce((acc, site) => acc + site.capacityMW, 0),
    avgRiskScore: sites.reduce((acc, site) => {
      const siteAvg = Object.values(site.riskScores).reduce((a, b) => a + b, 0) / 5;
      return acc + siteAvg;
    }, 0) / sites.length,
    geographicDiversification: new Set(sites.map(s => s.region)).size / 5 * 100
  };

  // Aggregate risk by category
  const aggregateRiskData = [
    { name: "Market", value: sites.reduce((acc, s) => acc + s.riskScores.market, 0) / sites.length, fill: "#f97316" },
    { name: "Operational", value: sites.reduce((acc, s) => acc + s.riskScores.operational, 0) / sites.length, fill: "#3b82f6" },
    { name: "Regulatory", value: sites.reduce((acc, s) => acc + s.riskScores.regulatory, 0) / sites.length, fill: "#8b5cf6" },
    { name: "Financial", value: sites.reduce((acc, s) => acc + s.riskScores.financial, 0) / sites.length, fill: "#10b981" },
    { name: "Climate", value: sites.reduce((acc, s) => acc + s.riskScores.climate, 0) / sites.length, fill: "#06b6d4" }
  ];

  // Capacity by region
  const capacityByRegion = sites.reduce((acc, site) => {
    const existing = acc.find(r => r.region === site.region);
    if (existing) {
      existing.capacity += site.capacityMW;
    } else {
      acc.push({ region: site.region, capacity: site.capacityMW });
    }
    return acc;
  }, [] as { region: string; capacity: number }[]);

  // Radar data for selected site
  const getRadarData = (site: Site) => [
    { subject: "Market", A: 100 - site.riskScores.market, fullMark: 100 },
    { subject: "Operational", A: 100 - site.riskScores.operational, fullMark: 100 },
    { subject: "Regulatory", A: 100 - site.riskScores.regulatory, fullMark: 100 },
    { subject: "Financial", A: 100 - site.riskScores.financial, fullMark: 100 },
    { subject: "Climate", A: 100 - site.riskScores.climate, fullMark: 100 }
  ];

  const addSite = () => {
    const randomRisk = () => Math.floor(Math.random() * 60) + 10;
    setSites([...sites, {
      id: Date.now().toString(),
      ...newSite,
      riskScores: {
        market: randomRisk(),
        operational: randomRisk(),
        regulatory: randomRisk(),
        financial: randomRisk(),
        climate: randomRisk()
      }
    }]);
    setShowAddSite(false);
    setNewSite({ name: "", location: "", region: "Western Canada", capacityMW: 10, operationalStatus: "planned" });
  };

  const removeSite = (id: string) => {
    setSites(sites.filter(s => s.id !== id));
    if (selectedSite === id) setSelectedSite(null);
  };

  const selectedSiteData = sites.find(s => s.id === selectedSite);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-watt-navy">Portfolio Risk Dashboard</h3>
          <p className="text-sm text-watt-navy/60">Visualize and manage risk across your mining portfolio</p>
        </div>
        <Button onClick={() => setShowAddSite(true)} size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          Add Site
        </Button>
      </div>

      {/* Portfolio Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-watt-light rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-watt-blue" />
            <span className="text-sm text-watt-navy/60">Total Capacity</span>
          </div>
          <p className="text-2xl font-bold text-watt-navy">{portfolioMetrics.totalCapacity} MW</p>
        </div>
        <div className="bg-watt-light rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="w-4 h-4 text-green-500" />
            <span className="text-sm text-watt-navy/60">Operational</span>
          </div>
          <p className="text-2xl font-bold text-watt-navy">{portfolioMetrics.operationalCapacity} MW</p>
        </div>
        <div className="bg-watt-light rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            <span className="text-sm text-watt-navy/60">Avg Risk Score</span>
          </div>
          <p className="text-2xl font-bold text-watt-navy">{portfolioMetrics.avgRiskScore.toFixed(0)}%</p>
        </div>
        <div className="bg-watt-light rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-purple-500" />
            <span className="text-sm text-watt-navy/60">Diversification</span>
          </div>
          <p className="text-2xl font-bold text-watt-navy">{portfolioMetrics.geographicDiversification.toFixed(0)}%</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Site List */}
        <div className="space-y-3">
          <h4 className="font-semibold text-watt-navy">Sites ({sites.length})</h4>
          {sites.map((site) => {
            const avgRisk = Object.values(site.riskScores).reduce((a, b) => a + b, 0) / 5;
            const isSelected = selectedSite === site.id;
            
            return (
              <motion.div
                key={site.id}
                onClick={() => setSelectedSite(isSelected ? null : site.id)}
                className={cn(
                  "p-3 rounded-xl border cursor-pointer transition-all",
                  isSelected 
                    ? "border-watt-blue bg-watt-blue/5" 
                    : "border-gray-200 hover:border-watt-blue/50"
                )}
                whileHover={{ scale: 1.01 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      site.operationalStatus === "operational" ? "bg-green-500" :
                      site.operationalStatus === "development" ? "bg-yellow-500" : "bg-gray-400"
                    )} />
                    <span className="font-medium text-watt-navy text-sm">{site.name}</span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeSite(site.id); }}
                    className="p-1 hover:bg-red-100 rounded"
                  >
                    <X className="w-3 h-3 text-gray-400 hover:text-red-500" />
                  </button>
                </div>
                <div className="flex items-center justify-between text-xs text-watt-navy/50">
                  <span>{site.location}</span>
                  <span>{site.capacityMW} MW</span>
                </div>
                <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full rounded-full",
                      avgRisk < 30 ? "bg-green-500" : avgRisk < 50 ? "bg-yellow-500" : "bg-red-500"
                    )}
                    style={{ width: `${avgRisk}%` }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Aggregate Risk Chart */}
        <div>
          <h4 className="font-semibold text-watt-navy mb-4">Portfolio Risk Distribution</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={aggregateRiskData} layout="vertical">
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12, fill: '#1e3a5f' }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: '#1e3a5f' }} width={80} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                formatter={(value: number) => [`${value.toFixed(0)}%`, 'Risk Level']}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {aggregateRiskData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Site Detail / Radar Chart */}
        <div>
          <h4 className="font-semibold text-watt-navy mb-4">
            {selectedSiteData ? `${selectedSiteData.name} Risk Profile` : "Select a Site"}
          </h4>
          {selectedSiteData ? (
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={getRadarData(selectedSiteData)}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#1e3a5f' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10, fill: '#1e3a5f' }} />
                <Radar
                  name="Risk Resilience"
                  dataKey="A"
                  stroke="#22c55e"
                  fill="#22c55e"
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-watt-navy/50 text-sm">
              Click on a site to view detailed risk profile
            </div>
          )}
        </div>
      </div>

      {/* Add Site Modal */}
      {showAddSite && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setShowAddSite(false)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-white border border-gray-200 rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-watt-navy mb-4">Add New Site</h3>
            <div className="space-y-4">
              <div>
                <Label className="text-watt-navy">Site Name</Label>
                <Input 
                  value={newSite.name}
                  onChange={e => setNewSite({...newSite, name: e.target.value})}
                  placeholder="e.g., Montana Site Gamma"
                />
              </div>
              <div>
                <Label className="text-watt-navy">Location</Label>
                <Input 
                  value={newSite.location}
                  onChange={e => setNewSite({...newSite, location: e.target.value})}
                  placeholder="e.g., Billings, MT"
                />
              </div>
              <div>
                <Label className="text-watt-navy">Region</Label>
                <Select value={newSite.region} onValueChange={v => setNewSite({...newSite, region: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Western Canada">Western Canada</SelectItem>
                    <SelectItem value="Eastern Canada">Eastern Canada</SelectItem>
                    <SelectItem value="US Southwest">US Southwest</SelectItem>
                    <SelectItem value="US Midwest">US Midwest</SelectItem>
                    <SelectItem value="Nordic">Nordic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-watt-navy">Capacity (MW)</Label>
                <Input 
                  type="number"
                  value={newSite.capacityMW}
                  onChange={e => setNewSite({...newSite, capacityMW: parseInt(e.target.value) || 0})}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={() => setShowAddSite(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={addSite} className="flex-1" disabled={!newSite.name || !newSite.location}>
                  Add Site
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};
