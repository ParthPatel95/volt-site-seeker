import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Droplets, 
  ArrowRight,
  Building,
  Phone
} from 'lucide-react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { Button } from '@/components/ui/button';

const HydroCTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 bg-gradient-to-br from-watt-navy via-blue-900 to-watt-navy relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 opacity-20">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full border border-blue-400/30"
            style={{
              width: `${300 + i * 200}px`,
              height: `${300 + i * 200}px`,
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              animation: `pulse ${4 + i * 0.5}s ease-out infinite`,
              animationDelay: `${i * 0.4}s`,
              opacity: 0.3 - i * 0.05,
            }}
          />
        ))}
      </div>

      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        <ScrollReveal>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/20 border border-blue-400/30 mb-8">
            <Droplets className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-blue-300">Ready to Build?</span>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Build Your Hydro-Cooled
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              Mining Facility
            </span>
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <p className="text-lg text-white/70 mb-12 max-w-2xl mx-auto">
            Whether you're looking for turnkey hosting solutions or planning to build 
            your own facility, WattByte has the expertise and infrastructure to help.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={300}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              onClick={() => navigate('/hosting')}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-8 py-6 text-lg rounded-xl shadow-lg shadow-blue-500/25"
            >
              <Building className="w-5 h-5 mr-2" />
              Explore Hosting Options
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            
            <Button
              size="lg"
              variant="outline"
              onClick={() => window.location.href = 'mailto:contact@wattbyte.com'}
              className="border-white/60 text-white hover:bg-white/20 hover:border-white px-8 py-6 text-lg rounded-xl"
            >
              <Phone className="w-5 h-5 mr-2" />
              Contact Our Team
            </Button>
          </div>
        </ScrollReveal>

        {/* Trust indicators */}
        <ScrollReveal delay={400}>
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: '1,429 MW', label: 'Global Pipeline' },
              { value: '135 MW', label: 'Under Development' },
              { value: '6', label: 'Countries' },
              { value: '24/7', label: 'Expert Support' }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-white/60">{stat.label}</div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default HydroCTASection;
