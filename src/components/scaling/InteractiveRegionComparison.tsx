import { useState } from "react";
import { Globe, Zap, Thermometer, Shield, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Region {
  id: string;
  name: string;
  location: string;
  flag: string;
  powerCost: number;
  climate: string;
  climateScore: number;
  regulatory: string;
  regulatoryScore: number;
  advantages: string[];
  risks: string[];
  overallScore: number;
}

const regions: Region[] = [
  {
    id: "alberta",
    name: "Alberta",
    location: "Canada",
    flag: "🇨🇦",
    powerCost: 3.5,
    climate: "Cold Continental",
    climateScore: 95,
    regulatory: "Pro-Mining",
    regulatoryScore: 90,
    advantages: ["Natural cooling 8 months/year", "Stable grid", "Low power costs", "Mining-friendly policy"],
    risks: ["Extreme cold requires preparation", "Remote locations"],
    overallScore: 92
  },
  {
    id: "texas",
    name: "Texas",
    location: "USA",
    flag: "🇺🇸",
    powerCost: 4.5,
    climate: "Hot Subtropical",
    climateScore: 60,
    regulatory: "Deregulated",
    regulatoryScore: 85,
    advantages: ["Deregulated market", "Grid participation revenue", "No state income tax", "Major mining hub"],
    risks: ["Extreme heat in summer", "Grid instability events", "Hurricane risk"],
    overallScore: 78
  },
  {
    id: "paraguay",
    name: "Paraguay",
    location: "South America",
    flag: "🇵🇾",
    powerCost: 2.5,
    climate: "Subtropical",
    climateScore: 55,
    regulatory: "Emerging",
    regulatoryScore: 65,
    advantages: ["Cheapest hydro power globally", "100% renewable", "Growing crypto adoption"],
    risks: ["Regulatory uncertainty", "Infrastructure gaps", "Political risk"],
    overallScore: 68
  },
  {
    id: "iceland",
    name: "Iceland",
    location: "Europe",
    flag: "🇮🇸",
    powerCost: 4.0,
    climate: "Cold Oceanic",
    climateScore: 98,
    regulatory: "Established",
    regulatoryScore: 95,
    advantages: ["100% renewable geothermal", "Excellent cooling", "Stable jurisdiction", "ESG compliant"],
    risks: ["Limited power availability", "Remote location", "High labor costs"],
    overallScore: 88
  },
  {
    id: "uae",
    name: "UAE",
    location: "Middle East",
    flag: "🇦🇪",
    powerCost: 5.0,
    climate: "Hot Desert",
    climateScore: 30,
    regulatory: "Supportive",
    regulatoryScore: 80,
    advantages: ["Free trade zones", "No taxes", "Growing crypto hub", "Capital availability"],
    risks: ["Extreme heat", "High cooling costs", "Water scarcity"],
    overallScore: 65
  },
  {
    id: "norway",
    name: "Norway",
    location: "Europe",
    flag: "🇳🇴",
    powerCost: 3.0,
    climate: "Cold Nordic",
    climateScore: 97,
    regulatory: "Established",
    regulatoryScore: 85,
    advantages: ["Cheap hydro power", "Excellent cooling", "Stable grid", "ESG compliant"],
    risks: ["Increasing electricity taxes", "Limited expansion capacity"],
    overallScore: 85
  }
];

export const InteractiveRegionComparison = () => {
  const [selectedRegions, setSelectedRegions] = useState<string[]>(["alberta", "texas"]);

  const toggleRegion = (regionId: string) => {
    if (selectedRegions.includes(regionId)) {
      if (selectedRegions.length > 1) {
        setSelectedRegions(selectedRegions.filter(id => id !== regionId));
      }
    } else if (selectedRegions.length < 3) {
      setSelectedRegions([...selectedRegions, regionId]);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-watt-success';
    if (score >= 60) return 'text-watt-bitcoin';
    return 'text-destructive';
  };

  const getScoreBar = (score: number) => {
    return (
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full ${
            score >= 80 ? 'bg-watt-success' : 
            score >= 60 ? 'bg-watt-bitcoin' : 'bg-destructive'
          }`}
          style={{ width: `${score}%` }}
        />
      </div>
    );
  };

  const selectedRegionData = regions.filter(r => selectedRegions.includes(r.id));

  return (
    <div className="bg-card rounded-xl p-6 shadow-lg border border-border">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-watt-success/10 rounded-lg flex items-center justify-center">
          <Globe className="w-6 h-6 text-watt-success" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-foreground">Region Comparison Tool</h3>
          <p className="text-sm text-muted-foreground">Select 2-3 regions to compare</p>
        </div>
      </div>

      {/* Region Selector */}
      <div className="flex flex-wrap gap-2 mb-6">
        {regions.map(region => (
          <Button
            key={region.id}
            variant={selectedRegions.includes(region.id) ? "default" : "outline"}
            size="sm"
            onClick={() => toggleRegion(region.id)}
            className={selectedRegions.includes(region.id) ? "bg-watt-success hover:bg-watt-success/90" : ""}
          >
            <span className="mr-1">{region.flag}</span>
            {region.name}
            {selectedRegions.includes(region.id) && <Check className="w-3 h-3 ml-1" />}
          </Button>
        ))}
      </div>

      {/* Comparison Grid */}
      <div className={`grid gap-4 ${selectedRegionData.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
        {selectedRegionData.map(region => (
          <div key={region.id} className="bg-muted/20 rounded-xl p-5 border border-border">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">{region.flag}</span>
              <div>
                <h4 className="font-bold text-foreground">{region.name}</h4>
                <p className="text-xs text-muted-foreground">{region.location}</p>
              </div>
            </div>

            {/* Overall Score */}
            <div className="bg-background rounded-lg p-3 mb-4 text-center">
              <div className={`text-3xl font-bold ${getScoreColor(region.overallScore)}`}>
                {region.overallScore}
              </div>
              <div className="text-xs text-muted-foreground">Overall Score</div>
            </div>

            {/* Metrics */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Zap className="w-3 h-3" /> Power Cost
                  </span>
                  <span className="font-medium text-foreground">${region.powerCost}¢/kWh</span>
                </div>
                {getScoreBar(100 - (region.powerCost * 12))}
              </div>

              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Thermometer className="w-3 h-3" /> Climate
                  </span>
                  <span className="font-medium text-foreground">{region.climate}</span>
                </div>
                {getScoreBar(region.climateScore)}
              </div>

              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Shield className="w-3 h-3" /> Regulatory
                  </span>
                  <span className="font-medium text-foreground">{region.regulatory}</span>
                </div>
                {getScoreBar(region.regulatoryScore)}
              </div>
            </div>

            {/* Advantages */}
            <div className="mt-4 pt-4 border-t border-border">
              <div className="text-xs font-medium text-watt-success mb-2">Advantages</div>
              <ul className="space-y-1">
                {region.advantages.slice(0, 3).map((adv, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex items-start gap-1">
                    <Check className="w-3 h-3 text-watt-success flex-shrink-0 mt-0.5" />
                    {adv}
                  </li>
                ))}
              </ul>
            </div>

            {/* Risks */}
            <div className="mt-3">
              <div className="text-xs font-medium text-destructive mb-2">Risks</div>
              <ul className="space-y-1">
                {region.risks.slice(0, 2).map((risk, i) => (
                  <li key={i} className="text-xs text-muted-foreground">• {risk}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Insights */}
      <div className="mt-6 pt-4 border-t border-border">
        <h4 className="font-semibold text-foreground mb-3">Quick Insights</h4>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div className="bg-watt-success/10 rounded-lg p-3">
            <div className="font-medium text-watt-success mb-1">Best Power Cost</div>
            <div className="text-foreground">
              {regions.reduce((a, b) => a.powerCost < b.powerCost ? a : b).name} at $
              {regions.reduce((a, b) => a.powerCost < b.powerCost ? a : b).powerCost}¢
            </div>
          </div>
          <div className="bg-watt-bitcoin/10 rounded-lg p-3">
            <div className="font-medium text-watt-bitcoin mb-1">Best Climate</div>
            <div className="text-foreground">
              {regions.reduce((a, b) => a.climateScore > b.climateScore ? a : b).name} ({
              regions.reduce((a, b) => a.climateScore > b.climateScore ? a : b).climateScore}/100)
            </div>
          </div>
          <div className="bg-purple-500/10 rounded-lg p-3">
            <div className="font-medium text-purple-500 mb-1">Best Regulatory</div>
            <div className="text-foreground">
              {regions.reduce((a, b) => a.regulatoryScore > b.regulatoryScore ? a : b).name} ({
              regions.reduce((a, b) => a.regulatoryScore > b.regulatoryScore ? a : b).regulatoryScore}/100)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
