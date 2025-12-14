import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { Bitcoin, Server, TrendingUp, ArrowRight, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

const BitcoinCTASection: React.FC = () => {
  const navigate = useNavigate();

  const options = [
    {
      icon: Server,
      title: 'Host Your Miners',
      description: 'Professional Bitcoin mining hosting with competitive rates starting at 7.1¢/kWh',
      buttonText: 'View Hosting Options',
      action: () => navigate('/hosting'),
      color: 'bg-watt-bitcoin'
    },
    {
      icon: TrendingUp,
      title: 'Invest with WattFund',
      description: 'Access infrastructure investment opportunities in the growing digital economy',
      buttonText: 'Learn About WattFund',
      action: () => navigate('/wattfund'),
      color: 'bg-watt-trust'
    },
    {
      icon: Mail,
      title: 'Contact Us',
      description: 'Have questions about Bitcoin mining or infrastructure investment?',
      buttonText: 'Get in Touch',
      action: () => window.location.href = 'mailto:contact@wattbyte.com',
      color: 'bg-watt-success'
    }
  ];

  return (
    <section className="py-16 md:py-24 px-4 sm:px-6 bg-gradient-to-br from-watt-navy via-watt-navy/95 to-watt-bitcoin/20">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal direction="up">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-watt-bitcoin/20 border border-watt-bitcoin/40 mb-6">
              <Bitcoin className="w-4 h-4 text-watt-bitcoin" />
              <span className="text-sm font-medium text-watt-bitcoin">Start Your Journey</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              Ready to Get Involved?
            </h2>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              Whether you want to mine Bitcoin, invest in infrastructure, or just learn more, 
              WattByte has options for you
            </p>
          </div>
        </ScrollReveal>

        {/* CTA Options */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {options.map((option, index) => (
            <ScrollReveal key={option.title} direction="up" delay={index * 0.1}>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 h-full flex flex-col">
                <div className={`w-12 h-12 rounded-xl ${option.color} flex items-center justify-center mb-4`}>
                  <option.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{option.title}</h3>
                <p className="text-white/70 mb-6 flex-grow">{option.description}</p>
                <Button 
                  onClick={option.action}
                  className={`w-full ${option.color} hover:opacity-90 text-white`}
                >
                  {option.buttonText}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Bottom Note */}
        <ScrollReveal direction="up" delay={0.4}>
          <div className="text-center">
            <p className="text-white/60 text-sm max-w-2xl mx-auto">
              This educational content is for informational purposes only and does not constitute 
              financial advice. Always do your own research and consult with qualified professionals 
              before making investment decisions.
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default BitcoinCTASection;
