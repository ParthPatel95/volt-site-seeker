import { ScrollReveal } from "@/components/landing/ScrollAnimations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Shield, Settings, AlertTriangle } from "lucide-react";

const MediumVoltageSwitchgearSection = () => {
  const breakerTypes = [
    {
      type: "Vacuum",
      voltage: "5-38 kV",
      description: "Arc quenched in vacuum chamber. Most common for MV applications.",
      pros: ["Compact size", "Low maintenance", "Fast operation", "Long contact life"],
      cons: ["Limited to MV", "X-ray emission at high voltages"]
    },
    {
      type: "SF6 (Gas)",
      voltage: "15-800 kV",
      description: "Arc quenched in sulfur hexafluoride gas. Standard for HV applications.",
      pros: ["Excellent arc quenching", "Compact for HV", "Self-restoring insulation"],
      cons: ["Greenhouse gas", "Requires leak monitoring", "Higher maintenance"]
    },
    {
      type: "Air-Blast",
      voltage: "15-800 kV",
      description: "High-pressure air jet extinguishes arc. Legacy technology.",
      pros: ["No special gases", "Fast operation", "High breaking capacity"],
      cons: ["Large size", "Noisy operation", "High maintenance", "Being phased out"]
    },
    {
      type: "Oil",
      voltage: "5-230 kV",
      description: "Arc quenched in mineral oil. Traditional design, still in service.",
      pros: ["Simple design", "Well understood", "Low cost"],
      cons: ["Fire hazard", "Large size", "Environmental concerns", "Legacy only"]
    }
  ];

  const protectionRelays = [
    { code: "50", name: "Instantaneous Overcurrent", description: "Trips immediately when current exceeds set point. For high-level faults." },
    { code: "51", name: "Time Overcurrent", description: "Trips after time delay inversely proportional to current magnitude. Provides coordination." },
    { code: "51N/51G", name: "Ground Fault", description: "Detects current in neutral or ground path. Essential for personnel safety." },
    { code: "27", name: "Undervoltage", description: "Trips when voltage drops below set point. Protects motors and sensitive loads." },
    { code: "59", name: "Overvoltage", description: "Trips when voltage exceeds set point. Protects insulation." },
    { code: "81", name: "Frequency", description: "Trips on under/over frequency. For generator protection and load shedding." },
    { code: "87", name: "Differential", description: "Compares current in/out. Any difference indicates internal fault. Very fast operation." },
    { code: "67", name: "Directional Overcurrent", description: "Only trips for faults in one direction. For networked systems." }
  ];

  return (
    <section id="switchgear" className="py-16 md:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-watt-bitcoin/10 text-watt-bitcoin text-sm font-medium mb-4">
              <span>Section 5</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Medium Voltage Switchgear (25kV)
            </h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              Switchgear contains circuit breakers, disconnects, and protection equipment that control 
              and protect electrical circuits. Medium voltage (1kV-38kV) switchgear is the heart of 
              datacenter electrical distribution.
            </p>
          </div>
        </ScrollReveal>

        {/* Switchgear Types */}
        <ScrollReveal delay={100}>
          <Card className="mb-12 border-border shadow-institutional">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Settings className="w-5 h-5 text-watt-bitcoin" />
                Switchgear Configurations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold text-foreground mb-2">Metal-Enclosed</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Components enclosed in grounded metal housing. Not compartmentalized. 
                    Suitable for industrial applications with trained personnel.
                  </p>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>• Typical voltage: up to 38 kV</div>
                    <div>• Lower cost than metal-clad</div>
                    <div>• Requires de-energization for maintenance</div>
                  </div>
                </div>

                <div className="p-4 bg-watt-bitcoin/5 rounded-lg border border-watt-bitcoin/20">
                  <h4 className="font-semibold text-foreground mb-2">Metal-Clad</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Highest safety. Breakers on drawout mechanism. Metal barriers between all compartments. 
                    <strong className="text-watt-bitcoin"> Standard for utility and datacenter applications.</strong>
                  </p>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>• Breaker removable without de-energizing bus</div>
                    <div>• Automatic shutters when breaker withdrawn</div>
                    <div>• Highest arc-flash safety</div>
                  </div>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold text-foreground mb-2">Pad-Mounted</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Outdoor installation on concrete pad. Dead-front design (no exposed live parts). 
                    Common for utility distribution.
                  </p>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>• Tamper-resistant for public areas</div>
                    <div>• Weatherproof enclosure</div>
                    <div>• Lower capacity than indoor switchgear</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Circuit Breaker Types */}
        <ScrollReveal delay={200}>
          <Card className="mb-12 border-border shadow-institutional">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Zap className="w-5 h-5 text-watt-bitcoin" />
                Circuit Breaker Technologies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                Circuit breakers interrupt fault current by extinguishing the arc that forms when contacts separate. 
                The arc quenching medium determines breaker capabilities and applications.
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                {breakerTypes.map((breaker) => (
                  <div key={breaker.type} className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-foreground">{breaker.type} Breaker</h4>
                      <span className="px-2 py-0.5 bg-watt-bitcoin/10 text-watt-bitcoin text-xs rounded">
                        {breaker.voltage}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{breaker.description}</p>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="font-medium text-watt-success">Advantages:</span>
                        <ul className="mt-1 space-y-0.5 text-muted-foreground">
                          {breaker.pros.map((pro, i) => (
                            <li key={i}>• {pro}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <span className="font-medium text-red-500">Considerations:</span>
                        <ul className="mt-1 space-y-0.5 text-muted-foreground">
                          {breaker.cons.map((con, i) => (
                            <li key={i}>• {con}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Bus Configurations */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          <ScrollReveal delay={300}>
            <Card className="h-full border-border shadow-institutional">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Settings className="w-5 h-5 text-watt-bitcoin" />
                  Bus Configurations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  The bus is the main conductor connecting all circuits. Configuration affects reliability, 
                  flexibility, and maintenance options.
                </p>

                <div className="space-y-3">
                  <div className="p-3 bg-muted rounded-lg">
                    <h5 className="font-medium text-foreground">Single Bus</h5>
                    <p className="text-xs text-muted-foreground">
                      Simplest configuration. All circuits connect to one bus. 
                      A bus fault de-energizes everything. Lowest cost.
                    </p>
                    <div className="mt-2 p-2 bg-card rounded flex items-center justify-center gap-2">
                      <div className="w-full h-1 bg-watt-bitcoin rounded" />
                    </div>
                  </div>

                  <div className="p-3 bg-muted rounded-lg">
                    <h5 className="font-medium text-foreground">Double Bus</h5>
                    <p className="text-xs text-muted-foreground">
                      Two buses with bus-tie breaker. Circuits can be switched between buses. 
                      One bus can be maintained while other serves load.
                    </p>
                    <div className="mt-2 p-2 bg-card rounded flex flex-col items-center gap-2">
                      <div className="w-full h-1 bg-watt-bitcoin rounded" />
                      <div className="w-6 h-6 border-2 border-watt-success rounded flex items-center justify-center text-xs">BT</div>
                      <div className="w-full h-1 bg-watt-success rounded" />
                    </div>
                  </div>

                  <div className="p-3 bg-muted rounded-lg">
                    <h5 className="font-medium text-foreground">Ring Bus</h5>
                    <p className="text-xs text-muted-foreground">
                      Circuits connected in a ring. Any single breaker can be isolated without 
                      interrupting service. Common for transmission substations.
                    </p>
                    <div className="mt-2 p-2 bg-card rounded flex items-center justify-center">
                      <div className="w-16 h-16 border-2 border-watt-coinbase rounded-full" />
                    </div>
                  </div>

                  <div className="p-3 bg-watt-bitcoin/5 rounded-lg border border-watt-bitcoin/20">
                    <h5 className="font-medium text-foreground">Breaker-and-a-Half</h5>
                    <p className="text-xs text-muted-foreground">
                      Each circuit connected through 1.5 breakers (shared with adjacent circuit). 
                      Very high reliability. Standard for HV substations.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>

          <ScrollReveal delay={400}>
            <Card className="h-full border-border shadow-institutional">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <AlertTriangle className="w-5 h-5 text-watt-bitcoin" />
                  Arc-Resistant Switchgear
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Internal arc faults create explosive conditions. Arc-resistant switchgear is designed 
                  to safely contain and vent arc energy away from personnel.
                </p>

                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground">IEEE C37.20.7 Accessibility Types:</h4>
                  
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 bg-watt-bitcoin text-white text-xs font-bold rounded">Type 1</span>
                      <span className="font-medium text-foreground text-sm">Front Only</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Arc containment on front only. Rear and sides must be against walls or barriers.
                    </p>
                  </div>

                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 bg-watt-bitcoin text-white text-xs font-bold rounded">Type 2</span>
                      <span className="font-medium text-foreground text-sm">Front and Rear</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Arc containment front and rear. Sides against walls. Allows rear access aisle.
                    </p>
                  </div>

                  <div className="p-3 bg-watt-success/10 rounded-lg border border-watt-success/20">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 bg-watt-success text-white text-xs font-bold rounded">Type 2B</span>
                      <span className="font-medium text-foreground text-sm">Front, Rear, and Sides</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Full arc containment all sides. Recommended for datacenters. 
                      Equipment can be located anywhere in room.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-watt-bitcoin/10 rounded-lg border border-watt-bitcoin/20">
                  <h5 className="font-semibold text-foreground text-sm mb-1">Arc Venting</h5>
                  <p className="text-xs text-muted-foreground">
                    Arc energy is vented through top-mounted plenum to outdoors or safe location. 
                    Pressure relief panels prevent structural damage. Venting must be designed 
                    per manufacturer specifications.
                  </p>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>
        </div>

        {/* Protection Relays */}
        <ScrollReveal delay={500}>
          <Card className="border-border shadow-institutional">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Shield className="w-5 h-5 text-watt-bitcoin" />
                Protective Relays (ANSI Device Numbers)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                Protective relays monitor electrical conditions and trip breakers when faults occur. 
                Each function has a standardized ANSI/IEEE device number used worldwide.
              </p>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {protectionRelays.map((relay) => (
                  <div key={relay.code} className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-8 h-8 flex items-center justify-center bg-watt-bitcoin text-white text-sm font-bold rounded">
                        {relay.code}
                      </span>
                      <span className="font-medium text-foreground text-sm">{relay.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{relay.description}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <h5 className="font-semibold text-foreground mb-2">Coordination Study</h5>
                <p className="text-sm text-muted-foreground">
                  A <strong className="text-foreground">protection coordination study</strong> ensures that during a fault, only the breaker 
                  closest to the fault trips, while upstream breakers remain closed. This requires careful 
                  setting of time delays and pickup currents. Modern microprocessor relays can store multiple 
                  setting groups for different system configurations.
                </p>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default MediumVoltageSwitchgearSection;
