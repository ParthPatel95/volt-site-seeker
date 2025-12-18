import React from 'react';
import { Cpu, Plug, Zap, ThermometerSun } from 'lucide-react';
import ScrollReveal from '@/components/animations/ScrollReveal';

const MiningPowerSection = () => {
  const voltageOptions = [
    {
      voltage: "240V Single Phase",
      source: "L-L from 208Y/120V or dedicated",
      amps: "15-16A per 3kW PSU",
      pros: ["Maximum efficiency", "Lower current", "Less voltage drop"],
      cons: ["May need transformer", "Phase balancing"],
      efficiency: "94-96%"
    },
    {
      voltage: "208V Three Phase",
      source: "L-L from 208Y/120V",
      amps: "17-18A per 3kW PSU",
      pros: ["Common in US facilities", "No special transformer", "Three-phase balancing"],
      cons: ["Slightly lower efficiency", "Higher current"],
      efficiency: "92-94%"
    },
    {
      voltage: "220V Single Phase",
      source: "L-L from 380Y/220V (international)",
      amps: "15-16A per 3kW PSU",
      pros: ["International standard", "Good efficiency"],
      cons: ["Different connectors", "Regional availability"],
      efficiency: "93-95%"
    }
  ];

  const psuSpecs = [
    {
      model: "APW9 / APW12",
      manufacturer: "Bitmain",
      wattage: "3000-3600W",
      efficiency: "93-95%",
      input: "200-240VAC",
      output: "12V DC",
      connectors: "6+2 pin PCIe style"
    },
    {
      model: "P21 Series",
      manufacturer: "MicroBT",
      wattage: "3000-3400W",
      efficiency: "93-94%",
      input: "200-277VAC",
      output: "12V DC",
      connectors: "6+2 pin PCIe style"
    },
    {
      model: "Server PSU",
      manufacturer: "Various",
      wattage: "1200-2400W",
      efficiency: "80+ Platinum/Titanium",
      input: "100-240VAC",
      output: "12V DC",
      connectors: "Standard server"
    }
  ];

  const connectorTypes = [
    { type: "C13/C14", rating: "10A/250V", use: "Standard equipment power" },
    { type: "C19/C20", rating: "16A/250V", use: "High-power equipment, PDU feeds" },
    { type: "NEMA L6-30", rating: "30A/250V", use: "Single miner feeds, US" },
    { type: "NEMA L6-50", rating: "50A/250V", use: "Multi-miner feeds, US" },
    { type: "IEC 60309", rating: "16-125A", use: "Industrial, international" },
    { type: "Hardwired", rating: "Various", use: "Permanent installations" }
  ];

  return (
    <section id="mining-power" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 bg-watt-bitcoin/10 text-watt-bitcoin rounded-full text-sm font-medium mb-4">
              Equipment Power
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Mining Equipment Power
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Understanding PSU requirements, voltage options, and connection types for 
              optimal miner performance and efficiency.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-foreground mb-8">Voltage Options Comparison</h3>
            <div className="grid lg:grid-cols-3 gap-6">
              {voltageOptions.map((option, index) => (
                <div key={index} className="bg-card border border-border rounded-xl overflow-hidden hover:border-watt-bitcoin/50 transition-colors">
                  <div className="bg-gradient-to-r from-watt-bitcoin to-watt-bitcoin/80 p-4">
                    <h4 className="text-xl font-bold text-white">{option.voltage}</h4>
                    <p className="text-white/70 text-sm">{option.source}</p>
                  </div>
                  <div className="p-5">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <span className="text-xs text-muted-foreground">Current Draw:</span>
                        <div className="font-semibold text-foreground">{option.amps}</div>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">PSU Efficiency:</span>
                        <div className="font-semibold text-watt-success">{option.efficiency}</div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <span className="text-xs font-semibold text-watt-success">Advantages:</span>
                        <ul className="mt-1 space-y-1">
                          {option.pros.map((pro, i) => (
                            <li key={i} className="text-xs text-muted-foreground flex items-center gap-1">
                              <span className="text-watt-success">+</span> {pro}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-amber-500">Considerations:</span>
                        <ul className="mt-1 space-y-1">
                          {option.cons.map((con, i) => (
                            <li key={i} className="text-xs text-muted-foreground flex items-center gap-1">
                              <span className="text-amber-500">•</span> {con}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <div className="grid lg:grid-cols-2 gap-8 mb-16">
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <Cpu className="w-5 h-5 text-watt-bitcoin" />
                <h3 className="text-xl font-bold text-foreground">Common PSU Specifications</h3>
              </div>
              <div className="space-y-4">
                {psuSpecs.map((psu, index) => (
                  <div key={index} className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="font-bold text-foreground">{psu.model}</span>
                        <p className="text-xs text-muted-foreground">{psu.manufacturer}</p>
                      </div>
                      <span className="text-sm bg-watt-bitcoin/10 text-watt-bitcoin px-2 py-0.5 rounded font-medium">
                        {psu.wattage}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">Input:</span>
                        <span className="text-foreground ml-1">{psu.input}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Output:</span>
                        <span className="text-foreground ml-1">{psu.output}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Efficiency:</span>
                        <span className="text-watt-success ml-1">{psu.efficiency}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Connectors:</span>
                        <span className="text-foreground ml-1">{psu.connectors}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <Plug className="w-5 h-5 text-watt-bitcoin" />
                <h3 className="text-xl font-bold text-foreground">Connector Types</h3>
              </div>
              <div className="space-y-3">
                {connectorTypes.map((conn, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <span className="font-medium text-foreground">{conn.type}</span>
                      <p className="text-xs text-muted-foreground">{conn.use}</p>
                    </div>
                    <span className="text-xs bg-watt-navy text-white px-2 py-1 rounded font-mono">
                      {conn.rating}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={300}>
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <ThermometerSun className="w-5 h-5 text-watt-bitcoin" />
              <h3 className="text-xl font-bold text-foreground">Power Efficiency Considerations</h3>
            </div>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg text-center">
                <div className="text-2xl font-bold text-watt-bitcoin mb-2">2-4%</div>
                <div className="text-sm font-medium text-foreground mb-1">240V vs 208V Savings</div>
                <p className="text-xs text-muted-foreground">Higher voltage = lower current = higher PSU efficiency</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg text-center">
                <div className="text-2xl font-bold text-watt-bitcoin mb-2">1-3%</div>
                <div className="text-sm font-medium text-foreground mb-1">Voltage Drop Losses</div>
                <p className="text-xs text-muted-foreground">Undersized wiring wastes energy as heat</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg text-center">
                <div className="text-2xl font-bold text-watt-bitcoin mb-2">5-15%</div>
                <div className="text-sm font-medium text-foreground mb-1">PSU Partial Load</div>
                <p className="text-xs text-muted-foreground">PSUs most efficient at 50-80% load</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg text-center">
                <div className="text-2xl font-bold text-watt-bitcoin mb-2">0.5-1%</div>
                <div className="text-sm font-medium text-foreground mb-1">Transformer Losses</div>
                <p className="text-xs text-muted-foreground">Each voltage conversion adds losses</p>
              </div>
            </div>
            <div className="mt-6 p-4 bg-watt-bitcoin/10 rounded-xl">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">Pro Tip:</span> For large deployments, 
                the 2-4% efficiency gain from 240V operation justifies the additional infrastructure 
                cost. At 100MW, this represents <span className="text-watt-bitcoin font-semibold">$1-2M+</span> annual 
                savings at $0.05/kWh.
              </p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default MiningPowerSection;
