import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Zap, Building2, BarChart3, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import aesoIndustrialImage from '@/assets/aeso-industrial-load.jpg';

const ctaCards = [
  {
    icon: Building2,
    title: 'Host Your Miners',
    description: 'Access 7.5¢/kWh power at our 135MW Alberta facility with 12CP optimization built-in',
    buttonText: 'View Hosting Packages',
    link: '/hosting',
    color: 'from-watt-bitcoin to-orange-500',
  },
  {
    icon: BarChart3,
    title: 'VoltScout Platform',
    description: 'Real-time AESO data, 12CP alerts, price forecasting, and optimization tools',
    buttonText: 'Explore VoltScout',
    link: '/app',
    color: 'from-watt-coinbase to-blue-500',
  },
  {
    icon: MessageSquare,
    title: 'Industrial Inquiry',
    description: 'Large load? Contact us for custom power solutions and grid program participation',
    buttonText: 'Contact Us',
    link: 'mailto:contact@wattbyte.com',
    color: 'from-green-500 to-emerald-500',
  },
];

export const AESOCTASection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

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

  const handleClick = (link: string) => {
    if (link.startsWith('mailto:')) {
      window.location.href = link;
    } else {
      navigate(link);
    }
  };

  return (
    <section ref={sectionRef} className="relative py-16 md:py-24 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={aesoIndustrialImage}
          alt="Industrial Power Facility"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-watt-navy/95 via-watt-navy/90 to-watt-navy/80" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className={`text-center mb-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-watt-bitcoin/20 border border-watt-bitcoin/40 mb-4">
            <Zap className="w-4 h-4 text-watt-bitcoin" />
            <span className="text-sm font-medium text-watt-bitcoin">Ready to Optimize?</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Put Your <span className="text-watt-bitcoin">AESO Knowledge</span> to Work
          </h2>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Join WattByte and leverage Alberta's deregulated market for maximum profitability
          </p>
        </div>

        {/* CTA Cards */}
        <div className={`grid md:grid-cols-3 gap-6 mb-12 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          {ctaCards.map((card, i) => (
            <div 
              key={i}
              className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6 hover:bg-white/15 transition-all duration-300 hover:scale-[1.02]"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-4`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{card.title}</h3>
              <p className="text-sm text-white/70 mb-6">{card.description}</p>
              <Button
                onClick={() => handleClick(card.link)}
                className={`w-full bg-gradient-to-r ${card.color} text-white border-none hover:opacity-90`}
              >
                {card.buttonText}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          ))}
        </div>

        {/* Key Takeaways */}
        <div className={`bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8 transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <h3 className="text-xl font-bold text-white mb-6 text-center">Key Takeaways from AESO 101</h3>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { label: 'Pool Price Range', value: '$0 - $999.99', sub: 'CAD/MWh' },
              { label: 'Transmission Adder', value: '$11.73', sub: 'CAD/MWh' },
              { label: '12CP Savings Potential', value: 'Up to 100%', sub: 'Transmission reduction' },
              { label: 'WattByte Facility', value: '135 MW', sub: 'Alberta Heartland' },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <p className="text-3xl font-bold text-watt-bitcoin mb-1">{item.value}</p>
                <p className="text-sm font-medium text-white">{item.label}</p>
                <p className="text-xs text-white/50">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className={`text-center mt-12 transition-all duration-700 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <p className="text-white/70 mb-4">
            Have questions? Our energy experts are ready to help.
          </p>
          <Button
            onClick={() => window.location.href = 'mailto:contact@wattbyte.com'}
            className="bg-white text-watt-navy hover:bg-white/90 border-none"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Schedule a Consultation
          </Button>
        </div>
      </div>
    </section>
  );
};
