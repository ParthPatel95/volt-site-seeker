import React from 'react';
import { Bitcoin, Target, Eye, Zap, Building2, Server, TrendingUp } from 'lucide-react';
import { LandingNavigation } from '@/components/landing/LandingNavigation';
import { LandingBackground } from '@/components/landing/LandingBackground';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { LeadershipTeamSection } from '@/components/landing/LeadershipTeamSection';
import { Card } from '@/components/ui/card';

const AboutUs: React.FC = () => {
  const stats = [
    { label: 'Global Pipeline', value: '1,429MW', icon: <Zap className="w-5 h-5" /> },
    { label: 'Under Development', value: '135MW', icon: <Building2 className="w-5 h-5" /> },
    { label: 'Global Presence', value: '6 Countries', icon: <Server className="w-5 h-5" /> },
    { label: 'Team Experience', value: '675MW+', icon: <TrendingUp className="w-5 h-5" /> },
  ];

  const coreAreas = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Power Infrastructure',
      description: 'Acquiring and developing strategic power assets with focus on stranded and underutilized energy sources',
    },
    {
      icon: <Server className="w-8 h-8" />,
      title: 'AI/HPC Hosting',
      description: 'Purpose-built facilities for artificial intelligence and high-performance computing workloads',
    },
    {
      icon: <Bitcoin className="w-8 h-8" />,
      title: 'Bitcoin Mining',
      description: 'Energy-efficient infrastructure optimized for digital asset generation and blockchain operations',
    },
  ];

  return (
    <div className="min-h-screen bg-white text-watt-navy relative overflow-hidden">
      <LandingBackground />
      <LandingNavigation />
      
      <div className="pt-14 sm:pt-16 md:pt-20 relative z-10">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 px-6 bg-gradient-to-br from-watt-navy via-watt-navy/95 to-watt-navy">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white">
              About WattByte
            </h1>
            <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto">
              Building Digital Infrastructure at Scale
            </p>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="relative py-16 md:py-20 px-6 bg-watt-light">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="p-8 bg-white border-gray-200 shadow-institutional hover:shadow-lg transition-shadow">
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

              <Card className="p-8 bg-white border-gray-200 shadow-institutional hover:shadow-lg transition-shadow">
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

        {/* What We Do */}
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
                <Card key={index} className="p-8 bg-white border-gray-200 shadow-institutional hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="p-4 bg-watt-trust/10 rounded-xl inline-block mb-4 text-watt-trust">
                    {area.icon}
                  </div>
                  <h3 className="text-xl font-bold text-watt-navy mb-3">{area.title}</h3>
                  <p className="text-watt-navy/70 leading-relaxed">{area.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* By the Numbers */}
        <section className="relative py-16 md:py-20 px-6 bg-watt-light">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-watt-navy">
                By the Numbers
              </h2>
              <p className="text-lg text-watt-navy/70">
                Real infrastructure, real scale
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <Card key={index} className="p-6 bg-white border-gray-200 shadow-institutional text-center hover:shadow-lg transition-shadow">
                  <div className="flex justify-center mb-3 text-watt-trust">
                    {stat.icon}
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-watt-navy mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-watt-navy/70">
                    {stat.label}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Leadership Team Section */}
        <LeadershipTeamSection />

        <LandingFooter />
      </div>
    </div>
  );
};

export default AboutUs;
