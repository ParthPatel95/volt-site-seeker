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
    <section id="high-voltage" className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-watt-bitcoin/10 text-watt-bitcoin text-sm font-medium mb-4">
              <span>Section 3</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-watt-navy mb-4">
              High Voltage Transmission (138kV+)
            </h2>
            <p className="text-watt-navy/70 max-w-3xl mx-auto">
              Power from generating stations reaches datacenters via high-voltage transmission lines. 
              Understanding transmission infrastructure helps evaluate site connectivity and costs.
            </p>
          </div>
        </ScrollReveal>

        {/* Why High Voltage */}
        <ScrollReveal delay={100}>
          <Card className="mb-12 border-watt-navy/10 shadow-institutional">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-watt-navy">
                <Zap className="w-5 h-5 text-watt-bitcoin" />
                Why Transmit at High Voltage?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <p className="text-watt-navy/70">
                    Power loss in transmission lines follows <strong>P = I²R</strong>. By increasing voltage, 
                    we can transmit the same power with less current, dramatically reducing losses.
                  </p>
                  
                  <div className="p-4 bg-watt-light rounded-lg">
                    <h4 className="font-semibold text-watt-navy mb-3">Example: Transmitting 100 MW</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-2 bg-white rounded border border-red-200">
                        <span className="text-sm">At 25kV:</span>
                        <span className="text-sm font-mono">I = 100MW / (√3 × 25kV) = <strong className="text-red-600">2,309A</strong></span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-white rounded border border-yellow-200">
                        <span className="text-sm">At 138kV:</span>
                        <span className="text-sm font-mono">I = 100MW / (√3 × 138kV) = <strong className="text-yellow-600">419A</strong></span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-white rounded border border-green-200">
                        <span className="text-sm">At 500kV:</span>
                        <span className="text-sm font-mono">I = 100MW / (√3 × 500kV) = <strong className="text-green-600">115A</strong></span>
                      </div>
                    </div>
                    <p className="text-xs text-watt-navy/60 mt-3">
                      Since losses ∝ I², going from 25kV to 500kV reduces losses by (2309/115)² = <strong>400×</strong>
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-watt-navy">Common Transmission Voltages:</h4>
                  <div className="space-y-2">
                    <div className="p-3 bg-watt-light rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-watt-navy">765 kV / 500 kV</span>
                        <span className="text-xs px-2 py-0.5 bg-watt-bitcoin/10 text-watt-bitcoin rounded">Extra High Voltage</span>
                      </div>
                      <p className="text-xs text-watt-navy/60 mt-1">Long-distance bulk transmission (100+ miles)</p>
                    </div>
                    <div className="p-3 bg-watt-light rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-watt-navy">230 kV / 138 kV</span>
                        <span className="text-xs px-2 py-0.5 bg-watt-success/10 text-watt-success rounded">High Voltage</span>
                      </div>
                      <p className="text-xs text-watt-navy/60 mt-1">Regional transmission, substation feeds</p>
                    </div>
                    <div className="p-3 bg-watt-light rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-watt-navy">69 kV / 25 kV</span>
                        <span className="text-xs px-2 py-0.5 bg-watt-coinbase/10 text-watt-coinbase rounded">Sub-transmission</span>
                      </div>
                      <p className="text-xs text-watt-navy/60 mt-1">Local distribution, industrial feeds</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Conductor Types */}
        <ScrollReveal delay={200}>
          <Card className="mb-12 border-watt-navy/10 shadow-institutional">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-watt-navy">
                <Radio className="w-5 h-5 text-watt-bitcoin" />
                Transmission Line Conductors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-watt-navy/70 mb-6">
                Transmission lines use bare (uninsulated) conductors suspended from towers. 
                The conductor type affects capacity, sag, and cost.
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                {conductorTypes.map((conductor, index) => (
                  <div key={conductor.name} className="p-4 bg-watt-light rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-watt-bitcoin text-white text-xs font-bold rounded">
                        {conductor.name}
                      </span>
                      <span className="text-xs text-watt-navy/60">{conductor.fullName}</span>
                    </div>
                    <p className="text-sm text-watt-navy/70 mb-3">{conductor.description}</p>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="font-medium text-watt-success">Pros:</span>
                        <ul className="mt-1 space-y-0.5 text-watt-navy/60">
                          {conductor.pros.map((pro, i) => (
                            <li key={i}>• {pro}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <span className="font-medium text-red-500">Cons:</span>
                        <ul className="mt-1 space-y-0.5 text-watt-navy/60">
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
            <Card className="h-full border-watt-navy/10 shadow-institutional">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-watt-navy">
                  <Shield className="w-5 h-5 text-watt-bitcoin" />
                  Transmission Structures
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-watt-navy/70">
                  Transmission lines are supported by various structure types, each suited for different 
                  voltage levels, terrain, and right-of-way constraints.
                </p>

                <div className="space-y-3">
                  <div className="p-3 bg-watt-light rounded-lg">
                    <h5 className="font-medium text-watt-navy">Lattice Steel Towers</h5>
                    <p className="text-xs text-watt-navy/60">
                      Traditional tower design for 138kV+. Strong, lightweight, easy to climb for maintenance. 
                      Spans of 300-500 meters typical. Height: 30-60 meters.
                    </p>
                  </div>
                  <div className="p-3 bg-watt-light rounded-lg">
                    <h5 className="font-medium text-watt-navy">Tubular Steel Poles</h5>
                    <p className="text-xs text-watt-navy/60">
                      Modern aesthetics for urban areas. Self-supporting or guyed. Used for 69kV-230kV. 
                      Smaller footprint than lattice towers.
                    </p>
                  </div>
                  <div className="p-3 bg-watt-light rounded-lg">
                    <h5 className="font-medium text-watt-navy">Wood Poles (H-Frame)</h5>
                    <p className="text-xs text-watt-navy/60">
                      Two poles with cross-arms for sub-transmission (69kV-138kV). Lower cost for rural areas. 
                      Typical span: 150-250 meters.
                    </p>
                  </div>
                  <div className="p-3 bg-watt-light rounded-lg">
                    <h5 className="font-medium text-watt-navy">Dead-End Structures</h5>
                    <p className="text-xs text-watt-navy/60">
                      Heavy-duty structures at line terminations, angles, or long spans. 
                      Designed for full conductor tension loads.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>

          <ScrollReveal delay={400}>
            <Card className="h-full border-watt-navy/10 shadow-institutional">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-watt-navy">
                  <DollarSign className="w-5 h-5 text-watt-bitcoin" />
                  Transmission Line Costs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-watt-navy/70">
                  Building new transmission lines is expensive and time-consuming. 
                  Understanding costs helps evaluate site accessibility.
                </p>

                <div className="space-y-3">
                  <div className="p-3 bg-watt-light rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-watt-navy">500 kV Line</span>
                      <span className="text-watt-bitcoin font-bold">$3-5M / mile</span>
                    </div>
                    <p className="text-xs text-watt-navy/60">Double circuit, steel lattice towers</p>
                  </div>
                  <div className="p-3 bg-watt-light rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-watt-navy">230 kV Line</span>
                      <span className="text-watt-bitcoin font-bold">$1.5-3M / mile</span>
                    </div>
                    <p className="text-xs text-watt-navy/60">Single or double circuit</p>
                  </div>
                  <div className="p-3 bg-watt-light rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-watt-navy">138 kV Line</span>
                      <span className="text-watt-bitcoin font-bold">$800K-1.5M / mile</span>
                    </div>
                    <p className="text-xs text-watt-navy/60">Wood H-frame or steel poles</p>
                  </div>
                  <div className="p-3 bg-watt-light rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-watt-navy">69 kV Line</span>
                      <span className="text-watt-bitcoin font-bold">$400K-800K / mile</span>
                    </div>
                    <p className="text-xs text-watt-navy/60">Wood poles, typical for local feeds</p>
                  </div>
                </div>

                <div className="p-3 bg-watt-bitcoin/10 rounded-lg border border-watt-bitcoin/20">
                  <h5 className="font-semibold text-watt-navy text-sm mb-1">Cost Drivers:</h5>
                  <ul className="text-xs text-watt-navy/70 space-y-1">
                    <li>• <strong>Terrain:</strong> Mountainous or wetland areas 2-3x base cost</li>
                    <li>• <strong>Right-of-way:</strong> Urban areas require expensive easements</li>
                    <li>• <strong>Permitting:</strong> Environmental reviews add 1-3 years</li>
                    <li>• <strong>Undergrounding:</strong> 5-10x overhead cost (rare for HV)</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>
        </div>

        {/* Protection Equipment */}
        <ScrollReveal delay={500}>
          <Card className="border-watt-navy/10 shadow-institutional">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-watt-navy">
                <Shield className="w-5 h-5 text-watt-bitcoin" />
                Line Protection Equipment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-watt-navy">Insulators</h4>
                  <p className="text-sm text-watt-navy/70">
                    Insulators prevent current from flowing through the tower structure. 
                    Voltage determines the required insulation level.
                  </p>
                  <div className="space-y-2">
                    <div className="p-2 bg-watt-light rounded text-xs">
                      <strong>Porcelain:</strong> Traditional, proven durability, heavy
                    </div>
                    <div className="p-2 bg-watt-light rounded text-xs">
                      <strong>Polymer:</strong> Lightweight, vandal-resistant, modern choice
                    </div>
                    <div className="p-2 bg-watt-light rounded text-xs">
                      <strong>Glass:</strong> Self-cleaning, easy visual inspection
                    </div>
                  </div>
                  <p className="text-xs text-watt-navy/60">
                    138kV requires ~10 insulators in a string; 500kV requires ~25+
                  </p>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-watt-navy">Surge Arresters</h4>
                  <p className="text-sm text-watt-navy/70">
                    Metal oxide varistors (MOV) that divert lightning and switching surges 
                    to ground, protecting equipment from overvoltage.
                  </p>
                  <div className="space-y-2">
                    <div className="p-2 bg-watt-light rounded text-xs">
                      <strong>Station class:</strong> At substations, highest energy capacity
                    </div>
                    <div className="p-2 bg-watt-light rounded text-xs">
                      <strong>Line arresters:</strong> On transmission lines in high-lightning areas
                    </div>
                    <div className="p-2 bg-watt-light rounded text-xs">
                      <strong>MCOV:</strong> Maximum continuous operating voltage rating
                    </div>
                  </div>
                  <p className="text-xs text-watt-navy/60">
                    BIL (Basic Impulse Level) matches equipment insulation coordination
                  </p>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-watt-navy">Shield Wires</h4>
                  <p className="text-sm text-watt-navy/70">
                    Grounded wires at the top of transmission towers that intercept 
                    lightning strikes before they hit phase conductors.
                  </p>
                  <div className="space-y-2">
                    <div className="p-2 bg-watt-light rounded text-xs">
                      <strong>OPGW:</strong> Optical ground wire with fiber optic communication
                    </div>
                    <div className="p-2 bg-watt-light rounded text-xs">
                      <strong>Static wire:</strong> Simple grounded steel or aluminum wire
                    </div>
                    <div className="p-2 bg-watt-light rounded text-xs">
                      <strong>Shield angle:</strong> 30-45° protects conductors below
                    </div>
                  </div>
                  <p className="text-xs text-watt-navy/60">
                    Reduces outages by 50-90% compared to unshielded lines
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
