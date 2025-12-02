import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { Button } from '@/components/ui/button';
import { Check, TrendingUp, Zap, Building2 } from 'lucide-react';
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
              <ScrollReveal key={pkg.id} delay={index * 0.1}>
                <div className={`relative bg-white border-2 border-border rounded-2xl p-6 transition-all duration-300 ${pkg.borderColor} ${pkg.popular ? 'shadow-lg scale-105' : 'shadow-sm hover:shadow-md'}`}>
                  {pkg.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-watt-bitcoin text-white text-sm font-semibold rounded-full shadow-lg">
                      Most Popular
                    </div>
                  )}
                  
                  <div className="mb-4">
                    <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full border ${pkg.badgeColor} text-xs font-medium mb-3`}>
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

                  <div className="mb-6">
                    <div className="flex items-baseline mb-1">
                      <span className="text-5xl font-bold text-watt-navy">{pkg.rate}</span>
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

                  <ul className="space-y-3 mb-6">
                    {pkg.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <Check className="w-5 h-5 text-watt-success flex-shrink-0 mr-2 mt-0.5" />
                        <span className="text-sm text-watt-navy/70">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button 
                    onClick={() => handleGetStarted(pkg.id)}
                    className={`w-full ${pkg.popular ? 'bg-watt-bitcoin hover:bg-watt-bitcoin/90' : 'bg-watt-navy hover:bg-watt-navy/90'} text-white`}
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
