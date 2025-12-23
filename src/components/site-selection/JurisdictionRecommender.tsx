import { useState } from 'react';
import { Globe, Zap, Scale, Clock, Thermometer, ArrowRight } from 'lucide-react';

const JurisdictionRecommender = () => {
  const [priorities, setPriorities] = useState({
    energyCost: 50,
    regulatoryStability: 50,
    speedToEnergize: 50,
    climateAdvantage: 50
  });

  const jurisdictions = [
    {
      name: "Alberta, Canada",
      scores: { energyCost: 85, regulatoryStability: 90, speedToEnergize: 80, climateAdvantage: 95 },
      highlights: ["Cold climate (free cooling)", "Deregulated market", "Clear regulations"],
      energyRate: "$0.03-0.05/kWh"
    },
    {
      name: "Texas (ERCOT)",
      scores: { energyCost: 80, regulatoryStability: 75, speedToEnergize: 60, climateAdvantage: 40 },
      highlights: ["Curtailment revenue", "No state income tax", "Large capacity"],
      energyRate: "$0.03-0.06/kWh"
    },
    {
      name: "Wyoming",
      scores: { energyCost: 75, regulatoryStability: 95, speedToEnergize: 85, climateAdvantage: 80 },
      highlights: ["Digital asset legislation", "Wind PPAs", "Pro-crypto"],
      energyRate: "$0.03-0.045/kWh"
    },
    {
      name: "Paraguay",
      scores: { energyCost: 98, regulatoryStability: 55, speedToEnergize: 60, climateAdvantage: 30 },
      highlights: ["Cheapest hydro globally", "USD contracts", "Itaipu surplus"],
      energyRate: "$0.02-0.03/kWh"
    },
    {
      name: "Iceland",
      scores: { energyCost: 70, regulatoryStability: 95, speedToEnergize: 70, climateAdvantage: 100 },
      highlights: ["100% renewable", "Extreme cold", "Stable government"],
      energyRate: "$0.04-0.06/kWh"
    },
    {
      name: "Kentucky/Tennessee",
      scores: { energyCost: 70, regulatoryStability: 80, speedToEnergize: 75, climateAdvantage: 55 },
      highlights: ["TVA power", "Coal transition sites", "Moderate climate"],
      energyRate: "$0.04-0.055/kWh"
    }
  ];

  const calculateMatch = (jurisdiction: typeof jurisdictions[0]) => {
    const totalWeight = priorities.energyCost + priorities.regulatoryStability + 
                        priorities.speedToEnergize + priorities.climateAdvantage;
    
    const weightedScore = (
      (jurisdiction.scores.energyCost * priorities.energyCost) +
      (jurisdiction.scores.regulatoryStability * priorities.regulatoryStability) +
      (jurisdiction.scores.speedToEnergize * priorities.speedToEnergize) +
      (jurisdiction.scores.climateAdvantage * priorities.climateAdvantage)
    ) / totalWeight;
    
    return Math.round(weightedScore);
  };

  const rankedJurisdictions = [...jurisdictions]
    .map(j => ({ ...j, matchScore: calculateMatch(j) }))
    .sort((a, b) => b.matchScore - a.matchScore);

  const topThree = rankedJurisdictions.slice(0, 3);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <h3 className="text-xl font-bold text-watt-navy mb-6 flex items-center gap-2">
        <Globe className="w-5 h-5 text-watt-purple" />
        Jurisdiction Recommender
      </h3>
      <p className="text-sm text-watt-navy/70 mb-6">
        Adjust the sliders to match your priorities, and we'll recommend the best jurisdictions for your operation.
      </p>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Priority Sliders */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-watt-navy flex items-center gap-2">
                <Zap className="w-4 h-4 text-watt-bitcoin" />
                Energy Cost Priority
              </label>
              <span className="text-sm text-watt-purple font-bold">{priorities.energyCost}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={priorities.energyCost}
              onChange={(e) => setPriorities(p => ({ ...p, energyCost: Number(e.target.value) }))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <p className="text-xs text-watt-navy/50 mt-1">How important is lowest $/kWh?</p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-watt-navy flex items-center gap-2">
                <Scale className="w-4 h-4 text-watt-purple" />
                Regulatory Stability
              </label>
              <span className="text-sm text-watt-purple font-bold">{priorities.regulatoryStability}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={priorities.regulatoryStability}
              onChange={(e) => setPriorities(p => ({ ...p, regulatoryStability: Number(e.target.value) }))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <p className="text-xs text-watt-navy/50 mt-1">Long-term policy certainty preference</p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-watt-navy flex items-center gap-2">
                <Clock className="w-4 h-4 text-watt-success" />
                Speed to Energize
              </label>
              <span className="text-sm text-watt-purple font-bold">{priorities.speedToEnergize}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={priorities.speedToEnergize}
              onChange={(e) => setPriorities(p => ({ ...p, speedToEnergize: Number(e.target.value) }))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <p className="text-xs text-watt-navy/50 mt-1">How quickly do you need to be operational?</p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-watt-navy flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-blue-500" />
                Climate Advantage
              </label>
              <span className="text-sm text-watt-purple font-bold">{priorities.climateAdvantage}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={priorities.climateAdvantage}
              onChange={(e) => setPriorities(p => ({ ...p, climateAdvantage: Number(e.target.value) }))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <p className="text-xs text-watt-navy/50 mt-1">Cold climate for lower PUE importance</p>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-watt-navy">Top Recommendations</h4>
          {topThree.map((jurisdiction, idx) => (
            <div 
              key={jurisdiction.name}
              className={`p-4 rounded-xl border transition-all ${
                idx === 0 
                  ? 'bg-watt-success/10 border-watt-success/30' 
                  : 'bg-gray-50 border-gray-100'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                    idx === 0 ? 'bg-watt-success text-white' : 'bg-gray-300 text-gray-600'
                  }`}>
                    {idx + 1}
                  </span>
                  <span className="font-semibold text-watt-navy">{jurisdiction.name}</span>
                </div>
                <span className={`text-lg font-bold ${
                  idx === 0 ? 'text-watt-success' : 'text-watt-navy'
                }`}>
                  {jurisdiction.matchScore}%
                </span>
              </div>
              <div className="text-sm text-watt-bitcoin font-medium mb-2">
                {jurisdiction.energyRate}
              </div>
              <div className="flex flex-wrap gap-1">
                {jurisdiction.highlights.map((h, i) => (
                  <span key={i} className="text-xs px-2 py-0.5 bg-white rounded text-watt-navy/70">
                    {h}
                  </span>
                ))}
              </div>
            </div>
          ))}

          <div className="mt-4 p-3 bg-watt-purple/10 rounded-lg">
            <p className="text-xs text-watt-navy/70">
              <strong className="text-watt-purple">Note:</strong> These recommendations are based on 
              your priority weights. Always perform comprehensive due diligence before committing to a jurisdiction.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JurisdictionRecommender;
