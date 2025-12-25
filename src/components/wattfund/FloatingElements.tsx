import { motion } from 'framer-motion';
import { Bitcoin, Zap, TrendingUp, Building2, Cpu, Leaf, Server, CircuitBoard } from 'lucide-react';

const floatingIcons = [
  { Icon: Bitcoin, x: '8%', y: '18%', size: 28, delay: 0, duration: 8, opacity: 0.4, color: 'text-watt-bitcoin' },
  { Icon: Zap, x: '88%', y: '12%', size: 24, delay: 1.5, duration: 9, opacity: 0.35, color: 'text-watt-trust' },
  { Icon: TrendingUp, x: '78%', y: '72%', size: 26, delay: 3, duration: 10, opacity: 0.3, color: 'text-watt-success' },
  { Icon: Building2, x: '12%', y: '78%', size: 30, delay: 0.8, duration: 9, opacity: 0.35, color: 'text-white' },
  { Icon: Cpu, x: '92%', y: '42%', size: 22, delay: 2, duration: 8, opacity: 0.25, color: 'text-watt-trust' },
  { Icon: Leaf, x: '4%', y: '48%', size: 24, delay: 4, duration: 11, opacity: 0.3, color: 'text-watt-success' },
  { Icon: Server, x: '68%', y: '8%', size: 20, delay: 1, duration: 7, opacity: 0.2, color: 'text-watt-bitcoin' },
  { Icon: CircuitBoard, x: '22%', y: '88%', size: 22, delay: 2.5, duration: 10, opacity: 0.25, color: 'text-watt-trust' },
];

export const FloatingElements = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Floating Icons with enhanced animations */}
      {floatingIcons.map(({ Icon, x, y, size, delay, duration, opacity, color }, index) => (
        <motion.div
          key={index}
          className="absolute hidden md:block"
          style={{ left: x, top: y }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: [0, opacity, opacity, 0],
            scale: [0.8, 1, 1, 0.8],
            y: [0, -30, -60, -30, 0],
            x: [0, 15, 0, -15, 0],
            rotate: [0, 10, -10, 5, 0],
          }}
          transition={{
            duration,
            delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <motion.div
            className="relative"
            whileHover={{ scale: 1.2 }}
          >
            {/* Glow effect behind icon */}
            <div 
              className={`absolute inset-0 blur-lg ${color} opacity-50`}
              style={{ transform: 'scale(1.5)' }}
            />
            <Icon 
              className={`${color} relative z-10`}
              style={{ width: size, height: size }}
            />
          </motion.div>
        </motion.div>
      ))}

      {/* Animated connection lines */}
      <svg className="absolute inset-0 w-full h-full opacity-30">
        <defs>
          <linearGradient id="enhanced-line-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(0, 194, 203, 0.4)" />
            <stop offset="50%" stopColor="rgba(247, 147, 26, 0.3)" />
            <stop offset="100%" stopColor="rgba(0, 211, 149, 0.4)" />
          </linearGradient>
          
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Animated curved paths */}
        <motion.path
          d="M 50 150 Q 300 50 550 200 T 1050 120"
          fill="none"
          stroke="url(#enhanced-line-gradient)"
          strokeWidth="1.5"
          filter="url(#glow)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.5 }}
          transition={{ duration: 3, delay: 0.5, ease: "easeInOut" }}
        />
        
        <motion.path
          d="M 150 350 Q 400 250 650 400 T 1100 300"
          fill="none"
          stroke="url(#enhanced-line-gradient)"
          strokeWidth="1"
          filter="url(#glow)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.3 }}
          transition={{ duration: 3.5, delay: 1, ease: "easeInOut" }}
        />

        <motion.path
          d="M 100 500 Q 350 400 600 520 T 1000 450"
          fill="none"
          stroke="url(#enhanced-line-gradient)"
          strokeWidth="1"
          filter="url(#glow)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.25 }}
          transition={{ duration: 4, delay: 1.5, ease: "easeInOut" }}
        />
      </svg>

      {/* Floating orbs */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={`orb-${i}`}
          className="absolute rounded-full hidden lg:block"
          style={{
            width: 4 + i * 2,
            height: 4 + i * 2,
            left: `${15 + i * 18}%`,
            top: `${20 + (i % 3) * 25}%`,
            background: i % 2 === 0 
              ? 'rgba(0, 194, 203, 0.6)' 
              : 'rgba(247, 147, 26, 0.5)',
          }}
          animate={{
            y: [0, -40, 0],
            x: [0, 20, 0],
            opacity: [0.3, 0.8, 0.3],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 6 + i,
            delay: i * 0.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

export default FloatingElements;
