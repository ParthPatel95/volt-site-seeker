import { ScrollReveal } from "@/components/landing/ScrollAnimations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Radio, Shield, DollarSign } from "lucide-react";

const HighVoltageTransmissionSection = () => {
  const conductorTypes = [
    {
      name: "ACSR",
      fullName: "Aluminum Conductor Steel Reinforced",
      description: "Most common transmission conductor. Aluminum strands around steel core for strength.",
      pros: ["High strength-to-weight", "Cost effective", "Long spans possible"],
      cons: ["Steel core reduces conductivity", "Galvanic corrosion potential"]
    },
    {
      name: "AAC",
      fullName: "All Aluminum Conductor",
      description: "Pure aluminum conductor for maximum conductivity. Used for shorter spans.",
      pros: ["Best conductivity", "Corrosion resistant", "Lightweight"],
      cons: ["Lower tensile strength", "More sag at high temps"]
    },
    {
      name: "AAAC",
      fullName: "All Aluminum Alloy Conductor",
      description: "Aluminum alloy (6201) for better strength than AAC while maintaining good conductivity.",
      pros: ["Good strength/conductivity balance", "Corrosion resistant", "Self-damping"],
      cons: ["Higher cost than ACSR", "Lower conductivity than AAC"]
    },
    {
      name: "ACCC",
      fullName: "Aluminum Conductor Composite Core",
      description: "Carbon fiber core instead of steel. Modern high-performance conductor.",
      pros: ["2x capacity of ACSR", "Low sag at high temps", "Lightweight"],
      cons: ["Very expensive", "Special installation needed"]
    }
  ];

  return (
    <section id="high-voltage" className="py-16 md:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-watt-bitcoin/10 text-watt-bitcoin text-sm font-medium mb-4">
              <span>Section 3</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              High Voltage Transmission (138kV+)
            </h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              Power from generating stations reaches datacenters via high-voltage transmission lines. 
              Understanding transmission infrastructure helps evaluate site connectivity and costs.
            </p>
          </div>
        </ScrollReveal>

        {/* Why High Voltage */}
        <ScrollReveal delay={100}>
          <Card className="mb-12 border-border shadow-institutional">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Zap className="w-5 h-5 text-watt-bitcoin" />
                Why Transmit at High Voltage?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Power loss in transmission lines follows <strong className="text-foreground">P = I²R</strong>. By increasing voltage, 
                    we can transmit the same power with less current, dramatically reducing losses.
                  </p>
                  
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold text-foreground mb-3">Example: Transmitting 100 MW</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-2 bg-card rounded border border-red-200">
                        <span className="text-sm">At 25kV:</span>
                        <span className="text-sm font-mono">I = 100MW / (√3 × 25kV) = <strong className="text-red-600">2,309A</strong></span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-card rounded border border-yellow-200">
                        <span className="text-sm">At 138kV:</span>
                        <span className="text-sm font-mono">I = 100MW / (√3 × 138kV) = <strong className="text-yellow-600">419A</strong></span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-card rounded border border-green-200">
                        <span className="text-sm">At 500kV:</span>
                        <span className="text-sm font-mono">I = 100MW / (√3 × 500kV) = <strong className="text-green-600">115A</strong></span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                      Since losses ∝ I², going from 25kV to 500kV reduces losses by (2309/115)² = <strong className="text-foreground">400×</strong>
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-foreground">Common Transmission Voltages:</h4>
                  <div className="space-y-2">
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-foreground">765 kV / 500 kV</span>
                        <span className="text-xs px-2 py-0.5 bg-watt-bitcoin/10 text-watt-bitcoin rounded">Extra High Voltage</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Long-distance bulk transmission (100+ miles)</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-foreground">230 kV / 138 kV</span>
                        <span className="text-xs px-2 py-0.5 bg-watt-success/10 text-watt-success rounded">High Voltage</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Regional transmission, substation feeds</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-foreground">69 kV / 25 kV</span>
                        <span className="text-xs px-2 py-0.5 bg-watt-coinbase/10 text-watt-coinbase rounded">Sub-transmission</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Local distribution, industrial feeds</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Conductor Types */}
        <ScrollReveal delay={200}>
          <Card className="mb-12 border-border shadow-institutional">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Radio className="w-5 h-5 text-watt-bitcoin" />
                Transmission Line Conductors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                Transmission lines use bare (uninsulated) conductors suspended from towers. 
                The conductor type affects capacity, sag, and cost.
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                {conductorTypes.map((conductor, index) => (
                  <div key={conductor.name} className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-watt-bitcoin text-white text-xs font-bold rounded">
                        {conductor.name}
                      </span>
                      <span className="text-xs text-muted-foreground">{conductor.fullName}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{conductor.description}</p>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="font-medium text-watt-success">Pros:</span>
                        <ul className="mt-1 space-y-0.5 text-muted-foreground">
                          {conductor.pros.map((pro, i) => (
                            <li key={i}>• {pro}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <span className="font-medium text-red-500">Cons:</span>
                        <ul className="mt-1 space-y-0.5 text-muted-foreground">
                          {conductor.cons.map((con, i) => (
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

        {/* Tower Structures */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          <ScrollReveal delay={300}>
            <Card className="h-full border-border shadow-institutional">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Shield className="w-5 h-5 text-watt-bitcoin" />
                  Transmission Structures
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Transmission lines are supported by various structure types, each suited for different 
                  voltage levels, terrain, and right-of-way constraints.
                </p>

                <div className="space-y-3">
                  <div className="p-3 bg-muted rounded-lg">
                    <h5 className="font-medium text-foreground">Lattice Steel Towers</h5>
                    <p className="text-xs text-muted-foreground">
                      Traditional tower design for 138kV+. Strong, lightweight, easy to climb for maintenance. 
                      Spans of 300-500 meters typical. Height: 30-60 meters.
                    </p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <h5 className="font-medium text-foreground">Tubular Steel Poles</h5>
                    <p className="text-xs text-muted-foreground">
                      Modern aesthetics for urban areas. Self-supporting or guyed. Used for 69kV-230kV. 
                      Smaller footprint than lattice towers.
                    </p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <h5 className="font-medium text-foreground">Wood Poles (H-Frame)</h5>
                    <p className="text-xs text-muted-foreground">
                      Two poles with cross-arms for sub-transmission (69kV-138kV). Lower cost for rural areas. 
                      Typical span: 150-250 meters.
                    </p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <h5 className="font-medium text-foreground">Dead-End Structures</h5>
                    <p className="text-xs text-muted-foreground">
                      Heavy-duty structures at line terminations, angles, or long spans. 
                      Designed for full conductor tension loads.
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
                  <DollarSign className="w-5 h-5 text-watt-bitcoin" />
                  Transmission Line Costs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Building new transmission lines is expensive and time-consuming. 
                  Understanding costs helps evaluate site accessibility.
                </p>

                <div className="space-y-3">
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-foreground">500 kV Line</span>
                      <span className="text-watt-bitcoin font-bold">$3-5M / mile</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Double circuit, steel lattice towers</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-foreground">230 kV Line</span>
                      <span className="text-watt-bitcoin font-bold">$1.5-3M / mile</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Single or double circuit</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-foreground">138 kV Line</span>
                      <span className="text-watt-bitcoin font-bold">$800K-1.5M / mile</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Wood H-frame or steel poles</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-foreground">69 kV Line</span>
                      <span className="text-watt-bitcoin font-bold">$400K-800K / mile</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Wood poles, typical for local feeds</p>
                  </div>
                </div>

                <div className="p-3 bg-watt-bitcoin/10 rounded-lg border border-watt-bitcoin/20">
                  <h5 className="font-semibold text-foreground text-sm mb-1">Cost Drivers:</h5>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• <strong className="text-foreground">Terrain:</strong> Mountainous or wetland areas 2-3x base cost</li>
                    <li>• <strong className="text-foreground">Right-of-way:</strong> Urban areas require expensive easements</li>
                    <li>• <strong className="text-foreground">Permitting:</strong> Environmental reviews add 1-3 years</li>
                    <li>• <strong className="text-foreground">Undergrounding:</strong> 5-10x overhead cost (rare for HV)</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>
        </div>

        {/* Protection Equipment */}
        <ScrollReveal delay={500}>
          <Card className="border-border shadow-institutional">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Shield className="w-5 h-5 text-watt-bitcoin" />
                Line Protection Equipment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-foreground">Insulators</h4>
                  <p className="text-sm text-muted-foreground">
                    Insulators prevent current from flowing through the tower structure. 
                    Voltage determines the required insulation level.
                  </p>
                  <div className="space-y-2">
                    <div className="p-2 bg-muted rounded text-xs">
                      <strong className="text-foreground">Porcelain:</strong> <span className="text-muted-foreground">Traditional, proven durability, heavy</span>
                    </div>
                    <div className="p-2 bg-muted rounded text-xs">
                      <strong className="text-foreground">Polymer:</strong> <span className="text-muted-foreground">Lightweight, vandal-resistant, modern choice</span>
                    </div>
                    <div className="p-2 bg-muted rounded text-xs">
                      <strong className="text-foreground">Glass:</strong> <span className="text-muted-foreground">Self-cleaning, easy visual inspection</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    138kV requires ~10 insulators in a string; 500kV requires ~25+
                  </p>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-foreground">Surge Arresters</h4>
                  <p className="text-sm text-muted-foreground">
                    Metal oxide varistors (MOV) that divert lightning and switching surges 
                    to ground, protecting equipment from overvoltage.
                  </p>
                  <div className="space-y-2">
                    <div className="p-2 bg-muted rounded text-xs">
                      <strong className="text-foreground">Station class:</strong> <span className="text-muted-foreground">At substations, highest energy capacity</span>
                    </div>
                    <div className="p-2 bg-muted rounded text-xs">
                      <strong className="text-foreground">Line arresters:</strong> <span className="text-muted-foreground">On transmission lines in high-lightning areas</span>
                    </div>
                    <div className="p-2 bg-muted rounded text-xs">
                      <strong className="text-foreground">MCOV:</strong> <span className="text-muted-foreground">Maximum continuous operating voltage rating</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    BIL (Basic Impulse Level) matches equipment insulation coordination
                  </p>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-foreground">Shield Wires</h4>
                  <p className="text-sm text-muted-foreground">
                    Grounded wires above phase conductors to intercept lightning strikes.
                  </p>
                  <div className="space-y-2">
                    <div className="p-2 bg-muted rounded text-xs">
                      <strong className="text-foreground">Steel:</strong> <span className="text-muted-foreground">Traditional, lower cost</span>
                    </div>
                    <div className="p-2 bg-muted rounded text-xs">
                      <strong className="text-foreground">OPGW:</strong> <span className="text-muted-foreground">Optical ground wire with fiber optic core</span>
                    </div>
                    <div className="p-2 bg-muted rounded text-xs">
                      <strong className="text-foreground">Aluminum-clad:</strong> <span className="text-muted-foreground">Better conductivity for fault current</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Shielding angle (30-45°) determines protection zone
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default HighVoltageTransmissionSection;
