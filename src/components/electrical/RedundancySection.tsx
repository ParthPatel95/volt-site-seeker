import React, { useState } from 'react';
import { Layers, RefreshCw, Battery, Zap, Check, X } from 'lucide-react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';

const RedundancySection = () => {
  const [selectedArch, setSelectedArch] = useState('N+1');

  const architectures = [
    {
      name: "N",
      title: "No Redundancy",
      description: "Single path, single component. Failure = outage.",
      availability: "99.0-99.5%",
      downtime: "44-87 hrs/year",
      cost: "Base",
      suitable: "Non-critical loads, cost-sensitive"
    },
    {
      name: "N+1",
      title: "Parallel Redundancy",
      description: "N components + 1 spare. Can lose one component.",
      availability: "99.9%",
      downtime: "8.7 hrs/year",
      cost: "1.2-1.5x",
      suitable: "Standard mining, good balance"
    },
    {
      name: "2N",
      title: "Full Redundancy",
      description: "Two complete systems. Either can carry full load.",
      availability: "99.99%",
      downtime: "52 min/year",
      cost: "2x",
      suitable: "Mission critical, premium hosting"
    },
    {
      name: "2N+1",
      title: "Redundant + Spare",
      description: "Full redundancy plus maintenance capacity.",
      availability: "99.999%",
      downtime: "5 min/year",
      cost: "2.2-2.5x",
      suitable: "Enterprise, financial systems"
    }
  ];

  const atsTypes = [
    {
      type: "Open Transition",
      transfer: "Break-before-make",
      time: "10-20 seconds",
      pros: ["Simple, reliable", "Lower cost", "No paralleling needed"],
      cons: ["Brief outage during transfer", "May affect sensitive loads"]
    },
    {
      type: "Closed Transition",
      transfer: "Make-before-break",
      time: "100ms overlap",
      pros: ["No power interruption", "Seamless transfer"],
      cons: ["Requires source synchronization", "More complex", "Higher cost"]
    },
    {
      type: "Soft Load Transfer",
      transfer: "Gradual (1-5 sec)",
      time: "1-5 seconds",
      pros: ["Minimizes transients", "Good for large motors"],
      cons: ["Longer transfer", "Complex controls"]
    }
  ];

  const tierLevels = [
    {
      tier: "Tier I",
      name: "Basic Site",
      availability: "99.671%",
      downtime: "28.8 hours",
      paths: "Single path, no redundancy",
      maintenance: "Requires shutdown for maintenance"
    },
    {
      tier: "Tier II",
      name: "Redundant Components",
      availability: "99.741%",
      downtime: "22 hours",
      paths: "Single path, N+1 components",
      maintenance: "Some maintenance without shutdown"
    },
    {
      tier: "Tier III",
      name: "Concurrently Maintainable",
      availability: "99.982%",
      downtime: "1.6 hours",
      paths: "Multiple paths, one active",
      maintenance: "Full maintenance without shutdown"
    },
    {
      tier: "Tier IV",
      name: "Fault Tolerant",
      availability: "99.995%",
      downtime: "26.3 minutes",
      paths: "Multiple active paths, 2N+1",
      maintenance: "Fault tolerant, self-healing"
    }
  ];

  return (
    <section id="redundancy" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 bg-watt-bitcoin/10 text-watt-bitcoin rounded-full text-sm font-medium mb-4">
              Reliability Design
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Redundancy & Backup Power
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Redundancy architecture determines uptime—understand the trade-offs between 
              cost, complexity, and availability.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-foreground mb-8">Redundancy Architectures</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {architectures.map((arch, index) => (
                <div
                  key={index}
                  className={`bg-card border rounded-xl p-5 cursor-pointer transition-all ${
                    selectedArch === arch.name 
                      ? 'border-watt-bitcoin shadow-lg' 
                      : 'border-border hover:border-watt-bitcoin/50'
                  }`}
                  onClick={() => setSelectedArch(arch.name)}
                >
                  <div className="text-2xl font-bold text-watt-bitcoin mb-2">{arch.name}</div>
                  <h4 className="font-semibold text-foreground mb-2">{arch.title}</h4>
                  <p className="text-sm text-muted-foreground mb-4">{arch.description}</p>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Availability:</span>
                      <span className="font-medium text-watt-success">{arch.availability}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Downtime:</span>
                      <span className="font-medium text-foreground">{arch.downtime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cost:</span>
                      <span className="font-medium text-foreground">{arch.cost}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-card border border-border rounded-xl p-6">
              <h4 className="font-semibold text-foreground mb-4">Mining Facility Recommendations</h4>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-watt-success/10 rounded-lg">
                  <div className="font-semibold text-foreground mb-2">Standard Mining</div>
                  <div className="text-lg font-bold text-watt-success mb-2">N+1</div>
                  <p className="text-xs text-muted-foreground">
                    Best cost/benefit ratio. 99.9% uptime acceptable for hash revenue optimization.
                  </p>
                </div>
                <div className="p-4 bg-watt-bitcoin/10 rounded-lg">
                  <div className="font-semibold text-foreground mb-2">Premium Hosting</div>
                  <div className="text-lg font-bold text-watt-bitcoin mb-2">2N</div>
                  <p className="text-xs text-muted-foreground">
                    Required for SLA-backed hosting. Full redundancy for customer equipment.
                  </p>
                </div>
                <div className="p-4 bg-purple-500/10 rounded-lg">
                  <div className="font-semibold text-foreground mb-2">AI/HPC + Mining</div>
                  <div className="text-lg font-bold text-purple-500 mb-2">2N+1</div>
                  <p className="text-xs text-muted-foreground">
                    AI workloads require fault tolerance. Mining can use N+1 segment.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <div className="grid lg:grid-cols-2 gap-8 mb-16">
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <RefreshCw className="w-5 h-5 text-watt-bitcoin" />
                <h3 className="text-xl font-bold text-foreground">Automatic Transfer Switches</h3>
              </div>
              <div className="space-y-4">
                {atsTypes.map((ats, index) => (
                  <div key={index} className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-foreground">{ats.type}</span>
                      <span className="text-xs bg-watt-bitcoin/10 text-watt-bitcoin px-2 py-0.5 rounded">
                        {ats.time}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{ats.transfer}</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-watt-success">+</span>
                        {ats.pros.map((pro, i) => (
                          <span key={i} className="text-muted-foreground ml-1">{pro}{i < ats.pros.length - 1 ? ', ' : ''}</span>
                        ))}
                      </div>
                      <div>
                        <span className="text-amber-500">-</span>
                        {ats.cons.map((con, i) => (
                          <span key={i} className="text-muted-foreground ml-1">{con}{i < ats.cons.length - 1 ? ', ' : ''}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <Battery className="w-5 h-5 text-watt-bitcoin" />
                <h3 className="text-xl font-bold text-foreground">Backup Power Options</h3>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold text-foreground mb-2">Diesel Generators</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Runtime:</span>
                      <span className="text-foreground ml-1">Hours to days</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Start time:</span>
                      <span className="text-foreground ml-1">10-30 seconds</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Primary backup for extended outages. Sized for full load or critical systems only.
                  </p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold text-foreground mb-2">UPS Systems</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Runtime:</span>
                      <span className="text-foreground ml-1">5-30 minutes</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Transfer:</span>
                      <span className="text-foreground ml-1">0ms (online)</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Bridges gap to generator or safe shutdown. Expensive at mining scale.
                  </p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold text-foreground mb-2">Battery Storage (BESS)</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Runtime:</span>
                      <span className="text-foreground ml-1">1-4+ hours</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Transfer:</span>
                      <span className="text-foreground ml-1">Milliseconds</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Can provide arbitrage value + backup. Growing adoption in mining.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={300}>
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <Layers className="w-5 h-5 text-watt-bitcoin" />
              <h3 className="text-xl font-bold text-foreground">Uptime Institute Tier Classification</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 text-muted-foreground">Tier</th>
                    <th className="text-left py-3 text-muted-foreground">Name</th>
                    <th className="text-left py-3 text-muted-foreground">Availability</th>
                    <th className="text-left py-3 text-muted-foreground">Downtime/Year</th>
                    <th className="text-left py-3 text-muted-foreground">Path/Component</th>
                  </tr>
                </thead>
                <tbody>
                  {tierLevels.map((tier, index) => (
                    <tr key={index} className="border-b border-border/50">
                      <td className="py-3 font-bold text-watt-bitcoin">{tier.tier}</td>
                      <td className="py-3 font-medium text-foreground">{tier.name}</td>
                      <td className="py-3 text-watt-success font-medium">{tier.availability}</td>
                      <td className="py-3 text-muted-foreground">{tier.downtime}</td>
                      <td className="py-3 text-muted-foreground">{tier.paths}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-6 p-4 bg-watt-bitcoin/10 rounded-xl">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">Mining Note:</span> Most mining 
                facilities operate at Tier I-II equivalent. The economics of Bitcoin mining 
                (hash rate ≈ revenue) often favor N+1 redundancy over higher tiers—the cost 
                of 2N/2N+1 rarely justifies the incremental uptime gain.
              </p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default RedundancySection;
