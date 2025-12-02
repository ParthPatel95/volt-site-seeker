import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { 
  Target, 
  MapPin, 
  Satellite, 
  TrendingUp, 
  Bell, 
  Database,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { ScrollReveal } from './ScrollAnimations';
import { LiveERCOTData } from './LiveERCOTData';
import { LiveAESOData } from './LiveAESOData';
import { VoltScoutHeroStats } from './VoltScoutHeroStats';
import { VoltScoutHowItWorks } from './VoltScoutHowItWorks';
import { AnimatedCounter } from '@/components/AnimatedCounter';

const platformFeatures = [
  {
    icon: MapPin,
    title: 'Infrastructure Mapping',
    description: 'Real-time visualization of power infrastructure, transmission capacity, and available grid connections.',
    metrics: '50,000+ Sites',
    color: 'trust', // Blue
  },
  {
    icon: Satellite,
    title: 'Satellite Intelligence',
    description: 'Advanced satellite imagery analysis to evaluate land characteristics, proximity to infrastructure, and development potential.',
    metrics: 'Weekly Updates',
    color: 'purple', // Purple
  },
  {
    icon: TrendingUp,
    title: 'Price Forecasting',
    description: 'Machine learning models predict energy prices with high accuracy to optimize operational decisions.',
    metrics: '2 Live Markets',
    color: 'success', // Green
  },
  {
    icon: Bell,
    title: 'Broker Network Alerts',
    description: 'Automated notifications from our exclusive broker network for off-market opportunities and new listings.',
    metrics: 'Real-Time',
    color: 'bitcoin', // Orange
  },
  {
    icon: Database,
    title: 'Data Center Intel',
    description: 'Comprehensive database of existing and planned data centers with power consumption analytics.',
    metrics: '1,000+ Facilities',
    color: 'navy', // Navy
  },
];

const colorConfig = {
  trust: {
    border: 'border-l-watt-trust',
    iconBg: 'bg-gradient-to-br from-watt-trust/20 to-watt-trust/5',
    iconColor: 'text-watt-trust',
    badgeBg: 'bg-watt-trust/10',
    badgeText: 'text-watt-trust',
    hoverBorder: 'hover:border-watt-trust/30',
  },
  purple: {
    border: 'border-l-purple-500',
    iconBg: 'bg-gradient-to-br from-purple-500/20 to-purple-500/5',
    iconColor: 'text-purple-500',
    badgeBg: 'bg-purple-500/10',
    badgeText: 'text-purple-500',
    hoverBorder: 'hover:border-purple-500/30',
  },
  success: {
    border: 'border-l-watt-success',
    iconBg: 'bg-gradient-to-br from-watt-success/20 to-watt-success/5',
    iconColor: 'text-watt-success',
    badgeBg: 'bg-watt-success/10',
    badgeText: 'text-watt-success',
    hoverBorder: 'hover:border-watt-success/30',
  },
  bitcoin: {
    border: 'border-l-watt-bitcoin',
    iconBg: 'bg-gradient-to-br from-watt-bitcoin/20 to-watt-bitcoin/5',
    iconColor: 'text-watt-bitcoin',
    badgeBg: 'bg-watt-bitcoin/10',
    badgeText: 'text-watt-bitcoin',
    hoverBorder: 'hover:border-watt-bitcoin/30',
  },
  navy: {
    border: 'border-l-watt-navy',
    iconBg: 'bg-gradient-to-br from-watt-navy/20 to-watt-navy/5',
    iconColor: 'text-watt-navy',
    badgeBg: 'bg-watt-navy/10',
    badgeText: 'text-watt-navy',
    hoverBorder: 'hover:border-watt-navy/30',
  },
};

export const VoltScoutIntelligenceHub = () => {
  const [activeTab, setActiveTab] = useState('features');

  return (
    <section className="relative z-10 py-12 md:py-16 px-3 sm:px-4 md:px-6 bg-gradient-to-b from-white to-watt-light">
      <div className="max-w-7xl mx-auto">
        
        {/* Hero Banner */}
        <ScrollReveal delay={100}>
          <div className="text-center mb-8 md:mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-watt-trust/10 border border-watt-trust/20 mb-4">
              <div className="w-2 h-2 bg-watt-trust rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-watt-trust">AI-Powered • Real-Time • North America</span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-watt-navy mb-3 sm:mb-4 leading-tight">
              VoltScout Intelligence Hub
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-watt-navy/70 max-w-3xl mx-auto leading-relaxed px-2 mb-6">
              AI-powered energy discovery platform with live market intelligence
            </p>
            
            <VoltScoutHeroStats />
          </div>
        </ScrollReveal>

        {/* Tabbed Interface */}
        <ScrollReveal delay={200}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8 bg-white border border-gray-200 p-1 rounded-lg h-auto">
              <TabsTrigger 
                value="features" 
                className="data-[state=active]:bg-watt-trust data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300 py-3 text-sm sm:text-base"
              >
                Platform Features
              </TabsTrigger>
              <TabsTrigger 
                value="markets" 
                className="data-[state=active]:bg-watt-success data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300 py-3 text-sm sm:text-base"
              >
                Live Markets
              </TabsTrigger>
              <TabsTrigger 
                value="howto" 
                className="data-[state=active]:bg-watt-bitcoin data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300 py-3 text-sm sm:text-base"
              >
                How It Works
              </TabsTrigger>
            </TabsList>

            {/* Platform Features Tab */}
            <TabsContent value="features" className="mt-0 animate-fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
                {/* VoltScore Hero Card */}
                <div className="lg:col-span-2 bg-gradient-to-br from-watt-navy via-watt-navy to-watt-bitcoin/80 rounded-2xl p-6 sm:p-8 text-white shadow-xl overflow-hidden relative group">
                  {/* Background pattern */}
                  <div className="absolute inset-0 opacity-5">
                    <div className="absolute inset-0" style={{
                      backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                      backgroundSize: '32px 32px'
                    }}></div>
                  </div>
                  
                  <div className="relative z-10">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                      <div className="flex items-center gap-4">
                        <div className="p-4 bg-white/10 rounded-xl backdrop-blur border border-white/20 group-hover:scale-105 transition-transform duration-300">
                          <Target className="w-10 h-10 text-watt-bitcoin" />
                        </div>
                        <div>
                          <Badge className="bg-watt-bitcoin text-white border-0 mb-2 gap-1">
                            <Sparkles className="w-3 h-3" />
                            AI-Powered
                          </Badge>
                          <h3 className="text-2xl sm:text-3xl font-bold">VoltScore™ Intelligence</h3>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-white/90 text-base sm:text-lg mb-8 leading-relaxed max-w-3xl">
                      AI-powered scoring system analyzes 50,000+ substations to identify the highest-value energy opportunities with 97% predictive accuracy.
                    </p>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                      <div className="text-center p-4 bg-white/5 rounded-xl backdrop-blur border border-white/10">
                        <div className="text-3xl sm:text-4xl font-bold text-watt-bitcoin mb-1">
                          <AnimatedCounter end={97} suffix="%" />
                        </div>
                        <div className="text-xs sm:text-sm text-white/70">Accuracy</div>
                      </div>
                      <div className="text-center p-4 bg-white/5 rounded-xl backdrop-blur border border-white/10">
                        <div className="text-3xl sm:text-4xl font-bold mb-1">
                          <AnimatedCounter end={50} suffix="K+" />
                        </div>
                        <div className="text-xs sm:text-sm text-white/70">Sites Analyzed</div>
                      </div>
                      <div className="text-center p-4 bg-white/5 rounded-xl backdrop-blur border border-white/10">
                        <div className="text-3xl sm:text-4xl font-bold text-watt-success mb-1">
                          <AnimatedCounter end={2} />
                        </div>
                        <div className="text-xs sm:text-sm text-white/70">Live Markets</div>
                      </div>
                      <div className="text-center p-4 bg-white/5 rounded-xl backdrop-blur border border-white/10">
                        <div className="text-3xl sm:text-4xl font-bold mb-1">24/7</div>
                        <div className="text-xs sm:text-sm text-white/70">Real-Time</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Regular Feature Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {platformFeatures.map((feature, index) => {
                  const Icon = feature.icon;
                  const colors = colorConfig[feature.color as keyof typeof colorConfig];
                  
                  return (
                    <div
                      key={index}
                      className={`group relative bg-white rounded-xl border-l-4 ${colors.border} border-t border-r border-b border-gray-200 ${colors.hoverBorder} transition-all duration-300 hover:shadow-lg hover:-translate-y-1 overflow-hidden`}
                      style={{
                        animationDelay: `${(index + 1) * 100}ms`,
                      }}
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className={`w-12 h-12 rounded-xl ${colors.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                            <Icon className={`w-6 h-6 ${colors.iconColor}`} />
                          </div>
                          {feature.metrics && (
                            <span className={`text-xs font-semibold ${colors.badgeText} ${colors.badgeBg} px-3 py-1 rounded-full`}>
                              {feature.metrics}
                            </span>
                          )}
                        </div>
                        
                        <h3 className="text-lg font-bold text-watt-navy mb-2 group-hover:text-watt-trust transition-colors duration-300">
                          {feature.title}
                        </h3>
                        <p className="text-sm text-watt-navy/70 leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            {/* Live Markets Tab */}
            <TabsContent value="markets" className="mt-0 animate-fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <LiveERCOTData />
                <LiveAESOData />
              </div>
              <div className="mt-6 p-4 bg-watt-light border border-gray-200 rounded-lg">
                <p className="text-sm text-watt-navy/70 text-center">
                  <span className="inline-flex items-center gap-2">
                    <div className="w-2 h-2 bg-watt-success rounded-full animate-pulse"></div>
                    Live data updated every 5 minutes from ERCOT and AESO markets
                  </span>
                </p>
              </div>
            </TabsContent>

            {/* How It Works Tab */}
            <TabsContent value="howto" className="mt-0 animate-fade-in">
              <VoltScoutHowItWorks />
            </TabsContent>
          </Tabs>
        </ScrollReveal>

        {/* Unified CTA */}
        <ScrollReveal delay={300}>
          <div className="mt-10 md:mt-12 text-center">
            <Link to="/app">
              <Button 
                size="lg" 
                className="bg-watt-bitcoin hover:bg-watt-bitcoin/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 group px-8 py-6 text-base sm:text-lg"
              >
                Access VoltScout Platform
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </Link>
            <p className="text-sm text-watt-navy/60 mt-4">
              Platform access limited to qualified investors and partners
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
