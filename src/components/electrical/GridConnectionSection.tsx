import React from 'react';
import { Building2, FileText, Gauge, Clock } from 'lucide-react';
import ScrollReveal from '@/components/animations/ScrollReveal';

const GridConnectionSection = () => {
  const connectionSteps = [
    {
      step: 1,
      title: "Pre-Application Meeting",
      duration: "2-4 weeks",
      description: "Initial consultation with utility to discuss load requirements, location, and preliminary feasibility"
    },
    {
      step: 2,
      title: "Interconnection Application",
      duration: "4-8 weeks",
      description: "Formal application submission with load studies, single-line diagrams, and site plans"
    },
    {
      step: 3,
      title: "System Impact Study",
      duration: "8-16 weeks",
      description: "Utility assesses grid capacity, identifies required upgrades, and determines interconnection costs"
    },
    {
      step: 4,
      title: "Facilities Study",
      duration: "4-12 weeks",
      description: "Detailed engineering design for metering, protection, and interconnection facilities"
    },
    {
      step: 5,
      title: "Interconnection Agreement",
      duration: "4-8 weeks",
      description: "Contract execution defining terms, costs, responsibilities, and operational requirements"
    },
    {
      step: 6,
      title: "Construction & Commissioning",
      duration: "12-52 weeks",
      description: "Physical construction, testing, and final approval for energization"
    }
  ];

  const serviceTypes = [
    {
      type: "Transmission Connected",
      voltage: "69kV - 500kV",
      capacity: "50+ MW",
      pros: ["Lowest $/kWh", "Direct market access", "No distribution charges"],
      cons: ["Highest upfront cost", "Longest timeline", "Complex permitting"]
    },
    {
      type: "Primary Distribution",
      voltage: "15kV - 35kV",
      capacity: "5-50 MW",
      pros: ["Moderate cost", "Reasonable timeline", "Established processes"],
      cons: ["Distribution charges apply", "Capacity constraints", "Less flexibility"]
    },
    {
      type: "Secondary Distribution",
      voltage: "120V - 600V",
      capacity: "<5 MW",
      pros: ["Fast deployment", "Low upfront cost", "Simple process"],
      cons: ["Highest $/kWh", "Limited capacity", "Less reliable"]
    }
  ];

  return (
    <section id="grid-connection" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 bg-watt-bitcoin/10 text-watt-bitcoin rounded-full text-sm font-medium mb-4">
              Utility Interconnection
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Grid Connection Process
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Connecting to the utility grid is the critical first step—understand the process, 
              timelines, and service types available.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-foreground mb-8 text-center">Service Type Comparison</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {serviceTypes.map((service, index) => (
                <div key={index} className="bg-card border border-border rounded-xl p-6 hover:border-watt-bitcoin/50 transition-colors">
                  <div className="text-center mb-6">
                    <h4 className="text-lg font-bold text-foreground mb-2">{service.type}</h4>
                    <div className="text-2xl font-bold text-watt-bitcoin mb-1">{service.voltage}</div>
                    <div className="text-sm text-muted-foreground">{service.capacity}</div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h5 className="text-sm font-semibold text-watt-success mb-2">Advantages</h5>
                      <ul className="space-y-1">
                        {service.pros.map((pro, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-watt-success">+</span> {pro}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="text-sm font-semibold text-destructive mb-2">Considerations</h5>
                      <ul className="space-y-1">
                        {service.cons.map((con, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-destructive">-</span> {con}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <div className="bg-card border border-border rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-foreground mb-8 text-center">Interconnection Timeline</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {connectionSteps.map((step, index) => (
                <div key={index} className="relative">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-watt-bitcoin rounded-full flex items-center justify-center text-white font-bold shrink-0">
                      {step.step}
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">{step.title}</h4>
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-watt-bitcoin font-medium">{step.duration}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 p-4 bg-watt-bitcoin/10 rounded-xl">
              <p className="text-sm text-muted-foreground text-center">
                <span className="font-semibold text-watt-bitcoin">Total Timeline:</span> 34-100+ weeks depending on 
                utility capacity, required upgrades, and permitting complexity. Large mining operations (50+ MW) 
                should plan 18-24 months from application to energization.
              </p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default GridConnectionSection;
