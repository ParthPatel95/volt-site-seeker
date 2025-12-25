import { motion } from 'framer-motion';
import { ParticleField } from './ParticleField';
import { AuroraEffect } from './AuroraEffect';

export const HeroBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Deep navy base */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#050a15] via-watt-navy to-[#0a1628]" />
      
      {/* Aurora Effect Layer */}
      <AuroraEffect />
      
      {/* Particle Field */}
      <ParticleField />
      
      {/* Animated gradient orbs - enhanced */}
      <motion.div
        className="absolute top-0 -left-1/4 w-[600px] h-[600px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(0, 194, 203, 0.15) 0%, transparent 70%)',
        }}
        animate={{
          x: [0, 100, 0],
          y: [0, 50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      <motion.div
        className="absolute bottom-0 -right-1/4 w-[700px] h-[700px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(247, 147, 26, 0.12) 0%, transparent 70%)',
        }}
        animate={{
          x: [0, -80, 0],
          y: [0, -60, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />
      
      <motion.div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(0, 211, 149, 0.08) 0%, transparent 60%)',
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 4,
        }}
      />

      {/* Grid pattern overlay - more subtle */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 194, 203, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 194, 203, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
        }}
      />

      {/* Mesh gradient effect */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `
            radial-gradient(at 20% 80%, rgba(0, 194, 203, 0.1) 0px, transparent 50%),
            radial-gradient(at 80% 20%, rgba(247, 147, 26, 0.08) 0px, transparent 50%),
            radial-gradient(at 50% 50%, rgba(0, 211, 149, 0.05) 0px, transparent 50%)
          `,
        }}
      />

      {/* Radial vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_rgba(0,0,0,0.4)_100%)]" />
      
      {/* Top and bottom gradients for smooth transitions */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-watt-navy/50" />
      <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-[#050a15] to-transparent" />
    </div>
  );
};

export default HeroBackground;
