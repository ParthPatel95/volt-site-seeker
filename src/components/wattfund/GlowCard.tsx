import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';

interface GlowCardProps {
  stat: string;
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  sublabel?: string;
  icon: LucideIcon;
  delay?: number;
  gradient?: 'trust' | 'bitcoin' | 'success';
}

export const GlowCard = ({ 
  stat, 
  value,
  suffix = '',
  prefix = '',
  label,
  sublabel,
  icon: Icon, 
  delay = 0,
  gradient = 'trust'
}: GlowCardProps) => {
  const gradientColors = {
    trust: 'from-watt-trust/20 to-watt-trust/5',
    bitcoin: 'from-watt-bitcoin/20 to-watt-bitcoin/5',
    success: 'from-watt-success/20 to-watt-success/5',
  };

  const borderColors = {
    trust: 'border-watt-trust/30 hover:border-watt-trust/50',
    bitcoin: 'border-watt-bitcoin/30 hover:border-watt-bitcoin/50',
    success: 'border-watt-success/30 hover:border-watt-success/50',
  };

  const glowColors = {
    trust: 'group-hover:shadow-watt-trust/20',
    bitcoin: 'group-hover:shadow-watt-bitcoin/20',
    success: 'group-hover:shadow-watt-success/20',
  };

  const iconColors = {
    trust: 'text-watt-trust',
    bitcoin: 'text-watt-bitcoin',
    success: 'text-watt-success',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.6, 
        delay,
        ease: [0.22, 1, 0.36, 1]
      }}
      whileHover={{ 
        y: -5, 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      className="group relative"
    >
      {/* Animated border glow */}
      <motion.div
        className={`absolute -inset-0.5 rounded-2xl bg-gradient-to-r ${gradientColors[gradient]} opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500`}
        animate={{
          scale: [1, 1.02, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      <div className={`relative bg-white/10 backdrop-blur-md rounded-2xl p-6 md:p-8 border ${borderColors[gradient]} transition-all duration-300 group-hover:shadow-2xl ${glowColors[gradient]}`}>
        {/* Icon with animation */}
        <motion.div
          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradientColors[gradient]} flex items-center justify-center mb-4`}
          whileHover={{ rotate: [0, -10, 10, 0] }}
          transition={{ duration: 0.5 }}
        >
          <Icon className={`w-6 h-6 ${iconColors[gradient]}`} />
        </motion.div>
        
        {/* Stat value with counter */}
        <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 flex items-baseline">
          <AnimatedCounter 
            end={value} 
            prefix={prefix}
            suffix={suffix}
            duration={2000}
          />
        </div>
        
        {/* Label */}
        <div className="text-white/70 text-sm md:text-base font-medium">
          {label}
        </div>
        
        {/* Sublabel */}
        {sublabel && (
          <div className="text-white/40 text-xs mt-1">
            {sublabel}
          </div>
        )}

        {/* Decorative corner accent */}
        <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl ${gradientColors[gradient]} opacity-50 rounded-tr-2xl rounded-bl-[80px]`} />
      </div>
    </motion.div>
  );
};

export default GlowCard;
