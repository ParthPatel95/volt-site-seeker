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
    badgeColor: 'bg-[hsl(var(--watt-trust)/0.1)] text-[hsl(var(--watt-trust))] border-[hsl(var(--watt-trust)/0.2)]',
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
    borderColor: 'hover:border-[hsl(var(--watt-trust))]',
    glowColor: 'hover:shadow-[hsl(var(--watt-trust)/0.2)]',
    popular: false
  },
  {
    id: 'buyhost' as PackageType,
    name: 'Buy & Host',
    badge: 'Most Popular',
    badgeColor: 'bg-[hsl(var(--watt-bitcoin)/0.1)] text-[hsl(var(--watt-bitcoin))] border-[hsl(var(--watt-bitcoin)/0.2)]',
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
    borderColor: 'hover:border-[hsl(var(--watt-bitcoin))]',
    glowColor: 'hover:shadow-[hsl(var(--watt-bitcoin)/0.2)]',
    popular: true
  },
  {
    id: 'industrial' as PackageType,
    name: 'Industrial Clients',
    badge: 'Best Value',
    badgeColor: 'bg-[hsl(var(--watt-success)/0.1)] text-[hsl(var(--watt-success))] border-[hsl(var(--watt-success)/0.2)]',
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
    borderColor: 'hover:border-[hsl(var(--watt-success))]',
    glowColor: 'hover:shadow-[hsl(var(--watt-success)/0.2)]',
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
    <section className="py-12 md:py-16 bg-card">
      <div className="max-w-7xl mx-auto px-6">
        <ScrollReveal>
          <div className="text-center mb-8 md:mb-10">
            <h2 className="text-3xl md:text-5xl font-bold text-[hsl(var(--watt-navy))] mb-4">
              Choose Your Hosting Package
            </h2>
            <p className="text-lg text-[hsl(var(--watt-navy)/0.7)] max-w-2xl mx-auto">
              Flexible hosting solutions designed for every scale of operation
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {packages.map((pkg, index) => {
            const Icon = pkg.icon;
            return (
              <ScrollReveal key={pkg.id} delay={index * 0.15}>
                <div className={`group relative bg-card border-2 border-border rounded-2xl p-6 transition-all duration-500 ${pkg.borderColor} ${pkg.glowColor} ${pkg.popular ? 'shadow-xl scale-105 border-[hsl(var(--watt-bitcoin)/0.3)]' : 'shadow-sm hover:shadow-xl hover:-translate-y-1'}`}>
                  {/* Popular Badge with Animation */}
                  {pkg.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-[hsl(var(--watt-bitcoin))] to-[hsl(var(--watt-bitcoin)/0.8)] text-white text-sm font-semibold rounded-full shadow-lg animate-pulse">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        Most Popular
                      </span>
                    </div>
                  )}

                  {/* Shimmer effect on popular card */}
                  {pkg.popular && (
                    <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-[hsl(var(--watt-bitcoin)/0.05)] to-transparent" />
                    </div>
                  )}
                  
                  <div className="mb-4 relative z-10">
                    <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full border ${pkg.badgeColor} text-xs font-medium mb-3 group-hover:scale-105 transition-transform`}>
                      <Icon className="w-3 h-3" />
                      <span>{pkg.badge}</span>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-[hsl(var(--watt-navy))] mb-2">
                      {pkg.name}
                    </h3>
                    <p className="text-sm text-[hsl(var(--watt-navy)/0.6)]">
                      {pkg.description}
                    </p>
                  </div>

                  <div className="mb-6 relative z-10">
                    <div className="flex items-baseline mb-1">
                      <span className="text-5xl font-bold text-[hsl(var(--watt-navy))] group-hover:text-[hsl(var(--watt-bitcoin))] transition-colors duration-300">{pkg.rate}</span>
                      <span className="text-xl text-[hsl(var(--watt-navy)/0.6)] ml-2">/kWh</span>
                    </div>
                    <div className="text-sm text-[hsl(var(--watt-navy)/0.6)] mb-2">
                      Setup Fee: <span className="font-semibold text-[hsl(var(--watt-navy))]">{pkg.setupFee}</span>
                    </div>
                    {pkg.minimum && (
                      <div className="text-sm font-medium text-[hsl(var(--watt-bitcoin))]">
                        {pkg.minimum}
                      </div>
                    )}
                  </div>

                  <ul className="space-y-3 mb-6 relative z-10">
                    {pkg.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start group/item">
                        <div className="w-5 h-5 rounded-full bg-[hsl(var(--watt-success)/0.1)] flex items-center justify-center flex-shrink-0 mr-2 mt-0.5 group-hover/item:bg-[hsl(var(--watt-success)/0.2)] transition-colors">
                          <Check className="w-3 h-3 text-[hsl(var(--watt-success))]" />
                        </div>
                        <span className="text-sm text-[hsl(var(--watt-navy)/0.7)]">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button 
                    onClick={() => handleGetStarted(pkg.id)}
                    className={`w-full relative z-10 transition-all duration-300 ${pkg.popular ? 'bg-[hsl(var(--watt-bitcoin))] hover:bg-[hsl(var(--watt-bitcoin)/0.9)] hover:shadow-lg hover:shadow-[hsl(var(--watt-bitcoin)/0.3)]' : 'bg-[hsl(var(--watt-navy))] hover:bg-[hsl(var(--watt-navy)/0.9)] hover:shadow-lg'} text-white`}
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
