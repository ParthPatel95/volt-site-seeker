import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';

interface RadialProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  label: string;
  sublabel?: string;
  color?: 'trust' | 'bitcoin' | 'success';
  suffix?: string;
  prefix?: string;
}

export const RadialProgress = ({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  label,
  sublabel,
  color = 'trust',
  suffix = '%',
  prefix = '',
}: RadialProgressProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [displayValue, setDisplayValue] = useState(0);

  const colorClasses = {
    trust: {
      stroke: 'stroke-watt-trust',
      text: 'text-watt-trust',
      glow: 'rgba(0, 194, 203, 0.3)',
    },
    bitcoin: {
      stroke: 'stroke-watt-bitcoin',
      text: 'text-watt-bitcoin',
      glow: 'rgba(247, 147, 26, 0.3)',
    },
    success: {
      stroke: 'stroke-watt-success',
      text: 'text-watt-success',
      glow: 'rgba(0, 211, 149, 0.3)',
    },
  };

  const colors = colorClasses[color];
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = (value / max) * 100;
  const offset = circumference - (percentage / 100) * circumference;

  // Animate the counter
  useEffect(() => {
    if (!isInView) return;

    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.round(current * 10) / 10);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isInView, value]);

  return (
    <div ref={ref} className="relative flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Glow effect */}
        <motion.div
          className="absolute inset-0 rounded-full blur-xl"
          style={{ backgroundColor: colors.glow }}
          animate={{
            opacity: isInView ? [0.3, 0.6, 0.3] : 0,
            scale: isInView ? [0.9, 1.1, 0.9] : 0.9,
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            fill="none"
            className="stroke-white/10"
          />

          {/* Progress circle */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            fill="none"
            className={colors.stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{
              strokeDashoffset: isInView ? offset : circumference,
            }}
            transition={{
              duration: 2,
              ease: "easeOut",
            }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className={`text-2xl font-bold ${colors.text}`}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{
              opacity: isInView ? 1 : 0,
              scale: isInView ? 1 : 0.5,
            }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            {prefix}{displayValue}{suffix}
          </motion.span>
        </div>
      </div>

      {/* Labels */}
      <motion.div
        className="mt-3 text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{
          opacity: isInView ? 1 : 0,
          y: isInView ? 0 : 10,
        }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <p className="text-white font-semibold text-sm">{label}</p>
        {sublabel && (
          <p className="text-white/60 text-xs mt-1">{sublabel}</p>
        )}
      </motion.div>
    </div>
  );
};

export default RadialProgress;
