import { useEffect, useState, useRef } from 'react';
import { Building2, Factory, Users, Zap, ShieldCheck, Home, ArrowRight, CheckCircle2, AlertTriangle, TrendingUp, DollarSign } from 'lucide-react';

const participantTypes = [
  {
    id: 'self-retailer',
    icon: Factory,
    title: 'Self-Retailer',
    subtitle: 'Direct Market Access',
    color: 'from-watt-bitcoin to-amber-500',
    description: 'Industrial customers who purchase electricity directly from the wholesale pool market, bypassing traditional retailers.',
    requirements: [
      'Register with AESO as a market participant',
      'Meet financial security requirements (~$500K+ based on load)',
      'Install AESO-approved interval metering (5-minute)',
      'Establish settlement accounts with AESO',
      'Manage own load forecasting and scheduling',
    ],
    benefits: [
      'Direct pool price access — no retailer markup (saves 5-15%)',
      'Full visibility into real-time pricing',
      'Participate in demand response and curtailment programs',
      'Access to 12CP transmission cost optimization',
      'Control over energy procurement strategy',
    ],
    risks: [
      'Full exposure to pool price volatility ($0-999/MWh range)',
      'Must manage own price risk or hedge externally',
      'Administrative burden of market participation',
      'Requires sophisticated energy management',
    ],
    example: "WattByte's 135MW Alberta Heartland facility operates as a Self-Retailer, enabling direct pool access and transmission cost optimization through strategic load curtailment.",
    idealFor: 'Large industrial loads (>5 MW) with flexible operations, data centers, Bitcoin miners, industrial manufacturers',
  },
  {
    id: 'power-pool',
    icon: Zap,
    title: 'Power Pool Participant',
    subtitle: 'Generators & Importers',
    color: 'from-green-500 to-emerald-500',
    description: 'Entities that generate electricity or import power into Alberta, selling into the wholesale pool.',
    requirements: [
      'Generation facility connected to AIES',
      'AESO dispatch certification',
      'Submit hourly price/quantity offers',
      'Meet reliability standards',
    ],
    benefits: [
      'Sell power at market-clearing price',
      'Revenue certainty through PPAs available',
      'Access to ancillary services markets',
      'Renewable energy credits (RECs) eligible',
    ],
    risks: [
      'Price received varies hourly',
      'Must dispatch when called by AESO',
      'Subject to curtailment during low prices',
    ],
    example: 'TransAlta, Capital Power, ENMAX Energy — major Alberta generators participating in pool.',
    idealFor: 'Power plants, wind farms, solar facilities, cogeneration units, battery storage',
  },
  {
    id: 'competitive-retailer',
    icon: Users,
    title: 'Competitive Retailer',
    subtitle: 'Fixed-Rate Providers',
    color: 'from-blue-500 to-indigo-500',
    description: 'Companies that purchase power from the pool and resell to end customers at fixed or variable rates.',
    requirements: [
      'Licensed by Alberta Utilities Commission (AUC)',
      'Financial backing and credit requirements',
      'Customer service infrastructure',
      'Billing and settlement systems',
    ],
    benefits: [
      'Offer customers price stability',
      'Build customer relationships',
      'Value-added services (green energy, smart home)',
      'Recurring revenue model',
    ],
    risks: [
      'Must absorb price volatility between pool and customer rates',
      'Regulatory compliance burden',
      'Customer churn competition',
    ],
    example: 'Direct Energy, EPCOR Energy, Just Energy — offer fixed-rate plans to residential and commercial customers.',
    idealFor: 'Energy companies, utilities seeking market expansion',
  },
  {
    id: 'distribution-utility',
    icon: Building2,
    title: 'Distribution Utility',
    subtitle: 'Wire Owners',
    color: 'from-purple-500 to-violet-500',
    description: "Own and operate local distribution infrastructure that delivers electricity from transmission to end users ('poles and wires').",
    requirements: [
      'AUC approval and rate regulation',
      'Maintain distribution infrastructure',
      'Provide regulated rate option (RRO)',
      'Meet reliability and safety standards',
    ],
    benefits: [
      'Regulated return on infrastructure',
      'Stable, predictable revenue',
      'Essential service monopoly in territory',
    ],
    risks: [
      'Capital-intensive infrastructure',
      'Regulatory oversight of rates',
      'Must serve all customers in territory',
    ],
    example: 'FortisAlberta (rural), ENMAX (Calgary), EPCOR (Edmonton), ATCO Electric',
    idealFor: 'Existing utilities, infrastructure investors',
  },
  {
    id: 'rro-customer',
    icon: Home,
    title: 'RRO Customer',
    subtitle: 'Default Rate Option',
    color: 'from-gray-500 to-slate-500',
    description: 'Customers who have not chosen a competitive retailer receive power through the Regulated Rate Option at a floating rate.',
    requirements: [
      'No action needed — default service',
      'Billed by local distribution utility',
    ],
    benefits: [
      'No contract commitment',
      'Consumer protection regulations',
      'Easy to switch to competitive retailer anytime',
    ],
    risks: [
      'Exposed to monthly rate fluctuations',
      'Often higher than fixed competitive rates',
      'No price certainty for budgeting',
    ],
    example: 'Default service for residential customers in Calgary (ENMAX RRO), Edmonton (EPCOR RRO)',
    idealFor: 'Customers who prefer no contract or are unaware of competitive options',
  },
];

