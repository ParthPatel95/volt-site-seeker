import React, { useState } from 'react';
import { Zap, AlertTriangle, Check, X } from 'lucide-react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';

const HighVoltageSection = () => {
  const [selectedVoltage, setSelectedVoltage] = useState('138kV');

  const voltageClasses = [
    {
      level: "500kV",
      name: "Extra High Voltage (EHV)",
      use: "Bulk power transmission",
      clearance: "35+ feet",
      rowWidth: "200+ feet",
      typical: "Inter-regional transmission, large generation plants"
    },
    {
      level: "230kV",
      name: "High Voltage (HV)",
      use: "Regional transmission",
      clearance: "25-35 feet",
      rowWidth: "150 feet",
      typical: "Large industrial loads, regional substations"
    },
    {
      level: "138kV",
      name: "High Voltage (HV)",
      use: "Sub-transmission",
      clearance: "18-25 feet",
      rowWidth: "100 feet",
      typical: "Large mining facilities, data centers"
    },
    {
      level: "69kV",
      name: "Sub-Transmission",
      use: "Distribution substation feed",
      clearance: "12-18 feet",
      rowWidth: "75 feet",
      typical: "Medium industrial loads, distribution substations"
    }
  ];

  const lineComparison = [
    {
      aspect: "Capital Cost",
      overhead: "Lower ($/mile)",
      underground: "5-10x higher"
    },
    {
      aspect: "Installation Time",
      overhead: "Faster",
      underground: "2-3x longer"
    },
    {
      aspect: "Reliability",
      overhead: "Weather vulnerable",
      underground: "Higher reliability"
    },
    {
      aspect: "Maintenance Access",
      overhead: "Easy visual inspection",
      underground: "Difficult, expensive"
    },
    {
      aspect: "Aesthetics",
      overhead: "Visible structures",
      underground: "Hidden"
    },
    {
      aspect: "ROW Requirements",
      overhead: "Wide corridor",
      underground: "Narrower"
    },
    {
      aspect: "Repair Time",
      overhead: "Hours to days",
      underground: "Days to weeks"
    },
    {
      aspect: "Thermal Limits",
      overhead: "Air-cooled",
      underground: "Soil thermal limits"
    }
  ];

  return (
    <section id="high-voltage" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 bg-watt-bitcoin/10 text-watt-bitcoin rounded-full text-sm font-medium mb-4">
              Transmission Systems
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              High Voltage Infrastructure
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Understanding transmission voltage levels, clearance requirements, and line types 
              for large-scale mining operations.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-foreground mb-8">Voltage Class Overview</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {voltageClasses.map((vc, index) => (
                <div 
                  key={index}
                  className={`bg-card border rounded-xl p-5 cursor-pointer transition-all ${
                    selectedVoltage === vc.level 
                      ? 'border-watt-bitcoin shadow-lg' 
                      : 'border-border hover:border-watt-bitcoin/50'
                  }`}
                  onClick={() => setSelectedVoltage(vc.level)}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className={`w-5 h-5 ${selectedVoltage === vc.level ? 'text-watt-bitcoin' : 'text-muted-foreground'}`} />
                    <span className="text-2xl font-bold text-foreground">{vc.level}</span>
                  </div>
                  <div className="text-sm text-watt-bitcoin font-medium mb-2">{vc.name}</div>
                  <p className="text-sm text-muted-foreground mb-3">{vc.use}</p>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Min Clearance:</span>
                      <span className="text-foreground font-medium">{vc.clearance}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ROW Width:</span>
                      <span className="text-foreground font-medium">{vc.rowWidth}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-xl font-bold text-foreground mb-6">Overhead vs Underground Lines</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 text-muted-foreground font-medium">Aspect</th>
                      <th className="text-left py-2 text-muted-foreground font-medium">Overhead</th>
                      <th className="text-left py-2 text-muted-foreground font-medium">Underground</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineComparison.map((row, index) => (
                      <tr key={index} className="border-b border-border/50">
                        <td className="py-2 text-foreground font-medium">{row.aspect}</td>
                        <td className="py-2 text-muted-foreground">{row.overhead}</td>
                        <td className="py-2 text-muted-foreground">{row.underground}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-xl font-bold text-foreground mb-6">Right-of-Way Considerations</h3>
              <div className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold text-foreground mb-2">Easement Requirements</h4>
                  <p className="text-sm text-muted-foreground">
                    Transmission lines require permanent easements for construction, maintenance, 
                    and vegetation management. Width varies by voltage level and local regulations.
                  </p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold text-foreground mb-2">Vegetation Management</h4>
                  <p className="text-sm text-muted-foreground">
                    Utilities must maintain clear zones around conductors. Tree trimming and 
                    removal programs are ongoing operational requirements.
                  </p>
                </div>
                <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Safety Zones</h4>
                      <p className="text-sm text-muted-foreground">
                        OSHA requires minimum approach distances. No construction, equipment 
                        operation, or personnel within specified clearances without proper 
                        procedures and utility coordination.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={300}>
          <div className="bg-gradient-to-r from-watt-navy to-watt-navy/90 rounded-2xl p-8 text-white">
            <h3 className="text-xl font-bold mb-4">Engineering Tip</h3>
            <p className="text-white/80 mb-4">
              For mining facilities requiring 50+ MW, <span className="text-watt-bitcoin font-semibold">138kV service</span> is 
              typically the optimal choice—balancing capital cost, timeline, and operational flexibility. 
              Higher voltages (230kV+) are rarely justified unless loads exceed 200 MW or proximity 
              to transmission infrastructure makes it cost-effective.
            </p>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-watt-success" />
                <span>Established utility processes</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-watt-success" />
                <span>Reasonable ROW requirements</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-watt-success" />
                <span>Cost-effective equipment</span>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default HighVoltageSection;
