import React, { useEffect, useRef, useState } from 'react';
import { Bitcoin, Target, Eye, Zap, Building2, Server, TrendingUp, Search, BarChart3, ShoppingCart, Rocket, LineChart, Globe, ArrowRight, ChevronDown, Lightbulb, Users, TrendingUp as TrendingUpIcon } from 'lucide-react';
import { LandingNavigation } from '@/components/landing/LandingNavigation';
import { LandingBackground } from '@/components/landing/LandingBackground';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { LeadershipTeamSection } from '@/components/landing/LeadershipTeamSection';
import GlobalPresenceMap from '@/components/landing/GlobalPresenceMap';
import { InteractiveStats } from '@/components/landing/InteractiveStats';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';

// Animated Counter Component
const AnimatedCounter: React.FC<{ end: number; duration?: number; suffix?: string }> = ({ end, duration = 2000, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const countRef = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const startTime = Date.now();
          const animate = () => {
            const now = Date.now();
            const progress = Math.min((now - startTime) / duration, 1);
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            setCount(Math.floor(easeOutQuart * end));
            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          };
          animate();
        }
      },
      { threshold: 0.5 }
    );

    if (countRef.current) {
      observer.observe(countRef.current);
    }

    return () => observer.disconnect();
  }, [end, duration, hasAnimated]);

  return <div ref={countRef}>{count.toLocaleString()}{suffix}</div>;
};

