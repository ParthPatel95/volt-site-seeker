import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { MapPin, Zap, DollarSign, Building2, Scale, Thermometer, Clock, BookOpen, Calculator, Target } from 'lucide-react';
import SiteSelectionWorkflowDiagram from './SiteSelectionWorkflowDiagram';
import SiteReadinessChecker from './SiteReadinessChecker';

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
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-2 bg-watt-purple/20 text-white rounded-full text-sm font-medium mb-4">
              Module 8 • Site Selection & Acquisition
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Site Selection & Acquisition
            </h1>
            <p className="text-xl text-white/70 max-w-3xl mx-auto mb-8">
              Master the art and science of identifying, evaluating, and acquiring 
              optimal locations for Bitcoin mining operations. Location determines 
              up to 70% of your operational profitability.
            </p>
            
            {/* Course Stats */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {[
                { icon: Clock, label: '~53 min read' },
                { icon: BookOpen, label: '9 sections' },
                { icon: Calculator, label: '4 calculators' },
                { icon: Target, label: '50+ variables' }
              ].map((stat, idx) => (
                <div key={idx} className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full">
                  <stat.icon className="w-4 h-4 text-watt-bitcoin" />
                  <span className="text-white/80 text-sm">{stat.label}</span>
                </div>
              ))}
            </div>
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
                    <factor.icon className="w-6 h-6 text-white" />
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

        {/* Interactive Workflow Diagram */}
        <ScrollReveal delay={300}>
          <div className="mt-16">
            <SiteSelectionWorkflowDiagram />
          </div>
        </ScrollReveal>

        {/* Site Readiness Checker */}
        <ScrollReveal delay={400}>
          <div className="mt-12">
            <SiteReadinessChecker />
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default SiteSelectionIntroSection;
