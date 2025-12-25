import { useEffect, useState, useRef } from 'react';
import { Zap, DollarSign, Clock, CheckCircle, AlertTriangle, TrendingUp, Battery, Info } from 'lucide-react';
import LearningObjectives from '@/components/academy/LearningObjectives';
import SectionSummary from '@/components/academy/SectionSummary';
import CaseStudy from '@/components/academy/CaseStudy';

const reserveTypes = [
  {
    name: 'Regulating Reserve',
    icon: Zap,
    response: '< 10 seconds',
    duration: 'Continuous',
    minSize: '1 MW',
    revenue: '$15-40/MW/hour',
    description: 'Automatic response to second-by-second frequency deviations. AGC-controlled.',
    requirements: ['AGC-capable', 'Automatic response', 'Ramping ability'],
    color: 'bg-blue-500'
  },
  {
    name: 'Spinning Reserve',
    icon: Battery,
    response: '< 10 minutes',
    duration: '60 minutes',
    minSize: '5 MW',
    revenue: '$5-20/MW/hour',
    description: 'Synchronized generation ready to ramp immediately on dispatch signal.',
    requirements: ['Online & synchronized', 'Manual dispatch', 'Quick ramp'],
    color: 'bg-green-500'
  },
  {
    name: 'Supplemental Reserve',
    icon: Clock,
    response: '< 10 minutes',
    duration: '60 minutes',
    minSize: '5 MW',
    revenue: '$3-15/MW/hour',
    description: 'Offline generation that can start quickly, or interruptible load.',
    requirements: ['Quick start capability', 'Not synchronized', 'Interruptible load'],
    color: 'bg-orange-500'
  }
];

const loadParticipationSteps = [
  { step: 1, title: 'Pre-Qualification', description: 'Submit application to AESO demonstrating load curtailment capability and metering accuracy', duration: '2-4 weeks' },
  { step: 2, title: 'Metering Upgrade', description: 'Install AESO-approved interval metering with real-time telemetry (< 4 second intervals)', duration: '1-2 weeks' },
  { step: 3, title: 'Communication Setup', description: 'Establish secure communication link to AESO Energy Trading System (ETS)', duration: '1-2 weeks' },
  { step: 4, title: 'Testing & Certification', description: 'Complete performance tests demonstrating response time and sustained curtailment', duration: '2-4 weeks' },
  { step: 5, title: 'Market Participation', description: 'Submit offers into Operating Reserve market, receive dispatch signals', duration: 'Ongoing' }
];

