import { useState } from 'react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { Globe, TrendingDown, TrendingUp, Minus, MapPin } from 'lucide-react';
import CitedStatistic from '@/components/academy/CitedStatistic';
import { ENERGY_COST_BENCHMARKS, DATA_SOURCES } from '@/constants/industry-standards';
import SiteSelectionLearningObjectives from './SiteSelectionLearningObjectives';
import SiteSelectionSectionSummary from './SiteSelectionSectionSummary';
import JurisdictionRecommender from './JurisdictionRecommender';

const EnergyMarketsSection = () => {
  const [selectedRegion, setSelectedRegion] = useState<string>('north-america');

  const formatRate = (range: { min: number; max: number }) => 
    `$${range.min.toFixed(3)}-${range.max.toFixed(3)}`;

  const regions = {
    'north-america': {
      name: 'North America',
      markets: [
        { location: "Alberta, Canada (AESO)", rate: formatRate(ENERGY_COST_BENCHMARKS.ALBERTA), type: "Deregulated", trend: "stable", notes: "Cold climate, Self-Retailer model", source: DATA_SOURCES.AESO },
        { location: "Texas (ERCOT)", rate: formatRate(ENERGY_COST_BENCHMARKS.TEXAS), type: "Deregulated", trend: "up", notes: "No capacity market, curtailment revenue", source: DATA_SOURCES.ERCOT },
        { location: "Upstate New York", rate: "$0.035-0.050", type: "ISO-NE", trend: "stable", notes: "Hydro availability" },
        { location: "Washington State", rate: "$0.025-0.040", type: "BPA/Utility", trend: "stable", notes: "Abundant hydro, limited capacity" },
        { location: "Kentucky/Tennessee", rate: "$0.040-0.055", type: "TVA/Utility", trend: "stable", notes: "Coal transition sites" },
        { location: "Wyoming", rate: "$0.030-0.045", type: "Utility", trend: "down", notes: "Wind PPAs, coal retirements" }
      ]
    },
    'international': {
      name: 'International',
      markets: [
        { location: "Paraguay", rate: formatRate(ENERGY_COST_BENCHMARKS.PARAGUAY), type: "Hydro", trend: "stable", notes: "Itaipu surplus, USD payments" },
        { location: "Iceland", rate: formatRate(ENERGY_COST_BENCHMARKS.ICELAND), type: "Geothermal", trend: "stable", notes: "100% renewable, cold climate" },
        { location: "Norway", rate: formatRate(ENERGY_COST_BENCHMARKS.NORWAY), type: "Hydro", trend: "up", notes: "Abundant hydro, EU interconnection" },
        { location: "Kazakhstan", rate: formatRate(ENERGY_COST_BENCHMARKS.KAZAKHSTAN), type: "Mixed", trend: "stable", notes: "Coal/gas, regulatory risk" },
        { location: "UAE/Oman", rate: "$0.030-0.045", type: "Gas", trend: "stable", notes: "Stranded gas, hot climate" },
        { location: "Ethiopia", rate: formatRate(ENERGY_COST_BENCHMARKS.ETHIOPIA), type: "Hydro", trend: "down", notes: "GERD project, political risk" }
      ]
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-red-400" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-watt-success" />;
      default: return <Minus className="w-4 h-4 text-blue-400" />;
    }
  };

  const marketStructures = [
    {
      type: "Deregulated/ISO",
      examples: "ERCOT, AESO, PJM",
      pros: ["Direct pool access", "Price transparency", "Curtailment revenue", "Flexible PPAs"],
      cons: ["Price volatility", "Complex trading", "Ancillary costs"],
      bestFor: "Sophisticated operators with trading capability"
    },
    {
      type: "Regulated Utility",
      examples: "TVA, BPA, Most US states",
      pros: ["Stable rates", "Simple billing", "Predictable costs"],
      cons: ["Limited negotiation", "No upside participation", "Capacity constraints"],
      bestFor: "Operators wanting simplicity and stability"
    },
    {
      type: "Direct PPA",
      examples: "Wind/Solar farms, Industrial sites",
      pros: ["Fixed long-term rates", "Renewable credits", "Below-market pricing"],
      cons: ["Curtailment risk", "Generation variability", "Contract complexity"],
      bestFor: "Large operators with long-term horizons"
    }
  ];

  return (
    <section id="energy-markets" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 bg-watt-purple/10 text-watt-purple rounded-full text-sm font-medium mb-4">
              Energy Markets
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-watt-navy mb-4">
              Global Energy Market Analysis
            </h2>
            <p className="text-watt-navy/70 max-w-2xl mx-auto">
              Compare energy costs, market structures, and regulatory environments 
              across top Bitcoin mining jurisdictions worldwide.
            </p>
          </div>
        </ScrollReveal>

        {/* Learning Objectives */}
        <ScrollReveal delay={50}>
          <SiteSelectionLearningObjectives
            objectives={[
              "Compare deregulated vs regulated energy markets and their implications",
              "Analyze all-in energy costs beyond headline rates (transmission, demand charges, ancillary)",
              "Identify lowest-cost jurisdictions globally and understand their trade-offs",
              "Evaluate market structure fit based on your operational sophistication"
            ]}
            estimatedTime="10 min"
            prerequisites={[
              { title: "Power Infrastructure", href: "#power-infrastructure" }
            ]}
          />
        </ScrollReveal>

        {/* Region Selector & Table */}
        <ScrollReveal delay={100}>
          <div className="bg-gray-50 rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-4 mb-6">
              <Globe className="w-5 h-5 text-watt-purple" />
              <div className="flex gap-2">
                {Object.entries(regions).map(([key, region]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedRegion(key)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      selectedRegion === key
                        ? 'bg-watt-purple text-white'
                        : 'bg-white text-watt-navy hover:bg-watt-purple/10'
                    }`}
                  >
                    {region.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-watt-navy font-semibold">Location</th>
                    <th className="text-left py-3 px-4 text-watt-navy font-semibold">Energy Rate</th>
                    <th className="text-left py-3 px-4 text-watt-navy font-semibold">Market Type</th>
                    <th className="text-left py-3 px-4 text-watt-navy font-semibold">Trend</th>
                    <th className="text-left py-3 px-4 text-watt-navy font-semibold hidden md:table-cell">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {regions[selectedRegion as keyof typeof regions].markets.map((market, idx) => (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-white transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-watt-purple" />
                          <span className="font-medium text-watt-navy">{market.location}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {'source' in market ? (
                          <CitedStatistic
                            value={market.rate}
                            unit="/kWh"
                            label={`Energy rate for ${market.location}`}
                            source={market.source.name}
                            sourceUrl={market.source.url}
                            variant="success"
                            size="sm"
                          />
                        ) : (
                          <span className="font-bold text-watt-success">{market.rate}/kWh</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-watt-navy">{market.type}</td>
                      <td className="py-3 px-4">{getTrendIcon(market.trend)}</td>
                      <td className="py-3 px-4 text-watt-navy/60 hidden md:table-cell">{market.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </ScrollReveal>

        {/* Interactive Jurisdiction Recommender */}
        <ScrollReveal delay={150}>
          <JurisdictionRecommender />
        </ScrollReveal>

        {/* Market Structures Comparison */}
        <ScrollReveal delay={200}>
          <h3 className="text-2xl font-bold text-watt-navy mb-6 text-center mt-8">
            Market Structure Comparison
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {marketStructures.map((structure, idx) => (
              <div key={idx} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="text-center mb-4">
                  <h4 className="text-lg font-bold text-watt-navy">{structure.type}</h4>
                  <p className="text-sm text-watt-navy/60">{structure.examples}</p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h5 className="text-sm font-semibold text-watt-success mb-2">Advantages</h5>
                    <ul className="space-y-1">
                      {structure.pros.map((pro, i) => (
                        <li key={i} className="text-sm text-watt-navy/70 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-watt-success rounded-full" />
                          {pro}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h5 className="text-sm font-semibold text-red-400 mb-2">Challenges</h5>
                    <ul className="space-y-1">
                      {structure.cons.map((con, i) => (
                        <li key={i} className="text-sm text-watt-navy/70 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                          {con}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-watt-navy/60">
                    <strong className="text-watt-purple">Best for:</strong> {structure.bestFor}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* Rate Components Breakdown */}
        <ScrollReveal delay={300}>
          <div className="mt-12 bg-watt-navy rounded-2xl p-8 text-white">
            <h3 className="text-xl font-bold mb-6 text-center">Understanding Your All-In Energy Cost</h3>
            <div className="grid md:grid-cols-5 gap-4">
              {[
                { component: "Energy Charge", range: "$0.02-0.06", desc: "Wholesale or retail $/kWh" },
                { component: "Transmission", range: `$${ENERGY_COST_BENCHMARKS.TRANSMISSION_TYPICAL.min.toFixed(3)}-${ENERGY_COST_BENCHMARKS.TRANSMISSION_TYPICAL.max.toFixed(3)}`, desc: "Grid delivery charges" },
                { component: "Distribution", range: `$${ENERGY_COST_BENCHMARKS.DISTRIBUTION_TYPICAL.min.toFixed(2)}-${ENERGY_COST_BENCHMARKS.DISTRIBUTION_TYPICAL.max.toFixed(2)}`, desc: "Local utility (if applicable)" },
                { component: "Demand Charge", range: `$${ENERGY_COST_BENCHMARKS.DEMAND_CHARGE_PER_KW.min}-${ENERGY_COST_BENCHMARKS.DEMAND_CHARGE_PER_KW.max}/kW`, desc: "Peak demand fee monthly" },
                { component: "Ancillary/Other", range: `$${ENERGY_COST_BENCHMARKS.ANCILLARY_TYPICAL.min.toFixed(3)}-${ENERGY_COST_BENCHMARKS.ANCILLARY_TYPICAL.max.toFixed(2)}`, desc: "Reserves, admin, taxes" }
              ].map((item, idx) => (
                <div key={idx} className="text-center p-4 bg-white/5 rounded-xl">
                  <div className="text-watt-bitcoin font-bold text-lg mb-1">{item.range}</div>
                  <div className="font-medium text-white/90 text-sm">{item.component}</div>
                  <div className="text-white/50 text-xs mt-1">{item.desc}</div>
                </div>
              ))}
            </div>
            <p className="text-center text-white/70 text-sm mt-6">
              Always calculate your <span className="text-watt-bitcoin font-semibold">all-in cost</span> including 
              all components — headline rates can be misleading
            </p>
          </div>
        </ScrollReveal>

        {/* Section Summary */}
        <ScrollReveal delay={350}>
          <SiteSelectionSectionSummary
            keyTakeaways={[
              "All-in energy cost includes 5+ components beyond the headline rate — always calculate the full picture",
              "Deregulated markets (ERCOT, AESO) offer flexibility but require trading sophistication",
              "Cold-climate locations (Alberta, Iceland, Norway) combine low energy costs with cooling advantages",
              "Direct PPAs with renewables can lock in $0.02-0.03/kWh for 10+ years"
            ]}
            proTip="When evaluating international jurisdictions, factor in currency risk, political stability, and infrastructure quality. The cheapest energy doesn't help if you can't reliably operate."
            nextSection={{
              title: "Regulatory Environment",
              href: "#regulatory"
            }}
          />
        </ScrollReveal>
      </div>
    </section>
  );
};

export default EnergyMarketsSection;
