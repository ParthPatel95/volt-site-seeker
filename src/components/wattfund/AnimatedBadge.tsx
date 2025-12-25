import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface AnimatedBadgeProps {
  icon: LucideIcon;
  text: string;
  variant?: 'bitcoin' | 'trust' | 'success';
}

export const AnimatedBadge = ({ icon: Icon, text, variant = 'bitcoin' }: AnimatedBadgeProps) => {
  const colorClasses = {
    bitcoin: {
      bg: 'bg-watt-bitcoin/15',
      border: 'border-watt-bitcoin/40',
      text: 'text-watt-bitcoin',
      glow: 'rgba(247, 147, 26, 0.3)',
    },
    trust: {
      bg: 'bg-watt-trust/15',
      border: 'border-watt-trust/40',
      text: 'text-watt-trust',
      glow: 'rgba(0, 194, 203, 0.3)',
    },
    success: {
      bg: 'bg-watt-success/15',
      border: 'border-watt-success/40',
      text: 'text-watt-success',
      glow: 'rgba(0, 211, 149, 0.3)',
    },
  };

  const colors = colorClasses[variant];

  return (
    <motion.div
      className={`relative inline-flex items-center gap-2 px-5 py-2.5 rounded-full ${colors.bg} border ${colors.border} backdrop-blur-sm overflow-hidden`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.3 }}
    >
      {/* Scanning light effect */}
      <motion.div
        className="absolute inset-0 -translate-x-full"
        style={{
          background: `linear-gradient(90deg, transparent, ${colors.glow}, transparent)`,
        }}
        animate={{
          translateX: ['-100%', '200%'],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
          repeatDelay: 2,
        }}
      />

      {/* Pulsing glow */}
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={{
          boxShadow: [
            `0 0 10px ${colors.glow}`,
            `0 0 25px ${colors.glow}`,
            `0 0 10px ${colors.glow}`,
          ],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Icon with subtle animation */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <Icon className={`w-4 h-4 ${colors.text} relative z-10`} />
      </motion.div>

      {/* Text */}
      <span className={`text-sm font-semibold ${colors.text} tracking-wide relative z-10`}>
        {text}
      </span>
    </motion.div>
  );
};

export default AnimatedBadge;
