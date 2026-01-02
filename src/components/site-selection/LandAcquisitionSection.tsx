import { useState } from 'react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { MapPin, Building, FileText, DollarSign, Calculator } from 'lucide-react';
import SiteSelectionLearningObjectives from './SiteSelectionLearningObjectives';
import SiteSelectionSectionSummary from './SiteSelectionSectionSummary';

const LandAcquisitionSection = () => {
  const [landSize, setLandSize] = useState<number>(20);
  const [pricePerAcre, setPricePerAcre] = useState<number>(15000);

  const zoningTypes = [
    {
      zone: "Industrial (M1/M2)",
      suitability: "Excellent",
      description: "Heavy industrial use permitted by right",
      requirements: "Standard building permit",
      examples: "Manufacturing zones, industrial parks",
      color: "bg-watt-success"
    },
    {
      zone: "Light Industrial (LI)",
      suitability: "Good",
      description: "May require conditional use permit",
      requirements: "CUP, noise mitigation",
      examples: "Business parks, flex spaces",
      color: "bg-blue-500"
    },
    {
      zone: "Agricultural (A1/A2)",
      suitability: "Possible",
      description: "Often allows industrial with special permit",
      requirements: "Rezoning or special use permit",
      examples: "Rural areas, farmland",
      color: "bg-watt-bitcoin"
    },
    {
      zone: "Commercial (C)",
      suitability: "Unlikely",
      description: "Typically prohibits heavy power use",
      requirements: "Variance, unlikely approval",
      examples: "Retail, office zones",
      color: "bg-red-500"
    },
    {
      zone: "Residential (R)",
      suitability: "No",
      description: "Not permitted",
      requirements: "Complete rezoning required",
      examples: "Neighborhoods, subdivisions",
      color: "bg-gray-500"
    }
  ];

  const purchaseVsLease = [
    { factor: "Upfront Capital", purchase: "High ($500K-5M+)", lease: "Low (deposits only)" },
    { factor: "Monthly Cost", purchase: "None (owned)", lease: "$2-10K/acre/year" },
    { factor: "Flexibility", purchase: "Low (asset locked)", lease: "High (term options)" },
    { factor: "Appreciation", purchase: "Captured", lease: "None" },
    { factor: "Improvements", purchase: "Full ownership", lease: "Negotiate terms" },
    { factor: "Exit Strategy", purchase: "Sell asset", lease: "Walk away" },
    { factor: "Financing", purchase: "Mortgage available", lease: "Not required" },
    { factor: "Best For", purchase: "Long-term (10+ years)", lease: "Short-term (3-7 years)" }
  ];

  const siteSizingGuide = [
    { capacity: "10 MW", acres: "2-5", containers: "10-20", building: "10,000 sqft" },
    { capacity: "25 MW", acres: "5-10", containers: "25-50", building: "25,000 sqft" },
    { capacity: "50 MW", acres: "10-15", containers: "50-100", building: "50,000 sqft" },
    { capacity: "100 MW", acres: "15-25", containers: "100-200", building: "100,000 sqft" },
    { capacity: "200 MW", acres: "30-50", containers: "200-400", building: "200,000 sqft" }
  ];

  const totalLandCost = landSize * pricePerAcre;
  const monthlyLeaseEstimate = landSize * 5000 / 12;

  return (
    <section id="land-acquisition" className="py-20 bg-muted">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 bg-watt-purple/10 text-watt-purple rounded-full text-sm font-medium mb-4">
              Land Acquisition
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Land & Property Strategies
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Securing the right property with proper zoning is critical. 
              Understand purchase vs. lease tradeoffs and site sizing requirements.
            </p>
          </div>
        </ScrollReveal>

        {/* Learning Objectives */}
        <ScrollReveal delay={50}>
          <SiteSelectionLearningObjectives
            objectives={[
              "Match zoning classifications to mining suitability (Industrial, Agricultural, etc.)",
              "Compare purchase vs lease economics for different investment horizons",
              "Size land requirements based on MW capacity needs (2-50 acres)",
              "Calculate land costs and breakeven timelines for purchase vs lease"
            ]}
            estimatedTime="8 min"
            prerequisites={[
              { title: "Climate Analysis", href: "#climate" }
            ]}
          />
        </ScrollReveal>

        {/* Zoning Guide */}
        <ScrollReveal delay={100}>
          <div className="bg-card rounded-2xl shadow-lg border border-border p-6 mb-8">
            <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-watt-purple" />
              Zoning Classification Guide
            </h3>
            <div className="space-y-4">
              {zoningTypes.map((zone, idx) => (
                <div key={idx} className="flex items-start gap-4 p-4 rounded-xl hover:bg-muted/50 transition-colors">
                  <div className={`w-3 h-3 rounded-full mt-1.5 ${zone.color}`} />
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                      <div>
                        <span className="font-semibold text-foreground">{zone.zone}</span>
                        <span className={`ml-2 text-xs px-2 py-0.5 rounded ${
                          zone.suitability === 'Excellent' ? 'bg-watt-success/20 text-watt-success' :
                          zone.suitability === 'Good' ? 'bg-blue-100 text-blue-600' :
                          zone.suitability === 'Possible' ? 'bg-watt-bitcoin/20 text-watt-bitcoin' :
                          zone.suitability === 'Unlikely' ? 'bg-red-100 text-red-600' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {zone.suitability}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">{zone.requirements}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{zone.description}</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">Examples: {zone.examples}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* Purchase vs Lease */}
        <ScrollReveal delay={200}>
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="bg-card rounded-2xl shadow-lg border border-border p-6">
              <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                <Building className="w-5 h-5 text-watt-purple" />
                Purchase vs. Lease Comparison
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 text-foreground font-semibold">Factor</th>
                      <th className="text-left py-2 text-watt-success font-semibold">Purchase</th>
                      <th className="text-left py-2 text-watt-bitcoin font-semibold">Lease</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchaseVsLease.map((row, idx) => (
                      <tr key={idx} className="border-b border-border">
                        <td className="py-2 text-foreground font-medium">{row.factor}</td>
                        <td className="py-2 text-muted-foreground">{row.purchase}</td>
                        <td className="py-2 text-muted-foreground">{row.lease}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Site Sizing */}
            <div className="bg-card rounded-2xl shadow-lg border border-border p-6">
              <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5 text-watt-purple" />
                Site Sizing Guide
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 text-foreground font-semibold">Capacity</th>
                      <th className="text-left py-2 text-foreground font-semibold">Land</th>
                      <th className="text-left py-2 text-foreground font-semibold">Containers</th>
                      <th className="text-left py-2 text-foreground font-semibold">Building</th>
                    </tr>
                  </thead>
                  <tbody>
                    {siteSizingGuide.map((row, idx) => (
                      <tr key={idx} className="border-b border-border">
                        <td className="py-2 font-bold text-watt-purple">{row.capacity}</td>
                        <td className="py-2 text-muted-foreground">{row.acres} acres</td>
                        <td className="py-2 text-muted-foreground">{row.containers}</td>
                        <td className="py-2 text-muted-foreground">{row.building}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                * Includes setbacks, parking, switchyard, future expansion. Actual requirements vary by cooling type.
              </p>
            </div>
          </div>
        </ScrollReveal>

        {/* Cost Calculator */}
        <ScrollReveal delay={300}>
          <div className="bg-watt-navy rounded-2xl p-8 text-white">
            <h3 className="text-xl font-bold mb-6 text-center flex items-center justify-center gap-2">
              <Calculator className="w-5 h-5 text-watt-bitcoin" />
              Land Cost Estimator
            </h3>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-white/70 mb-2">Land Size (acres)</label>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    value={landSize}
                    onChange={(e) => setLandSize(Number(e.target.value))}
                    className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-sm text-white/50 mt-1">
                    <span>5 acres</span>
                    <span className="text-watt-bitcoin font-bold">{landSize} acres</span>
                    <span>100 acres</span>
                  </div>
                </div>

                <div>
                  <label className="block text-white/70 mb-2">Price per Acre ($)</label>
                  <input
                    type="range"
                    min="5000"
                    max="100000"
                    step="1000"
                    value={pricePerAcre}
                    onChange={(e) => setPricePerAcre(Number(e.target.value))}
                    className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-sm text-white/50 mt-1">
                    <span>$5K</span>
                    <span className="text-watt-bitcoin font-bold">${(pricePerAcre/1000).toFixed(0)}K</span>
                    <span>$100K</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 rounded-xl p-4 text-center">
                  <DollarSign className="w-6 h-6 text-watt-success mx-auto mb-2" />
                  <div className="text-2xl font-bold text-watt-success">
                    ${(totalLandCost / 1000000).toFixed(2)}M
                  </div>
                  <div className="text-sm text-white/60">Purchase Price</div>
                </div>
                <div className="bg-white/10 rounded-xl p-4 text-center">
                  <Building className="w-6 h-6 text-watt-bitcoin mx-auto mb-2" />
                  <div className="text-2xl font-bold text-watt-bitcoin">
                    ${(monthlyLeaseEstimate / 1000).toFixed(1)}K
                  </div>
                  <div className="text-sm text-white/60">Est. Monthly Lease</div>
                </div>
                <div className="col-span-2 bg-white/10 rounded-xl p-4 text-center">
                  <div className="text-sm text-white/60 mb-1">Breakeven vs Lease</div>
                  <div className="text-xl font-bold text-white">
                    {(totalLandCost / (monthlyLeaseEstimate * 12)).toFixed(1)} years
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Section Summary */}
        <ScrollReveal delay={350}>
          <SiteSelectionSectionSummary
            keyTakeaways={[
              "Industrial (M1/M2) zoning is ideal — mining is permitted by right with standard building permits",
              "Agricultural land can work but typically requires special use permits (add 3-6 months)",
              "A 100 MW facility needs 15-25 acres including setbacks, switchyard, and expansion room",
              "Purchase makes sense for 10+ year horizons; lease provides flexibility for 3-7 year operations"
            ]}
            proTip="Even if you plan to purchase, consider a lease-to-own structure. This lets you start operations faster while the purchase closes, and provides an exit if regulatory or power issues emerge."
            nextSection={{
              title: "Due Diligence",
              id: "due-diligence"
            }}
          />
        </ScrollReveal>
      </div>
    </section>
  );
};

export default LandAcquisitionSection;
