import { ScrollReveal } from "@/components/landing/ScrollAnimations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Shield, Server, Battery } from "lucide-react";

const RedundancyArchitecturesSection = () => {
  const redundancyConfigs = [
    {
      name: "N",
      description: "No redundancy. Single path, single component for each function.",
      availability: "99.0-99.5%",
      downtime: "44-88 hours/year",
      use: "Mining (economics-driven)",
      color: "bg-red-500"
    },
    {
      name: "N+1",
      description: "One spare component for every N required. Most common configuration.",
      availability: "99.5-99.9%",
      downtime: "9-44 hours/year",
      use: "Standard datacenters",
      color: "bg-yellow-500"
    },
    {
      name: "2N",
      description: "Fully redundant paths. Two of everything, each sized for full load.",
      availability: "99.99%",
      downtime: "53 minutes/year",
      use: "Tier III+ facilities",
      color: "bg-green-500"
    },
    {
      name: "2N+1",
      description: "Two paths plus spare. Maximum redundancy for critical systems.",
      availability: "99.999%",
      downtime: "5 minutes/year",
      use: "Tier IV, mission-critical",
      color: "bg-blue-500"
    }
  ];

  return (
    <section id="redundancy" className="py-16 md:py-24 bg-watt-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-watt-bitcoin/10 text-watt-bitcoin text-sm font-medium mb-4">
              <span>Section 12</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-watt-navy mb-4">
              Redundancy Architectures
            </h2>
            <p className="text-watt-navy/70 max-w-3xl mx-auto">
              Redundancy determines system availability and maintenance flexibility. 
              Mining facilities typically optimize for economics over maximum uptime, 
              but understanding options is essential for design decisions.
            </p>
          </div>
        </ScrollReveal>

        {/* Redundancy Configurations */}
        <ScrollReveal delay={100}>
          <Card className="mb-12 border-watt-navy/10 shadow-institutional">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-watt-navy">
                <Server className="w-5 h-5 text-watt-bitcoin" />
                Redundancy Configurations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {redundancyConfigs.map((config) => (
                  <div key={config.name} className="p-4 bg-white rounded-lg border border-watt-navy/10">
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`w-10 h-10 rounded-lg ${config.color} text-white flex items-center justify-center font-bold`}>
                        {config.name}
                      </div>
                    </div>
                    <p className="text-sm text-watt-navy/70 mb-3">{config.description}</p>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-watt-navy/50">Availability:</span>
                        <span className="font-bold text-watt-navy">{config.availability}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-watt-navy/50">Downtime:</span>
                        <span className="text-watt-navy/70">{config.downtime}</span>
                      </div>
                      <div className="pt-2 border-t border-watt-navy/10">
                        <span className="text-watt-bitcoin font-medium">Best for: </span>
                        <span className="text-watt-navy/70">{config.use}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Uptime Tiers */}
        <ScrollReveal delay={200}>
          <Card className="mb-12 border-watt-navy/10 shadow-institutional">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-watt-navy">
                <Shield className="w-5 h-5 text-watt-bitcoin" />
                Uptime Institute Tier Classifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <div className="p-4 bg-watt-light rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-6 h-6 rounded bg-gray-400 text-white text-xs flex items-center justify-center font-bold">I</span>
                      <span className="font-semibold text-watt-navy">Tier I - Basic</span>
                    </div>
                    <p className="text-xs text-watt-navy/60">
                      Single path, no redundancy. 99.671% uptime. Susceptible to disruptions 
                      from planned and unplanned activity.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-watt-light rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-6 h-6 rounded bg-yellow-500 text-white text-xs flex items-center justify-center font-bold">II</span>
                      <span className="font-semibold text-watt-navy">Tier II - Redundant Components</span>
                    </div>
                    <p className="text-xs text-watt-navy/60">
                      Single path with redundant components (N+1). 99.741% uptime. 
                      Less susceptible to disruptions but still single distribution path.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="p-4 bg-watt-light rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-6 h-6 rounded bg-green-500 text-white text-xs flex items-center justify-center font-bold">III</span>
                      <span className="font-semibold text-watt-navy">Tier III - Concurrently Maintainable</span>
                    </div>
                    <p className="text-xs text-watt-navy/60">
                      Multiple paths, one active (N+1 or 2N). 99.982% uptime. 
                      Any component can be maintained without impacting IT load.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-watt-bitcoin/5 rounded-lg border border-watt-bitcoin/20">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-6 h-6 rounded bg-watt-bitcoin text-white text-xs flex items-center justify-center font-bold">IV</span>
                      <span className="font-semibold text-watt-navy">Tier IV - Fault Tolerant</span>
                    </div>
                    <p className="text-xs text-watt-navy/60">
                      Multiple active paths (2N+1). 99.995% uptime. 
                      Can sustain any single fault without impacting IT load. Highest cost.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-watt-navy/5 rounded-lg">
                <h5 className="font-semibold text-watt-navy mb-2">Mining Facility Reality</h5>
                <p className="text-sm text-watt-navy/70">
                  Most mining facilities operate at Tier I or II levels. The cost of 2N redundancy 
                  rarely justifies the uptime improvement for mining operations where individual 
                  miner failures are acceptable. Focus on <strong>concurrent maintainability</strong> 
                  for electrical infrastructure without full redundancy.
                </p>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* UPS & Generators */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          <ScrollReveal delay={300}>
            <Card className="h-full border-watt-navy/10 shadow-institutional">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-watt-navy">
                  <Battery className="w-5 h-5 text-watt-bitcoin" />
                  UPS Systems: Do They Make Sense for Mining?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-watt-navy/70">
                  Uninterruptible Power Supplies (UPS) provide battery backup during power 
                  transitions. For mining, the economics rarely justify their cost.
                </p>

                <div className="space-y-3">
                  <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                    <h5 className="font-medium text-red-700 text-sm">Against UPS for Mining:</h5>
                    <ul className="text-xs text-red-700/80 space-y-1 mt-1">
                      <li>• Capital cost: $200-400/kW for UPS system</li>
                      <li>• Ongoing losses: 3-5% efficiency loss</li>
                      <li>• Battery replacement every 3-5 years</li>
                      <li>• Miners can restart quickly (no data loss)</li>
                      <li>• Brief outages don't significantly impact revenue</li>
                    </ul>
                  </div>
                  
                  <div className="p-3 bg-watt-success/10 rounded-lg border border-watt-success/20">
                    <h5 className="font-medium text-watt-success text-sm">Where UPS Makes Sense:</h5>
                    <ul className="text-xs text-watt-navy/70 space-y-1 mt-1">
                      <li>• Network and control infrastructure</li>
                      <li>• Security and monitoring systems</li>
                      <li>• Cooling controls (prevent thermal shutdown)</li>
                      <li>• If grid power is extremely unstable</li>
                    </ul>
                  </div>
                </div>

                <div className="p-3 bg-watt-light rounded-lg">
                  <h5 className="font-medium text-watt-navy text-sm mb-1">Hybrid Approach:</h5>
                  <p className="text-xs text-watt-navy/60">
                    Small UPS (10-50 kW) for critical controls only. Miners restart after 
                    power returns. This balances protection with economics.
                  </p>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>

          <ScrollReveal delay={400}>
            <Card className="h-full border-watt-navy/10 shadow-institutional">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-watt-navy">
                  <Zap className="w-5 h-5 text-watt-bitcoin" />
                  Generator Backup
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-watt-navy/70">
                  Backup generators provide power during extended utility outages. 
                  For mining, generators may make sense depending on local grid reliability.
                </p>

                <div className="space-y-3">
                  <div className="p-3 bg-watt-light rounded-lg">
                    <h5 className="font-medium text-watt-navy text-sm">Diesel Generators</h5>
                    <p className="text-xs text-watt-navy/60">
                      Most common for backup. Fast start (10-30 seconds). 
                      Fuel storage requirements. Higher emissions. 
                      Cost: $300-600/kW installed.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-watt-light rounded-lg">
                    <h5 className="font-medium text-watt-navy text-sm">Natural Gas Generators</h5>
                    <p className="text-xs text-watt-navy/60">
                      Lower emissions, unlimited fuel supply if connected to gas main. 
                      Slower start. May not be available in all locations. 
                      Cost: $400-800/kW installed.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-watt-light rounded-lg">
                    <h5 className="font-medium text-watt-navy text-sm">Sizing for Mining</h5>
                    <p className="text-xs text-watt-navy/60">
                      Generator capacity doesn't need to match full IT load. 
                      Can operate at reduced capacity during outages. 
                      Size for critical loads + percentage of miners.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-watt-bitcoin/10 rounded-lg border border-watt-bitcoin/20">
                  <h5 className="font-semibold text-watt-navy text-sm mb-1">Economics Calculation:</h5>
                  <p className="text-xs text-watt-navy/70">
                    Compare: (Generator cost + fuel + maintenance) vs. (Lost mining revenue during outages). 
                    If grid uptime is 99%+ and outages are short, generators rarely pay back for pure mining.
                  </p>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>
        </div>

        {/* ATS */}
        <ScrollReveal delay={500}>
          <Card className="border-watt-navy/10 shadow-institutional">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-watt-navy">
                <Zap className="w-5 h-5 text-watt-bitcoin" />
                Automatic Transfer Switches (ATS)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <p className="text-watt-navy/70">
                    An ATS automatically transfers load between utility and generator power 
                    (or between two utility feeds). Essential for any backup power system.
                  </p>

                  <div className="space-y-3">
                    <div className="p-3 bg-watt-light rounded-lg">
                      <h5 className="font-medium text-watt-navy">Open Transition</h5>
                      <p className="text-xs text-watt-navy/60">
                        "Break-before-make" - load disconnected briefly during transfer. 
                        Simpler, lower cost. OK if UPS bridges the gap or brief outage acceptable.
                      </p>
                    </div>
                    
                    <div className="p-3 bg-watt-light rounded-lg">
                      <h5 className="font-medium text-watt-navy">Closed Transition</h5>
                      <p className="text-xs text-watt-navy/60">
                        "Make-before-break" - both sources momentarily paralleled. 
                        No interruption. More complex, requires sources to be synchronized.
                      </p>
                    </div>
                    
                    <div className="p-3 bg-watt-light rounded-lg">
                      <h5 className="font-medium text-watt-navy">Soft Load Transfer</h5>
                      <p className="text-xs text-watt-navy/60">
                        Gradual load transfer between sources. Minimizes transients. 
                        Best for large loads that could trip breakers with sudden transfer.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-watt-navy">ATS Specifications:</h4>
                  
                  <div className="space-y-2">
                    <div className="p-3 bg-watt-light rounded-lg flex justify-between">
                      <span className="text-sm text-watt-navy">Transfer time (open)</span>
                      <span className="font-bold text-watt-navy">100-500 ms</span>
                    </div>
                    <div className="p-3 bg-watt-light rounded-lg flex justify-between">
                      <span className="text-sm text-watt-navy">Transfer time (closed)</span>
                      <span className="font-bold text-watt-navy">&lt;100 ms</span>
                    </div>
                    <div className="p-3 bg-watt-light rounded-lg flex justify-between">
                      <span className="text-sm text-watt-navy">Typical sizes</span>
                      <span className="font-bold text-watt-navy">100A - 4000A</span>
                    </div>
                    <div className="p-3 bg-watt-light rounded-lg flex justify-between">
                      <span className="text-sm text-watt-navy">Withstand rating</span>
                      <span className="font-bold text-watt-navy">65-100 kA</span>
                    </div>
                  </div>

                  <div className="p-3 bg-watt-success/10 rounded-lg border border-watt-success/20">
                    <h5 className="font-semibold text-watt-navy text-sm mb-1">Static Transfer Switch (STS)</h5>
                    <p className="text-xs text-watt-navy/70">
                      Uses solid-state switches for sub-cycle (&lt;4ms) transfer. 
                      Critical loads see no interruption. Much higher cost than mechanical ATS. 
                      Used between two utility feeds or UPS systems.
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

export default RedundancyArchitecturesSection;
