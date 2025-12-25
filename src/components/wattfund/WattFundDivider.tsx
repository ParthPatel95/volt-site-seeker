import { motion } from 'framer-motion';

interface WattFundDividerProps {
  variant?: 'wave' | 'particles' | 'gradient';
  color?: 'trust' | 'bitcoin' | 'success' | 'purple';
  inverted?: boolean;
}

export const WattFundDivider = ({ 
  variant = 'wave', 
  color = 'trust',
  inverted = false 
}: WattFundDividerProps) => {
  const colorValues = {
    trust: { primary: 'rgba(0, 194, 203, 0.3)', secondary: 'rgba(0, 194, 203, 0.1)' },
    bitcoin: { primary: 'rgba(247, 147, 26, 0.3)', secondary: 'rgba(247, 147, 26, 0.1)' },
    success: { primary: 'rgba(0, 211, 149, 0.3)', secondary: 'rgba(0, 211, 149, 0.1)' },
    purple: { primary: 'rgba(124, 58, 237, 0.3)', secondary: 'rgba(124, 58, 237, 0.1)' },
  };

  const colors = colorValues[color];

  if (variant === 'wave') {
    return (
      <div className={`relative h-24 overflow-hidden ${inverted ? 'rotate-180' : ''}`}>
        <svg
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="none"
          viewBox="0 0 1440 120"
        >
          <motion.path
            d="M0,60 C360,120 720,0 1080,60 C1260,90 1380,75 1440,60 L1440,120 L0,120 Z"
            fill={colors.secondary}
            initial={{ d: "M0,60 C360,120 720,0 1080,60 C1260,90 1380,75 1440,60 L1440,120 L0,120 Z" }}
            animate={{
              d: [
                "M0,60 C360,120 720,0 1080,60 C1260,90 1380,75 1440,60 L1440,120 L0,120 Z",
                "M0,80 C360,40 720,100 1080,40 C1260,60 1380,85 1440,70 L1440,120 L0,120 Z",
                "M0,60 C360,120 720,0 1080,60 C1260,90 1380,75 1440,60 L1440,120 L0,120 Z",
              ],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.path
            d="M0,80 C360,40 720,100 1080,60 C1260,70 1380,90 1440,80 L1440,120 L0,120 Z"
            fill={colors.primary}
            initial={{ d: "M0,80 C360,40 720,100 1080,60 C1260,70 1380,90 1440,80 L1440,120 L0,120 Z" }}
            animate={{
              d: [
                "M0,80 C360,40 720,100 1080,60 C1260,70 1380,90 1440,80 L1440,120 L0,120 Z",
                "M0,60 C360,100 720,40 1080,80 C1260,60 1380,70 1440,90 L1440,120 L0,120 Z",
                "M0,80 C360,40 720,100 1080,60 C1260,70 1380,90 1440,80 L1440,120 L0,120 Z",
              ],
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          />
        </svg>
      </div>
    );
  }

  if (variant === 'particles') {
    return (
      <div className="relative h-16 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center gap-4">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: i % 2 === 0 ? colors.primary : colors.secondary }}
              animate={{
                y: [0, -10, 0],
                opacity: [0.3, 1, 0.3],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.1,
              }}
            />
          ))}
        </div>
        <div 
          className="absolute inset-0 h-px top-1/2"
          style={{
            background: `linear-gradient(90deg, transparent, ${colors.primary}, transparent)`,
          }}
        />
      </div>
    );
  }

  // Gradient variant
  return (
    <div className="relative h-20 overflow-hidden">
      <motion.div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(90deg, transparent, ${colors.primary}, ${colors.secondary}, ${colors.primary}, transparent)`,
          backgroundSize: '200% 100%',
        }}
        animate={{
          backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-watt-navy via-transparent to-watt-light" />
    </div>
  );
};

export default WattFundDivider;
