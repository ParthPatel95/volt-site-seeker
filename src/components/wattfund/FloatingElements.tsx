import { motion } from 'framer-motion';
import { Bitcoin, Zap, TrendingUp, Building2, Cpu, Leaf } from 'lucide-react';

const floatingIcons = [
  { Icon: Bitcoin, x: '10%', y: '20%', size: 24, delay: 0, duration: 6, hideOnMobile: false },
  { Icon: Zap, x: '85%', y: '15%', size: 20, delay: 1, duration: 7, hideOnMobile: true },
  { Icon: TrendingUp, x: '75%', y: '70%', size: 22, delay: 2, duration: 8, hideOnMobile: true },
  { Icon: Building2, x: '15%', y: '75%', size: 26, delay: 0.5, duration: 7, hideOnMobile: false },
  { Icon: Cpu, x: '90%', y: '45%', size: 18, delay: 1.5, duration: 6, hideOnMobile: true },
  { Icon: Leaf, x: '5%', y: '50%', size: 20, delay: 2.5, duration: 8, hideOnMobile: true },
];

export const FloatingElements = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {floatingIcons.map(({ Icon, x, y, size, delay, duration, hideOnMobile }, index) => (
        <motion.div
          key={index}
          className={`absolute ${hideOnMobile ? 'hidden md:block' : ''}`}
          style={{ left: x, top: y }}
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: [0.1, 0.25, 0.1],
            y: [0, -20, 0],
            x: [0, 10, 0],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration,
            delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Icon 
            className="text-white/20" 
            style={{ width: size, height: size }}
          />
        </motion.div>
      ))}

      {/* Connecting lines/particles effect */}
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(0, 194, 203, 0.2)" />
            <stop offset="50%" stopColor="rgba(247, 147, 26, 0.1)" />
            <stop offset="100%" stopColor="rgba(0, 194, 203, 0.2)" />
          </linearGradient>
        </defs>
        
        <motion.path
          d="M 100 200 Q 300 100 500 300 T 900 200"
          fill="none"
          stroke="url(#line-gradient)"
          strokeWidth="1"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.3 }}
          transition={{ duration: 2, delay: 1 }}
        />
        
        <motion.path
          d="M 200 400 Q 400 300 600 450 T 1000 350"
          fill="none"
          stroke="url(#line-gradient)"
          strokeWidth="1"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.2 }}
          transition={{ duration: 2.5, delay: 1.5 }}
        />
      </svg>
    </div>
  );
};

export default FloatingElements;
