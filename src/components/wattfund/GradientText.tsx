import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface GradientTextProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export const GradientText = ({ children, className = '', delay = 0 }: GradientTextProps) => {
  return (
    <motion.span
      className={`bg-gradient-to-r from-foreground via-watt-trust to-watt-bitcoin bg-clip-text text-transparent bg-[length:200%_auto] ${className}`}
      initial={{ opacity: 0, backgroundPosition: '200% center' }}
      animate={{ 
        opacity: 1, 
        backgroundPosition: ['200% center', '-200% center'],
      }}
      transition={{
        opacity: { duration: 0.6, delay },
        backgroundPosition: {
          duration: 8,
          repeat: Infinity,
          ease: "linear",
          delay: delay + 0.5,
        }
      }}
    >
      {children}
    </motion.span>
  );
};

export default GradientText;
