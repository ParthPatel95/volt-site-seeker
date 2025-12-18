import { ScrollReveal } from "@/components/ui/ScrollAnimations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, FileText, Clock, DollarSign, CheckCircle2, AlertTriangle } from "lucide-react";

const UtilityGridConnectionSection = () => {
  const connectionSteps = [
    {
      step: 1,
      title: "Initial Inquiry",
      duration: "1-2 weeks",
      description: "Submit interconnection application to utility/ISO with load size, location, and timeline.",
      details: ["Load forecast", "Site address", "Preferred in-service date", "Preliminary single-line diagram"]
    },
    {
      step: 2,
      title: "System Impact Study",
      duration: "60-90 days",
      description: "Utility analyzes grid impact of your load on transmission/distribution system.",
      details: ["Power flow analysis", "Short circuit study", "Stability analysis", "Cost responsibility"]
    },
    {
      step: 3,
      title: "Facility Study",
      duration: "30-60 days",
      description: "Detailed engineering for interconnection facilities: transformers, switchgear, protection.",
      details: ["Equipment specifications", "Relay settings", "Metering requirements", "Construction estimate"]
    },
    {
      step: 4,
      title: "Interconnection Agreement",
      duration: "30-60 days",
      description: "Legal agreement defining terms, responsibilities, and costs for connection.",
      details: ["Connection charges", "Ongoing fees", "Operating procedures", "Insurance requirements"]
    },
    {
      step: 5,
      title: "Construction & Commissioning",
      duration: "6-18 months",
      description: "Build interconnection facilities, install equipment, and complete testing.",
      details: ["Substation construction", "Line extensions", "Protection testing", "Energization checklist"]
    }
  ];

  return (
    <section id="grid-connection" className="py-16 md:py-24 bg-watt-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-watt-bitcoin/10 text-watt-bitcoin text-sm font-medium mb-4">
              <span>Section 2</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-watt-navy mb-4">
              Utility Grid Connection
            </h2>
            <p className="text-watt-navy/70 max-w-3xl mx-auto">
              Connecting a large mining facility to the electrical grid is a multi-month process 
              requiring coordination with utilities, engineers, and regulators. Understanding this process 
              is critical for site development planning.
            </p>
          </div>
        </ScrollReveal>

        {/* Connection Process Timeline */}
        <ScrollReveal delay={100}>
          <Card className="mb-12 border-watt-navy/10 shadow-institutional">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-watt-navy">
                <Clock className="w-5 h-5 text-watt-bitcoin" />
                The Interconnection Process: 6-24 Months
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-watt-navy/10 hidden md:block" />
                
                <div className="space-y-8">
                  {connectionSteps.map((item, index) => (
                    <div key={item.step} className="relative flex gap-4 md:gap-8">
                      {/* Step number */}
                      <div className="flex-shrink-0 w-16 h-16 rounded-full bg-watt-bitcoin text-white flex items-center justify-center font-bold text-lg z-10">
                        {item.step}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 pb-8">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-watt-navy">{item.title}</h3>
                          <span className="px-2 py-0.5 bg-watt-navy/10 rounded text-xs text-watt-navy/70">
                            {item.duration}
                          </span>
                        </div>
                        <p className="text-watt-navy/70 mb-3">{item.description}</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {item.details.map((detail, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm text-watt-navy/60">
                              <CheckCircle2 className="w-3 h-3 text-watt-success flex-shrink-0" />
                              <span>{detail}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* AESO Specific */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          <ScrollReveal delay={200}>
            <Card className="h-full border-watt-navy/10 shadow-institutional">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-watt-navy">
                  <Building2 className="w-5 h-5 text-watt-bitcoin" />
                  AESO (Alberta) Interconnection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-watt-navy/70 text-sm">
                  In Alberta, the <strong>AESO (Alberta Electric System Operator)</strong> manages the wholesale 
                  electricity market and transmission system. Large loads (&gt;5MW) connect directly to the 
                  transmission system under AESO rules.
                </p>

                <div className="space-y-3">
                  <h4 className="font-semibold text-watt-navy">Key AESO Requirements:</h4>
                  <ul className="text-sm text-watt-navy/70 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-watt-bitcoin mt-2 flex-shrink-0" />
                      <span><strong>System Access Service Request (SASR):</strong> Formal application to AESO for new or modified connection</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-watt-bitcoin mt-2 flex-shrink-0" />
                      <span><strong>Transmission Facility Owner (TFO):</strong> Work with local TFO (AltaLink, ATCO) for physical connection</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-watt-bitcoin mt-2 flex-shrink-0" />
                      <span><strong>Technical Requirements:</strong> Meet AESO reliability standards for protection, metering, and operations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-watt-bitcoin mt-2 flex-shrink-0" />
                      <span><strong>Pool Participant:</strong> Register as market participant to purchase energy from pool</span>
                    </li>
                  </ul>
                </div>

                <div className="p-3 bg-watt-success/10 rounded-lg border border-watt-success/20">
                  <h5 className="font-semibold text-watt-navy text-sm mb-1">Alberta Advantage</h5>
                  <p className="text-xs text-watt-navy/70">
                    Alberta's deregulated market allows direct pool access without retailer markup. 
                    Large loads can become Self-Retailers, buying directly at pool price.
                  </p>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>

          <ScrollReveal delay={300}>
            <Card className="h-full border-watt-navy/10 shadow-institutional">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-watt-navy">
                  <DollarSign className="w-5 h-5 text-watt-bitcoin" />
                  Interconnection Costs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-watt-navy/70 text-sm">
                  Grid connection costs vary dramatically based on location, required upgrades, 
                  and voltage level. Budget 6-18 months and significant capital for interconnection.
                </p>

                <div className="space-y-3">
                  <div className="p-3 bg-watt-light rounded-lg">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-watt-navy">Study Costs</span>
                      <span className="font-semibold text-watt-navy">$50K - $200K</span>
                    </div>
                    <p className="text-xs text-watt-navy/60">System impact + facility studies (non-refundable)</p>
                  </div>
                  
                  <div className="p-3 bg-watt-light rounded-lg">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-watt-navy">Substation (customer-owned)</span>
                      <span className="font-semibold text-watt-navy">$2M - $10M</span>
                    </div>
                    <p className="text-xs text-watt-navy/60">Depends on voltage level and redundancy requirements</p>
                  </div>
                  
                  <div className="p-3 bg-watt-light rounded-lg">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-watt-navy">Line Extension</span>
                      <span className="font-semibold text-watt-navy">$500K - $2M/mile</span>
                    </div>
                    <p className="text-xs text-watt-navy/60">If site is distant from existing transmission</p>
                  </div>
                  
                  <div className="p-3 bg-watt-light rounded-lg">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-watt-navy">Network Upgrades</span>
                      <span className="font-semibold text-watt-navy">$0 - $20M+</span>
                    </div>
                    <p className="text-xs text-watt-navy/60">If grid needs reinforcement (often refundable)</p>
                  </div>
                </div>

                <div className="p-3 bg-watt-bitcoin/10 rounded-lg border border-watt-bitcoin/20">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-watt-bitcoin mt-0.5" />
                    <p className="text-xs text-watt-navy/70">
                      <strong>Cost Tip:</strong> Sites with existing substation capacity nearby can save 
                      $5M+ in interconnection costs. This is why VoltScout prioritizes sites with 
                      "stranded" grid capacity.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>
        </div>

        {/* Metering & Billing */}
        <ScrollReveal delay={400}>
          <Card className="border-watt-navy/10 shadow-institutional">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-watt-navy">
                <FileText className="w-5 h-5 text-watt-bitcoin" />
                Metering Requirements & Billing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="font-semibold text-watt-navy">Revenue-Grade Metering</h4>
                  <p className="text-sm text-watt-navy/70">
                    Utilities require high-accuracy metering for billing. These meters are sealed and 
                    calibrated to regulatory standards.
                  </p>
                  
                  <div className="space-y-2">
                    <div className="p-3 bg-watt-light rounded-lg">
                      <h5 className="font-medium text-watt-navy text-sm">Current Transformers (CTs)</h5>
                      <p className="text-xs text-watt-navy/60">
                        Step down high currents to measurable levels. Accuracy class 0.2 or 0.3 for revenue metering. 
                        Ratio examples: 2000:5, 4000:5
                      </p>
                    </div>
                    <div className="p-3 bg-watt-light rounded-lg">
                      <h5 className="font-medium text-watt-navy text-sm">Potential Transformers (PTs)</h5>
                      <p className="text-xs text-watt-navy/60">
                        Step down high voltages for metering. Accuracy class 0.3 for revenue. 
                        Common ratios: 25kV:120V, 138kV:120V
                      </p>
                    </div>
                    <div className="p-3 bg-watt-light rounded-lg">
                      <h5 className="font-medium text-watt-navy text-sm">Smart Meters</h5>
                      <p className="text-xs text-watt-navy/60">
                        Digital meters with interval data (15-minute or 5-minute). Enable demand response 
                        and time-of-use billing. ANSI C12.20 accuracy class.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-watt-navy">Utility Bill Components</h4>
                  <p className="text-sm text-watt-navy/70">
                    Large industrial customers face multiple charges beyond just energy consumption:
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between p-3 bg-watt-light rounded-lg">
                      <span className="text-sm text-watt-navy">Energy Charge</span>
                      <span className="text-sm font-medium text-watt-navy">$/MWh consumed</span>
                    </div>
                    <div className="flex justify-between p-3 bg-watt-light rounded-lg">
                      <span className="text-sm text-watt-navy">Demand Charge</span>
                      <span className="text-sm font-medium text-watt-navy">$/kW peak demand</span>
                    </div>
                    <div className="flex justify-between p-3 bg-watt-light rounded-lg">
                      <span className="text-sm text-watt-navy">Transmission Tariff</span>
                      <span className="text-sm font-medium text-watt-navy">$/kW (12CP in Alberta)</span>
                    </div>
                    <div className="flex justify-between p-3 bg-watt-light rounded-lg">
                      <span className="text-sm text-watt-navy">Distribution Charge</span>
                      <span className="text-sm font-medium text-watt-navy">$/kW or $/kWh</span>
                    </div>
                    <div className="flex justify-between p-3 bg-watt-light rounded-lg">
                      <span className="text-sm text-watt-navy">Power Factor Penalty</span>
                      <span className="text-sm font-medium text-watt-navy">If PF &lt; 0.90</span>
                    </div>
                  </div>

                  <div className="p-3 bg-watt-success/10 rounded-lg border border-watt-success/20">
                    <h5 className="font-semibold text-watt-navy text-sm mb-1">12CP Optimization</h5>
                    <p className="text-xs text-watt-navy/70">
                      In Alberta, transmission charges are based on your load during the 12 monthly system peaks (12CP). 
                      Curtailing during predicted peaks can reduce transmission costs by 50-80%.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default UtilityGridConnectionSection;
