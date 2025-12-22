import { ScrollReveal } from "@/components/landing/ScrollAnimations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Box, Cable, Shield } from "lucide-react";

const LowVoltageDistributionSection = () => {
  const breakerTypes = [
    {
      type: "MCCB",
      name: "Molded Case Circuit Breaker",
      range: "15A - 2,500A",
      description: "Self-contained unit with fixed or adjustable trip settings. Most common for branch circuits.",
      features: ["Compact size", "Replaceable as unit", "Thermal-magnetic or electronic trip", "Lower cost"]
    },
    {
      type: "ICCB",
      name: "Insulated Case Circuit Breaker",
      range: "400A - 5,000A",
      description: "Drawout design in insulated case. Balance of features between MCCB and ACB.",
      features: ["Drawout mechanism", "Electronic trip units", "Higher fault ratings", "Maintenance friendly"]
    },
    {
      type: "ACB",
      name: "Air Circuit Breaker",
      range: "800A - 6,300A",
      description: "Open construction air-insulated. Drawout design for easy maintenance. Standard for main breakers.",
      features: ["Highest fault ratings (150kA+)", "Multiple trip settings", "Full drawout", "Digital metering"]
    },
    {
      type: "LVPCB",
      name: "Low Voltage Power Circuit Breaker",
      range: "800A - 6,300A",
      description: "ANSI-rated power breaker. Similar to ACB but meets ANSI C37 standards.",
      features: ["Standardized ratings", "Interchangeable between manufacturers", "Highest reliability"]
    }
  ];

  return (
    <section id="low-voltage" className="py-16 md:py-24 bg-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-watt-bitcoin/10 text-watt-bitcoin text-sm font-medium mb-4">
              <span>Section 6</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Low Voltage Distribution (600V/480V)
            </h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              Low voltage distribution delivers power from unit substations to PDUs and loads. 
              Proper design ensures safety, efficiency, and the ability to maintain equipment 
              without shutting down the entire facility.
            </p>
          </div>
        </ScrollReveal>

        {/* Unit Substations */}
        <ScrollReveal delay={100}>
          <Card className="mb-12 border-border shadow-institutional">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Box className="w-5 h-5 text-watt-bitcoin" />
                Unit Substations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    A <strong className="text-foreground">unit substation</strong> is a factory-assembled package containing a 
                    transformer, primary switchgear, and secondary switchboard. This modular approach 
                    reduces installation time and ensures components are properly matched.
                  </p>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-foreground">Typical Configuration:</h4>
                    <div className="p-4 bg-card rounded-lg border border-border">
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="text-center p-2">
                          <div className="w-12 h-12 mx-auto bg-watt-coinbase/20 rounded flex items-center justify-center mb-1">
                            <Zap className="w-6 h-6 text-watt-coinbase" />
                          </div>
                          <div className="text-xs text-muted-foreground">Primary<br/>Switch (25kV)</div>
                        </div>
                        <div className="text-muted-foreground/40">→</div>
                        <div className="text-center p-2">
                          <div className="w-12 h-12 mx-auto bg-watt-bitcoin/20 rounded flex items-center justify-center mb-1">
                            <Box className="w-6 h-6 text-watt-bitcoin" />
                          </div>
                          <div className="text-xs text-muted-foreground">Transformer<br/>(2-10 MVA)</div>
                        </div>
                        <div className="text-muted-foreground/40">→</div>
                        <div className="text-center p-2">
                          <div className="w-12 h-12 mx-auto bg-watt-success/20 rounded flex items-center justify-center mb-1">
                            <Shield className="w-6 h-6 text-watt-success" />
                          </div>
                          <div className="text-xs text-muted-foreground">Secondary<br/>Switchboard</div>
                        </div>
                        <div className="text-muted-foreground/40">→</div>
                        <div className="text-center p-2">
                          <div className="w-12 h-12 mx-auto bg-muted rounded flex items-center justify-center mb-1">
                            <Cable className="w-6 h-6 text-foreground" />
                          </div>
                          <div className="text-xs text-muted-foreground">To PDUs<br/>(600V/480V)</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-foreground">Datacenter Sizing Example:</h4>
                  <div className="space-y-2">
                    <div className="p-3 bg-card rounded-lg border border-border">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-foreground">Total IT Load</span>
                        <span className="font-bold text-watt-bitcoin">100 MW</span>
                      </div>
                    </div>
                    <div className="p-3 bg-card rounded-lg border border-border">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-foreground">Cooling + Overhead</span>
                        <span className="font-bold text-foreground">~10 MW (PUE 1.1)</span>
                      </div>
                    </div>
                    <div className="p-3 bg-card rounded-lg border border-border">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-foreground">Total Facility Load</span>
                        <span className="font-bold text-foreground">110 MW</span>
                      </div>
                    </div>
                    <div className="p-3 bg-watt-bitcoin/5 rounded-lg border border-watt-bitcoin/20">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-foreground">Unit Substations Needed</span>
                        <span className="font-bold text-watt-bitcoin">12-15 × 10MVA units</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        With N+1 redundancy (one spare for maintenance)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Switchboards */}
        <ScrollReveal delay={200}>
          <Card className="mb-12 border-border shadow-institutional">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Shield className="w-5 h-5 text-watt-bitcoin" />
                Low Voltage Switchboards & Switchgear
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8 mb-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-foreground">Switchboard</h4>
                  <p className="text-sm text-muted-foreground">
                    An assembly of panels with buses, switches, and circuit breakers. 
                    Typically front-accessible only. Used for distribution applications.
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Ratings up to 5,000A main bus</li>
                    <li>• Fault ratings up to 100kA</li>
                    <li>• Fixed or drawout breakers</li>
                    <li>• Lower cost than switchgear</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-foreground">Low Voltage Switchgear</h4>
                  <p className="text-sm text-muted-foreground">
                    Metal-enclosed, compartmentalized construction with drawout breakers. 
                    Highest reliability and safety. Front and rear access.
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Ratings up to 6,300A main bus</li>
                    <li>• Fault ratings up to 200kA</li>
                    <li>• Full drawout power circuit breakers</li>
                    <li>• Integrated metering and protection</li>
                  </ul>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {breakerTypes.map((breaker) => (
                  <div key={breaker.type} className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-watt-bitcoin text-white text-xs font-bold rounded">
                        {breaker.type}
                      </span>
                    </div>
                    <h5 className="font-medium text-foreground text-sm mb-1">{breaker.name}</h5>
                    <p className="text-xs text-muted-foreground mb-2">{breaker.range}</p>
                    <p className="text-xs text-muted-foreground mb-2">{breaker.description}</p>
                    <ul className="text-xs text-muted-foreground space-y-0.5">
                      {breaker.features.map((feature, i) => (
                        <li key={i}>• {feature}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Busway vs Cable */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          <ScrollReveal delay={300}>
            <Card className="h-full border-border shadow-institutional">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Cable className="w-5 h-5 text-watt-bitcoin" />
                  Busway Systems
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Busway (busduct)</strong> is a prefabricated power distribution system using 
                  enclosed bus bars instead of cable. Ideal for high-current feeders and flexible layouts.
                </p>

                <div className="space-y-3">
                  <div className="p-3 bg-watt-success/10 rounded-lg">
                    <h5 className="font-medium text-watt-success text-sm mb-1">Advantages:</h5>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• Higher ampacity in smaller space (up to 6,300A)</li>
                      <li>• Plug-in tap boxes for flexible load connections</li>
                      <li>• Lower voltage drop than equivalent cable</li>
                      <li>• Faster installation (prefabricated sections)</li>
                      <li>• Easy future expansion</li>
                    </ul>
                  </div>

                  <div className="p-3 bg-red-50 rounded-lg">
                    <h5 className="font-medium text-red-600 text-sm mb-1">Considerations:</h5>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• Higher initial cost than cable</li>
                      <li>• Requires proper support structures</li>
                      <li>• Joint maintenance critical</li>
                      <li>• Not suitable for outdoor/wet locations</li>
                    </ul>
                  </div>
                </div>

                <div className="p-3 bg-muted rounded-lg">
                  <h5 className="font-medium text-foreground text-sm mb-1">Typical Datacenter Use:</h5>
                  <p className="text-xs text-muted-foreground">
                    Overhead busway from switchboards running the length of data halls. 
                    PDUs connect via plug-in tap boxes every 10-20 feet. 
                    Enables adding/moving PDUs without shutdown.
                  </p>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>

          <ScrollReveal delay={400}>
            <Card className="h-full border-border shadow-institutional">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Cable className="w-5 h-5 text-watt-bitcoin" />
                  Cable Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Traditional cable distribution uses insulated conductors in cable tray or conduit. 
                  Preferred for certain applications despite busway advantages.
                </p>

                <div className="space-y-3">
                  <div className="p-3 bg-watt-success/10 rounded-lg">
                    <h5 className="font-medium text-watt-success text-sm mb-1">Advantages:</h5>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• Lower cost for long runs and small loads</li>
                      <li>• Flexible routing around obstacles</li>
                      <li>• Suitable for outdoor/underground</li>
                      <li>• No special support structures</li>
                      <li>• Familiar to all electricians</li>
                    </ul>
                  </div>

                  <div className="p-3 bg-red-50 rounded-lg">
                    <h5 className="font-medium text-red-600 text-sm mb-1">Considerations:</h5>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• Higher voltage drop for large currents</li>
                      <li>• More labor-intensive installation</li>
                      <li>• Changes require rewiring</li>
                      <li>• Larger tray/conduit for high ampacity</li>
                    </ul>
                  </div>
                </div>

                <div className="p-3 bg-muted rounded-lg">
                  <h5 className="font-medium text-foreground text-sm mb-1">Cable Sizing Basics:</h5>
                  <p className="text-xs text-muted-foreground">
                    Size cables for: (1) Ampacity - current carrying capacity, 
                    (2) Voltage drop - typically &lt;3% for feeders, 
                    (3) Short circuit - withstand fault current for clearing time. 
                    Use NEC/CEC ampacity tables with derating factors for temperature and conduit fill.
                  </p>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>
        </div>

        {/* Selective Coordination */}
        <ScrollReveal delay={500}>
          <Card className="border-border shadow-institutional">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Shield className="w-5 h-5 text-watt-bitcoin" />
                Selective Coordination
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    <strong className="text-foreground">Selective coordination</strong> ensures that during a fault, only the breaker 
                    immediately upstream of the fault trips, while all other breakers remain closed. 
                    This prevents widespread outages from a single fault.
                  </p>

                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold text-foreground mb-3">How It Works:</h4>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>
                        Each breaker has a <strong className="text-foreground">time-current characteristic (TCC)</strong> curve showing 
                        trip time vs. current. Coordination requires downstream breakers to trip before 
                        upstream breakers at all fault levels.
                      </p>
                      <p>
                        The <strong className="text-foreground">coordination study</strong> plots all protective device TCCs to verify 
                        no overlap exists. Zone Selective Interlocking (ZSI) can improve coordination by 
                        allowing breakers to communicate.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-foreground">Coordination Methods:</h4>
                  
                  <div className="space-y-3">
                    <div className="p-3 bg-muted rounded-lg">
                      <h5 className="font-medium text-foreground text-sm">Time Grading</h5>
                      <p className="text-xs text-muted-foreground">
                        Upstream breakers set to trip slower than downstream. Simple but adds delay 
                        which increases arc flash energy.
                      </p>
                    </div>
                    
                    <div className="p-3 bg-muted rounded-lg">
                      <h5 className="font-medium text-foreground text-sm">Current Discrimination</h5>
                      <p className="text-xs text-muted-foreground">
                        Uses different instantaneous trip settings. Requires significant impedance 
                        between breakers.
                      </p>
                    </div>
                    
                    <div className="p-3 bg-watt-success/10 rounded-lg border border-watt-success/20">
                      <h5 className="font-medium text-watt-success text-sm">Zone Selective Interlocking (ZSI)</h5>
                      <p className="text-xs text-muted-foreground">
                        Breakers communicate via signal wires. Downstream breaker signals upstream 
                        to delay while it clears the fault. Fastest protection with full coordination.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-watt-bitcoin/10 rounded-lg border border-watt-bitcoin/20">
                    <p className="text-xs text-muted-foreground">
                      <strong className="text-foreground">NEC 700/701/708:</strong> Selective coordination is required for emergency, 
                      legally required standby, and critical operations power systems.
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

export default LowVoltageDistributionSection;
