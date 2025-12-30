import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Zap, Building2, BarChart3, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AESOSectionWrapper, AESOSectionHeader, AESOStatCard } from './shared';
import aesoIndustrialImage from '@/assets/aeso-industrial-load.jpg';

const ctaCards = [
  {
    icon: Building2,
    title: 'Host Your Miners',
    description: 'Access 7.5¢/kWh power at our 135MW Alberta facility with 12CP optimization built-in',
    buttonText: 'View Hosting Packages',
    link: '/hosting',
    color: 'from-[hsl(var(--watt-bitcoin))] to-orange-500',
  },
  {
    icon: BarChart3,
    title: 'VoltScout Platform',
    description: 'Real-time AESO data, 12CP alerts, price forecasting, and optimization tools',
    buttonText: 'Explore VoltScout',
    link: '/app',
    color: 'from-[hsl(var(--watt-coinbase))] to-blue-500',
  },
  {
    icon: MessageSquare,
    title: 'Industrial Inquiry',
    description: 'Large load? Contact us for custom power solutions and grid program participation',
    buttonText: 'Contact Us',
    link: 'mailto:contact@wattbyte.com',
    color: 'from-[hsl(var(--watt-success))] to-emerald-500',
  },
];

const takeaways = [
  { label: 'Pool Price Range', value: '$0 - $999.99', sub: 'CAD/MWh' },
  { label: 'Transmission Adder', value: '$11.73', sub: 'CAD/MWh' },
  { label: '12CP Savings Potential', value: 'Up to 100%', sub: 'Transmission reduction' },
  { label: 'WattByte Facility', value: '135 MW', sub: 'Alberta Heartland' },
];

export const AESOCTASection = () => {
  const navigate = useNavigate();

  const handleClick = (link: string) => {
    if (link.startsWith('mailto:')) {
      window.location.href = link;
    } else {
      navigate(link);
    }
  };

  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={aesoIndustrialImage}
          alt="Industrial Power Facility"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--watt-navy))]/95 via-[hsl(var(--watt-navy))]/90 to-[hsl(var(--watt-navy))]/80" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[hsl(var(--watt-bitcoin))]/20 border border-[hsl(var(--watt-bitcoin))]/40 mb-4">
            <Zap className="w-4 h-4 text-[hsl(var(--watt-bitcoin))]" />
            <span className="text-sm font-medium text-[hsl(var(--watt-bitcoin))]">Ready to Optimize?</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Put Your <span className="text-[hsl(var(--watt-bitcoin))]">AESO Knowledge</span> to Work
          </h2>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Join WattByte and leverage Alberta's deregulated market for maximum profitability
          </p>
        </motion.div>

        {/* CTA Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {ctaCards.map((card, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.02, y: -4 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6 transition-all"
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
            </motion.div>
          ))}
        </div>

        {/* Key Takeaways */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8"
        >
          <h3 className="text-xl font-bold text-white mb-6 text-center">Key Takeaways from AESO 101</h3>
          <div className="grid md:grid-cols-4 gap-6">
            {takeaways.map((item, i) => (
              <motion.div 
                key={i} 
                className="text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 + i * 0.1 }}
              >
                <p className="text-3xl font-bold text-[hsl(var(--watt-bitcoin))] mb-1">{item.value}</p>
                <p className="text-sm font-medium text-white">{item.label}</p>
                <p className="text-xs text-white/50">{item.sub}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12"
        >
          <p className="text-white/70 mb-4">
            Have questions? Our energy experts are ready to help.
          </p>
          <Button
            onClick={() => window.location.href = 'mailto:contact@wattbyte.com'}
            variant="outline"
            className="bg-white/10 text-white border-white/30 hover:bg-white/20"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Schedule a Consultation
          </Button>
        </motion.div>
      </div>
    </section>
  );
};
