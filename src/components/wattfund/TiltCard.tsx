import { useState, useRef, ReactNode } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: string;
}

export const TiltCard = ({ children, className = '', glowColor = 'rgba(0, 194, 203, 0.2)' }: TiltCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), {
    stiffness: 300,
    damping: 30,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), {
    stiffness: 300,
    damping: 30,
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const percentX = (e.clientX - centerX) / rect.width;
    const percentY = (e.clientY - centerY) / rect.height;

    mouseX.set(percentX);
    mouseY.set(percentY);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
  };

  return (
    <motion.div
      ref={cardRef}
      className={`relative ${className}`}
      style={{
        perspective: 1000,
        transformStyle: 'preserve-3d',
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        className="relative"
      >
        {/* Glow effect on hover */}
        <motion.div
          className="absolute -inset-1 rounded-2xl blur-xl transition-opacity duration-300"
          style={{
            background: glowColor,
            opacity: isHovered ? 0.5 : 0,
          }}
        />

        {/* Animated border gradient */}
        <motion.div
          className="absolute -inset-[1px] rounded-2xl overflow-hidden"
          style={{
            opacity: isHovered ? 1 : 0,
          }}
        >
          <motion.div
            className="absolute inset-0"
            style={{
              background: `conic-gradient(from 0deg, ${glowColor}, transparent, ${glowColor})`,
            }}
            animate={{
              rotate: isHovered ? 360 : 0,
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </motion.div>

        {/* Content */}
        <div className="relative z-10 bg-white/10 backdrop-blur-md rounded-2xl">
          {children}
        </div>

        {/* Shine effect */}
        <motion.div
          className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none"
          style={{
            opacity: isHovered ? 1 : 0,
          }}
        >
          <motion.div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.1) 45%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 55%, transparent 60%)',
              transform: 'translateX(-100%)',
            }}
            animate={{
              x: isHovered ? ['0%', '200%'] : '-100%',
            }}
            transition={{
              duration: 1,
              ease: "easeOut",
            }}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default TiltCard;
