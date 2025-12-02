import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  Target, 
  MapPin, 
  Satellite, 
  TrendingUp, 
  Bell, 
  Database,
  ArrowRight
} from 'lucide-react';
import { ScrollReveal } from './ScrollAnimations';
import { LiveERCOTData } from './LiveERCOTData';
import { LiveAESOData } from './LiveAESOData';
import { VoltScoutHeroStats } from './VoltScoutHeroStats';
import { VoltScoutHowItWorks } from './VoltScoutHowItWorks';

const platformFeatures = [
  {
    icon: Target,
    title: 'VoltScore™ Intelligence',
    description: 'AI-powered scoring system analyzes 50,000+ substations to identify the highest-value energy opportunities with 97% predictive accuracy.',
    metrics: '97% Accuracy',
    featured: true,
  },
  {
    icon: MapPin,
    title: 'Infrastructure Mapping',
    description: 'Real-time visualization of power infrastructure, transmission capacity, and available grid connections.',
    metrics: '50,000+ Sites',
  },
  {
    icon: Satellite,
    title: 'Satellite Intelligence',
    description: 'Advanced satellite imagery analysis to evaluate land characteristics, proximity to infrastructure, and development potential.',
    metrics: 'Weekly Updates',
  },
  {
    icon: TrendingUp,
    title: 'Price Forecasting',
    description: 'Machine learning models predict energy prices with high accuracy to optimize operational decisions.',
    metrics: '2 Live Markets',
  },
  {
    icon: Bell,
    title: 'Broker Network Alerts',
    description: 'Automated notifications from our exclusive broker network for off-market opportunities and new listings.',
    metrics: 'Real-Time',
  },
  {
    icon: Database,
    title: 'Data Center Intel',
    description: 'Comprehensive database of existing and planned data centers with power consumption analytics.',
    metrics: '1,000+ Facilities',
  },
];

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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {platformFeatures.map((feature, index) => {
                  const Icon = feature.icon;
                  const isFeatured = feature.featured;
                  
                  return (
                    <div
                      key={index}
                      className={`group relative bg-white rounded-xl border border-gray-200 hover:border-watt-trust/50 transition-all duration-300 hover:shadow-lg overflow-hidden ${
                        isFeatured ? 'md:col-span-2 lg:col-span-1 lg:row-span-2' : ''
                      }`}
                      style={{
                        animationDelay: `${index * 100}ms`,
                      }}
                    >
                      <div className={`p-6 ${isFeatured ? 'lg:p-8' : ''}`}>
                        <div className="flex items-start justify-between mb-4">
                          <div className={`p-3 rounded-lg bg-watt-trust/10 group-hover:bg-watt-trust/20 transition-colors duration-300 ${isFeatured ? 'p-4' : ''}`}>
                            <Icon className={`text-watt-trust group-hover:scale-110 transition-transform duration-300 ${isFeatured ? 'w-8 h-8' : 'w-6 h-6'}`} />
                          </div>
                          {feature.metrics && (
                            <span className="text-xs font-semibold text-watt-trust bg-watt-trust/10 px-3 py-1 rounded-full">
                              {feature.metrics}
                            </span>
                          )}
                        </div>
                        
                        <h3 className={`font-bold text-watt-navy mb-2 group-hover:text-watt-trust transition-colors duration-300 ${isFeatured ? 'text-xl sm:text-2xl' : 'text-lg'}`}>
                          {feature.title}
                        </h3>
                        <p className={`text-watt-navy/70 leading-relaxed ${isFeatured ? 'text-base sm:text-lg' : 'text-sm'}`}>
                          {feature.description}
                        </p>
                      </div>
                      
                      {/* Hover effect border */}
                      <div className="absolute inset-0 border-2 border-transparent group-hover:border-watt-trust/20 rounded-xl pointer-events-none transition-colors duration-300"></div>
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
