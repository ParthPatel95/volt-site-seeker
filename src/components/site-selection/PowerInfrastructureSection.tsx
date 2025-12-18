import { useState } from 'react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { Zap, Activity, AlertTriangle, CheckCircle2, Info } from 'lucide-react';

const PowerInfrastructureSection = () => {
  const [selectedVoltage, setSelectedVoltage] = useState<string>('138kV');

  const voltageClasses = [
    {
      voltage: "500kV",
      type: "Extra High Voltage (EHV)",
      capacity: "500+ MW",
      typical: "Bulk transmission, interconnections",
      suitability: "Too large for most mining",
      color: "text-red-400"
    },
    {
      voltage: "230kV",
      type: "High Voltage",
      capacity: "100-500 MW",
      typical: "Major substations, industrial parks",
      suitability: "Large-scale operations (100+ MW)",
      color: "text-watt-bitcoin"
    },
    {
      voltage: "138kV",
      type: "Sub-Transmission",
      capacity: "25-150 MW",
      typical: "Regional distribution, large customers",
      suitability: "Ideal for 25-100 MW facilities",
      color: "text-watt-success"
    },
    {
      voltage: "69kV",
      type: "Distribution",
      capacity: "10-50 MW",
      typical: "Local substations, medium industry",
      suitability: "Good for 10-50 MW operations",
      color: "text-watt-success"
    },
    {
      voltage: "25kV",
      type: "Primary Distribution",
      capacity: "2-15 MW",
      typical: "Commercial/small industrial",
      suitability: "Small operations, containers",
      color: "text-blue-400"
    }
  ];

  const substationChecklist = [
    { item: "Available capacity (MVA)", critical: true, notes: "Request from utility, verify load studies" },
    { item: "Voltage levels available", critical: true, notes: "Match to your transformer requirements" },
    { item: "Distance to substation", critical: true, notes: "Affects interconnection cost ($1-3M/mile)" },
    { item: "Existing customer load", critical: false, notes: "Affects upgrade requirements" },
    { item: "Planned upgrades", critical: false, notes: "Utility capital improvement plans" },
    { item: "Interconnection queue position", critical: true, notes: "Determines timeline (6-36 months)" },
    { item: "Fault current available", critical: false, notes: "Affects protection equipment sizing" },
    { item: "Redundancy (N-1 capability)", critical: false, notes: "Single vs dual feed reliability" }
  ];

  const interconnectionCosts = [
    { component: "Transmission Line", range: "$1-3M/mile", notes: "Voltage dependent, terrain factors" },
    { component: "Substation Tap", range: "$500K-2M", notes: "Depends on existing infrastructure" },
    { component: "Customer Substation", range: "$2-8M", notes: "Transformers, switchgear, protection" },
    { component: "Engineering Studies", range: "$50-200K", notes: "System impact, facilities studies" },
    { component: "Utility Upgrades", range: "$0-20M+", notes: "If capacity constrained" },
    { component: "Permitting", range: "$25-100K", notes: "Environmental, local approvals" }
  ];

  return (
    <section id="power-infrastructure" className="py-20 bg-watt-light">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 bg-watt-purple/10 text-watt-purple rounded-full text-sm font-medium mb-4">
              Power Infrastructure
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-watt-navy mb-4">
              Evaluating Electrical Infrastructure
            </h2>
            <p className="text-watt-navy/70 max-w-2xl mx-auto">
              Understanding transmission systems, substation capacity, and interconnection 
              requirements is fundamental to site selection.
            </p>
          </div>
        </ScrollReveal>

        {/* Voltage Classes */}
        <ScrollReveal delay={100}>
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
            <h3 className="text-xl font-bold text-watt-navy mb-6 flex items-center gap-2">
              <Zap className="w-5 h-5 text-watt-purple" />
              Transmission Voltage Classes
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-watt-navy font-semibold">Voltage</th>
                    <th className="text-left py-3 px-4 text-watt-navy font-semibold">Classification</th>
                    <th className="text-left py-3 px-4 text-watt-navy font-semibold">Typical Capacity</th>
                    <th className="text-left py-3 px-4 text-watt-navy font-semibold hidden md:table-cell">Typical Use</th>
                    <th className="text-left py-3 px-4 text-watt-navy font-semibold">Mining Suitability</th>
                  </tr>
                </thead>
                <tbody>
                  {voltageClasses.map((vc, idx) => (
                    <tr 
                      key={idx}
                      className={`border-b border-gray-100 cursor-pointer transition-colors ${selectedVoltage === vc.voltage ? 'bg-watt-purple/5' : 'hover:bg-gray-50'}`}
                      onClick={() => setSelectedVoltage(vc.voltage)}
                    >
                      <td className={`py-3 px-4 font-bold ${vc.color}`}>{vc.voltage}</td>
                      <td className="py-3 px-4 text-watt-navy">{vc.type}</td>
                      <td className="py-3 px-4 text-watt-navy">{vc.capacity}</td>
                      <td className="py-3 px-4 text-watt-navy/70 hidden md:table-cell">{vc.typical}</td>
                      <td className="py-3 px-4 text-watt-navy/70">{vc.suitability}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 p-4 bg-watt-success/10 rounded-lg flex items-start gap-3">
              <Info className="w-5 h-5 text-watt-success flex-shrink-0 mt-0.5" />
              <p className="text-sm text-watt-navy/70">
                <strong className="text-watt-success">Sweet Spot:</strong> 69kV-138kV substations offer the best 
                balance of capacity, interconnection cost, and availability for most Bitcoin mining operations.
              </p>
            </div>
          </div>
        </ScrollReveal>

        {/* Substation Evaluation Checklist */}
        <ScrollReveal delay={200}>
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-watt-navy mb-6 flex items-center gap-2">
                <Activity className="w-5 h-5 text-watt-purple" />
                Substation Evaluation Checklist
              </h3>
              <div className="space-y-3">
                {substationChecklist.map((item, idx) => (
                  <div 
                    key={idx}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {item.critical ? (
                      <AlertTriangle className="w-5 h-5 text-watt-bitcoin flex-shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-watt-success flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="font-medium text-watt-navy flex items-center gap-2">
                        {item.item}
                        {item.critical && (
                          <span className="text-xs bg-watt-bitcoin/20 text-watt-bitcoin px-2 py-0.5 rounded">
                            Critical
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-watt-navy/60">{item.notes}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Interconnection Costs */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-watt-navy mb-6 flex items-center gap-2">
                <Zap className="w-5 h-5 text-watt-purple" />
                Typical Interconnection Costs
              </h3>
              <div className="space-y-4">
                {interconnectionCosts.map((cost, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-watt-navy">{cost.component}</div>
                      <div className="text-xs text-watt-navy/60">{cost.notes}</div>
                    </div>
                    <div className="text-watt-bitcoin font-bold">{cost.range}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-4 bg-watt-navy/5 rounded-lg">
                <div className="text-sm text-watt-navy/70">
                  <strong className="text-watt-navy">Total Range:</strong> $3-30M+ depending on distance, 
                  voltage, and utility upgrade requirements
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Timeline */}
        <ScrollReveal delay={300}>
          <div className="bg-gradient-to-r from-watt-purple/10 to-watt-bitcoin/10 rounded-2xl p-8">
            <h3 className="text-xl font-bold text-watt-navy mb-6 text-center">
              Typical Interconnection Timeline
            </h3>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              {[
                { phase: "Application", duration: "1-2 months", desc: "Submit request, initial screening" },
                { phase: "System Studies", duration: "3-6 months", desc: "Impact analysis, cost estimates" },
                { phase: "Facilities Study", duration: "2-4 months", desc: "Detailed engineering design" },
                { phase: "Agreement", duration: "1-2 months", desc: "Negotiate terms, execute contract" },
                { phase: "Construction", duration: "6-18 months", desc: "Build infrastructure, test, energize" }
              ].map((phase, idx) => (
                <div key={idx} className="flex flex-col items-center text-center flex-1">
                  <div className="text-2xl font-bold text-watt-purple mb-1">{phase.duration}</div>
                  <div className="font-medium text-watt-navy">{phase.phase}</div>
                  <div className="text-xs text-watt-navy/60 max-w-[140px]">{phase.desc}</div>
                  {idx < 4 && (
                    <div className="hidden md:block absolute right-0 top-1/2 w-4 h-0.5 bg-watt-purple/30" />
                  )}
                </div>
              ))}
            </div>
            <div className="text-center mt-6 text-watt-navy/70 text-sm">
              Total: <span className="font-bold text-watt-navy">13-32 months</span> from application to energization
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default PowerInfrastructureSection;
