import { useState } from "react";
import { ScrollReveal } from "@/components/landing/ScrollAnimations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap, Monitor, DollarSign, Calculator } from "lucide-react";

const PowerDistributionUnitsSection = () => {
  // PDU sizing calculator
  const [miners, setMiners] = useState<string>("100");
  const [powerPerMiner, setPowerPerMiner] = useState<string>("3500");
  const [voltage, setVoltage] = useState<string>("240");

  const calculatePDU = () => {
    const m = parseInt(miners) || 0;
    const p = parseInt(powerPerMiner) || 0;
    const v = parseInt(voltage) || 240;
    
    const totalKW = (m * p) / 1000;
    const totalAmps = (m * p) / v;
    const circuits30A = Math.ceil(totalAmps / 24); // 80% loading of 30A circuits
    const pdusNeeded = Math.ceil(circuits30A / 42); // 42 circuits per PDU
    
    return { totalKW, totalAmps: totalAmps.toFixed(0), circuits30A, pdusNeeded };
  };

  const pduTypes = [
    {
      type: "Basic",
      description: "Simple power strip with circuit breakers. No monitoring or switching.",
      features: ["Input breaker", "Multiple outlets", "Lowest cost"],
      use: "Budget deployments, non-critical loads",
      cost: "$500-2,000"
    },
    {
      type: "Metered",
      description: "Shows total power consumption on local display. No per-outlet monitoring.",
      features: ["Local LCD display", "Total kW/kVA", "Current per phase"],
      use: "Capacity planning, billing verification",
      cost: "$1,500-4,000"
    },
    {
      type: "Monitored",
      description: "Network-connected with per-outlet power monitoring. SNMP/web interface.",
      features: ["Per-outlet metering", "Network connectivity", "Alerts/thresholds", "Environmental sensors"],
      use: "Professional datacenters, capacity optimization",
      cost: "$3,000-8,000"
    },
    {
      type: "Switched",
      description: "Full monitoring plus remote outlet control. Can power cycle individual devices.",
      features: ["Remote outlet on/off", "Scheduled reboots", "Power sequencing", "Access control"],
      use: "Colocation, remote management",
      cost: "$5,000-15,000"
    }
  ];

  const result = calculatePDU();

  return (
    <section id="pdus" className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-watt-bitcoin/10 text-watt-bitcoin text-sm font-medium mb-4">
              <span>Section 7</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-watt-navy mb-4">
              Power Distribution Units (PDUs)
            </h2>
            <p className="text-watt-navy/70 max-w-3xl mx-auto">
              PDUs are the final step in power distribution, converting facility voltage (600V/480V) 
              to equipment voltage (240V/208V) and providing individual circuit protection. 
              Proper PDU selection impacts operations, monitoring, and flexibility.
            </p>
          </div>
        </ScrollReveal>

        {/* PDU Types */}
        <ScrollReveal delay={100}>
          <Card className="mb-12 border-watt-navy/10 shadow-institutional">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-watt-navy">
                <Zap className="w-5 h-5 text-watt-bitcoin" />
                PDU Types & Capabilities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {pduTypes.map((pdu) => (
                  <div key={pdu.type} className="p-4 bg-watt-light rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-watt-navy">{pdu.type}</span>
                      <span className="text-xs px-2 py-0.5 bg-watt-bitcoin/10 text-watt-bitcoin rounded">
                        {pdu.cost}
                      </span>
                    </div>
                    <p className="text-sm text-watt-navy/70 mb-3">{pdu.description}</p>
                    <div className="space-y-2">
                      <div className="text-xs">
                        <span className="font-medium text-watt-success">Features:</span>
                        <ul className="mt-1 text-watt-navy/60 space-y-0.5">
                          {pdu.features.map((f, i) => <li key={i}>• {f}</li>)}
                        </ul>
                      </div>
                      <div className="text-xs">
                        <span className="font-medium text-watt-coinbase">Best for:</span>
                        <p className="text-watt-navy/60 mt-0.5">{pdu.use}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* PDU Architecture */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          <ScrollReveal delay={200}>
            <Card className="h-full border-watt-navy/10 shadow-institutional">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-watt-navy">
                  <Zap className="w-5 h-5 text-watt-bitcoin" />
                  PDU Architecture & Transformers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-watt-navy/70">
                  Floor-mounted PDUs contain transformers to step down facility voltage to miner voltage. 
                  The transformer configuration affects fault behavior and grounding.
                </p>

                <div className="space-y-3">
                  <div className="p-3 bg-watt-light rounded-lg">
                    <h5 className="font-medium text-watt-navy">Delta-Wye (Δ-Y)</h5>
                    <p className="text-xs text-watt-navy/60">
                      Primary: 480V or 600V delta (3-wire). Secondary: 208Y/120V or 240Y/139V (4-wire). 
                      Creates neutral for line-to-neutral loads. <strong>Most common for datacenters.</strong>
                    </p>
                  </div>

                  <div className="p-3 bg-watt-light rounded-lg">
                    <h5 className="font-medium text-watt-navy">Wye-Wye (Y-Y)</h5>
                    <p className="text-xs text-watt-navy/60">
                      Both windings wye-connected. Neutral available on both sides. 
                      Can have grounding issues if neutral not properly bonded.
                    </p>
                  </div>

                  <div className="p-3 bg-watt-light rounded-lg">
                    <h5 className="font-medium text-watt-navy">Delta-Delta (Δ-Δ)</h5>
                    <p className="text-xs text-watt-navy/60">
                      No neutral available. Used for motor loads. Can continue operating 
                      with one transformer failed (open-delta) at reduced capacity.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-watt-bitcoin/10 rounded-lg border border-watt-bitcoin/20">
                  <h5 className="font-semibold text-watt-navy text-sm mb-1">Mining PDU Considerations:</h5>
                  <p className="text-xs text-watt-navy/70">
                    Bitcoin miners typically use 240V line-to-line power (no neutral needed). 
                    Delta-wye transformers with 240V secondary are common. 
                    K-factor rated transformers (K-13 or K-20) handle harmonic loads from switch-mode PSUs.
                  </p>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>

          <ScrollReveal delay={300}>
            <Card className="h-full border-watt-bitcoin/20 shadow-institutional bg-gradient-to-br from-white to-watt-bitcoin/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-watt-navy">
                  <Calculator className="w-5 h-5 text-watt-bitcoin" />
                  PDU Sizing Calculator
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-watt-navy/70">
                  Calculate how many PDUs and circuits you need for your mining operation.
                </p>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs text-watt-navy/70">Number of Miners</Label>
                    <Input
                      type="number"
                      value={miners}
                      onChange={(e) => setMiners(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-watt-navy/70">Watts per Miner</Label>
                    <Input
                      type="number"
                      value={powerPerMiner}
                      onChange={(e) => setPowerPerMiner(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-watt-navy/70">Voltage</Label>
                    <Input
                      type="number"
                      value={voltage}
                      onChange={(e) => setVoltage(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-white rounded-lg border border-watt-navy/10">
                    <div className="text-xs text-watt-navy/60">Total Power</div>
                    <div className="text-2xl font-bold text-watt-bitcoin">{result.totalKW} kW</div>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-watt-navy/10">
                    <div className="text-xs text-watt-navy/60">Total Current</div>
                    <div className="text-2xl font-bold text-watt-navy">{result.totalAmps} A</div>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-watt-navy/10">
                    <div className="text-xs text-watt-navy/60">30A Circuits Needed</div>
                    <div className="text-2xl font-bold text-watt-success">{result.circuits30A}</div>
                    <div className="text-xs text-watt-navy/50">at 80% loading</div>
                  </div>
                  <div className="p-3 bg-watt-bitcoin/10 rounded-lg border border-watt-bitcoin/20">
                    <div className="text-xs text-watt-navy/60">PDUs Required</div>
                    <div className="text-2xl font-bold text-watt-bitcoin">{result.pdusNeeded}</div>
                    <div className="text-xs text-watt-navy/50">42 circuits each</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>
        </div>

        {/* Circuit Density & Breakers */}
        <ScrollReveal delay={400}>
          <Card className="mb-12 border-watt-navy/10 shadow-institutional">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-watt-navy">
                <Zap className="w-5 h-5 text-watt-bitcoin" />
                Circuit Density & Breaker Selection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="font-semibold text-watt-navy">Circuit Configuration for Mining:</h4>
                  <p className="text-sm text-watt-navy/70">
                    Modern ASIC miners draw 10-25A at 240V. Circuit breakers must be sized for 
                    continuous loads (load ≤ 80% of breaker rating).
                  </p>

                  <div className="space-y-2">
                    <div className="p-3 bg-watt-light rounded-lg flex justify-between items-center">
                      <div>
                        <span className="font-medium text-watt-navy">30A Breaker</span>
                        <span className="text-xs text-watt-navy/60 ml-2">→ 24A max continuous</span>
                      </div>
                      <span className="text-sm font-bold text-watt-bitcoin">1-2 miners</span>
                    </div>
                    <div className="p-3 bg-watt-light rounded-lg flex justify-between items-center">
                      <div>
                        <span className="font-medium text-watt-navy">40A Breaker</span>
                        <span className="text-xs text-watt-navy/60 ml-2">→ 32A max continuous</span>
                      </div>
                      <span className="text-sm font-bold text-watt-bitcoin">2 miners</span>
                    </div>
                    <div className="p-3 bg-watt-light rounded-lg flex justify-between items-center">
                      <div>
                        <span className="font-medium text-watt-navy">50A Breaker</span>
                        <span className="text-xs text-watt-navy/60 ml-2">→ 40A max continuous</span>
                      </div>
                      <span className="text-sm font-bold text-watt-bitcoin">2-3 miners</span>
                    </div>
                  </div>

                  <div className="p-3 bg-watt-success/10 rounded-lg border border-watt-success/20">
                    <h5 className="font-semibold text-watt-navy text-sm mb-1">Tip: Use 240V Circuits</h5>
                    <p className="text-xs text-watt-navy/70">
                      240V circuits carry twice the power of 120V at the same current. 
                      Use NEMA 6-20R or 6-30R outlets for mining (not standard 5-15R).
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-watt-navy">PDU Circuit Count Examples:</h4>
                  <div className="space-y-2">
                    <div className="p-3 bg-watt-light rounded-lg">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-watt-navy">225 kVA PDU</span>
                        <span className="text-xs text-watt-bitcoin">~200 kW IT load</span>
                      </div>
                      <p className="text-xs text-watt-navy/60">
                        42 × 30A circuits or 36 × 40A circuits. Powers ~50-60 miners.
                      </p>
                    </div>
                    <div className="p-3 bg-watt-light rounded-lg">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-watt-navy">500 kVA PDU</span>
                        <span className="text-xs text-watt-bitcoin">~450 kW IT load</span>
                      </div>
                      <p className="text-xs text-watt-navy/60">
                        84 × 30A circuits or 72 × 40A circuits. Powers ~120-150 miners.
                      </p>
                    </div>
                    <div className="p-3 bg-watt-light rounded-lg">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-watt-navy">750 kVA PDU</span>
                        <span className="text-xs text-watt-bitcoin">~675 kW IT load</span>
                      </div>
                      <p className="text-xs text-watt-navy/60">
                        126 × 30A circuits or 108 × 40A circuits. Powers ~180-220 miners.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-watt-bitcoin/10 rounded-lg border border-watt-bitcoin/20">
                    <h5 className="font-semibold text-watt-navy text-sm mb-1">Over-provision Circuits</h5>
                    <p className="text-xs text-watt-navy/70">
                      Add 10-20% extra circuits for flexibility. Allows mixing miner models, 
                      hot-swapping failed units, and future upgrades without PDU changes.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Monitoring & SCADA */}
        <ScrollReveal delay={500}>
          <Card className="border-watt-navy/10 shadow-institutional">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-watt-navy">
                <Monitor className="w-5 h-5 text-watt-bitcoin" />
                Monitoring & SCADA Integration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-watt-navy">Per-Circuit Metering</h4>
                  <p className="text-sm text-watt-navy/70">
                    Monitored PDUs track power on every circuit, enabling:
                  </p>
                  <ul className="text-sm text-watt-navy/70 space-y-1">
                    <li>• <strong>Capacity planning:</strong> Know exactly how much headroom exists</li>
                    <li>• <strong>Load balancing:</strong> Distribute miners across phases</li>
                    <li>• <strong>Anomaly detection:</strong> Spot failing PSUs or overloads</li>
                    <li>• <strong>Billing:</strong> Per-customer usage for colocation</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-watt-navy">Communication Protocols</h4>
                  <p className="text-sm text-watt-navy/70">
                    PDUs connect to building management systems via:
                  </p>
                  <div className="space-y-2">
                    <div className="p-2 bg-watt-light rounded text-xs">
                      <strong>SNMP v2c/v3:</strong> Industry standard, wide compatibility
                    </div>
                    <div className="p-2 bg-watt-light rounded text-xs">
                      <strong>Modbus TCP/RTU:</strong> Industrial protocol, BMS integration
                    </div>
                    <div className="p-2 bg-watt-light rounded text-xs">
                      <strong>BACnet:</strong> Building automation standard
                    </div>
                    <div className="p-2 bg-watt-light rounded text-xs">
                      <strong>REST API:</strong> Modern web-based integration
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-watt-navy">Environmental Sensors</h4>
                  <p className="text-sm text-watt-navy/70">
                    Many PDUs include or support add-on sensors:
                  </p>
                  <div className="space-y-2">
                    <div className="p-2 bg-watt-light rounded text-xs">
                      <strong>Temperature:</strong> Inlet/outlet air monitoring
                    </div>
                    <div className="p-2 bg-watt-light rounded text-xs">
                      <strong>Humidity:</strong> Prevent condensation issues
                    </div>
                    <div className="p-2 bg-watt-light rounded text-xs">
                      <strong>Airflow:</strong> Detect blocked vents
                    </div>
                    <div className="p-2 bg-watt-light rounded text-xs">
                      <strong>Door/Contact:</strong> Security monitoring
                    </div>
                    <div className="p-2 bg-watt-light rounded text-xs">
                      <strong>Leak Detection:</strong> Water under raised floor
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-watt-navy/5 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5 text-watt-bitcoin" />
                  <h5 className="font-semibold text-watt-navy">PDU Cost Considerations</h5>
                </div>
                <div className="grid md:grid-cols-4 gap-4 text-sm">
                  <div className="p-3 bg-white rounded">
                    <div className="text-watt-navy/60 text-xs">225 kVA Basic</div>
                    <div className="font-bold text-watt-navy">$15,000-25,000</div>
                  </div>
                  <div className="p-3 bg-white rounded">
                    <div className="text-watt-navy/60 text-xs">225 kVA Monitored</div>
                    <div className="font-bold text-watt-navy">$25,000-40,000</div>
                  </div>
                  <div className="p-3 bg-white rounded">
                    <div className="text-watt-navy/60 text-xs">500 kVA Monitored</div>
                    <div className="font-bold text-watt-navy">$45,000-70,000</div>
                  </div>
                  <div className="p-3 bg-white rounded">
                    <div className="text-watt-navy/60 text-xs">Installation</div>
                    <div className="font-bold text-watt-navy">$5,000-15,000</div>
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

export default PowerDistributionUnitsSection;
