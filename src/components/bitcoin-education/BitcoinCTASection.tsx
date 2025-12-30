import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { Bitcoin, Server, TrendingUp, ArrowRight, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BitcoinSectionWrapper, BitcoinSectionHeader } from './shared';

const BitcoinCTASection: React.FC = () => {
  const navigate = useNavigate();

  const options = [
    {
      icon: Server,
      title: 'Host Your Miners',
      description: 'Professional Bitcoin mining hosting with competitive rates starting at 7.1¢/kWh',
      buttonText: 'View Hosting Options',
      action: () => navigate('/hosting'),
      color: 'hsl(var(--watt-bitcoin))'
    },
    {
      icon: TrendingUp,
      title: 'Invest with WattFund',
      description: 'Access infrastructure investment opportunities in the growing digital economy',
      buttonText: 'Learn About WattFund',
      action: () => navigate('/wattfund'),
      color: 'hsl(var(--watt-trust))'
    },
    {
      icon: Mail,
      title: 'Contact Us',
      description: 'Have questions about Bitcoin mining or infrastructure investment?',
      buttonText: 'Get in Touch',
      action: () => window.location.href = 'mailto:contact@wattbyte.com',
      color: 'hsl(var(--watt-success))'
    }
  ];

  return (
    <BitcoinSectionWrapper theme="dark">
      <ScrollReveal direction="up">
        <BitcoinSectionHeader
          badge="Start Your Journey"
          badgeIcon={Bitcoin}
          title="Ready to Get Involved?"
          description="Whether you want to mine Bitcoin, invest in infrastructure, or just learn more, WattByte has options for you"
          theme="dark"
        />
      </ScrollReveal>

      {/* CTA Options */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        {options.map((option, index) => (
          <ScrollReveal key={option.title} direction="up" delay={index * 0.1}>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 h-full flex flex-col">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ backgroundColor: option.color }}
              >
                <option.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{option.title}</h3>
              <p className="text-white/80 text-base leading-relaxed mb-6 flex-grow">{option.description}</p>
              <Button 
                onClick={option.action}
                className="w-full text-white hover:opacity-90"
                style={{ backgroundColor: option.color }}
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
          <p className="text-white/70 text-base max-w-2xl mx-auto leading-relaxed">
            This educational content is for informational purposes only and does not constitute 
            financial advice. Always do your own research and consult with qualified professionals 
            before making investment decisions.
          </p>
        </div>
      </ScrollReveal>
    </BitcoinSectionWrapper>
  );
};

export default BitcoinCTASection;
