import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Server, Search, Bitcoin, ArrowRight, Sparkles } from 'lucide-react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { Button } from '@/components/ui/button';

const EnhancedCTASection = () => {
  const navigate = useNavigate();

  const ctaOptions = [
    {
      id: 'hosting',
      icon: Server,
      title: 'Host Your Miners',
      description: 'Professional colocation services with 95%+ uptime guarantee and competitive rates starting at 7.1¢/kWh',
      gradient: 'from-watt-bitcoin to-orange-600',
      buttonText: 'View Hosting Packages',
      route: '/hosting',
      highlight: 'Most Popular',
    },
    {
      id: 'voltscout',
      icon: Search,
      title: 'Analyze Sites with VoltScout',
      description: 'AI-powered site intelligence platform to discover and evaluate optimal mining locations worldwide',
      gradient: 'from-purple-500 to-blue-600',
      buttonText: 'Launch VoltScout',
      route: '/app',
      highlight: null,
    },
    {
      id: 'bitcoin',
      icon: Bitcoin,
      title: 'Learn About Bitcoin',
      description: 'Comprehensive guide to Bitcoin: history, mining economics, network security, and market dynamics',
      gradient: 'from-green-500 to-emerald-600',
      buttonText: 'Bitcoin 101',
      route: '/bitcoin',
      highlight: null,
    },
  ];

  return (
    <section className="py-20 md:py-32 bg-gradient-to-b from-muted/30 to-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-watt-bitcoin/10 mb-6">
              <Sparkles className="w-4 h-4 text-watt-bitcoin" />
              <span className="text-watt-bitcoin text-sm font-medium">Ready to Get Started?</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              Explore More
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Take the next step in your Bitcoin infrastructure journey
            </p>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {ctaOptions.map((option, index) => (
            <ScrollReveal key={option.id} delay={0.1 + index * 0.1}>
              <div 
                className="group relative h-full bg-card rounded-2xl border border-border overflow-hidden transition-all duration-300 hover:border-transparent hover:shadow-xl"
              >
                {/* Gradient background on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${option.gradient} opacity-0 group-hover:opacity-10 transition-opacity`} />
                
                {/* Highlight badge */}
                {option.highlight && (
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 rounded-full bg-watt-bitcoin text-white text-xs font-medium">
                      {option.highlight}
                    </span>
                  </div>
                )}

                <div className="relative p-6 md:p-8 flex flex-col h-full">
                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${option.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <option.icon className="w-7 h-7 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-watt-bitcoin transition-colors">
                    {option.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-6 flex-1">
                    {option.description}
                  </p>

                  {/* Button */}
                  <Button
                    onClick={() => navigate(option.route)}
                    className={`w-full bg-gradient-to-r ${option.gradient} hover:opacity-90 text-white group/btn`}
                  >
                    {option.buttonText}
                    <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Bottom navigation */}
        <ScrollReveal delay={0.4}>
          <div className="mt-12 text-center">
            <button
              onClick={() => navigate('/bitcoin')}
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-watt-bitcoin transition-colors group"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              <span>Back to Bitcoin 101</span>
            </button>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default EnhancedCTASection;
