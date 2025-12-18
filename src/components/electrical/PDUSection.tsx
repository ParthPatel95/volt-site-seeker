import React from 'react';
import { Server, Activity, Gauge, Wifi } from 'lucide-react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';

const PDUSection = () => {
  const pduTypes = [
    {
      type: "Basic PDU",
      features: ["Power distribution only", "No monitoring", "Circuit breakers", "Lowest cost"],
      monitoring: "None",
      typical: "Small deployments, cost-sensitive",
      priceRange: "$200-$500"
    },
    {
      type: "Metered PDU",
      features: ["Load monitoring", "Voltage/current display", "Local readout", "Energy tracking"],
      monitoring: "Local display",
      typical: "Basic monitoring needs",
      priceRange: "$400-$1,000"
    },
    {
      type: "Monitored PDU",
      features: ["Network connectivity", "Remote monitoring", "SNMP/web interface", "Alerts"],
      monitoring: "Network/SNMP",
      typical: "Professional deployments",
      priceRange: "$800-$2,000"
    },
    {
      type: "Switched PDU",
      features: ["Remote outlet control", "Sequential startup", "Load shedding", "Full monitoring"],
      monitoring: "Full remote",
      typical: "Enterprise, critical loads",
      priceRange: "$1,500-$4,000"
    }
  ];

  const busways = [
    {
      type: "Plug-in Busway",
      capacity: "100A - 5000A",
      description: "Allows tap-off units along the length for flexible load connection",
      use: "Main distribution runs, row feeds"
    },
    {
      type: "Feeder Busway",
      capacity: "600A - 5000A",
      description: "Point-to-point power transfer without intermediate taps",
      use: "Transformer to MDP, long runs"
    },
    {
      type: "Low-Profile Busway",
      capacity: "100A - 800A",
      description: "Compact design for overhead distribution in mining rows",
      use: "Over-rack distribution, mining halls"
    }
  ];

  const monitoringMetrics = [
    { metric: "Voltage (V)", description: "Input voltage per phase", normal: "±5% nominal" },
    { metric: "Current (A)", description: "Load per phase/circuit", normal: "<80% rating" },
    { metric: "Power (kW/kVA)", description: "Active and apparent power", normal: "Per design" },
    { metric: "Power Factor", description: "Ratio of real to apparent power", normal: ">0.95" },
    { metric: "Energy (kWh)", description: "Cumulative consumption", normal: "Trending" },
    { metric: "Temperature", description: "Ambient and internal temps", normal: "<40°C" },
    { metric: "Frequency (Hz)", description: "Line frequency", normal: "60Hz ±0.5" },
    { metric: "THD", description: "Total harmonic distortion", normal: "<5%" }
  ];

  return (
    <section id="pdu" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 bg-watt-bitcoin/10 text-watt-bitcoin rounded-full text-sm font-medium mb-4">
              Final Distribution
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              PDUs & Power Distribution
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Power Distribution Units and busway systems deliver electricity to mining equipment—
              monitoring capabilities enable optimization and troubleshooting.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-foreground mb-8">PDU Types & Capabilities</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {pduTypes.map((pdu, index) => (
                <div key={index} className="bg-card border border-border rounded-xl overflow-hidden hover:border-watt-bitcoin/50 transition-colors">
                  <div className="bg-gradient-to-r from-watt-navy to-watt-navy/80 p-4">
                    <h4 className="font-bold text-white">{pdu.type}</h4>
                    <p className="text-white/70 text-sm">{pdu.priceRange}</p>
                  </div>
                  <div className="p-5">
                    <div className="mb-4">
                      <span className="text-xs text-muted-foreground">Monitoring:</span>
                      <div className="font-semibold text-watt-bitcoin">{pdu.monitoring}</div>
                    </div>
                    <ul className="space-y-1 mb-4">
                      {pdu.features.map((feature, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                          <span className="w-1 h-1 bg-watt-bitcoin rounded-full" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs text-muted-foreground border-t border-border pt-3">
                      Typical: {pdu.typical}
                    </p>
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
                <Server className="w-5 h-5 text-watt-bitcoin" />
                <h3 className="text-xl font-bold text-foreground">Busway Systems</h3>
              </div>
              <div className="space-y-4">
                {busways.map((bus, index) => (
                  <div key={index} className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-foreground">{bus.type}</span>
                      <span className="text-xs bg-watt-bitcoin/10 text-watt-bitcoin px-2 py-0.5 rounded">{bus.capacity}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{bus.description}</p>
                    <p className="text-xs text-watt-bitcoin">Use: {bus.use}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-4 bg-watt-bitcoin/10 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">Mining Advantage:</span> Busway 
                  allows rapid reconfiguration as mining equipment changes. Tap-off units can be 
                  added or moved without rewiring.
                </p>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <Activity className="w-5 h-5 text-watt-bitcoin" />
                <h3 className="text-xl font-bold text-foreground">Monitoring Metrics</h3>
              </div>
              <div className="space-y-3">
                {monitoringMetrics.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <span className="font-medium text-foreground text-sm">{item.metric}</span>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                    <span className="text-xs bg-watt-success/10 text-watt-success px-2 py-1 rounded">
                      {item.normal}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={300}>
          <div className="bg-gradient-to-r from-watt-navy to-watt-navy/90 rounded-2xl p-8 text-white">
            <div className="flex items-center gap-2 mb-4">
              <Wifi className="w-6 h-6 text-watt-bitcoin" />
              <h3 className="text-xl font-bold">Network Monitoring Best Practices</h3>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Protocols</h4>
                <ul className="space-y-1 text-sm text-white/70">
                  <li>• SNMP v2c/v3 for polling</li>
                  <li>• Modbus TCP/RTU</li>
                  <li>• BACnet for BMS</li>
                  <li>• REST APIs (modern PDUs)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Alert Thresholds</h4>
                <ul className="space-y-1 text-sm text-white/70">
                  <li>• Warning at 70% load</li>
                  <li>• Critical at 80% load</li>
                  <li>• Voltage ±10% nominal</li>
                  <li>• Temperature 35°C/40°C</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Integration</h4>
                <ul className="space-y-1 text-sm text-white/70">
                  <li>• DCIM platforms</li>
                  <li>• Mining management</li>
                  <li>• Energy dashboards</li>
                  <li>• Alerting systems</li>
                </ul>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default PDUSection;
