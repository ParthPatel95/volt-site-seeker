import { motion } from 'framer-motion';
import { ChevronDown, DollarSign, Building2, TrendingUp, FileText, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HeroBackground } from './HeroBackground';
import { FloatingElements } from './FloatingElements';
import { GlowCard } from './GlowCard';
import { GradientText } from './GradientText';

interface WattFundHeroProps {
  onInquiryClick?: () => void;
}

export const WattFundHero = ({ onInquiryClick }: WattFundHeroProps) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const,
      },
    },
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <HeroBackground />
      
      {/* Floating Decorative Elements */}
      <FloatingElements />
      
      {/* Main Content */}
      <motion.div
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-32"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Badge */}
        <motion.div 
          variants={itemVariants}
          className="flex justify-center mb-6"
        >
          <motion.div 
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-watt-bitcoin/15 border border-watt-bitcoin/40 backdrop-blur-sm"
            whileHover={{ scale: 1.05 }}
            animate={{ 
              boxShadow: [
                '0 0 20px rgba(247, 147, 26, 0.1)',
                '0 0 40px rgba(247, 147, 26, 0.2)',
                '0 0 20px rgba(247, 147, 26, 0.1)',
              ]
            }}
            transition={{ 
              boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" }
            }}
          >
            <TrendingUp className="w-4 h-4 text-watt-bitcoin" />
            <span className="text-sm font-semibold text-watt-bitcoin tracking-wide">
              Institutional Investment Opportunities
            </span>
          </motion.div>
        </motion.div>

        {/* Title with Gradient */}
        <motion.div variants={itemVariants} className="text-center mb-6">
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight">
            <GradientText className="inline-block">WattFund</GradientText>
          </h1>
        </motion.div>

        {/* Tagline */}
        <motion.p 
          variants={itemVariants}
          className="text-xl md:text-2xl lg:text-3xl text-white/80 text-center max-w-4xl mx-auto leading-relaxed mb-4"
        >
          Infrastructure-Grade Investment Vehicles
        </motion.p>

        {/* Subtext */}
        <motion.p 
          variants={itemVariants}
          className="text-base md:text-lg text-white/60 text-center max-w-3xl mx-auto leading-relaxed mb-12"
        >
          Strategic capital deployment across renewable energy and digital infrastructure 
          assets targeting exceptional risk-adjusted returns
        </motion.p>

        {/* Stats Grid with Glow Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-14">
          <GlowCard 
            stat="$400M"
            value={400}
            prefix="$"
            suffix="M"
            label="Total Capital Target"
            icon={DollarSign}
            delay={0.4}
            gradient="trust"
          />
          <GlowCard 
            stat="3 Funds"
            value={3}
            suffix=" Funds"
            label="Strategic Vehicles"
            icon={Building2}
            delay={0.5}
            gradient="bitcoin"
          />
          <GlowCard 
            stat="30-40%"
            value={35}
            suffix="%+"
            label="Target Net IRR"
            icon={TrendingUp}
            delay={0.6}
            gradient="success"
          />
        </div>

        {/* CTA Buttons */}
        <motion.div 
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button 
              size="lg"
              onClick={onInquiryClick}
              className="bg-watt-bitcoin hover:bg-watt-bitcoin/90 text-white px-8 py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl hover:shadow-watt-bitcoin/20 transition-all duration-300"
            >
              <FileText className="w-5 h-5 mr-2" />
              View Investment Deck
            </Button>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button 
              size="lg"
              variant="ghost-dark"
              onClick={onInquiryClick}
              className="px-8 py-6 text-lg font-semibold rounded-xl"
            >
              <Phone className="w-5 h-5 mr-2" />
              Schedule a Call
            </Button>
          </motion.div>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div 
          variants={itemVariants}
          className="mt-14 text-center"
        >
          <p className="text-white/40 text-sm mb-4 tracking-wide uppercase">
            Trusted by Institutional Investors
          </p>
          <div className="flex items-center justify-center gap-8 flex-wrap">
            {['Family Offices', 'Pension Funds', 'Accredited Investors', 'Sovereign Wealth'].map((item, index) => (
              <motion.span 
                key={item}
                className="text-white/30 text-sm font-medium"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 + index * 0.1 }}
              >
                {item}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.5 }}
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-white/40 text-xs tracking-widest uppercase">Scroll to explore</span>
          <ChevronDown className="w-6 h-6 text-white/50" />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default WattFundHero;