export const MarketParticipantsSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<string>('self-retailer');
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const activeParticipant = participantTypes.find(p => p.id === selectedParticipant) || participantTypes[0];

  return (
    <section ref={sectionRef} className="py-16 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className={`text-center mb-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-watt-navy/5 border border-watt-navy/10 mb-4">
            <Users className="w-4 h-4 text-watt-navy" />
            <span className="text-sm font-medium text-watt-navy">Market Structure</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-watt-navy mb-4">
            Market <span className="text-watt-bitcoin">Participants</span> & Self-Retailers
          </h2>
          <p className="text-lg text-watt-navy/70 max-w-3xl mx-auto">
            Understanding how different entities interact with Alberta's deregulated electricity market
          </p>
        </div>

        {/* Market Flow Diagram */}
        <div className={`mb-12 p-6 rounded-2xl bg-watt-light border border-watt-navy/10 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <h3 className="text-lg font-bold text-watt-navy mb-6 text-center">How Electricity Flows Through Alberta's Market</h3>
          <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4">
            {[
              { label: 'Generators', desc: 'Sell power into pool', color: 'bg-green-100 border-green-300 text-green-800' },
              { label: 'AESO Pool', desc: 'Clears at single price', color: 'bg-watt-bitcoin/10 border-watt-bitcoin/30 text-watt-bitcoin' },
              { label: 'Retailers / Self-Retailers', desc: 'Buy from pool', color: 'bg-blue-100 border-blue-300 text-blue-800' },
              { label: 'Distribution', desc: 'Deliver to users', color: 'bg-purple-100 border-purple-300 text-purple-800' },
              { label: 'End Users', desc: 'Consume power', color: 'bg-gray-100 border-gray-300 text-gray-800' },
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-2 md:gap-4">
                <div className={`px-4 py-3 rounded-xl border ${step.color} text-center min-w-[100px]`}>
                  <p className="font-semibold text-sm">{step.label}</p>
                  <p className="text-xs opacity-70">{step.desc}</p>
                </div>
                {i < 4 && <ArrowRight className="w-5 h-5 text-watt-navy/30 hidden md:block" />}
              </div>
            ))}
          </div>
        </div>

        {/* Participant Type Selector */}
        <div className={`mb-8 transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div className="flex flex-wrap justify-center gap-2">
            {participantTypes.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => setSelectedParticipant(type.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedParticipant === type.id
                      ? 'bg-watt-bitcoin text-white shadow-lg'
                      : 'bg-white text-watt-navy/70 hover:bg-watt-light border border-watt-navy/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {type.title}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Participant Details */}
        <div className={`grid lg:grid-cols-2 gap-8 transition-all duration-700 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          {/* Left - Overview */}
          <div>
            <div className={`p-6 rounded-2xl bg-gradient-to-br ${activeParticipant.color} text-white mb-6`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-lg bg-white/20">
                  <activeParticipant.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">{activeParticipant.title}</h3>
                  <p className="text-white/80">{activeParticipant.subtitle}</p>
                </div>
              </div>
              <p className="text-white/90">{activeParticipant.description}</p>
            </div>

            {/* Requirements */}
            <div className="p-5 rounded-xl bg-watt-light border border-watt-navy/10 mb-4">
              <h4 className="font-semibold text-watt-navy mb-3 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-watt-bitcoin" />
                Requirements
              </h4>
              <ul className="space-y-2">
                {activeParticipant.requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-watt-navy/70">
                    <span className="text-watt-bitcoin mt-1">•</span>
                    {req}
                  </li>
                ))}
              </ul>
            </div>

            {/* Ideal For */}
            <div className="p-4 rounded-xl bg-watt-bitcoin/10 border border-watt-bitcoin/20">
              <p className="text-sm">
                <span className="font-semibold text-watt-navy">Ideal for: </span>
                <span className="text-watt-navy/70">{activeParticipant.idealFor}</span>
              </p>
            </div>
          </div>

          {/* Right - Benefits, Risks, Example */}
          <div className="space-y-4">
            {/* Benefits */}
            <div className="p-5 rounded-xl bg-green-50 border border-green-200">
              <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Benefits
              </h4>
              <ul className="space-y-2">
                {activeParticipant.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-green-700">
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>

            {/* Risks */}
            <div className="p-5 rounded-xl bg-amber-50 border border-amber-200">
              <h4 className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Risks & Considerations
              </h4>
              <ul className="space-y-2">
                {activeParticipant.risks.map((risk, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-amber-700">
                    <span className="text-amber-600 mt-1">⚠️</span>
                    {risk}
                  </li>
                ))}
              </ul>
            </div>

            {/* Example */}
            <div className="p-5 rounded-xl bg-watt-navy text-white">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-watt-bitcoin" />
                Real-World Example
              </h4>
              <p className="text-sm text-white/80">{activeParticipant.example}</p>
            </div>
          </div>
        </div>

        {/* Self-Retailer Deep Dive (always visible) */}
        {selectedParticipant === 'self-retailer' && (
          <div className={`mt-12 p-8 rounded-2xl bg-gradient-to-br from-watt-bitcoin/5 to-amber-50 border border-watt-bitcoin/20 transition-all duration-700 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <h3 className="text-2xl font-bold text-watt-navy mb-6 text-center">Why Self-Retailer Status is Ideal for Bitcoin Mining</h3>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-5 rounded-xl bg-white border border-watt-navy/10">
                <div className="w-12 h-12 rounded-lg bg-watt-bitcoin/10 flex items-center justify-center mb-4">
                  <DollarSign className="w-6 h-6 text-watt-bitcoin" />
                </div>
                <h4 className="font-semibold text-watt-navy mb-2">Direct Pool Access</h4>
                <p className="text-sm text-watt-navy/70">
                  No retailer markup — pay exactly what the market clears at. During low-price hours (often $0-30/MWh), 
                  miners can run at maximum capacity for minimal cost.
                </p>
              </div>
              
              <div className="p-5 rounded-xl bg-white border border-watt-navy/10">
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="font-semibold text-watt-navy mb-2">12CP Optimization</h4>
                <p className="text-sm text-watt-navy/70">
                  By curtailing during the 12 monthly system peaks (~12 hours/year), self-retailers can eliminate 
                  up to 100% of transmission costs — worth $13M+/year for a 135MW facility.
                </p>
              </div>
              
              <div className="p-5 rounded-xl bg-white border border-watt-navy/10">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-semibold text-watt-navy mb-2">Flexible Load = Profit</h4>
                <p className="text-sm text-watt-navy/70">
                  Bitcoin mining's instant on/off capability is perfect for pool price optimization. 
                  Run at 100% during cheap hours, curtail during spikes — no production loss, just shifted timing.
                </p>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-lg bg-white border border-watt-navy/10 text-center">
              <p className="text-sm text-watt-navy/70">
                <span className="font-semibold text-watt-navy">WattByte Advantage:</span> Our VoltScout AI platform 
                provides 12CP predictions, real-time price alerts, and automated curtailment recommendations — 
                enabling self-retailers to maximize savings without 24/7 manual monitoring.
              </p>
            </div>
          </div>
        )}

        {/* Data Source Badge */}
        <div className="mt-8 text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-watt-navy/5 border border-watt-navy/10 text-xs text-watt-navy/60">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            Market structure based on AESO Market Rules & AUC regulations
          </span>
        </div>
      </div>
    </section>
  );
};
