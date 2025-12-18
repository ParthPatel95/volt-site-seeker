import React from 'react';
import { Anchor, Zap, CloudLightning, AlertTriangle } from 'lucide-react';
import ScrollReveal from '@/components/animations/ScrollReveal';

const GroundingSection = () => {
  const groundingTypes = [
    {
      type: "System Ground",
      purpose: "Establishes voltage reference to earth",
      components: ["Grounding electrode conductor", "Grounding electrode", "Main bonding jumper"],
      code: "NEC 250.24"
    },
    {
      type: "Equipment Ground",
      purpose: "Safety path for fault current",
      components: ["Equipment grounding conductor", "Ground bus", "Bonding connections"],
      code: "NEC 250.118"
    },
    {
      type: "Isolated Ground",
      purpose: "Reduce noise in sensitive equipment",
      components: ["Dedicated ground conductor", "Isolated ground receptacles", "Insulated bus"],
      code: "NEC 250.146(D)"
    },
    {
      type: "Signal Ground",
      purpose: "Reference for electronic circuits",
      components: ["Signal reference grid", "Ground plane", "Single-point connection"],
      code: "IEEE 1100"
    }
  ];

  const electrodeTypes = [
    { type: "Ground Rod", resistance: "5-100Ω per rod", depth: "8-10 ft", use: "Standard, supplemental" },
    { type: "Concrete-Encased (Ufer)", resistance: "1-5Ω", depth: "Foundation", use: "New construction" },
    { type: "Ground Ring", resistance: "1-25Ω", depth: "2.5 ft min", use: "Large facilities" },
    { type: "Ground Plate", resistance: "5-25Ω", depth: "2.5 ft min", use: "Rocky soil" },
    { type: "Metal Water Pipe", resistance: "0.5-5Ω", depth: "10 ft contact", use: "When available" }
  ];

  const lightningProtection = [
    { component: "Air Terminals", purpose: "Intercept lightning strikes", spacing: "20-25 ft on roof" },
    { component: "Down Conductors", purpose: "Conduct current to ground", spacing: "100 ft max apart" },
    { component: "Ground System", purpose: "Dissipate energy to earth", requirement: "<25Ω resistance" },
    { component: "Bonding", purpose: "Equalize potential", requirement: "All metallic systems" },
    { component: "SPDs", purpose: "Protect connected equipment", location: "Service, panels, equipment" }
  ];

  return (
    <section id="grounding" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 bg-watt-bitcoin/10 text-watt-bitcoin rounded-full text-sm font-medium mb-4">
              Safety Foundation
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Grounding & Lightning Protection
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Proper grounding is the foundation of electrical safety—it protects people, 
              equipment, and enables protective devices to function.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-foreground mb-8">Types of Grounding</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {groundingTypes.map((ground, index) => (
                <div key={index} className="bg-card border border-border rounded-xl p-5 hover:border-watt-bitcoin/50 transition-colors">
                  <div className="w-10 h-10 bg-watt-bitcoin/10 rounded-lg flex items-center justify-center mb-4">
                    <Anchor className="w-5 h-5 text-watt-bitcoin" />
                  </div>
                  <h4 className="font-bold text-foreground mb-2">{ground.type}</h4>
                  <p className="text-sm text-muted-foreground mb-4">{ground.purpose}</p>
                  <div className="space-y-1 mb-4">
                    {ground.components.map((comp, i) => (
                      <div key={i} className="text-xs text-muted-foreground flex items-center gap-1">
                        <span className="w-1 h-1 bg-watt-bitcoin rounded-full" />
                        {comp}
                      </div>
                    ))}
                  </div>
                  <div className="text-xs bg-muted/50 rounded px-2 py-1 text-center">
                    <span className="text-muted-foreground">Reference: </span>
                    <span className="text-foreground font-medium">{ground.code}</span>
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
                <Zap className="w-5 h-5 text-watt-bitcoin" />
                <h3 className="text-xl font-bold text-foreground">Grounding Electrodes</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 text-muted-foreground">Type</th>
                      <th className="text-left py-2 text-muted-foreground">Resistance</th>
                      <th className="text-left py-2 text-muted-foreground">Depth</th>
                    </tr>
                  </thead>
                  <tbody>
                    {electrodeTypes.map((elec, index) => (
                      <tr key={index} className="border-b border-border/50">
                        <td className="py-2 font-medium text-foreground">{elec.type}</td>
                        <td className="py-2 text-muted-foreground">{elec.resistance}</td>
                        <td className="py-2 text-muted-foreground">{elec.depth}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 p-4 bg-watt-bitcoin/10 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">Target:</span> Total grounding 
                  electrode system resistance should be <span className="text-watt-bitcoin font-semibold">25Ω or less</span>. 
                  Multiple electrodes may be required to achieve this in high-resistivity soil.
                </p>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <CloudLightning className="w-5 h-5 text-watt-bitcoin" />
                <h3 className="text-xl font-bold text-foreground">Lightning Protection System</h3>
              </div>
              <div className="space-y-3">
                {lightningProtection.map((item, index) => (
                  <div key={index} className="flex items-start gap-4 p-3 bg-muted/50 rounded-lg">
                    <div className="w-8 h-8 bg-watt-bitcoin rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-foreground">{item.component}</div>
                      <div className="text-xs text-muted-foreground">{item.purpose}</div>
                      <div className="text-xs text-watt-bitcoin mt-1">{item.spacing || item.requirement || item.location}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={300}>
          <div className="bg-gradient-to-r from-watt-navy to-watt-navy/90 rounded-2xl p-8 text-white">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-8 h-8 text-amber-400 shrink-0" />
              <div>
                <h3 className="text-xl font-bold mb-4">Critical Grounding Requirements for Mining</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2 text-watt-bitcoin">Must Do:</h4>
                    <ul className="space-y-2 text-sm text-white/80">
                      <li className="flex items-start gap-2">
                        <span className="text-watt-success">✓</span>
                        Bond all metallic racks and enclosures
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-watt-success">✓</span>
                        Size ground conductors per NEC 250.122
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-watt-success">✓</span>
                        Test ground resistance annually
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-watt-success">✓</span>
                        Install ground bars in each row
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-destructive">Avoid:</h4>
                    <ul className="space-y-2 text-sm text-white/80">
                      <li className="flex items-start gap-2">
                        <span className="text-destructive">✗</span>
                        Daisy-chaining ground connections
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-destructive">✗</span>
                        Using conduit as sole ground path
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-destructive">✗</span>
                        Mixing ground and neutral downstream
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-destructive">✗</span>
                        Ignoring isolated ground requirements
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default GroundingSection;
