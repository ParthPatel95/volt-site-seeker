import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { MapPin, Zap, DollarSign, Building2, Scale, Thermometer } from 'lucide-react';

const SiteSelectionIntroSection = () => {
  const keyFactors = [
    {
      icon: Zap,
      title: "Power Access",
      description: "Proximity to substations, available capacity, and grid stability",
      priority: "Critical"
    },
    {
      icon: DollarSign,
      title: "Energy Cost",
      description: "$/kWh rates, demand charges, and long-term PPA opportunities",
      priority: "Critical"
    },
    {
      icon: Thermometer,
      title: "Climate",
      description: "Ambient temperature for cooling efficiency and PUE optimization",
      priority: "High"
    },
    {
      icon: Scale,
      title: "Regulatory Environment",
      description: "Permitting complexity, crypto-friendly policies, tax incentives",
      priority: "High"
    },
    {
      icon: Building2,
      title: "Infrastructure",
      description: "Road access, fiber connectivity, water availability",
      priority: "Medium"
    },
    {
      icon: MapPin,
      title: "Land Cost",
      description: "Purchase vs lease, zoning requirements, expansion potential",
      priority: "Medium"
    }
  ];

  const priorityColors: Record<string, string> = {
    "Critical": "bg-red-500/20 text-red-400 border-red-500/30",
    "High": "bg-watt-bitcoin/20 text-watt-bitcoin border-watt-bitcoin/30",
    "Medium": "bg-watt-success/20 text-watt-success border-watt-success/30"
  };

  return (
    <section className="py-20 bg-gradient-to-b from-watt-navy via-watt-navy/95 to-watt-navy">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-watt-purple/20 text-watt-purple rounded-full text-sm font-medium mb-4">
              Module 8 • Site Selection & Acquisition
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Site Selection & Acquisition
            </h1>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Master the art and science of identifying, evaluating, and acquiring 
              optimal locations for Bitcoin mining operations. Location determines 
              up to 70% of your operational profitability.
            </p>
          </div>
        </ScrollReveal>

        {/* Impact Stats */}
        <ScrollReveal delay={100}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
            {[
              { value: "70%", label: "Profitability Impact", sublabel: "From site selection" },
              { value: "$0.02-0.08", label: "Energy Range", sublabel: "Per kWh globally" },
              { value: "6-24", label: "Months Timeline", sublabel: "Site to operation" },
              { value: "50+", label: "Variables", sublabel: "In site scoring" }
            ].map((stat, idx) => (
              <div key={idx} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 text-center">
                <div className="text-2xl md:text-3xl font-bold text-watt-bitcoin mb-1">{stat.value}</div>
                <div className="text-white font-medium text-sm">{stat.label}</div>
                <div className="text-white/50 text-xs">{stat.sublabel}</div>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* Key Factors Grid */}
        <ScrollReveal delay={200}>
          <h2 className="text-2xl font-bold text-white text-center mb-8">
            Six Pillars of Site Selection
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {keyFactors.map((factor, idx) => (
              <div
                key={idx}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-watt-purple/50 transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-watt-purple/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <factor.icon className="w-6 h-6 text-watt-purple" />
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium border ${priorityColors[factor.priority]}`}>
                    {factor.priority}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{factor.title}</h3>
                <p className="text-white/60 text-sm">{factor.description}</p>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* Decision Framework */}
        <ScrollReveal delay={300}>
          <div className="mt-16 bg-gradient-to-r from-watt-purple/20 to-watt-bitcoin/20 border border-white/10 rounded-2xl p-8">
            <h3 className="text-xl font-bold text-white mb-6 text-center">Site Selection Decision Framework</h3>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              {[
                { step: "1", title: "Identify", desc: "Screen markets & opportunities" },
                { step: "2", title: "Analyze", desc: "Deep-dive technical feasibility" },
                { step: "3", title: "Negotiate", desc: "Power agreements & land terms" },
                { step: "4", title: "Acquire", desc: "Close deal & begin development" },
                { step: "5", title: "Develop", desc: "Permits, construction, energize" }
              ].map((phase, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-10 h-10 rounded-full bg-watt-purple flex items-center justify-center text-white font-bold mb-2">
                      {phase.step}
                    </div>
                    <div className="text-white font-medium">{phase.title}</div>
                    <div className="text-white/50 text-xs max-w-[120px]">{phase.desc}</div>
                  </div>
                  {idx < 4 && (
                    <div className="hidden md:block w-8 h-0.5 bg-gradient-to-r from-watt-purple to-watt-bitcoin" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default SiteSelectionIntroSection;