const AboutUs: React.FC = () => {
  const stats = [
    { label: 'Global Pipeline', value: 1429, suffix: 'MW', icon: <Zap className="w-5 h-5" /> },
    { label: 'Under Development', value: 135, suffix: 'MW', icon: <Building2 className="w-5 h-5" /> },
    { label: 'Global Presence', value: 6, suffix: ' Countries', icon: <Globe className="w-5 h-5" /> },
    { label: 'Deal Experience', value: 675, suffix: 'MW+', icon: <TrendingUp className="w-5 h-5" /> },
    { label: 'Transactions Led', value: 275, suffix: 'MW+', icon: <LineChart className="w-5 h-5" /> },
    { label: 'Pipeline Acres', value: 1000, suffix: '+', icon: <Server className="w-5 h-5" /> },
  ];

  const coreAreas = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Power Infrastructure',
      description: 'Acquiring and developing strategic power assets with focus on stranded and underutilized energy sources',
      badge: 'Core Focus',
      stats: ['1,429MW Pipeline', '135MW Under Development']
    },
    {
      icon: <Server className="w-8 h-8" />,
      title: 'AI/HPC Hosting',
      description: 'Purpose-built facilities for artificial intelligence and high-performance computing workloads',
      badge: 'Growth Driver',
      stats: ['Purpose-Built Facilities', 'Flexible Infrastructure']
    },
    {
      icon: <Bitcoin className="w-8 h-8" />,
      title: 'Bitcoin Mining',
      description: 'Energy-efficient infrastructure optimized for digital asset generation and blockchain operations',
      badge: 'Core Revenue',
      stats: ['Energy-Optimized', 'Dual-Revenue Model']
    },
  ];

  const approach = [
    {
      icon: <Search className="w-10 h-10" />,
      title: 'Identify',
      description: 'AI-powered site discovery with VoltScout platform',
      step: '01'
    },
    {
      icon: <BarChart3 className="w-10 h-10" />,
      title: 'Analyze',
      description: 'Deep due diligence on stranded power assets',
      step: '02'
    },
    {
      icon: <ShoppingCart className="w-10 h-10" />,
      title: 'Acquire',
      description: 'Strategic power infrastructure acquisition',
      step: '03'
    },
    {
      icon: <Building2 className="w-10 h-10" />,
      title: 'Develop',
      description: 'Transform to data center-ready sites',
      step: '04'
    },
    {
      icon: <Rocket className="w-10 h-10" />,
      title: 'Optimize',
      description: 'Maximize value through AI/HPC/BTC operations',
      step: '05'
    },
  ];

  const advantages = [
    {
      icon: <Lightbulb className="w-8 h-8" />,
      title: 'AI-Powered Intelligence',
      description: 'VoltScout proprietary platform for stranded asset discovery',
      color: 'watt-trust'
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Deep Operator Experience',
      description: '675MW+ track record with proven infrastructure development',
      color: 'watt-bitcoin'
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: 'Global Network',
      description: 'LP relationships across Asia, MENA, and emerging markets',
      color: 'watt-success'
    },
    {
      icon: <TrendingUpIcon className="w-8 h-8" />,
      title: 'Fast Execution',
      description: 'Established relationships with utilities and regulators',
      color: 'watt-trust'
    },
    {
      icon: <Bitcoin className="w-8 h-8" />,
      title: 'Dual Revenue Streams',
      description: 'Flexible operations between BTC mining and AI/HPC hosting',
      color: 'watt-bitcoin'
    },
  ];

  const globalPresence = [
    { country: '🇨🇦 Canada', projects: ['Alberta Heartland 135MW', 'Newfoundland 198MW'], total: '333MW' },
    { country: '🇺🇸 USA', projects: ['Texas 536MW'], total: '536MW' },
    { country: '🇺🇬 Uganda', projects: ['Jinja 400MW Hydro'], total: '400MW' },
    { country: '🇳🇵 Nepal', projects: ['75MW Mixed'], total: '75MW' },
    { country: '🇧🇹 Bhutan', projects: ['175MW Hydro'], total: '175MW' },
    { country: '🇮🇳 India', projects: ['45MW Solar+Hydro'], total: '45MW' },
  ];

  return (
    <div className="min-h-screen bg-white text-watt-navy relative overflow-hidden">
      <LandingBackground />
      <LandingNavigation />
      
      <div className="pt-14 sm:pt-16 md:pt-20 relative z-10">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 px-6 bg-gradient-to-br from-watt-navy via-watt-navy/95 to-watt-navy">
          <div className="max-w-7xl mx-auto text-center">
            <Badge className="mb-6 bg-watt-bitcoin text-white border-none px-4 py-2 text-sm font-semibold">
              Digital Infrastructure Company
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white animate-fade-in">
              About WattByte
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              Building Digital Infrastructure at Scale
            </p>
            <p className="text-lg text-white/70 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
              WattByte transforms stranded power assets into revenue-generating digital infrastructure, powering the future of AI, high-performance computing, and Bitcoin mining operations.
            </p>
            <div className="mt-12 animate-bounce">
              <ChevronDown className="w-6 h-6 text-white/50 mx-auto" />
            </div>
          </div>
        </section>

        {/* Our Story Section */}
        <ScrollReveal>
          <section className="relative py-16 md:py-20 px-6 bg-watt-light">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-watt-navy">
                  Our Story
                </h2>
                <p className="text-lg text-watt-navy/70 max-w-2xl mx-auto">
                  From opportunity to global infrastructure company
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8 mb-12">
                <Card className="p-8 bg-white border-gray-200 shadow-institutional">
                  <div className="text-watt-bitcoin text-5xl font-bold mb-4">2023</div>
                  <h3 className="text-xl font-bold text-watt-navy mb-3">Founded on Opportunity</h3>
                  <p className="text-watt-navy/70">
                    Identified the massive power-to-data center arbitrage opportunity, combining stranded energy assets with digital infrastructure demand.
                  </p>
                </Card>

                <Card className="p-8 bg-white border-gray-200 shadow-institutional">
                  <div className="text-watt-trust text-5xl font-bold mb-4">675MW+</div>
                  <h3 className="text-xl font-bold text-watt-navy mb-3">Proven Track Record</h3>
                  <p className="text-watt-navy/70">
                    Our team brought 675MW+ of combined deal experience and 275MW+ of transactions led before founding WattByte.
                  </p>
                </Card>

                <Card className="p-8 bg-white border-gray-200 shadow-institutional">
                  <div className="text-watt-success text-5xl font-bold mb-4">6</div>
                  <h3 className="text-xl font-bold text-watt-navy mb-3">Global Expansion</h3>
                  <p className="text-watt-navy/70">
                    Rapidly expanded from North America to 6 countries with 1,429MW global pipeline across strategic markets.
                  </p>
                </Card>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* Mission & Vision */}
        <ScrollReveal>
          <section className="relative py-16 md:py-20 px-6 bg-white">
            <div className="max-w-7xl mx-auto">
              <div className="grid md:grid-cols-2 gap-8">
                <Card className="p-8 bg-white border-gray-200 shadow-institutional hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-watt-trust/10 rounded-lg">
                      <Target className="w-6 h-6 text-watt-trust" />
                    </div>
                    <h2 className="text-2xl font-bold text-watt-navy">Our Mission</h2>
                  </div>
                  <p className="text-watt-navy/70 text-lg leading-relaxed">
                    Turning power into profit through intelligent infrastructure investment. We identify and develop strategic power assets that serve the growing demands of AI, HPC, and Bitcoin mining operations.
                  </p>
                </Card>

                <Card className="p-8 bg-white border-gray-200 shadow-institutional hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-watt-bitcoin/10 rounded-lg">
                      <Eye className="w-6 h-6 text-watt-bitcoin" />
                    </div>
                    <h2 className="text-2xl font-bold text-watt-navy">Our Vision</h2>
                  </div>
                  <p className="text-watt-navy/70 text-lg leading-relaxed">
                    To be the leading digital infrastructure company powering the future of artificial intelligence, high-performance computing, and decentralized finance through strategic power asset development.
                  </p>
                </Card>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* Our Approach Section */}
        <ScrollReveal>
          <section className="relative py-16 md:py-20 px-6 bg-watt-light">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-watt-navy">
                  Our Approach
                </h2>
                <p className="text-lg text-watt-navy/70 max-w-2xl mx-auto">
                  A proven methodology for transforming stranded power into digital infrastructure
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                {approach.map((step, index) => (
                  <Card 
                    key={index} 
                    className="p-6 bg-white border-gray-200 shadow-institutional hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="absolute top-4 right-4 text-6xl font-bold text-watt-navy/5">
                      {step.step}
                    </div>
                    <div className="p-3 bg-watt-trust/10 rounded-xl inline-block mb-4 text-watt-trust relative z-10">
                      {step.icon}
                    </div>
                    <h3 className="text-lg font-bold text-watt-navy mb-2">{step.title}</h3>
                    <p className="text-watt-navy/70 text-sm leading-relaxed">{step.description}</p>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* What We Do */}
        <ScrollReveal>
          <section className="relative py-16 md:py-20 px-6 bg-white">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-watt-navy">
                  What We Do
                </h2>
                <p className="text-lg text-watt-navy/70 max-w-2xl mx-auto">
                  WattByte acquires and develops strategic power infrastructure with AI-powered site intelligence and deep expertise in stranded asset identification
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {coreAreas.map((area, index) => (
                  <Card 
                    key={index} 
                    className="p-8 bg-white border-gray-200 shadow-institutional hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <Badge className="mb-4 bg-watt-bitcoin/10 text-watt-bitcoin border-none">
                      {area.badge}
                    </Badge>
                    <div className="p-4 bg-watt-trust/10 rounded-xl inline-block mb-4 text-watt-trust">
                      {area.icon}
                    </div>
                    <h3 className="text-xl font-bold text-watt-navy mb-3">{area.title}</h3>
                    <p className="text-watt-navy/70 leading-relaxed mb-4">{area.description}</p>
                    <ul className="space-y-2">
                      {area.stats.map((stat, i) => (
                        <li key={i} className="flex items-center text-sm text-watt-navy/70">
                          <div className="w-1.5 h-1.5 bg-watt-trust rounded-full mr-2"></div>
                          {stat}
                        </li>
                      ))}
                    </ul>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* Competitive Advantages */}
        <ScrollReveal>
          <section className="relative py-16 md:py-20 px-6 bg-watt-light">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-watt-navy">
                  Competitive Advantages
                </h2>
                <p className="text-lg text-watt-navy/70 max-w-2xl mx-auto">
                  Why WattByte wins in the digital infrastructure market
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {advantages.map((advantage, index) => {
                  const iconColorClasses: Record<string, string> = {
                    'watt-trust': 'text-watt-trust',
                    'watt-bitcoin': 'text-watt-bitcoin',
                    'watt-success': 'text-watt-success'
                  };
                  const bgColorClasses: Record<string, string> = {
                    'watt-trust': 'bg-watt-trust/10',
                    'watt-bitcoin': 'bg-watt-bitcoin/10',
                    'watt-success': 'bg-watt-success/10'
                  };
                  
                  return (
                    <Card 
                      key={index} 
                      className="p-6 bg-white border-gray-200 shadow-institutional hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className={`p-3 ${bgColorClasses[advantage.color]} rounded-xl inline-block mb-4 ${iconColorClasses[advantage.color]}`}>
                        {advantage.icon}
                      </div>
                      <h3 className="text-lg font-bold text-watt-navy mb-2">{advantage.title}</h3>
                      <p className="text-watt-navy/70 text-sm leading-relaxed">{advantage.description}</p>
                    </Card>
                  );
                })}
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* By the Numbers */}
        <ScrollReveal>
          <section className="relative py-16 md:py-20 px-6 bg-white">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-watt-navy">
                  By the Numbers
                </h2>
                <p className="text-lg text-watt-navy/70">
                  Real infrastructure, real scale, real progress
                </p>
              </div>

              <InteractiveStats />
            </div>
          </section>
        </ScrollReveal>

        {/* Global Presence */}
        <ScrollReveal>
          <section className="relative py-16 md:py-20 px-6 bg-watt-light">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-watt-navy">
                  Global Presence
                </h2>
                <p className="text-lg text-watt-navy/70">
                  Interactive view of our 1,429MW global pipeline across 6 countries
                </p>
              </div>

              <GlobalPresenceMap />
            </div>
          </section>
        </ScrollReveal>

        {/* Leadership Team Section */}
        <LeadershipTeamSection />

        {/* Join Our Mission CTA */}
        <ScrollReveal>
          <section className="relative py-16 md:py-20 px-6 bg-gradient-to-br from-watt-navy via-watt-navy/95 to-watt-navy">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
                Join Our Mission
              </h2>
              <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                Partner with WattByte to build the digital infrastructure powering tomorrow's AI, HPC, and Bitcoin mining operations.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="/app" 
                  className="inline-flex items-center justify-center px-8 py-4 bg-watt-bitcoin text-white font-semibold rounded-lg hover:bg-watt-bitcoin/90 transition-all hover:-translate-y-1 shadow-lg"
                >
                  Partner with WattByte
                  <ArrowRight className="ml-2 w-5 h-5" />
                </a>
                <a 
                  href="/app" 
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-watt-navy font-semibold rounded-lg hover:bg-white/90 transition-all hover:-translate-y-1 shadow-lg"
                >
                  List Your Site
                  <ArrowRight className="ml-2 w-5 h-5" />
                </a>
              </div>
            </div>
          </section>
        </ScrollReveal>

        <LandingFooter />
      </div>
    </div>
  );
};

export default AboutUs;
