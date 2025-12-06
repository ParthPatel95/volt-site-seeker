import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { Button } from '@/components/ui/button';
import { Check, TrendingUp, Zap, Building2, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { HostingInquiryForm } from './HostingInquiryForm';

type PackageType = 'byom' | 'buyhost' | 'industrial';

const packages = [
  {
    id: 'byom' as PackageType,
    name: 'Bring Your Own Machine',
    badge: 'Flexible',
    badgeColor: 'bg-watt-trust/10 text-watt-trust border-watt-trust/20',
    icon: Zap,
    rate: '7.8¢',
    setupFee: '$20/miner',
    description: 'Perfect for miners with existing hardware',
    features: [
      'Rack space & installation',
      'Power & cooling management',
      'Real-time monitoring dashboard',
      '24/7 technical support',
      'Direct AESO grid connection'
    ],
    borderColor: 'hover:border-watt-trust',
    glowColor: 'hover:shadow-watt-trust/20',
    popular: false
  },
  {
    id: 'buyhost' as PackageType,
    name: 'Buy & Host',
    badge: 'Most Popular',
    badgeColor: 'bg-watt-bitcoin/10 text-watt-bitcoin border-watt-bitcoin/20',
    icon: TrendingUp,
    rate: '7.5¢',
    setupFee: '$20/miner',
    description: 'Complete turnkey solution with hardware',
    features: [
      'All BYOM features included',
      'Hardware procurement assistance',
      'Full equipment management',
      'Maintenance & repairs included',
      'Optimized mining operations'
    ],
    borderColor: 'hover:border-watt-bitcoin',
    glowColor: 'hover:shadow-watt-bitcoin/20',
    popular: true
  },
  {
    id: 'industrial' as PackageType,
    name: 'Industrial Clients',
    badge: 'Best Value',
    badgeColor: 'bg-watt-success/10 text-watt-success border-watt-success/20',
    icon: Building2,
    rate: '7.1¢',
    setupFee: 'Custom',
    description: 'Enterprise-grade hosting for large deployments',
    minimum: '5MW minimum commitment',
    features: [
      'Dedicated facility space',
      'Custom SLA agreements',
      'Priority technical support',
      'Dedicated account manager',
      'Volume pricing discounts'
    ],
    borderColor: 'hover:border-watt-success',
    glowColor: 'hover:shadow-watt-success/20',
    popular: false
  }
];

export const HostingPackagesSection = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<PackageType>('byom');

  const handleGetStarted = (packageId: PackageType) => {
    setSelectedPackage(packageId);
    setIsFormOpen(true);
  };

  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <ScrollReveal>
          <div className="text-center mb-8 md:mb-10">
            <h2 className="text-3xl md:text-5xl font-bold text-watt-navy mb-4">
              Choose Your Hosting Package
            </h2>
            <p className="text-lg text-watt-navy/70 max-w-2xl mx-auto">
              Flexible hosting solutions designed for every scale of operation
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {packages.map((pkg, index) => {
            const Icon = pkg.icon;
            return (
              <ScrollReveal key={pkg.id} delay={index * 0.15}>
                <div className={`group relative bg-white border-2 border-border rounded-2xl p-6 transition-all duration-500 ${pkg.borderColor} ${pkg.glowColor} ${pkg.popular ? 'shadow-xl scale-105 border-watt-bitcoin/30' : 'shadow-sm hover:shadow-xl hover:-translate-y-1'}`}>
                  {/* Popular Badge with Animation */}
                  {pkg.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-watt-bitcoin to-watt-bitcoin/80 text-white text-sm font-semibold rounded-full shadow-lg animate-pulse">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        Most Popular
                      </span>
                    </div>
                  )}

                  {/* Shimmer effect on popular card */}
                  {pkg.popular && (
                    <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-watt-bitcoin/5 to-transparent" />
                    </div>
                  )}
                  
                  <div className="mb-4 relative z-10">
                    <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full border ${pkg.badgeColor} text-xs font-medium mb-3 group-hover:scale-105 transition-transform`}>
                      <Icon className="w-3 h-3" />
                      <span>{pkg.badge}</span>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-watt-navy mb-2">
                      {pkg.name}
                    </h3>
                    <p className="text-sm text-watt-navy/60">
                      {pkg.description}
                    </p>
                  </div>

                  <div className="mb-6 relative z-10">
                    <div className="flex items-baseline mb-1">
                      <span className="text-5xl font-bold text-watt-navy group-hover:text-watt-bitcoin transition-colors duration-300">{pkg.rate}</span>
                      <span className="text-xl text-watt-navy/60 ml-2">/kWh</span>
                    </div>
                    <div className="text-sm text-watt-navy/60 mb-2">
                      Setup Fee: <span className="font-semibold text-watt-navy">{pkg.setupFee}</span>
                    </div>
                    {pkg.minimum && (
                      <div className="text-sm font-medium text-watt-bitcoin">
                        {pkg.minimum}
                      </div>
                    )}
                  </div>

                  <ul className="space-y-3 mb-6 relative z-10">
                    {pkg.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start group/item">
                        <div className="w-5 h-5 rounded-full bg-watt-success/10 flex items-center justify-center flex-shrink-0 mr-2 mt-0.5 group-hover/item:bg-watt-success/20 transition-colors">
                          <Check className="w-3 h-3 text-watt-success" />
                        </div>
                        <span className="text-sm text-watt-navy/70">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button 
                    onClick={() => handleGetStarted(pkg.id)}
                    className={`w-full relative z-10 transition-all duration-300 ${pkg.popular ? 'bg-watt-bitcoin hover:bg-watt-bitcoin/90 hover:shadow-lg hover:shadow-watt-bitcoin/30' : 'bg-watt-navy hover:bg-watt-navy/90 hover:shadow-lg'} text-white`}
                  >
                    Get Started
                  </Button>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>

      <HostingInquiryForm 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        selectedPackage={selectedPackage}
      />
    </section>
  );
};
