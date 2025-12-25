import { motion } from 'framer-motion';
import { ChevronDown, DollarSign, Building2, TrendingUp, FileText, Phone, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HeroBackground } from './HeroBackground';
import { FloatingElements } from './FloatingElements';
import { TiltCard } from './TiltCard';
import { AnimatedBadge } from './AnimatedBadge';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';

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
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut" as const,
      },
    },
  };

  const letterVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: i * 0.05,
        ease: "easeOut" as const,
      },
    }),
  };

  const title = "WattFund";

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
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
        {/* Animated Badge */}
        <motion.div 
          variants={itemVariants}
          className="flex justify-center mb-8"
        >
          <AnimatedBadge 
            icon={Sparkles} 
            text="Institutional Investment Opportunities" 
            variant="bitcoin"
          />
        </motion.div>

        {/* Animated Title - Letter by Letter */}
        <motion.div variants={itemVariants} className="text-center mb-6">
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold tracking-tight">
            <span className="inline-flex overflow-hidden">
              {title.split('').map((letter, i) => (
                <motion.span
                  key={i}
                  custom={i}
                  variants={letterVariants}
                  initial="hidden"
                  animate="visible"
                  className="inline-block bg-gradient-to-r from-watt-trust via-white to-watt-bitcoin bg-clip-text text-transparent"
                  style={{
                    backgroundSize: '200% 100%',
                  }}
                >
                  {letter}
                </motion.span>
              ))}
            </span>
          </h1>
          
          {/* Animated underline */}
          <motion.div
            className="h-1 mx-auto mt-4 rounded-full bg-gradient-to-r from-transparent via-watt-bitcoin to-transparent"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: '60%', opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8, ease: "easeOut" }}
          />
        </motion.div>

        {/* Tagline with gradient */}
        <motion.p 
          variants={itemVariants}
          className="text-xl md:text-2xl lg:text-3xl text-center max-w-4xl mx-auto leading-relaxed mb-4"
        >
          <span className="bg-gradient-to-r from-white via-white/90 to-white/80 bg-clip-text text-transparent">
            Infrastructure-Grade Investment Vehicles
          </span>
        </motion.p>

        {/* Subtext */}
        <motion.p 
          variants={itemVariants}
          className="text-base md:text-lg text-white/50 text-center max-w-3xl mx-auto leading-relaxed mb-14"
        >
          Strategic capital deployment across renewable energy and digital infrastructure 
          assets targeting exceptional risk-adjusted returns
        </motion.p>

        {/* Stats Grid with TiltCards */}
        <motion.div 
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-14"
        >
          <TiltCard glowColor="rgba(0, 194, 203, 0.3)">
            <div className="p-6 md:p-8">
              <motion.div
                className="w-14 h-14 rounded-2xl bg-gradient-to-br from-watt-trust/30 to-watt-trust/10 flex items-center justify-center mb-4"
                whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                transition={{ duration: 0.5 }}
              >
                <DollarSign className="w-7 h-7 text-watt-trust" />
              </motion.div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                <AnimatedCounter end={400} prefix="$" suffix="M" duration={2500} />
              </div>
              <p className="text-white/70 font-medium">Total Capital Target</p>
              <p className="text-white/40 text-sm mt-1">Across all funds</p>
            </div>
          </TiltCard>

          <TiltCard glowColor="rgba(247, 147, 26, 0.3)">
            <div className="p-6 md:p-8">
              <motion.div
                className="w-14 h-14 rounded-2xl bg-gradient-to-br from-watt-bitcoin/30 to-watt-bitcoin/10 flex items-center justify-center mb-4"
                whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                transition={{ duration: 0.5 }}
              >
                <Building2 className="w-7 h-7 text-watt-bitcoin" />
              </motion.div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                <AnimatedCounter end={3} suffix=" Funds" duration={2000} />
              </div>
              <p className="text-white/70 font-medium">Strategic Vehicles</p>
              <p className="text-white/40 text-sm mt-1">Progressive scaling</p>
            </div>
          </TiltCard>

          <TiltCard glowColor="rgba(0, 211, 149, 0.3)">
            <div className="p-6 md:p-8">
              <motion.div
                className="w-14 h-14 rounded-2xl bg-gradient-to-br from-watt-success/30 to-watt-success/10 flex items-center justify-center mb-4"
                whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                transition={{ duration: 0.5 }}
              >
                <TrendingUp className="w-7 h-7 text-watt-success" />
              </motion.div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                <AnimatedCounter end={35} suffix="%" duration={2500} />
              </div>
              <p className="text-white/70 font-medium">Target Net IRR</p>
              <p className="text-white/40 text-sm mt-1">30-40% Range</p>
            </div>
          </TiltCard>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div 
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <motion.div
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button 
              size="lg"
              onClick={onInquiryClick}
              className="relative overflow-hidden bg-gradient-to-r from-watt-bitcoin to-orange-600 hover:from-watt-bitcoin/90 hover:to-orange-600/90 text-white px-8 py-6 text-lg font-semibold rounded-xl shadow-lg shadow-watt-bitcoin/25 transition-all duration-300"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.6 }}
              />
              <FileText className="w-5 h-5 mr-2 relative z-10" />
              <span className="relative z-10">View Investment Deck</span>
            </Button>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button 
              size="lg"
              variant="ghost-dark"
              onClick={onInquiryClick}
              className="px-8 py-6 text-lg font-semibold rounded-xl border border-white/20 hover:bg-white/10"
            >
              <Phone className="w-5 h-5 mr-2" />
              Schedule a Call
            </Button>
          </motion.div>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div 
          variants={itemVariants}
          className="mt-16 text-center"
        >
          <motion.p 
            className="text-white/30 text-sm mb-5 tracking-widest uppercase"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            Trusted by Institutional Investors
          </motion.p>
          <div className="flex items-center justify-center gap-6 md:gap-10 flex-wrap">
            {['Family Offices', 'Pension Funds', 'Accredited Investors', 'Sovereign Wealth'].map((item, index) => (
              <motion.div 
                key={item}
                className="flex items-center gap-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3 + index * 0.1 }}
              >
                <motion.div
                  className="w-2 h-2 rounded-full bg-watt-trust/50"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity, 
                    delay: index * 0.3 
                  }}
                />
                <span className="text-white/40 text-sm font-medium">
                  {item}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2, duration: 0.5 }}
      >
        <motion.div
          animate={{ y: [0, 12, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-3"
        >
          <span className="text-white/30 text-xs tracking-widest uppercase font-medium">
            Scroll to explore
          </span>
          <motion.div
            className="w-6 h-10 rounded-full border-2 border-white/20 flex justify-center pt-2"
          >
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-watt-bitcoin"
              animate={{ y: [0, 12, 0], opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default WattFundHero;
