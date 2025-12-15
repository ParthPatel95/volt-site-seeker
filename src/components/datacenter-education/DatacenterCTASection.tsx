import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Server, MapPin, TrendingUp, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';

const DatacenterCTASection = () => {
  const navigate = useNavigate();

  const ctaCards = [
    {
      icon: Server,
      title: 'Host Your Miners',
      description: 'Professional colocation services starting at 7.1¢/kWh with 95% uptime guarantee',
      buttonText: 'View Hosting Packages',
      route: '/hosting',
      color: 'from-watt-bitcoin to-orange-600',
    },
    {
      icon: MapPin,
      title: 'Find Prime Locations',
      description: 'Use VoltScout to discover optimal sites with low energy costs and grid access',
      buttonText: 'Explore VoltScout',
      route: '/voltscout',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: TrendingUp,
      title: 'Invest in Infrastructure',
      description: 'Join WattFund to participate in large-scale mining infrastructure investments',
      buttonText: 'Learn About WattFund',
      route: '/wattfund',
      color: 'from-green-500 to-emerald-600',
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-watt-navy">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Build Your Mining Operation?
            </h2>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              Whether you're hosting miners, scouting locations, or investing in infrastructure, 
              WattByte has the tools and expertise you need.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-6">
          {ctaCards.map((card, index) => (
            <ScrollReveal key={index} delay={index * 0.1}>
              <div className="h-full p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-white/20 transition-all group">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <card.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{card.title}</h3>
                <p className="text-white/60 text-sm mb-6">{card.description}</p>
                <Button 
                  onClick={() => navigate(card.route)}
                  variant="outline"
                  className="w-full border-white/20 text-white hover:bg-white/10 group"
                >
                  {card.buttonText}
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Back to Bitcoin Education link */}
        <ScrollReveal delay={0.4}>
          <div className="mt-12 text-center">
            <button
              onClick={() => navigate('/bitcoin')}
              className="text-white/50 hover:text-white text-sm flex items-center gap-2 mx-auto transition-colors"
            >
              ← Back to Learn Bitcoin
            </button>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default DatacenterCTASection;
