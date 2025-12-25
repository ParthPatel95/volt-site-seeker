import { motion } from 'framer-motion';

export const AuroraEffect = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Primary aurora wave */}
      <motion.div
        className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%]"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% 50%, 
              rgba(0, 194, 203, 0.15) 0%, 
              transparent 50%
            )
          `,
        }}
        animate={{
          rotate: [0, 360],
          scale: [1, 1.1, 1],
        }}
        transition={{
          rotate: { duration: 60, repeat: Infinity, ease: "linear" },
          scale: { duration: 8, repeat: Infinity, ease: "easeInOut" },
        }}
      />

      {/* Secondary aurora wave */}
      <motion.div
        className="absolute -top-1/4 -right-1/4 w-[150%] h-[150%]"
        style={{
          background: `
            radial-gradient(ellipse 60% 40% at 60% 40%, 
              rgba(247, 147, 26, 0.1) 0%, 
              transparent 50%
            )
          `,
        }}
        animate={{
          rotate: [360, 0],
          scale: [1, 1.2, 1],
          x: [0, 50, 0],
          y: [0, -30, 0],
        }}
        transition={{
          rotate: { duration: 45, repeat: Infinity, ease: "linear" },
          scale: { duration: 10, repeat: Infinity, ease: "easeInOut" },
          x: { duration: 15, repeat: Infinity, ease: "easeInOut" },
          y: { duration: 12, repeat: Infinity, ease: "easeInOut" },
        }}
      />

      {/* Tertiary aurora pulse */}
      <motion.div
        className="absolute bottom-0 left-1/4 w-[100%] h-[80%]"
        style={{
          background: `
            radial-gradient(ellipse 70% 60% at 30% 80%, 
              rgba(0, 211, 149, 0.08) 0%, 
              transparent 60%
            )
          `,
        }}
        animate={{
          opacity: [0.5, 1, 0.5],
          scale: [0.95, 1.05, 0.95],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Flowing light beams */}
      <motion.div
        className="absolute top-0 left-0 w-full h-full"
        style={{
          background: `
            linear-gradient(
              125deg,
              transparent 0%,
              rgba(0, 194, 203, 0.03) 25%,
              transparent 30%,
              rgba(247, 147, 26, 0.02) 45%,
              transparent 50%,
              rgba(0, 211, 149, 0.03) 70%,
              transparent 100%
            )
          `,
          backgroundSize: '200% 200%',
        }}
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Shimmer overlay */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(
              90deg,
              transparent 0%,
              rgba(255, 255, 255, 0.02) 50%,
              transparent 100%
            )
          `,
        }}
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          repeatDelay: 3,
        }}
      />
    </div>
  );
};

export default AuroraEffect;