export const AncillaryServicesSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedReserve, setSelectedReserve] = useState(0);
  const [participationMW, setParticipationMW] = useState(10);
  const [hoursPerMonth, setHoursPerMonth] = useState(500);
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

  // Revenue calculator
  const calculateRevenue = () => {
    const avgRate = 15; // Conservative estimate $/MW/hour
    const monthly = participationMW * hoursPerMonth * avgRate;
    const annual = monthly * 12;
    return { monthly, annual };
  };

  const revenue = calculateRevenue();

  return (
    <section ref={sectionRef} className="py-16 md:py-20 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <LearningObjectives
          objectives={[
            "Understand the three types of Operating Reserves in Alberta",
            "Learn how flexible loads can participate and earn revenue",
            "Calculate potential ancillary service revenue for your operation",
            "Know the qualification requirements and timeline"
          ]}
          estimatedTime="12 min"
          prerequisites={[
            { title: "Pool Pricing", href: "/aeso-101#pool-pricing" },
            { title: "Grid Operations", href: "/aeso-101#grid-operations" }
          ]}
        />

        {/* Header */}
        <div className={`text-center mb-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-4">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Revenue Opportunity</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ancillary Services & <span className="text-primary">Revenue Opportunities</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Beyond energy arbitrage, flexible loads can earn additional revenue by providing grid stability services. 
            Learn how operating reserves work and how to participate.
          </p>
        </div>

        {/* Reserve Types */}
        <div className={`mb-12 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
            <Battery className="w-5 h-5 text-primary" />
            Types of Operating Reserves
          </h3>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {reserveTypes.map((reserve, index) => (
              <div
                key={index}
                onClick={() => setSelectedReserve(index)}
                className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                  selectedReserve === index
                    ? 'border-primary bg-primary/5 shadow-lg'
                    : 'border-border bg-card hover:border-primary/50'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl ${reserve.color} flex items-center justify-center mb-4`}>
                  <reserve.icon className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-lg font-bold text-foreground mb-2">{reserve.name}</h4>
                <p className="text-sm text-muted-foreground mb-4">{reserve.description}</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Response Time</span>
                    <span className="font-medium text-foreground">{reserve.response}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-medium text-foreground">{reserve.duration}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Min Size</span>
                    <span className="font-medium text-foreground">{reserve.minSize}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Revenue</span>
                    <span className="font-bold text-green-600">{reserve.revenue}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Selected Reserve Details */}
          <div className="p-6 rounded-2xl bg-card border border-border">
            <h4 className="font-bold text-foreground mb-4">{reserveTypes[selectedReserve].name} Requirements</h4>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-3">Technical Requirements</p>
                <ul className="space-y-2">
                  {reserveTypes[selectedReserve].requirements.map((req, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                <p className="text-sm font-medium text-primary mb-2">Best For Bitcoin Mining</p>
                <p className="text-sm text-muted-foreground">
                  {selectedReserve === 0 && "Ideal for operations with automated load shedding. Highest revenue but requires AGC integration."}
                  {selectedReserve === 1 && "Good fit for most mining operations. Manual dispatch allows planned curtailment with advance notice."}
                  {selectedReserve === 2 && "Easiest entry point. Treat mining as interruptible load that can shut down within 10 minutes."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Calculator */}
        <div className={`grid lg:grid-cols-2 gap-8 mb-12 transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div className="p-6 rounded-2xl bg-gradient-to-br from-watt-navy to-watt-navy/90 text-white">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-watt-bitcoin" />
              Revenue Calculator
            </h3>

            <div className="space-y-6">
              <div>
                <label className="text-sm text-white/70 mb-2 block">
                  Curtailable Capacity: {participationMW} MW
                </label>
                <input
                  type="range"
                  min={5}
                  max={100}
                  step={5}
                  value={participationMW}
                  onChange={(e) => setParticipationMW(Number(e.target.value))}
                  className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-watt-bitcoin"
                />
                <div className="flex justify-between text-xs text-white/50 mt-1">
                  <span>5 MW</span>
                  <span>100 MW</span>
                </div>
              </div>

              <div>
                <label className="text-sm text-white/70 mb-2 block">
                  Participation Hours/Month: {hoursPerMonth}
                </label>
                <input
                  type="range"
                  min={100}
                  max={720}
                  step={20}
                  value={hoursPerMonth}
                  onChange={(e) => setHoursPerMonth(Number(e.target.value))}
                  className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-watt-bitcoin"
                />
                <div className="flex justify-between text-xs text-white/50 mt-1">
                  <span>100 hrs (14%)</span>
                  <span>720 hrs (100%)</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/20">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-white/70">Monthly Revenue</p>
                  <p className="text-3xl font-bold text-watt-bitcoin">${revenue.monthly.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-white/70">Annual Revenue</p>
                  <p className="text-3xl font-bold text-green-400">${revenue.annual.toLocaleString()}</p>
                </div>
              </div>
              <p className="text-xs text-white/50 mt-4">
                * Based on $15/MW/hour average. Actual rates vary by reserve type and market conditions.
              </p>
            </div>
          </div>

          {/* Participation Steps */}
          <div className="p-6 rounded-2xl bg-card border border-border">
            <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              How to Qualify
            </h3>

            <div className="space-y-4">
              {loadParticipationSteps.map((step, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">{step.step}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-foreground">{step.title}</h4>
                      <span className="text-xs text-muted-foreground">{step.duration}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-700">Total Timeline: 6-12 weeks</p>
                  <p className="text-xs text-yellow-600/80 mt-1">
                    Start the process early. Pre-qualification can begin before your facility is fully operational.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Real Revenue Example */}
        <div className={`mb-12 transition-all duration-700 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <CaseStudy
            title="Supplemental Reserve Revenue: Bitcoin Miner"
            location="Central Alberta"
            date="2024"
            capacity="20 MW Mining Operation"
            metrics={[
              { label: 'Monthly Reserve Revenue', value: '$45,000' },
              { label: 'Average Curtailment', value: '12 hrs/month' },
              { label: 'Lost Mining Revenue', value: '$8,000' },
              { label: 'Net Additional Profit', value: '$37,000/mo' }
            ]}
            whatWorked={[
              'Registered as Supplemental Reserve provider with 20 MW curtailable capacity',
              'Automated shutdown triggers from AESO dispatch signals integrated with SCADA',
              'Strategic bidding during high-price periods when reserve prices also spike',
              'Combined with 12CP avoidance for stacked benefits'
            ]}
            lessonsLearned={[
              'Reserve revenue is additive to energy savings, not either/or',
              'Actual dispatch is rare (< 1% of hours) but standby payments are reliable',
              'Integration cost was <$50K - paid back in 2 months',
              'Must maintain 95%+ response compliance or face penalties'
            ]}
            proTip="Stack ancillary services with 12CP optimization. During system peaks, both reserve prices AND 12CP stakes are highest - curtailing once captures both benefits."
          />
        </div>

        {/* Important Considerations */}
        <div className={`p-6 rounded-2xl bg-card border border-border mb-12 transition-all duration-700 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-500" />
            Important Considerations
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-foreground mb-2">Compliance Requirements</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Must respond to dispatch within specified time (10 min for most reserves)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Maintain 95%+ availability during committed hours
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Real-time telemetry must report accurate load data
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Non-compliance results in financial penalties
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">Strategic Considerations</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Reserve prices correlate with energy prices - high value during tight supply
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Can withdraw from market during profitable mining windows
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Actual dispatch events are rare - mostly collect standby payments
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Combine with PPA to maximize value from flexible load
                </li>
              </ul>
            </div>
          </div>
        </div>

        <SectionSummary
          takeaways={[
            "Three reserve types: Regulating (seconds), Spinning (10 min), Supplemental (10 min) - each with different requirements and revenue",
            "Flexible loads like Bitcoin mining can qualify as Supplemental Reserve with 6-12 week qualification process",
            "Revenue potential: $3-40/MW/hour depending on reserve type and market conditions",
            "Actual dispatch is rare (<1% of hours) but standby payments provide reliable additional income stream"
          ]}
          proTip="Stack ancillary services with 12CP optimization. The same curtailment event can capture reserve revenue, avoid 12CP charges, AND avoid high pool prices - triple benefit."
          nextSteps={[
            { title: "PPA Strategies", href: "/aeso-101#ppa-guidance" },
            { title: "Grid Operations", href: "/aeso-101#grid-operations" }
          ]}
        />
      </div>
    </section>
  );
};
